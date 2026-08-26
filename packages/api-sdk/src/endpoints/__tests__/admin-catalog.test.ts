import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { ApiError } from '../../client/api-error';
import { resetAuthRuntime } from '../../client/fetcher';
import { registerAuthRuntimeAdapter } from '../../client/runtime';
import { resetMockCatalogProductsForTesting, resetMockCategoriesForTesting } from '../../mocks/catalog-fixtures';
import { resetMockOrderDbForTesting } from '../../mocks/order-fixtures';
import { server } from '../../testing/msw-server';
import {
  createAdminCategory,
  createAdminProduct,
  deleteAdminCategory,
  deleteAdminProduct,
  getAdminCategories,
  getAdminProduct,
  getAdminProducts,
  updateAdminCategory,
  updateAdminProduct,
} from '../admin-catalog';
import { loginStaff } from '../staff';

async function loginAsAdminStaff() {
  const { access } = await loginStaff({ email: 'staff@admin.local', password: 'Password123' });
  registerAuthRuntimeAdapter({
    getAccessToken: () => access,
    refreshSession: () => Promise.reject(new Error('not used in this test')),
  });
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  resetMockCatalogProductsForTesting();
  resetMockCategoriesForTesting();
  resetMockOrderDbForTesting();
});
afterEach(() => {
  server.resetHandlers();
  resetAuthRuntime();
});
afterAll(() => server.close());

describe('getAdminProducts', () => {
  it('resolves the full mock catalog, same as the public listing', async () => {
    await loginAsAdminStaff();
    const result = await getAdminProducts({ page: 1, pageSize: 100 });

    expect(result.meta.total).toBe(24);
  });

  it('rejects with 401 when there is no Staff session', async () => {
    await expect(getAdminProducts({ page: 1, pageSize: 20 })).rejects.toMatchObject({ status: 401 });
  });
});

describe('getAdminProduct', () => {
  it('resolves a single Product by id', async () => {
    await loginAsAdminStaff();
    const product = await getAdminProduct('p-1');

    expect(product.id).toBe('p-1');
    expect(product.skus.length).toBeGreaterThan(0);
  });

  it('rejects an unknown id with 404', async () => {
    await loginAsAdminStaff();
    await expect(getAdminProduct('nonexistent')).rejects.toMatchObject({ status: 404 });
  });
});

describe('createAdminProduct', () => {
  it('creates a Product with its Variant/SKU tuple (issue #19)', async () => {
    await loginAsAdminStaff();

    const created = await createAdminProduct({
      slug: 'test-jacket',
      name: 'Test Jacket',
      description: 'A jacket created by a test.',
      images: [],
      categoryId: 'cat-jackets',
      gender: 'unisex',
      skus: [
        { price: 500_000, stock: 10, color: 'black', size: 'M' },
        { price: 500_000, stock: 5, color: 'black', size: 'L' },
      ],
    });

    expect(created.name).toBe('Test Jacket');
    expect(created.skus).toHaveLength(2);
    expect(created.skus.every((s) => s.id.length > 0)).toBe(true);

    const listed = await getAdminProducts({ page: 1, pageSize: 100 });
    expect(listed.data.some((p) => p.id === created.id)).toBe(true);
  });
});

describe('updateAdminProduct', () => {
  it('updates a Product’s fields and its SKU price/stock', async () => {
    await loginAsAdminStaff();
    const created = await createAdminProduct({
      slug: 'test-cap',
      name: 'Test Cap',
      description: 'desc',
      images: [],
      categoryId: 'cat-hats',
      gender: 'unisex',
      skus: [{ price: 100_000, stock: 10, color: null, size: null }],
    });

    const updated = await updateAdminProduct(created.id, {
      slug: 'test-cap',
      name: 'Test Cap v2',
      description: 'desc v2',
      images: [],
      categoryId: 'cat-hats',
      gender: 'unisex',
      skus: [{ id: created.skus[0]?.id, price: 150_000, stock: 20, color: null, size: null }],
    });

    expect(updated.name).toBe('Test Cap v2');
    expect(updated.skus[0]).toMatchObject({ price: 150_000, stock: 20 });
  });

  it('rejects removing a SKU that is referenced by an Order, with a 409', async () => {
    await loginAsAdminStaff();

    await expect(
      updateAdminProduct('p-1', {
        slug: 'running-shoe-alpha',
        name: 'Running Shoe Alpha',
        description: 'desc',
        images: [],
        categoryId: 'cat-running',
        gender: 'men',
        // Drops every SKU including the one DH1001 references — the removal should be refused.
        skus: [{ price: 1_200_000, stock: 10, color: 'red', size: '43' }],
      }),
    ).rejects.toMatchObject({ status: 409 });
  });
});

