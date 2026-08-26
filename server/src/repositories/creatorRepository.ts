import { db } from '../db/database.js';
import type { CreatorCode } from '../types/index.js';

export function getCreatorCodeByOwner(ownerUserId: string): CreatorCode | undefined {
  return db.prepare('SELECT * FROM creator_codes WHERE owner_user_id = ?').get(ownerUserId) as CreatorCode | undefined;
}

export function getActiveCreatorCodeByCode(code: string): CreatorCode | undefined {
  return db.prepare('SELECT * FROM creator_codes WHERE code = ? AND active = 1').get(code) as CreatorCode | undefined;
}

export function countUsersUsingCode(creatorCodeId: string): number {
  const row = db.prepare('SELECT COUNT(*) AS c FROM users WHERE creator_code_id = ?').get(creatorCodeId) as { c: number };
  return row.c;
}

export function createCreatorCode(id: string, code: string, ownerUserId: string, bonusPercent: number): void {
  db.prepare(`
    INSERT INTO creator_codes (id, code, owner_user_id, bonus_percent)
    VALUES (?, ?, ?, ?)
  `).run(id, code, ownerUserId, bonusPercent);
}

export function updateCreatorCodeAdmin(id: string, patch: { bonus_percent?: number; active?: number }): void {
  db.prepare(`
    UPDATE creator_codes SET
      bonus_percent = COALESCE(?, bonus_percent),
      active = COALESCE(?, active)
    WHERE id = ?
  `).run(patch.bonus_percent ?? null, patch.active ?? null, id);
}

export function listCreatorCodesAdmin(): (CreatorCode & { owner_username: string; used_by_count: number })[] {
  return db.prepare(`
    SELECT cc.*, u.username AS owner_username,
      (SELECT COUNT(*) FROM users WHERE creator_code_id = cc.id) AS used_by_count
    FROM creator_codes cc JOIN users u ON u.id = cc.owner_user_id
    ORDER BY cc.created_at DESC
  `).all() as any;
}

export function getCreatorForUser(userId: string): { id: string; owner_user_id: string; bonus_percent: number } | undefined {
  return db.prepare(`
    SELECT u.id, cc.owner_user_id, cc.bonus_percent FROM users u
    JOIN creator_codes cc ON cc.id = u.creator_code_id
    WHERE u.id = ? AND cc.active = 1
  `).get(userId) as any;
}

export function sumCreatorBonusEarned(ownerUserId: string): number {
  const row = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) AS total FROM coin_ledger
    WHERE user_id = ? AND reason = 'creator_bonus'
  `).get(ownerUserId) as { total: number };
  return row.total;
}
