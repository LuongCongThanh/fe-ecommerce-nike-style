import { z } from 'zod';

/**
 * MVP COD-only state machine (glossary.md — Cart & Order):
 *
 *   PENDING → PROCESSING → PACKED → SHIPPED → DELIVERED
 *                                                 ↓
 *                                       RETURN_REQUESTED → RETURNED
 *   PENDING/PROCESSING → CANCELLED (nhánh riêng, chỉ từ 2 trạng thái này)
 */
export const OrderStatusSchema = z.enum(['PENDING', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED']);

/** MVP is COD-only, no payment gateway step (Decision #7 — decision-log.md). */
export const OrderPaymentMethodSchema = z.enum(['cod']);
export const OrderPaymentStatusSchema = z.enum(['pending', 'paid', 'failed', 'refunded']);

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
  payment_method: OrderPaymentMethodSchema,
  payment_status: OrderPaymentStatusSchema,
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

export const CreateOrderPayloadSchema = z.object({
  fullName: z.string(),
  phoneNumber: z.string(),
  address: z.string(),
  city: z.string(),
  district: z.string(),
  ward: z.string(),
  shippingMethod: z.enum(['standard', 'express']),
  paymentMethod: OrderPaymentMethodSchema,
  note: z.string().optional(),
  voucherCode: z.string().optional(),
  items: z.array(z.object({ variantId: z.string(), quantity: z.number() })),
  /** The Reservation created when Checkout started (glossary.md — Reservation) — the backend commits *this* reservation's stock, it doesn't re-derive from `items`. */
  reservationId: z.string(),
  /** Idempotency key: the same key retried (double-click, reload, network retry) replays the original order instead of creating a duplicate. */
  requestKey: z.string(),
});

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type OrderPaymentMethod = z.infer<typeof OrderPaymentMethodSchema>;
export type OrderPaymentStatus = z.infer<typeof OrderPaymentStatusSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type CreateOrderPayload = z.infer<typeof CreateOrderPayloadSchema>;