describe('deleteAdminProduct', () => {
  it('deletes a Product that has never appeared in an Order', async () => {
    await loginAsAdminStaff();
    const created = await createAdminProduct({
      slug: 'test-disposable',
      name: 'Test Disposable',
      description: 'desc',
      images: [],
      categoryId: 'cat-hats',
      gender: 'unisex',
      skus: [{ price: 50_000, stock: 1, color: null, size: null }],
    });

    await deleteAdminProduct(created.id);

    const listed = await getAdminProducts({ page: 1, pageSize: 100 });
    expect(listed.data.some((p) => p.id === created.id)).toBe(false);
  });

  it('refuses to hard-delete a Product with a SKU referenced by an Order, with a 409 (issue #19)', async () => {
    await loginAsAdminStaff();

    await expect(deleteAdminProduct('p-1')).rejects.toBeInstanceOf(ApiError);
    await expect(deleteAdminProduct('p-1')).rejects.toMatchObject({ status: 409 });

    const listed = await getAdminProducts({ page: 1, pageSize: 100 });
    expect(listed.data.some((p) => p.id === 'p-1')).toBe(true);
  });
});

describe('createAdminCategory / getAdminCategories (issue #20)', () => {
  it('creates a top-level Category (parentId: null)', async () => {
    await loginAsAdminStaff();
    const created = await createAdminCategory({ slug: 'test-outerwear', name: 'Outerwear', parentId: null });

    expect(created.parentId).toBeNull();
    const listed = await getAdminCategories();
    expect(listed.data.some((c) => c.id === created.id)).toBe(true);
  });

  it('creates a child Category under an existing parent', async () => {
    await loginAsAdminStaff();
    const created = await createAdminCategory({ slug: 'test-raincoats', name: 'Raincoats', parentId: 'cat-jackets' });

    expect(created.parentId).toBe('cat-jackets');
  });

  it('rejects a parentId that does not exist', async () => {
    await loginAsAdminStaff();
    await expect(createAdminCategory({ slug: 'test-orphan', name: 'Orphan', parentId: 'cat-nonexistent' })).rejects.toMatchObject({
      status: 400,
    });
  });
});

describe('updateAdminCategory (issue #20)', () => {
  it('renames a Category without touching its tree position', async () => {
    await loginAsAdminStaff();
    const updated = await updateAdminCategory('cat-running', { slug: 'running', name: 'Running (renamed)', parentId: 'cat-shoes' });

    expect(updated.name).toBe('Running (renamed)');
    expect(updated.parentId).toBe('cat-shoes');
  });

  it('moves a Category to a different parent', async () => {
    await loginAsAdminStaff();
    const updated = await updateAdminCategory('cat-running', { slug: 'running', name: 'Running', parentId: 'cat-basketball' });

    expect(updated.parentId).toBe('cat-basketball');
  });

  it('refuses to move a Category to become its own descendant (cycle), with a 400', async () => {
    await loginAsAdminStaff();
    // cat-running is a child of cat-shoes — making cat-shoes a child of cat-running would cycle.
    await expect(updateAdminCategory('cat-shoes', { slug: 'shoes', name: 'Shoes', parentId: 'cat-running' })).rejects.toMatchObject({
      status: 400,
    });
  });

  it('refuses to set a Category as its own parent, with a 400', async () => {
    await loginAsAdminStaff();
    await expect(updateAdminCategory('cat-shoes', { slug: 'shoes', name: 'Shoes', parentId: 'cat-shoes' })).rejects.toMatchObject({
      status: 400,
    });
  });
});

describe('deleteAdminCategory (issue #20)', () => {
  it('deletes a leaf Category with no children and no Products', async () => {
    await loginAsAdminStaff();
    const created = await createAdminCategory({ slug: 'test-empty', name: 'Test Empty', parentId: null });

    await deleteAdminCategory(created.id);

    const listed = await getAdminCategories();
    expect(listed.data.some((c) => c.id === created.id)).toBe(false);
  });

  it('refuses to delete a Category that has child Categories, with a 409', async () => {
    await loginAsAdminStaff();
    // cat-shoes has children (cat-running, cat-basketball, ...).
    await expect(deleteAdminCategory('cat-shoes')).rejects.toMatchObject({ status: 409 });

    const listed = await getAdminCategories();
    expect(listed.data.some((c) => c.id === 'cat-shoes')).toBe(true);
  });

  it('refuses to delete a Category that has Products assigned to it, with a 409', async () => {
    await loginAsAdminStaff();
    // cat-running has real seeded Products (p-1..p-4).
    await expect(deleteAdminCategory('cat-running')).rejects.toMatchObject({ status: 409 });
  });
});
