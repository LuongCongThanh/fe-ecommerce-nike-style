// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
// Apple Design pass · §8 the reveal points down the page, in reading order · §14 reduced motion
'use client';

import type { Product } from '@repo/schemas/catalog';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocale } from 'next-intl';

import { ProductCard } from '@/app/[locale]/(shop)/_lib/components/common/ProductCard';
import { getProductPriceRange } from '@/app/[locale]/(shop)/_lib/utils/priceRange';
import { SPRING_MOVE } from '@/shared/lib/motion';

interface CatalogProductGridProps {
  readonly products: readonly Product[];
  /** Rendered under the empty-state message — e.g. a "clear filters" button when the caller knows
   * an active filter narrowed the result set to zero (UI/UX audit finding, PLP § 3). Omit for
   * contexts with no filters to clear (search results, PDP related-products). */
  readonly emptyStateAction?: React.ReactNode;
}

/** Cards keep arriving after the eighth — the *stagger* stops, so a full page never feels slow. */
const MAX_STAGGERED_CARDS = 8;
const STAGGER_STEP_SECONDS = 0.035;

/** PLP/Category grid for the canonical catalog Product (SKU-priced) — see `ProductGrid` for the legacy PDP-related-products grid. */
export function CatalogProductGrid({ products, emptyStateAction }: CatalogProductGridProps): React.JSX.Element {
  const locale = useLocale();
  const prefersReducedMotion = useReducedMotion() ?? false;

  if (products.length === 0) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
        <p className="text-muted-foreground text-base">Không tìm thấy sản phẩm nào</p>
        {emptyStateAction}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {products.map((product, index) => {
        const { min, isRange } = getProductPriceRange(product);
        return (
          <motion.div
            key={product.id}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              ...(prefersReducedMotion ? { duration: 0.2, ease: 'easeOut' } : SPRING_MOVE),
              delay: prefersReducedMotion ? 0 : Math.min(index, MAX_STAGGERED_CARDS) * STAGGER_STEP_SECONDS,
            }}
          >
            <ProductCard
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={min}
              images={product.images}
              locale={locale}
              isPriceRange={isRange}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
