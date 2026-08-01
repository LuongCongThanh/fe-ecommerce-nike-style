import { API } from '@/shared/constants/api-endpoints';
import { http } from '@/shared/lib/http/client';
import type { Product, ProductList } from '@/shared/types/product';

export const productActions = {
  list: async (filters: object) => http.get<ProductList>(API.PRODUCTS.LIST, filters),
  detail: async (slug: string) => http.get<Product>(API.PRODUCTS.DETAIL(slug)),
  categories: async () => http.get<Array<{ id: number; name: string; slug: string }>>(API.PRODUCTS.CATEGORIES),
};
