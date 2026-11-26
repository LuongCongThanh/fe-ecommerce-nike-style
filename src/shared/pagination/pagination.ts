export type PageItem = number | 'ellipsis';

// 7 = first + "..." + 3 window pages + "..." + last (siblingCount = 1).
const MAX_FULL_PAGES = 7;

function range(from: number, to: number): number[] {
  return Array.from({ length: Math.max(to - from + 1, 0) }, (_, i) => from + i);
}

// Chỗ hở 1 trang thì hiện luôn số trang đó, vì "..." không ngắn hơn một nút số.
function fillGap(gapStart: number, gapSize: number): PageItem[] {
  if (gapSize >= 2) return ['ellipsis'];
  if (gapSize === 1) return [gapStart];
  return [];
}

export function getPageItems(currentPage: number, totalPages: number, siblingCount = 1): PageItem[] {
  if (totalPages <= MAX_FULL_PAGES) return range(1, totalPages);

  const current = Math.min(Math.max(currentPage, 1), totalPages);
  const start = Math.max(2, current - siblingCount);
  const end = Math.min(totalPages - 1, current + siblingCount);

  return [1, ...fillGap(2, start - 2), ...range(start, end), ...fillGap(end + 1, totalPages - 1 - end), totalPages];
}
