import { getProfile, updateProfile } from '@repo/api-sdk/endpoints/profile';

import { toStorefrontApiError } from '@/shared/lib/errors/toStorefrontApiError';
import type { User } from '@/shared/types/user';

export const profileActions = {
  get: async () => {
    try {
      return await getProfile();
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
  update: async (data: Partial<User>) => {
    try {
      return await updateProfile(data);
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
};
