/**
 * Mock Reservation backing store for `packages/api-sdk/src/mocks/handlers.ts` — issue #16 (glossary.md
 * — Reservation).
 *
 * Created only when Checkout starts, never at add-to-cart (glossary.md — Reservation). Has a TTL;
 * if the customer abandons Checkout before Place Order, the reservation simply expires on its own —
 * there's no explicit "release" call to make. A successful Place Order commits it instead (see
 * `catalog-fixtures.ts#commitSkuStock`), which permanently decrements the SKU's stock and removes the
 * reservation. Kept in memory only (no `sessionStorage`) — reservations are meant to be short-lived,
 * surviving a reload isn't a real requirement here.
 */

import { commitSkuStock, findProductBySkuId } from './catalog-fixtures';

// Scaled down for testability, same spirit as `auth-fixtures.ts`'s token TTLs — issue #16's acceptance
// criteria only needs correct expiry *behavior*, not a real-world number of minutes.
export const RESERVATION_TTL_MS = 10_000;

export interface ReservationItem {
  skuId: string;
  quantity: number;
}

interface Reservation {
  id: string;
  items: ReservationItem[];
  expiresAt: number;
}

const reservations = new Map<string, Reservation>();

function sweepExpired(): void {
  const now = Date.now();
  for (const [id, reservation] of reservations) {
    if (reservation.expiresAt <= now) reservations.delete(id);
  }
}

/** Stock already held by *other* active reservations for `skuId` — subtracted from base stock to get true `available`. */
export function getReservedQuantity(skuId: string, excludeReservationId?: string): number {
  sweepExpired();
  let reserved = 0;
  for (const reservation of reservations.values()) {
    if (reservation.id === excludeReservationId) continue;
    for (const item of reservation.items) {
      if (item.skuId === skuId) reserved += item.quantity;
    }
  }
  return reserved;
}

/** Base SKU stock minus whatever's currently reserved by other in-flight checkouts. */
export function getAvailableStock(skuId: string): number {
  const match = findProductBySkuId(skuId);
  if (match === undefined) return 0;
  return Math.max(0, match.sku.stock - getReservedQuantity(skuId));
}

export type CreateReservationResult = { ok: true; reservationId: string; expiresAt: number } | { ok: false; skuId: string };

/** Atomically reserves every item or none — the first SKU without enough room fails the whole request. */
export function createReservation(items: ReservationItem[]): CreateReservationResult {
  sweepExpired();

  for (const item of items) {
    if (getAvailableStock(item.skuId) < item.quantity) {
      return { ok: false, skuId: item.skuId };
    }
  }

  const id = crypto.randomUUID();
  const expiresAt = Date.now() + RESERVATION_TTL_MS;
  reservations.set(id, { id, items, expiresAt });
  return { ok: true, reservationId: id, expiresAt };
}

/** `undefined` for both "never existed" and "expired" — same no-distinction shape as `order-fixtures.ts`. */
export function getReservation(id: string): ReservationItem[] | undefined {
  sweepExpired();
  return reservations.get(id)?.items;
}

/** Consumes the reservation (Place Order succeeded): commits its stock permanently and removes it. Returns its items so the caller can snapshot them into the Order, or `undefined` if it no longer exists. */
export function consumeReservation(id: string): ReservationItem[] | undefined {
  const items = getReservation(id);
  if (items === undefined) return undefined;

  for (const item of items) {
    commitSkuStock(item.skuId, item.quantity);
  }
  reservations.delete(id);
  return items;
}

/** Test-only — clears all in-flight reservations between FE-INT tests. */
export function resetMockReservationsForTesting(): void {
  reservations.clear();
}
