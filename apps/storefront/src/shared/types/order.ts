import { z } from 'zod';

import { PaymentMethodSchema, PaymentStatusSchema } from '@/shared/types/payment';

/**
 * MVP COD-only state machine (glossary.md — Cart & Order):
 *
 *   PENDING → PROCESSING → PACKED → SHIPPED → DELIVERED
 *                                                 ↓
 *                                       RETURN_REQUESTED → RETURNED
 *   PENDING/PROCESSING → CANCELLED (nhánh riêng, chỉ từ 2 trạng thái này)
 *
 * CANCELLED is only valid from PENDING/PROCESSING — from PACKED onward an order can never cancel
 * directly, it must reach DELIVERED and go through RETURN_REQUESTED → RETURNED instead.
 */
export const OrderStatusSchema = z.enum(['PENDING', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED']);

export const OrderItemSchema = z.object({
  id: z.number(),
  product_name: z.string(),
  variant_name: z.string(),
  image: z.string(),
  price: z.number(),
  quantity: z.number(),
  subtotal: z.number(),
});

export const OrderSchema = z.object({
  id: z.number(),
  code: z.string(),
  status: OrderStatusSchema,
  payment_method: PaymentMethodSchema,
  payment_status: PaymentStatusSchema,
  items: z.array(OrderItemSchema),
  subtotal: z.number(),
  shipping_fee: z.number(),
  total: z.number(),
  address: z.string(),
  note: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  /** Set the moment `status` transitions to DELIVERED — anchors the 7-day return window (glossary.md — Return window); `null` before then. */
  delivered_at: z.string().nullable(),
});

export const OrderListSchema = z.array(OrderSchema);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;

/** Return window per glossary.md — Return & Refund: 7 days from the moment an Order became DELIVERED. */
export const RETURN_WINDOW_DAYS = 7;

/** CANCELLED is only valid from PENDING/PROCESSING (glossary.md — Cart & Order); issue #17. */
export function canCancelOrder(order: Pick<Order, 'status'>): boolean {
  return order.status === 'PENDING' || order.status === 'PROCESSING';
}

/** RETURN_REQUESTED is only valid from DELIVERED, within the 7-day return window (glossary.md — Return window); issue #17. */
export function canRequestReturn(order: Pick<Order, 'status' | 'delivered_at'>, now: number = Date.now()): boolean {
  if (order.status !== 'DELIVERED' || order.delivered_at === null) return false;
  const deliveredAt = new Date(order.delivered_at).getTime();
  return now - deliveredAt <= RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}
