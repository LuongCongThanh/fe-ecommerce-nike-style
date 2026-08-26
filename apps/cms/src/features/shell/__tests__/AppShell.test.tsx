import type { Permission, StaffRole } from '@repo/schemas/staff';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearStaffAuth, setStaffSession } from '@/core/session/staff-store';
import { AppShell } from '@/features/shell/AppShell';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

function staffWithRoles(roles: StaffRole[], permissions: Permission[]) {
  setStaffSession({
    staff: { id: 1, email: 'staff@cms.local', name: 'Staff', roles, isActive: true },
    permissions,
  });
}

afterEach(() => {
  clearStaffAuth();
});

describe('AppShell — menu visibility by permission (issue #24)', () => {
  beforeEach(() => {
    clearStaffAuth();
  });

  it('CMS_EDITOR sees Bài viết/Trang/Danh mục nội dung/Media', () => {
    staffWithRoles(['CMS_EDITOR'], ['content:read']);
    render(
      <AppShell>
        <p>content</p>
      </AppShell>,
    );

    expect(screen.getByRole('link', { name: /Bài viết/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Trang/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Danh mục nội dung/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Media/ })).toBeInTheDocument();
  });

  it('ADMIN_STAFF does not see the CMS content menu (no content:* permission)', () => {
    staffWithRoles(['ADMIN_STAFF'], ['catalog:read', 'order:read', 'category:read']);
    render(
      <AppShell>
        <p>content</p>
      </AppShell>,
    );

    expect(screen.queryByRole('link', { name: /Bài viết/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Trang/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Danh mục nội dung/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Media/ })).not.toBeInTheDocument();
  });

  it('SUPER_ADMIN sees every CMS menu item', () => {
    staffWithRoles(['SUPER_ADMIN'], ['content:read']);
    render(
      <AppShell>
        <p>content</p>
      </AppShell>,
    );

    expect(screen.getByRole('link', { name: /Bài viết/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Trang/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Danh mục nội dung/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Media/ })).toBeInTheDocument();
  });
});
