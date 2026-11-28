# Chiến lược kiểm thử Storefront

**Trạng thái:** thiết kế đã duyệt, chưa triển khai (2026-11-28). Luật chung cho ba ứng dụng (mức rủi ro, ma trận trách nhiệm FE/BE, hành trình E2E full-stack, gate, audit) nằm ở `docs/testing/` của repo workspace [fashion-store](https://github.com/LuongCongThanh/fashion-store/tree/main/docs/testing). File này nói phần của Storefront. Danh sách kịch bản: [traceability.md](traceability.md).

## Storefront bảo vệ gì

Backend quyết định giá, Tồn kho, Voucher, quyền và trạng thái đơn ([tổng quan](../overview.md)). Storefront chịu trách nhiệm:

1. **Hiển thị đúng số Backend trả**: giá, Giá khuyến mãi, Tạm tính, giảm Voucher, phí ship, Tổng tiền; không tự tính tổng để đặt đơn.
2. **Không để Người mua gửi sai một cách vô tình**: chặn double submit khi đặt đơn và gửi kèm idempotency key, validate form địa chỉ, chặn số lượng ngoài 1–10.
3. **Phục hồi khi Backend từ chối**: giá đổi (Tính thử mới), thiếu hàng (Biến thể nào, còn bao nhiêu), Voucher không hợp lệ, phiên hết hạn, mạng lỗi.
4. **SEO, SSR, i18n, accessibility, hiệu năng** của trang công khai.

## Tầng test

| Tầng           | Công cụ và seam                                                                         | Dùng cho                                                                                               |
| -------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Unit           | Vitest                                                                                  | Mapper API → model, định dạng VND, schema form, query key, URL filter, chọn Biến thể theo màu × size   |
| Component      | Testing Library + `src/testing/render.tsx`, MSW cho HTTP                                | Trạng thái loading/rỗng/lỗi/thành công, form, nút disabled, double submit, keyboard                    |
| Integration    | Testing Library + MSW + TanStack Query thật, hoặc HTTP-level cho route handler và proxy | Gọi đúng endpoint, cache invalidation sau thêm giỏ, request cũ không ghi đè, refresh phiên, SSR reader |
| E2E giao diện  | Playwright với catalog harness và MSW (`playwright.config.ts`)                          | Điều hướng, tìm kiếm, lọc, PDP, luồng giỏ và checkout trên dữ liệu giả                                 |
| E2E production | `playwright.production.config.ts`, Chromium, build production                           | PWA, runtime, SSR của trang công khai                                                                  |
| E2E full-stack | Repo workspace, Backend thật, MSW tắt                                                   | J0–J4, J6, J7                                                                                          |
| Contract       | CI `gen:api` + `git diff --exit-code src/integrations/backend/generated` + typecheck    | Storefront dùng field đã đổi hoặc bị bỏ                                                                |

MSW là lớp giả HTTP cho test và cho flow chuyển tiếp chưa nối API. Handler MSW phải trả payload đúng schema sinh từ OpenAPI; khi một flow chuyển sang API thật, giữ handler cho test và thêm hành trình full-stack tương ứng.

## Quy ước

Cách viết test (đặt file, đặt tên, AAA, mock, chống flaky) theo [testing rule](../../../.claude/rules/process/testing.md). File này chỉ bổ sung:

- Kiểu dữ liệu fake lấy từ schema sinh trong `src/integrations/backend`, không viết tay.
- Không tính lại tiền trong test FE: expected là số lấy từ payload Backend giả, test chỉ kiểm hiển thị và định dạng.
- Tên test bắt đầu bằng mã kịch bản khi có, ví dụ `it('SF-CHK-03: bấm đặt hai lần chỉ gửi một request')`.
- Assertion theo điều người dùng thấy và request đã gửi; không snapshot cả component, không test class CSS.
- Locator E2E theo role, label hoặc `data-testid`; không `waitForTimeout`; trace và screenshot khi fail.
- Test khác module chỉ dùng public hoặc test entry được cho phép (theo [kiến trúc](../architecture.md)).

## Phi chức năng

| Hạng mục       | Cách kiểm                                                                                            | Khi chạy                             |
| -------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------ |
| SEO            | Metadata, canonical, `hreflang` vi/en, robots, sitemap, structured data Product trong HTML đã render | PR (unit/HTTP), nightly (production) |
| SSR, hydration | HTML server có nội dung catalog; không lỗi hydration trong console                                   | Nightly                              |
| Accessibility  | axe trên trang chủ, danh mục, PDP, giỏ, checkout; checkout dùng được bằng bàn phím                   | Nightly                              |
| Hiệu năng      | Lighthouse trên build production: LCP, INP, CLS cho trang chủ, danh mục, PDP                         | Nightly, theo dõi xu hướng           |
| Browser matrix | Chromium ở PR; Firefox và WebKit nightly                                                             | Nightly                              |
| Bảo mật        | Không render HTML thô từ dữ liệu Backend; token không vào `localStorage` hay URL                     | PR (unit)                            |
| 3D, PWA        | WebGL lỗi vẫn mua được; offline không cho đặt đơn                                                    | PR (E2E production)                  |

Ngưỡng Lighthouse và axe đặt sau lần đo đầu tiên; trước đó chỉ báo cáo, không chặn.

## CI

| Giai đoạn | Chạy                                                                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| PR        | `docs:check`, `lint` (gồm boundaries), `format:check`, contract diff, `typecheck`, `test`, `test:coverage` (sàn 50%), `build`, `test:e2e:production` |
| Nightly   | E2E full-stack ở repo workspace; Firefox, WebKit; axe; Lighthouse                                                                                    |

## Thứ tự làm

1. P0 trên dữ liệu giả: checkout (double submit, Tính thử mới, thiếu hàng, form địa chỉ), giỏ (giới hạn 10, giá đổi), auth (refresh, hết phiên).
2. Khi giỏ, checkout, auth nối API thật: bật J1–J4 ở workspace; giữ test MSW cho trạng thái lỗi.
3. P1: catalog, lọc, tìm kiếm, SEO.
4. Nightly phi chức năng.
