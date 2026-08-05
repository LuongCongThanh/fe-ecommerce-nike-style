import { CategoryListResponseSchema, ProductDetailResponseSchema, ProductListRequestSchema, ProductListResponseSchema } from '@repo/schemas/catalog';
import type { CategoryListResponse, ProductDetailResponse, ProductListRequest, ProductListResponse } from '@repo/schemas/catalog';

import { fetcher } from '../client/fetcher';
import { API_BASE_URL } from '../env/config';

export async function getProducts(query: ProductListRequest = { page: 1, pageSize: 20, sort: 'newest' }): Promise<ProductListResponse> {
  const parsedQuery = ProductListRequestSchema.parse(query);
  const params = new URLSearchParams({
    page: String(parsedQuery.page),
    pageSize: String(parsedQuery.pageSize),
    sort: parsedQuery.sort,
  });
  if (parsedQuery.search !== undefined) params.set('search', parsedQuery.search);
  if (parsedQuery.category !== undefined) params.set('category', parsedQuery.category);
  if (parsedQuery.gender !== undefined) params.set('gender', parsedQuery.gender);
  if (parsedQuery.minPrice !== undefined) params.set('minPrice', String(parsedQuery.minPrice));
  if (parsedQuery.maxPrice !== undefined) params.set('maxPrice', String(parsedQuery.maxPrice));

  const data = await fetcher<unknown>(`${API_BASE_URL}/api/catalog/products?${params.toString()}`);

  return ProductListResponseSchema.parse(data);
}

export async function getCategories(): Promise<CategoryListResponse> {
  const data = await fetcher<unknown>(`${API_BASE_URL}/api/catalog/categories`);

  return CategoryListResponseSchema.parse(data);
}

export async function getProduct(slug: string): Promise<ProductDetailResponse> {
  const data = await fetcher<unknown>(`${API_BASE_URL}/api/catalog/products/${encodeURIComponent(slug)}`);

  return ProductDetailResponseSchema.parse(data);
}
