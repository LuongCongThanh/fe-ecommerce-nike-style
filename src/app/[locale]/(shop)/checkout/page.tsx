'use client';

import { use } from 'react';

import { CheckoutScreen } from '@/modules/checkout/components/CheckoutScreen';

export default function CheckoutPage({ params }: { readonly params: Promise<{ locale: string }> }) {
  const { locale } = use(params);

  return <CheckoutScreen locale={locale} />;
}
