import type { Reservation, ReservationItem } from '@repo/api-sdk/endpoints/checkout';
import { createReservation } from '@repo/api-sdk/endpoints/checkout';

import { toStorefrontApiError } from '@/shared/lib/errors/toStorefrontApiError';

export const checkoutActions = {
  reserve: async (items: ReservationItem[]): Promise<Reservation> => {
    try {
      return await createReservation(items);
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
};
