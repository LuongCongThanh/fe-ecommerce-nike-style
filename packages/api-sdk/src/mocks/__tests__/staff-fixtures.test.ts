import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createStaffSession,
  findStaffByAccessToken,
  resetMockStaffDbForTesting,
  revokeAllStaffSessions,
  rotateStaffRefreshToken,
  setStaffRoles,
  STAFF_ACCESS_TOKEN_TTL_MS,
  STAFF_REFRESH_ABSOLUTE_TTL_MS,
  STAFF_REFRESH_IDLE_TTL_MS,
} from '../staff-fixtures';

const SUPER_ADMIN_ID = 1;

beforeEach(() => {
  vi.useFakeTimers();
  resetMockStaffDbForTesting();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createStaffSession / access token', () => {
  it('issues an access token that resolves the staff and expires after STAFF_ACCESS_TOKEN_TTL_MS', () => {
    const { access } = createStaffSession(SUPER_ADMIN_ID);

    expect(findStaffByAccessToken(`Bearer ${access}`)?.id).toBe(SUPER_ADMIN_ID);

    vi.advanceTimersByTime(STAFF_ACCESS_TOKEN_TTL_MS + 1);
    expect(findStaffByAccessToken(`Bearer ${access}`)).toBeUndefined();
  });
});

describe('rotateStaffRefreshToken', () => {
  it('rotates while within the idle window', () => {
    const { refresh } = createStaffSession(SUPER_ADMIN_ID);

    const result = rotateStaffRefreshToken(refresh);

    expect(result.status).toBe('ok');
  });

  it('expires once the idle window (no activity) has passed', () => {
    const { refresh } = createStaffSession(SUPER_ADMIN_ID);

    vi.advanceTimersByTime(STAFF_REFRESH_IDLE_TTL_MS + 1);
    const result = rotateStaffRefreshToken(refresh);

    expect(result.status).toBe('expired');
  });

  it('expires once the absolute window has passed, even with continuous activity', () => {
    let { refresh } = createStaffSession(SUPER_ADMIN_ID);
    const step = STAFF_REFRESH_IDLE_TTL_MS - 1;
    let elapsed = 0;

    while (elapsed + step < STAFF_REFRESH_ABSOLUTE_TTL_MS) {
      vi.advanceTimersByTime(step);
      elapsed += step;
      const rotated = rotateStaffRefreshToken(refresh);
      expect(rotated.status).toBe('ok');
      if (rotated.status !== 'ok') throw new Error('unreachable');
      refresh = rotated.refresh;
    }

    vi.advanceTimersByTime(step);
    const result = rotateStaffRefreshToken(refresh);
    expect(result.status).toBe('expired');
  });

  it('detects reuse of an already-consumed refresh token and revokes the whole family', () => {
    const { refresh } = createStaffSession(SUPER_ADMIN_ID);
    const first = rotateStaffRefreshToken(refresh);
    expect(first.status).toBe('ok');

    const reused = rotateStaffRefreshToken(refresh);
    expect(reused.status).toBe('reuse');

    if (first.status !== 'ok') throw new Error('unreachable');
    expect(rotateStaffRefreshToken(first.refresh).status).toBe('expired');
  });
});

describe('setStaffRoles (issue #23 — Decision #79)', () => {
  it('revokes the staff’s current sessions when their roles change', () => {
    const { refresh } = createStaffSession(SUPER_ADMIN_ID);

    setStaffRoles(SUPER_ADMIN_ID, ['ADMIN_STAFF']);

    expect(rotateStaffRefreshToken(refresh).status).toBe('expired');
  });
});

describe('revokeAllStaffSessions', () => {
  it('invalidates every refresh token for that staff', () => {
    const { refresh } = createStaffSession(SUPER_ADMIN_ID);
    revokeAllStaffSessions(SUPER_ADMIN_ID);

    expect(rotateStaffRefreshToken(refresh).status).toBe('expired');
  });
});
