# Manifest phạm vi — Nền kiểm chứng và baseline có thể tái lập

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng owner đích trong mapping. Đây không phải approved.files hay quyền sửa mọi file. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `e2e/auth.spec.ts`
- `e2e/cart.spec.ts`
- `e2e/catalog.spec.ts`
- `e2e/checkout.spec.ts`
- `e2e/hero-3d.spec.ts`
- `e2e/home.spec.ts`
- `e2e/pdp.spec.ts`
- `e2e/providers.spec.ts`
- `e2e/search.spec.ts`

## Consumer trực tiếp hiện tại ngoài owner

- Không thấy consumer ngoài owner bằng quét literal alias; vẫn phải rà config/dynamic import ở plan.

## Config/docs cần đối chiếu

- `package.json`
- `playwright.config.ts`
- `.github/workflows/ci.yml`
- `vitest.config.ts`
- `.env.example`
- `docs/architecture.md` và tài liệu owner tương ứng ở spec; chỉ cập nhật hiện trạng đã triển khai.

## File mới dự kiến (chưa tồn tại)

- `e2e/support/catalog-server.ts`
- `e2e/support/catalog-fixtures.ts`
- `e2e/support/catalog-server.test.ts`
- `playwright.production.config.ts`
- `e2e/production/runtime.spec.ts`
- `e2e/production/pwa.spec.ts`

## Test cũ được thích ứng trong scope

- `e2e/auth.spec.ts`
- `e2e/cart.spec.ts`
- `e2e/catalog.spec.ts`
- `e2e/checkout.spec.ts`
- `e2e/hero-3d.spec.ts`
- `e2e/home.spec.ts`
- `e2e/pdp.spec.ts`
- `e2e/providers.spec.ts`
- `e2e/search.spec.ts`

Các test mới đi cạnh owner hoặc e2e/production theo policy. Với consumer test khác chưa xuất hiện ở scan, bổ sung manifest/file scope trước triển khai; không thay assertion để né regression. Không công khai private stores để cứu setup test.
