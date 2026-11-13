import { useTranslations } from 'next-intl';

import { NewsletterForm } from '@/app/[locale]/(shop)/_lib/components/home/NewsletterForm';

export function SectionNewsletter(): React.JSX.Element {
  const t = useTranslations('home.newsletter');

  return (
    <section className="bg-surface-inverse text-surface-inverse-foreground relative overflow-hidden">
      <div aria-hidden="true" className="bg-brand-600/20 absolute top-1/2 left-1/2 size-96 -translate-1/2 rounded-full blur-3xl" />
      <div className="relative container mx-auto flex flex-col items-center gap-7 px-4 py-(--space-section-newsletter) text-center md:py-(--space-section-newsletter-lg)">
        <div className="flex max-w-2xl flex-col items-center gap-3">
          <span className="text-brand-300 text-xs font-bold tracking-[0.18em] uppercase">{t('eyebrow')}</span>
          <h2 className="text-3xl font-black tracking-tight md:text-5xl">{t('title')}</h2>
          <p className="max-w-xl text-sm leading-relaxed text-neutral-400 md:text-base">{t('subtitle')}</p>
        </div>
        <div className="w-full max-w-xl">
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
