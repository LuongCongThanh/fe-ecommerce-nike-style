import { describe, expect, it } from 'vitest';

import { getVariantColorHex } from '@/app/[locale]/(shop)/_lib/utils/variantColor';

describe('getVariantColorHex', () => {
  it('maps a known color name to its hex value', () => {
    expect(getVariantColorHex('black')).toBe('#1a1a1a');
  });

  it('is case-insensitive', () => {
    expect(getVariantColorHex('Black')).toBe(getVariantColorHex('black'));
  });

  it('falls back to a neutral grey for null/undefined (no Color axis)', () => {
    expect(getVariantColorHex(null)).toBe('#9a9a9a');
    expect(getVariantColorHex(undefined)).toBe('#9a9a9a');
  });

  it('falls back to a neutral grey for an unrecognized color name', () => {
    expect(getVariantColorHex('mauve')).toBe('#9a9a9a');
  });
});
