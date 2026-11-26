import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/shared/routing/routes';

describe('ROUTES', () => {
  it('exposes static paths', () => {
    expect(ROUTES.HOME).toBe('/');
    expect(ROUTES.CART).toBe('/cart');
    expect(ROUTES.CHECKOUT_SUCCESS).toBe('/checkout/success');
    expect(ROUTES.AUTH.LOGIN).toBe('/login');
    expect(ROUTES.ACCOUNT.PROFILE).toBe('/account/profile');
  });

  it('builds dynamic paths from slugs and ids', () => {
    expect(ROUTES.PRODUCT('air-max')).toBe('/products/air-max');
    expect(ROUTES.ACCOUNT.ORDER(42)).toBe('/account/orders/42');
    expect(ROUTES.ACCOUNT.ORDER('abc')).toBe('/account/orders/abc');
    expect(ROUTES.ADMIN.PRODUCT_EDIT(7)).toBe('/admin/products/7/edit');
    expect(ROUTES.ADMIN.ORDER('o1')).toBe('/admin/orders/o1');
  });
});
