import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../../client/api-error';
import { apiClient, resetAuthRuntime } from '../../client/fetcher';
import { registerAuthRuntimeAdapter } from '../../client/runtime';
import { API_BASE_URL } from '../../env/config';
import { ACCESS_TOKEN_TTL_MS } from '../../mocks/auth-fixtures';
import { server } from '../../testing/msw-server';
import { forgotPassword, login, logout, refreshSession, register, resetPassword } from '../auth';
import { getProfile } from '../profile';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function uniqueEmail(): string {
  return `test-${crypto.randomUUID()}@example.com`;
}

describe('register', () => {
  it('creates a session for a new email', async () => {
    const result = await register({ email: uniqueEmail(), password: 'Password123', firstName: 'Nguyễn', lastName: 'Văn A' });

    expect(result.user.email).toBeDefined();
    expect(result.access).toBeTruthy();
    expect(result.refresh).toBeTruthy();
  });

  it('rejects a duplicate email', async () => {
    const email = uniqueEmail();
    await register({ email, password: 'Password123', firstName: 'A', lastName: 'B' });

    await expect(register({ email, password: 'Password123', firstName: 'A', lastName: 'B' })).rejects.toMatchObject({ status: 409 });
  });
});

describe('login', () => {
  it('resolves with a session for the seeded mock user', async () => {
    const result = await login({ email: 'customer@example.com', password: 'Password123' });

    expect(result.user.email).toBe('customer@example.com');
    expect(result.access).toBeTruthy();
    expect(result.refresh).toBeTruthy();
  });

  it('rejects a wrong password with a 401 ApiError', async () => {
    await expect(login({ email: 'customer@example.com', password: 'wrong' })).rejects.toThrow(ApiError);
    await expect(login({ email: 'customer@example.com', password: 'wrong' })).rejects.toMatchObject({ status: 401 });
  });

  it('rejects an unknown email with the same 401 (no account-enumeration signal)', async () => {
    await expect(login({ email: 'nobody@example.com', password: 'Password123' })).rejects.toMatchObject({ status: 401 });
  });
});

describe('refreshSession', () => {
  it('rotates into a new access+refresh pair, and the new refresh token keeps working', async () => {
    const session = await login({ email: 'customer@example.com', password: 'Password123' });

    const rotated = await refreshSession(session.refresh);
    expect(rotated.access).toBeTruthy();
    expect(rotated.refresh).not.toBe(session.refresh);

    const rotatedAgain = await refreshSession(rotated.refresh);
    expect(rotatedAgain.access).toBeTruthy();
  });

  it('detects reuse of an already-rotated-out token and revokes the whole family', async () => {
    const session = await login({ email: 'customer@example.com', password: 'Password123' });
    const rotated = await refreshSession(session.refresh);

    // Reusing the original (already-consumed) token is treated as a stolen-token signal.
    await expect(refreshSession(session.refresh)).rejects.toMatchObject({ status: 401 });

    // The family is revoked as a result — even the legitimately-rotated token stops working.
    await expect(refreshSession(rotated.refresh)).rejects.toMatchObject({ status: 401 });
  });

  it('rejects an unknown refresh token', async () => {
    await expect(refreshSession('never-issued')).rejects.toMatchObject({ status: 401 });
  });
});

describe('logout', () => {
  it('revokes the session so the refresh token can no longer be used', async () => {
    const session = await login({ email: 'customer@example.com', password: 'Password123' });

    await logout(session.refresh);

    await expect(refreshSession(session.refresh)).rejects.toMatchObject({ status: 401 });
  });
});

