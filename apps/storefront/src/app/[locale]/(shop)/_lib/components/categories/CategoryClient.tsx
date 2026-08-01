'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Pagination } from '@/app/[locale]/(shop)/_lib/components/common/Pagination';
import { ProductGrid } from '@/app/[locale]/(shop)/_lib/components/common/ProductGrid';
import type { SortBy } from '@/app/[locale]/(shop)/_lib/hooks/products/useProducts';
import { useProducts } from '@/app/[locale]/(shop)/_lib/hooks/products/useProducts';

interface CategoryClientProps {
  readonly categorySlug: string;
}

export function CategoryClient({ categorySlug }: CategoryClientProps): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageParam = searchParams.get('page');
  const page = pageParam !== null ? Math.max(1, Number(pageParam)) : 1;

  const sortByParam = searchParams.get('sortBy');
  const sortBy = (sortByParam as SortBy | null) !== null ? (sortByParam as SortBy) : 'newest';

  const minPriceParam = searchParams.get('minPrice');
  const minPrice = minPriceParam !== null ? Number(minPriceParam) : undefined;

  const maxPriceParam = searchParams.get('maxPrice');
  const maxPrice = maxPriceParam !== null ? Number(maxPriceParam) : undefined;

  const { products, totalPages } = useProducts({
    categorySlug,
    page,
    pageSize: 12,
    sortBy,
    minPrice,
    maxPrice,
  });

  const handlePageChange = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', p.toString());
    router.push(`?${params.toString()}`);
  };

  if (products.length === 0) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-dashed text-center">
        <h3 className="text-lg font-medium">Không tìm thấy sản phẩm nào</h3>
        <p className="text-muted-foreground mt-1">Thử thay đổi bộ lọc để tìm thấy nhiều kết quả hơn.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProductGrid products={products} />
      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />}
    </div>
  );
}
