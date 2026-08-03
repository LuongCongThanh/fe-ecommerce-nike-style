import { z } from 'zod';

export const WishlistItemSchema = z.object({
  productId: z.string(),
});

export const AddWishlistItemRequestSchema = WishlistItemSchema;

export const WishlistResponseSchema = z.object({
  items: z.array(WishlistItemSchema),
});

export type WishlistItem = z.infer<typeof WishlistItemSchema>;
export type AddWishlistItemRequest = z.infer<typeof AddWishlistItemRequestSchema>;
export type WishlistResponse = z.infer<typeof WishlistResponseSchema>;
