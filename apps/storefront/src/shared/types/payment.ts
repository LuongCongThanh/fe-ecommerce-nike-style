import { z } from 'zod';

export const PaymentMethodSchema = z.enum(['cod', 'vnpay', 'momo', 'zalopay']);
export const PaymentStatusSchema = z.enum(['pending', 'paid', 'failed', 'refunded']);

export const PaymentResultSchema = z.object({
  orderId: z.string(),
  transactionId: z.string(),
  amount: z.number(),
  status: z.enum(['success', 'failed', 'pending']),
  method: PaymentMethodSchema,
  message: z.string().optional(),
  paidAt: z.string().optional(),
});

export const CheckoutPayloadSchema = z.object({
  cartItems: z.array(z.object({ productId: z.number(), quantity: z.number() })),
  shippingAddress: z.object({
    fullName: z.string(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
  }),
  paymentMethod: PaymentMethodSchema,
  note: z.string().optional(),
});

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type PaymentResult = z.infer<typeof PaymentResultSchema>;
export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;
