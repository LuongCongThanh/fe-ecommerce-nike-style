import { useTranslations } from 'next-intl';

import { SectionHeading } from '@/app/[locale]/(shop)/_lib/components/common/SectionHeading';
import { TestimonialCard } from '@/app/[locale]/(shop)/_lib/components/home/TestimonialCard';
import { homeTestimonialsData } from '@/app/[locale]/(shop)/_lib/data/home';

export function SectionTestimonials(): React.JSX.Element {
  const t = useTranslations('home.testimonials');

  return (
    <section className="bg-muted/50">
      <div className="container mx-auto px-4 py-(--space-section-testimonials) md:py-(--space-section-testimonials-lg)">
        <SectionHeading title={t('title')} align="center" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {homeTestimonialsData.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              name={testimonial.name}
              avatar={testimonial.avatar}
              rating={testimonial.rating}
              quote={testimonial.quote}
              meta={testimonial.meta}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
