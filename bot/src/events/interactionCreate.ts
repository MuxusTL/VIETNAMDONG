import type { Interaction, RepliableInteraction } from 'discord.js';
import { isTaskStartButton, handleTaskStartButton } from '../interactions/taskPanel.js';
import { isRedeemSelect, isRedeemModal, handleRedeemSelect, handleRedeemModalSubmit } from '../interactions/redeemPanel.js';
import { isDailyClaimButton, handleDailyClaimButton } from '../interactions/dailyPanel.js';

export const name = 'interactionCreate';
export const once = false;

async function safely(fn: () => Promise<void>, interaction: Interaction): Promise<void> {
  try {
    await fn();
  } catch (err) {
    console.error(err);
    if (!interaction.isRepliable()) return;
    const repliable = interaction as RepliableInteraction;
    const payload = { content: 'Có lỗi xảy ra, thử lại sau.', ephemeral: true };
    if (repliable.replied || repliable.deferred) await repliable.followUp(payload);
    else await repliable.reply(payload);
  }
}

export async function execute(interaction: Interaction): Promise<void> {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;
    await safely(() => command.execute(interaction), interaction);
    return;
  }

  if (interaction.isButton()) {
    if (isTaskStartButton(interaction.customId)) return safely(() => handleTaskStartButton(interaction), interaction);
    if (isDailyClaimButton(interaction.customId)) return safely(() => handleDailyClaimButton(interaction), interaction);
    return;
  }

  if (interaction.isStringSelectMenu()) {
    if (isRedeemSelect(interaction.customId)) return safely(() => handleRedeemSelect(interaction), interaction);
    return;
  }

  if (interaction.isModalSubmit()) {
    if (isRedeemModal(interaction.customId)) return safely(() => handleRedeemModalSubmit(interaction), interaction);
    return;
  }
}
