'use client';

import { useLocale, useTranslations } from 'next-intl';

import { CategoryCard } from '@/app/[locale]/(shop)/_lib/components/common/CategoryCard';
import { Reveal } from '@/app/[locale]/(shop)/_lib/components/common/Reveal';
import { SectionHeading } from '@/app/[locale]/(shop)/_lib/components/common/SectionHeading';
import { placeholderImage } from '@/app/[locale]/(shop)/_lib/data/home';
import { useCategoryTree } from '@/app/[locale]/(shop)/_lib/hooks/categories/useCategoryTree';

const MAX_CATEGORIES = 7;

/** Root Categories from the API. Categories have no image in the API yet, so each gets a placeholder. */
export function SectionFeaturedCategories(): React.JSX.Element | null {
  const locale = useLocale();
  const t = useTranslations('home.categories');
  const { data } = useCategoryTree();
  const [featured, ...rest] = (data?.tree ?? []).slice(0, MAX_CATEGORIES);

  if (featured === undefined) return null;

  const card = (category: { slug: string; name: string }) => (
    <CategoryCard
      name={category.name}
      image={placeholderImage(category.slug, '600x600', category.name)}
      href={`/${locale}/categories/${category.slug}`}
    />
  );

  return (
    <section className="bg-muted/40">
      <Reveal className="container mx-auto px-4 py-(--space-section-categories) md:py-(--space-section-categories-lg)">
        <SectionHeading title={t('title')} subtitle={t('subtitle')} ctaLabel={t('viewAll')} ctaHref={`/${locale}/products`} />
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
          <div className="col-span-2 row-span-2 sm:col-span-2">{card(featured)}</div>
          {rest.map((category) => (
            <div key={category.id}>{card(category)}</div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
