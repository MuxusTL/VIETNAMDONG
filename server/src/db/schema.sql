CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  discord_id TEXT UNIQUE,
  google_sub TEXT UNIQUE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  balance_nova INTEGER NOT NULL DEFAULT 0,
  total_redeemed_nova INTEGER NOT NULL DEFAULT 0,
  referred_by TEXT REFERENCES users(id),
  creator_code_id TEXT REFERENCES creator_codes(id),
  streak_days INTEGER NOT NULL DEFAULT 0,
  streak_last_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  provider_key TEXT NOT NULL,
  name TEXT NOT NULL,
  reward_nova INTEGER NOT NULL,
  daily_limit INTEGER NOT NULL DEFAULT 1000,
  is_hot INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS task_attempts (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  short_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS coin_ledger (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  ref_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  amount_nova INTEGER NOT NULL,
  amount_vnd INTEGER NOT NULL,
  method TEXT NOT NULL,
  destination TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  processed_at TEXT
);

CREATE TABLE IF NOT EXISTS transfers (
  id TEXT PRIMARY KEY,
  from_user_id TEXT NOT NULL REFERENCES users(id),
  to_user_id TEXT NOT NULL REFERENCES users(id),
  amount_nova INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_attempts_user ON task_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_user ON coin_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);

CREATE TABLE IF NOT EXISTS redeem_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  provider_key TEXT NOT NULL,
  label TEXT NOT NULL,
  price_nova INTEGER NOT NULL,
  requires_field TEXT NOT NULL,
  telco TEXT,
  denomination INTEGER,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS redeem_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  item_id TEXT NOT NULL REFERENCES redeem_items(id),
  destination TEXT NOT NULL,
  price_nova INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  result_data TEXT,
  admin_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  processed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_redeem_orders_status ON redeem_orders(status);

CREATE TABLE IF NOT EXISTS creator_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  owner_user_id TEXT NOT NULL REFERENCES users(id),
  bonus_percent INTEGER NOT NULL DEFAULT 5,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS personal_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  token_hash TEXT UNIQUE NOT NULL,
  label TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_used_at TEXT,
  revoked_at TEXT
);

CREATE TABLE IF NOT EXISTS daily_claims (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  claim_date TEXT NOT NULL,
  reward_nova INTEGER NOT NULL,
  streak_day INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, claim_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_claims_user ON daily_claims(user_id);
