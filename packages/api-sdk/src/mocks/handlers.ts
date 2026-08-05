import { http, HttpResponse } from 'msw';

import type { Product } from '@repo/schemas/catalog';

import { minSkuPrice, mockCategories, mockProducts, resolveCategoryIds } from './catalog-fixtures';

function sortProducts(products: Product[], sort: string): Product[] {
  const sorted = [...products];
  if (sort === 'price_asc') return sorted.sort((a, b) => minSkuPrice(a) - minSkuPrice(b));
  if (sort === 'price_desc') return sorted.sort((a, b) => minSkuPrice(b) - minSkuPrice(a));
  // 'newest' — mock has no createdAt, fall back to stable insertion order reversed.
  return sorted.reverse();
}

/** MSW request handlers shared by both the browser worker and the node server — see ./`../testing`. */
export const handlers = [
  http.get('*/api/catalog/categories', () => {
    return HttpResponse.json({ data: mockCategories });
  }),

  http.get('*/api/catalog/products', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const gender = url.searchParams.get('gender');
    const search = url.searchParams.get('search');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const sort = url.searchParams.get('sort') ?? 'newest';
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');

    let filtered = mockProducts.slice();

    if (category !== null && category !== '') {
      const categoryIds = new Set(resolveCategoryIds(mockCategories, category));
      filtered = filtered.filter((p) => categoryIds.has(p.categoryId));
    }
    if (gender !== null && gender !== '') {
      filtered = filtered.filter((p) => p.gender === gender);
    }
    if (search !== null && search !== '') {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (minPrice !== null && minPrice !== '') {
      filtered = filtered.filter((p) => minSkuPrice(p) >= Number(minPrice));
    }
    if (maxPrice !== null && maxPrice !== '') {
      filtered = filtered.filter((p) => minSkuPrice(p) <= Number(maxPrice));
    }

    filtered = sortProducts(filtered, sort);

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json({ data, meta: { page, pageSize, total, totalPages } });
  }),
];
