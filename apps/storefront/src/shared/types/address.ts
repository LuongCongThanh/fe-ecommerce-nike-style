import { createAddressFormSchema } from '@repo/schemas/address';

export { VIETNAM_PHONE_REGEX } from '@repo/schemas/address';

/**
 * The shared address-book form shape with this app's Vietnamese copy. The field list itself is
 * `@repo/schemas`' — this module used to redeclare all six fields just to carry these messages.
 */
export const ShippingAddressSchema = createAddressFormSchema({
  fullName: 'Họ tên phải có ít nhất 2 ký tự',
  phone: 'Số điện thoại không hợp lệ (VD: 0912345678)',
  province: 'Vui lòng nhập tỉnh/thành phố',
  district: 'Vui lòng nhập quận/huyện',
  ward: 'Vui lòng nhập phường/xã',
  detail: 'Địa chỉ chi tiết phải có ít nhất 5 ký tự',
});

export type ShippingAddress = ReturnType<typeof createAddressFormSchema>['_output'];
