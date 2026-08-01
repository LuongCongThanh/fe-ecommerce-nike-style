import { describe, expect, it } from 'vitest';

import { calculateDiscountPercent } from '@/app/[locale]/(shop)/_lib/utils/discount';

describe('calculateDiscountPercent', () => {
  it('returns rounded discount percent', () => {
    expect(calculateDiscountPercent(200000, 150000)).toBe(25);
  });

  it('returns zero when discounted price is not lower', () => {
    expect(calculateDiscountPercent(100000, 100000)).toBe(0);
  });

  it('returns zero when originalPrice is zero or negative', () => {
    expect(calculateDiscountPercent(0, 0)).toBe(0);
    expect(calculateDiscountPercent(-1, 0)).toBe(0);
  });
});
