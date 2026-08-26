// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
import { PageShell } from '@/app/[locale]/(shop)/_lib/components/layout/PageShell';
import { ProfileClient } from '@/app/[locale]/(shop)/_lib/components/profile/ProfileClient';

export default function ProfilePage(): React.JSX.Element {
  return (
    <PageShell.Form>
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-balance">Thông tin cá nhân</h1>
        <p className="text-muted-foreground mt-1 text-sm">Cập nhật họ tên và số điện thoại liên hệ của bạn.</p>
      </div>
      <ProfileClient />
    </PageShell.Form>
  );
}
