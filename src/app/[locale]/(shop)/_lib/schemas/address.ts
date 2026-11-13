import { z } from 'zod';

import { ShippingAddressSchema } from '@/shared/types/address';

export const addressFormSchema = ShippingAddressSchema.extend({
  isDefault: z.boolean(),
});

export type AddressFormInput = z.infer<typeof addressFormSchema>;
