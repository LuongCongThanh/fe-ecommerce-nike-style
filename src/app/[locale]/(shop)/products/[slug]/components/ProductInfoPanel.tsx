// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
// Apple Design pass · §4 the price *behaves* when a SKU resolves rather than swapping · §12 the
// panel stays with the reader while the gallery scrolls
'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, RotateCcw, ShieldCheck, Truck } from 'lucide-react';

import { AddToCartSection } from '@/app/[locale]/(shop)/products/[slug]/components/AddToCartSection';
import { MobileBuyBar } from '@/app/[locale]/(shop)/products/[slug]/components/MobileBuyBar';
import type { VariantSelectionState } from '@/app/[locale]/(shop)/products/[slug]/hooks/useVariantSelection';
import type { ProductDetail } from '@/lib/api/models/catalog';
import { SPRING_UI } from '@/shared/lib/motion';
import { formatCurrency } from '@/shared/utils/utils';

// Decision #59 / docs/FRONTEND-GUIDE.md §27 — three.js only ever loads for a mounted PDP, never at a
// higher-level route/layout, and never during SSR (WebGL has no server-side renderer).
const ProductViewer3D = dynamic(async () => import('@/app/[locale]/(shop)/products/[slug]/components/ProductViewer3D'), {
  ssr: false,
  loading: () => <div className="bg-muted aspect-square w-full animate-pulse rounded-xl" />,
});

const TRUST_BADGES = [
  { icon: Truck, title: 'Giao hàng nhanh', sub: '2-4 ngày làm việc' },
  { icon: RotateCcw, title: 'Đổi trả 30 ngày', sub: 'Miễn phí đổi trả' },
  { icon: ShieldCheck, title: 'Bảo hành 1 năm', sub: 'Chính hãng 100%' },
] as const;

interface ProductInfoPanelProps {
  readonly product: ProductDetail;
  readonly locale: string;
  readonly selection: VariantSelectionState;
}

/** Ordering opens in slice C; until then the buy actions render disabled. */
const NO_OP = (): void => undefined;

export function ProductInfoPanel({ product, locale, selection }: ProductInfoPanelProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { selectedVariant, selectedColor, minPrice, isRange } = selection;
  const displayPrice = selectedVariant?.price ?? minPrice;
  const isPriceApproximate = selectedVariant === null && isRange;
  const buyBlockRef = useRef<HTMLDivElement>(null);

  return (
    // `self-start` + `sticky` keeps the decision (price, variants, CTA) in view while the reader
    // scrolls the gallery — the two columns stop being one long page and start being two panes.
    <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
      {/* Name — reviews arrive with slice R. */}
      <div>
        {/* Large type wants negative tracking; body copy below stays near 0 (§15). */}
        <h1 className="text-3xl leading-tight font-bold tracking-tight wrap-anywhere sm:text-4xl">{product.name}</h1>
      </div>

      {/* 3D viewer — lazy, synced to the selected Color */}
      <ProductViewer3D color={selectedColor?.hex ?? null} />

      {/* Price — resolving a SKU is a real state change, so the number moves rather than blinking. */}
      <div>
        <div className="flex h-9 items-center overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={displayPrice}
              initial={prefersReducedMotion ? { opacity: 0 } : { y: 14, opacity: 0 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: -14, opacity: 0 }}
              transition={prefersReducedMotion ? { duration: 0.15, ease: 'easeOut' } : SPRING_UI}
              className="text-brand-600 text-3xl font-bold tracking-tight tabular-nums"
            >
              {isPriceApproximate ? <span className="text-muted-foreground mr-1.5 text-base font-normal">Từ</span> : null}
              {formatCurrency(displayPrice)}
            </motion.span>
          </AnimatePresence>
        </div>
        {selectedVariant === null && isRange ? <p className="text-muted-foreground mt-1.5 text-xs">Chọn màu và size để xem giá chính xác</p> : null}
      </div>

      {/* Variant + Qty + Cart */}
      <div ref={buyBlockRef}>
        <AddToCartSection {...selection} />
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-3 border-t pt-6">
        {TRUST_BADGES.map((item) => (
          <div key={item.title} className="flex flex-col items-center gap-2 rounded-xl border p-3 text-center">
            <div className="bg-muted text-foreground flex size-9 items-center justify-center rounded-full">
              <item.icon className="size-4" />
            </div>
            <div className="text-xs">
              <p className="font-bold">{item.title}</p>
              <p className="text-muted-foreground">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Back link */}
      <Link
        href={`/${locale}/products`}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring mt-2 flex w-fit items-center gap-1.5 rounded-sm text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" />
        Quay lại danh sách sản phẩm
      </Link>

      <MobileBuyBar
        productName={product.name}
        price={displayPrice}
        isPriceApproximate={isPriceApproximate}
        canAdd={false}
        onAdd={NO_OP}
        onBuyNow={NO_OP}
        anchorRef={buyBlockRef}
      />
    </div>
  );
}
