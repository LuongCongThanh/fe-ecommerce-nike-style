// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
'use client';

import { Pagination } from '@/app/[locale]/(shop)/_lib/components/common/Pagination';
import { CatalogProductGrid } from '@/app/[locale]/(shop)/_lib/components/products/CatalogProductGrid';
import { useCatalogListing } from '@/app/[locale]/(shop)/_lib/hooks/products/useCatalogListing';

interface CategoryClientProps {
  readonly categorySlug: string;
}

export function CategoryClient({ categorySlug }: CategoryClientProps): React.JSX.Element {
  const { data, isLoading, isError, onPageChange } = useCatalogListing(categorySlug);

  if (isLoading) {
    return <p className="text-muted-foreground py-16 text-center text-sm">Đang tải sản phẩm…</p>;
  }

  if (isError || data === undefined) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-1 rounded-xl border border-dashed py-16 text-center">
        <h3 className="text-lg font-semibold">Không thể tải sản phẩm</h3>
        <p className="text-muted-foreground text-sm">Vui lòng thử lại sau.</p>
      </div>
    );
  }

  if (data.data.length === 0) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-1 rounded-xl border border-dashed py-16 text-center">
        <h3 className="text-lg font-semibold">Không tìm thấy sản phẩm nào</h3>
        <p className="text-muted-foreground text-sm">Thử thay đổi bộ lọc để tìm thấy nhiều kết quả hơn.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CatalogProductGrid products={data.data} />
      {data.meta.totalPages > 1 && <Pagination currentPage={data.meta.page} totalPages={data.meta.totalPages} onPageChange={onPageChange} />}
    </div>
  );
}
