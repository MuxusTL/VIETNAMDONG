import { db } from '../db/database.js';
import type { PersonalToken } from '../types/index.js';

export function listTokensForUser(userId: string): Omit<PersonalToken, 'token_hash'>[] {
  return db.prepare(`
    SELECT id, label, created_at, last_used_at, revoked_at FROM personal_tokens
    WHERE user_id = ? ORDER BY created_at DESC
  `).all(userId) as any;
}

export function createToken(id: string, userId: string, tokenHash: string, label: string): void {
  db.prepare(`
    INSERT INTO personal_tokens (id, user_id, token_hash, label)
    VALUES (?, ?, ?, ?)
  `).run(id, userId, tokenHash, label);
}

export function revokeToken(id: string, userId: string): void {
  db.prepare(`UPDATE personal_tokens SET revoked_at = datetime('now') WHERE id = ? AND user_id = ?`).run(id, userId);
}

export function findActiveTokenByHash(tokenHash: string): PersonalToken | undefined {
  return db.prepare(`SELECT * FROM personal_tokens WHERE token_hash = ? AND revoked_at IS NULL`).get(tokenHash) as
    | PersonalToken
    | undefined;
}

export function touchTokenLastUsed(id: string): void {
  db.prepare(`UPDATE personal_tokens SET last_used_at = datetime('now') WHERE id = ?`).run(id);
}
