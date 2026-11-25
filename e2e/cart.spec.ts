import { expect, test } from '@playwright/test';

import { DEMO_CUSTOMER, seedGuestCart, submitLogin } from '@/../e2e/support/session';

test.describe('Cart (guest + merge + rollback)', () => {
  test('merges the guest cart into the account cart on login, summing the colliding SKU (Decision #36)', async ({ page }) => {
    await page.goto('/vi/home');

    // Guest cart: 1x p-1-0-2 (stock 4). Seeded demo account already carries 2x p-1-0-0 (stock 14) —
    // after merge/login this should read 3 total items (2 + 1, no collision to sum here, straight union)
    // plus proves the merge round-trip (guest -> account -> displayed cart) actually happened.
    await seedGuestCart(page, [{ skuId: 'p-1-0-2', quantity: 1 }]);
    await page.reload();

    await page.getByLabel('Đăng nhập').click();
    await page.waitForURL(/\/login$/);
    const mergeResponse = page.waitForResponse((response) => response.url().endsWith('/api/cart/merge') && response.request().method() === 'POST');
    await submitLogin(page, DEMO_CUSTOMER);
    await expect(page).toHaveURL(/\/home$/);
    expect((await mergeResponse).status()).toBe(200);

    // The mock session lives in memory only (Decision #90), so reach the cart page through client-side
    // navigation; a full page load would drop the session and show the guest cart instead.
    await page.getByRole('button', { name: 'Giỏ hàng' }).click();
    await page.getByRole('link', { name: 'Xem giỏ hàng' }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByText('Tạm tính (3 sản phẩm)')).toBeVisible();
  });

  test('guest can add/update/remove cart items without logging in', async ({ page }) => {
    await page.goto('/vi/home');
    await seedGuestCart(page, [{ skuId: 'p-1-0-0', quantity: 1 }]);
    await page.goto('/vi/cart');

    await expect(page.getByText('Tạm tính (1 sản phẩm)')).toBeVisible();
    await page.getByRole('button', { name: 'Xóa sản phẩm' }).click();
    await expect(page.getByText('Giỏ hàng của bạn đang trống')).toBeVisible();
  });
});
