// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
// Apple Design pass · §4 the price *behaves* when a SKU resolves rather than swapping · §12 the
// panel stays with the reader while the gallery scrolls
'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import type { Product } from '@repo/schemas/catalog';
import { cn, formatCurrency } from '@repo/shared/utils';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, RotateCcw, ShieldCheck, Star, Truck } from 'lucide-react';

import { AddToCartSection } from '@/app/[locale]/(shop)/_lib/components/products/AddToCartSection';
import { MobileBuyBar } from '@/app/[locale]/(shop)/_lib/components/products/MobileBuyBar';
import { useAddToCart } from '@/app/[locale]/(shop)/_lib/hooks/products/useAddToCart';
import { getProductPriceRange } from '@/app/[locale]/(shop)/_lib/utils/priceRange';
import { SPRING_UI } from '@/shared/lib/motion';

// Decision #59 / docs/FRONTEND-GUIDE.md §27 — three.js only ever loads for a mounted PDP, never at a
// higher-level route/layout, and never during SSR (WebGL has no server-side renderer).
const ProductViewer3D = dynamic(async () => import('@/app/[locale]/(shop)/_lib/components/products/ProductViewer3D'), {
  ssr: false,
  loading: () => <div className="bg-muted aspect-square w-full animate-pulse rounded-xl" />,
});

const TRUST_BADGES = [
  { icon: Truck, title: 'Giao hàng nhanh', sub: '2-4 ngày làm việc' },
  { icon: RotateCcw, title: 'Đổi trả 30 ngày', sub: 'Miễn phí đổi trả' },
  { icon: ShieldCheck, title: 'Bảo hành 1 năm', sub: 'Chính hãng 100%' },
] as const;

interface ProductInfoPanelProps {
  readonly product: Product;
  readonly locale: string;
}

export function ProductInfoPanel({ product, locale }: ProductInfoPanelProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const cartState = useAddToCart(product);
  const { selectedSku, selection } = cartState;
  const { min: priceFrom, isRange } = getProductPriceRange(product);
  const displayPrice = selectedSku?.price ?? priceFrom;
  const isPriceApproximate = selectedSku === null && isRange;
  const canAdd = selectedSku !== null && selectedSku.stock > 0;
  const buyBlockRef = useRef<HTMLDivElement>(null);

  return (
    // `self-start` + `sticky` keeps the decision (price, variants, CTA) in view while the reader
    // scrolls the gallery — the two columns stop being one long page and start being two panes.
    <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
      {/* Name + rating */}
      <div>
        {/* Large type wants negative tracking; body copy below stays near 0 (§15). */}
        <h1 className="text-3xl leading-tight font-bold tracking-tight wrap-anywhere sm:text-4xl">{product.name}</h1>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={`star-${i.toString()}`}
                className={cn('size-4', i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300')}
              />
            ))}
          </div>
          <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
          <span className="text-muted-foreground text-sm">({product.reviewCount.toString()} đánh giá)</span>
        </div>
      </div>

      {/* 3D viewer — lazy, synced to the selected Color */}
      <ProductViewer3D color={selection.color ?? null} />

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
        {selectedSku === null && (product.skus.length > 1 || isRange) ? (
          <p className="text-muted-foreground mt-1.5 text-xs">Chọn phân loại để xem giá và tồn kho chính xác</p>
        ) : null}
      </div>

      {/* Variant + Qty + Cart */}
      <div ref={buyBlockRef}>
        <AddToCartSection {...cartState} />
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
        canAdd={canAdd}
        onAdd={cartState.add}
        onBuyNow={cartState.buyNow}
        anchorRef={buyBlockRef}
      />
    </div>
  );
}
