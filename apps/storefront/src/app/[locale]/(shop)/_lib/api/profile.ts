import { getProfile, updateProfile } from '@repo/api-sdk/endpoints/profile';

export const profileActions = {
  get: getProfile,
  update: updateProfile,
};
