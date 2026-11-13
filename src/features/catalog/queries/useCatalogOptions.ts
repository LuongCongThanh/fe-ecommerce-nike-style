'use client';

import { useQuery } from '@tanstack/react-query';

import { catalogKeys } from '@/features/catalog/queries/catalogKeys';
import { getColors, getSizes } from '@/lib/api/endpoints/catalog';

/** Sizes and colors for the PLP filter — the shared lists the back office manages (BR-CAT-11). */
export function useCatalogOptions() {
  const sizes = useQuery({ queryKey: catalogKeys.sizes(), queryFn: getSizes, staleTime: 10 * 60_000 });
  const colors = useQuery({ queryKey: catalogKeys.colors(), queryFn: getColors, staleTime: 10 * 60_000 });
  return { sizes: sizes.data ?? [], colors: colors.data ?? [] };
}
