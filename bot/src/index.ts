import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import type { BotCommand } from './types.js';
import './types.js';

if (!process.env.DISCORD_BOT_TOKEN?.trim()) {
  console.log('DISCORD_BOT_TOKEN chưa được cấu hình trong .env — bot sẽ không khởi động.');
  process.exit(0);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection<string, BotCommand>();
const commandsDir = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsDir).filter((f) => f.endsWith('.ts') || f.endsWith('.js'))) {
  const cmd = (await import(pathToFileURL(path.join(commandsDir, file)).href)) as BotCommand;
  client.commands.set((cmd.data as any).name, cmd);
}

const eventsDir = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsDir).filter((f) => f.endsWith('.ts') || f.endsWith('.js'))) {
  const event = await import(pathToFileURL(path.join(eventsDir, file)).href);
  if (event.once) client.once(event.name, event.execute);
  else client.on(event.name, event.execute);
}

client.login(process.env.DISCORD_BOT_TOKEN);

process.on('uncaughtException', (err) => {
  console.error('Bot uncaught exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Bot unhandled rejection:', reason);
});
