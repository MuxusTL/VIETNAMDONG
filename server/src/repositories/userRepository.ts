import { db } from '../db/database.js';
import type { User } from '../types/index.js';

export function getUserById(id: string): User | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function getUserByDiscordId(discordId: string): User | undefined {
  return db.prepare('SELECT * FROM users WHERE discord_id = ?').get(discordId) as User | undefined;
}

export function getUserByGoogleSub(sub: string): User | undefined {
  return db.prepare('SELECT * FROM users WHERE google_sub = ?').get(sub) as User | undefined;
}

export function getUserByUsername(username: string): User | undefined {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
}

export function createUserFromDiscord(id: string, discordId: string, username: string, avatarUrl: string | null): void {
  db.prepare(`
    INSERT INTO users (id, discord_id, username, avatar_url)
    VALUES (?, ?, ?, ?)
  `).run(id, discordId, username, avatarUrl);
}

export function updateUserFromDiscord(id: string, username: string, avatarUrl: string | null): void {
  db.prepare('UPDATE users SET username = ?, avatar_url = ? WHERE id = ?').run(username, avatarUrl, id);
}

export function createUserFromGoogle(id: string, googleSub: string, username: string, avatarUrl: string | null): void {
  db.prepare(`
    INSERT INTO users (id, google_sub, username, avatar_url)
    VALUES (?, ?, ?, ?)
  `).run(id, googleSub, username, avatarUrl);
}

export function setReferredBy(userId: string, referrerId: string): void {
  db.prepare('UPDATE users SET referred_by = ? WHERE id = ?').run(referrerId, userId);
}

export function setCreatorCode(userId: string, creatorCodeId: string): void {
  db.prepare('UPDATE users SET creator_code_id = ? WHERE id = ?').run(creatorCodeId, userId);
}

export function searchUsers(query: string, limit = 50): Pick<User, 'id' | 'username' | 'balance_nova' | 'role' | 'created_at'>[] {
  return db.prepare(`
    SELECT id, username, balance_nova, role, created_at FROM users
    WHERE username LIKE ? ORDER BY created_at DESC LIMIT ?
  `).all(`%${query}%`, limit) as any;
}

export function adjustUserBalanceRaw(userId: string, delta: number): void {
  db.prepare('UPDATE users SET balance_nova = balance_nova + ? WHERE id = ?').run(delta, userId);
}

export function updateStreak(userId: string, streakDays: number, streakLastDate: string): void {
  db.prepare('UPDATE users SET streak_days = ?, streak_last_date = ? WHERE id = ?').run(streakDays, streakLastDate, userId);
}

export function countReferredUsers(referrerId: string): Pick<User, 'username' | 'created_at'>[] {
  return db.prepare('SELECT username, created_at FROM users WHERE referred_by = ? ORDER BY created_at DESC').all(referrerId) as any;
}
