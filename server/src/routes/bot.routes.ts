import { Router } from 'express';
import { requireBotSecret, resolveDiscordUser } from '../middleware/botAuth.js';
import { listTasksForUser, startTaskForUser } from '../services/taskService.js';
import { getGroupedCatalog, createOrderForUser } from '../services/redeemService.js';
import { getStatusForUser, claimForUser } from '../services/dailyRewardService.js';
import { novaToVnd } from '../services/coinService.js';
import { env } from '../config/env.js';

export const botRouter = Router();
botRouter.use(requireBotSecret);
botRouter.use(resolveDiscordUser);

botRouter.get('/tasks', (req, res) => {
  res.json(listTasksForUser(req.user!.id));
});

botRouter.post('/tasks/:id/start', async (req, res, next) => {
  try {
    res.json(await startTaskForUser(req.user!.id, req.params.id));
  } catch (err) {
    next(err);
  }
});

botRouter.get('/redeem/catalog', (req, res) => {
  res.json(getGroupedCatalog());
});

botRouter.post('/redeem/order', async (req, res, next) => {
  try {
    const { item_id, destination } = req.body;
    if (!item_id || !destination?.trim()) return res.status(400).json({ error: 'Thiếu item_id hoặc destination' });

    const outcome = await createOrderForUser(req.user!.id, item_id, destination.trim());
    if (outcome.status === 'rejected') return res.status(400).json({ error: outcome.reason });
    res.json(outcome);
  } catch (err) {
    next(err);
  }
});

botRouter.get('/daily/status', (req, res) => {
  res.json(getStatusForUser(req.user!.id));
});

botRouter.post('/daily/claim', (req, res, next) => {
  try {
    res.json({ ok: true, ...claimForUser(req.user!.id) });
  } catch (err) {
    next(err);
  }
});

botRouter.get('/wallet', (req, res) => {
  res.json({
    balance_nova: req.user!.balance_nova,
    balance_vnd: novaToVnd(req.user!.balance_nova, env.economy.novaToVnd),
    streak_days: req.user!.streak_days,
  });
});

botRouter.get('/referral', (req, res) => {
  res.json({ referral_link: `${env.clientUrl}/r/${req.user!.username}` });
});
