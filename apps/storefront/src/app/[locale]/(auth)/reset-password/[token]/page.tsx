// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
import { redirect } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';

import { ResetPasswordForm } from '@/app/[locale]/(auth)/_lib/components/ResetPasswordForm';
import { isValidResetPasswordRequest } from '@/app/[locale]/(auth)/_lib/schemas/auth';

interface ResetPasswordPageProps {
  readonly params: Promise<{ locale: string; token: string }>;
  readonly searchParams: Promise<{ uid?: string }>;
}

export default async function ResetPasswordPage({ params, searchParams }: ResetPasswordPageProps) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  const { uid } = await searchParams;

  if (!isValidResetPasswordRequest(uid)) {
    redirect(`/${locale}/forgot-password`);
  }

  return (
    <div className="bg-card rounded-xl border p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-balance">Đặt lại mật khẩu</h1>
        <p className="text-muted-foreground mt-2 text-sm">Tạo mật khẩu mới cho tài khoản của bạn</p>
      </div>
      <ResetPasswordForm token={token} uid={uid} />
    </div>
  );
}
