import * as Icons from 'lucide-react';
import { useTranslations } from 'next-intl';

import { homeBenefitsData } from '@/features/home/home-content';
import { Reveal } from '@/shared/ui/Reveal';

export function SectionWhyChooseUs(): React.JSX.Element {
  const t = useTranslations('home.benefits');

  return (
    <section className="bg-surface-inverse text-surface-inverse-foreground py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Was a bare grid of h3 tiles with no section-level h2 — a heading-level skip for
         * screen-reader heading navigation (UI/UX audit finding, home page § 2). */}
        <p className="text-brand-300 text-xs font-bold tracking-[0.18em] uppercase">{t('eyebrow')}</p>
        <h2 className="font-display mt-4 max-w-sm text-4xl font-black tracking-[-0.045em] text-balance sm:text-5xl">{t('sectionTitle')}</h2>
        <Reveal className="mt-12 grid grid-cols-1 gap-8 border-t border-white/15 pt-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {homeBenefitsData.map((benefit) => {
            const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }> | undefined>)[benefit.icon];
            return (
              // Icon sits inline with the heading (same row) instead of stacked beside a separate
              // text block, so this reads less like the generic icon-above/beside-copy feature-tile
              // shape (homepage-improvement-plan.md P2-2).
              <div key={benefit.id} className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  {Icon == null ? null : (
                    <span className="flex size-8 shrink-0 items-center justify-center border border-white/20">
                      <Icon className="size-4" />
                    </span>
                  )}
                  <h3 className="text-sm font-semibold">{t(`${benefit.id}.title`)}</h3>
                </div>
                <p className="text-sm leading-relaxed text-white/60">{t(`${benefit.id}.description`)}</p>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
