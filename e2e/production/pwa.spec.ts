import { expect, test } from '@playwright/test';

test('production service worker serves the offline fallback for an uncached navigation', async ({ page }) => {
  const response = await page.goto('/vi/home');

  expect(response?.status()).toBe(200);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);

  await page.context().setOffline(true);
  const offlineResponse = await page.goto('/vi/uncached-offline-e2e');

  expect(offlineResponse?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Bạn đang ngoại tuyến' })).toBeVisible();
});
