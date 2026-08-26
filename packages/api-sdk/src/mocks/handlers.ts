import { http, HttpResponse } from 'msw';

import type { CategoryInput, ProductInput } from '@repo/schemas/catalog';
import type { InventoryUpdateInput } from '@repo/schemas/inventory';

import { createAddress, deleteAddress, getAddresses, setDefaultAddress, updateAddress } from './address-fixtures';
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
  updateUserProfile,
} from './auth-fixtures';
import { mergeAccountCart, resolveSkus } from './cart-fixtures';
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  findProductById,
  findProductBySkuId,
  findProductBySlug,
  listProducts,
  mockCategories,
  updateCategory,
  updateProduct,
} from './catalog-fixtures';
import {
  addAccountOrder,
  allocateOrderId,
  cancelOrderForCustomer,
  getAccountOrder,
  getAccountOrders,
  getOrderByRequestKey,
  recordRequestKey,
  requestReturnForCustomer,
} from './order-fixtures';
import { getInventoryAuditLog, listInventory, updateInventoryOnHand } from './inventory-fixtures';
import { consumeReservation, createReservation } from './reservation-fixtures';
import {
  createStaffSession,
  findStaffByAccessToken,
  findStaffByEmail,
  permissionsFor,
  revokeByStaffRefreshToken,
  rotateStaffRefreshToken,
  toPublicStaff,
} from './staff-fixtures';
import { mergeAccountWishlist, resolveProducts } from './wishlist-fixtures';

const SHIPPING_FEE_BY_METHOD = { standard: 30_000, express: 60_000 } as const;

function errorResponse(status: number, code: string, message: string) {
  return HttpResponse.json({ error: { code, message } }, { status });
}

/** Shared query-string parsing behind both the public PLP listing and Admin's product table. */
function parseProductListQuery(url: URL): { page: number; pageSize: number; query: Parameters<typeof listProducts>[0] } {
  const category = url.searchParams.get('category');
  const gender = url.searchParams.get('gender');
  const search = url.searchParams.get('search');
  const minPrice = url.searchParams.get('minPrice');
  const maxPrice = url.searchParams.get('maxPrice');
  const sort = url.searchParams.get('sort');
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '20');

  return {
    page,
    pageSize,
    query: {
      category: category ?? undefined,
      gender: (gender ?? undefined) as Parameters<typeof listProducts>[0]['gender'],
      search: search ?? undefined,
      minPrice: minPrice !== null && minPrice !== '' ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== null && maxPrice !== '' ? Number(maxPrice) : undefined,
      sort: (sort ?? undefined) as Parameters<typeof listProducts>[0]['sort'],
      page,
      pageSize,
    },
  };
}

