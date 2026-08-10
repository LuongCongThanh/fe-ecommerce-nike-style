import type { CartItem } from '@repo/schemas/cart';

import { apiClient } from '../client/fetcher';
import { API_BASE_URL } from '../env/config';

const CHECKOUT_API = {
  RESERVATIONS: `${API_BASE_URL}/api/checkout/reservations`,
} as const;

/** Same wire shape as CartItem (glossary.md) — a Reservation holds the exact SKU/quantity pairs the Cart had at Checkout start. */
export type ReservationItem = CartItem;

export interface Reservation {
  reservationId: string;
  expiresAt: string;
}

/** Reservation (glossary.md) — created only at Checkout start, not add-to-cart; holds `available` stock until it expires or is committed by a successful Place Order. */
export async function createReservation(items: ReservationItem[]): Promise<Reservation> {
  return apiClient.post<Reservation>(CHECKOUT_API.RESERVATIONS, { items });
}
