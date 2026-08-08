import { cancelOrder, createOrder, getOrder, getOrders, requestReturn } from '@repo/api-sdk/endpoints/orders';

import type { CheckoutInput } from '@/app/[locale]/(shop)/_lib/schemas/checkout';
import { toStorefrontApiError } from '@/shared/lib/errors/toStorefrontApiError';
import type { Order } from '@/shared/types/order';

export const orderActions = {
  list: async () => {
    try {
      return (await getOrders()) as Order[];
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
  detail: async (id: string) => {
    try {
      return (await getOrder(id)) as Order;
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
  cancel: async (id: string) => {
    try {
      return (await cancelOrder(id)) as Order;
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
  requestReturn: async (id: string) => {
    try {
      return (await requestReturn(id)) as Order;
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
  create: async (data: CheckoutInput & { items: Array<{ variantId: string; quantity: number }>; reservationId: string; requestKey: string }) => {
    try {
      return (await createOrder(data)) as Order;
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
};
