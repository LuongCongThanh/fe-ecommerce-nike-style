'use client';

import type { Product } from '@repo/schemas/catalog';
import { useLocale } from 'next-intl';

import { ProductCard } from '@/app/[locale]/(shop)/_lib/components/common/ProductCard';
import { getProductPriceRange } from '@/app/[locale]/(shop)/_lib/utils/priceRange';

interface CatalogProductGridProps {
  readonly products: readonly Product[];
}

/** PLP/Category grid for the canonical catalog Product (SKU-priced) — see `ProductGrid` for the legacy PDP-related-products grid. */
export function CatalogProductGrid({ products }: CatalogProductGridProps): React.JSX.Element {
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
      {products.map((product) => {
        const { min, isRange } = getProductPriceRange(product);
        return (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            slug={product.slug}
            price={min}
            images={product.images}
            locale={locale}
            isPriceRange={isRange}
          />
        );
      })}
    </div>
  );
}
