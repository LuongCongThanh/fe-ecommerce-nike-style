import { setRequestLocale } from 'next-intl/server';

import { SectionEditorialCollection } from '@/features/home/components/SectionEditorialCollection';
import { SectionFeaturedCategories } from '@/features/home/components/SectionFeaturedCategories';
import { SectionHero } from '@/features/home/components/SectionHero';
import { SectionNewArrivals } from '@/features/home/components/SectionNewArrivals';
import { SectionNewsletter } from '@/features/home/components/SectionNewsletter';
import { SectionWhyChooseUs } from '@/features/home/components/SectionWhyChooseUs';

export default async function HomePage({ params }: { readonly params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SectionHero />
      <SectionFeaturedCategories />
      <SectionEditorialCollection />
      <SectionNewArrivals />
      <SectionWhyChooseUs />
      <SectionNewsletter />
    </>
  );
}
