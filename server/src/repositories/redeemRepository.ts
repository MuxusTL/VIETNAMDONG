import { db } from '../db/database.js';
import type { RedeemItem, RedeemOrder } from '../types/index.js';

export function listActiveRedeemItems(): RedeemItem[] {
  return db.prepare('SELECT * FROM redeem_items WHERE active = 1 ORDER BY category, sort_order').all() as RedeemItem[];
}

export function getActiveRedeemItem(id: string): RedeemItem | undefined {
  return db.prepare('SELECT * FROM redeem_items WHERE id = ? AND active = 1').get(id) as RedeemItem | undefined;
}

export function createRedeemOrder(id: string, userId: string, itemId: string, destination: string, priceNova: number): void {
  db.prepare(`
    INSERT INTO redeem_orders (id, user_id, item_id, destination, price_nova)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, userId, itemId, destination, priceNova);
}

export function markRedeemOrderFulfilled(id: string, resultData: string): void {
  db.prepare(`
    UPDATE redeem_orders SET status = 'fulfilled', processed_at = datetime('now'), result_data = ?
    WHERE id = ?
  `).run(resultData, id);
}

export function markRedeemOrderRejected(id: string, resultData: string | null, note: string): void {
  db.prepare(`
    UPDATE redeem_orders SET status = 'rejected', processed_at = datetime('now'), result_data = ?, admin_note = ?
    WHERE id = ?
  `).run(resultData, note, id);
}

export function setRedeemOrderResultData(id: string, resultData: string): void {
  db.prepare(`UPDATE redeem_orders SET result_data = ? WHERE id = ?`).run(resultData, id);
}

export function listRedeemOrdersForUser(userId: string): (Partial<RedeemOrder> & { label: string; category: string })[] {
  return db.prepare(`
    SELECT o.id, o.price_nova, o.status, o.result_data, o.created_at, i.label, i.category
    FROM redeem_orders o JOIN redeem_items i ON i.id = o.item_id
    WHERE o.user_id = ? ORDER BY o.created_at DESC
  `).all(userId) as any;
}

export function listAllRedeemOrdersAdmin(): (RedeemOrder & { username: string; label: string; category: string; requires_field: string })[] {
  return db.prepare(`
    SELECT o.*, u.username, i.label, i.category, i.requires_field FROM redeem_orders o
    JOIN users u ON u.id = o.user_id
    JOIN redeem_items i ON i.id = o.item_id
    ORDER BY CASE o.status WHEN 'pending' THEN 0 ELSE 1 END, o.created_at DESC
  `).all() as any;
}

export function findPendingOrderByRequestOrTrans(requestId: string, transId: string): RedeemOrder | undefined {
  return db.prepare(`
    SELECT * FROM redeem_orders
    WHERE status = 'pending'
      AND (result_data LIKE '%' || ? || '%' OR result_data LIKE '%' || ? || '%')
  `).get(requestId, transId) as RedeemOrder | undefined;
}
