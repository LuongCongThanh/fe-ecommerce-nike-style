import { expect, test } from '@playwright/test';

test.describe('Catalog browse (PLP + Category + Gender filter)', () => {
  test('gender filter, sort, and pagination reflect on the URL and survive a reload', async ({ page }) => {
    await page.goto('/vi/products');
    await expect(page.getByRole('heading', { name: 'Tất cả sản phẩm' })).toBeVisible();

    // Gender filter — selecting one resets to page 1 and updates the query string.
    await page.getByRole('combobox', { name: 'Giới tính' }).click();
    await page.getByRole('option', { name: 'Nữ' }).click();
    await expect(page).toHaveURL(/[?&]gender=women/);
    await expect(page).toHaveURL(/[?&]page=1/);

    // Sort — changing it also resets to page 1.
    await page.getByRole('combobox', { name: 'Sắp xếp theo' }).click();
    await page.getByRole('option', { name: 'Giá tăng dần' }).click();
    await expect(page).toHaveURL(/[?&]sortBy=price_asc/);
    await expect(page).toHaveURL(/[?&]gender=women/);

    // Reload — the exact filter state (gender + sort) must survive a hard navigation.
    await page.reload();
    await expect(page).toHaveURL(/[?&]gender=women/);
    await expect(page).toHaveURL(/[?&]sortBy=price_asc/);
    await expect(page.getByRole('combobox', { name: 'Giới tính' })).toHaveText('Nữ');
    await expect(page.getByRole('combobox', { name: 'Sắp xếp theo' })).toHaveText('Giá tăng dần');
  });

  test('Category tree renders the Decision #50 taxonomy and links into a Category page', async ({ page }) => {
    await page.goto('/vi/products');

    const categoryNav = page.getByRole('navigation', { name: 'Danh mục sản phẩm' });
    await expect(categoryNav.getByRole('link', { name: 'Shoes' })).toBeVisible();
    await expect(categoryNav.getByRole('link', { name: 'Apparel' })).toBeVisible();
    await expect(categoryNav.getByRole('link', { name: 'Accessories' })).toBeVisible();
    await expect(categoryNav.getByRole('link', { name: 'Running' })).toBeVisible();

    await categoryNav.getByRole('link', { name: 'Running' }).click();
    await expect(page).toHaveURL(/\/categories\/running$/);
    await expect(page.getByRole('heading', { name: 'Running' })).toBeVisible();
  });

  test('pagination on the PLP keeps the page number in the URL and going back restores it', async ({ page }) => {
    // 24 mock products (Decision #50) at pageSize 12 guarantees a page 2 — see catalog-fixtures.ts.
    await page.goto('/vi/products');
    await expect(page.getByRole('heading', { name: 'Tất cả sản phẩm' })).toBeVisible();

    const pageTwoButton = page.getByRole('button', { name: '2', exact: true });
    await expect(pageTwoButton).toBeVisible();
    await pageTwoButton.click();
    await expect(page).toHaveURL(/[?&]page=2/);

    await page.goBack();
    await expect(page).not.toHaveURL(/[?&]page=2/);
  });
});
