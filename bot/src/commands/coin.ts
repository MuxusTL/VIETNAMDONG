import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { db, type BotUser } from '../db.js';

export const data = new SlashCommandBuilder().setName('coin').setDescription('Xem số dư Nova của bạn');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const user = db.prepare('SELECT * FROM users WHERE discord_id = ?').get(interaction.user.id) as BotUser | undefined;

  if (!user) {
    await interaction.reply({
      content: 'Tài khoản Discord của bạn chưa liên kết với LinkNet. Đăng nhập tại web bằng Discord trước nhé.',
      ephemeral: true,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x6c63f5)
    .setTitle(`💰 Ví của ${user.username}`)
    .addFields(
      { name: 'Số dư', value: `${user.balance_nova} Nova`, inline: true },
      { name: 'Đã quy đổi', value: `${user.total_redeemed_nova} Nova`, inline: true },
      { name: 'Streak', value: `${user.streak_days} ngày`, inline: true }
    );

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
