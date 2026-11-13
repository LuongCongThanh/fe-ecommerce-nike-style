import { useTranslations } from 'next-intl';

import { TestimonialCard } from '@/app/[locale]/(shop)/home/components/TestimonialCard';
import { homeTestimonialsData } from '@/app/[locale]/(shop)/home/home-content';
import { Reveal } from '@/shared/ui/Reveal';
import { SectionHeading } from '@/shared/ui/SectionHeading';

export function SectionTestimonials(): React.JSX.Element {
  const t = useTranslations('home.testimonials');

  return (
    <section className="bg-muted/50">
      <Reveal className="container mx-auto px-4 py-(--space-section-testimonials) md:py-(--space-section-testimonials-lg)">
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
      </Reveal>
    </section>
  );
}
