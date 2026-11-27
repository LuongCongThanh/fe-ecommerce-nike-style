// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)

import { RegisterForm } from '@/modules/auth/register/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="bg-card mx-auto w-full max-w-md rounded-xl border p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-balance">Tạo tài khoản</h1>
        <p className="text-muted-foreground mt-2 text-sm">Tham gia cùng chúng tôi hôm nay!</p>
      </div>
      <RegisterForm />
    </div>
  );
}
