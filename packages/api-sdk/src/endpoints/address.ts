import { AddressListSchema, AddressSchema } from '@repo/schemas/address';
import type { Address, AddressInput } from '@repo/schemas/address';

import { apiClient } from '../client/fetcher';
import { API_BASE_URL } from '../env/config';

const ADDRESS_API = {
  LIST: `${API_BASE_URL}/api/addresses/`,
  DETAIL: (id: string) => `${API_BASE_URL}/api/addresses/${id}/`,
  SET_DEFAULT: (id: string) => `${API_BASE_URL}/api/addresses/${id}/default/`,
} as const;

// Domain type lives once in `@repo/schemas/address`; re-exported under the storefront's existing
// `StorefrontAddress*` names. See `orders.ts` for why (same convention, same reasoning).
export type StorefrontAddress = Address;
export type StorefrontAddressInput = AddressInput;

export async function getAddresses(): Promise<StorefrontAddress[]> {
  return apiClient.get<StorefrontAddress[]>(ADDRESS_API.LIST, undefined, { schema: AddressListSchema });
}

export async function createAddress(data: StorefrontAddressInput): Promise<StorefrontAddress> {
  return apiClient.post<StorefrontAddress>(ADDRESS_API.LIST, data, { schema: AddressSchema });
}

export async function updateAddress(id: string, data: StorefrontAddressInput): Promise<StorefrontAddress> {
  return apiClient.patch<StorefrontAddress>(ADDRESS_API.DETAIL(id), data, { schema: AddressSchema });
}

export async function deleteAddress(id: string): Promise<void> {
  await apiClient.delete<unknown>(ADDRESS_API.DETAIL(id));
}

export async function setDefaultAddress(id: string): Promise<StorefrontAddress[]> {
  return apiClient.post<StorefrontAddress[]>(ADDRESS_API.SET_DEFAULT(id), undefined, { schema: AddressListSchema });
}
