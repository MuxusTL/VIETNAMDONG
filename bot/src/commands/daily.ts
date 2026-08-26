import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { replyWithDailyPanel } from '../interactions/dailyPanel.js';

export const data = new SlashCommandBuilder().setName('daily').setDescription('Điểm danh nhận quà thưởng ngày');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await replyWithDailyPanel(interaction);
}
