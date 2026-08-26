// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
// Apple Design pass · springs + instant feedback + materials (safe-mode: no new gesture code)
'use client';

import { formatCurrency } from '@repo/shared/utils';
import { Button } from '@repo/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/ui/form';
import { Input } from '@repo/ui/input';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { useCreateOrder } from '@/app/[locale]/(shop)/_lib/hooks/checkout/useCreateOrder';
import { useRedirectIfCartEmpty } from '@/app/[locale]/(shop)/_lib/hooks/checkout/useRedirectIfCartEmpty';
import { useReservation } from '@/app/[locale]/(shop)/_lib/hooks/checkout/useReservation';
import { useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import type { CheckoutInput } from '@/app/[locale]/(shop)/_lib/schemas/checkout';
import { SHIPPING_FEE_BY_METHOD } from '@/app/[locale]/(shop)/_lib/schemas/checkout';

type CheckoutValues = CheckoutInput;

export function CheckoutClient() {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const { items } = useCart();
  const reservation = useReservation(items);
  const createOrder = useCreateOrder(locale, reservation.reservationId);
  useRedirectIfCartEmpty(locale);

  const form = useFormContext<CheckoutValues>();
  const { register, handleSubmit } = form;

  const onSubmit = (data: CheckoutValues) => {
    createOrder.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Shipping Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">{t('shippingAddress')}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('fullName')}</FormLabel>
                <FormControl>
                  <Input autoComplete="name" placeholder="Nguyễn Văn A" state={fieldState.invalid ? 'error' : 'default'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('phoneNumber')}</FormLabel>
                <FormControl>
                  <Input autoComplete="tel" placeholder="0901234567" state={fieldState.invalid ? 'error' : 'default'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-full">
                <FormLabel>{t('address')}</FormLabel>
                <FormControl>
                  <Input autoComplete="street-address" placeholder="123 Đường ABC..." state={fieldState.invalid ? 'error' : 'default'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('city')}</FormLabel>
                <FormControl>
                  <Input state={fieldState.invalid ? 'error' : 'default'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="district"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('district')}</FormLabel>
                <FormControl>
                  <Input state={fieldState.invalid ? 'error' : 'default'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ward"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('ward')}</FormLabel>
                <FormControl>
                  <Input state={fieldState.invalid ? 'error' : 'default'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </motion.div>

      {/* Shipping & Payment Methods */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold">{t('shippingMethod')}</h2>
          <div className="space-y-3">
            <label className="has-checked:border-secondary-500 has-checked:bg-secondary-50 has-checked:ring-secondary-200 hover:border-secondary-300 active:scale-0.98 flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-4 transition-colors has-checked:ring-1">
              <div className="flex items-center gap-3">
                <input type="radio" value="standard" {...register('shippingMethod')} className="accent-secondary-600 size-4" />
                <div>
                  <p className="font-medium">{t('standard')}</p>
                  <p className="text-muted-foreground text-xs">3-5 ngày làm việc</p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-bold">{formatCurrency(SHIPPING_FEE_BY_METHOD.standard)}</span>
            </label>
            <label className="has-checked:border-secondary-500 has-checked:bg-secondary-50 has-checked:ring-secondary-200 hover:border-secondary-300 active:scale-0.98 flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-4 transition-colors has-checked:ring-1">
              <div className="flex items-center gap-3">
                <input type="radio" value="express" {...register('shippingMethod')} className="accent-secondary-600 size-4" />
                <div>
                  <p className="font-medium">{t('express')}</p>
                  <p className="text-muted-foreground text-xs">Trong vòng 24h</p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-bold">{formatCurrency(SHIPPING_FEE_BY_METHOD.express)}</span>
            </label>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold">{t('paymentMethod')}</h2>
          {/* MVP is COD-only, no payment gateway step (Decision #7) — nothing to choose between. */}
          <input type="hidden" value="cod" {...register('paymentMethod')} />
          <div className="border-secondary-200 bg-secondary-50 flex items-center gap-3 rounded-lg border p-4">
            <p className="font-medium">{t('cod')}</p>
          </div>
        </motion.div>
      </div>

      <CheckoutErrors reservationError={reservation.error} createOrderError={createOrder.error} />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center gap-4 pt-2">
        <motion.div className="w-full" whileTap={{ scale: 0.97 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
          <Button
            type="submit"
            size="lg"
            loading={createOrder.isPending}
            disabled={reservation.isPending || reservation.reservationId === null}
            aria-busy={createOrder.isPending}
            className="h-12 w-full text-base"
          >
            {createOrder.isPending ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" /> : null}
            {t('placeOrder')}
          </Button>
        </motion.div>
        <p role="status" aria-live="polite" className="sr-only">
          {createOrder.isPending ? 'Đang xử lý đơn hàng của bạn...' : ''}
        </p>
        <p className="text-muted-foreground text-center text-xs">{t('placeOrderDesc')}</p>
      </motion.div>
    </form>
  );
}

interface CheckoutErrorsProps {
  readonly reservationError: string | null;
  readonly createOrderError: unknown;
}

/** Split out of `CheckoutClient` to keep its cognitive complexity in check. */
function CheckoutErrors({ reservationError, createOrderError }: CheckoutErrorsProps): React.JSX.Element {
  return (
    <>
      {reservationError !== null && (
        <p role="alert" className="text-error-500 text-center text-sm">
          {reservationError}
        </p>
      )}
      {createOrderError !== null && (
        <p role="alert" className="text-error-500 text-center text-sm">
          {createOrderError instanceof Error && createOrderError.message.length > 0
            ? createOrderError.message
            : 'Đặt hàng thất bại. Vui lòng thử lại.'}
        </p>
      )}
    </>
  );
}
