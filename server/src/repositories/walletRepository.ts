import { db } from '../db/database.js';
import type { CoinLedgerEntry, Withdrawal, WithdrawMethod } from '../types/index.js';

export function getLedgerForUser(userId: string, limit = 50): CoinLedgerEntry[] {
  return db.prepare(`
    SELECT amount, reason, ref_id, created_at FROM coin_ledger
    WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
  `).all(userId, limit) as CoinLedgerEntry[];
}

export function createWithdrawal(
  id: string, userId: string, amountNova: number, amountVnd: number, method: WithdrawMethod, destination: string
): void {
  db.prepare(`
    INSERT INTO withdrawals (id, user_id, amount_nova, amount_vnd, method, destination)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, amountNova, amountVnd, method, destination);
}

export function listWithdrawalsForUser(userId: string): Partial<Withdrawal>[] {
  return db.prepare(`
    SELECT id, amount_nova, amount_vnd, method, status, created_at FROM withdrawals
    WHERE user_id = ? ORDER BY created_at DESC
  `).all(userId) as Partial<Withdrawal>[];
}

export function listAllWithdrawalsAdmin(): (Withdrawal & { username: string })[] {
  return db.prepare(`
    SELECT w.*, u.username FROM withdrawals w
    JOIN users u ON u.id = w.user_id
    ORDER BY CASE w.status WHEN 'pending' THEN 0 ELSE 1 END, w.created_at DESC
  `).all() as any;
}

export function getPendingWithdrawal(id: string): Withdrawal | undefined {
  return db.prepare(`SELECT * FROM withdrawals WHERE id = ? AND status = 'pending'`).get(id) as Withdrawal | undefined;
}

export function markWithdrawalPaid(id: string, note: string | null): void {
  db.prepare(`
    UPDATE withdrawals SET status = 'paid', processed_at = datetime('now'), admin_note = ?
    WHERE id = ? AND status = 'pending'
  `).run(note, id);
}

export function markWithdrawalRejected(id: string, note: string): void {
  db.prepare(`
    UPDATE withdrawals SET status = 'rejected', processed_at = datetime('now'), admin_note = ?
    WHERE id = ?
  `).run(note, id);
}

export function createTransferRecord(id: string, fromUserId: string, toUserId: string, amount: number): void {
  db.prepare(`
    INSERT INTO transfers (id, from_user_id, to_user_id, amount_nova)
    VALUES (?, ?, ?, ?)
  `).run(id, fromUserId, toUserId, amount);
}

export function countPendingWithdrawals(): number {
  const row = db.prepare(`SELECT COUNT(*) AS c FROM withdrawals WHERE status = 'pending'`).get() as { c: number };
  return row.c;
}
