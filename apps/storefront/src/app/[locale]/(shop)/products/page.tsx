import { setRequestLocale } from 'next-intl/server';

import { FilterSidebar } from '@/app/[locale]/(shop)/_lib/components/categories/FilterSidebar';
import { PageShell } from '@/app/[locale]/(shop)/_lib/components/layout/PageShell';
import ProductsClient from '@/app/[locale]/(shop)/_lib/components/products/ProductsClient';

interface ProductsPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageShell.Browse>
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="w-full lg:w-64 lg:shrink-0">
          <FilterSidebar />
        </div>
        <div className="flex-1">
          <ProductsClient />
        </div>
      </div>
    </PageShell.Browse>
  );
}
