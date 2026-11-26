import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ProductDetail } from '@/integrations/backend/models/catalog';
import { useVariantSelection } from '@/modules/catalog/product-detail/hooks/useVariantSelection';

const white = { id: 'c-w', code: 'WHT', name: 'White', hex: '#fff' };
const black = { id: 'c-b', code: 'BLK', name: 'Black', hex: '#000' };
const sizeM = { id: 's-m', code: 'M', name: 'M' };
const sizeL = { id: 's-l', code: 'L', name: 'L' };

function product(overrides: Partial<ProductDetail> = {}): ProductDetail {
  return {
    id: 'p1',
    slug: 'air-max',
    name: 'Air Max',
    description: '',
    categoryId: 'cat',
    gender: 'MEN',
    variants: [
      { id: 'v1', sku: 'a', price: 100, size: sizeM, color: white },
      { id: 'v2', sku: 'b', price: 120, size: sizeL, color: white },
      { id: 'v3', sku: 'c', price: 100, size: sizeM, color: black },
    ],
    images: [
      { id: 'i1', url: '/w1.jpg', colorId: 'c-w', isPrimary: false, altText: null },
      { id: 'i2', url: '/w2.jpg', colorId: 'c-w', isPrimary: true, altText: null },
      { id: 'i3', url: '/b1.jpg', colorId: 'c-b', isPrimary: true, altText: null },
    ],
    ...overrides,
  };
}

describe('useVariantSelection', () => {
  it('resolves a Variant only once both axes are chosen', () => {
    const { result } = renderHook(() => useVariantSelection(product()));
    expect(result.current.selectedVariant).toBeNull();

    act(() => {
      result.current.selectColor('WHT');
    });
    expect(result.current.selectedVariant).toBeNull();

    act(() => {
      result.current.selectSize('L');
    });
    expect(result.current.selectedVariant?.id).toBe('v2');
  });

  it('yields no Variant for a color and size pair that does not exist', () => {
    const { result } = renderHook(() => useVariantSelection(product()));
    act(() => {
      result.current.selectColor('BLK');
      result.current.selectSize('L');
    });
    expect(result.current.selectedVariant).toBeNull();
  });

  it('follows the chosen color for images, primary first, and falls back to all images', () => {
    const { result } = renderHook(() => useVariantSelection(product()));
    expect(result.current.images).toEqual(['/w2.jpg', '/b1.jpg', '/w1.jpg']);

    act(() => {
      result.current.selectColor('WHT');
    });
    expect(result.current.images).toEqual(['/w2.jpg', '/w1.jpg']);
  });

  it('pre-selects an axis with a single value and reports the price range', () => {
    const single = product({ variants: [{ id: 'v1', sku: 'a', price: 100, size: sizeM, color: white }] });
    const { result } = renderHook(() => useVariantSelection(single));
    expect(result.current.selectedVariant?.id).toBe('v1');
    expect(result.current.isRange).toBe(false);

    const range = renderHook(() => useVariantSelection(product()));
    expect(range.result.current.minPrice).toBe(100);
    expect(range.result.current.isRange).toBe(true);
  });

  it('shows the placeholder when the Product has no images', () => {
    const { result } = renderHook(() => useVariantSelection(product({ images: [] })));
    expect(result.current.images).toEqual(['/images/products/placeholder.jpg']);
  });
});
