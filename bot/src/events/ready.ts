import type { Client } from 'discord.js';

export const name = 'ready';
export const once = true;

export function execute(client: Client<true>): void {
  console.log(`LinkNet bot đã đăng nhập với tên ${client.user.tag}`);
}
