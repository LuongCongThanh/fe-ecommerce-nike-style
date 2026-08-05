'use client';

import { getProduct } from '@repo/api-sdk/endpoints/catalog';
import { useQuery } from '@tanstack/react-query';

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
