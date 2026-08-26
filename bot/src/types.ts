import type { ChatInputCommandInteraction, Collection, SlashCommandBuilder } from 'discord.js';

export interface BotCommand {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, BotCommand>;
  }
}
