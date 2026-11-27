# Manifest phạm vi — Hardening Next config

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng đường dẫn hiện hành thay vì path cũ. Đây không phải approved.files hay quyền sửa mọi file; spec là nguồn chuẩn về phạm vi và acceptance criteria. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `next.config.ts` (`headers`, `images.remotePatterns`)

## Consumer trực tiếp hiện tại ngoài owner

- `src/features/home/home-content.ts` (`placehold.co`, `i.pravatar.cc`)
- `src/lib/api/mocks/catalog-fixtures.ts` (`placehold.co`)
- `src/shared/lib/cloudinary.ts` (`res.cloudinary.com`)

## Config/docs cần đối chiếu

- Schema env và `.env.example` sau task 22 (biến host storage, ví dụ `IMAGE_STORAGE_HOST`)
- `docs/storefront/architecture.md` hoặc `docs/storefront/api-integration.md` nếu mô tả ảnh/host
- `src/middleware.ts` (hoặc `src/proxy.ts` sau task 32): ngoài phạm vi, không sửa

## Test cũ được thích ứng trong scope

- Không có. `allow-test-changes: false`; test hiện có chỉ chạy để kiểm, không sửa.
- Chạy kiểm: `e2e/home.spec.ts`, `e2e/catalog.spec.ts`, `src/shared/lib/cloudinary.test.ts`.

## Giao nhau với task khác

- Task 22: blocker; dùng đường dẫn schema env thực tế sau khi 22 merge.
- Task 32: đổi tên file proxy, ngoài phạm vi 28.
