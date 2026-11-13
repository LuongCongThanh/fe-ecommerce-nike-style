'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { DURATION_SLOW, EASE_OUT } from '@/app/[locale]/(shop)/_lib/components/home/motion';
import { useCanRender3D } from '@/shared/hooks/useCanRender3D';

const AUTOPLAY_DELAY_MS = 6500;
const SWIPE_THRESHOLD_PX = 50;

const HERO_SLIDES = [
  { id: 'watch', image: '/images/hero-placeholder.jpg', href: '/products?category=accessories' },
  { id: 'shoes', image: '/images/categories/giay.jpg', href: '/products?category=shoes' },
  { id: 'bags', image: '/images/categories/tui.jpg', href: '/products?category=bags' },
] as const;

// three.js only ever reaches the browser through this wrapper, and only after `useCanRender3D`
// clears every gate — see docs/FRONTEND-GUIDE.md ("three.js in the storefront").
const HeroSlides3D = dynamic(async () => import('@/app/[locale]/(shop)/_lib/components/home/hero3d/HeroSlides3D'), { ssr: false });

function wrapSlideIndex(index: number): number {
  return (index + HERO_SLIDES.length) % HERO_SLIDES.length;
}

/**
 * Rebuilds every slide's URL from the one `next/image` actually picked, so the WebGL layer reuses
 * the exact AVIF/WebP variant the browser has already cached instead of downloading a second copy.
 */
function deriveSlideSources(renderedSrc: string): readonly string[] {
  const rawPaths = HERO_SLIDES.map((slide) => slide.image);

  try {
    const rendered = new URL(renderedSrc, window.location.origin);
    if (!rendered.searchParams.has('url')) return rawPaths;

    return rawPaths.map((path) => {
      const variant = new URL(rendered);
      variant.searchParams.set('url', path);
      return variant.toString();
    });
  } catch {
    // Unoptimized images (dev, or a custom loader) hand back a plain path — use it as-is.
    return rawPaths;
  }
}

export function HeroCarousel(): React.JSX.Element {
  const locale = useLocale();
  const t = useTranslations('home.hero');
  const prefersReducedMotion = useReducedMotion() === true;
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);

  // WebGL slide layer — the carousel below keeps owning links, focus, autoplay and swipe; the canvas
  // only ever replaces pixels. `hasHandedOver` flips the DOM image to transparent in the same commit
  // that reveals the canvas, so there is no frame showing both or neither.
  const { status: render3DStatus, tier: render3DTier } = useCanRender3D();
  const [slideSources, setSlideSources] = useState<readonly string[]>([]);
  const [isContextLost, setIsContextLost] = useState(false);
  const [hasHandedOver, setHasHandedOver] = useState(false);
  const is3DEnabled = render3DStatus === 'ready' && !isContextLost && slideSources.length > 0;

  const handleContextLost = useCallback(() => {
    setIsContextLost(true);
    setHasHandedOver(false);
  }, []);

  const handleReady = useCallback(() => {
    setHasHandedOver(true);
  }, []);

  const showSlide = useCallback((nextIndex: number, nextDirection: 1 | -1) => {
    setDirection(nextDirection);
    setActiveIndex(wrapSlideIndex(nextIndex));
  }, []);

  const showNext = useCallback(() => {
    showSlide(activeIndex + 1, 1);
  }, [activeIndex, showSlide]);

  const showPrevious = useCallback(() => {
    showSlide(activeIndex - 1, -1);
  }, [activeIndex, showSlide]);

  useEffect(() => {
    if (prefersReducedMotion || isPaused) return;

    const timer = window.setInterval(showNext, AUTOPLAY_DELAY_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [isPaused, prefersReducedMotion, showNext]);

  const activeSlide = HERO_SLIDES[activeIndex] ?? HERO_SLIDES[0];

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t('carouselLabel')}
      onMouseEnter={() => {
        setIsPaused(true);
      }}
      onMouseLeave={() => {
        setIsPaused(false);
      }}
      onFocusCapture={() => {
        setIsPaused(true);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
      className="relative mx-auto w-full max-w-xl"
    >
      <div className="bg-surface-inverse relative aspect-square overflow-hidden rounded-4xl p-3 shadow-2xl shadow-neutral-950/20">
        <div className="relative size-full overflow-hidden rounded-[1.35rem]">
          {is3DEnabled ? (
            <div className="absolute inset-0" style={{ opacity: hasHandedOver ? 1 : 0 }}>
              <HeroSlides3D
                sources={slideSources}
                activeIndex={activeIndex}
                tier={render3DTier}
                onReady={handleReady}
                onContextLost={handleContextLost}
              />
            </div>
          ) : null}

          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={activeSlide.id}
              custom={direction}
              initial={prefersReducedMotion ? false : { opacity: 0, x: direction * 36 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -36 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: DURATION_SLOW, ease: EASE_OUT }}
              drag={prefersReducedMotion ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={(_, info) => {
                if (info.offset.x <= -SWIPE_THRESHOLD_PX) showNext();
                if (info.offset.x >= SWIPE_THRESHOLD_PX) showPrevious();
              }}
              className="absolute inset-0 touch-pan-y"
            >
              <Image
                src={activeSlide.image}
                alt={t(`slides.${activeSlide.id}.alt`)}
                fill
                priority={activeIndex === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                style={{ opacity: hasHandedOver ? 0 : 1 }}
                onLoad={(event) => {
                  setSlideSources((current) => (current.length > 0 ? current : deriveSlideSources(event.currentTarget.currentSrc)));
                }}
              />
              <div className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-white">
                <div>
                  <p className="text-xs font-semibold tracking-[0.16em] text-white/65 uppercase">{t(`slides.${activeSlide.id}.eyebrow`)}</p>
                  <p className="mt-1 text-xl font-bold sm:text-2xl">{t(`slides.${activeSlide.id}.title`)}</p>
                </div>
                <Link
                  href={`/${locale}${activeSlide.href}`}
                  aria-label={t(`slides.${activeSlide.id}.ctaLabel`)}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/15 backdrop-blur-md transition-colors hover:bg-white hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                >
                  <ArrowUpRight className="size-5" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between">
        <button
          type="button"
          aria-label={t('previousSlide')}
          onClick={showPrevious}
          className="pointer-events-auto flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition-colors hover:bg-black/50 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          aria-label={t('nextSlide')}
          onClick={showNext}
          className="pointer-events-auto flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition-colors hover:bg-black/50 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2" role="group" aria-label={t('slideNavigation')}>
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={t('goToSlide', { number: index + 1 })}
            aria-current={index === activeIndex ? 'true' : undefined}
            onClick={() => {
              showSlide(index, index >= activeIndex ? 1 : -1);
            }}
            className={
              index === activeIndex
                ? 'bg-foreground h-2 w-8 rounded-full transition-[width,background-color]'
                : 'bg-foreground/20 hover:bg-foreground/40 size-2 rounded-full transition-[width,background-color]'
            }
          />
        ))}
      </div>
    </section>
  );
}
