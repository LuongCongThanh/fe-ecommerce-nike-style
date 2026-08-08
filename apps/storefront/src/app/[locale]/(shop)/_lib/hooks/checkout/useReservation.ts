'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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
 */
export function useReservation(items: CartLine[]): ReservationState {
  const [state, setState] = useState<ReservationState>({ reservationId: null, isPending: false, error: null });
  const hasReserved = useRef(false);

  const itemsKey = useMemo(() => items.map((i) => `${i.skuId}:${String(i.quantity)}`).join(','), [items]);

  useEffect(() => {
    if (hasReserved.current || itemsKey === '') return;
    hasReserved.current = true;

    setState({ reservationId: null, isPending: true, error: null });
    checkoutActions
      .reserve(items.map((i) => ({ skuId: i.skuId, quantity: i.quantity })))
      .then((reservation) => {
        setState({ reservationId: reservation.reservationId, isPending: false, error: null });
      })
      .catch((error: unknown) => {
        hasReserved.current = false; // allow retrying (e.g. re-mounting the page) after a failure
        setState({
          reservationId: null,
          isPending: false,
          error: error instanceof ApiError ? error.message : 'Không thể giữ chỗ sản phẩm. Vui lòng thử lại.',
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `items` itself is a new array every render; `itemsKey` is the real dependency.
  }, [itemsKey]);

  return state;
}
