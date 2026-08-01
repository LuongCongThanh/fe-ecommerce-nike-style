'use client';

import { useState } from 'react';
import Image from 'next/image';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

interface ProductGalleryProps {
  readonly images: string[];
  readonly name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  const prev = () => {
    setSelected((i) => (i - 1 + images.length) % images.length);
  };
  const next = () => {
    setSelected((i) => (i + 1) % images.length);
  };

  const currentImage = images.at(selected);
  if (currentImage === undefined) return null;

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Main image */}
      <div className="bg-muted group relative aspect-square w-full overflow-hidden rounded-xl lg:flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <Image
              src={currentImage}
              alt={`${name} – ảnh ${(selected + 1).toString()}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next arrows — only when > 1 image */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Ảnh trước"
              className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-100 backdrop-blur-sm transition-opacity hover:bg-black/60 lg:opacity-0 lg:group-hover:opacity-100"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Ảnh tiếp theo"
              className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-100 backdrop-blur-sm transition-opacity hover:bg-black/60 lg:opacity-0 lg:group-hover:opacity-100"
            >
              <ChevronRight className="size-5" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <button
                  key={`dot-${i.toString()}`}
                  type="button"
                  onClick={() => {
                    setSelected(i);
                  }}
                  aria-label={`Ảnh ${(i + 1).toString()}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-200',
                    i === selected ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80',
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Image counter badge */}
        {images.length > 1 && (
          <span className="absolute top-3 right-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {(selected + 1).toString()}/{images.length.toString()}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 lg:order-first lg:flex-col lg:overflow-x-visible lg:pb-0">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => {
                setSelected(index);
              }}
              aria-label={`Xem ảnh ${(index + 1).toString()}`}
              className={cn(
                'bg-muted relative size-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200',
                selected === index ? 'border-foreground' : 'border-transparent opacity-60 hover:opacity-100',
              )}
            >
              <Image src={image} alt={`${name} thumbnail ${(index + 1).toString()}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
