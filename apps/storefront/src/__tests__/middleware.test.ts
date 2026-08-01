// @vitest-environment node
import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/middleware', () => ({
  default: () => () => NextResponse.next(),
}));

const { middleware } = await import('../../middleware');

function makeRequest(path: string, cookies: Record<string, string> = {}): NextRequest {
  const request = new NextRequest(new URL(path, 'http://localhost:3000'));
  Object.entries(cookies).forEach(([name, value]) => {
    request.cookies.set(name, value);
  });
  return request;
}

describe('middleware', () => {
  it('redirects to login when accessing a protected path without a token', () => {
    const res = middleware(makeRequest('/vi/checkout'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/vi/login');
  });

  it('does not touch the admin role check for non-admin protected paths', () => {
    const res = middleware(makeRequest('/vi/checkout', { access_token: 'tok' }));
    expect(res.status).not.toBe(307);
  });

  it('redirects a logged-in non-admin user away from /admin', () => {
    const res = middleware(makeRequest('/vi/admin/dashboard', { access_token: 'tok', is_admin: 'false' }));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/vi/home');
  });

  it('allows a logged-in admin user through to /admin', () => {
    const res = middleware(makeRequest('/vi/admin/dashboard', { access_token: 'tok', is_admin: 'true' }));
    expect(res.status).not.toBe(307);
  });

  it('redirects to login before checking role when not logged in at all on /admin', () => {
    const res = middleware(makeRequest('/vi/admin/dashboard'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/vi/login');
  });
});
