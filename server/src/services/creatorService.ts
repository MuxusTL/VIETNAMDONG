import { credit } from './coinService.js';
import { getCreatorForUser } from '../repositories/creatorRepository.js';

export function calcCreatorBonus(rewardAmount: number, bonusPercent: number): number {
  return Math.floor((rewardAmount * bonusPercent) / 100);
}

export function payCreatorBonus(userId: string, rewardAmount: number): void {
  const link = getCreatorForUser(userId);
  if (!link) return;
  const bonus = calcCreatorBonus(rewardAmount, link.bonus_percent);
  if (bonus > 0) credit(link.owner_user_id, bonus, 'creator_bonus', userId);
}
