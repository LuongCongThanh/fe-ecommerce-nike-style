import type { CheckoutInput } from '@/app/[locale]/(shop)/_lib/schemas/checkout';
import { API } from '@/shared/constants/api-endpoints';
import { http } from '@/shared/lib/http/client';
import type { Order } from '@/shared/types/order';

export const orderActions = {
  list: async () => http.get<Order[]>(API.ORDERS.LIST),
  detail: async (id: string) => http.get<Order>(API.ORDERS.DETAIL(id)),
  cancel: async (id: string) => http.post<Order>(API.ORDERS.CANCEL(id)),
  create: async (data: CheckoutInput & { items: Array<{ variantId: string; quantity: number }> }) => http.post<Order>(API.ORDERS.LIST, data),
};
