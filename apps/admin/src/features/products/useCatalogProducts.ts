import { getProducts } from '@repo/api-sdk/endpoints/catalog';
import { useQuery } from '@tanstack/react-query';

export const catalogProductKeys = {
  summary: ['dashboard', 'products-summary'] as const,
};

/**
 * The whole public catalog in one request, shared by the dashboard's products card and the category
 * list's per-category product count. Both used to write this query key as a literal, which coupled
 * the two silently — this owns the key instead.
 */
export function useCatalogProducts() {
  return useQuery({
    queryKey: catalogProductKeys.summary,
    queryFn: () => getProducts(),
  });
}
