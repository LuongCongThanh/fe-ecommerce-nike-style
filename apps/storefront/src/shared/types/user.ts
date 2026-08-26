import type { AuthUser } from '@repo/api-sdk/endpoints/auth';
import { z } from 'zod';

/**
 * The account domain type lives once, in `@repo/schemas/profile` — `AuthUser`/`StorefrontProfile` in
 * api-sdk both alias it already. `User` re-exports that same type under the name the rest of the
 * storefront (session, forms, hooks) already imports, so nothing importing `User` had to change.
 */
export type User = AuthUser;

export const LoginSchema = z.object({
  email: z.email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
});

export const RegisterSchema = LoginSchema.extend({
  firstName: z.string().min(1, 'Vui lòng nhập tên'),
  lastName: z.string().min(1, 'Vui lòng nhập họ'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
});

export const AuthTokenSchema = z.object({
  access: z.string(),
  refresh: z.string(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type AuthToken = z.infer<typeof AuthTokenSchema>;
