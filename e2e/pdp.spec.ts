import { expect, test } from '@playwright/test';

test.describe('PDP (variant selection and unavailable purchase)', () => {
  test('a Product with variants keeps purchase unavailable after Color+Size selection', async ({ page }) => {
    await page.goto('/vi/products/running-shoe-alpha');
    await expect(page.getByRole('heading', { name: 'Running Shoe Alpha' })).toBeVisible();

    // 3D viewer mounts (lazy, client-only) — presence of the canvas is enough to prove it loaded.
    await expect(page.locator('canvas')).toBeVisible();

    const purchaseButton = page.getByRole('button', { name: 'Sắp mở bán' });
    await expect(purchaseButton).toBeDisabled();

    await page.getByRole('button', { name: 'black', exact: true }).click();
    await page.getByRole('button', { name: '39', exact: true }).click();

    await expect(purchaseButton).toBeDisabled();
    await expect(page.getByText('Đặt hàng trực tuyến sẽ sớm được mở.')).toBeVisible();
  });

  test('a Product with no Variant still keeps purchase unavailable', async ({ page }) => {
    await page.goto('/vi/products/backpack-commuter');
    await expect(page.getByRole('heading', { name: 'Backpack Commuter' })).toBeVisible();

    await expect(page.getByRole('button', { name: 'Sắp mở bán' })).toBeDisabled();
  });

  test('a selected Color+Size combination is reflected without enabling purchase', async ({ page }) => {
    await page.goto('/vi/products/running-shoe-alpha');
    await page.getByRole('button', { name: 'white', exact: true }).click();
    await page.getByRole('button', { name: '42', exact: true }).click();

    await expect(page.getByRole('button', { name: 'white', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: '42', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Sắp mở bán' })).toBeDisabled();
  });

  test('an unknown product slug shows a not-found state instead of crashing', async ({ page }) => {
    await page.goto('/vi/products/does-not-exist');
    await expect(page.getByRole('heading', { name: 'Không tìm thấy sản phẩm' })).toBeVisible();
  });
});
