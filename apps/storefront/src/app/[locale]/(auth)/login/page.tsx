import { Suspense } from 'react';

import { setRequestLocale } from 'next-intl/server';

import { LoginForm } from '@/app/[locale]/(auth)/_lib/components/LoginForm';

interface LoginPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-card rounded-xl border p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Đăng nhập</h1>
        <p className="text-muted-foreground mt-2 text-sm">Chào mừng trở lại!</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
