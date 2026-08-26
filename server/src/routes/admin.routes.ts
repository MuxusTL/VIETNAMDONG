import { Router } from 'express';
import { nanoid } from 'nanoid';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createCreatorCodeSchema } from '../validators/creator.validators.js';
import { credit } from '../services/coinService.js';
import { db } from '../db/database.js';
import {
  listAllWithdrawalsAdmin,
  getPendingWithdrawal,
  markWithdrawalPaid,
  markWithdrawalRejected,
  countPendingWithdrawals,
} from '../repositories/walletRepository.js';
import { listAllRedeemOrdersAdmin } from '../repositories/redeemRepository.js';
import { listAllTasksAdmin, updateTaskAdmin } from '../repositories/taskRepository.js';
import { searchUsers, getUserByUsername, adjustUserBalanceRaw } from '../repositories/userRepository.js';
import { createCreatorCode, updateCreatorCodeAdmin, listCreatorCodesAdmin } from '../repositories/creatorRepository.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/stats', (req, res) => {
  const users = (db.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number }).c;
  const totalNovaOut = (
    db.prepare(`SELECT COALESCE(SUM(amount), 0) AS s FROM coin_ledger WHERE reason = 'task_reward'`).get() as { s: number }
  ).s;
  res.json({ users, totalNovaOut, pendingWithdrawals: countPendingWithdrawals() });
});

adminRouter.get('/withdrawals', (req, res) => res.json(listAllWithdrawalsAdmin()));

adminRouter.post('/withdrawals/:id/approve', (req, res) => {
  markWithdrawalPaid(req.params.id, req.body.note || null);
  res.json({ ok: true });
});

adminRouter.post('/withdrawals/:id/reject', (req, res) => {
  const w = getPendingWithdrawal(req.params.id);
  if (!w) return res.status(404).json({ error: 'Không tìm thấy yêu cầu' });
  credit(w.user_id, w.amount_nova, 'admin_adjust', w.id);
  markWithdrawalRejected(req.params.id, req.body.note || 'Từ chối bởi admin');
  res.json({ ok: true });
});

adminRouter.get('/redeem-orders', (req, res) => res.json(listAllRedeemOrdersAdmin()));

adminRouter.post('/redeem-orders/:id/fulfill', (req, res) => {
  db.prepare(`UPDATE redeem_orders SET status = 'fulfilled', processed_at = datetime('now'), admin_note = ? WHERE id = ? AND status = 'pending'`)
    .run(req.body.note || null, req.params.id);
  res.json({ ok: true });
});

adminRouter.post('/redeem-orders/:id/reject', (req, res) => {
  const o = db.prepare(`SELECT * FROM redeem_orders WHERE id = ? AND status = 'pending'`).get(req.params.id) as
    | { user_id: string; price_nova: number }
    | undefined;
  if (!o) return res.status(404).json({ error: 'Không tìm thấy đơn' });

  credit(o.user_id, o.price_nova, 'admin_adjust', req.params.id);
  db.prepare(`UPDATE redeem_orders SET status = 'rejected', processed_at = datetime('now'), admin_note = ? WHERE id = ?`)
    .run(req.body.note || 'Từ chối bởi admin', req.params.id);
  res.json({ ok: true });
});

adminRouter.get('/tasks', (req, res) => res.json(listAllTasksAdmin()));

adminRouter.patch('/tasks/:id', (req, res) => {
  updateTaskAdmin(req.params.id, req.body);
  res.json({ ok: true });
});

adminRouter.get('/creator-codes', (req, res) => res.json(listCreatorCodesAdmin()));

adminRouter.post('/creator-codes', validateBody(createCreatorCodeSchema), (req, res) => {
  const { code, owner_username, bonus_percent } = req.body;
  const owner = getUserByUsername(owner_username);
  if (!owner) return res.status(404).json({ error: 'Không tìm thấy user để gán code' });

  createCreatorCode(nanoid(), code, owner.id, bonus_percent || 5);
  res.json({ ok: true });
});

adminRouter.patch('/creator-codes/:id', (req, res) => {
  updateCreatorCodeAdmin(req.params.id, req.body);
  res.json({ ok: true });
});

adminRouter.get('/users', (req, res) => {
  res.json(searchUsers(String(req.query.search || '')));
});

adminRouter.post('/users/:id/adjust', (req, res) => {
  const amount = Number(req.body.amount);
  if (!amount) return res.status(400).json({ error: 'Số Nova không hợp lệ' });
  if (amount > 0) credit(req.params.id, amount, 'admin_adjust', req.body.note || null);
  else adjustUserBalanceRaw(req.params.id, amount);
  res.json({ ok: true });
});
