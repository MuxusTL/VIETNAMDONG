import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, 'linknet.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

const taskCount = (db.prepare('SELECT COUNT(*) AS c FROM tasks').get() as { c: number }).c;
if (taskCount === 0) {
  const insert = db.prepare(`
    INSERT INTO tasks (id, provider_key, name, reward_nova, daily_limit, is_hot, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const seed: [string, string, number, number, number, number][] = [
    ['yeumoney', 'Uptolink Social', 3, 1000, 0, 1],
    ['yeumoney', 'Uptolink Step 2', 3, 1000, 0, 2],
    ['yeumoney', 'Uptolink Step 3', 5, 1000, 0, 3],
    ['yeumoney', 'Uptolink Step 4', 5, 1000, 0, 4],
    ['link4m', 'Link4m', 2, 2, 0, 5],
    ['traffic68', 'Traffic68', 2, 4, 0, 6],
    ['phienchoso', 'TrafficVN', 2, 3, 1, 7],
    ['nhapma', 'Nhapma', 2, 4, 0, 8],
  ];
  const tx = db.transaction((rows: typeof seed) => {
    rows.forEach(([provider, name, reward, limit, hot, order], i) => {
      insert.run(`task_${i}`, provider, name, reward, limit, hot, order);
    });
  });
  tx(seed);
}

const redeemCount = (db.prepare('SELECT COUNT(*) AS c FROM redeem_items').get() as { c: number }).c;
if (redeemCount === 0) {
  const insertItem = db.prepare(`
    INSERT INTO redeem_items (id, category, provider_key, label, price_nova, requires_field, telco, denomination, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const items: [string, string, string, number, string, string | null, number | null][] = [
    ['game_topup', 'robux', '800 Robux (qua Gamepass)', 400, 'roblox_gamepass_link', null, null],
    ['game_topup', 'robux_vng', '1000 Robux VNG', 480, 'game_uid', null, null],
    ['game_topup', 'lienquan', '100 Quân Huy Liên Quân', 60, 'game_uid', null, null],
    ['game_topup', 'freefire', '100 Kim Cương Free Fire', 65, 'game_uid', null, null],
    ['game_topup', 'valorant', '475 VP Valorant', 300, 'game_uid', null, null],
    ['game_topup', 'pubg', '600 UC PUBG Mobile', 350, 'game_uid', null, null],
    ['game_topup', 'fcmobile', '100 FC Points (FC Mobile VN)', 70, 'game_uid', null, null],
    ['wallet', 'steam', '50.000đ Ví Steam', 300, 'game_uid', null, null],
    ['card', 'scratch_card', 'Thẻ cào Viettel 20.000đ', 120, 'phone_number', 'VIETTEL', 20000],
    ['card', 'scratch_card', 'Thẻ cào Mobifone 20.000đ', 120, 'phone_number', 'MOBIFONE', 20000],
  ];
  const tx2 = db.transaction((rows: typeof items) => {
    rows.forEach(([category, provider_key, label, price, field, telco, denomination], i) => {
      insertItem.run(`redeem_seed_${i}`, category, provider_key, label, price, field, telco, denomination, i);
    });
  });
  tx2(items);
}
