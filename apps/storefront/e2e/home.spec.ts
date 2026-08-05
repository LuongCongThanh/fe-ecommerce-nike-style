import { expect, test } from '@playwright/test';

test.describe('Homepage smoke', () => {
  test('renders hero, primary CTA, and footer', async ({ page }) => {
    await page.goto('/vi/home');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const primaryCta = page.getByRole('link', { name: 'Mua ngay' });
    await expect(primaryCta).toBeVisible();

    await expect(page.getByText('ANTIGRAVITY').first()).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('primary CTA navigates to the product listing', async ({ page }) => {
    await page.goto('/vi/home');

    await page.getByRole('link', { name: 'Mua ngay' }).click();
    await expect(page).toHaveURL(/\/products/);
  });

  test('header navigation reaches the product listing', async ({ page }) => {
    await page.goto('/vi/home');

    await page.getByRole('link', { name: 'Tất cả sản phẩm' }).first().click();
    await expect(page).toHaveURL(/\/products/);
  });
});
