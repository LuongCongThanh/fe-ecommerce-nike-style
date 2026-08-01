import { setRequestLocale } from 'next-intl/server';

import { ForgotPasswordForm } from '@/app/[locale]/(auth)/_lib/components/ForgotPasswordForm';

interface ForgotPasswordPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-card rounded-xl border p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Quên mật khẩu</h1>
        <p className="text-muted-foreground mt-2 text-sm">Đặt lại mật khẩu của bạn</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
