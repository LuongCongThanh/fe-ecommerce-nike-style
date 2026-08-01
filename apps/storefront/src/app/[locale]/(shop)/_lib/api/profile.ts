import { API } from '@/shared/constants/api-endpoints';
import { http } from '@/shared/lib/http/client';
import type { User } from '@/shared/types/user';

export const profileActions = {
  get: async () => http.get<User>(API.PROFILE.ME),
  update: async (data: Partial<User>) => http.patch<User>(API.PROFILE.UPDATE, data),
};
