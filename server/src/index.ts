import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
// import './db/database.js';

import { authRouter } from './routes/auth.routes.js';
import { tasksRouter } from './routes/tasks.routes.js';
import { walletRouter } from './routes/wallet.routes.js';
import { referralRouter } from './routes/referral.routes.js';
import { leaderboardRouter } from './routes/leaderboard.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { redeemRouter } from './routes/redeem.routes.js';
import { creatorRouter } from './routes/creator.routes.js';
import { tokensRouter } from './routes/tokens.routes.js';
import { dailyRouter } from './routes/daily.routes.js';
import { webhooksRouter } from './routes/webhooks.routes.js';
import { botRouter } from './routes/bot.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: new URL(env.clientUrl).origin, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

const router = express.Router();

router.use('/api', rateLimit({ windowMs: 60_000, max: 120 }));
router.use('/api/tasks/:id/start', rateLimit({ windowMs: 60_000, max: 10 }));

router.use('/api/auth', authRouter);
router.use('/api/tasks', tasksRouter);
router.use('/api/wallet', walletRouter);
router.use('/api/referral', referralRouter);
router.use('/api/leaderboard', leaderboardRouter);
router.use('/api/admin', adminRouter);
router.use('/api/redeem', redeemRouter);
router.use('/api/creator', creatorRouter);
router.use('/api/tokens', tokensRouter);
router.use('/api/daily', dailyRouter);
router.use('/api/card2k', webhooksRouter);
router.use('/api/bot', botRouter);

const clientDist = path.resolve(__dirname, '../public');
router.use(express.static(clientDist));
router.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

if (env.basePath) {
  app.use(env.basePath, router);
  app.get('/', (req, res) => res.redirect(env.basePath));
} else {
  app.use(router);
}

app.use(errorHandler);

if (process.env.VERCEL !== '1') {
  app.listen(env.port, '0.0.0.0', () => {
    console.log(`LinkNet API started — listening on 0.0.0.0:${env.port}${env.basePath}`);
  });
}

export default app;

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
