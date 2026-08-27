'use client';

import type { OrderStatus } from '@repo/schemas/order';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get('status');
  const status: OrderStatusFilter = raw !== null && isOrderStatus(raw) ? raw : 'ALL';

  function setStatus(nextStatus: OrderStatusFilter): void {
    const params = new URLSearchParams(searchParams.toString());
    if (nextStatus === 'ALL') {
      params.delete('status');
    } else {
      params.set('status', nextStatus);
    }
    params.delete('page');
    const query = params.toString();
    router.push(query === '' ? pathname : `${pathname}?${query}`);
  }

  return { status, setStatus };
}
