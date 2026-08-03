import { z } from 'zod';

export const PlaceOrderRequestSchema = z.object({
  cartId: z.string(),
  shippingAddress: z.object({
    line1: z.string(),
    city: z.string(),
    phone: z.string(),
  }),
});

export const OrderResponseSchema = z.object({
  orderId: z.string(),
  status: z.enum(['pending', 'confirmed', 'cancelled']),
});

export type PlaceOrderRequest = z.infer<typeof PlaceOrderRequestSchema>;
export type OrderResponse = z.infer<typeof OrderResponseSchema>;
