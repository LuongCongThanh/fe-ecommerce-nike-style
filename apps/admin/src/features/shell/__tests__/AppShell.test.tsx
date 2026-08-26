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
    staff: { id: 1, email: 'staff@admin.local', name: 'Staff', roles, isActive: true },
    permissions,
  });
}

afterEach(() => {
  clearStaffAuth();
});

describe('AppShell — menu visibility by permission (issue #18)', () => {
  beforeEach(() => {
    clearStaffAuth();
  });

  it('ADMIN_STAFF sees Products/Orders/Categories', () => {
    staffWithRoles(['ADMIN_STAFF'], ['catalog:read', 'order:read', 'category:read']);
    render(
      <AppShell>
        <p>content</p>
      </AppShell>,
    );

    expect(screen.getByRole('link', { name: /Sản phẩm/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Đơn hàng/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Danh mục/ })).toBeInTheDocument();
  });

  it('CMS_EDITOR does not see the Admin business menu (catalog/order/category)', () => {
    staffWithRoles(['CMS_EDITOR'], ['content:read']);
    render(
      <AppShell>
        <p>content</p>
      </AppShell>,
    );

    expect(screen.queryByRole('link', { name: /Sản phẩm/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Đơn hàng/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Danh mục/ })).not.toBeInTheDocument();
  });

  it('SUPER_ADMIN sees every menu item', () => {
    staffWithRoles(['SUPER_ADMIN'], ['catalog:read', 'order:read', 'category:read']);
    render(
      <AppShell>
        <p>content</p>
      </AppShell>,
    );

    expect(screen.getByRole('link', { name: /Sản phẩm/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Đơn hàng/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Danh mục/ })).toBeInTheDocument();
  });
});
