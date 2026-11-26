'use client';

import { useQuery } from '@tanstack/react-query';

import { getColors, getSizes } from '@/integrations/backend/endpoints/catalog';
import { catalogKeys } from '@/modules/catalog/queries/catalogKeys';
import { CATALOG_REFERENCE_STALE_TIME } from '@/modules/catalog/queries/catalogQuery';

/** Sizes and colors for the PLP filter — the shared lists the back office manages (BR-CAT-11). */
export function useCatalogOptions() {
  const sizes = useQuery({ queryKey: catalogKeys.sizes(), queryFn: getSizes, staleTime: CATALOG_REFERENCE_STALE_TIME });
  const colors = useQuery({ queryKey: catalogKeys.colors(), queryFn: getColors, staleTime: CATALOG_REFERENCE_STALE_TIME });
  return { sizes: sizes.data ?? [], colors: colors.data ?? [] };
}
