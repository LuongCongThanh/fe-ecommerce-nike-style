import { apiClient } from '../client/fetcher';
import { API_BASE_URL } from '../env/config';

const ADDRESS_API = {
  LIST: `${API_BASE_URL}/api/addresses/`,
  DETAIL: (id: string) => `${API_BASE_URL}/api/addresses/${id}/`,
  SET_DEFAULT: (id: string) => `${API_BASE_URL}/api/addresses/${id}/default/`,
} as const;

/** A Customer's saved shipping address (address book) — distinct from `ShippingAddress`, which is a one-off checkout form value. */
export interface StorefrontAddress {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault: boolean;
}

export type StorefrontAddressInput = Omit<StorefrontAddress, 'id'>;

export async function getAddresses(): Promise<StorefrontAddress[]> {
  return apiClient.get<StorefrontAddress[]>(ADDRESS_API.LIST);
}

export async function createAddress(data: StorefrontAddressInput): Promise<StorefrontAddress> {
  return apiClient.post<StorefrontAddress>(ADDRESS_API.LIST, data);
}

export async function updateAddress(id: string, data: StorefrontAddressInput): Promise<StorefrontAddress> {
  return apiClient.patch<StorefrontAddress>(ADDRESS_API.DETAIL(id), data);
}

export async function deleteAddress(id: string): Promise<void> {
  await apiClient.delete<void>(ADDRESS_API.DETAIL(id));
}

export async function setDefaultAddress(id: string): Promise<StorefrontAddress[]> {
  return apiClient.post<StorefrontAddress[]>(ADDRESS_API.SET_DEFAULT(id));
}
