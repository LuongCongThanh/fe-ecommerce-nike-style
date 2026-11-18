import { expect, test } from '@playwright/test';

test.describe('App provider ownership', () => {
  test('localized login pages and offline route each render one notification surface', async ({ page }) => {
    for (const locale of ['vi', 'en']) {
      await page.goto(`/${locale}/login`);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
      await expect(page.getByRole('region', { name: /^Notifications/ })).toHaveCount(1);
    }

    const offline = await page.goto('/~offline');
    expect(offline?.status()).toBe(200);
    await expect(page).toHaveURL(/\/~offline$/);
    await expect(page.getByRole('heading', { name: 'Bạn đang ngoại tuyến' })).toBeVisible();
    await expect(page.getByRole('region', { name: /^Notifications/ })).toHaveCount(1);
  });
});
