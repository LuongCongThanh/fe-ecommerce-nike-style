import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const push = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('@repo/api-sdk/endpoints/staff', () => ({
  loginStaff: vi.fn(),
  logoutStaff: vi.fn(),
}));

// Static import so it resolves through the mocks above (vi.mock calls are hoisted above imports).
const { StaffAuthGuard, clearStaffAuth, setStaffSession } = await import('@/core/session');

/**
 * Guard redirect wired through cms's own `@/core/session` (real `CMS_ACCESS_TOKEN_COOKIE` +
 * `@/i18n/navigation`'s `useRouter`), not the app-agnostic factory test in
 * `@repo/shared/staff-auth/__tests__/StaffAuthGuard.test.tsx` — closes the "FE-INT test cho guard
 * redirect ... riêng cho CMS" acceptance criterion of issue #24.
 */
describe('cms StaffAuthGuard', () => {
  beforeEach(() => {
    push.mockClear();
    // `status` starts 'initializing' in the shared module's store — clear() moves it to 'anonymous'
    // so the guard's redirect effect actually runs instead of rendering null forever.
    clearStaffAuth();
  });

  afterEach(() => {
    clearStaffAuth();
  });

  it('redirects to /login and does not render children when there is no session', async () => {
    render(
      <StaffAuthGuard>
        <p>Protected content</p>
      </StaffAuthGuard>,
    );

    await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders children once a CMS_EDITOR session exists, without redirecting', () => {
    setStaffSession({
      staff: { id: 1, email: 'editor@cms.local', name: 'Editor', roles: ['CMS_EDITOR'], isActive: true },
      permissions: ['content:read'],
    });

    render(
      <StaffAuthGuard>
        <p>Protected content</p>
      </StaffAuthGuard>,
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
