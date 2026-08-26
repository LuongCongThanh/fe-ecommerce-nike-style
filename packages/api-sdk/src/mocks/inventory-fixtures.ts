/**
 * Mock Inventory backing store for `packages/api-sdk/src/mocks/handlers.ts` — issue #21 (Admin
 * Inventory view/update). Reads/writes the same SKU `stock` field the catalog already owns
 * (glossary.md — SKU) so "on_hand" isn't a second source of truth; `reserved`/`available` are
 * derived from `reservation-fixtures.ts`'s in-flight Reservations (issue #16), never stored.
 */

import type { InventoryAuditEntry, InventoryItem } from '@repo/schemas/inventory';

import { findProductBySkuId, mockProducts } from './catalog-fixtures';
import { getReservedQuantity } from './reservation-fixtures';

function toInventoryItem(productId: string, productName: string, sku: (typeof mockProducts)[number]['skus'][number]): InventoryItem {
  const reserved = getReservedQuantity(sku.id);
  return {
    skuId: sku.id,
    productId,
    productName,
    color: sku.color,
    size: sku.size,
    onHand: sku.stock,
    reserved,
    available: sku.stock - reserved,
  };
}

export function listInventory(): InventoryItem[] {
  return mockProducts.flatMap((product) => product.skus.map((sku) => toInventoryItem(product.id, product.name, sku)));
}

export type InventoryUpdateResult = { ok: true; item: InventoryItem } | { ok: false; code: string; message: string };

let nextAuditId = 1;
let auditLog: InventoryAuditEntry[] = [];

/** Writes the new on_hand value and appends an audit-trail entry (issue #21's acceptance criteria — "audit-friendly", actor + timestamp). */
export function updateInventoryOnHand(skuId: string, onHand: number, actor: { id: number; name: string }): InventoryUpdateResult {
  const match = findProductBySkuId(skuId);
  if (match === undefined) {
    return { ok: false, code: 'NOT_FOUND', message: 'Không tìm thấy biến thể.' };
  }

  const previousOnHand = match.sku.stock;
  match.sku.stock = onHand;

  auditLog.push({
    id: `inv-audit-${String(nextAuditId++)}`,
    skuId,
    previousOnHand,
    newOnHand: onHand,
    actorId: actor.id,
    actorName: actor.name,
    at: Date.now(),
  });

  return { ok: true, item: toInventoryItem(match.product.id, match.product.name, match.sku) };
}

/** `skuId` filters to one SKU's history; omitted returns every entry, newest first. */
export function getInventoryAuditLog(skuId?: string): InventoryAuditEntry[] {
  const entries = skuId === undefined ? auditLog : auditLog.filter((e) => e.skuId === skuId);
  return [...entries].reverse();
}

/** Test-only — clears the audit trail between FE-INT tests (SKU stock itself resets via `resetMockCatalogProductsForTesting`). */
export function resetMockInventoryAuditForTesting(): void {
  auditLog = [];
  nextAuditId = 1;
}
