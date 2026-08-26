import { Router } from 'express';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { getUserByUsername, setReferredBy, countReferredUsers } from '../repositories/userRepository.js';
import { db } from '../db/database.js';

export const referralRouter = Router();

referralRouter.get('/', requireAuth, (req, res) => {
  const referred = countReferredUsers(req.user!.id);
  const earned = (
    db.prepare(`SELECT COALESCE(SUM(amount), 0) AS total FROM coin_ledger WHERE user_id = ? AND reason = 'referral_bonus'`)
      .get(req.user!.id) as { total: number }
  ).total;

  res.json({
    referral_link: `${env.clientUrl}/r/${req.user!.username}`,
    referred_count: referred.length,
    referred_users: referred,
    total_earned_nova: earned,
  });
});

referralRouter.post('/claim', requireAuth, (req, res) => {
  if (req.user!.referred_by) return res.status(400).json({ error: 'Tài khoản đã có người giới thiệu' });

  const referrer = getUserByUsername(req.body.ref_username);
  if (!referrer || referrer.id === req.user!.id) return res.status(400).json({ error: 'Mã giới thiệu không hợp lệ' });

  setReferredBy(req.user!.id, referrer.id);
  res.json({ ok: true });
});
