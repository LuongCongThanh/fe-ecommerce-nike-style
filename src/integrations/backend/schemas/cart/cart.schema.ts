import { z } from 'zod';

/** A Cart line references a SKU directly, never a Product + loose Color/Size (glossary.md — CartItem). */
export const CartItemSchema = z.object({
  skuId: z.string(),
  quantity: z.number().int().min(1),
});

export type CartItem = z.infer<typeof CartItemSchema>;
