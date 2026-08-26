import type { Staff } from '@repo/schemas/staff';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StaffAuthGuard } from '@/core/session/StaffAuthGuard';
import { clearStaffAuth, setStaffSession } from '@/core/session/staff-store';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const STAFF: Staff = { id: 3, email: 'editor@cms.local', name: 'CMS Editor', roles: ['CMS_EDITOR'], isActive: true };

beforeEach(() => {
  push.mockClear();
  clearStaffAuth();
});

afterEach(() => {
  clearStaffAuth();
});

describe('StaffAuthGuard', () => {
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
    setStaffSession({ staff: STAFF, permissions: ['content:read'] });

    render(
      <StaffAuthGuard>
        <p>Protected content</p>
      </StaffAuthGuard>,
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
