'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import type { CheckoutInput } from '@/app/[locale]/(shop)/_lib/schemas/checkout';
import { checkoutSchema } from '@/app/[locale]/(shop)/_lib/schemas/checkout';

/** The top-level Checkout form — created once at the page level and shared, via `FormProvider`, with
 * both `CheckoutClient` (the fields) and `OrderSummary` (the submit button) below it. */
export function useCheckoutForm() {
  return useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingMethod: 'standard',
      paymentMethod: 'cod',
    },
  });
}
