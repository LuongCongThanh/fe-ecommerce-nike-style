import type { CatalogFilters } from '@/app/[locale]/(shop)/_lib/utils/catalogUrlState';

export const catalogKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  products: (categorySlug: string | undefined, filters: CatalogFilters) => [...catalogKeys.all, 'products', categorySlug, filters] as const,
  search: (query: string, page: number) => [...catalogKeys.all, 'search', query, page] as const,
};
