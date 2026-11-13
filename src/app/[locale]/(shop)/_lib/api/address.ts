import { createAddress, deleteAddress, getAddresses, setDefaultAddress, updateAddress } from '@/lib/api/endpoints/address';

export const addressActions = {
  list: getAddresses,
  create: createAddress,
  update: updateAddress,
  remove: deleteAddress,
  setDefault: setDefaultAddress,
};
