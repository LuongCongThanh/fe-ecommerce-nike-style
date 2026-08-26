// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
'use client';

import { use } from 'react';
import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';

import { CheckoutClient } from '@/app/[locale]/(shop)/_lib/components/checkout/CheckoutClient';
import { OrderSummary } from '@/app/[locale]/(shop)/_lib/components/checkout/OrderSummary';
import { PageShell } from '@/app/[locale]/(shop)/_lib/components/layout/PageShell';
import type { CheckoutInput } from '@/app/[locale]/(shop)/_lib/schemas/checkout';
import { checkoutSchema } from '@/app/[locale]/(shop)/_lib/schemas/checkout';

export default function CheckoutPage({ params }: { readonly params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations('checkout');

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingMethod: 'standard',
      paymentMethod: 'cod',
    },
  });

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