describe('forgotPassword / resetPassword', () => {
  it('completes the reset flow end to end and revokes existing sessions (ADR-0010)', async () => {
    const email = uniqueEmail();
    await register({ email, password: 'OldPassword1', firstName: 'A', lastName: 'B' });
    const session = await login({ email, password: 'OldPassword1' });

    // `forgotPassword()` discards the response body (a real backend would email the link) — read the
    // mock-only `devResetToken`/`devUid` fields directly to drive the rest of the flow, same as an
    // E2E test would intercept the network response instead of receiving a real email.
    const raw = await apiClient.post<{ devResetToken: string; devUid: string }>(`${API_BASE_URL}/api/auth/password/reset/`, { email });

    await resetPassword({ token: raw.devResetToken, uid: raw.devUid, password: 'NewPassword1' });

    // Old password no longer works, new one does.
    await expect(login({ email, password: 'OldPassword1' })).rejects.toMatchObject({ status: 401 });
    await expect(login({ email, password: 'NewPassword1' })).resolves.toMatchObject({});

    // Resetting the password revoked the pre-reset session's refresh token.
    await expect(refreshSession(session.refresh)).rejects.toMatchObject({ status: 401 });
  });

  it('does not leak whether an email is registered', async () => {
    await expect(forgotPassword({ email: 'nobody@example.com' })).resolves.toBeUndefined();
  });

  it('rejects mismatched new-password confirmation', async () => {
    const email = uniqueEmail();
    await register({ email, password: 'OldPassword1', firstName: 'A', lastName: 'B' });
    const raw = await apiClient.post<{ devResetToken: string; devUid: string }>(`${API_BASE_URL}/api/auth/password/reset/`, { email });

    await expect(
      apiClient.post(`${API_BASE_URL}/api/auth/password/reset/confirm/`, {
        token: raw.devResetToken,
        uid: raw.devUid,
        new_password1: 'NewPassword1',
        new_password2: 'Mismatch1',
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects an already-used or unknown reset token', async () => {
    await expect(resetPassword({ token: 'never-issued', uid: '1', password: 'NewPassword1' })).rejects.toMatchObject({ status: 400 });
  });
});

describe('getProfile via GET /api/auth/me/', () => {
  it('rejects without a valid Bearer token', async () => {
    await expect(getProfile()).rejects.toMatchObject({ status: 401 });
  });

  it("transparently refreshes an expired access token and retries — the fetcher's 401 handling (ADR-0010 TTL behavior)", async () => {
    const session = await login({ email: 'customer@example.com', password: 'Password123' });
    let currentAccess = session.access;
    let currentRefresh = session.refresh;

    registerAuthRuntimeAdapter({
      getAccessToken: () => currentAccess,
      refreshSession: async () => {
        const rotated = await refreshSession(currentRefresh);
        currentAccess = rotated.access;
        currentRefresh = rotated.refresh;
        return currentAccess;
      },
    });

    try {
      vi.useFakeTimers();
      vi.setSystemTime(Date.now() + ACCESS_TOKEN_TTL_MS + 1); // the mock access token has now expired

      const profile = await getProfile();

      expect(profile.email).toBe('customer@example.com');
      expect(currentAccess).not.toBe(session.access); // proves a refresh actually happened, not a stale cache hit
    } finally {
      vi.useRealTimers();
      resetAuthRuntime();
    }
  });

  it('shares a single refresh across concurrent 401s instead of double-rotating and false-triggering reuse detection', async () => {
    const session = await login({ email: 'customer@example.com', password: 'Password123' });
    let currentAccess = session.access;
    let currentRefresh = session.refresh;
    let refreshCallCount = 0;

    registerAuthRuntimeAdapter({
      getAccessToken: () => currentAccess,
      refreshSession: async () => {
        refreshCallCount++;
        const rotated = await refreshSession(currentRefresh);
        currentAccess = rotated.access;
        currentRefresh = rotated.refresh;
        return currentAccess;
      },
    });

    try {
      vi.useFakeTimers();
      vi.setSystemTime(Date.now() + ACCESS_TOKEN_TTL_MS + 1);

      // Two requests hit the expired token at once — without single-flight, the second would try to
      // rotate an already-consumed token and trip reuse detection, revoking the whole family.
      const [first, second] = await Promise.all([getProfile(), getProfile()]);

      expect(first.email).toBe('customer@example.com');
      expect(second.email).toBe('customer@example.com');
      expect(refreshCallCount).toBe(1);
    } finally {
      vi.useRealTimers();
      resetAuthRuntime();
    }
  });
});
