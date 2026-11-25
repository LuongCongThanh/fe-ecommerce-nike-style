import { expect, test } from '@playwright/test';

test.describe('production runtime', () => {
  test('catalog pages load fixture data through the same-origin API proxy', async ({ page }) => {
    const response = await page.goto('/vi/products');

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Tất cả sản phẩm' })).toBeVisible();
    await expect(page.getByText('Running Shoe Alpha')).toBeVisible();
  });

  test('localized auth shell mounts one notification surface', async ({ page }) => {
    await page.goto('/en/login');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByRole('region', { name: /^Notifications/ })).toHaveCount(1);
  });
});
