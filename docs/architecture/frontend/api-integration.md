# API Integration (Mock-first)

## Nguyên tắc: Mock-first, với kỷ luật Contract-first ở tầng schema [Đã chốt — Decision #3 + #13]

Chưa có backend thật (non-goal giai đoạn này). Toàn bộ tương tác dữ liệu đi qua `packages/api-sdk`, được mock bằng MSW. Điểm khác với "mock tuỳ ý" thuần tuý: **schema (Zod) trong `packages/schemas` phải tồn tại trước khi component tiêu thụ dữ liệu đó** — đây là lý do Decision #13 thêm hẳn một package `schemas` riêng, trích nguyên tắc Contract-first của `FE-first.md`, nhưng **không** áp dụng toàn bộ nghi thức review 43-tuần của tài liệu đó (chỉ là tham khảo — Decision #11).

Luồng làm việc cho một entity mới (vd: `Product`):

```
1. Định nghĩa zod schema (request/response/error) trong packages/schemas
2. Viết MSW handler trong packages/api-sdk, dùng chính schema đó để mock + validate
3. Viết hàm fetch có kiểu trong packages/api-sdk, trả về type suy ra từ schema
4. packages/hooks bọc TanStack Query quanh hàm fetch đó
5. Component trong packages/commerce / apps/* tiêu thụ qua hook, KHÔNG tự fetch trực tiếp
```

Component **không bao giờ** viết dữ liệu mock tuỳ ý ngay trong file component — mọi mock đi qua MSW handler dùng schema chung, để khi thay bằng API thật chỉ cần đổi implementation của `api-sdk`, không đổi component.

## Cơ chế chuyển từ mock sang API thật [Đã chốt — Decision #28]

Biến môi trường (`NEXT_PUBLIC_API_MOCKING=enabled/disabled`) đọc ở entrypoint khởi tạo MSW (`packages/api-sdk`), quyết định gọi MSW handler hay `fetch` thật tới base URL cấu hình qua env riêng — hàm fetch trong `api-sdk` giữ nguyên chữ ký (tham số, kiểu trả về từ schema) ở cả hai chế độ, chỉ khác implementation bên trong, đúng nguyên tắc "đổi handler, không đổi component" ở trên.

## Environment/config management [Mở]

Chưa có quyết định về việc validate biến môi trường (vd: dùng `@t3-oss/env-nextjs` hoặc tự viết bằng `packages/schemas`/Zod để fail-fast khi thiếu env bắt buộc) hay cách phân biệt config theo môi trường (dev/preview/prod) cho cả 3 app. Cần quyết định trước khi có biến môi trường thật đầu tiên cần dùng (vd: base URL API thật, feature flag mocking ở trên) — hiện tại giai đoạn mock-first thuần chưa cần biến môi trường nào, nên chưa chặn Phase 0–2.

## Error envelope [Đề xuất — adopted from `FE-first.md`, không mâu thuẫn quyết định nào]

Định dạng lỗi thống nhất, định nghĩa trong `packages/schemas`, dùng bởi cả MSW handler và (sau này) API thật:

```ts
// packages/schemas/src/common/error.ts
export const apiErrorSchema = z.object({
  code: z.string(),        // vd: "PRODUCT_OUT_OF_STOCK", "VALIDATION_ERROR"
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  traceId: z.string().optional(),
});
```

Danh sách error code khởi điểm (mở rộng dần theo feature, không cần định nghĩa hết trước — nhất quán YAGNI): `VALIDATION_ERROR`, `OUT_OF_STOCK`, `PRICE_CHANGED`, `COUPON_INVALID`. (Loại bỏ các code liên quan payment gateway thật như `PAYMENT_DECLINED` khỏi danh sách gốc của `FE-first.md`, vì MVP chỉ COD — Decision #7.)

## Pagination / filter / sort contract [Đề xuất]

Shape chung cho mọi list endpoint mock (Product list, Order list...):

```ts
export const paginatedQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),      // vd: "price-asc"
  filter: z.record(z.string()).optional(),
});

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
  });
```

Contract này khớp với nguyên tắc URL-as-state ở [`routing.md`](./routing.md) — query string của PLP map trực tiếp vào `paginatedQuerySchema`.

## Query key factory cho TanStack Query [Đã chốt — Decision #31]

Mỗi entity có một key factory phân cấp trong `packages/hooks` (hoặc `features/{feature}/hooks` nếu key chỉ dùng riêng 1 feature — xem [`module-architecture.md`](./module-architecture.md)), để invalidate cache nhất quán thay vì string key rời rạc:

```ts
// packages/hooks/src/product/productKeys.ts
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: PaginatedQuery) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};
```

Invalidate `productKeys.lists()` làm mới mọi trang đã filter; `productKeys.detail(id)` chỉ nhắm đúng 1 entity — tránh phải nhớ thủ công từng key string khi cache cần invalidate sau mutation (vd: cập nhật tồn kho sau checkout).

## Quan hệ package

```
packages/schemas   → Zod source of truth, không phụ thuộc gì khác trong repo
      ↓
packages/api-sdk   → fetch functions (typed từ schema) + MSW handlers (dùng schema để mock/validate)
      ↓
packages/hooks     → TanStack Query wrapper quanh api-sdk
      ↓
apps/*, packages/commerce → tiêu thụ qua hooks
```

Xem thêm quy tắc phụ thuộc tổng quát ở [`module-architecture.md`](./module-architecture.md).
