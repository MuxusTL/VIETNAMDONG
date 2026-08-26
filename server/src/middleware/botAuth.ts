import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { getUserByDiscordId } from '../repositories/userRepository.js';

export function requireBotSecret(req: Request, res: Response, next: NextFunction): void {
  if (!env.discord.internalSecret) {
    res.status(501).json({ error: 'Bot API chưa được cấu hình (BOT_INTERNAL_SECRET)' });
    return;
  }
  if (req.headers['x-bot-secret'] !== env.discord.internalSecret) {
    res.status(401).json({ error: 'Sai bot secret' });
    return;
  }
  next();
}

export function resolveDiscordUser(req: Request, res: Response, next: NextFunction): void {
  const discordId = req.body?.discordId || req.query?.discordId;
  if (!discordId) {
    res.status(400).json({ error: 'Thiếu discordId' });
    return;
  }
  const user = getUserByDiscordId(String(discordId));
  if (!user) {
    res.status(404).json({ error: 'Tài khoản Discord này chưa liên kết với LinkNet. Đăng nhập tại web bằng Discord trước.' });
    return;
  }
  req.user = user;
  next();
}
