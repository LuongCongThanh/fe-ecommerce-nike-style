// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
// Apple Design pass · springs + instant feedback + materials (safe-mode: no new gesture code)
'use client';

import Image from 'next/image';

import { formatCurrency } from '@repo/shared/utils';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';

import { useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import type { CheckoutInput } from '@/app/[locale]/(shop)/_lib/schemas/checkout';
import { SHIPPING_FEE_BY_METHOD } from '@/app/[locale]/(shop)/_lib/schemas/checkout';

export function OrderSummary() {
  const t = useTranslations('checkout');
  const { items, total: subtotal } = useCart();
  const { control } = useFormContext<CheckoutInput>();

  const shippingMethod = useWatch({ control, name: 'shippingMethod' });
  const shippingFee = SHIPPING_FEE_BY_METHOD[shippingMethod];
  const total = subtotal + shippingFee;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card sticky top-24 rounded-xl border p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold tracking-tight">{t('cart.summary')}</h2>

      <div className="mb-6 max-h-72 space-y-4 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.skuId} className="flex gap-4">
            <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-lg">
              <Image src={item.image ?? '/images/placeholder.jpg'} alt={item.name} fill sizes="64px" className="object-cover" />
              <span className="bg-foreground text-background absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full text-[10px] font-bold">
                {item.quantity}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <h3 className="line-clamp-1 text-sm font-medium break-words">{item.name}</h3>
              <p className="text-muted-foreground text-xs">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t pt-4">
        <div className="flex justify-between gap-3 text-sm">
          <span className="text-muted-foreground">{t('cart.subtotal')}</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Phí vận chuyển</span>
          <span>{formatCurrency(shippingFee)}</span>
        </div>
        <div className="flex justify-between gap-3 border-t pt-3 text-lg font-bold">
          <span>{t('cart.total')}</span>
          <span className="text-brand-600">{formatCurrency(total)}</span>
        </div>
      </div>
    </motion.div>
  );
}
