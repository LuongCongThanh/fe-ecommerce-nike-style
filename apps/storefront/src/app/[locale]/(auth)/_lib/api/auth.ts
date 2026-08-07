import { type AuthSessionResponse, forgotPassword, login, register, resetPassword } from '@repo/api-sdk/endpoints/auth';

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

function toStorefrontUser(user: AuthSessionResponse['user']): User {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export async function loginAction(payload: LoginPayload): Promise<User> {
  await ensureApiMockingReady();
  const data = await login(payload);
  const user = toStorefrontUser(data.user);
  setAccessToken(data.access);
  setRefreshToken(data.refresh);
  setUser(user);
  return user;
}

export async function registerAction(payload: RegisterPayload): Promise<User> {
  await ensureApiMockingReady();
  const data = await register(payload);
  const user = toStorefrontUser(data.user);
  setAccessToken(data.access);
  setRefreshToken(data.refresh);
  setUser(user);
  return user;
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
