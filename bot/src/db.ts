import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const db = new Database(path.resolve(__dirname, '../../server/data/linknet.db'), {
  readonly: true,
  fileMustExist: true,
});

export interface BotUser {
  id: string;
  username: string;
  discord_id: string | null;
  balance_nova: number;
  total_redeemed_nova: number;
  streak_days: number;
}

export interface BotTask {
  name: string;
  reward_nova: number;
  is_hot: number;
}

export interface BotWithdrawal {
  amount_nova: number;
  amount_vnd: number;
  status: string;
  created_at: string;
}
