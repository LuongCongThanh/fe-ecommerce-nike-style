// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
// Apple Design pass · §2 direct manipulation · §3 interruptibility · §6 momentum projection
// · §7 spatial consistency · §9 rubber-banding · §14 reduced motion
'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';

import { cn } from '@repo/shared/utils';
import type { PanInfo } from 'framer-motion';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { projectMomentum, SPRING_MOMENTUM, SPRING_UI } from '@/shared/lib/motion';

interface ProductGalleryProps {
  readonly images: string[];
  readonly name: string;
}

/**
 * How far the *projected* resting point (release offset + momentum, §6) has to land before the
 * swipe commits to the next image. Below it, the image springs back — the gesture reads as
 * "considered and cancelled", not "ignored".
 */
const COMMIT_DISTANCE_PX = 90;

/**
 * Enter and exit travel the same axis in the same direction (§7): flick left and the current image
 * leaves left while the next arrives from the right. In-from-right / out-the-bottom would break the
 * spatial story of a strip of images.
 */
const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? '42%' : '-42%', opacity: 0, scale: 0.98 }),
  center: { x: '0%', opacity: 1, scale: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? '-42%' : '42%', opacity: 0, scale: 0.98 }),
};

const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [selected, setSelected] = useState(0);
  // Direction is tracked alongside the index so the *exiting* frame still knows which way the user
  // went, and can leave along the axis the incoming one arrives on.
  const [direction, setDirection] = useState(0);

  const total = images.length;

  const paginate = useCallback(
    (step: number) => {
      setDirection(step);
      setSelected((current) => (current + step + total) % total);
    },
    [total],
  );

  const goTo = useCallback(
    (index: number) => {
      if (index === selected) return;
      setDirection(index > selected ? 1 : -1);
      setSelected(index);
    },
    [selected],
  );

  const handleDragEnd = useCallback(
    (_event: unknown, info: PanInfo) => {
      // Snap to where the flick is *going*, not where the finger left off — a small input becomes a
      // big output, which is what makes a flick feel thrown rather than nudged.
      const projected = info.offset.x + projectMomentum(info.velocity.x);
      if (projected <= -COMMIT_DISTANCE_PX) paginate(1);
      else if (projected >= COMMIT_DISTANCE_PX) paginate(-1);
    },
    [paginate],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (total <= 1) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        paginate(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        paginate(-1);
      }
    },
    [paginate, total],
  );

  const currentImage = images.at(selected);
  if (currentImage === undefined) return null;

  const variants = prefersReducedMotion ? fadeVariants : slideVariants;
  const canSwipe = total > 1 && !prefersReducedMotion;

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Main image */}
      <div
        className="bg-muted group focus-visible:ring-ring relative aspect-[4/5] w-full touch-pan-y overflow-hidden rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:flex-1"
        role="group"
        aria-roledescription="Bộ ảnh sản phẩm"
        aria-label={`Ảnh ${name} — dùng phím mũi tên trái/phải để chuyển ảnh`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={selected}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            // Momentum landing, so the spring continues the flick instead of restarting it (§5).
            transition={prefersReducedMotion ? { duration: 0.2, ease: 'easeOut' } : SPRING_MOMENTUM}
            drag={canSwipe ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            // Follows the finger, with resistance that grows the further it is pulled — a hard wall
            // would read as "frozen", this reads as "responsive, but there is nothing more here" (§9).
            dragElastic={0.5}
            dragMomentum={false}
            onDragEnd={canSwipe ? handleDragEnd : undefined}
            className={cn('absolute inset-0 select-none', canSwipe && 'cursor-grab active:cursor-grabbing')}
          >
            <Image
              src={currentImage}
              alt={`${name} – ảnh ${(selected + 1).toString()}`}
              fill
              priority={selected === 0}
              draggable={false}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="pointer-events-none object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next arrows — only when > 1 image */}
        {total > 1 && (
          <>
            <motion.button
              type="button"
              onClick={() => {
                paginate(-1);
              }}
              whileTap={{ scale: 0.9 }}
              transition={SPRING_UI}
              aria-label="Ảnh trước"
              className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-100 backdrop-blur-md transition-opacity hover:bg-black/60 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100"
            >
              <ChevronLeft className="size-5" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => {
                paginate(1);
              }}
              whileTap={{ scale: 0.9 }}
              transition={SPRING_UI}
              aria-label="Ảnh tiếp theo"
              className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-100 backdrop-blur-md transition-opacity hover:bg-black/60 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100"
            >
              <ChevronRight className="size-5" />
            </motion.button>

            {/* Dot indicators — the active pill travels between dots as one shared element. */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((image, i) => (
                <motion.button
                  key={`dot-${image}`}
                  type="button"
                  onClick={() => {
                    goTo(i);
                  }}
                  whileTap={{ scale: 0.85 }}
                  transition={SPRING_UI}
                  aria-label={`Ảnh ${(i + 1).toString()}`}
                  aria-current={i === selected}
                  className={cn(
                    'h-1.5 rounded-full transition-[width,background-color] duration-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
                    i === selected ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80',
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Image counter badge */}
        {total > 1 && (
          <span className="absolute top-3 right-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-md">
            {(selected + 1).toString()}/{total.toString()}
          </span>
        )}
      </div>

      <span role="status" aria-live="polite" className="sr-only">
        {total > 1 ? `Ảnh ${(selected + 1).toString()} trên ${total.toString()}` : ''}
      </span>

      {/* Thumbnails */}
      {total > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 lg:order-first lg:flex-col lg:overflow-x-visible lg:pb-0">
          {images.map((image, index) => (
            <motion.button
              key={image}
              type="button"
              onClick={() => {
                goTo(index);
              }}
              whileTap={{ scale: 0.94 }}
              transition={SPRING_UI}
              aria-label={`Xem ảnh ${(index + 1).toString()}`}
              aria-current={selected === index}
              className={cn(
                'bg-muted focus-visible:ring-ring relative size-20 shrink-0 overflow-hidden rounded-lg transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                selected === index ? 'opacity-100' : 'opacity-60 hover:opacity-100',
              )}
            >
              <Image src={image} alt={`${name} thumbnail ${(index + 1).toString()}`} fill sizes="80px" className="object-cover" />
              {selected === index && (
                <motion.span
                  layoutId="gallery-active-thumb"
                  transition={prefersReducedMotion ? { duration: 0 } : SPRING_UI}
                  className="border-foreground pointer-events-none absolute inset-0 rounded-lg border-2"
                />
              )}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
