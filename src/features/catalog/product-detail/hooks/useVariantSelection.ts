'use client';

import { useState } from 'react';

import type { ColorOption, ProductDetail, ProductVariant, SizeOption } from '@/lib/api/models/catalog';

const PLACEHOLDER_IMAGE = '/images/products/placeholder.jpg';

function distinctById<T extends { id: string }>(items: readonly T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

/**
 * PDP Variant choice: every Variant is one size × one color (BR-CAT-02), so a Variant resolves once
 * both axes are picked. An axis with a single value is pre-selected. Images follow the chosen color
 * (BR-CAT-05); a color without images falls back to all of the Product's images.
 */
export function useVariantSelection(product: ProductDetail) {
  const colors: ColorOption[] = distinctById(product.variants.map((v) => v.color));
  const sizes: SizeOption[] = distinctById(product.variants.map((v) => v.size));
  const [colorCode, setColorCode] = useState<string | undefined>(colors.length === 1 ? colors[0]?.code : undefined);
  const [sizeCode, setSizeCode] = useState<string | undefined>(sizes.length === 1 ? sizes[0]?.code : undefined);

  const selectedColor = colors.find((c) => c.code === colorCode);
  const selectedVariant: ProductVariant | null = product.variants.find((v) => v.color.code === colorCode && v.size.code === sizeCode) ?? null;

  const colorImages = selectedColor === undefined ? [] : product.images.filter((image) => image.colorId === selectedColor.id);
  const shown = colorImages.length > 0 ? colorImages : product.images;
  const images =
    shown.length > 0 ? [...shown].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary)).map((image) => image.url) : [PLACEHOLDER_IMAGE];

  const prices = product.variants.map((v) => v.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const isRange = prices.some((p) => p !== minPrice);

  return {
    colors,
    sizes,
    colorCode,
    sizeCode,
    selectedColor,
    selectedVariant,
    images,
    minPrice,
    isRange,
    selectColor: setColorCode,
    selectSize: setSizeCode,
  };
}

export type VariantSelectionState = ReturnType<typeof useVariantSelection>;
