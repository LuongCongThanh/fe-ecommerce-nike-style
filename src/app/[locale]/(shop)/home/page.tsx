import { setRequestLocale } from 'next-intl/server';

import { SectionFeaturedCategories } from '@/features/home/components/SectionFeaturedCategories';
import { SectionHero } from '@/features/home/components/SectionHero';
import { SectionNewArrivals } from '@/features/home/components/SectionNewArrivals';
import { SectionNewsletter } from '@/features/home/components/SectionNewsletter';
import { SectionTestimonials } from '@/features/home/components/SectionTestimonials';
import { SectionWhyChooseUs } from '@/features/home/components/SectionWhyChooseUs';
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
