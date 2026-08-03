import { http, HttpResponse } from 'msw';

import type { Product } from '@repo/schemas/catalog';

const mockProducts: Product[] = [
  { id: '1', slug: 'air-max-90', name: 'Air Max 90', price: 129.99 },
  { id: '2', slug: 'air-force-1', name: 'Air Force 1', price: 109.99 },
];

/** MSW request handlers shared by both the browser worker and the node server — see ./`../testing`. */
export const handlers = [
  http.get('*/api/catalog/products', () => {
    return HttpResponse.json({
      data: mockProducts,
      meta: { page: 1, pageSize: 20, total: mockProducts.length, totalPages: 1 },
    });
  }),
];
