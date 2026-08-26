import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getStatusForUser, claimForUser } from '../services/dailyRewardService.js';

export const dailyRouter = Router();

dailyRouter.get('/status', requireAuth, (req, res) => {
  res.json(getStatusForUser(req.user!.id));
});

dailyRouter.post('/claim', requireAuth, (req, res, next) => {
  try {
    res.json({ ok: true, ...claimForUser(req.user!.id) });
  } catch (err) {
    next(err);
  }
});
