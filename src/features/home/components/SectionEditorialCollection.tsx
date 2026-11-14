import Image from 'next/image';
import Link from 'next/link';

import { ArrowUpRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Reveal } from '@/shared/ui/Reveal';

export function SectionEditorialCollection(): React.JSX.Element {
  const locale = useLocale();
  const t = useTranslations('home.editorial');

  return (
    <section className="border-border bg-background border-y">
      <Reveal className="mx-auto grid max-w-7xl gap-0 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-20">
        <div className="bg-muted relative min-h-100 overflow-hidden sm:min-h-130">
          <Image src="/images/categories/quan.jpg" alt={t('imageAlt')} fill sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover" />
        </div>
        <div className="border-border bg-muted/35 flex flex-col justify-between border p-7 sm:p-10 lg:border-l-0 lg:p-12">
          <div>
            <p className="text-secondary-600 text-xs font-bold tracking-[0.18em] uppercase">{t('eyebrow')}</p>
            <h2 className="font-display text-foreground mt-5 max-w-md text-4xl font-black tracking-[-0.045em] text-balance sm:text-5xl">
              {t('title')}
            </h2>
            <p className="text-muted-foreground mt-5 max-w-md text-base leading-relaxed">{t('description')}</p>
          </div>
          <Link
            href={`/${locale}/products?category=pants`}
            className="text-foreground border-foreground hover:text-secondary-600 focus-visible:ring-ring mt-10 inline-flex w-fit items-center gap-2 border-b pb-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            {t('cta')}
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
