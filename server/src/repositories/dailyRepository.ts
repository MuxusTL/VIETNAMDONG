import { db } from '../db/database.js';

export function getClaimForDate(userId: string, date: string): { claim_date: string } | undefined {
  return db.prepare(`SELECT claim_date FROM daily_claims WHERE user_id = ? AND claim_date = ?`).get(userId, date) as any;
}

export function createClaim(id: string, userId: string, date: string, rewardNova: number, streakDay: number): void {
  db.prepare(`
    INSERT INTO daily_claims (id, user_id, claim_date, reward_nova, streak_day)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, userId, date, rewardNova, streakDay);
}