/** MSW request handlers shared by both the browser worker and the node server — see ./`../testing`. */
export const handlers = [
  http.get('*/api/catalog/categories', () => {
    return HttpResponse.json({ data: mockCategories });
  }),

  http.get('*/api/catalog/products', ({ request }) => {
    const { page, pageSize, query } = parseProductListQuery(new URL(request.url));
    const { data, total, totalPages } = listProducts(query);

    return HttpResponse.json({ data, meta: { page, pageSize, total, totalPages } });
  }),

  http.get('*/api/catalog/products/:slug', ({ params }) => {
    const product = findProductBySlug(String(params.slug));

    if (product === undefined) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Product not found' } }, { status: 404 });
    }

    return HttpResponse.json({ data: product });
  }),

  // Admin Product/Variant/SKU CRUD (issue #19) — same `Product` shape and `listProducts` filter/sort/
  // paginate the public PLP uses, gated on a valid Staff session instead of being publicly readable.
  http.get('*/api/admin/products', ({ request }) => {
    const staff = findStaffByAccessToken(request.headers.get('authorization'));
    if (staff === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const { page, pageSize, query } = parseProductListQuery(new URL(request.url));
    const { data, total, totalPages } = listProducts(query);

    return HttpResponse.json({ data, meta: { page, pageSize, total, totalPages } });
  }),

  http.get('*/api/admin/products/:id/', ({ request, params }) => {
    const staff = findStaffByAccessToken(request.headers.get('authorization'));
    if (staff === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const product = findProductById(String(params.id));
    if (product === undefined) {
      return errorResponse(404, 'NOT_FOUND', 'Không tìm thấy sản phẩm.');
    }
    return HttpResponse.json(product);
  }),

  http.post('*/api/admin/products/', async ({ request }) => {
    const staff = findStaffByAccessToken(request.headers.get('authorization'));
    if (staff === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const body = (await request.json()) as ProductInput;
    return HttpResponse.json(createProduct(body), { status: 201 });
  }),

  http.patch('*/api/admin/products/:id/', async ({ request, params }) => {
    const staff = findStaffByAccessToken(request.headers.get('authorization'));
    if (staff === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const body = (await request.json()) as ProductInput;
    const result = updateProduct(String(params.id), body);
    if (!result.ok) {
      const status = result.code === 'NOT_FOUND' ? 404 : 409;
      return errorResponse(status, result.code, result.message);
    }
    return HttpResponse.json(result.product);
  }),

  http.delete('*/api/admin/products/:id/', ({ request, params }) => {
    const staff = findStaffByAccessToken(request.headers.get('authorization'));
    if (staff === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const result = deleteProduct(String(params.id));
    if (!result.ok) {
      const status = result.code === 'NOT_FOUND' ? 404 : 409;
      return errorResponse(status, result.code, result.message);
    }
    return HttpResponse.json({});
  }),

  // Admin Category tree management (issue #20) — same `Category` shape the public PLP's filter panel
  // reads, gated on a valid Staff session.
  http.get('*/api/admin/categories/', ({ request }) => {
    const staff = findStaffByAccessToken(request.headers.get('authorization'));
    if (staff === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    return HttpResponse.json({ data: mockCategories });
  }),

  http.post('*/api/admin/categories/', async ({ request }) => {
    const staff = findStaffByAccessToken(request.headers.get('authorization'));
    if (staff === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const body = (await request.json()) as CategoryInput;
    const result = createCategory(body);
    if (!result.ok) {
      return errorResponse(400, result.code, result.message);
    }
    return HttpResponse.json(result.category, { status: 201 });
  }),

  http.patch('*/api/admin/categories/:id/', async ({ request, params }) => {
    const staff = findStaffByAccessToken(request.headers.get('authorization'));
    if (staff === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const body = (await request.json()) as CategoryInput;
    const result = updateCategory(String(params.id), body);
    if (!result.ok) {
      const status = result.code === 'NOT_FOUND' ? 404 : 400;
      return errorResponse(status, result.code, result.message);
    }
    return HttpResponse.json(result.category);
  }),

  http.delete('*/api/admin/categories/:id/', ({ request, params }) => {
    const staff = findStaffByAccessToken(request.headers.get('authorization'));
    if (staff === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const result = deleteCategory(String(params.id));
    if (!result.ok) {
      const status = result.code === 'NOT_FOUND' ? 404 : 409;
      return errorResponse(status, result.code, result.message);
    }
    return HttpResponse.json({});
  }),

  // Admin Inventory view/update (issue #21) — on_hand/reserved/available per SKU, gated on a valid
  // Staff session. Writes go through updateInventoryOnHand, which also appends an audit-log entry.
  http.get('*/api/admin/inventory/', ({ request }) => {
    const staff = findStaffByAccessToken(request.headers.get('authorization'));
    if (staff === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    return HttpResponse.json({ data: listInventory() });
  }),

  http.get('*/api/admin/inventory/audit-log/', ({ request }) => {
    const staff = findStaffByAccessToken(request.headers.get('authorization'));
    if (staff === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const skuId = new URL(request.url).searchParams.get('skuId') ?? undefined;
    return HttpResponse.json({ data: getInventoryAuditLog(skuId) });
  }),

  http.patch('*/api/admin/inventory/:skuId/', async ({ request, params }) => {
    const staff = findStaffByAccessToken(request.headers.get('authorization'));
    if (staff === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const body = (await request.json()) as InventoryUpdateInput;
    const result = updateInventoryOnHand(String(params.skuId), body.onHand, { id: staff.id, name: staff.name });
    if (!result.ok) {
      return errorResponse(404, result.code, result.message);
    }
    return HttpResponse.json(result.item);
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

    if (user?.password !== body.password) {
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

  // Profile update (issue #15) — email/id/role aren't editable this way.
  http.patch('*/api/auth/me/update/', async ({ request }) => {
    const user = findUserByAccessToken(request.headers.get('authorization'));
    if (user === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const body = (await request.json()) as { firstName?: string; lastName?: string; phone?: string };
    return HttpResponse.json(toPublicUser(updateUserProfile(user, body)));
  }),

  // Staff auth (issue #18/#24) — a separate identity/session from Customer auth above.
  http.post('*/api/staff/login/', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    const staff = findStaffByEmail(body.email);

    if (staff?.password !== body.password) {
      return errorResponse(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng.');
    }
    if (!staff.isActive) {
      return errorResponse(403, 'STAFF_INACTIVE', 'Tài khoản đã bị vô hiệu hoá.');
    }

    const { access, refresh } = createStaffSession(staff.id);
    return HttpResponse.json({ staff: toPublicStaff(staff), permissions: permissionsFor(staff), access, refresh });
  }),

  http.post('*/api/staff/refresh/', async ({ request }) => {
    const body = (await request.json()) as { refreshToken: string };
    const result = rotateStaffRefreshToken(body.refreshToken);

    if (result.status !== 'ok') {
      return errorResponse(401, 'REFRESH_INVALID', 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
    }

    return HttpResponse.json({ access: result.access, refresh: result.refresh });
  }),

  http.post('*/api/staff/logout/', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as { refreshToken?: string } | null;
    if (body?.refreshToken !== undefined) revokeByStaffRefreshToken(body.refreshToken);
    return HttpResponse.json({});
  }),

  http.get('*/api/staff/me/', ({ request }) => {
    const staff = findStaffByAccessToken(request.headers.get('authorization'));

    if (staff === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    return HttpResponse.json({ staff: toPublicStaff(staff), permissions: permissionsFor(staff) });
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

  // Wishlist references Product only, no SKU/quantity (glossary.md) — resolves live Product data for
  // display, same never-cache-on-the-client pattern as Cart's `/api/catalog/skus`.
  http.get('*/api/wishlist/products', ({ request }) => {
    const idsParam = new URL(request.url).searchParams.get('ids') ?? '';
    const productIds = idsParam.split(',').filter((id) => id !== '');
    return HttpResponse.json({ data: resolveProducts(productIds) });
  }),

  // Merge-after-login: union + dedupe by Product id, no quantity/conflict concept (glossary.md — Merge Wishlist).
  http.post('*/api/wishlist/merge', async ({ request }) => {
    const user = findUserByAccessToken(request.headers.get('authorization'));
    if (user === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const body = (await request.json()) as { items: { productId: string }[] };
    const merged = mergeAccountWishlist(
      user.id,
      body.items.map((i) => i.productId),
    );
    return HttpResponse.json({ data: resolveProducts(merged) });
  }),

  // Order history (issue #15, read side only) — Customer chỉ xem được Order của chính mình
  // (glossary.md — Customer): `getAccountOrder(s)` never looks outside `user.id`'s own orders, so
  // there's no cross-user data path to guard against, not a permission check bolted on afterward.
  http.get('*/api/orders/', ({ request }) => {
    const user = findUserByAccessToken(request.headers.get('authorization'));
    if (user === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }
    return HttpResponse.json(getAccountOrders(user.id));
  }),

  http.get('*/api/orders/:id/', ({ request, params }) => {
    const user = findUserByAccessToken(request.headers.get('authorization'));
    if (user === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const order = getAccountOrder(user.id, Number(params.id));
    if (order === undefined) {
      return errorResponse(404, 'NOT_FOUND', 'Không tìm thấy đơn hàng.');
    }
    return HttpResponse.json(order);
  }),

  // Address book (issue #15) — same per-Customer-only shape as Orders above.
  http.get('*/api/addresses/', ({ request }) => {
    const user = findUserByAccessToken(request.headers.get('authorization'));
    if (user === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }
    return HttpResponse.json(getAddresses(user.id));
  }),

  http.post('*/api/addresses/', async ({ request }) => {
    const user = findUserByAccessToken(request.headers.get('authorization'));
    if (user === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const body = (await request.json()) as Parameters<typeof createAddress>[1];
    return HttpResponse.json(createAddress(user.id, body), { status: 201 });
  }),

  http.patch('*/api/addresses/:id/', async ({ request, params }) => {
    const user = findUserByAccessToken(request.headers.get('authorization'));
    if (user === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const body = (await request.json()) as Parameters<typeof updateAddress>[2];
    const updated = updateAddress(user.id, String(params.id), body);
    if (updated === undefined) {
      return errorResponse(404, 'NOT_FOUND', 'Không tìm thấy địa chỉ.');
    }
    return HttpResponse.json(updated);
  }),

  http.delete('*/api/addresses/:id/', ({ request, params }) => {
    const user = findUserByAccessToken(request.headers.get('authorization'));
    if (user === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const deleted = deleteAddress(user.id, String(params.id));
    if (!deleted) {
      return errorResponse(404, 'NOT_FOUND', 'Không tìm thấy địa chỉ.');
    }
    return HttpResponse.json({});
  }),

  http.post('*/api/addresses/:id/default/', ({ request, params }) => {
    const user = findUserByAccessToken(request.headers.get('authorization'));
    if (user === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const updated = setDefaultAddress(user.id, String(params.id));
    if (updated === undefined) {
      return errorResponse(404, 'NOT_FOUND', 'Không tìm thấy địa chỉ.');
    }
    return HttpResponse.json(updated);
  }),

  // Reservation (issue #16, glossary.md) — created only at Checkout start, never at add-to-cart.
  http.post('*/api/checkout/reservations', async ({ request }) => {
    const user = findUserByAccessToken(request.headers.get('authorization'));
    if (user === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const body = (await request.json()) as { items: { skuId: string; quantity: number }[] };
    const result = createReservation(body.items);
    if (!result.ok) {
      return errorResponse(409, 'INSUFFICIENT_STOCK', 'Một sản phẩm trong giỏ hàng không còn đủ tồn kho.');
    }

    return HttpResponse.json({ reservationId: result.reservationId, expiresAt: new Date(result.expiresAt).toISOString() });
  }),

  // Place Order COD (issue #16) — idempotent by `requestKey`, commits the Reservation's stock
  // (Decision #38: Reservation → committed stock at the moment Order is created, no gateway/webhook to
  // wait for), and snapshots each OrderItem's name/variant/price/image at commit time (glossary.md —
  // OrderItem) rather than referencing the live Product/SKU.
  http.post('*/api/orders/', async ({ request }) => {
    const user = findUserByAccessToken(request.headers.get('authorization'));
    if (user === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const body = (await request.json()) as {
      fullName: string;
      phoneNumber: string;
      address: string;
      city: string;
      district: string;
      ward: string;
      shippingMethod: 'standard' | 'express';
      note?: string;
      reservationId: string;
      requestKey: string;
    };

    const replay = getOrderByRequestKey(user.id, body.requestKey);
    if (replay !== undefined) {
      return HttpResponse.json(replay, { status: 200 });
    }

    const reservedItems = consumeReservation(body.reservationId);
    if (reservedItems === undefined) {
      return errorResponse(409, 'RESERVATION_EXPIRED', 'Phiên đặt hàng đã hết hạn, vui lòng thử lại.');
    }

    const items = reservedItems
      .flatMap((item) => {
        const match = findProductBySkuId(item.skuId);
        if (match === undefined) return [];
        const variantName = [match.sku.color, match.sku.size].filter((v): v is string => v !== null).join(' / ');
        return [
          {
            product_name: match.product.name,
            variant_name: variantName,
            image: match.product.images.at(0) ?? '',
            price: match.sku.price,
            quantity: item.quantity,
            subtotal: match.sku.price * item.quantity,
            skuId: item.skuId,
          },
        ];
      })
      .map((item, index) => ({ id: index + 1, ...item }));

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingFee = SHIPPING_FEE_BY_METHOD[body.shippingMethod];
    const now = new Date().toISOString();
    const id = allocateOrderId();

    const order = {
      id,
      code: `DH${String(id)}`,
      status: 'PENDING' as const,
      payment_method: 'cod' as const,
      payment_status: 'pending' as const,
      items,
      subtotal,
      shipping_fee: shippingFee,
      total: subtotal + shippingFee,
      address: `${body.address}, ${body.ward}, ${body.district}, ${body.city}`,
      note: body.note ?? '',
      created_at: now,
      updated_at: now,
      delivered_at: null,
    };

    addAccountOrder(user.id, order);
    recordRequestKey(body.requestKey, id);

    return HttpResponse.json(order, { status: 201 });
  }),

  // Cancel (issue #17) — only valid from PENDING/PROCESSING (glossary.md); from PACKED onward this
  // 409s instead of silently no-op'ing, so the FE surfaces a real error rather than a stale UI.
  http.post('*/api/orders/:id/cancel/', ({ request, params }) => {
    const user = findUserByAccessToken(request.headers.get('authorization'));
    if (user === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const result = cancelOrderForCustomer(user.id, Number(params.id));
    if (!result.ok) {
      return errorResponse(result.code === 'NOT_FOUND' ? 404 : 409, result.code, result.message);
    }
    return HttpResponse.json(result.order);
  }),

  // Return request (issue #17) — only from DELIVERED, only within the 7-day return window (glossary.md
  // — Return window); rejected at validate, same as Cancel above.
  http.post('*/api/orders/:id/return-request/', ({ request, params }) => {
    const user = findUserByAccessToken(request.headers.get('authorization'));
    if (user === undefined) {
      return errorResponse(401, 'UNAUTHORIZED', 'Chưa đăng nhập hoặc phiên đã hết hạn.');
    }

    const result = requestReturnForCustomer(user.id, Number(params.id));
    if (!result.ok) {
      return errorResponse(result.code === 'NOT_FOUND' ? 404 : 409, result.code, result.message);
    }
    return HttpResponse.json(result.order);
  }),
];
