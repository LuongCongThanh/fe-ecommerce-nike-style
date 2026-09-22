// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
// Apple Design pass · §12 translucent chrome floating over content · §7 enters and leaves along the
// same edge it belongs to · §14 reduced transparency / reduced motion
'use client';

import { useEffect, useRef, useState } from 'react';

import { formatCurrency } from '@repo/shared/utils';
import { Button } from '@repo/ui/button';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

import { SPRING_SHEET } from '@/shared/lib/motion';

interface MobileBuyBarProps {
  readonly productName: string;
  readonly price: number;
  readonly isPriceApproximate: boolean;
  readonly canAdd: boolean;
  readonly onAdd: () => void;
  readonly onBuyNow: () => void;
  /** The in-flow CTA block. The bar only exists while that block is off-screen — never both at once. */
  readonly anchorRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * On a phone the real buy controls sit a full screen below the fold once the user starts reading.
 * This is the same action re-offered as floating chrome, not a second competing CTA: it materialises
 * only while the in-flow block is out of view, and its labels are deliberately distinct from the
 * primary ones so screen-reader users never hear the same command twice.
 */
export function MobileBuyBar({ productName, price, isPriceApproximate, canAdd, onAdd, onBuyNow, anchorRef }: MobileBuyBarProps): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [isAnchorVisible, setIsAnchorVisible] = useState(true);
  // Only arm the bar after the anchor has been seen once, so it can't flash in on first paint.
  const hasSeenAnchor = useRef(false);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (anchor === null) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry === undefined) return;
        if (entry.isIntersecting) hasSeenAnchor.current = true;
        setIsAnchorVisible(entry.isIntersecting || !hasSeenAnchor.current);
      },
      { rootMargin: '-72px 0px -96px 0px' },
    );

    observer.observe(anchor);
    return () => {
      observer.disconnect();
    };
  }, [anchorRef]);

  return (
    <AnimatePresence>
      {!isAnchorVisible && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%', opacity: 0 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { y: '0%', opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%', opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0.2, ease: 'easeOut' } : SPRING_SHEET}
          className="bg-background/85 supports-[backdrop-filter]:bg-background/70 fixed inset-x-0 bottom-0 z-(--z-index-drawer) border-t border-white/40 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground line-clamp-1 text-xs font-medium">{productName}</p>
              <p className="text-brand-600 text-lg font-bold tabular-nums">
                {isPriceApproximate ? <span className="text-muted-foreground mr-1 text-xs font-normal">Từ</span> : null}
                {formatCurrency(price)}
              </p>
            </div>

            <Button variant="outline" size="lg" className="size-12 shrink-0 p-0" onClick={onAdd} disabled={!canAdd} aria-label="Thêm nhanh vào giỏ">
              <ShoppingCart className="size-5" />
            </Button>
            <Button variant="default" size="lg" className="h-12 shrink-0 px-6 font-semibold" onClick={onBuyNow} disabled={!canAdd}>
              Mua ngay
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
