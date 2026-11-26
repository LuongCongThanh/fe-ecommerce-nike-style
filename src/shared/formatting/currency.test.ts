import { describe, expect, it } from 'vitest';

import { formatCurrency } from '@/shared/formatting/currency';

describe('formatCurrency', () => {
  it('formats number as VND', () => {
    expect(formatCurrency(100000)).toMatch(/100/);
    expect(formatCurrency(100000)).toMatch(/đ|VND|₫/i);
  });
});
