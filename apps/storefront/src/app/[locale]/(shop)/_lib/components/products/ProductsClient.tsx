// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { QueryState } from '@repo/shared/query-state';

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

  const { data, isLoading, error, refetch } = useProducts(category, filters);

  const handlePageChange = (page: number) => {
    router.push(`?${withCatalogPage(searchParams, page).toString()}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        title={category !== undefined ? `Sản phẩm: ${category}` : 'Tất cả sản phẩm'}
        subtitle={category !== undefined ? `Khám phá các sản phẩm trong danh mục ${category}` : 'Khám phá toàn bộ bộ sưu tập của chúng tôi'}
      />

      <QueryState isLoading={isLoading} error={error} onRetry={refetch} errorTitle="Không thể tải sản phẩm" errorDescription="Vui lòng thử lại sau.">
        {data !== undefined ? (
          <>
            <CatalogProductGrid products={data.data} />
            {data.meta.totalPages > 1 && (
              <Pagination currentPage={data.meta.page} totalPages={data.meta.totalPages} onPageChange={handlePageChange} />
            )}
          </>
        ) : null}
      </QueryState>
    </div>
  );
}
