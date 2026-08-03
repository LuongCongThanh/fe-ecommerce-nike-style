import { z } from 'zod';

export const CartItemSchema = z.object({
  productId: z.string(),
  sku: z.string(),
  quantity: z.number().int().min(1),
});

export const AddCartItemRequestSchema = CartItemSchema;

export const CartResponseSchema = z.object({
  id: z.string(),
  items: z.array(CartItemSchema),
  total: z.number(),
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type AddCartItemRequest = z.infer<typeof AddCartItemRequestSchema>;
export type CartResponse = z.infer<typeof CartResponseSchema>;
