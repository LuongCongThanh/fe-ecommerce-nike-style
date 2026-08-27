// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
import { setRequestLocale } from 'next-intl/server';

import { ForgotPasswordForm } from '@/app/[locale]/(auth)/_lib/components/ForgotPasswordForm';

interface ForgotPasswordPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-card mx-auto w-full max-w-md rounded-xl border p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-balance">Quên mật khẩu</h1>
        <p className="text-muted-foreground mt-2 text-sm">Đặt lại mật khẩu của bạn</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
