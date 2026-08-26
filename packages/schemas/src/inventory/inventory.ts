import { z } from 'zod';

/**
 * SKU-level stock view (issue #21) — deliberately split into `onHand`/`reserved`/`available` instead
 * of a single `stock` number, matching the Phase 4 BE roadmap's inventory model so this shape survives
 * the swap from mock to a real backend unchanged. `onHand` is the writable field (glossary.md — SKU's
 * `stock`); `reserved` comes from in-flight Reservations (issue #16); `available = onHand - reserved`.
 */
export const InventoryItemSchema = z.object({
  skuId: z.string(),
  productId: z.string(),
  productName: z.string(),
  color: z.string().nullable(),
  size: z.string().nullable(),
  onHand: z.number().int().nonnegative(),
  reserved: z.number().int().nonnegative(),
  available: z.number().int(),
});

export const InventoryListResponseSchema = z.object({
  data: z.array(InventoryItemSchema),
});

/** Update payload — only `onHand` is writable; `reserved`/`available` are always derived. */
export const InventoryUpdateInputSchema = z.object({
  onHand: z.number().int().nonnegative(),
});

/** One audit-trail row per `onHand` update (issue #21's acceptance criteria: "audit-friendly", actor + timestamp), so the mock server's write path already shapes what a real audit trail would need. */
export const InventoryAuditEntrySchema = z.object({
  id: z.string(),
  skuId: z.string(),
  previousOnHand: z.number().int().nonnegative(),
  newOnHand: z.number().int().nonnegative(),
  actorId: z.number(),
  actorName: z.string(),
  at: z.number(),
});

export const InventoryAuditLogResponseSchema = z.object({
  data: z.array(InventoryAuditEntrySchema),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type InventoryListResponse = z.infer<typeof InventoryListResponseSchema>;
export type InventoryUpdateInput = z.infer<typeof InventoryUpdateInputSchema>;
export type InventoryAuditEntry = z.infer<typeof InventoryAuditEntrySchema>;
export type InventoryAuditLogResponse = z.infer<typeof InventoryAuditLogResponseSchema>;
