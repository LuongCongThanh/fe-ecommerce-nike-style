import { z } from 'zod';

import { VIETNAM_PHONE_REGEX } from '@/shared/types/address';

export const addressSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  phoneNumber: z.string().regex(VIETNAM_PHONE_REGEX, 'Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)'),
  address: z.string().min(5, 'Vui lòng nhập địa chỉ'),
  city: z.string().min(1, 'Vui lòng chọn tỉnh/thành'),
  district: z.string().min(1, 'Vui lòng nhập quận/huyện'),
  ward: z.string().min(1, 'Vui lòng nhập phường/xã'),
});

export const shippingMethodSchema = z.enum(['standard', 'express']);
/** MVP is COD-only, no payment gateway step (Decision #7 — decision-log.md) — a literal union of one so there's nothing else to select. */
export const paymentMethodSchema = z.literal('cod');

export const checkoutSchema = addressSchema.extend({
  shippingMethod: shippingMethodSchema,
  paymentMethod: paymentMethodSchema,
  note: z.string().optional(),
  voucherCode: z.string().optional(),
});

export type ShippingMethod = z.infer<typeof shippingMethodSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const SHIPPING_FEE_BY_METHOD: Record<ShippingMethod, number> = {
  standard: 30000,
  express: 60000,
};
