import { resolvePermissions } from '@repo/schemas/staff';
import type { StaffRole } from '@repo/schemas/staff';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { I18nextProvider } from 'react-i18next';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppShell } from '@/shell/AppShell';
import i18n from '@/i18n';

// `core/session.ts` is Better Auth-backed (`@repo/shared/better-auth`) — mocks the app's own
// session module boundary rather than `better-auth/react` itself, same seam the old
// `setStaffSession`/`clearStaffAuth` test helpers used to sit behind.
let mockSignedInRoles: StaffRole[] | null = null;

vi.mock('@/core/session', () => ({
  useStaffAuth: () => {
    const permissions = mockSignedInRoles === null ? [] : resolvePermissions(mockSignedInRoles);
    return {
      staff: mockSignedInRoles === null ? null : { id: 1, email: 'staff@admin.local', name: 'Staff', roles: mockSignedInRoles, isActive: true },
      permissions,
      isLoggedIn: mockSignedInRoles !== null,
      isInitializing: false,
      hasPermission: (permission: string) => permissions.includes(permission as never),
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
    };
  },
  StaffAuthGuard: ({ children }: { readonly children: React.ReactNode }) => children,
  StaffAuthRuntimeProvider: ({ children }: { readonly children: React.ReactNode }) => children,
}));

vi.mock('@tanstack/react-router', () => ({
  useRouterState: () => '/',
  useNavigate: () => vi.fn(),
  Link: ({ to, children, ...props }: React.ComponentProps<'a'> & { readonly to?: string }) => (
    <a href={to ?? '#'} {...props}>
      {children}
    </a>
  ),
}));

function renderAppShell(children: React.ReactNode) {
  return render(
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <I18nextProvider i18n={i18n}>
        <AppShell>{children}</AppShell>
      </I18nextProvider>
    </ThemeProvider>,
  );
}

afterEach(() => {
  mockSignedInRoles = null;
});

describe('AppShell — menu visibility by permission (issue #18)', () => {
  it('ADMIN_STAFF sees Products/Orders/Categories', () => {
    mockSignedInRoles = ['ADMIN_STAFF'];
    renderAppShell(<p>content</p>);

    expect(screen.getByRole('link', { name: /Sản phẩm/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Đơn hàng/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Danh mục/ })).toBeInTheDocument();
  });

  it('CMS_EDITOR does not see the Admin business menu (catalog/order/category)', () => {
    mockSignedInRoles = ['CMS_EDITOR'];
    renderAppShell(<p>content</p>);

    expect(screen.queryByRole('link', { name: /Sản phẩm/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Đơn hàng/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Danh mục/ })).not.toBeInTheDocument();
  });

  it('SUPER_ADMIN sees every menu item', () => {
    mockSignedInRoles = ['SUPER_ADMIN'];
    renderAppShell(<p>content</p>);

    expect(screen.getByRole('link', { name: /Sản phẩm/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Đơn hàng/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Danh mục/ })).toBeInTheDocument();
  });
});
