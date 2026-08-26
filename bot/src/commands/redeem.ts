import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { replyWithRedeemPanel } from '../interactions/redeemPanel.js';

export const data = new SlashCommandBuilder().setName('redeem').setDescription('Đổi Nova lấy thẻ cào / nạp game ngay trong Discord');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await replyWithRedeemPanel(interaction);
}
