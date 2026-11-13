import { apiClient } from '@/lib/api/client/fetcher';
import { API_BASE_URL } from '@/lib/api/env/config';
import type { Profile, ProfileUpdateInput } from '@/lib/schemas/profile/profile';
import { ProfileSchema, ProfileUpdateInputSchema } from '@/lib/schemas/profile/profile';

const PROFILE_API = {
  ME: `${API_BASE_URL}/api/auth/me/`,
  UPDATE: `${API_BASE_URL}/api/auth/me/update/`,
} as const;

// Domain type lives once in `@/lib/schemas/profile`; re-exported under the storefront's existing
// `StorefrontProfile` name. See `orders.ts` for why (same convention, same reasoning).
export type StorefrontProfile = Profile;

export async function getProfile(): Promise<StorefrontProfile> {
  return apiClient.get<StorefrontProfile>(PROFILE_API.ME, undefined, { schema: ProfileSchema });
}

export async function updateProfile(data: ProfileUpdateInput): Promise<StorefrontProfile> {
  const parsed = ProfileUpdateInputSchema.parse(data);
  return apiClient.patch<StorefrontProfile>(PROFILE_API.UPDATE, parsed, { schema: ProfileSchema });
}
