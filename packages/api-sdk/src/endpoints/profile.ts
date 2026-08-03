import { apiClient } from '../client/fetcher';
import { API_BASE_URL } from '../env/config';

const PROFILE_API = {
  ME: `${API_BASE_URL}/api/auth/me/`,
  UPDATE: `${API_BASE_URL}/api/auth/me/update/`,
} as const;

export interface StorefrontProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar: string | null;
  role: 'customer' | 'admin' | 'staff';
  isActive: boolean;
  createdAt: string;
}

export async function getProfile(): Promise<StorefrontProfile> {
  return apiClient.get<StorefrontProfile>(PROFILE_API.ME);
}

export async function updateProfile(data: Partial<StorefrontProfile>): Promise<StorefrontProfile> {
  return apiClient.patch<StorefrontProfile>(PROFILE_API.UPDATE, data);
}
