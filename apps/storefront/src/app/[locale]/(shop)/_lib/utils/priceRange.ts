import type { Product } from '@repo/schemas/catalog';

export interface PriceRange {
  readonly min: number;
  readonly max: number;
  /** True when the Product's SKUs diverge in price — PLP should show "price from" (glossary.md — SKU). */
  readonly isRange: boolean;
}

export function getProductPriceRange(product: Product): PriceRange {
  const prices = product.skus.map((sku) => sku.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max, isRange: min !== max };
}
