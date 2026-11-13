import { getProfile, updateProfile } from '@/lib/api/endpoints/profile';

export const profileActions = {
  get: getProfile,
  update: updateProfile,
};
