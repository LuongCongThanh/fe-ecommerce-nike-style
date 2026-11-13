import { expect, test } from '@playwright/test';

test.describe('Search (basic keyword search)', () => {
  test('header search input navigates to results and lists matching products', async ({ page }) => {
    await page.goto('/vi/home');

    await page.getByRole('button', { name: 'Tìm kiếm' }).click();
    await page.getByPlaceholder('Tìm kiếm sản phẩm...').fill('Running Shoe');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/search\?q=Running(%20|\+)Shoe$/);
    await expect(page.getByRole('heading', { name: /Kết quả tìm kiếm cho/ })).toBeVisible();
    await expect(page.getByText('Running Shoe Alpha')).toBeVisible();
  });

  test('a query missing Vietnamese diacritics still finds the (accented) product', async ({ page }) => {
    // Mock behavior (issue #11): accent-insensitive, simulating unaccent/pg_trgm without real FTS.
    await page.goto(`/vi/search?q=${encodeURIComponent('giay chay bo')}`);

    await expect(page.getByText('Running Shoe Alpha')).toBeVisible();
  });

  test('a query with no match shows a clear empty state, not a blank page', async ({ page }) => {
    await page.goto('/vi/search?q=zzzznotarealproductzzzz');

    await expect(page.getByText('Không tìm thấy kết quả nào cho "zzzznotarealproductzzzz"')).toBeVisible();
  });

  test('search state is independent of the PLP filter URL-state', async ({ page }) => {
    await page.goto('/vi/products?gender=women&sortBy=price_asc');

    await page.getByRole('button', { name: 'Tìm kiếm' }).click();
    await page.getByPlaceholder('Tìm kiếm sản phẩm...').fill('Hoodie');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/search\?q=Hoodie$/);
    // Search never carries over catalog filter query params — separate URL-state (issue #11).
    await expect(page).not.toHaveURL(/gender=/);
    await expect(page).not.toHaveURL(/sortBy=/);
  });
});
