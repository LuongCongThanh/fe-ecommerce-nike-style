import { expect, test } from '@playwright/test';

import { addMiddlewareLoginHint, DEMO_CUSTOMER, submitLogin } from '@/../e2e/support/session';

test.describe('Checkout COD (reservation + idempotent place order + success) — FE-E2E-001', () => {
  test('seeded guest cart → checkout COD → order success', async ({ page }) => {
    // Purchase is not enabled on PDP yet. Seed a known fixture SKU in the guest cart instead. The init
    // script runs on every page load, so it seeds only once per tab to keep the post-order empty cart.
    await page.addInitScript(() => {
      if (sessionStorage.getItem('__e2e_guest_cart_seeded') === 'true') return;
      localStorage.setItem('cart-storage-v2', JSON.stringify({ version: 2, items: [{ skuId: 'p-17-sku', quantity: 1 }] }));
      sessionStorage.setItem('__e2e_guest_cart_seeded', 'true');
    });
    await page.goto('/vi/cart');
    await expect(page.getByText('Backpack Commuter')).toBeVisible();

    // Checkout is gated by the proxy's cookie hint. Sign in with a `returnUrl` so the login form's
    // own client-side redirect lands on Checkout while the in-memory mock session is still alive.
    await page.goto('/vi/login?returnUrl=%2Fvi%2Fcheckout');
    await addMiddlewareLoginHint(page);
    const loginResponse = page.waitForResponse((response) => response.url().endsWith('/api/auth/login/'));
    await submitLogin(page, DEMO_CUSTOMER);
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
