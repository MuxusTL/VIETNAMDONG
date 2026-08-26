import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ButtonInteraction } from 'discord.js';
import { linknetApi, BotApiError } from '../api.js';

const CLAIM_BUTTON_ID = 'daily_claim';

export function isDailyClaimButton(customId: string): boolean {
  return customId === CLAIM_BUTTON_ID;
}

export async function replyWithDailyPanel(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    const status = await linknetApi.dailyStatus(interaction.user.id);
    const embed = new EmbedBuilder()
      .setColor(0xf5a524)
      .setTitle('🔥 Quà thưởng ngày')
      .addFields(
        { name: 'Streak hiện tại', value: `${status.streak_days} ngày`, inline: true },
        { name: status.can_claim ? 'Có thể nhận' : 'Trạng thái', value: status.can_claim ? `+${status.next_reward_nova} Nova` : 'Đã nhận hôm nay', inline: true }
      );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(CLAIM_BUTTON_ID).setLabel('Nhận thưởng').setStyle(ButtonStyle.Success).setDisabled(!status.can_claim)
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  } catch (err) {
    const message = err instanceof BotApiError ? err.message : 'Có lỗi xảy ra, thử lại sau.';
    await interaction.reply({ content: `❌ ${message}`, ephemeral: true });
  }
}

export async function handleDailyClaimButton(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferUpdate();
  try {
    const result = await linknetApi.dailyClaim(interaction.user.id);
    await interaction.editReply({
      content: `🎉 Nhận được +${result.reward_nova} Nova! Streak: ${result.streak_days} ngày`,
      embeds: [],
      components: [],
    });
  } catch (err) {
    const message = err instanceof BotApiError ? err.message : 'Có lỗi xảy ra, thử lại sau.';
    await interaction.editReply({ content: `❌ ${message}`, embeds: [], components: [] });
  }
}
