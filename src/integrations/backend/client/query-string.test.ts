import { describe, expect, it } from 'vitest';

import { withQueryString } from '@/integrations/backend/client/query-string';

describe('withQueryString', () => {
  it('returns the url untouched without params or with only empty values', () => {
    expect(withQueryString('/x')).toBe('/x');
    expect(withQueryString('/x', { a: undefined, b: null })).toBe('/x');
  });

  it('repeats array keys and stringifies scalars', () => {
    expect(withQueryString('/x', { page: 2, size: ['M', 'L'], q: 'a b' })).toBe('/x?page=2&size=M&size=L&q=a+b');
  });

  it('appends to an existing query', () => {
    expect(withQueryString('/x?a=1', { b: true })).toBe('/x?a=1&b=true');
  });
});
