import { redirect } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';

import { ResetPasswordForm } from '@/app/[locale]/(auth)/_lib/components/ResetPasswordForm';

interface ResetPasswordPageProps {
  readonly params: Promise<{ locale: string; token: string }>;
  readonly searchParams: Promise<{ uid?: string }>;
}

export default async function ResetPasswordPage({ params, searchParams }: ResetPasswordPageProps) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  const { uid } = await searchParams;

  if (uid === undefined || uid.length === 0) {
    redirect(`/${locale}/forgot-password`);
  }

  return (
    <div className="bg-card rounded-xl border p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Đặt lại mật khẩu</h1>
        <p className="text-muted-foreground mt-2 text-sm">Tạo mật khẩu mới cho tài khoản của bạn</p>
      </div>
      <ResetPasswordForm token={token} uid={uid} />
    </div>
  );
}
