import { createAddress, deleteAddress, getAddresses, setDefaultAddress, updateAddress } from '@repo/api-sdk/endpoints/address';

import { withApiErrorTranslation } from '@/shared/lib/errors/toStorefrontApiError';

export const addressActions = {
  list: withApiErrorTranslation(getAddresses),
  create: withApiErrorTranslation(createAddress),
  update: withApiErrorTranslation(updateAddress),
  remove: withApiErrorTranslation(deleteAddress),
  setDefault: withApiErrorTranslation(setDefaultAddress),
};
