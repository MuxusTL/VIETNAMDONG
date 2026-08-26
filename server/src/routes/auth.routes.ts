import { Router } from 'express';
import { nanoid } from 'nanoid';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { signSession } from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { googleLoginSchema } from '../validators/auth.validators.js';
import {
  getUserByDiscordId,
  createUserFromDiscord,
  updateUserFromDiscord,
  getUserById,
  getUserByGoogleSub,
  createUserFromGoogle,
} from '../repositories/userRepository.js';
import type { CookieOptions } from 'express';

export const authRouter = Router();
const googleClient = new OAuth2Client(env.google.clientId);

const cookieOpts: CookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function upsertUserFromDiscord(profile: { id: string; username: string; avatar_url: string | null }) {
  const existing = getUserByDiscordId(profile.id);
  if (existing) {
    updateUserFromDiscord(existing.id, profile.username, profile.avatar_url);
    return existing;
  }
  const id = nanoid();
  createUserFromDiscord(id, profile.id, profile.username, profile.avatar_url);
  return getUserById(id)!;
}

authRouter.get('/discord', (req, res) => {
  const params = new URLSearchParams({
    client_id: env.discord.clientId ?? '',
    redirect_uri: env.discord.redirectUri ?? '',
    response_type: 'code',
    scope: 'identify',
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

authRouter.get('/discord/callback', async (req, res, next) => {
  try {
    const code = req.query.code as string | undefined;
    if (!code) return res.redirect(`${env.clientUrl}/login?error=missing_code`);

    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.discord.clientId ?? '',
        client_secret: env.discord.clientSecret ?? '',
        grant_type: 'authorization_code',
        code,
        redirect_uri: env.discord.redirectUri ?? '',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.redirect(`${env.clientUrl}/login?error=oauth_failed`);

    const profileRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    const avatarUrl = profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null;
    const user = upsertUserFromDiscord({ id: profile.id, username: profile.username, avatar_url: avatarUrl });

    res.cookie('linknet_session', signSession(user), cookieOpts);
    res.redirect(`${env.clientUrl}/dashboard`);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/google', validateBody(googleLoginSchema), async (req, res, next) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.google.clientId });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid Google credential');

    let user = getUserByGoogleSub(payload.sub);
    if (!user) {
      const id = nanoid();
      createUserFromGoogle(id, payload.sub, payload.name || payload.email || 'user', payload.picture ?? null);
      user = getUserById(id)!;
    }

    res.cookie('linknet_session', signSession(user), cookieOpts);
    res.json({ ok: true });
  } catch (err) {
    (err as any).status = 401;
    (err as any).publicMessage = 'Đăng nhập Google thất bại';
    next(err);
  }
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie('linknet_session');
  res.json({ ok: true });
});

authRouter.get('/me', requireAuth, (req, res) => {
  const { id, username, avatar_url, role, balance_nova, streak_days } = req.user!;
  res.json({ id, username, avatar_url, role, balance_nova, streak_days });
});
