import { HydrationBoundary } from '@tanstack/react-query';
import { setRequestLocale } from 'next-intl/server';

import { toSearchParams } from '@/modules/catalog/catalogUrlState';
import { CategoryPageClient } from '@/modules/catalog/category-detail/components/CategoryPageClient';
import { prefetchCategoryListing } from '@/modules/catalog/server/prefetchCatalog';

interface CategoryPageProps {
  readonly params: Promise<{
    locale: string;
    slug: string;
  }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const dehydratedState = await prefetchCategoryListing(slug, toSearchParams(await searchParams));

  return (
    <HydrationBoundary state={dehydratedState}>
      <CategoryPageClient slug={slug} />
    </HydrationBoundary>
  );
}
