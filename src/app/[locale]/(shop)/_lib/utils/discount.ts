export function calculateDiscountPercent(originalPrice: number, discountedPrice: number): number {
  if (originalPrice <= 0 || discountedPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

export interface DiscountInfo {
  readonly hasDiscount: boolean;
  readonly finalPrice: number;
  readonly discountPercent: number;
}

/**
 * Single source of truth for "is this product discounted, and what does it cost now" — shared by
 * `PriceDisplay` and `ProductCard` so the rule can't drift between the two implementations
 * (homepage-improvement-plan.md P1-2).
 */
export function resolveDiscount(price: number, salePrice?: number | null): DiscountInfo {
  const hasDiscount = typeof salePrice === 'number' && salePrice > 0 && salePrice < price;
  const finalPrice = hasDiscount ? salePrice : price;
  const discountPercent = hasDiscount ? calculateDiscountPercent(price, salePrice) : 0;

  return { hasDiscount, finalPrice, discountPercent };
}
