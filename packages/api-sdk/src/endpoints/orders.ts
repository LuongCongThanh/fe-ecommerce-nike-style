import { apiClient } from '../client/fetcher';
import { API_BASE_URL } from '../env/config';

const ORDERS_API = {
  LIST: `${API_BASE_URL}/api/orders/`,
  DETAIL: (id: string) => `${API_BASE_URL}/api/orders/${id}/`,
  CANCEL: (id: string) => `${API_BASE_URL}/api/orders/${id}/cancel/`,
} as const;

/** Mirrors `shared/types/order.ts`'s `OrderStatusSchema` (glossary.md — Cart & Order state machine). */
export type StorefrontOrderStatus = 'PENDING' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'RETURNED';
export type StorefrontPaymentMethod = 'cod' | 'bankTransfer' | 'vnpay' | 'momo' | 'zalopay';
export type StorefrontPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface StorefrontOrderItem {
  id: number;
  product_name: string;
  variant_name: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface StorefrontOrder {
  id: number;
  code: string;
  status: StorefrontOrderStatus;
  payment_method: StorefrontPaymentMethod;
  payment_status: StorefrontPaymentStatus;
  items: StorefrontOrderItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  address: string;
  note: string;
  created_at: string;
  updated_at: string;
  delivered_at: string | null;
}

export interface CreateOrderPayload {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  shippingMethod: StorefrontPaymentMethod | 'standard' | 'express';
  paymentMethod: StorefrontPaymentMethod;
  note?: string;
  voucherCode?: string;
  items: Array<{ variantId: string; quantity: number }>;
}

export async function getOrders(): Promise<StorefrontOrder[]> {
  return apiClient.get<StorefrontOrder[]>(ORDERS_API.LIST);
}

export async function getOrder(id: string): Promise<StorefrontOrder> {
  return apiClient.get<StorefrontOrder>(ORDERS_API.DETAIL(id));
}

export async function cancelOrder(id: string): Promise<StorefrontOrder> {
  return apiClient.post<StorefrontOrder>(ORDERS_API.CANCEL(id));
}

export async function createOrder(data: CreateOrderPayload): Promise<StorefrontOrder> {
  return apiClient.post<StorefrontOrder>(ORDERS_API.LIST, data);
}
