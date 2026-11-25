import { randomUUID } from 'node:crypto';

import { expect, test } from '@playwright/test';

import { E2E_PORTS, localOrigin } from '@/../e2e/support/playwright-base';

const catalogOrigin = localOrigin(E2E_PORTS.productionCatalog);

test.describe('production runtime', () => {
  test('catalog pages load fixture data through the same-origin API proxy', async ({ page }) => {
    const response = await page.goto('/vi/products');

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Tất cả sản phẩm' })).toBeVisible();
    await expect(page.getByText('Running Shoe Alpha')).toBeVisible();
  });

  test('browser proxy requests and a server-side probe reach the same catalog harness', async ({ page, request }) => {
    const requestId = randomUUID();
    await page.setExtraHTTPHeaders({ 'x-e2e-request-id': requestId });

    await page.goto('/vi/products');
    await expect(page.getByText('Running Shoe Alpha')).toBeVisible();

    // The harness records each request tagged with this run's id; the Next proxy forwards the header.
    const records = await request.get(`${catalogOrigin}/__test/requests?requestId=${requestId}`);
    expect(records.ok()).toBe(true);
    expect(await records.json()).toContainEqual(expect.objectContaining({ method: 'GET', path: '/api/v1/products', requestId }));

    // A Node-side probe gets the same fixture the browser rendered.
    const probe = await request.get(`${catalogOrigin}/api/v1/products/slug/running-shoe-alpha`);
    expect(probe.status()).toBe(200);
    expect(await probe.json()).toMatchObject({ slug: 'running-shoe-alpha', name: 'Running Shoe Alpha' });
  });

  test('localized auth shell mounts one notification surface', async ({ page }) => {
    await page.goto('/en/login');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByRole('region', { name: /^Notifications/ })).toHaveCount(1);
  });
});
