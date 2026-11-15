'use client';

import React from 'react';
import Link from 'next/link';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { HeroCarousel } from '@/features/home/components/HeroCarousel';
import { EASE_OUT } from '@/features/home/components/motion';
import { TrustBadgeList } from '@/features/home/components/TrustBadgeList';
import { Button } from '@/shared/ui/Button';

const revealUp = {
  hidden: { opacity: 0, transform: 'translateY(12px)' },
  show: { opacity: 1, transform: 'translateY(0px)' },
};

const reducedVariant = {
  hidden: { opacity: 1, transform: 'translateY(0px)' },
  show: { opacity: 1, transform: 'translateY(0px)' },
};

export function SectionHero(): React.JSX.Element {
  const locale = useLocale();
  const t = useTranslations('home.hero');
  const prefersReducedMotion = useReducedMotion() === true;
  const variants = prefersReducedMotion ? reducedVariant : revealUp;
  const childTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: EASE_OUT };

  return (
    <section className="bg-surface-inverse text-surface-inverse-foreground relative isolate overflow-hidden border-b border-white/10">
      <div className="relative mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-end gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-16 lg:px-8 lg:py-12">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.07 }}
          className="flex flex-col items-start"
        >
          <motion.span
            variants={variants}
            transition={childTransition}
            className="inline-flex items-center gap-2 border-b border-white/25 pb-2 text-xs font-semibold tracking-[0.18em] text-white/70 uppercase"
          >
            <span className="bg-brand-500 size-1.5 rounded-full" />
            {t('badge')}
          </motion.span>

          <h1 className="font-display leading-0.92 mt-6 max-w-xl text-5xl font-black tracking-[-0.06em] text-balance sm:text-6xl lg:text-7xl xl:text-8xl">
            <motion.span variants={variants} transition={childTransition} className="block">
              {t('titleLineOne')}
            </motion.span>
            <motion.span variants={variants} transition={childTransition} className="block text-white/55">
              {t('titleLineTwo')}
            </motion.span>
          </h1>

          <motion.p variants={variants} transition={childTransition} className="mt-6 max-w-md text-base leading-relaxed text-white/65 sm:text-lg">
            {t('subtitle')}
          </motion.p>

          <motion.div variants={variants} transition={childTransition} className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/85 h-12 rounded-none px-7 text-sm font-semibold">
              <Link href={`/${locale}/products`}>
                {t('cta')}
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div variants={variants} transition={childTransition} className="mt-10 border-t border-white/15 pt-5">
            <TrustBadgeList items={t.raw('trustItems') as string[]} />
          </motion.div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, transform: 'translateY(16px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: EASE_OUT, delay: 0.15 }}
          className="lg:pb-1"
        >
          <HeroCarousel />
        </motion.div>
      </div>
    </section>
  );
}
