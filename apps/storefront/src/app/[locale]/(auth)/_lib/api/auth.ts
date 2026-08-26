import { forgotPassword, login, register, resetPassword } from '@repo/api-sdk/endpoints/auth';

import { setAccessToken, setRefreshToken, setUser } from '@/core/session/auth-store';
import { ensureApiMockingReady } from '@/shared/lib/api-mocking';
import type { User } from '@/shared/types/user';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// No `toStorefrontUser` mapper here — `AuthSessionResponse['user']` (api-sdk's `AuthUser`) and the
// storefront's `User` are the same `@repo/schemas/profile` type, not two shapes that happen to match.
export async function loginAction(payload: LoginPayload): Promise<User> {
  await ensureApiMockingReady();
  const data = await login(payload);
  setAccessToken(data.access);
  setRefreshToken(data.refresh);
  setUser(data.user);
  return data.user;
}

export async function registerAction(payload: RegisterPayload): Promise<User> {
  await ensureApiMockingReady();
  const data = await register(payload);
  setAccessToken(data.access);
  setRefreshToken(data.refresh);
  setUser(data.user);
  return data.user;
}

export async function forgotPasswordAction(email: string): Promise<void> {
  await ensureApiMockingReady();
  await forgotPassword({ email });
}

export async function resetPasswordAction(payload: { token: string; uid: string; password: string }): Promise<void> {
  await ensureApiMockingReady();
  await resetPassword({
    token: payload.token,
    uid: payload.uid,
    password: payload.password,
  });
}
