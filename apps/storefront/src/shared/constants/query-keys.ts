export const QUERY_KEYS = {
  PRODUCTS: ['products'] as const,
  PRODUCT: (slug: string) => ['products', slug] as const,
  CATEGORIES: ['categories'] as const,
  ORDERS: ['orders'] as const,
  ORDER: (id: string | number) => ['orders', String(id)] as const,
  PROFILE: ['profile'] as const,
} as const;
