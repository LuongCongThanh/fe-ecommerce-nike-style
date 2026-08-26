import { OrderListSchema, OrderSchema } from '@repo/schemas/order';
import type { Order, OrderStatus } from '@repo/schemas/order';

import { apiClient } from '../client/fetcher';
import { API_BASE_URL } from '../env/config';

const ADMIN_ORDERS_API = {
  LIST: `${API_BASE_URL}/api/admin/orders/`,
  DETAIL: (id: number) => `${API_BASE_URL}/api/admin/orders/${String(id)}/`,
  STATUS: (id: number) => `${API_BASE_URL}/api/admin/orders/${String(id)}/status/`,
  APPROVE_RETURN: (id: number) => `${API_BASE_URL}/api/admin/orders/${String(id)}/approve-return/`,
  REJECT_RETURN: (id: number) => `${API_BASE_URL}/api/admin/orders/${String(id)}/reject-return/`,
} as const;

/** Admin's Order list/detail + status update + return approval (issue #22) — same `Order` shape the
 * storefront's own order history uses, but unscoped by Customer and Staff-only. */
export async function getAdminOrders(): Promise<Order[]> {
  return apiClient.get<Order[]>(ADMIN_ORDERS_API.LIST, undefined, { schema: OrderListSchema });
}

export async function getAdminOrder(id: number): Promise<Order> {
  return apiClient.get<Order>(ADMIN_ORDERS_API.DETAIL(id), undefined, { schema: OrderSchema });
}

/** Only a valid next step in the state machine is accepted — the mock rejects anything else with 400 (issue #22). */
export async function updateAdminOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  return apiClient.patch<Order>(ADMIN_ORDERS_API.STATUS(id), { status }, { schema: OrderSchema });
}

/** RETURN_REQUESTED → RETURNED; releases the Order's SKU stock back to `available` (issue #22, `order:approve-return`). */
export async function approveAdminOrderReturn(id: number): Promise<Order> {
  return apiClient.post<Order>(ADMIN_ORDERS_API.APPROVE_RETURN(id), undefined, { schema: OrderSchema });
}

/** RETURN_REQUESTED → DELIVERED; stock is untouched (issue #22, `order:approve-return`). */
export async function rejectAdminOrderReturn(id: number): Promise<Order> {
  return apiClient.post<Order>(ADMIN_ORDERS_API.REJECT_RETURN(id), undefined, { schema: OrderSchema });
}
