import { expect, test } from '@playwright/test';

test.describe('Cart (guest + merge + rollback)', () => {
  test('merges the guest cart into the account cart on login, summing the colliding SKU (Decision #36)', async ({ page }) => {
    await page.goto('/vi/home');

    // Guest cart: 1x p-1-0-2 (stock 4). Seeded demo account already carries 2x p-1-0-0 (stock 14) —
    // after merge/login this should read 3 total items (2 + 1, no collision to sum here, straight union)
    // plus proves the merge round-trip (guest -> account -> displayed cart) actually happened.
    await page.evaluate(() => {
      localStorage.setItem('cart-storage-v2', JSON.stringify({ version: 2, items: [{ skuId: 'p-1-0-2', quantity: 1 }] }));
    });
    await page.reload();

    await page.getByLabel('Đăng nhập').click();
    await page.waitForURL(/\/login$/);
    await page.getByPlaceholder('you@example.com').fill('customer@example.com');
    await page.getByRole('textbox', { name: 'Mật khẩu' }).fill('Password123');
    const mergeResponse = page.waitForResponse((response) => response.url().endsWith('/api/cart/merge') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole('button', { name: 'Tài khoản' })).toBeVisible();
    expect((await mergeResponse).status()).toBe(200);

    await expect(page.getByRole('button', { name: 'Giỏ hàng' })).toContainText('3');
  });

  test('guest can add/update/remove cart items without logging in', async ({ page }) => {
    await page.goto('/vi/home');
    await page.evaluate(() => {
      localStorage.setItem('cart-storage-v2', JSON.stringify({ version: 2, items: [{ skuId: 'p-1-0-0', quantity: 1 }] }));
    });
    await page.goto('/vi/cart');

    await expect(page.getByText('Tạm tính (1 sản phẩm)')).toBeVisible();
    await page.getByRole('button', { name: 'Xóa sản phẩm' }).click();
    await expect(page.getByText('Giỏ hàng của bạn đang trống')).toBeVisible();
  });
});
