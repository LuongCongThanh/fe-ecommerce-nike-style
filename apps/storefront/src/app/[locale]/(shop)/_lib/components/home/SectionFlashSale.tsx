'use client';

import Link from 'next/link';

import { Button } from '@repo/ui/button';
import { ArrowRight, Zap } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { ProductCard } from '@/app/[locale]/(shop)/_lib/components/common/ProductCard';
import { Reveal } from '@/app/[locale]/(shop)/_lib/components/common/Reveal';
import { bestSellersData } from '@/app/[locale]/(shop)/_lib/data/home';

export function SectionFlashSale(): React.JSX.Element {
  const locale = useLocale();
  const t = useTranslations('home.flashSale');
  const flashSale = bestSellersData.slice(0, 4);

  return (
    <section className="container mx-auto py-(--space-section-flash-sale)">
      <Reveal className="bg-surface-inverse relative overflow-hidden rounded-4xl px-4 py-7 text-white sm:px-7 lg:p-9">
        <div aria-hidden="true" className="bg-brand-600/30 absolute -top-28 -right-20 size-72 rounded-full blur-3xl" />
        <div className="relative mb-7 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-brand-300 flex items-center gap-2 text-xs font-bold tracking-[0.16em] uppercase">
              <Zap className="size-4 fill-current" />
              {t('eyebrow')}
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{t('title')}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">{t('subtitle')}</p>
          </div>
          <Button
            asChild
            variant="outline"
            className="shrink-0 rounded-full border-white/20 bg-white/10 text-white hover:bg-white hover:text-neutral-950"
          >
            <Link href={`/${locale}/products?flash-sale=true`}>
              {t('cta')}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {flashSale.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              salePrice={product.salePrice}
              images={product.images}
              rating={product.rating}
              reviewCount={product.reviewCount}
              badges={product.badges}
              locale={locale}
            />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
