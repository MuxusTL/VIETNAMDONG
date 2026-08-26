import { nanoid } from 'nanoid';
import { env } from '../config/env.js';
import { createLink } from './shortlinkService.js';
import { credit } from './coinService.js';
import { payReferralBonus } from './referralService.js';
import { payCreatorBonus } from './creatorService.js';
import { logToDiscord } from './discordService.js';
import {
  listActiveTasks,
  getTaskById,
  getAnyTaskById,
  countCompletedAttemptsToday,
  createAttempt,
  getPendingAttemptByToken,
  markAttemptCompleted,
} from '../repositories/taskRepository.js';
import { getUserById } from '../repositories/userRepository.js';
import { HttpError } from '../utils/httpError.js';
import type { TaskWithProgress } from '../types/index.js';

export function listTasksForUser(userId: string): TaskWithProgress[] {
  return listActiveTasks().map((t) => ({ ...t, done_today: countCompletedAttemptsToday(t.id, userId) }));
}

export async function startTaskForUser(userId: string, taskId: string): Promise<{ shortUrl: string }> {
  const task = getTaskById(taskId);
  if (!task) throw new HttpError(404, 'Nhiệm vụ không tồn tại');

  if (countCompletedAttemptsToday(task.id, userId) >= task.daily_limit) {
    throw new HttpError(400, 'Đã đạt giới hạn lượt hôm nay');
  }

  const attemptId = nanoid();
  const token = nanoid(24);
  const destinationUrl = `${env.clientUrl}/vuotlinkthanhcong/${token}/`;
  const { shortUrl } = await createLink({ providerKey: task.provider_key, destinationUrl });

  createAttempt(attemptId, task.id, userId, token, shortUrl);
  return { shortUrl };
}

export function completeAttempt(token: string): { rewardNova: number } | null {
  const attempt = getPendingAttemptByToken(token);
  if (!attempt) return null;

  const task = getAnyTaskById(attempt.task_id) ?? { reward_nova: 0, name: 'unknown' };
  markAttemptCompleted(attempt.id);
  credit(attempt.user_id, task.reward_nova, 'task_reward', attempt.id);
  payReferralBonus(attempt.user_id, task.reward_nova);
  payCreatorBonus(attempt.user_id, task.reward_nova);

  const user = getUserById(attempt.user_id);
  logToDiscord(`✅ **${user?.username}** hoàn thành **${task.name}** (+${task.reward_nova} Nova)`);

  return { rewardNova: task.reward_nova };
}
