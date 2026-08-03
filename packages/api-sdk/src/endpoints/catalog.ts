import { ProductListRequestSchema, ProductListResponseSchema } from '@repo/schemas/catalog';
import type { ProductListRequest, ProductListResponse } from '@repo/schemas/catalog';

import { fetcher } from '../client/fetcher';
import { API_BASE_URL } from '../env/config';

export async function getProducts(query: ProductListRequest = { page: 1, pageSize: 20 }): Promise<ProductListResponse> {
  const parsedQuery = ProductListRequestSchema.parse(query);
  const params = new URLSearchParams({
    page: String(parsedQuery.page),
    pageSize: String(parsedQuery.pageSize),
  });
  if (parsedQuery.search) params.set('search', parsedQuery.search);

  const data = await fetcher<unknown>(`${API_BASE_URL}/api/catalog/products?${params.toString()}`);

  return ProductListResponseSchema.parse(data);
}
