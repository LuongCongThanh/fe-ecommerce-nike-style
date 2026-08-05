'use client';

import Link from 'next/link';

import { ChevronRight } from 'lucide-react';

import { PageShell } from '@/app/[locale]/(shop)/_lib/components/layout/PageShell';
import { CatalogProductGrid } from '@/app/[locale]/(shop)/_lib/components/products/CatalogProductGrid';
import { ProductDetailTabs } from '@/app/[locale]/(shop)/_lib/components/products/ProductDetailTabs';
import { ProductGallery } from '@/app/[locale]/(shop)/_lib/components/products/ProductGallery';
import { ProductInfoPanel } from '@/app/[locale]/(shop)/_lib/components/products/ProductInfoPanel';
import { useProduct } from '@/app/[locale]/(shop)/_lib/hooks/products/useProduct';
import { useRelatedProducts } from '@/app/[locale]/(shop)/_lib/hooks/products/useRelatedProducts';

interface ProductDetailPageClientProps {
  readonly slug: string;
  readonly locale: string;
}

/** Client-driven for the same reason as `CategoryPageClient` — MSW only intercepts reliably in the browser (Decision #87). */
export function ProductDetailPageClient({ slug, locale }: ProductDetailPageClientProps): React.JSX.Element {
  const { data: product, isLoading, isError } = useProduct(slug);
  const { related } = useRelatedProducts(product?.categoryId, slug);

  if (isLoading) {
    return (
      <PageShell.Browse className="min-h-screen pb-24">
        <p className="text-muted-foreground py-24 text-center">Đang tải…</p>
      </PageShell.Browse>
    );
  }

  if (isError || product === undefined) {
    return (
      <PageShell.Browse className="min-h-screen pb-24">
        <div className="flex min-h-100 flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-bold">Không tìm thấy sản phẩm</h1>
          <p className="text-muted-foreground mt-2">Sản phẩm bạn tìm không tồn tại.</p>
        </div>
      </PageShell.Browse>
    );
  }

  return (
    <PageShell.Browse className="min-h-screen pb-24">
      {/* Breadcrumb */}
      <nav className="text-muted-foreground mb-8 flex items-center gap-1.5 text-sm">
        <Link href={`/${locale}/home`} className="hover:text-foreground transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/${locale}/products`} className="hover:text-foreground transition-colors">
          Sản phẩm
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </nav>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />
        <ProductInfoPanel product={product} locale={locale} />
      </div>

      {/* Tabs: Description / Specs / Reviews */}
      <div className="mt-16">
        <ProductDetailTabs description={product.description} rating={product.rating} reviewCount={product.reviewCount} />
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-20">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Sản phẩm liên quan</h2>
          </div>
          <CatalogProductGrid products={related} />
        </div>
      )}
    </PageShell.Browse>
  );
}
