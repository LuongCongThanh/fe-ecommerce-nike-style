import { z } from 'zod';

import { LoginSchema } from '@/shared/types/user';

// Login form: password.min(1) intentional — shows "please enter" UX, not "8 chars min"
export const LoginFormSchema = LoginSchema.extend({
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

// Register form: derives email+password from LoginSchema, adds register-specific fields
export const RegisterFormSchema = LoginSchema.extend({
  firstName: z.string().min(1, 'Vui lòng nhập tên'),
  lastName: z.string().min(1, 'Vui lòng nhập họ'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
});

export const ForgotPasswordFormSchema = z.object({
  email: z.email('Email không hợp lệ'),
});

export const ResetPasswordFormSchema = z
  .object({
    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

export type LoginFormInput = z.infer<typeof LoginFormSchema>;
export type RegisterFormInput = z.infer<typeof RegisterFormSchema>;
export type ForgotPasswordFormInput = z.infer<typeof ForgotPasswordFormSchema>;
export type ResetPasswordFormInput = z.infer<typeof ResetPasswordFormSchema>;

/** A reset-password link is only valid with both a token (route param) and a `uid` (query param) — the
 * page redirects to `/forgot-password` instead of rendering a form that can never succeed. */
export function isValidResetPasswordRequest(uid: string | undefined): uid is string {
  return uid !== undefined && uid.length > 0;
}
