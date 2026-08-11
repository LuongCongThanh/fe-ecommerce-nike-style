import * as Icons from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Reveal } from '@/app/[locale]/(shop)/_lib/components/common/Reveal';
import { homeBenefitsData } from '@/app/[locale]/(shop)/_lib/data/home';

export function SectionWhyChooseUs(): React.JSX.Element {
  const t = useTranslations('home.benefits');

  return (
    <section className="border-border border-y py-(--space-section-why-choose-us)">
      <div className="container mx-auto px-4">
        <Reveal className="divide-border grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {homeBenefitsData.map((benefit) => {
            const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }> | undefined>)[benefit.icon];
            return (
              // Icon sits inline with the heading (same row) instead of stacked beside a separate
              // text block, so this reads less like the generic icon-above/beside-copy feature-tile
              // shape (homepage-improvement-plan.md P2-2).
              <div key={benefit.id} className="flex flex-col gap-2 px-0 py-5 sm:px-6 sm:first:pl-0 sm:last:pr-0">
                <div className="flex items-center gap-2.5">
                  {Icon == null ? null : (
                    <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full">
                      <Icon className="text-foreground size-4" />
                    </span>
                  )}
                  <h3 className="text-foreground text-sm font-semibold">{t(`${benefit.id}.title`)}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{t(`${benefit.id}.description`)}</p>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
