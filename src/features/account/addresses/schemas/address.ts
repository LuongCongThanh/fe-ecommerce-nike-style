import { z } from 'zod';

import { createAddressFormSchema } from '@/lib/schemas/address/address';

const ShippingAddressSchema = createAddressFormSchema({
  fullName: 'Họ tên phải có ít nhất 2 ký tự',
  phone: 'Số điện thoại không hợp lệ (VD: 0912345678)',
  province: 'Vui lòng nhập tỉnh/thành phố',
  district: 'Vui lòng nhập quận/huyện',
  ward: 'Vui lòng nhập phường/xã',
  detail: 'Địa chỉ chi tiết phải có ít nhất 5 ký tự',
});

export const addressFormSchema = ShippingAddressSchema.extend({
  isDefault: z.boolean(),
});

export type AddressFormInput = z.infer<typeof addressFormSchema>;
