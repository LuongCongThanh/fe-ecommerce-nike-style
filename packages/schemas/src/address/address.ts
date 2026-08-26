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
