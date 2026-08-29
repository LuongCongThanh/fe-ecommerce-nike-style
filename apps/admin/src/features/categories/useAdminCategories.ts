import { getAdminCategories } from '@repo/api-sdk/endpoints/admin-catalog';
import { useQuery } from '@tanstack/react-query';

export const adminCategoryKeys = {
  list: ['admin', 'categories'] as const,
};

export function useAdminCategories() {
  return useQuery({
    queryKey: adminCategoryKeys.list,
    queryFn: getAdminCategories,
  });
}
