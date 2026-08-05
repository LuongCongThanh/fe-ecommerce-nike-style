import type { Sku } from '@repo/schemas/catalog';

export interface VariantAxes {
  /** Distinct Color values across a Product's SKUs, in first-seen order — empty when Color isn't a Variant axis for this Product. */
  readonly colors: string[];
  /** Distinct Size values across a Product's SKUs, in first-seen order — empty when Size isn't a Variant axis for this Product. */
  readonly sizes: string[];
}

export interface VariantSelection {
  readonly color?: string;
  readonly size?: string;
}

function distinctInOrder(values: Array<string | null>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (value === null || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

/** Which axes actually vary across a Product's SKUs (glossary.md — Variant is `{Color?, Size?}`, either axis may be absent or fixed to one value). */
export function getVariantAxes(skus: readonly Sku[]): VariantAxes {
  return {
    colors: distinctInOrder(skus.map((sku) => sku.color)),
    sizes: distinctInOrder(skus.map((sku) => sku.size)),
  };
}

/**
 * Resolves a Color/Size selection to exactly one SKU (FE-UNIT-002). A Product with no Variant (single
 * SKU, `color`/`size` both `null`) always resolves regardless of `selection` — "Add to cart" uses that
 * hidden SKU directly, no selection required (glossary.md — SKU). A Product with a Variant axis
 * requires that axis to be selected; an incomplete or non-existent combination resolves to `null`.
 */
export function resolveSku(skus: readonly Sku[], selection: VariantSelection): Sku | null {
  const axes = getVariantAxes(skus);
  const needsColor = axes.colors.length > 0;
  const needsSize = axes.sizes.length > 0;

  if (needsColor && selection.color === undefined) return null;
  if (needsSize && selection.size === undefined) return null;

  const match = skus.find((sku) => (!needsColor || sku.color === selection.color) && (!needsSize || sku.size === selection.size));

  return match ?? null;
}
