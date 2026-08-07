import { http, HttpResponse } from 'msw';

import type { Product } from '@repo/schemas/catalog';

import {
  consumeResetToken,
  createResetToken,
  createSession,
  createUser,
  findUserByAccessToken,
  findUserByEmail,
  revokeAllSessionsForUser,
  revokeByRefreshToken,
  rotateRefreshToken,
  setUserPassword,
  toPublicUser,
} from './auth-fixtures';
import { mergeAccountCart, resolveSkus } from './cart-fixtures';
import { minSkuPrice, mockCategories, mockProducts, resolveCategoryIds } from './catalog-fixtures';
import { matchesSearchQuery } from './search-match';

function errorResponse(status: number, code: string, message: string) {
  return HttpResponse.json({ error: { code, message } }, { status });
}

function sortProducts(products: Product[], sort: string): Product[] {
  const sorted = [...products];
  if (sort === 'price_asc') return sorted.sort((a, b) => minSkuPrice(a) - minSkuPrice(b));
  if (sort === 'price_desc') return sorted.sort((a, b) => minSkuPrice(b) - minSkuPrice(a));
  // 'newest' — mock has no createdAt, fall back to stable insertion order reversed.
  return sorted.reverse();
}

/** MSW request handlers shared by both the browser worker and the node server — see ./`../testing`. */
export const handlers = [
  http.get('*/api/catalog/categories', () => {
    return HttpResponse.json({ data: mockCategories });
  }),

  http.get('*/api/catalog/products', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const gender = url.searchParams.get('gender');
    const search = url.searchParams.get('search');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const sort = url.searchParams.get('sort') ?? 'newest';
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');

    let filtered = mockProducts.slice();

    if (category !== null && category !== '') {
      const categoryIds = new Set(resolveCategoryIds(mockCategories, category));
      filtered = filtered.filter((p) => categoryIds.has(p.categoryId));
    }
    if (gender !== null && gender !== '') {
      filtered = filtered.filter((p) => p.gender === gender);
    }
    if (search !== null && search !== '') {
      // Accent-insensitive + slight-misspelling-tolerant (issue #11) — see search-match.ts.
      filtered = filtered.filter((p) => matchesSearchQuery(p.name, search) || matchesSearchQuery(p.description, search));
    }
    if (minPrice !== null && minPrice !== '') {
      filtered = filtered.filter((p) => minSkuPrice(p) >= Number(minPrice));
    }
    if (maxPrice !== null && maxPrice !== '') {
      filtered = filtered.filter((p) => minSkuPrice(p) <= Number(maxPrice));
    }

    filtered = sortProducts(filtered, sort);

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json({ data, meta: { page, pageSize, total, totalPages } });
  }),

  http.get('*/api/catalog/products/:slug', ({ params }) => {
    const product = mockProducts.find((p) => p.slug === params.slug);

    if (product === undefined) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Product not found' } }, { status: 404 });
    }

    return HttpResponse.json({ data: product });
  }),

  http.post('*/api/auth/register/', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string; firstName: string; lastName: string };

    if (findUserByEmail(body.email) !== undefined) {
      return errorResponse(409, 'EMAIL_TAKEN', 'Email đã được sử dụng.');
    }

    const user = createUser(body);
    const { access, refresh } = createSession(user.id);
    return HttpResponse.json({ user: toPublicUser(user), access, refresh }, { status: 201 });
  }),

  http.post('*/api/auth/login/', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    const user = findUserByEmail(body.email);

    if (user === undefined || user.password !== body.password) {
      return errorResponse(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng.');
    }

    const { access, refresh } = createSession(user.id);
    return HttpResponse.json({ user: toPublicUser(user), access, refresh });
  }),

  http.post('*/api/auth/refresh/', async ({ request }) => {
    const body = (await request.json()) as { refreshToken: string };
    const result = rotateRefreshToken(body.refreshToken);

    if (result.status !== 'ok') {
      return errorResponse(401, 'REFRESH_INVALID', 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
    }

    return HttpResponse.json({ access: result.access, refresh: result.refresh });
  }),

  http.post('*/api/auth/logout/', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as { refreshToken?: string } | null;
    if (body?.refreshToken !== undefined) revokeByRefreshToken(body.refreshToken);
    return HttpResponse.json({});
  }),

  // Always 200 regardless of whether the email exists — no account-enumeration signal. `devResetToken`/
  // `devUid` are a mock-only convenience so tests can complete the flow without a real email transport;
  // a real backend would email the link, never return the token in the response body.
  http.post('*/api/auth/password/reset/', async ({ request }) => {
    const body = (await request.json()) as { email: string };
    const user = findUserByEmail(body.email);

    if (user === undefined) {
      return HttpResponse.json({ message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.' });
    }

    const { token, uid } = createResetToken(user.id);
    return HttpResponse.json({ message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.', devResetToken: token, devUid: uid });
  }),

  http.post('*/api/auth/password/reset/confirm/', async ({ request }) => {
    const body = (await request.json()) as { token: string; uid: string; new_password1: string; new_password2: string };

    if (body.new_password1 !== body.new_password2) {
      return errorResponse(400, 'PASSWORD_MISMATCH', 'Mật khẩu xác nhận không khớp.');
    }

    const user = consumeResetToken(body.token, body.uid);
    if (user === undefined) {
      return errorResponse(400, 'RESET_TOKEN_INVALID', 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
    }

    setUserPassword(user, body.new_password1);
    revokeAllSessionsForUser(user.id);
    return HttpResponse.json({});
  }),

  http.get('*/api/auth/me/', ({ request }) => {
    const user = findUserByAccessToken(request.headers.get('authorization'));

    if (user === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    return HttpResponse.json(toPublicUser(user));
  }),

  // CartItem is {skuId, quantity} only (glossary.md) — price/stock are never cached client-side, so the
  // Cart hook re-resolves against the live SKU through this endpoint every time it needs to display or
  // total the cart. Unknown ids are silently dropped (SKU no longer exists).
  http.get('*/api/catalog/skus', ({ request }) => {
    const idsParam = new URL(request.url).searchParams.get('ids') ?? '';
    const skuIds = idsParam.split(',').filter((id) => id !== '');
    return HttpResponse.json({ data: resolveSkus(skuIds) });
  }),

  // Merge-after-login (Decision #36): sums quantity per matching SKU with whatever the account already
  // had, clamps each line to current stock, and returns the merged cart resolved against live SKU data.
  http.post('*/api/cart/merge', async ({ request }) => {
    const user = findUserByAccessToken(request.headers.get('authorization'));
    if (user === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const body = (await request.json()) as { items: { skuId: string; quantity: number }[] };
    const merged = mergeAccountCart(user.id, body.items);
    return HttpResponse.json({
      data: resolveSkus(merged.map((i) => i.skuId)).map((sku) => ({ ...sku, quantity: merged.find((m) => m.skuId === sku.skuId)?.quantity ?? 0 })),
    });
  }),
];
