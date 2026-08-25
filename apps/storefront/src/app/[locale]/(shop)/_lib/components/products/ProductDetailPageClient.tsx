// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
// Apple Design pass · §1 a skeleton shaped like the PDP instead of a spinner · §8 sections reveal
// in reading order · §14 reduced motion
'use client';

import Link from 'next/link';

import { QueryState } from '@repo/shared/query-state';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

import { SectionHeading } from '@/app/[locale]/(shop)/_lib/components/common/SectionHeading';
import { PageShell } from '@/app/[locale]/(shop)/_lib/components/layout/PageShell';
import { CatalogProductGrid } from '@/app/[locale]/(shop)/_lib/components/products/CatalogProductGrid';
import { ProductDetailTabs } from '@/app/[locale]/(shop)/_lib/components/products/ProductDetailTabs';
import { ProductGallery } from '@/app/[locale]/(shop)/_lib/components/products/ProductGallery';
import { ProductInfoPanel } from '@/app/[locale]/(shop)/_lib/components/products/ProductInfoPanel';
import { ProductDetailSkeleton } from '@/app/[locale]/(shop)/_lib/components/products/ProductSkeletons';
import { useProduct } from '@/app/[locale]/(shop)/_lib/hooks/products/useProduct';
import { useRelatedProducts } from '@/app/[locale]/(shop)/_lib/hooks/products/useRelatedProducts';
import { SPRING_MOVE } from '@/shared/lib/motion';

interface ProductDetailPageClientProps {
  readonly slug: string;
  readonly locale: string;
}

/** Client-driven for the same reason as `CategoryPageClient` — MSW only intercepts reliably in the browser (Decision #87). */
export function ProductDetailPageClient({ slug, locale }: ProductDetailPageClientProps): React.JSX.Element {
  const { data: product, isLoading, isError, error, refetch } = useProduct(slug);
  const { related } = useRelatedProducts(product?.categoryId, slug);

  return (
    <PageShell.Browse className="min-h-screen pb-24">
      <QueryState isLoading={isLoading} error={isError ? error : null} onRetry={refetch} loadingFallback={<ProductDetailSkeleton />}>
        {product !== undefined ? (
          <ProductDetailContent product={product} locale={locale} related={related} />
        ) : (
          <div className="flex min-h-100 flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold">Không tìm thấy sản phẩm</h1>
            <p className="text-muted-foreground mt-2">Sản phẩm bạn tìm không tồn tại.</p>
          </div>
        )}
      </QueryState>
    </PageShell.Browse>
  );
}

function ProductDetailContent({
  product,
  locale,
  related,
}: {
  readonly product: NonNullable<ReturnType<typeof useProduct>['data']>;
  readonly locale: string;
  readonly related: ReturnType<typeof useRelatedProducts>['related'];
}): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Below-the-fold sections arrive as the reader reaches them, and they arrive from *below* — the
  // intermediate motion points where the content is coming from (§8).
  const reveal = {
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: prefersReducedMotion ? { duration: 0.2, ease: 'easeOut' as const } : SPRING_MOVE,
  };

  return (
    <>
      {/* Breadcrumb */}
      <nav aria-label="Đường dẫn" className="text-muted-foreground mb-8 flex items-center gap-1.5 text-sm">
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

      {/* Main 2-col layout — `items-start` lets the info panel stick while the gallery scrolls. */}
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />
        <ProductInfoPanel product={product} locale={locale} />
      </div>

      {/* Tabs: Description / Specs / Reviews */}
      <motion.div className="mt-16" {...reveal}>
        <ProductDetailTabs description={product.description} rating={product.rating} reviewCount={product.reviewCount} />
      </motion.div>

      {/* Related Products */}
      {related.length > 0 && (
        <motion.div className="mt-20" {...reveal}>
          <div className="mb-8">
            <SectionHeading title="Sản phẩm liên quan" />
          </div>
          <CatalogProductGrid products={related} />
        </motion.div>
      )}
    </>
  );
}
