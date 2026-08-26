// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
// Apple Design pass · §1 no spinner cliff between pages — the grid stays, and says it is working
'use client';

import { QueryState } from '@repo/shared/query-state';
import { cn } from '@repo/shared/utils';

import { Pagination } from '@/app/[locale]/(shop)/_lib/components/common/Pagination';
import { SectionHeading } from '@/app/[locale]/(shop)/_lib/components/common/SectionHeading';
import { CatalogProductGrid } from '@/app/[locale]/(shop)/_lib/components/products/CatalogProductGrid';
import { CatalogGridSkeleton } from '@/app/[locale]/(shop)/_lib/components/products/ProductSkeletons';
import { useCatalogListing } from '@/app/[locale]/(shop)/_lib/hooks/products/useCatalogListing';

export default function ProductsClient(): React.JSX.Element {
  const { data, isLoading, isPlaceholderData, error, refetch, categorySlug: category, onPageChange } = useCatalogListing();

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        title={category !== undefined ? `Sản phẩm: ${category}` : 'Tất cả sản phẩm'}
        subtitle={category !== undefined ? `Khám phá các sản phẩm trong danh mục ${category}` : 'Khám phá toàn bộ bộ sưu tập của chúng tôi'}
      />

      <QueryState
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        loadingFallback={<CatalogGridSkeleton />}
        errorTitle="Không thể tải sản phẩm"
        errorDescription="Vui lòng thử lại sau."
      >
        {data !== undefined ? (
          <>
            {/* The outgoing page recedes instead of disappearing — continuous feedback, not a gap. */}
            <div
              aria-busy={isPlaceholderData}
              className={cn('transition-opacity duration-(--duration-normal) ease-out', isPlaceholderData && 'pointer-events-none opacity-55')}
            >
              <CatalogProductGrid products={data.data} />
            </div>
            <span role="status" aria-live="polite" className="sr-only">
              {isPlaceholderData ? 'Đang tải sản phẩm...' : ''}
            </span>
            {data.meta.totalPages > 1 && <Pagination currentPage={data.meta.page} totalPages={data.meta.totalPages} onPageChange={onPageChange} />}
          </>
        ) : null}
      </QueryState>
    </div>
  );
}
