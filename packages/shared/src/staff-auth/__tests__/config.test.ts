// @vitest-environment node
import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, it } from 'vitest';

import { createStaffAuthMiddleware } from '../config';

const ACCESS_TOKEN_COOKIE = 'test_access_token';

function makeRequest(path: string, cookies: Record<string, string> = {}): NextRequest {
  const request = new NextRequest(new URL(path, 'http://localhost:3001'));
  Object.entries(cookies).forEach(([name, value]) => {
    request.cookies.set(name, value);
  });
  return request;
}

describe('createStaffAuthMiddleware', () => {
  const middleware = createStaffAuthMiddleware({
    accessTokenCookie: ACCESS_TOKEN_COOKIE,
    intlMiddleware: () => NextResponse.next(),
  });

  it('redirects to login when visiting a protected page without a session', () => {
    const res = middleware(makeRequest('/vi/staff'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/vi/login');
  });

  it('allows a protected page through with a valid session cookie', () => {
    const res = middleware(makeRequest('/vi/staff', { [ACCESS_TOKEN_COOKIE]: 'tok' }));
    expect(res.status).not.toBe(307);
  });

  it('redirects an already-logged-in staff away from the login page', () => {
    const res = middleware(makeRequest('/vi/login', { [ACCESS_TOKEN_COOKIE]: 'tok' }));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).not.toContain('/login');
  });

  it('lets an anonymous visitor reach the login page', () => {
    const res = middleware(makeRequest('/vi/login'));
    expect(res.status).not.toBe(307);
  });
});
