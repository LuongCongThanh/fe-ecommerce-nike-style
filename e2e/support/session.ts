import { expect, type Locator, type Page } from '@playwright/test';

/** Seeded MSW demo account (`src/integrations/backend/mocks/auth-fixtures.ts`); its account cart already holds 2 items. */
export const DEMO_CUSTOMER = { email: 'customer@example.com', password: 'Password123' } as const;

interface Credentials {
  readonly email: string;
  readonly password: string;
}

/**
 * Fills a server-rendered form field and waits until the value sticks. On WebKit a value typed
 * before the client form hydrates can be reset, so the fill is retried until the field holds it.
 */
export async function fillField(field: Locator, value: string): Promise<void> {
  await expect(async () => {
    await field.fill(value);
    await expect(field).toHaveValue(value, { timeout: 1_000 });
  }).toPass();
}

/** Submits the login form already on screen. Navigation and its assertions stay with the caller. */
export async function submitLogin(page: Page, { email, password }: Credentials): Promise<void> {
  await fillField(page.getByPlaceholder('you@example.com'), email);
  await fillField(page.getByRole('textbox', { name: 'Mật khẩu' }), password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
}

/** Logs out through the account menu and waits for the login page. */
export async function logOut(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Tài khoản' }).click();
  await page.getByRole('menuitem', { name: 'Đăng xuất' }).click();
  await expect(page).toHaveURL(/\/login/);
}

/**
 * Sets the `access_token` cookie the middleware reads as its login hint. The real Backend sets it;
 * in mock mode no cookie set by the MSW worker reaches the browser (see the transport note in
 * `src/integrations/backend/mocks/auth-fixtures.ts`), so the test supplies it. This only lets the request past
 * the UX redirect in `src/middleware.ts`; the checkout API calls still use the session from the real
 * login response. Nothing in production code changes.
 */
export async function addMiddlewareLoginHint(page: Page): Promise<void> {
  await page.context().addCookies([{ name: 'access_token', value: 'e2e-login-hint', url: new URL(page.url()).origin }]);
}

/** Replaces the guest cart with the given SKUs using the versioned envelope from `src/features/cart/stores/cart.store.ts`. */
export async function seedGuestCart(page: Page, items: ReadonlyArray<{ skuId: string; quantity: number }>): Promise<void> {
  await page.evaluate((cartItems) => {
    localStorage.setItem('cart-storage-v2', JSON.stringify({ version: 2, items: cartItems }));
  }, items);
}
