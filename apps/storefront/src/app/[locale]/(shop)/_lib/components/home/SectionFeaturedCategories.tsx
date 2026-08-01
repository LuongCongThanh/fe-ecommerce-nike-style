'use client';

import { useLocale } from 'next-intl';

import { CategoryCard } from '@/app/[locale]/(shop)/_lib/components/common/CategoryCard';
import { SectionHeading } from '@/app/[locale]/(shop)/_lib/components/common/SectionHeading';
import { homeCategoriesData } from '@/app/[locale]/(shop)/_lib/data/home';

export function SectionFeaturedCategories(): React.JSX.Element {
  const locale = useLocale();
  const categories = homeCategoriesData;

  return (
    <section className="bg-muted/50">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <SectionHeading title="Danh mục nổi bật" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.slug}
              name={cat.name}
              image={cat.image}
              productCount={cat.productCount}
              href={`/${locale}/products?category=${cat.slug}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
