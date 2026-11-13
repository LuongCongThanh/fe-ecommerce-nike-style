'use client';

import { useQuery } from '@tanstack/react-query';

import { getProduct } from '@/lib/api/endpoints/catalog';
import { ensureApiMockingReady } from '@/shared/lib/api-mocking';

/** PDP product lookup — backed by `packages/api-sdk` (MSW mock today). Client-driven per Decision #87. */
export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['catalog', 'product', slug],
    queryFn: async () => {
      await ensureApiMockingReady();
      const { data } = await getProduct(slug);
      return data;
    },
  });
}
