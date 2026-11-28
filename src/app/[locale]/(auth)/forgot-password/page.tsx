// Hallmark redesign · design-system: DESIGN.md · scope: app page (functional, no enrichment)

import { ForgotPasswordForm } from '@/modules/auth/forgot-password/components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
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
