import { createAdminCategory, deleteAdminCategory, updateAdminCategory } from '@repo/api-sdk/endpoints/admin-catalog';
import type { CategoryInput } from '@repo/schemas/catalog';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminCategoryKeys } from './useAdminCategories';

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) => createAdminCategory(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminCategoryKeys.list });
    },
  });
}

export function useUpdateCategory(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) => updateAdminCategory(id, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminCategoryKeys.list });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminCategory(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminCategoryKeys.list });
    },
  });
}
