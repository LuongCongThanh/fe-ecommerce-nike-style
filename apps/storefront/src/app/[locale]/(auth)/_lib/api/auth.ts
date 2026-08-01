import { callAuthRoute } from '@/core/session/auth-route-client';
import { clearAuth, setAccessToken, setUser } from '@/core/session/auth-store';
import { API } from '@/shared/constants/api-endpoints';
import { http } from '@/shared/lib/http/client';
import type { AuthToken, User } from '@/shared/types/user';

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

export async function loginAction(payload: LoginPayload): Promise<User> {
  const data = await callAuthRoute<{ user: User; access: string }>(API.AUTH.LOGIN, payload);
  setAccessToken(data.access);
  setUser(data.user);
  return data.user;
}

export async function registerAction(payload: RegisterPayload): Promise<User> {
  const data = await callAuthRoute<{ user: User; access: string }>(API.AUTH.REGISTER, payload);
  setAccessToken(data.access);
  setUser(data.user);
  return data.user;
}

export async function forgotPasswordAction(email: string): Promise<void> {
  await http.post<unknown>(API.AUTH.FORGOT_PASSWORD, { email });
}

export async function resetPasswordAction(payload: { token: string; uid: string; password: string }): Promise<void> {
  await http.post<AuthToken>(API.AUTH.RESET_PASSWORD, {
    token: payload.token,
    uid: payload.uid,
    new_password1: payload.password,
    new_password2: payload.password,
  });
}

export async function logoutAction(): Promise<void> {
  clearAuth();
  await fetch(API.AUTH.LOGOUT, { method: 'POST' }).catch(() => undefined);
}
