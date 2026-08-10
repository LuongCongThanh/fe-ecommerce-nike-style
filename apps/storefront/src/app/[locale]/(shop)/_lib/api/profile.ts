import { getProfile, updateProfile } from '@repo/api-sdk/endpoints/profile';

import { withApiErrorTranslation } from '@/shared/lib/errors/toStorefrontApiError';

export const profileActions = {
  get: withApiErrorTranslation(getProfile),
  update: withApiErrorTranslation(updateProfile),
};
