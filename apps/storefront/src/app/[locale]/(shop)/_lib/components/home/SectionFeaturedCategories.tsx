'use client';

import { useLocale, useTranslations } from 'next-intl';

import { CategoryCard } from '@/app/[locale]/(shop)/_lib/components/common/CategoryCard';
import { SectionHeading } from '@/app/[locale]/(shop)/_lib/components/common/SectionHeading';
import { homeCategoriesData } from '@/app/[locale]/(shop)/_lib/data/home';

export function SectionFeaturedCategories(): React.JSX.Element {
  const locale = useLocale();
  const t = useTranslations('home.categories');
  const [featured, ...rest] = homeCategoriesData;

  return (
    <section className="bg-muted/40">
      <div className="container mx-auto px-4 py-(--space-section-categories) md:py-(--space-section-categories-lg)">
        <SectionHeading title={t('title')} subtitle={t('subtitle')} ctaLabel={t('viewAll')} ctaHref={`/${locale}/products`} />
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {featured != null ? (
            <div className="col-span-2 row-span-2 sm:col-span-2">
              <CategoryCard
                name={featured.name}
                image={featured.image}
                productCount={featured.productCount}
                countLabel={t('countLabel')}
                href={`/${locale}/products?category=${featured.slug}`}
              />
            </div>
          ) : null}
          {rest.map((cat) => (
            <CategoryCard
              key={cat.slug}
              name={cat.name}
              image={cat.image}
              productCount={cat.productCount}
              countLabel={t('countLabel')}
              href={`/${locale}/products?category=${cat.slug}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
