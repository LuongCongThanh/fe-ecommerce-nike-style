import { describe, expect, it } from 'vitest';

import type { Sku } from '@repo/schemas/catalog';

import { getVariantAxes, resolveSku } from '@/app/[locale]/(shop)/_lib/utils/variantResolution';

const noVariantSku: Sku[] = [{ id: 'sku-1', price: 100, stock: 10, color: null, size: null }];

const colorAndSizeSkus: Sku[] = [
  { id: 'sku-black-m', price: 100, stock: 5, color: 'black', size: 'm' },
  { id: 'sku-black-l', price: 100, stock: 0, color: 'black', size: 'l' },
  { id: 'sku-white-m', price: 110, stock: 3, color: 'white', size: 'm' },
];

const colorOnlySkus: Sku[] = [
  { id: 'sku-red', price: 50, stock: 4, color: 'red', size: null },
  { id: 'sku-blue', price: 50, stock: 0, color: 'blue', size: null },
];

const sizeOnlySkus: Sku[] = [
  { id: 'sku-s', price: 30, stock: 10, color: null, size: 's' },
  { id: 'sku-m', price: 30, stock: 2, color: null, size: 'm' },
];

describe('getVariantAxes (FE-UNIT-002)', () => {
  it('reports no axes for a Product with no Variant', () => {
    expect(getVariantAxes(noVariantSku)).toEqual({ colors: [], sizes: [] });
  });

  it('reports both axes for a Color x Size Variant, deduped and in first-seen order', () => {
    expect(getVariantAxes(colorAndSizeSkus)).toEqual({ colors: ['black', 'white'], sizes: ['m', 'l'] });
  });

  it('reports only the Color axis when Size is fixed to null across all SKUs', () => {
    expect(getVariantAxes(colorOnlySkus)).toEqual({ colors: ['red', 'blue'], sizes: [] });
  });

  it('reports only the Size axis when Color is fixed to null across all SKUs', () => {
    expect(getVariantAxes(sizeOnlySkus)).toEqual({ colors: [], sizes: ['s', 'm'] });
  });
});

describe('resolveSku (FE-UNIT-002)', () => {
  it('resolves the hidden SKU for a no-Variant Product with no selection needed', () => {
    expect(resolveSku(noVariantSku, {})).toBe(noVariantSku[0]);
  });

  it('resolves the exact SKU for a full, valid Color+Size selection', () => {
    expect(resolveSku(colorAndSizeSkus, { color: 'white', size: 'm' })).toBe(colorAndSizeSkus[2]);
  });

  it('returns null when only Color is selected but Size is also a required axis', () => {
    expect(resolveSku(colorAndSizeSkus, { color: 'black' })).toBeNull();
  });

  it('returns null when only Size is selected but Color is also a required axis', () => {
    expect(resolveSku(colorAndSizeSkus, { size: 'm' })).toBeNull();
  });

  it('returns null for no selection at all when the Product has Variant axes', () => {
    expect(resolveSku(colorAndSizeSkus, {})).toBeNull();
  });

  it('returns null for a Color+Size combination that does not exist among the SKUs', () => {
    expect(resolveSku(colorAndSizeSkus, { color: 'white', size: 'l' })).toBeNull();
  });

  it('resolves a Color-only Variant from just a Color selection', () => {
    expect(resolveSku(colorOnlySkus, { color: 'blue' })).toBe(colorOnlySkus[1]);
  });

  it('ignores an extraneous Size selection when the Product has no Size axis', () => {
    expect(resolveSku(colorOnlySkus, { color: 'red', size: 'xl' })).toBe(colorOnlySkus[0]);
  });

  it('resolves a Size-only Variant from just a Size selection', () => {
    expect(resolveSku(sizeOnlySkus, { size: 's' })).toBe(sizeOnlySkus[0]);
  });

  it('returns null for an unknown Color value', () => {
    expect(resolveSku(colorAndSizeSkus, { color: 'green', size: 'm' })).toBeNull();
  });
});
