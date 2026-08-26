import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { db, type BotUser } from '../db.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export const data = new SlashCommandBuilder().setName('link').setDescription('Lấy link giới thiệu bạn bè của bạn');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const user = db.prepare('SELECT * FROM users WHERE discord_id = ?').get(interaction.user.id) as BotUser | undefined;
  if (!user) {
    await interaction.reply({ content: 'Tài khoản Discord của bạn chưa liên kết với LinkNet.', ephemeral: true });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x22d3ee)
    .setTitle('🔗 Link giới thiệu của bạn')
    .setDescription(`${CLIENT_URL}/r/${user.username}`)
    .setFooter({ text: 'Mời bạn bè, nhận hoa hồng vĩnh viễn từ nhiệm vụ họ hoàn thành' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
