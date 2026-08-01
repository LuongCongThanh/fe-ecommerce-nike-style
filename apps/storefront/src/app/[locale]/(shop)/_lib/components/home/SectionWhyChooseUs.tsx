import * as Icons from 'lucide-react';

import { SectionHeading } from '@/app/[locale]/(shop)/_lib/components/common/SectionHeading';
import { homeBenefitsData } from '@/app/[locale]/(shop)/_lib/data/home';

export function SectionWhyChooseUs(): React.JSX.Element {
  return (
    <section className="bg-muted py-12 md:py-16">
      <div className="container mx-auto px-4">
        <SectionHeading title="Tại sao chọn chúng tôi?" align="center" />
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {homeBenefitsData.map((benefit) => {
            const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }> | undefined>)[benefit.icon];
            return (
              <div key={benefit.id} className="bg-card flex flex-col items-center gap-3 rounded-xl border p-6 text-center shadow-sm">
                {Icon == null ? null : <Icon className="text-primary size-8" />}
                <h3 className="text-foreground text-base font-semibold">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
