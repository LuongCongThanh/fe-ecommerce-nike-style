/**
 * Product's shape is `@repo/schemas/catalog`'s — this module used to carry a rival `ProductSchema`
 * (numeric `id`, a `variants` array) that disagreed with it and that nothing imported. What is left
 * is the one genuinely app-side concept: the badge a product card may show.
 */
export type BadgeValue = 'best-seller' | 'new' | 'sale' | 'low-stock';
