import type { CheckoutInput } from '@/app/[locale]/(shop)/_lib/schemas/checkout';
import { cancelOrder, createOrder, getOrder, getOrders } from '@repo/api-sdk/endpoints/orders';
import type { Order } from '@/shared/types/order';
import { toStorefrontApiError } from '@/shared/lib/errors/toStorefrontApiError';

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
  create: async (data: CheckoutInput & { items: Array<{ variantId: string; quantity: number }> }) => {
    try {
      return (await createOrder(data)) as Order;
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
};
