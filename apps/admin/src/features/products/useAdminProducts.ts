import { getAdminProducts } from '@repo/api-sdk/endpoints/admin-catalog';
import type { ProductListRequest } from '@repo/schemas/catalog';
import { useQuery } from '@tanstack/react-query';

export const adminProductKeys = {
  list: (query: Partial<ProductListRequest>) => ['admin', 'products', query] as const,
};

export function useAdminProducts(query: { page: number; pageSize: number; search?: string; category?: string }) {
  return useQuery({
    queryKey: adminProductKeys.list(query),
    queryFn: () => getAdminProducts({ page: query.page, pageSize: query.pageSize, search: query.search, category: query.category }),
  });
}
