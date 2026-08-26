import { AuthSessionResponseSchema, RefreshSessionResponseSchema } from '@repo/schemas/auth';
import type { AuthSessionResponse, RefreshSessionResponse } from '@repo/schemas/auth';
import type { Profile } from '@repo/schemas/profile';

import { apiClient } from '../client/fetcher';
import { API_BASE_URL } from '../env/config';

const AUTH_API = {
  LOGIN: `${API_BASE_URL}/api/auth/login/`,
  REGISTER: `${API_BASE_URL}/api/auth/register/`,
  REFRESH: `${API_BASE_URL}/api/auth/refresh/`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout/`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/password/reset/`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/password/reset/confirm/`,
} as const;

// Domain type lives once in `@repo/schemas/profile`; re-exported under the storefront's existing
// `AuthUser` name — a login/register response's `user` is the same account Profile `GET /api/auth/me/`
// returns, so it's the same schema, not a fourth hand-typed shape. See `orders.ts` for the convention.
export type AuthUser = Profile;
export type { AuthSessionResponse, RefreshSessionResponse };

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ResetPasswordPayload {
  token: string;
  uid: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export async function login(payload: LoginPayload): Promise<AuthSessionResponse> {
  return apiClient.post<AuthSessionResponse>(AUTH_API.LOGIN, payload, {
    skipRefresh: true,
    schema: AuthSessionResponseSchema,
  });
}

export async function register(payload: RegisterPayload): Promise<AuthSessionResponse> {
  return apiClient.post<AuthSessionResponse>(AUTH_API.REGISTER, payload, {
    skipRefresh: true,
    schema: AuthSessionResponseSchema,
  });
}

/**
 * `refreshToken` is sent explicitly in the body rather than riding a cookie — mock-phase deviation
 * from ADR-0010, see decision-log.md Decision #90 and `packages/api-sdk/src/mocks/auth-fixtures.ts`.
 */
export async function refreshSession(refreshToken: string): Promise<RefreshSessionResponse> {
  return apiClient.post<RefreshSessionResponse>(
    AUTH_API.REFRESH,
    { refreshToken },
    {
      skipRefresh: true,
      schema: RefreshSessionResponseSchema,
    },
  );
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
  await apiClient.post<unknown>(AUTH_API.FORGOT_PASSWORD, payload, {
    skipRefresh: true,
  });
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  await apiClient.post<unknown>(
    AUTH_API.RESET_PASSWORD,
    {
      token: payload.token,
      uid: payload.uid,
      new_password1: payload.password,
      new_password2: payload.password,
    },
    {
      skipRefresh: true,
    },
  );
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post<unknown>(
    AUTH_API.LOGOUT,
    { refreshToken },
    {
      skipRefresh: true,
    },
  );
}
