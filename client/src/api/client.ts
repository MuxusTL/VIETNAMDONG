import type {
  Me,
  Task,
  Wallet,
  LedgerEntry,
  Withdrawal,
  RedeemCatalog,
  RedeemOrderResult,
  RedeemOrder,
  LeaderboardRow,
  ChartPoint,
  DailyStatus,
  DailyClaimResult,
  CreatorCodeInfo,
  LoginTokenRow,
} from '../types.js';

const BASE = '/api';

class ApiError extends Error {}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || 'Đã có lỗi xảy ra');
  return data as T;
}

export const api = {
  me: () => request<Me>('/auth/me'),
  loginGoogle: (credential: string) => request('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  tasks: () => request<Task[]>('/tasks'),
  startTask: (id: string) => request<{ shortUrl: string }>(`/tasks/${id}/start`, { method: 'POST' }),

  wallet: () => request<Wallet>('/wallet'),
  ledger: () => request<LedgerEntry[]>('/wallet/ledger'),
  withdrawals: () => request<Withdrawal[]>('/wallet/withdrawals'),
  withdraw: (body: { amount_nova: number; method: string; destination: string }) =>
    request('/wallet/withdraw', { method: 'POST', body: JSON.stringify(body) }),
  transfer: (body: { to_username: string; amount_nova: number }) =>
    request('/wallet/transfer', { method: 'POST', body: JSON.stringify(body) }),

  referral: () => request('/referral'),
  leaderboard: () => request<LeaderboardRow[]>('/leaderboard/weekly'),
  dailyTop: () => request<LeaderboardRow[]>('/leaderboard/daily'),
  recordDaily: () => request<LeaderboardRow[]>('/leaderboard/record-daily'),
  myChart: () => request<ChartPoint[]>('/leaderboard/my-chart'),

  redeemCatalog: () => request<RedeemCatalog>('/redeem/catalog'),
  redeemOrder: (body: { item_id: string; destination: string }) =>
    request<RedeemOrderResult>('/redeem/order', { method: 'POST', body: JSON.stringify(body) }),
  redeemOrders: () => request<RedeemOrder[]>('/redeem/orders'),

  dailyStatus: () => request<DailyStatus>('/daily/status'),
  dailyClaim: () => request<DailyClaimResult>('/daily/claim', { method: 'POST' }),

  myCreatorCode: () => request<CreatorCodeInfo>('/creator/mine'),
  applyCreatorCode: (code: string) => request('/creator/apply', { method: 'POST', body: JSON.stringify({ code }) }),

  loginTokens: () => request<LoginTokenRow[]>('/tokens'),
  createLoginToken: (label: string) => request<{ token: string }>('/tokens', { method: 'POST', body: JSON.stringify({ label }) }),
  revokeLoginToken: (id: string) => request(`/tokens/${id}`, { method: 'DELETE' }),
};

export { ApiError };
