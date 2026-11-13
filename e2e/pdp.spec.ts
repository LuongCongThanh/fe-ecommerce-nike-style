import { expect, test } from '@playwright/test';

test.describe('PDP (Variant to SKU + 3D viewer)', () => {
  test('a Product with a Variant requires Color+Size before price/stock resolve and Add to cart enables', async ({ page }) => {
    await page.goto('/vi/products/running-shoe-alpha');
    await expect(page.getByRole('heading', { name: 'Running Shoe Alpha' })).toBeVisible();

    // 3D viewer mounts (lazy, client-only) — presence of the canvas is enough to prove it loaded.
    await expect(page.locator('canvas')).toBeVisible();

    // Incomplete selection — Add to cart stays disabled.
    await expect(page.getByRole('button', { name: 'Thêm vào giỏ' })).toBeDisabled();

    await page.getByRole('button', { name: 'black', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Thêm vào giỏ' })).toBeDisabled();

    await page.getByRole('button', { name: '39', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Thêm vào giỏ' })).toBeEnabled();

    await page.getByRole('button', { name: 'Thêm vào giỏ' }).click();
    await expect(page.getByText('Đã thêm').first()).toBeVisible();
  });

  test('a Product with no Variant skips selection — Add to cart is enabled immediately', async ({ page }) => {
    await page.goto('/vi/products/backpack-commuter');
    await expect(page.getByRole('heading', { name: 'Backpack Commuter' })).toBeVisible();

    await expect(page.getByRole('button', { name: 'Thêm vào giỏ' })).toBeEnabled();
  });

  test('an out-of-stock Color+Size combination disables Add to cart and shows "Hết hàng"', async ({ page }) => {
    // Fixture stock formula (catalog-fixtures.ts) guarantees size index 3 (42) at colorIndex 1 (white) is 0.
    await page.goto('/vi/products/running-shoe-alpha');
    await page.getByRole('button', { name: 'white', exact: true }).click();
    await page.getByRole('button', { name: '42', exact: true }).click();

    await expect(page.getByText('Hết hàng')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thêm vào giỏ' })).toBeDisabled();
  });

  test('an unknown product slug shows a not-found state instead of crashing', async ({ page }) => {
    await page.goto('/vi/products/does-not-exist');
    await expect(page.getByRole('heading', { name: 'Không tìm thấy sản phẩm' })).toBeVisible();
  });
});
