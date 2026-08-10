import { CategoryListResponseSchema, ProductDetailResponseSchema, ProductListRequestSchema, ProductListResponseSchema } from '@repo/schemas/catalog';
import type { CategoryListResponse, ProductDetailResponse, ProductListRequest, ProductListResponse } from '@repo/schemas/catalog';

import { apiClient } from '../client/fetcher';
import { API_BASE_URL } from '../env/config';

export async function getProducts(query: ProductListRequest = { page: 1, pageSize: 20, sort: 'newest' }): Promise<ProductListResponse> {
  const parsedQuery = ProductListRequestSchema.parse(query);
  const params: Record<string, unknown> = {
    page: parsedQuery.page,
    pageSize: parsedQuery.pageSize,
    sort: parsedQuery.sort,
    search: parsedQuery.search,
    category: parsedQuery.category,
    gender: parsedQuery.gender,
    minPrice: parsedQuery.minPrice,
    maxPrice: parsedQuery.maxPrice,
  };

  return apiClient.get<ProductListResponse>(`${API_BASE_URL}/api/catalog/products`, params, { schema: ProductListResponseSchema });
}

export async function getCategories(): Promise<CategoryListResponse> {
  return apiClient.get<CategoryListResponse>(`${API_BASE_URL}/api/catalog/categories`, undefined, { schema: CategoryListResponseSchema });
}

export async function getProduct(slug: string): Promise<ProductDetailResponse> {
  return apiClient.get<ProductDetailResponse>(`${API_BASE_URL}/api/catalog/products/${encodeURIComponent(slug)}`, undefined, {
    schema: ProductDetailResponseSchema,
  });
}
