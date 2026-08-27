'use client';

// Hallmark · icon-prefixed fields + remember-me synced with apps/admin/apps/cms's login (design.md
// § Variants) — same field treatment, storefront keeps its own react-hook-form/zod validation and
// live register/forgot-password links (no staff-only restrictions here).
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/button';
import { Checkbox } from '@repo/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/ui/form';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Loader2, Lock, Mail } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';

import { loginAction } from '@/app/[locale]/(auth)/_lib/api/auth';
import { ApiErrorAlert } from '@/app/[locale]/(auth)/_lib/components/ApiErrorAlert';
import { PasswordInput } from '@/app/[locale]/(auth)/_lib/components/PasswordInput';
import { useApiErrorMessage } from '@/app/[locale]/(auth)/_lib/hooks/useApiErrorMessage';
import type { LoginFormInput } from '@/app/[locale]/(auth)/_lib/schemas/auth';
import { LoginFormSchema } from '@/app/[locale]/(auth)/_lib/schemas/auth';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { apiError, setApiError, reportApiError } = useApiErrorMessage();
  const [rememberMe, setRememberMe] = useState(false);

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
      reportApiError(err, 'Đăng nhập thất bại. Vui lòng thử lại.');
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
                <div className="relative">
                  <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input type="email" placeholder="you@example.com" autoComplete="email" className="pl-9" {...field} />
                </div>
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
                <Link
                  href={`/${locale}/forgot-password`}
                  className="text-secondary-600 hover:text-secondary-700 text-xs font-medium transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2" />
                  <PasswordInput placeholder="••••••••" autoComplete="current-password" className="pl-9" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-2">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => {
              setRememberMe(checked === true);
            }}
          />
          <Label htmlFor="remember-me" className="text-muted-foreground font-normal">
            Ghi nhớ đăng nhập
          </Label>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          Chưa có tài khoản?{' '}
          <Link href={`/${locale}/register`} className="text-secondary-600 hover:text-secondary-700 font-medium transition-colors">
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </Form>
  );
}
