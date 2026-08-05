'use client';

import { useCallback, useRef } from 'react';
import Link from 'next/link';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCarouselProps {
  readonly title: string;
  readonly ctaLabel?: string;
  readonly ctaHref?: string;
  readonly children: React.ReactNode;
}

/**
 * Horizontal product carousel — same rhythm as Nike's "Trending" /
 * "Race Day Ready" rows: heading left, circular prev/next arrows right,
 * scroll-snap track below. Uses native scroll-snap, no extra dependency.
 */
export function ProductCarousel({ title, ctaLabel, ctaHref, children }: ProductCarouselProps): React.JSX.Element {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (track == null) return;
    const card = track.firstElementChild as HTMLElement | null;
    const step = (card?.getBoundingClientRect().width ?? track.clientWidth * 0.8) + 16;
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  }, []);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-foreground text-2xl font-bold tracking-tight">{title}</h2>
        <div className="flex shrink-0 items-center gap-3">
          {ctaLabel != null && ctaHref != null ? (
            <Link href={ctaHref} className="text-primary text-sm font-medium underline-offset-4 hover:underline">
              {ctaLabel}
            </Link>
          ) : null}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              aria-label="Xem sản phẩm trước"
              onClick={() => {
                scroll(-1);
              }}
              className="border-border bg-background hover:bg-muted focus-visible:ring-ring flex size-9 items-center justify-center rounded-full border transition-colors duration-(--duration-fast) ease-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Xem sản phẩm tiếp theo"
              onClick={() => {
                scroll(1);
              }}
              className="border-border bg-background hover:bg-muted focus-visible:ring-ring flex size-9 items-center justify-center rounded-full border transition-colors duration-(--duration-fast) ease-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        className="mt-6 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}
