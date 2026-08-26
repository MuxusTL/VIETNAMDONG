import { db } from '../db/database.js';
import { nanoid } from 'nanoid';
import { HttpError } from '../utils/httpError.js';
import type { LedgerReason } from '../types/index.js';

export function credit(userId: string, amount: number, reason: LedgerReason, refId: string | null = null): void {
  if (amount <= 0) throw new Error('credit amount must be positive');
  const tx = db.transaction(() => {
    db.prepare('UPDATE users SET balance_nova = balance_nova + ? WHERE id = ?').run(amount, userId);
    db.prepare(`
      INSERT INTO coin_ledger (id, user_id, amount, reason, ref_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(nanoid(), userId, amount, reason, refId);
  });
  tx();
}

export function debit(userId: string, amount: number, reason: LedgerReason, refId: string | null = null): void {
  if (amount <= 0) throw new Error('debit amount must be positive');
  const tx = db.transaction(() => {
    const user = db.prepare('SELECT balance_nova FROM users WHERE id = ?').get(userId) as { balance_nova: number } | undefined;
    if (!user || user.balance_nova < amount) throw new HttpError(400, 'Số dư Nova không đủ');
    db.prepare('UPDATE users SET balance_nova = balance_nova - ? WHERE id = ?').run(amount, userId);
    db.prepare(`
      INSERT INTO coin_ledger (id, user_id, amount, reason, ref_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(nanoid(), userId, -amount, reason, refId);
  });
  tx();
}

export function novaToVnd(nova: number, rate: number): number {
  return Math.round(nova * rate);
}
