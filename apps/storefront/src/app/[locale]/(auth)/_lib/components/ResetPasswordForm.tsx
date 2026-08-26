'use client';

// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@repo/shared/hooks/useToast';
import { Button } from '@repo/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/ui/form';
import { Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';

import { resetPasswordAction } from '@/app/[locale]/(auth)/_lib/api/auth';
import { ApiErrorAlert } from '@/app/[locale]/(auth)/_lib/components/ApiErrorAlert';
import { PasswordInput } from '@/app/[locale]/(auth)/_lib/components/PasswordInput';
import { useApiErrorMessage } from '@/app/[locale]/(auth)/_lib/hooks/useApiErrorMessage';
import type { ResetPasswordFormInput } from '@/app/[locale]/(auth)/_lib/schemas/auth';
import { ResetPasswordFormSchema } from '@/app/[locale]/(auth)/_lib/schemas/auth';
import { ApiError } from '@/shared/lib/errors/api-error';

interface ResetPasswordFormProps {
  readonly token: string;
  readonly uid: string;
}

export function ResetPasswordForm({ token, uid }: ResetPasswordFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const notify = useToast();
  const { apiError, setApiError, handleApiError } = useApiErrorMessage();

  const form = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: ResetPasswordFormInput) => {
    setApiError(null);
    try {
      await resetPasswordAction({ token, uid, password: values.password });
      router.push(`/${locale}/login`);
    } catch (err) {
      const fallbackMessage = 'Đặt lại mật khẩu thất bại. Link có thể đã hết hạn.';
      handleApiError(err, fallbackMessage);
      notify.error(err instanceof ApiError ? err.message : fallbackMessage);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ApiErrorAlert message={apiError} />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu mới</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Tối thiểu 8 ký tự" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Xác nhận mật khẩu mới</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Nhập lại mật khẩu mới" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {isSubmitting ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
        </Button>

        <p className="text-center text-sm">
          <Link href={`/${locale}/login`} className="text-secondary-600 hover:text-secondary-700 font-medium transition-colors">
            Quay lại đăng nhập
          </Link>
        </p>
      </form>
    </Form>
  );
}
