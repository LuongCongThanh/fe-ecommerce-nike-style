import type { OrderStatus } from '@repo/schemas/order';

export type OrderStatusBadgeVariant = 'warning' | 'info' | 'success' | 'destructive' | 'secondary';

/**
 * Maps the real `OrderStatus` state machine (packages/schemas/src/order/order.ts) to one of
 * `@repo/ui/badge`'s existing semantic variants — no new colours invented, just consistent meaning
 * (pending/needs-attention = warning, in-flight = info, terminal-good = success, terminal-bad =
 * destructive, terminal-neutral = secondary) reused across the orders list, order detail, and
 * dashboard.
 */
const ORDER_STATUS_BADGE_VARIANT: Record<OrderStatus, OrderStatusBadgeVariant> = {
  PENDING: 'warning',
  PROCESSING: 'info',
  PACKED: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  RETURN_REQUESTED: 'warning',
  RETURNED: 'secondary',
};

export function orderStatusBadgeVariant(status: OrderStatus): OrderStatusBadgeVariant {
  return ORDER_STATUS_BADGE_VARIANT[status];
}

/** Linear MVP state machine order (see `OrderStatusSchema`'s doc comment) — used to render a
 * shipping-activity timeline up to the order's current step. CANCELLED/RETURN_REQUESTED/RETURNED
 * are branches off this line, not steps on it, so they're excluded from the timeline itself. */
export const ORDER_TIMELINE_STEPS = ['PENDING', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'] as const;
