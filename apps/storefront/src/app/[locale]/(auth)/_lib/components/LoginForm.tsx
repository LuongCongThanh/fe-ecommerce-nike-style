'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';

import { loginAction } from '@/app/[locale]/(auth)/_lib/api/auth';
import { ApiErrorAlert } from '@/app/[locale]/(auth)/_lib/components/ApiErrorAlert';
import { useApiErrorMessage } from '@/app/[locale]/(auth)/_lib/hooks/useApiErrorMessage';
import type { LoginFormInput } from '@/app/[locale]/(auth)/_lib/schemas/auth';
import { LoginFormSchema } from '@/app/[locale]/(auth)/_lib/schemas/auth';
import { Button } from '@/shared/components/base/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/base/form';
import { Input } from '@/shared/components/base/input';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { apiError, setApiError, handleApiError } = useApiErrorMessage();

  const form = useForm<LoginFormInput>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: LoginFormInput) => {
    setApiError(null);
    try {
      await loginAction({ email: values.email, password: values.password });
      const returnUrl = searchParams.get('returnUrl');
      router.push(returnUrl !== null && returnUrl.length > 0 ? returnUrl : `/${locale}/home`);
    } catch (err) {
      handleApiError(err, 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ApiErrorAlert message={apiError} />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Mật khẩu</FormLabel>
                <Link href={`/${locale}/forgot-password`} className="text-foreground text-xs underline hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <FormControl>
                <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>

        <p className="text-center text-sm text-neutral-500">
          Chưa có tài khoản?{' '}
          <Link href={`/${locale}/register`} className="text-foreground font-medium underline hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </Form>
  );
}
