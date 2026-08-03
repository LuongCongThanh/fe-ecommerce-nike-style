import { getProfile, updateProfile } from '@repo/api-sdk/endpoints/profile';
import type { User } from '@/shared/types/user';
import { toStorefrontApiError } from '@/shared/lib/errors/toStorefrontApiError';

export const profileActions = {
  get: async () => {
    try {
      return (await getProfile()) as User;
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
  update: async (data: Partial<User>) => {
    try {
      return (await updateProfile(data)) as User;
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
};
