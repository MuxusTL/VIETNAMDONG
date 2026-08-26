import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ButtonInteraction,
} from 'discord.js';
import { linknetApi, BotApiError, type BotTaskDto } from '../api.js';

const TASK_BUTTON_PREFIX = 'task_start:';

export function buildTaskPanel(tasks: BotTaskDto[]) {
  const embed = new EmbedBuilder()
    .setColor(0x6c63f5)
    .setTitle('📋 Nhiệm vụ LinkNet')
    .setDescription(
      tasks.length
        ? tasks
            .map((t) => `${t.is_hot ? '🔥 ' : ''}**${t.name}** — +${t.reward_nova} Nova _(${t.done_today}/${t.daily_limit} lượt)_`)
            .join('\n')
        : 'Hiện chưa có nhiệm vụ nào khả dụng.'
    )
    .setFooter({ text: 'Bấm nút bên dưới để lấy link — coin cộng tự động sau khi bạn vượt link thật' });

  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < tasks.length; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (const t of tasks.slice(i, i + 5)) {
      const atLimit = t.done_today >= t.daily_limit;
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`${TASK_BUTTON_PREFIX}${t.id}`)
          .setLabel(atLimit ? `${t.name} (hết lượt)` : t.name)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(atLimit)
      );
    }
    rows.push(row);
  }

  return { embeds: [embed], components: rows };
}

export function isTaskStartButton(customId: string): boolean {
  return customId.startsWith(TASK_BUTTON_PREFIX);
}

export async function handleTaskStartButton(interaction: ButtonInteraction): Promise<void> {
  const taskId = interaction.customId.slice(TASK_BUTTON_PREFIX.length);
  await interaction.deferReply({ ephemeral: true });

  try {
    const { shortUrl } = await linknetApi.startTask(interaction.user.id, taskId);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setLabel('Mở link rút gọn').setStyle(ButtonStyle.Link).setURL(shortUrl)
    );
    await interaction.editReply({
      content: 'Vượt link xong, Nova sẽ tự động cộng vào ví — không cần quay lại đây báo kết quả.',
      components: [row],
    });
  } catch (err) {
    const message = err instanceof BotApiError ? err.message : 'Có lỗi xảy ra, thử lại sau.';
    await interaction.editReply({ content: `❌ ${message}` });
  }
}

export async function replyWithTaskPanel(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    const tasks = await linknetApi.tasks(interaction.user.id);
    await interaction.reply(buildTaskPanel(tasks));
  } catch (err) {
    const message = err instanceof BotApiError ? err.message : 'Có lỗi xảy ra, thử lại sau.';
    await interaction.reply({ content: `❌ ${message}`, ephemeral: true });
  }
}
