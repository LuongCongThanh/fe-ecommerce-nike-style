import type { OrderStatus } from '@repo/schemas/order';
import { useNavigate, useSearch } from '@tanstack/react-router';

export type OrderStatusFilter = OrderStatus | 'ALL';

export interface OrderStatusFilterResult {
  readonly status: OrderStatusFilter;
  readonly setStatus: (status: OrderStatusFilter) => void;
}

const VALID_STATUSES = new Set<OrderStatus>(['PENDING', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED']);

function isOrderStatus(value: string): value is OrderStatus {
  return VALID_STATUSES.has(value as OrderStatus);
}

/**
 * Orders-list-only status filter, kept in the `?status=` URL param (docs/FRONTEND-GUIDE.md §8 — one
 * more consumer would move this into a shared hook, one consumer stays local per "no premature shared
 * abstraction"). Changing the filter drops `?page=` too, since the old page position no longer means
 * anything against the filtered set.
 */
export function useOrderStatusFilter(): OrderStatusFilterResult {
  const navigate = useNavigate();
  const search: { status?: string } = useSearch({ strict: false });

  const raw = search.status;
  const status: OrderStatusFilter = raw !== undefined && isOrderStatus(raw) ? raw : 'ALL';

  function setStatus(nextStatus: OrderStatusFilter): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic across routes, same as useUrlPage's `strict: false` usage.
    (navigate as (opts: any) => void)({
      to: '.',
      search: (prev: Record<string, unknown>) => ({ ...prev, status: nextStatus === 'ALL' ? undefined : nextStatus, page: undefined }),
    });
  }

  return { status, setStatus };
}
