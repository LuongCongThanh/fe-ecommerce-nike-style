import { setRequestLocale } from 'next-intl/server';

import { SectionFeaturedCategories } from '@/app/[locale]/(shop)/home/components/SectionFeaturedCategories';
import { SectionHero } from '@/app/[locale]/(shop)/home/components/SectionHero';
import { SectionNewArrivals } from '@/app/[locale]/(shop)/home/components/SectionNewArrivals';
import { SectionNewsletter } from '@/app/[locale]/(shop)/home/components/SectionNewsletter';
import { SectionTestimonials } from '@/app/[locale]/(shop)/home/components/SectionTestimonials';
import { SectionWhyChooseUs } from '@/app/[locale]/(shop)/home/components/SectionWhyChooseUs';
import { isMockContentEnabled } from '@/shared/lib/mock-content';

export default async function HomePage({ params }: { readonly params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // homeTestimonialsData is placeholder copy (no verified customer source yet) — never render it in production.
  const showTestimonials = isMockContentEnabled();

  return (
    <>
      <SectionHero />
      <SectionFeaturedCategories />
      {/* Flash sale returns with SalePrice (slice B2), best sellers with Orders (slice C). */}
      <SectionNewArrivals />
      <SectionWhyChooseUs />
      {showTestimonials ? <SectionTestimonials /> : null}
      <SectionNewsletter />
    </>
  );
}
