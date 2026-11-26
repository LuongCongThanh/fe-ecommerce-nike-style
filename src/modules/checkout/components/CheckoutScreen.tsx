'use client';

import Link from 'next/link';

import { ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FormProvider } from 'react-hook-form';

import { CheckoutClient } from '@/modules/checkout/components/CheckoutClient';
import { OrderSummary } from '@/modules/checkout/components/OrderSummary';
import { useCheckoutForm } from '@/modules/checkout/hooks/useCheckoutForm';
import { PageShell } from '@/shared/components/PageShell';

/** `/checkout` screen: owns the form instance shared by the shipping form and the order summary sidebar. */
export function CheckoutScreen({ locale }: { readonly locale: string }): React.JSX.Element {
  const t = useTranslations('checkout');
  const form = useCheckoutForm();

  return (
    <FormProvider {...form}>
      <PageShell.Split sidebar={<OrderSummary />}>
        <Link
          href={`/${locale}/cart`}
          className="group text-secondary-600 hover:text-secondary-700 focus-visible:ring-secondary-400 mb-6 inline-flex items-center gap-2 rounded text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          {t('backToCart')}
        </Link>

        <h1 className="mb-8 border-b pb-6 text-3xl font-bold tracking-tight break-words sm:text-4xl">{t('title')}</h1>
        <CheckoutClient />
      </PageShell.Split>
    </FormProvider>
  );
}
