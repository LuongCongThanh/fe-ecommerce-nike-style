import { expect, test } from '@playwright/test';

test.describe('Checkout COD (reservation + idempotent place order + success) — FE-E2E-001', () => {
  test('browse → PDP → cart → checkout COD → order success', async ({ page }) => {
    // Browse → PDP (Backpack Commuter has no Variant — Add to cart is enabled immediately, per
    // pdp.spec.ts). As a guest first — the guest cart lives in localStorage and survives navigation.
    await page.goto('/vi/products');
    await page
      .getByRole('link', { name: /Backpack Commuter/ })
      .first()
      .click();
    await expect(page.getByRole('heading', { name: 'Backpack Commuter' })).toBeVisible();

    await page.getByRole('button', { name: 'Thêm vào giỏ' }).click();
    await expect(page.getByText('Đã thêm').first()).toBeVisible();

    await page.goto('/vi/cart');
    await expect(page.getByText('Backpack Commuter')).toBeVisible();

    // Checkout is gated behind login (middleware.ts + checkout/layout.tsx AuthGuard). Sign in via a
    // `returnUrl` straight to `/checkout` — the mock auth token only ever lives in browser memory
    // (Decision #90), so any *later* full navigation would drop it; landing on Checkout as the direct
    // result of the login form's own client-side redirect avoids that entirely.
    await page.goto('/vi/login?returnUrl=%2Fvi%2Fcheckout');
    await page.getByLabel('Email').fill('customer@example.com');
    await page.getByLabel('Mật khẩu').fill('Password123');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
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
