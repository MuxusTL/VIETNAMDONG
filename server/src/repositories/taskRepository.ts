import { db } from '../db/database.js';
import type { Task, TaskAttempt } from '../types/index.js';

export function listActiveTasks(): Task[] {
  return db.prepare('SELECT * FROM tasks WHERE active = 1 ORDER BY sort_order').all() as Task[];
}

export function getTaskById(id: string): Task | undefined {
  return db.prepare('SELECT * FROM tasks WHERE id = ? AND active = 1').get(id) as Task | undefined;
}

export function getAnyTaskById(id: string): Task | undefined {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;
}

export function countCompletedAttemptsToday(taskId: string, userId: string): number {
  const row = db.prepare(`
    SELECT COUNT(*) AS c FROM task_attempts
    WHERE task_id = ? AND user_id = ? AND status = 'completed'
      AND date(created_at) = date('now')
  `).get(taskId, userId) as { c: number };
  return row.c;
}

export function createAttempt(id: string, taskId: string, userId: string, token: string, shortUrl: string): void {
  db.prepare(`
    INSERT INTO task_attempts (id, task_id, user_id, token, short_url)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, taskId, userId, token, shortUrl);
}

export function getAttemptByToken(token: string): (TaskAttempt & { task_name: string; reward_nova: number }) | undefined {
  return db.prepare(`
    SELECT ta.*, t.name AS task_name, t.reward_nova FROM task_attempts ta
    JOIN tasks t ON t.id = ta.task_id
    WHERE ta.token = ?
  `).get(token) as any;
}

export function getPendingAttemptByToken(token: string): TaskAttempt | undefined {
  return db.prepare(`SELECT * FROM task_attempts WHERE token = ? AND status = 'pending'`).get(token) as TaskAttempt | undefined;
}

export function markAttemptCompleted(attemptId: string): void {
  db.prepare(`UPDATE task_attempts SET status = 'completed', completed_at = datetime('now') WHERE id = ?`).run(attemptId);
}

export function listAllTasksAdmin(): Task[] {
  return db.prepare('SELECT * FROM tasks ORDER BY sort_order').all() as Task[];
}

export function updateTaskAdmin(
  id: string,
  patch: { reward_nova?: number; daily_limit?: number; active?: number; is_hot?: number }
): void {
  db.prepare(`
    UPDATE tasks SET
      reward_nova = COALESCE(?, reward_nova),
      daily_limit = COALESCE(?, daily_limit),
      active = COALESCE(?, active),
      is_hot = COALESCE(?, is_hot)
    WHERE id = ?
  `).run(patch.reward_nova ?? null, patch.daily_limit ?? null, patch.active ?? null, patch.is_hot ?? null, id);
}
