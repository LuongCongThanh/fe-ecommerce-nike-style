'use client';

import { QueryState } from '@repo/shared/query-state';
import { SearchX } from 'lucide-react';

import { Pagination } from '@/app/[locale]/(shop)/_lib/components/common/Pagination';
import { CatalogProductGrid } from '@/app/[locale]/(shop)/_lib/components/products/CatalogProductGrid';
import { useProductSearchListing } from '@/app/[locale]/(shop)/_lib/hooks/products/useProductSearchListing';

export function SearchClient(): React.JSX.Element {
  const { data, isLoading, isError, refetch, query, onPageChange } = useProductSearchListing();

  return (
    <QueryState
      isLoading={isLoading}
      error={isError ? new Error('Không thể tìm kiếm sản phẩm') : null}
      onRetry={() => {
        refetch().catch(() => {
          /* error state already surfaced via isError */
        });
      }}
      errorTitle="Không thể tìm kiếm sản phẩm"
      errorDescription="Vui lòng thử lại sau."
    >
      {data === undefined ? null : data.data.length === 0 ? (
        <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-dashed text-center">
          <SearchX className="text-muted-foreground mb-4 size-10" />
          <h3 className="text-lg font-medium">Không tìm thấy kết quả nào cho "{query}"</h3>
          <p className="text-muted-foreground mt-1">Vui lòng kiểm tra lại chính tả hoặc thử với từ khóa khác.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Tìm thấy <span className="text-foreground font-medium">{data.meta.total}</span> sản phẩm phù hợp
            </p>
          </div>

          <CatalogProductGrid products={data.data} />

          {data.meta.totalPages > 1 && <Pagination currentPage={data.meta.page} totalPages={data.meta.totalPages} onPageChange={onPageChange} />}
        </div>
      )}
    </QueryState>
  );
}
