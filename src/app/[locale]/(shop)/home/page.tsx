import { setRequestLocale } from 'next-intl/server';

import { SectionEditorialCollection } from '@/modules/home/components/SectionEditorialCollection';
import { SectionFeaturedCategories } from '@/modules/home/components/SectionFeaturedCategories';
import { SectionHero } from '@/modules/home/components/SectionHero';
import { SectionNewArrivals } from '@/modules/home/components/SectionNewArrivals';
import { SectionNewsletter } from '@/modules/home/components/SectionNewsletter';
import { SectionWhyChooseUs } from '@/modules/home/components/SectionWhyChooseUs';

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
