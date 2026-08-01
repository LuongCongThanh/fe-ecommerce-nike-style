import { z } from 'zod';

export const VIETNAM_PHONE_REGEX = /^(0|\+84)(3[2-9]|5[6-9]|7[06-9]|8[1-9]|9\d)\d{7}$/;

export const ShippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z.string().regex(VIETNAM_PHONE_REGEX, 'Số điện thoại không hợp lệ (VD: 0912345678)'),
  province: z.string().min(1, 'Vui lòng nhập tỉnh/thành phố'),
  district: z.string().min(1, 'Vui lòng nhập quận/huyện'),
  ward: z.string().min(1, 'Vui lòng nhập phường/xã'),
  detail: z.string().min(5, 'Địa chỉ chi tiết phải có ít nhất 5 ký tự'),
});

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
