import { getProducts } from '@repo/api-sdk/endpoints/catalog';
import { useQuery } from '@tanstack/react-query';

export const catalogProductKeys = {
  summary: ['catalog', 'products-summary'] as const,
};

/**
 * The whole public catalog in one request. Admin and CMS both use this for a dashboard summary card
 * and admin also uses it for the category list's per-category product count — this owns the query
 * key so consumers don't write it as a literal and couple silently.
 */
export function useCatalogProducts() {
  return useQuery({
    queryKey: catalogProductKeys.summary,
    queryFn: () => getProducts(),
  });
}
