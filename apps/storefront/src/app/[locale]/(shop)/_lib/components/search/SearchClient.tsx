'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Pagination } from '@/app/[locale]/(shop)/_lib/components/common/Pagination';
import { CatalogProductGrid } from '@/app/[locale]/(shop)/_lib/components/products/CatalogProductGrid';
import { useProductSearch } from '@/app/[locale]/(shop)/_lib/hooks/products/useProductSearch';

export function SearchClient(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const pageParam = searchParams.get('page');
  const page = pageParam !== null ? Math.max(1, Number(pageParam)) : 1;

  const { data, isLoading, isError } = useProductSearch(query, page);

  const handlePageChange = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', p.toString());
    router.push(`?${params.toString()}`);
  };

  if (isLoading) {
    return <p className="text-muted-foreground py-12 text-center">Đang tìm kiếm…</p>;
  }

  if (isError || data === undefined) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-dashed text-center">
        <h3 className="text-lg font-medium">Không thể tìm kiếm sản phẩm</h3>
        <p className="text-muted-foreground mt-1">Vui lòng thử lại sau.</p>
      </div>
    );
  }

  if (data.data.length === 0) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-dashed text-center">
        <div className="mb-4 text-4xl">🔍</div>
        <h3 className="text-lg font-medium">Không tìm thấy kết quả nào cho "{query}"</h3>
        <p className="text-muted-foreground mt-1">Vui lòng kiểm tra lại chính tả hoặc thử với từ khóa khác.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Tìm thấy <span className="text-foreground font-medium">{data.meta.total}</span> sản phẩm phù hợp
        </p>
      </div>

      <CatalogProductGrid products={data.data} />

      {data.meta.totalPages > 1 && <Pagination currentPage={data.meta.page} totalPages={data.meta.totalPages} onPageChange={handlePageChange} />}
    </div>
  );
}
