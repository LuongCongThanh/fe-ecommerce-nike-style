import { PageShell } from '@/app/[locale]/(shop)/_lib/components/layout/PageShell';
import { ProfileClient } from '@/app/[locale]/(shop)/_lib/components/profile/ProfileClient';

export default function ProfilePage(): React.JSX.Element {
  return (
    <PageShell.Form>
      <h1 className="mb-6 text-2xl font-bold">Thông tin cá nhân</h1>
      <ProfileClient />
    </PageShell.Form>
  );
}
