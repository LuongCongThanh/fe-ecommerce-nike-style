'use client';

import { useQuery } from '@tanstack/react-query';

import { catalogKeys } from '@/features/catalog/queries/catalogKeys';
import { ApiError } from '@/lib/api/client/api-error';
import { getProductBySlug } from '@/lib/api/endpoints/catalog';

/** PDP lookup by slug. `null` means the API has no ACTIVE Product with that slug (404). */
export function useProduct(slug: string) {
  return useQuery({
    queryKey: catalogKeys.product(slug),
    queryFn: async () => {
      try {
        return await getProductBySlug(slug);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
  });
}
