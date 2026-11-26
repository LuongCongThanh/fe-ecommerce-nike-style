import { z } from 'zod';

export const WishlistItemSchema = z.object({
  productId: z.string(),
});

export type WishlistItem = z.infer<typeof WishlistItemSchema>;
