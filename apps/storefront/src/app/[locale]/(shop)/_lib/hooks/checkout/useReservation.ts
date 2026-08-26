'use client';

import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { checkoutActions } from '@/app/[locale]/(shop)/_lib/api/checkout';
import type { CartLine } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import { ApiError } from '@/shared/lib/errors/api-error';

interface ReservationState {
  reservationId: string | null;
  isPending: boolean;
  error: string | null;
}

/**
 * Creates a Reservation exactly once when Checkout has real items to reserve (glossary.md —
 * Reservation: only at Checkout start, never at add-to-cart). If the customer never places the order,
 * the Reservation simply expires server-side — there's nothing to release from here.
 *
 * Backed by `useQuery` instead of a hand-rolled state machine: `itemsKey` as the query key gives
 * "reserve once per distinct item-set" for free, and the reservation-fetch path is now reachable
 * through the same test seam (`renderHook` + `QueryClientProvider`) as every other data fetch in the
 * app, instead of only the mock API being covered. `retry: false` because a Reservation holds real
 * stock — a failed attempt shouldn't silently retry behind the customer's back.
 */
export function useReservation(items: CartLine[]): ReservationState {
  const itemsKey = useMemo(() => items.map((i) => `${i.skuId}:${String(i.quantity)}`).join(','), [items]);

  const { data, isPending, error } = useQuery({
    queryKey: ['reservation', itemsKey],
    queryFn: async () => checkoutActions.reserve(items.map((i) => ({ skuId: i.skuId, quantity: i.quantity }))),
    enabled: itemsKey !== '',
    retry: false,
    staleTime: Infinity, // a new itemsKey is a new Reservation, never a refetch of this one
  });

  return {
    reservationId: data?.reservationId ?? null,
    // `useQuery` reports `isPending: true` forever while `enabled: false` (v5 behavior) — gate on
    // `itemsKey` so an empty cart doesn't read as "still reserving".
    isPending: itemsKey !== '' && isPending,
    error: error == null ? null : error instanceof ApiError ? error.message : 'Không thể giữ chỗ sản phẩm. Vui lòng thử lại.',
  };
}
