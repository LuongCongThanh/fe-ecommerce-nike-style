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
        title={category !== undefined ? `Sản phẩm: ${category}` : 'Tất cả sản phẩm'}
        subtitle={category !== undefined ? `Khám phá các sản phẩm trong danh mục ${category}` : 'Duyệt qua toàn bộ bộ sưu tập của chúng tôi'}
      />

      {isLoading ? (
        <p className="text-muted-foreground py-12 text-center">Đang tải sản phẩm…</p>
      ) : isError || data === undefined ? (
        <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-dashed text-center">
          <h3 className="text-lg font-medium">Không thể tải sản phẩm</h3>
          <p className="text-muted-foreground mt-1">Vui lòng thử lại sau.</p>
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
