import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { weeklyTop, dailyTop, recordDaily, myChart } from '../repositories/leaderboardRepository.js';

export const leaderboardRouter = Router();

leaderboardRouter.get('/weekly', requireAuth, (req, res) => res.json(weeklyTop()));
leaderboardRouter.get('/daily', requireAuth, (req, res) => res.json(dailyTop()));
leaderboardRouter.get('/record-daily', requireAuth, (req, res) => res.json(recordDaily()));
leaderboardRouter.get('/my-chart', requireAuth, (req, res) => res.json(myChart(req.user!.id)));
