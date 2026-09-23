import { z } from 'zod';

/** A Customer's saved shipping address (address book) — distinct from a one-off checkout form value. */
export const AddressSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  phone: z.string(),
  province: z.string(),
  district: z.string(),
  ward: z.string(),
  detail: z.string(),
  isDefault: z.boolean(),
});

export const AddressListSchema = z.array(AddressSchema);

export const AddressInputSchema = AddressSchema.omit({ id: true });

export type Address = z.infer<typeof AddressSchema>;
export type AddressInput = z.infer<typeof AddressInputSchema>;

export const VIETNAM_PHONE_REGEX = /^(0|\+84)(3[2-9]|5[6-9]|7[06-9]|8[1-9]|9\d)\d{7}$/;

/** One message per address field, supplied by the app in its own locale. */
export interface AddressFormMessages {
  readonly fullName: string;
  readonly phone: string;
  readonly province: string;
  readonly district: string;
  readonly ward: string;
  readonly detail: string;
}

/**
 * The address-book *form* schema: the same six fields {@link AddressSchema} carries, with validation
 * attached and its copy supplied by the caller. The storefront used to declare these six fields a
 * second time purely to attach Vietnamese messages, which let the two shapes drift independently;
 * the shape lives here now and only the copy crosses the seam.
 */
export function createAddressFormSchema(messages: AddressFormMessages) {
  return z.object({
    fullName: z.string().min(2, messages.fullName),
    phone: z.string().regex(VIETNAM_PHONE_REGEX, messages.phone),
    province: z.string().min(1, messages.province),
    district: z.string().min(1, messages.district),
    ward: z.string().min(1, messages.ward),
    detail: z.string().min(5, messages.detail),
  });
}
