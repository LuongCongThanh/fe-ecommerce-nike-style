'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Pagination } from '@/app/[locale]/(shop)/_lib/components/common/Pagination';
import { CatalogProductGrid } from '@/app/[locale]/(shop)/_lib/components/products/CatalogProductGrid';
import { useProducts } from '@/app/[locale]/(shop)/_lib/hooks/products/useProducts';
import { parseCatalogFilters, withCatalogPage } from '@/app/[locale]/(shop)/_lib/utils/catalogUrlState';

interface CategoryClientProps {
  readonly categorySlug: string;
}

export function CategoryClient({ categorySlug }: CategoryClientProps): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseCatalogFilters(searchParams);

  const { data, isLoading, isError } = useProducts(categorySlug, filters);

  const handlePageChange = (page: number) => {
    router.push(`?${withCatalogPage(searchParams, page).toString()}`);
  };

  if (isLoading) {
    return <p className="text-muted-foreground py-12 text-center">Đang tải sản phẩm…</p>;
  }

  if (isError || data === undefined) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-dashed text-center">
        <h3 className="text-lg font-medium">Không thể tải sản phẩm</h3>
        <p className="text-muted-foreground mt-1">Vui lòng thử lại sau.</p>
      </div>
    );
  }

  if (data.data.length === 0) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-dashed text-center">
        <h3 className="text-lg font-medium">Không tìm thấy sản phẩm nào</h3>
        <p className="text-muted-foreground mt-1">Thử thay đổi bộ lọc để tìm thấy nhiều kết quả hơn.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CatalogProductGrid products={data.data} />
      {data.meta.totalPages > 1 && <Pagination currentPage={data.meta.page} totalPages={data.meta.totalPages} onPageChange={handlePageChange} />}
    </div>
  );
}
