'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { orderActions } from '@/app/[locale]/(shop)/_lib/api/order';
import { orderKeys } from '@/app/[locale]/(shop)/_lib/hooks/orders/orderKeys';
import { clearCart, useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import type { CheckoutInput } from '@/app/[locale]/(shop)/_lib/schemas/checkout';
import { ApiError } from '@/shared/lib/errors/api-error';

/**
 * `reservationId` ties Place Order to the Reservation created when Checkout started; `requestKey` is
 * generated once and reused across retries of the *same* submission (double-click, reload, network
 * retry), so the mock backend can replay the original order instead of creating a duplicate (issue #16
 * — idempotent Place Order).
 */
export const useCreateOrder = (locale: string, reservationId: string | null) => {
  const qc = useQueryClient();
  const router = useRouter();
  const { items } = useCart();
  // Generated fresh every render, but only the first one sticks — the ref keeps the same key across
  // re-renders and retries of this hook instance.
  const requestKeyRef = useRef(crypto.randomUUID());

  return useMutation({
    mutationFn: async (data: CheckoutInput) => {
      if (reservationId === null) {
        throw new Error('Chưa giữ chỗ sản phẩm — vui lòng thử lại.');
      }
      return orderActions.create({
        ...data,
        items: items.map((i) => ({ variantId: i.skuId, quantity: i.quantity })),
        reservationId,
        requestKey: requestKeyRef.current,
      });
    },
    onSuccess: async (order) => {
      clearCart();
      await qc.invalidateQueries({ queryKey: orderKeys.list() });
      toast.success('Đặt hàng thành công!');
      router.push(`/${locale}/checkout/success?orderId=${String(order.id)}`);
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Đặt hàng thất bại. Vui lòng thử lại.');
    },
  });
};
