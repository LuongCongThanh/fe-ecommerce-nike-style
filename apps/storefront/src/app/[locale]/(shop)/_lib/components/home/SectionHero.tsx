'use client';

import Image from 'next/image';
import Link from 'next/link';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';

import { TrustBadgeList } from '@/app/[locale]/(shop)/_lib/components/home/TrustBadgeList';
import { homeHeroData } from '@/app/[locale]/(shop)/_lib/data/home';
import { Button } from '@/shared/components/base/button';

const revealUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function SectionHero(): React.JSX.Element {
  const locale = useLocale();
  const titleLines = homeHeroData.title.split('\n');

  return (
    <section className="relative isolate min-h-[70vh] overflow-hidden bg-neutral-950 text-white md:min-h-[85vh]">
      <Image src={homeHeroData.image} alt="" aria-hidden="true" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.09, delayChildren: 0.05 }}
        className="relative z-10 flex h-full min-h-[70vh] flex-col justify-end gap-5 px-4 pt-24 pb-10 sm:px-6 md:min-h-[85vh] md:px-10 md:pb-14 lg:px-16"
      >
        <motion.span
          variants={revealUp}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
          className="w-fit rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold tracking-wide text-white/80"
        >
          {homeHeroData.badge}
        </motion.span>

        <h1 className="font-display max-w-3xl text-5xl font-black tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
          {titleLines.map((line) => (
            <motion.span key={line} variants={revealUp} transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }} className="block">
              {line}
            </motion.span>
          ))}
        </h1>

        <motion.p variants={revealUp} transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }} className="max-w-md text-base text-white/70 md:text-lg">
          {homeHeroData.subtitle}
        </motion.p>

        <motion.div variants={revealUp} transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }} className="flex flex-wrap items-center gap-3 pt-2">
          <Button asChild size="lg" className="h-12 rounded-full bg-white px-8 text-base font-semibold text-neutral-950 hover:bg-white/90">
            <Link href={`/${locale}/products`}>{homeHeroData.cta}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-full border-white/30 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
          >
            <Link href={`/${locale}/products?flash-sale=true`}>{homeHeroData.ctaSale}</Link>
          </Button>
        </motion.div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 py-6 sm:px-6 md:px-10 lg:px-16">
        <TrustBadgeList items={homeHeroData.trustItems} />
      </div>
    </section>
  );
}
