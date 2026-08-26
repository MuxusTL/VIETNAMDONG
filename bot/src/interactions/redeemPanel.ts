import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChatInputCommandInteraction,
  StringSelectMenuInteraction,
  ModalSubmitInteraction,
} from 'discord.js';
import { linknetApi, BotApiError } from '../api.js';

const SELECT_ID = 'redeem_select';
const MODAL_PREFIX = 'redeem_modal:';
const INPUT_ID = 'destination';

const CATEGORY_LABEL: Record<string, string> = { game_topup: 'Nạp Game', wallet: 'Ví điện tử', card: 'Thẻ cào' };

export function isRedeemSelect(customId: string): boolean {
  return customId === SELECT_ID;
}
export function isRedeemModal(customId: string): boolean {
  return customId.startsWith(MODAL_PREFIX);
}

export async function replyWithRedeemPanel(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    const catalog = await linknetApi.redeemCatalog(interaction.user.id);
    const options = Object.entries(catalog).flatMap(([category, items]) =>
      items.map((item: any) => ({
        label: `${item.label}`.slice(0, 100),
        description: `${CATEGORY_LABEL[category] || category} · ${item.price_nova} Nova`.slice(0, 100),
        value: item.id,
      }))
    ).slice(0, 25);

    if (options.length === 0) {
      await interaction.reply({ content: 'Hiện chưa có vật phẩm nào để đổi.', ephemeral: true });
      return;
    }

    const menu = new StringSelectMenuBuilder().setCustomId(SELECT_ID).setPlaceholder('Chọn vật phẩm muốn đổi').addOptions(options);
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
    await interaction.reply({ content: '🎁 Chọn vật phẩm để đổi Nova:', components: [row], ephemeral: true });
  } catch (err) {
    const message = err instanceof BotApiError ? err.message : 'Có lỗi xảy ra, thử lại sau.';
    await interaction.reply({ content: `❌ ${message}`, ephemeral: true });
  }
}

export async function handleRedeemSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const itemId = interaction.values[0];

  let fieldLabel = 'Thông tin nhận thưởng';
  try {
    const catalog = await linknetApi.redeemCatalog(interaction.user.id);
    for (const items of Object.values(catalog)) {
      const found = (items as any[]).find((i) => i.id === itemId);
      if (found) fieldLabel = found.field_label;
    }
  } catch {
  }

  const modal = new ModalBuilder().setCustomId(`${MODAL_PREFIX}${itemId}`).setTitle('Nhập thông tin nhận thưởng');
  const input = new TextInputBuilder().setCustomId(INPUT_ID).setLabel(fieldLabel.slice(0, 45)).setStyle(TextInputStyle.Short).setRequired(true);
  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));

  await interaction.showModal(modal);
}

export async function handleRedeemModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  const itemId = interaction.customId.slice(MODAL_PREFIX.length);
  const destination = interaction.fields.getTextInputValue(INPUT_ID);
  await interaction.deferReply({ ephemeral: true });

  try {
    const result = await linknetApi.redeemOrder(interaction.user.id, itemId, destination);
    if (result.status === 'fulfilled') {
      await interaction.editReply(
        `🎉 Đổi thành công! Mã thẻ: \`${result.cardPin ?? '—'}\`${result.cardSerial ? ` — Serial: \`${result.cardSerial}\`` : ''}`
      );
    } else {
      await interaction.editReply('✅ Đã gửi yêu cầu đổi thưởng, đang xử lý — kiểm tra lại trên web nếu cần.');
    }
  } catch (err) {
    const message = err instanceof BotApiError ? err.message : 'Có lỗi xảy ra, thử lại sau.';
    await interaction.editReply(`❌ ${message}`);
  }
}
