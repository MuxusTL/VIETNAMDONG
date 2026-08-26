import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import { REST, Routes } from 'discord.js';
import type { BotCommand } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsDir = path.join(__dirname, 'commands');

const commands = [];
for (const file of fs.readdirSync(commandsDir).filter((f) => f.endsWith('.ts') || f.endsWith('.js'))) {
  const cmd = (await import(pathToFileURL(path.join(commandsDir, file)).href)) as BotCommand;
  commands.push((cmd.data as any).toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN as string);

const route = process.env.DISCORD_GUILD_ID
  ? Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID as string, process.env.DISCORD_GUILD_ID)
  : Routes.applicationCommands(process.env.DISCORD_CLIENT_ID as string);

await rest.put(route, { body: commands });
console.log(`Đã đăng ký ${commands.length} slash command.`);
