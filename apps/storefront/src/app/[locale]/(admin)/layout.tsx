import { AdminNavbar } from '@/app/[locale]/(admin)/_lib/components/layout/AdminNavbar';
import { AdminSidebar } from '@/app/[locale]/(admin)/_lib/components/layout/AdminSidebar';
import { AdminGuard } from '@/core/session/AdminGuard';

interface AdminLayoutProps {
  readonly children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps): React.JSX.Element {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1">
          <AdminNavbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
