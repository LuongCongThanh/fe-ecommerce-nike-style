'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { formatCurrency } from '@repo/shared/utils';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { useCreateOrder } from '@/app/[locale]/(shop)/_lib/hooks/checkout/useCreateOrder';
import { useReservation } from '@/app/[locale]/(shop)/_lib/hooks/checkout/useReservation';
import { useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import type { CheckoutInput } from '@/app/[locale]/(shop)/_lib/schemas/checkout';
import { SHIPPING_FEE_BY_METHOD } from '@/app/[locale]/(shop)/_lib/schemas/checkout';

type CheckoutValues = CheckoutInput;

export function CheckoutClient() {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const router = useRouter();
  const { items, itemCount, isHydrated } = useCart();
  const reservation = useReservation(items);
  const createOrder = useCreateOrder(locale, reservation.reservationId);

  // Gated on `isHydrated` — both `items` (live-resolved via an async query) and the persisted
  // `itemCount` start out empty on every fresh mount, which made this redirect fire immediately even
  // for a cart that genuinely has items, before localStorage had a chance to load (issue #16).
  useEffect(() => {
    if (isHydrated && itemCount === 0) {
      router.replace(`/${locale}/cart`);
    }
  }, [isHydrated, itemCount, router, locale]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext<CheckoutValues>();

  const onSubmit = (data: CheckoutValues) => {
    createOrder.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Shipping Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border-b pb-8">
        <h2 className="mb-4 text-lg font-semibold">{t('shippingAddress')}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              {t('fullName')}
            </label>
            <Input
              id="fullName"
              autoComplete="name"
              {...register('fullName')}
              placeholder="Nguyễn Văn A"
              state={errors.fullName !== undefined ? 'error' : 'default'}
              aria-describedby={errors.fullName !== undefined ? 'fullName-error' : undefined}
            />
            {errors.fullName !== undefined && (
              <p id="fullName-error" className="text-error-500 text-xs">
                {t(`errors.${errors.fullName.message ?? 'required'}`)}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium">
              {t('phoneNumber')}
            </label>
            <Input
              id="phoneNumber"
              autoComplete="tel"
              {...register('phoneNumber')}
              placeholder="0901234567"
              state={errors.phoneNumber !== undefined ? 'error' : 'default'}
              aria-describedby={errors.phoneNumber !== undefined ? 'phoneNumber-error' : undefined}
            />
            {errors.phoneNumber !== undefined && (
              <p id="phoneNumber-error" className="text-error-500 text-xs">
                {t(`errors.${errors.phoneNumber.message ?? 'required'}`)}
              </p>
            )}
          </div>
          <div className="col-span-full space-y-2">
            <label htmlFor="address" className="text-sm font-medium">
              {t('address')}
            </label>
            <Input
              id="address"
              autoComplete="street-address"
              {...register('address')}
              placeholder="123 Đường ABC..."
              state={errors.address !== undefined ? 'error' : 'default'}
              aria-describedby={errors.address !== undefined ? 'address-error' : undefined}
            />
            {errors.address !== undefined && (
              <p id="address-error" className="text-error-500 text-xs">
                {t(`errors.${errors.address.message ?? 'required'}`)}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium">
              {t('city')}
            </label>
            <Input
              id="city"
              {...register('city')}
              state={errors.city !== undefined ? 'error' : 'default'}
              aria-describedby={errors.city !== undefined ? 'city-error' : undefined}
            />
            {errors.city !== undefined && (
              <p id="city-error" className="text-error-500 text-xs">
                {t(`errors.${errors.city.message ?? 'required'}`)}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="district" className="text-sm font-medium">
              {t('district')}
            </label>
            <Input
              id="district"
              {...register('district')}
              state={errors.district !== undefined ? 'error' : 'default'}
              aria-describedby={errors.district !== undefined ? 'district-error' : undefined}
            />
            {errors.district !== undefined && (
              <p id="district-error" className="text-error-500 text-xs">
                {t(`errors.${errors.district.message ?? 'required'}`)}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="ward" className="text-sm font-medium">
              {t('ward')}
            </label>
            <Input
              id="ward"
              {...register('ward')}
              state={errors.ward !== undefined ? 'error' : 'default'}
              aria-describedby={errors.ward !== undefined ? 'ward-error' : undefined}
            />
            {errors.ward !== undefined && (
              <p id="ward-error" className="text-error-500 text-xs">
                {t(`errors.${errors.ward.message ?? 'required'}`)}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Shipping & Payment Methods */}
      <div className="grid gap-8 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="border-b pb-8">
          <h2 className="mb-4 text-lg font-semibold">{t('shippingMethod')}</h2>
          <div className="space-y-4">
            <label className="has-checked:border-foreground has-checked:bg-muted hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors">
              <div className="flex items-center gap-3">
                <input type="radio" value="standard" {...register('shippingMethod')} className="accent-primary size-4" />
                <div>
                  <p className="font-medium">{t('standard')}</p>
                  <p className="text-muted-foreground text-xs">3-5 ngày làm việc</p>
                </div>
              </div>
              <span className="text-sm font-bold">{formatCurrency(SHIPPING_FEE_BY_METHOD.standard)}</span>
            </label>
            <label className="has-checked:border-foreground has-checked:bg-muted hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors">
              <div className="flex items-center gap-3">
                <input type="radio" value="express" {...register('shippingMethod')} className="accent-primary size-4" />
                <div>
                  <p className="font-medium">{t('express')}</p>
                  <p className="text-muted-foreground text-xs">Trong vòng 24h</p>
                </div>
              </div>
              <span className="text-sm font-bold">{formatCurrency(SHIPPING_FEE_BY_METHOD.express)}</span>
            </label>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="border-b pb-8">
          <h2 className="mb-4 text-lg font-semibold">{t('paymentMethod')}</h2>
          {/* MVP is COD-only, no payment gateway step (Decision #7) — nothing to choose between. */}
          <input type="hidden" value="cod" {...register('paymentMethod')} />
          <div className="bg-muted/50 flex items-center gap-3 rounded-lg border p-4">
            <p className="font-medium">{t('cod')}</p>
          </div>
        </motion.div>
      </div>

      <CheckoutErrors reservationError={reservation.error} createOrderError={createOrder.error} />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center gap-4 pt-4">
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
