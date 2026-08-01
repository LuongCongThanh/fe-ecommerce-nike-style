'use client';

import { useState } from 'react';
import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';

import { forgotPasswordAction } from '@/app/[locale]/(auth)/_lib/api/auth';
import { ApiErrorAlert } from '@/app/[locale]/(auth)/_lib/components/ApiErrorAlert';
import { useApiErrorMessage } from '@/app/[locale]/(auth)/_lib/hooks/useApiErrorMessage';
import type { ForgotPasswordFormInput } from '@/app/[locale]/(auth)/_lib/schemas/auth';
import { ForgotPasswordFormSchema } from '@/app/[locale]/(auth)/_lib/schemas/auth';
import { Button } from '@/shared/components/base/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/base/form';
import { Input } from '@/shared/components/base/input';

export function ForgotPasswordForm() {
  const locale = useLocale();
  const { apiError, setApiError, handleApiError } = useApiErrorMessage();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormInput>({
    resolver: zodResolver(ForgotPasswordFormSchema),
    defaultValues: { email: '' },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: ForgotPasswordFormInput) => {
    setApiError(null);
    try {
      await forgotPasswordAction(values.email);
      setSubmitted(true);
    } catch (err) {
      handleApiError(err, 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  if (submitted) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-500/10">
          <span className="text-3xl">📧</span>
        </div>
        <div>
          <p className="font-semibold">Kiểm tra email của bạn</p>
          <p className="mt-1 text-sm text-neutral-500">
            Chúng tôi đã gửi link đặt lại mật khẩu đến <strong>{form.getValues('email')}</strong>
          </p>
        </div>
        <Link href={`/${locale}/login`} className="text-foreground block text-sm underline hover:underline">
          Quay lại đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ApiErrorAlert message={apiError} />

        <p className="text-sm text-neutral-500">Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.</p>

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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {isSubmitting ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
        </Button>

        <p className="text-center text-sm text-neutral-500">
          Nhớ mật khẩu rồi?{' '}
          <Link href={`/${locale}/login`} className="text-foreground font-medium underline hover:underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </Form>
  );
}
