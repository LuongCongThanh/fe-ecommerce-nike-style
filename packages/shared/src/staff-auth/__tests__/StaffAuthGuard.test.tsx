import type { Staff } from '@repo/schemas/staff';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createStaffAuthModule } from '../index';

const STAFF: Staff = { id: 1, email: 'super@admin.local', name: 'Super Admin', roles: ['SUPER_ADMIN'], isActive: true };

vi.mock('@repo/api-sdk/endpoints/staff', () => ({
  loginStaff: vi.fn(async () => ({ access: 'a', refresh: 'r', staff: STAFF, permissions: [] })),
  logoutStaff: vi.fn(async () => undefined),
}));

describe('StaffAuthGuard', () => {
  const push = vi.fn();
  const { StaffAuthGuard, clearStaffAuth, setStaffSession } = createStaffAuthModule({
    accessTokenCookie: 'test_access_token',
    useRouter: () => ({ push }),
  });

  beforeEach(() => {
    push.mockClear();
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

  it('renders children once a Staff session exists, without redirecting', () => {
    setStaffSession({ staff: STAFF, permissions: ['staff:read'] });

    render(
      <StaffAuthGuard>
        <p>Protected content</p>
      </StaffAuthGuard>,
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
