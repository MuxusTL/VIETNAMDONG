import 'dotenv/config';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const processes = [{ name: 'web', script: path.join(__dirname, 'server/src/index.ts') }];

if (process.env.DISCORD_BOT_TOKEN?.trim()) {
  processes.push({ name: 'bot', script: path.join(__dirname, 'bot/src/index.ts') });
} else {
  console.log('[bot] DISCORD_BOT_TOKEN chưa điền trong .env — bỏ qua bot, chỉ chạy web.');
}

const RESTART_DELAY_MS = 5000;
const MAX_RESTARTS = 5;
const MIN_UPTIME_MS = 60_000;

const restartCounts = new Map();

const tsxBin = path.join(__dirname, 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx');

function startProcess({ name, script }) {
  const startedAt = Date.now();
  const child = spawn(tsxBin, [script], {
    stdio: 'pipe',
    env: process.env,
  });

  const tag = `[${name}]`;
  child.stdout.on('data', (chunk) => process.stdout.write(`${tag} ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`${tag} ${chunk}`));

  child.on('exit', (code, signal) => {
    console.log(`${tag} thoát (code=${code}, signal=${signal})`);
    if (shuttingDown) return;

    const survived = Date.now() - startedAt;
    const count = survived >= MIN_UPTIME_MS ? 1 : (restartCounts.get(name) || 0) + 1;
    restartCounts.set(name, count);

    if (count > MAX_RESTARTS) {
      console.error(`${tag} đã crash ${count} lần liên tiếp trong dưới ${MIN_UPTIME_MS / 1000}s mỗi lần — dừng tự khởi động lại. Kiểm tra log lỗi phía trên rồi chạy lại thủ công.`);
      return;
    }

    console.log(`${tag} khởi động lại sau ${RESTART_DELAY_MS / 1000}s... (lần ${count}/${MAX_RESTARTS})`);
    setTimeout(() => startProcess({ name, script }), RESTART_DELAY_MS);
  });

  return child;
}

let shuttingDown = false;
const children = processes.map(startProcess);

function shutdown(signal) {
  shuttingDown = true;
  console.log(`\nNhận ${signal}, đang tắt web + bot...`);
  for (const child of children) child.kill(signal);
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
