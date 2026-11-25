import { expect, test } from '@playwright/test';

test.describe('Checkout COD (reservation + idempotent place order + success) — FE-E2E-001', () => {
  test('seeded guest cart → checkout COD → order success', async ({ page }) => {
    // Purchase is not enabled on PDP yet. Seed a known fixture SKU in the guest cart instead.
    await page.addInitScript(() => {
      if (sessionStorage.getItem('__e2e_guest_cart_seeded') === 'true') return;
      localStorage.setItem('cart-storage-v2', JSON.stringify({ version: 2, items: [{ skuId: 'p-17-sku', quantity: 1 }] }));
      sessionStorage.setItem('__e2e_guest_cart_seeded', 'true');
    });
    await page.goto('/vi/cart');
    await expect(page.getByText('Backpack Commuter')).toBeVisible();

    // The test's login response stores its real token in memory; seed the middleware's cookie hint
    // separately because MSW cannot persist the mock token as a browser cookie.
    await page.goto('/vi/login?returnUrl=%2Fvi%2Fcheckout');
    await page.waitForLoadState('networkidle');
    await page.context().addCookies([{ name: 'access_token', value: 'e2e-auth-hint', url: new URL(page.url()).origin }]);
    await page.getByPlaceholder('you@example.com').fill('customer@example.com');
    await page.getByRole('textbox', { name: 'Mật khẩu' }).fill('Password123');
    const loginResponse = page.waitForResponse((response) => response.url().endsWith('/api/auth/login/'));
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    expect((await loginResponse).status()).toBe(200);
    await expect(page).toHaveURL(/\/checkout$/);

    // COD is the only payment method shown — nothing to select (Decision #7). The demo account also
    // merges in its own pre-seeded cart on login (Decision #36) alongside the guest item just added.
    await expect(page.getByText('Thanh toán khi nhận hàng (COD)')).toBeVisible();

    await page.getByLabel('Họ và tên').fill('Nguyễn Văn A');
    await page.getByLabel('Số điện thoại').fill('0912345678');
    await page.getByLabel('Địa chỉ cụ thể').fill('123 Đường ABC');
    await page.getByLabel('Tỉnh / Thành phố').fill('Hà Nội');
    await page.getByLabel('Quận / Huyện').fill('Thanh Xuân');
    await page.getByLabel('Phường / Xã').fill('Khương Trung');

    const placeOrder = page.getByRole('button', { name: 'Đặt hàng ngay' });
    await expect(placeOrder).toBeEnabled(); // Reservation resolved — button isn't stuck disabled.
    await placeOrder.click();

    await expect(page).toHaveURL(/\/checkout\/success/);
    await expect(page.getByRole('heading', { name: 'Đặt hàng thành công!' })).toBeVisible();
    await expect(page.getByText(/Mã đơn hàng: #/)).toBeVisible();

    // Cart is cleared after a successful order.
    await page.goto('/vi/cart');
    await expect(page.getByText('Giỏ hàng của bạn đang trống')).toBeVisible();
  });
});
