import type { StorefrontAddress, StorefrontAddressInput } from '@repo/api-sdk/endpoints/address';
import { createAddress, deleteAddress, getAddresses, setDefaultAddress, updateAddress } from '@repo/api-sdk/endpoints/address';

import { toStorefrontApiError } from '@/shared/lib/errors/toStorefrontApiError';

export const addressActions = {
  list: async (): Promise<StorefrontAddress[]> => {
    try {
      return await getAddresses();
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
  create: async (data: StorefrontAddressInput): Promise<StorefrontAddress> => {
    try {
      return await createAddress(data);
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
  update: async (id: string, data: StorefrontAddressInput): Promise<StorefrontAddress> => {
    try {
      return await updateAddress(id, data);
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
  remove: async (id: string): Promise<void> => {
    try {
      await deleteAddress(id);
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
  setDefault: async (id: string): Promise<StorefrontAddress[]> => {
    try {
      return await setDefaultAddress(id);
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
};
