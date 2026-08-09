'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Pagination } from '@/app/[locale]/(shop)/_lib/components/common/Pagination';
import { SectionHeading } from '@/app/[locale]/(shop)/_lib/components/common/SectionHeading';
import { CatalogProductGrid } from '@/app/[locale]/(shop)/_lib/components/products/CatalogProductGrid';
import { useProducts } from '@/app/[locale]/(shop)/_lib/hooks/products/useProducts';
import { parseCatalogFilters, withCatalogPage } from '@/app/[locale]/(shop)/_lib/utils/catalogUrlState';

export default function ProductsClient(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') ?? undefined;
  const filters = parseCatalogFilters(searchParams);

  const { data, isLoading, isError } = useProducts(category, filters);

  const handlePageChange = (page: number) => {
    router.push(`?${withCatalogPage(searchParams, page).toString()}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        title={category !== undefined ? `Products: ${category}` : 'All Products'}
        subtitle={category !== undefined ? `Discover products in the ${category} category` : 'Browse our entire collection'}
      />

      {isLoading ? (
        <p role="status" className="text-muted-foreground py-12 text-center">
          Loading products…
        </p>
      ) : isError || data === undefined ? (
        <div role="alert" className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-dashed text-center">
          <h3 className="text-lg font-medium">Unable to load products</h3>
          <p className="text-muted-foreground mt-1">Please try again later.</p>
        </div>
      ) : (
        <>
          <CatalogProductGrid products={data.data} />
          {data.meta.totalPages > 1 && <Pagination currentPage={data.meta.page} totalPages={data.meta.totalPages} onPageChange={handlePageChange} />}
        </>
      )}
    </div>
  );
}
