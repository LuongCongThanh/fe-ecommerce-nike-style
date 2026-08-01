import { z } from 'zod';

import { PaymentMethodSchema, PaymentStatusSchema } from '@/shared/types/payment';

export const OrderStatusSchema = z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']);

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
});

export const OrderListSchema = z.array(OrderSchema);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
