'use client';

import { Button } from '@repo/ui/button';
import { LogOut } from 'lucide-react';

import { useAuth } from '@/core/session/useAuth';

export function AdminNavbar(): React.JSX.Element {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <span className="text-muted-foreground text-sm">Xin chào, {user?.firstName ?? 'Admin'}</span>
      <Button variant="ghost" size="sm" onClick={logout}>
        <LogOut className="size-4" />
        Đăng xuất
      </Button>
    </header>
  );
}
