import type { ProductQuery } from '@/lib/api/models/catalog';

export const catalogKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  sizes: () => [...catalogKeys.all, 'sizes'] as const,
  colors: () => [...catalogKeys.all, 'colors'] as const,
  products: (query: ProductQuery) => [...catalogKeys.all, 'products', query] as const,
  product: (slug: string) => [...catalogKeys.all, 'product', slug] as const,
  search: (query: string, page: number) => [...catalogKeys.all, 'search', query, page] as const,
};
