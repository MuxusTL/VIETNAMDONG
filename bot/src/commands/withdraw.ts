import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { db, type BotUser, type BotWithdrawal } from '../db.js';

export const data = new SlashCommandBuilder().setName('withdraw').setDescription('Xem trạng thái các yêu cầu rút tiền gần đây của bạn');

const STATUS_LABEL: Record<string, string> = {
  pending: '⏳ Đang chờ',
  approved: '✅ Đã duyệt',
  paid: '✅ Đã thanh toán',
  rejected: '❌ Từ chối',
};

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const user = db.prepare('SELECT * FROM users WHERE discord_id = ?').get(interaction.user.id) as BotUser | undefined;
  if (!user) {
    await interaction.reply({ content: 'Chưa liên kết tài khoản LinkNet.', ephemeral: true });
    return;
  }

  const rows = db.prepare(`
    SELECT amount_nova, amount_vnd, status, created_at FROM withdrawals
    WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
  `).all(user.id) as BotWithdrawal[];

  if (rows.length === 0) {
    await interaction.reply({ content: 'Bạn chưa có yêu cầu rút tiền nào.', ephemeral: true });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0xf5a524)
    .setTitle('🧾 Yêu cầu rút tiền gần đây')
    .setDescription(rows.map((w) => `${STATUS_LABEL[w.status] || w.status} — ${w.amount_nova} Nova (${w.amount_vnd.toLocaleString('vi-VN')}đ)`).join('\n'));

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
