import { useTranslations } from 'next-intl';

import { NewsletterForm } from '@/features/home/components/NewsletterForm';

export function SectionNewsletter(): React.JSX.Element {
  const t = useTranslations('home.newsletter');

  return (
    <section className="border-border bg-background border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[0.8fr_1.2fr] md:items-end lg:px-8 lg:py-24">
        <div className="flex max-w-md flex-col gap-3">
          <span className="text-brand-600 text-xs font-bold tracking-[0.18em] uppercase">{t('eyebrow')}</span>
          <h2 className="font-display text-foreground text-4xl font-black tracking-[-0.045em] text-balance md:text-5xl">{t('title')}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed md:text-base">{t('subtitle')}</p>
        </div>
        <div className="w-full max-w-xl md:justify-self-end">
          <NewsletterForm
            submitLabel={t('submit')}
            emailLabel={t('emailLabel')}
            placeholder={t('placeholder')}
            invalidEmailMessage={t('invalidEmail')}
            successTitle={t('successTitle')}
            successDescription={t('successDescription')}
          />
        </div>
      </div>
    </section>
  );
}
