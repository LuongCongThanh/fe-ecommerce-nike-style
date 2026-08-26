/**
 * The Cart & Order state machine's transition rules (glossary.md — Cart & Order):
 *
 *   PENDING → PROCESSING → PACKED → SHIPPED → DELIVERED
 *                                                 ↓
 *                                       RETURN_REQUESTED → RETURNED
 *   PENDING/PROCESSING → CANCELLED (nhánh riêng, chỉ từ 2 trạng thái này)
 *
 * Shared by the mock server — the source of truth, `mocks/order-fixtures.ts` — and the storefront UI's
 * button gating, `shared/types/order.ts` re-exports these. The two used to re-derive the same rule
 * independently, connected only by a "Mirrors ..." comment; a rule change (e.g. a new carve-out) had to
 * be made and tested in both places, with nothing enforcing they stayed in sync.
 */
import type { StorefrontOrderStatus } from './orders';

/** Return window per glossary.md — Return & Refund: 7 days from the moment an Order became DELIVERED. */
export const RETURN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

interface OrderTransitionInput {
  status: StorefrontOrderStatus;
  delivered_at: string | null;
}

/** CANCELLED is only valid from PENDING/PROCESSING — from PACKED onward it must go DELIVERED → RETURN_REQUESTED → RETURNED instead. */
export function canCancelOrder(order: Pick<OrderTransitionInput, 'status'>): boolean {
  return order.status === 'PENDING' || order.status === 'PROCESSING';
}

/** Whether `deliveredAt` is still inside the 7-day return window, as of `now`. */
export function isWithinReturnWindow(deliveredAt: string, now: number = Date.now()): boolean {
  return now - new Date(deliveredAt).getTime() <= RETURN_WINDOW_MS;
}

/** RETURN_REQUESTED is only valid from DELIVERED, within the 7-day return window. */
export function canRequestReturn(order: OrderTransitionInput, now: number = Date.now()): boolean {
  if (order.status !== 'DELIVERED' || order.delivered_at === null) return false;
  return isWithinReturnWindow(order.delivered_at, now);
}

/**
 * Admin's status-update button (issue #22) — one forward step at a time along the happy path, plus the
 * CANCELLED branch from PENDING/PROCESSING. RETURN_REQUESTED → RETURNED/DELIVERED is deliberately not
 * here: that's the separate approve/reject-return action (`order:approve-return`), not a status-update
 * pick-any-status control. Shared by the mock server and by the Admin UI's button gating, same
 * single-source-of-truth intent as `canCancelOrder`/`canRequestReturn` above.
 */
const ADMIN_STATUS_TRANSITIONS: Record<StorefrontOrderStatus, readonly StorefrontOrderStatus[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  RETURN_REQUESTED: [],
  RETURNED: [],
};

export function canAdminTransition(from: StorefrontOrderStatus, to: StorefrontOrderStatus): boolean {
  return ADMIN_STATUS_TRANSITIONS[from].includes(to);
}

export function adminTransitionsFrom(status: StorefrontOrderStatus): readonly StorefrontOrderStatus[] {
  return ADMIN_STATUS_TRANSITIONS[status];
}
