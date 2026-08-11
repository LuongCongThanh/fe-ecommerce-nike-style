'use client';

import React from 'react';
import Link from 'next/link';

import { Button } from '@repo/ui/button';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { HeroCarousel } from '@/app/[locale]/(shop)/_lib/components/home/HeroCarousel';
import { TrustBadgeList } from '@/app/[locale]/(shop)/_lib/components/home/TrustBadgeList';

const revealUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const reducedVariant = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};

export function SectionHero(): React.JSX.Element {
  const locale = useLocale();
  const t = useTranslations('home.hero');
  const prefersReducedMotion = useReducedMotion() === true;
  const variants = prefersReducedMotion ? reducedVariant : revealUp;
  const childTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0, 0, 0.2, 1] as const };

  return (
    <section className="bg-background relative isolate overflow-hidden border-b">
      <div aria-hidden="true" className="bg-accent-200/50 absolute -top-32 -left-32 size-96 rounded-full blur-3xl" />
      <div aria-hidden="true" className="bg-secondary-200/40 absolute right-0 bottom-0 size-80 rounded-full blur-3xl" />

      <div className="relative container mx-auto grid min-h-[calc(100dvh-7rem)] items-center gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.07 }}
          className="flex flex-col items-start"
        >
          <motion.span
            variants={variants}
            transition={childTransition}
            className="border-border bg-background/80 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.16em] uppercase shadow-sm backdrop-blur"
          >
            <span className="bg-brand-500 size-1.5 rounded-full" />
            {t('badge')}
          </motion.span>

          <h1 className="font-display text-foreground leading-0.94 mt-6 max-w-2xl text-5xl font-black tracking-[-0.055em] sm:text-6xl lg:text-6xl xl:text-7xl">
            <motion.span variants={variants} transition={childTransition} className="block">
              {t('titleLineOne')}
            </motion.span>
            <motion.span variants={variants} transition={childTransition} className="text-brand-600 block">
              {t('titleLineTwo')}
            </motion.span>
          </h1>

          <motion.p
            variants={variants}
            transition={childTransition}
            className="text-muted-foreground mt-6 max-w-lg text-base leading-relaxed sm:text-lg"
          >
            {t('subtitle')}
          </motion.p>

          <motion.div variants={variants} transition={childTransition} className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-7 text-sm font-semibold shadow-lg shadow-neutral-950/10">
              <Link href={`/${locale}/products`}>
                {t('cta')}
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-background/70 h-12 rounded-full px-7 text-sm font-semibold backdrop-blur">
              <Link href={`/${locale}/products?flash-sale=true`}>{t('ctaSale')}</Link>
            </Button>
          </motion.div>

          <motion.div variants={variants} transition={childTransition} className="border-border mt-8 border-t pt-5">
            <TrustBadgeList items={t.raw('trustItems') as string[]} tone="light" />
          </motion.div>
        </motion.div>

        <HeroCarousel />
      </div>
    </section>
  );
}
