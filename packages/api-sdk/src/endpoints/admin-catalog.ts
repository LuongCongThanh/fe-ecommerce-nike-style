import { ProductListResponseSchema, ProductSchema } from '@repo/schemas/catalog';
import type { Product, ProductInput, ProductListRequest, ProductListResponse } from '@repo/schemas/catalog';

import { apiClient } from '../client/fetcher';
import { API_BASE_URL } from '../env/config';

const ADMIN_CATALOG_API = {
  PRODUCTS: `${API_BASE_URL}/api/admin/products/`,
  PRODUCT: (id: string) => `${API_BASE_URL}/api/admin/products/${id}/`,
} as const;

/** Admin's product table (issue #19) — same `Product`/`ProductListResponse` shapes the public PLP
 * uses, but a privileged, Staff-only endpoint (mock: requires a valid Staff `Authorization` header). */
export async function getAdminProducts(
  query: Omit<ProductListRequest, 'sort'> & { sort?: ProductListRequest['sort'] },
): Promise<ProductListResponse> {
  return apiClient.get<ProductListResponse>(
    ADMIN_CATALOG_API.PRODUCTS,
    {
      page: query.page,
      pageSize: query.pageSize,
      sort: query.sort,
      search: query.search,
      category: query.category,
      gender: query.gender,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
    },
    { schema: ProductListResponseSchema },
  );
}

export async function getAdminProduct(id: string): Promise<Product> {
  return apiClient.get<Product>(ADMIN_CATALOG_API.PRODUCT(id), undefined, { schema: ProductSchema });
}

export async function createAdminProduct(input: ProductInput): Promise<Product> {
  return apiClient.post<Product>(ADMIN_CATALOG_API.PRODUCTS, input, { schema: ProductSchema });
}

export async function updateAdminProduct(id: string, input: ProductInput): Promise<Product> {
  return apiClient.patch<Product>(ADMIN_CATALOG_API.PRODUCT(id), input, { schema: ProductSchema });
}

export async function deleteAdminProduct(id: string): Promise<void> {
  await apiClient.delete<unknown>(ADMIN_CATALOG_API.PRODUCT(id));
}
