import { describe, expect, it } from 'vitest';

import { buildQueryString, formatDate, formatDateTime, slugify, truncateText, validateVietnamesePhone } from '@/shared/utils/utils';

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

  it('skips unsupported objects inside arrays', () => {
    expect(buildQueryString({ tags: ['a', { id: 1 }, 'b'] })).toBe('tags=a&tags=b');
  });

  it('omits unsupported objects used as direct query values', () => {
    expect(buildQueryString({ filters: { category: 'shoes' } })).toBe('');
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
