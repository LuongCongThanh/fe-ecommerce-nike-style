import { createReservation } from '@repo/api-sdk/endpoints/checkout';

import { withApiErrorTranslation } from '@/shared/lib/errors/toStorefrontApiError';

export const checkoutActions = {
  reserve: withApiErrorTranslation(createReservation),
};
