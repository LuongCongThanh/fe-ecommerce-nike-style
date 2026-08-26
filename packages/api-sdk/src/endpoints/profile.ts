import { ProfileSchema, ProfileUpdateInputSchema } from '@repo/schemas/profile';
import type { Profile, ProfileUpdateInput } from '@repo/schemas/profile';

import { apiClient } from '../client/fetcher';
import { API_BASE_URL } from '../env/config';

const PROFILE_API = {
  ME: `${API_BASE_URL}/api/auth/me/`,
  UPDATE: `${API_BASE_URL}/api/auth/me/update/`,
} as const;

// Domain type lives once in `@repo/schemas/profile`; re-exported under the storefront's existing
// `StorefrontProfile` name. See `orders.ts` for why (same convention, same reasoning).
export type StorefrontProfile = Profile;

export async function getProfile(): Promise<StorefrontProfile> {
  return apiClient.get<StorefrontProfile>(PROFILE_API.ME, undefined, { schema: ProfileSchema });
}

export async function updateProfile(data: ProfileUpdateInput): Promise<StorefrontProfile> {
  const parsed = ProfileUpdateInputSchema.parse(data);
  return apiClient.patch<StorefrontProfile>(PROFILE_API.UPDATE, parsed, { schema: ProfileSchema });
}
