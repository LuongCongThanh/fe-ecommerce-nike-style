import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ACCESS_TOKEN_TTL_MS,
  consumeResetToken,
  createResetToken,
  createSession,
  decodeAccessToken,
  findUserByAccessToken,
  REFRESH_ABSOLUTE_TTL_MS,
  REFRESH_IDLE_TTL_MS,
  RESET_TOKEN_TTL_MS,
  revokeByRefreshToken,
  rotateRefreshToken,
} from '../auth-fixtures';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createSession / access token', () => {
  it('issues an access token that decodes to the user id and expires ACCESS_TOKEN_TTL_MS later', () => {
    const { access } = createSession(1);
    const now = Date.now();

    const payload = decodeAccessToken(access);
    expect(payload).toEqual({ sub: 1, exp: now + ACCESS_TOKEN_TTL_MS });
  });

  it('findUserByAccessToken resolves the user for a valid, unexpired Bearer token', () => {
    const { access } = createSession(1);

    expect(findUserByAccessToken(`Bearer ${access}`)?.id).toBe(1);
  });

  it('findUserByAccessToken returns undefined once the token has expired', () => {
    const { access } = createSession(1);

    vi.advanceTimersByTime(ACCESS_TOKEN_TTL_MS + 1);

    expect(findUserByAccessToken(`Bearer ${access}`)).toBeUndefined();
  });

  it('findUserByAccessToken returns undefined for a missing/malformed header', () => {
    expect(findUserByAccessToken(null)).toBeUndefined();
    expect(findUserByAccessToken('not-a-bearer-token')).toBeUndefined();
    expect(findUserByAccessToken('Bearer garbage')).toBeUndefined();
  });
});

describe('rotateRefreshToken', () => {
  it('rotates a fresh refresh token into a new access+refresh pair', () => {
    const { refresh } = createSession(1);

    const result = rotateRefreshToken(refresh);

    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.refresh).not.toBe(refresh);
      expect(findUserByAccessToken(`Bearer ${result.access}`)?.id).toBe(1);
    }
  });

  it('detects reuse of an already-rotated-out token and revokes the whole family', () => {
    const { refresh } = createSession(1);
    const first = rotateRefreshToken(refresh);
    expect(first.status).toBe('ok');

    // Reusing the original (already-consumed) token is the classic stolen-refresh-token signal.
    const reuse = rotateRefreshToken(refresh);
    expect(reuse.status).toBe('reuse');

    // Family revoked — even the token issued by the first (legitimate) rotation no longer works.
    if (first.status === 'ok') {
      expect(rotateRefreshToken(first.refresh).status).toBe('expired');
    }
  });

  it('expires once the idle TTL elapses since the token was issued', () => {
    const { refresh } = createSession(1);

    vi.advanceTimersByTime(REFRESH_IDLE_TTL_MS + 1);

    expect(rotateRefreshToken(refresh).status).toBe('expired');
  });

  it('expires once the absolute TTL elapses since the family was created, even if rotated in between', () => {
    const { refresh } = createSession(1);

    // Rotate repeatedly, staying inside the idle window each time, to reach the absolute cap.
    let current = refresh;
    const step = REFRESH_IDLE_TTL_MS - 1_000;
    let elapsed = 0;
    while (elapsed + step < REFRESH_ABSOLUTE_TTL_MS) {
      vi.advanceTimersByTime(step);
      elapsed += step;
      const result = rotateRefreshToken(current);
      expect(result.status).toBe('ok');
      if (result.status === 'ok') current = result.refresh;
    }

    vi.advanceTimersByTime(REFRESH_ABSOLUTE_TTL_MS - elapsed + 1);

    expect(rotateRefreshToken(current).status).toBe('expired');
  });

  it('returns expired for a token that was never issued', () => {
    expect(rotateRefreshToken('never-issued').status).toBe('expired');
  });
});

describe('revokeByRefreshToken (logout)', () => {
  it('invalidates the whole family so a later rotation attempt fails', () => {
    const { refresh } = createSession(1);

    revokeByRefreshToken(refresh);

    expect(rotateRefreshToken(refresh).status).toBe('expired');
  });

  it('is a no-op for an unknown token', () => {
    expect(() => {
      revokeByRefreshToken('never-issued');
    }).not.toThrow();
  });
});

describe('createResetToken / consumeResetToken', () => {
  it('consumes a matching token+uid exactly once', () => {
    const { token, uid } = createResetToken(1);

    expect(consumeResetToken(token, uid)?.id).toBe(1);
    // Single-use — the same token no longer works the second time.
    expect(consumeResetToken(token, uid)).toBeUndefined();
  });

  it('rejects a mismatched uid', () => {
    const { token } = createResetToken(1);

    expect(consumeResetToken(token, '999')).toBeUndefined();
  });

  it('rejects an expired token', () => {
    const { token, uid } = createResetToken(1);

    vi.advanceTimersByTime(RESET_TOKEN_TTL_MS + 1);

    expect(consumeResetToken(token, uid)).toBeUndefined();
  });
});
