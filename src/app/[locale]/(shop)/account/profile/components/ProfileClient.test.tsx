import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { resetAuthRuntime } from '@/lib/api/client/fetcher';
import { encodeAccessToken } from '@/lib/api/mocks/auth-fixtures';
import { registerAuthRuntimeAdapter } from '@/lib/api/client/runtime';
import { server } from '@/lib/api/testing/msw-server';

import { renderWithProviders } from '@/helpers/render';
import { ProfileClient } from '@/app/[locale]/(shop)/account/profile/components/ProfileClient';

// Demo account seeded in `src/lib/api/mocks/auth-fixtures.ts`.
const ACCOUNT_USER_ID = 1;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetAuthRuntime();
});
afterAll(() => server.close());

function loginAsDemoAccount() {
  registerAuthRuntimeAdapter({
    getAccessToken: () => encodeAccessToken({ sub: ACCOUNT_USER_ID, exp: Date.now() + 60_000 }),
    refreshSession: () => Promise.reject(new Error('not used in this test')),
  });
}

describe('ProfileClient — profile update (FE-INT, issue #15)', () => {
  beforeEach(() => {
    loginAsDemoAccount();
  });

  it('prefills the form with the current profile', async () => {
    renderWithProviders(<ProfileClient />);

    await waitFor(() => {
      expect(screen.getByLabelText('Tên')).toHaveValue('Khách');
    });
  });

  it('saves an update and reflects it back after refetch', async () => {
    renderWithProviders(<ProfileClient />);
    await waitFor(() => expect(screen.getByLabelText('Tên')).toHaveValue('Khách'));

    fireEvent.change(screen.getByLabelText('Tên'), { target: { value: 'Văn Cập Nhật' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Tên')).toHaveValue('Văn Cập Nhật');
    });
  });
});
