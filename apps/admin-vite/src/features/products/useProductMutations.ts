'use client';

import { createAdminProduct, deleteAdminProduct, updateAdminProduct } from '@repo/api-sdk/endpoints/admin-catalog';
import type { ProductInput } from '@repo/schemas/catalog';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const LIST_KEY = ['admin', 'products'];

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => createAdminProduct(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => updateAdminProduct(id, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminProduct(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}
