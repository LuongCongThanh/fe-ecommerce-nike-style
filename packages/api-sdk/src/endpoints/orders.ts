import { CreateOrderPayloadSchema, OrderListSchema, OrderSchema } from '@repo/schemas/order';
import type { CreateOrderPayload, Order, OrderPaymentMethod, OrderPaymentStatus, OrderStatus } from '@repo/schemas/order';

import { apiClient } from '../client/fetcher';
import { API_BASE_URL } from '../env/config';

const ORDERS_API = {
  LIST: `${API_BASE_URL}/api/orders/`,
  DETAIL: (id: string) => `${API_BASE_URL}/api/orders/${id}/`,
  CANCEL: (id: string) => `${API_BASE_URL}/api/orders/${id}/cancel/`,
  RETURN_REQUEST: (id: string) => `${API_BASE_URL}/api/orders/${id}/return-request/`,
} as const;

// The domain type lives once in `@repo/schemas/order` — re-exported here under the storefront's
// existing `StorefrontOrder*` names so nothing importing from `@repo/api-sdk/endpoints/orders` has to
// change. `getOrders`/`getOrder`/... now validate the raw response through `OrderSchema` instead of
// blindly trusting the shape via a type assertion — the same `apiClient.get(url, params, { schema })`
// convention `catalog.ts` already uses.
export type StorefrontOrder = Order;
export type StorefrontOrderStatus = OrderStatus;
export type StorefrontPaymentMethod = OrderPaymentMethod;
export type StorefrontPaymentStatus = OrderPaymentStatus;
export type StorefrontOrderItem = Order['items'][number];
export type { CreateOrderPayload };

export async function getOrders(): Promise<StorefrontOrder[]> {
  return apiClient.get<StorefrontOrder[]>(ORDERS_API.LIST, undefined, { schema: OrderListSchema });
}

export async function getOrder(id: string): Promise<StorefrontOrder> {
  return apiClient.get<StorefrontOrder>(ORDERS_API.DETAIL(id), undefined, { schema: OrderSchema });
}

export async function cancelOrder(id: string): Promise<StorefrontOrder> {
  return apiClient.post<StorefrontOrder>(ORDERS_API.CANCEL(id), undefined, { schema: OrderSchema });
}

/** Return request (issue #17, glossary.md) — only valid from DELIVERED within the 7-day return window; rejected server-side otherwise. */
export async function requestReturn(id: string): Promise<StorefrontOrder> {
  return apiClient.post<StorefrontOrder>(ORDERS_API.RETURN_REQUEST(id), undefined, { schema: OrderSchema });
}

export async function createOrder(data: CreateOrderPayload): Promise<StorefrontOrder> {
  const parsed = CreateOrderPayloadSchema.parse(data);
  return apiClient.post<StorefrontOrder>(ORDERS_API.LIST, parsed, { schema: OrderSchema });
}
