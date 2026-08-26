const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';
const BOT_SECRET = process.env.BOT_INTERNAL_SECRET;

export class BotApiError extends Error {}

async function call<T>(path: string, opts: RequestInit = {}): Promise<T> {
  if (!BOT_SECRET) {
    throw new BotApiError('BOT_INTERNAL_SECRET chưa được cấu hình trong bot/.env');
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'X-Bot-Secret': BOT_SECRET,
      ...(opts.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new BotApiError(data.error || `Lỗi API (${res.status})`);
  return data as T;
}

export interface BotTaskDto {
  id: string;
  name: string;
  reward_nova: number;
  daily_limit: number;
  is_hot: number;
  done_today: number;
}

export const linknetApi = {
  tasks: (discordId: string) => call<BotTaskDto[]>(`/api/bot/tasks?discordId=${discordId}`),
  startTask: (discordId: string, taskId: string) =>
    call<{ shortUrl: string }>(`/api/bot/tasks/${taskId}/start`, { method: 'POST', body: JSON.stringify({ discordId }) }),

  redeemCatalog: (discordId: string) => call<Record<string, any[]>>(`/api/bot/redeem/catalog?discordId=${discordId}`),
  redeemOrder: (discordId: string, itemId: string, destination: string) =>
    call<{ status: string; id: string; cardPin?: string; cardSerial?: string }>(`/api/bot/redeem/order`, {
      method: 'POST',
      body: JSON.stringify({ discordId, item_id: itemId, destination }),
    }),

  dailyStatus: (discordId: string) =>
    call<{ can_claim: boolean; streak_days: number; next_reward_nova: number }>(`/api/bot/daily/status?discordId=${discordId}`),
  dailyClaim: (discordId: string) =>
    call<{ ok: true; reward_nova: number; streak_days: number }>(`/api/bot/daily/claim`, {
      method: 'POST',
      body: JSON.stringify({ discordId }),
    }),

  wallet: (discordId: string) =>
    call<{ balance_nova: number; balance_vnd: number; streak_days: number }>(`/api/bot/wallet?discordId=${discordId}`),
  referral: (discordId: string) => call<{ referral_link: string }>(`/api/bot/referral?discordId=${discordId}`),
};
