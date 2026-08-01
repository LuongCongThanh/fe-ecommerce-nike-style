import { setRequestLocale } from 'next-intl/server';

import { RegisterForm } from '@/app/[locale]/(auth)/_lib/components/RegisterForm';

interface RegisterPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-card rounded-xl border p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Tạo tài khoản</h1>
        <p className="text-muted-foreground mt-2 text-sm">Tham gia cùng chúng tôi hôm nay!</p>
      </div>
      <RegisterForm />
    </div>
  );
}
