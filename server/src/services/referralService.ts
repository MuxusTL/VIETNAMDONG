import { credit } from './coinService.js';
import { getUserById } from '../repositories/userRepository.js';

const REFERRAL_BONUS_PERCENT = 10;

export function calcReferralBonus(rewardAmount: number): number {
  return Math.floor((rewardAmount * REFERRAL_BONUS_PERCENT) / 100);
}

export function payReferralBonus(userId: string, rewardAmount: number): void {
  const user = getUserById(userId);
  if (!user?.referred_by) return;
  const bonus = calcReferralBonus(rewardAmount);
  if (bonus > 0) credit(user.referred_by, bonus, 'referral_bonus', userId);
}
