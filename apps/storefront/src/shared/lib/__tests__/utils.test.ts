import { describe, expect, it } from 'vitest';

import {
  buildQueryString,
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  getDefaultPageSize,
  slugify,
  truncateText,
  validateVietnamesePhone,
} from '@/shared/lib/utils';

describe('cn', () => {
  it('merges tailwind classes, last wins on conflict', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('filters falsy values', () => {
    expect(cn('px-2', false, undefined, 'py-1')).toBe('px-2 py-1');
  });

  it('resolves padding conflict with arbitrary values', () => {
    expect(cn('p-4', 'px-2')).toBe('p-4 px-2');
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('keeps opacity modifier distinct from base color', () => {
    expect(cn('bg-primary', 'bg-primary/50')).toBe('bg-primary/50');
  });

  it('handles Tailwind v4 arbitrary value classes without stripping', () => {
    const result = cn('bg-[oklch(70%_0.2_30)]', 'text-sm');
    expect(result).toContain('bg-[oklch(70%_0.2_30)]');
    expect(result).toContain('text-sm');
  });

  it('resolves conflicting arbitrary background values, last wins', () => {
    expect(cn('bg-[#ff0000]', 'bg-[#00ff00]')).toBe('bg-[#00ff00]');
  });

  it('accepts conditional class objects', () => {
    expect(cn({ 'text-bold': true, 'text-italic': false }, 'px-1')).toBe('text-bold px-1');
  });
});

describe('formatCurrency', () => {
  it('formats number as VND', () => {
    expect(formatCurrency(100000)).toMatch(/100/);
    expect(formatCurrency(100000)).toMatch(/đ|VND|₫/i);
  });
});

describe('formatDate', () => {
  it('formats date string as dd/MM/yyyy', () => {
    expect(formatDate('2024-01-15')).toBe('15/01/2024');
  });

  it('accepts a Date object', () => {
    expect(formatDate(new Date('2024-06-01'))).toBe('01/06/2024');
  });
});

describe('formatDateTime', () => {
  it('formats date with time as HH:mm dd/MM/yyyy', () => {
    expect(formatDateTime('2024-01-15T10:30:00')).toBe('10:30 15/01/2024');
  });
});

describe('slugify', () => {
  it('converts Vietnamese text to ASCII slug', () => {
    expect(slugify('Áo thun nam')).toBe('ao-thun-nam');
  });

  it('collapses multiple separators and trims edges', () => {
    expect(slugify('  hello -- world!  ')).toBe('hello-world');
  });
});

describe('buildQueryString', () => {
  it('omits empty values', () => {
    expect(buildQueryString({ search: 'ao', category: '', page: 1, empty: undefined })).toBe('search=ao&page=1');
  });

  it('keeps boolean values when provided', () => {
    expect(buildQueryString({ inStock: false, page: 2 })).toBe('inStock=false&page=2');
  });

  it('appends each item in an array as a separate param', () => {
    expect(buildQueryString({ tags: ['a', 'b'], page: 1 })).toBe('tags=a&tags=b&page=1');
  });

  it('skips null and empty items inside arrays', () => {
    expect(buildQueryString({ tags: ['a', '', null, 'b'] })).toBe('tags=a&tags=b');
  });
});

describe('truncateText', () => {
  it('returns original text when shorter than maxLength', () => {
    expect(truncateText('ao thun', 20)).toBe('ao thun');
  });

  it('truncates long text and appends ellipsis', () => {
    expect(truncateText('ao thun tay dai', 10)).toBe('ao thun...');
  });

  it('returns empty string when maxLength is 0 or negative', () => {
    expect(truncateText('any text', 0)).toBe('');
    expect(truncateText('any text', -1)).toBe('');
  });
});

describe('validateVietnamesePhone', () => {
  it('accepts valid Vietnamese numbers', () => {
    expect(validateVietnamesePhone('0912345678')).toBe(true);
  });

  it('rejects invalid numbers', () => {
    expect(validateVietnamesePhone('12345')).toBe(false);
  });
});

describe('getDefaultPageSize', () => {
  it('returns the configured page size', () => {
    expect(getDefaultPageSize()).toBe(20);
  });
});
