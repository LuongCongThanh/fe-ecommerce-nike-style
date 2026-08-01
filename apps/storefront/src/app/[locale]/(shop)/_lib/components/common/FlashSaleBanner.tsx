import Link from 'next/link';

import { useTranslations } from 'next-intl';

import { Button } from '@/shared/components/base/button';

export function FlashSaleBanner() {
  const t = useTranslations('home');

  return (
    <section className="bg-secondary-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <div className="text-white">
          <p className="text-sm font-semibold tracking-widest uppercase opacity-80">{t('flashSale.badge')}</p>
          <h2 className="text-2xl font-extrabold">{t('flashSale.title')}</h2>
          <p className="mt-1 text-sm opacity-80">{t('flashSale.subtitle')}</p>
        </div>
        <Button asChild size="lg" className="text-secondary-600 shrink-0 bg-white hover:bg-neutral-100">
          <Link href="/products?category=sale">{t('flashSale.cta')}</Link>
        </Button>
      </div>
    </section>
  );
}
