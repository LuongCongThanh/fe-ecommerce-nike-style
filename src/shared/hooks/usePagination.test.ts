import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePagination } from '@/shared/hooks/usePagination';

describe('usePagination', () => {
  it('starts at page 1 and calculates total pages', () => {
    const { result } = renderHook(() => usePagination(101, 20));

    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(6);
  });

  it('clamps page to the valid range', () => {
    const { result } = renderHook(() => usePagination(100, 20));

    act(() => result.current.setPage(999));
    expect(result.current.page).toBe(5);

    act(() => result.current.setPage(0));
    expect(result.current.page).toBe(1);
  });

  it('exposes next and previous flags', () => {
    const { result } = renderHook(() => usePagination(100, 20));

    expect(result.current.hasPrev).toBe(false);
    expect(result.current.hasNext).toBe(true);

    act(() => result.current.setPage(5));

    expect(result.current.hasPrev).toBe(true);
    expect(result.current.hasNext).toBe(false);
  });
});
