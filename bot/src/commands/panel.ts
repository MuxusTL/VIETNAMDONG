import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { replyWithTaskPanel } from '../interactions/taskPanel.js';

export const data = new SlashCommandBuilder().setName('panel').setDescription('Làm nhiệm vụ trực tiếp trong Discord — bấm nút để lấy link');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await replyWithTaskPanel(interaction);
}
