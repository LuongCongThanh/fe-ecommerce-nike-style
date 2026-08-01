'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Pagination } from '@/app/[locale]/(shop)/_lib/components/common/Pagination';
import { ProductGrid } from '@/app/[locale]/(shop)/_lib/components/common/ProductGrid';
import { SectionHeading } from '@/app/[locale]/(shop)/_lib/components/common/SectionHeading';
import type { SortBy } from '@/app/[locale]/(shop)/_lib/hooks/products/useProducts';
import { useProducts } from '@/app/[locale]/(shop)/_lib/hooks/products/useProducts';

interface ProductsClientProps {
  readonly category?: string;
  readonly sortBy?: string;
  readonly page?: string;
}

export default function ProductsClient({ category, sortBy: sortByProp, page: pageProp }: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sortBy = (sortByProp as SortBy | undefined) ?? 'newest';
  const page = pageProp !== undefined ? Math.max(1, parseInt(pageProp)) : 1;

  const { products, totalPages } = useProducts({
    categorySlug: category,
    sortBy,
    pageSize: 12,
    page,
  });

  const handlePageChange = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', p.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        title={category !== undefined ? `Sản phẩm: ${category}` : 'Tất cả sản phẩm'}
        subtitle={category !== undefined ? `Khám phá các sản phẩm trong danh mục ${category}` : 'Duyệt qua toàn bộ bộ sưu tập của chúng tôi'}
      />
      <ProductGrid products={products} />
      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />}
    </div>
  );
}
