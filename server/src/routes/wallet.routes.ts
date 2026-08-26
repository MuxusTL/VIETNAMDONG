import { Router } from 'express';
import { nanoid } from 'nanoid';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { withdrawSchema, transferSchema } from '../validators/wallet.validators.js';
import { debit, credit, novaToVnd } from '../services/coinService.js';
import {
  getLedgerForUser,
  createWithdrawal,
  listWithdrawalsForUser,
  createTransferRecord,
} from '../repositories/walletRepository.js';
import { getUserByUsername } from '../repositories/userRepository.js';

export const walletRouter = Router();

walletRouter.get('/', requireAuth, (req, res) => {
  res.json({
    balance_nova: req.user!.balance_nova,
    balance_vnd: novaToVnd(req.user!.balance_nova, env.economy.novaToVnd),
    total_redeemed_nova: req.user!.total_redeemed_nova,
  });
});

walletRouter.get('/ledger', requireAuth, (req, res) => {
  res.json(getLedgerForUser(req.user!.id));
});

walletRouter.post('/withdraw', requireAuth, validateBody(withdrawSchema), (req, res, next) => {
  try {
    const { amount_nova, method, destination } = req.body;
    if (amount_nova < env.economy.minWithdrawNova) {
      return res.status(400).json({ error: `Số Nova rút tối thiểu là ${env.economy.minWithdrawNova}` });
    }

    const id = nanoid();
    const amountVnd = novaToVnd(amount_nova, env.economy.novaToVnd);
    debit(req.user!.id, amount_nova, 'withdraw', id);
    createWithdrawal(id, req.user!.id, amount_nova, amountVnd, method, destination);

    res.json({ ok: true, id, status: 'pending' });
  } catch (err) {
    next(err);
  }
});

walletRouter.get('/withdrawals', requireAuth, (req, res) => {
  res.json(listWithdrawalsForUser(req.user!.id));
});

walletRouter.post('/transfer', requireAuth, validateBody(transferSchema), (req, res, next) => {
  try {
    const { to_username, amount_nova } = req.body;
    const recipient = getUserByUsername(to_username);
    if (!recipient) return res.status(404).json({ error: 'Không tìm thấy người nhận' });
    if (recipient.id === req.user!.id) return res.status(400).json({ error: 'Không thể tự chuyển cho chính mình' });

    const id = nanoid();
    debit(req.user!.id, amount_nova, 'transfer_out', id);
    credit(recipient.id, amount_nova, 'transfer_in', id);
    createTransferRecord(id, req.user!.id, recipient.id, amount_nova);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
