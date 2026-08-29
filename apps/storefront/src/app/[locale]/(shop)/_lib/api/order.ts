import type { StorefrontOrder } from '@repo/api-sdk/endpoints/orders';
import { cancelOrder, createOrder, getOrder, getOrders, requestReturn } from '@repo/api-sdk/endpoints/orders';

import type { CheckoutInput } from '@/app/[locale]/(shop)/_lib/schemas/checkout';

export const orderActions = {
  list: getOrders,
  detail: getOrder,
  cancel: cancelOrder,
  requestReturn: requestReturn,
  create: async (data: CheckoutInput & { items: Array<{ variantId: string; quantity: number }>; reservationId: string; requestKey: string }) =>
    createOrder(data),
};

/**
 * `orderActions.detail` but swallows the failure into `null` instead of throwing — for read contexts
 * (like the checkout-success page) that fall back to a plain "here's your order id" rendering rather
 * than an error state. SSR can't carry the in-memory-only mock auth token (Decision #90), so a `null`
 * here may just mean "not signed in on this request," not "this order doesn't exist."
 */
export async function getOrderOrNull(orderId: string | undefined): Promise<StorefrontOrder | null> {
  if (orderId === undefined || orderId === '') return null;
  try {
    return await orderActions.detail(orderId);
  } catch {
    return null;
  }
}
