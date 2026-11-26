import { apiClient } from '@/integrations/backend/client/fetcher';
import { API_BASE_URL } from '@/integrations/backend/env/config';
import type {
  CreateOrderPayload,
  Order,
  OrderPaymentMethod,
  OrderPaymentStatus,
  OrderStatus,
} from '@/integrations/backend/schemas/order/order.schema';
import { CreateOrderPayloadSchema, OrderListSchema, OrderSchema } from '@/integrations/backend/schemas/order/order.schema';

const ORDERS_API = {
  LIST: `${API_BASE_URL}/api/orders/`,
  DETAIL: (id: string) => `${API_BASE_URL}/api/orders/${id}/`,
  CANCEL: (id: string) => `${API_BASE_URL}/api/orders/${id}/cancel/`,
  RETURN_REQUEST: (id: string) => `${API_BASE_URL}/api/orders/${id}/return-request/`,
} as const;

// Order schemas own the domain type; these aliases preserve storefront endpoint names.
// Responses are validated through OrderSchema by the API client.
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
