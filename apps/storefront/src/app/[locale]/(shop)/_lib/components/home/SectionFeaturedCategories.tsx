'use client';

import { useLocale } from 'next-intl';

import { CategoryCard } from '@/app/[locale]/(shop)/_lib/components/common/CategoryCard';
import { SectionHeading } from '@/app/[locale]/(shop)/_lib/components/common/SectionHeading';
import { homeCategoriesData } from '@/app/[locale]/(shop)/_lib/data/home';

export function SectionFeaturedCategories(): React.JSX.Element {
  const locale = useLocale();
  const [featured, ...rest] = homeCategoriesData;

  return (
    <section className="bg-muted/50">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <SectionHeading title="Danh mục nổi bật" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {featured != null ? (
            <div className="col-span-2 row-span-2 sm:col-span-2">
              <CategoryCard
                name={featured.name}
                image={featured.image}
                productCount={featured.productCount}
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
              href={`/${locale}/products?category=${cat.slug}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
