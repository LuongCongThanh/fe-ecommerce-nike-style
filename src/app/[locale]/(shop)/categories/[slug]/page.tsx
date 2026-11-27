import { HydrationBoundary } from '@tanstack/react-query';

import { toSearchParams } from '@/modules/catalog/catalogUrlState';
import { CategoryPageClient } from '@/modules/catalog/category-detail/components/CategoryPageClient';
import { prefetchCategoryListing } from '@/modules/catalog/server/prefetchCatalog';

interface CategoryPageProps {
  readonly params: Promise<{
    slug: string;
  }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const dehydratedState = await prefetchCategoryListing(slug, toSearchParams(await searchParams));

  return (
    <HydrationBoundary state={dehydratedState}>
      <CategoryPageClient slug={slug} />
    </HydrationBoundary>
  );
}
