// @vitest-environment node
import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@repo/i18n/middleware', () => ({
  createIntlMiddleware: () => () => NextResponse.next(),
}));

const { middleware } = await import('../../middleware');

function makeRequest(path: string, cookies: Record<string, string> = {}): NextRequest {
  const request = new NextRequest(new URL(path, 'http://localhost:3001'));
  Object.entries(cookies).forEach(([name, value]) => {
    request.cookies.set(name, value);
  });
  return request;
}

describe('admin middleware', () => {
  it('redirects to login when visiting a protected page without a session', () => {
    const res = middleware(makeRequest('/vi/staff'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/vi/login');
  });

  it('allows a protected page through with a valid session cookie', () => {
    const res = middleware(makeRequest('/vi/staff', { admin_access_token: 'tok' }));
    expect(res.status).not.toBe(307);
  });

  it('redirects an already-logged-in staff away from the login page', () => {
    const res = middleware(makeRequest('/vi/login', { admin_access_token: 'tok' }));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).not.toContain('/login');
  });

  it('lets an anonymous visitor reach the login page', () => {
    const res = middleware(makeRequest('/vi/login'));
    expect(res.status).not.toBe(307);
  });
});
