import { describe, expect, it } from 'vitest';

import { getPageItems } from '@/shared/utils/pagination';

describe('getPageItems', () => {
  it.each([
    { current: 1, total: 3, expected: [1, 2, 3] },
    { current: 4, total: 7, expected: [1, 2, 3, 4, 5, 6, 7] },
    { current: 1, total: 1, expected: [1] },
    { current: 1, total: 0, expected: [] },
  ])('returns every page when totalPages=$total is at most 7', ({ current, total, expected }) => {
    expect(getPageItems(current, total)).toEqual(expected);
  });

  it.each([
    { current: 1, total: 20, expected: [1, 2, 'ellipsis', 20] },
    { current: 10, total: 20, expected: [1, 'ellipsis', 9, 10, 11, 'ellipsis', 20] },
    { current: 20, total: 20, expected: [1, 'ellipsis', 19, 20] },
    { current: 4, total: 20, expected: [1, 2, 3, 4, 5, 'ellipsis', 20] },
    { current: 17, total: 20, expected: [1, 'ellipsis', 16, 17, 18, 19, 20] },
    { current: 2, total: 8, expected: [1, 2, 3, 'ellipsis', 8] },
  ])('windows page $current of $total with ellipses for gaps of two or more', ({ current, total, expected }) => {
    expect(getPageItems(current, total)).toEqual(expected);
  });

  it('widens the window with a larger siblingCount', () => {
    expect(getPageItems(10, 20, 2)).toEqual([1, 'ellipsis', 8, 9, 10, 11, 12, 'ellipsis', 20]);
  });

  it.each([
    { current: 0, expected: [1, 2, 'ellipsis', 20] },
    { current: 25, expected: [1, 'ellipsis', 19, 20] },
  ])('clamps out-of-range currentPage=$current into the page range', ({ current, expected }) => {
    expect(getPageItems(current, 20)).toEqual(expected);
  });

  it.each(Array.from({ length: 20 }, (_, i) => i + 1))('keeps the window invariants for page %i of 20', (current) => {
    const items = getPageItems(current, 20);
    const pages = items.filter((item): item is number => item !== 'ellipsis');

    expect(items[0]).toBe(1);
    expect(items.at(-1)).toBe(20);
    expect(pages).toContain(current);
    expect(items.length).toBeLessThanOrEqual(7);
    expect(pages).toEqual([...pages].sort((a, b) => a - b));
    items.forEach((item, index) => {
      if (item === 'ellipsis') expect(items[index + 1]).not.toBe('ellipsis');
    });
  });
});
