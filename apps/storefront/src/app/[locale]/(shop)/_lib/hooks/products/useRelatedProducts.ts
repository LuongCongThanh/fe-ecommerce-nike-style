'use client';

import type { Product } from '@repo/schemas/catalog';

import { useCategoryTree } from '@/app/[locale]/(shop)/_lib/hooks/categories/useCategoryTree';
import { useProducts } from '@/app/[locale]/(shop)/_lib/hooks/products/useProducts';

const RELATED_LIMIT = 4;

/** Other Products in the same leaf Category, excluding the current one — reuses the PLP query/hooks rather than a dedicated endpoint. */
export function useRelatedProducts(categoryId: string | undefined, excludeSlug: string): { related: Product[]; isLoading: boolean } {
  const { data: categories, isLoading: isCategoriesLoading } = useCategoryTree();
  const categorySlug = categories?.find((c) => c.id === categoryId)?.slug;

  const { data, isLoading: isProductsLoading } = useProducts(categorySlug, { sortBy: 'newest', page: 1 }, { enabled: categorySlug !== undefined });

  const related = (data?.data ?? []).filter((p) => p.slug !== excludeSlug).slice(0, RELATED_LIMIT);

  return { related, isLoading: isCategoriesLoading || isProductsLoading };
}
