import { createAddress, deleteAddress, getAddresses, setDefaultAddress, updateAddress } from '@repo/api-sdk/endpoints/address';

export const addressActions = {
  list: getAddresses,
  create: createAddress,
  update: updateAddress,
  remove: deleteAddress,
  setDefault: setDefaultAddress,
};
