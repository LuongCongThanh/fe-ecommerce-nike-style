import { cancelOrder, createOrder, getOrder, getOrders, requestReturn } from '@repo/api-sdk/endpoints/orders';

import type { CheckoutInput } from '@/app/[locale]/(shop)/_lib/schemas/checkout';
import { withApiErrorTranslation } from '@/shared/lib/errors/toStorefrontApiError';

export const orderActions = {
  list: withApiErrorTranslation(getOrders),
  detail: withApiErrorTranslation(getOrder),
  cancel: withApiErrorTranslation(cancelOrder),
  requestReturn: withApiErrorTranslation(requestReturn),
  create: withApiErrorTranslation(
    async (data: CheckoutInput & { items: Array<{ variantId: string; quantity: number }>; reservationId: string; requestKey: string }) =>
      createOrder(data),
  ),
};
