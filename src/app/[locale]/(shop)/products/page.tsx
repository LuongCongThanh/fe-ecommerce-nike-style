// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
import { setRequestLocale } from 'next-intl/server';

import { FilterSidebar } from '@/features/catalog/components/FilterSidebar';
import ProductsClient from '@/features/catalog/product-list/components/ProductsClient';
import { PageShell } from '@/features/storefront-shell/components/PageShell';

interface ProductsPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageShell.Browse>
      {/* Apple Design pass · the filters stay with the reader instead of scrolling away (§12). */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <div className="w-full lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:overscroll-contain">
          <FilterSidebar />
        </div>
        <div className="min-w-0 flex-1">
          <ProductsClient />
        </div>
      </div>
    </PageShell.Browse>
  );
}
