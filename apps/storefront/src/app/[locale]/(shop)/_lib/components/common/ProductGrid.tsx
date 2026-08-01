'use client';

import { useLocale } from 'next-intl';

import { ProductCard } from '@/app/[locale]/(shop)/_lib/components/common/ProductCard';
import type { ProductDisplay } from '@/app/[locale]/(shop)/_lib/types/product';

interface ProductGridProps {
  readonly products: ProductDisplay[];
}

export function ProductGrid({ products }: ProductGridProps): React.JSX.Element {
  const locale = useLocale();

  if (products.length === 0) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-muted-foreground text-lg">Không tìm thấy sản phẩm nào</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          slug={product.slug}
          price={product.price}
          salePrice={product.salePrice}
          images={product.images}
          rating={product.rating}
          reviewCount={product.reviewCount}
          badges={product.badges}
          locale={locale}
        />
      ))}
    </div>
  );
}
