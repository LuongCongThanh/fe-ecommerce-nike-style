'use client';

// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
import { useState } from 'react';
import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/ui/form';
import { Input } from '@repo/ui/input';
import { Loader2, Mail } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';

import { forgotPasswordAction } from '@/app/[locale]/(auth)/_lib/api/auth';
import { ApiErrorAlert } from '@/app/[locale]/(auth)/_lib/components/ApiErrorAlert';
import { useApiErrorMessage } from '@/app/[locale]/(auth)/_lib/hooks/useApiErrorMessage';
import type { ForgotPasswordFormInput } from '@/app/[locale]/(auth)/_lib/schemas/auth';
import { ForgotPasswordFormSchema } from '@/app/[locale]/(auth)/_lib/schemas/auth';

export function ForgotPasswordForm() {
  const locale = useLocale();
  const { apiError, setApiError, reportApiError } = useApiErrorMessage();
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
      reportApiError(err, 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  if (submitted) {
    return (
      <div className="space-y-4 text-center">
        <div className="bg-success-50 mx-auto flex size-16 items-center justify-center rounded-full">
          <Mail className="text-success-700 size-8" />
        </div>
        <div>
          <p className="font-semibold">Kiểm tra email của bạn</p>
          <p className="text-muted-foreground mt-1 text-sm text-pretty">
            Chúng tôi đã gửi link đặt lại mật khẩu đến <strong className="text-foreground">{form.getValues('email')}</strong>
          </p>
        </div>
        <Link href={`/${locale}/login`} className="text-secondary-600 hover:text-secondary-700 block text-sm font-medium transition-colors">
          Quay lại đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ApiErrorAlert message={apiError} />

        <p className="text-muted-foreground text-sm text-pretty">Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.</p>

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

        <p className="text-muted-foreground text-center text-sm">
          Nhớ mật khẩu rồi?{' '}
          <Link href={`/${locale}/login`} className="text-secondary-600 hover:text-secondary-700 font-medium transition-colors">
            Đăng nhập
          </Link>
        </p>
      </form>
    </Form>
  );
}
