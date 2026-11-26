// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
import { HydrationBoundary } from '@tanstack/react-query';
import { setRequestLocale } from 'next-intl/server';

import { toSearchParams } from '@/modules/catalog/catalogUrlState';
import { FilterSidebar } from '@/modules/catalog/components/FilterSidebar';
import ProductsClient from '@/modules/catalog/product-list/components/ProductsClient';
import { prefetchProductsListing } from '@/modules/catalog/server/prefetchCatalog';
import { PageShell } from '@/shared/components/PageShell';

interface ProductsPageProps {
  readonly params: Promise<{ locale: string }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const dehydratedState = await prefetchProductsListing(toSearchParams(await searchParams));

  return (
    <HydrationBoundary state={dehydratedState}>
      <PageShell.Browse className="py-6 md:py-10">
        <div className="border-border/80 flex flex-col border-y lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
          <div className="border-border/80 w-full border-b lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:overscroll-contain lg:border-r lg:border-b-0">
            <FilterSidebar />
          </div>
          <div className="min-w-0 px-0 py-7 lg:px-8 lg:py-10">
            <ProductsClient />
          </div>
        </div>
      </PageShell.Browse>
    </HydrationBoundary>
  );
}
