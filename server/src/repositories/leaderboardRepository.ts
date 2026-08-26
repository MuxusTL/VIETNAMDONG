import { db } from '../db/database.js';

export interface LeaderboardRow {
  username: string;
  avatar_url: string | null;
  earned: number;
}

export function weeklyTop(): LeaderboardRow[] {
  return db.prepare(`
    SELECT u.username, u.avatar_url, COALESCE(SUM(l.amount), 0) AS earned
    FROM users u
    LEFT JOIN coin_ledger l ON l.user_id = u.id
      AND l.reason = 'task_reward' AND l.created_at >= datetime('now', '-7 days')
    GROUP BY u.id
    ORDER BY earned DESC
    LIMIT 20
  `).all() as LeaderboardRow[];
}

export function dailyTop(): LeaderboardRow[] {
  return db.prepare(`
    SELECT u.username, u.avatar_url, COALESCE(SUM(l.amount), 0) AS earned
    FROM users u
    LEFT JOIN coin_ledger l ON l.user_id = u.id
      AND l.reason = 'task_reward' AND date(l.created_at) = date('now')
    GROUP BY u.id
    ORDER BY earned DESC
    LIMIT 20
  `).all() as LeaderboardRow[];
}

export function recordDaily(): (LeaderboardRow & { day: string })[] {
  return db.prepare(`
    SELECT u.username, u.avatar_url, date(l.created_at) AS day, SUM(l.amount) AS earned
    FROM coin_ledger l
    JOIN users u ON u.id = l.user_id
    WHERE l.reason = 'task_reward'
    GROUP BY l.user_id, date(l.created_at)
    ORDER BY earned DESC
    LIMIT 10
  `).all() as any;
}

export function myChart(userId: string): { day: string; net: number }[] {
  return db.prepare(`
    SELECT date(created_at) AS day, SUM(amount) AS net
    FROM coin_ledger
    WHERE user_id = ? AND created_at >= datetime('now', '-30 days')
    GROUP BY date(created_at)
    ORDER BY day ASC
  `).all(userId) as any;
}
