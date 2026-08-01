import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useProductFilters } from '@/app/[locale]/(shop)/_lib/hooks/products/useProductFilters';

describe('useProductFilters', () => {
  it('starts with default pagination filters', () => {
    const { result } = renderHook(() => useProductFilters());

    expect(result.current.filters).toEqual({ page: 1, pageSize: 20 });
  });

  it('accepts initial overrides', () => {
    const { result } = renderHook(() => useProductFilters({ page: 2, category: 'ao' }));

    expect(result.current.filters.page).toBe(2);
    expect(result.current.filters.category).toBe('ao');
  });

  it('resets page when a non-page filter changes', () => {
    const { result } = renderHook(() => useProductFilters({ page: 3 }));

    act(() => result.current.setFilter('search', 'áo'));

    expect(result.current.filters.search).toBe('áo');
    expect(result.current.filters.page).toBe(1);
  });

  it('keeps page when page is updated explicitly', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => result.current.setFilter('page', 4));

    expect(result.current.filters.page).toBe(4);
  });

  it('resets all filters to defaults', () => {
    const { result } = renderHook(() => useProductFilters({ page: 2, category: 'ao' }));

    act(() => result.current.resetFilters());

    expect(result.current.filters).toEqual({ page: 1, pageSize: 20 });
  });

  it('serializes defined filters to query string', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => result.current.setFilter('search', 'áo'));
    const queryString = result.current.toQueryString();

    expect(queryString).toContain('search=');
    expect(queryString).toContain('page=1');
    expect(queryString).not.toContain('category=');
  });
});
