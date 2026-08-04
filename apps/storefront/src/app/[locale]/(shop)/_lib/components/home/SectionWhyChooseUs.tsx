import * as Icons from 'lucide-react';

import { homeBenefitsData } from '@/app/[locale]/(shop)/_lib/data/home';

export function SectionWhyChooseUs(): React.JSX.Element {
  return (
    <section className="border-border border-y py-10">
      <div className="container mx-auto px-4">
        <div className="divide-border grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {homeBenefitsData.map((benefit) => {
            const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }> | undefined>)[benefit.icon];
            return (
              <div key={benefit.id} className="flex items-start gap-3 px-0 py-5 sm:px-6 sm:first:pl-0 sm:last:pr-0">
                {Icon == null ? null : <Icon className="text-muted-foreground mt-0.5 size-5 shrink-0" />}
                <div className="flex flex-col gap-1">
                  <h3 className="text-foreground text-sm font-semibold">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
