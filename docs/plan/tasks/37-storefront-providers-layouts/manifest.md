# Manifest phạm vi — Providers và layouts giữ lifecycle

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng owner đích trong mapping. Đây không phải approved.files hay quyền sửa mọi file. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `src/app/_composition/AppProviders.test.tsx`
- `src/app/_composition/AppProviders.tsx`
- `src/features/storefront-shell/components/DesktopMegaMenu.tsx`
- `src/features/storefront-shell/components/Footer.tsx`
- `src/features/storefront-shell/components/Header.tsx`
- `src/features/storefront-shell/components/MobileNav.tsx`
- `src/features/storefront-shell/hooks/useMergeGuestDataOnLogin.ts`
- `src/shared/lib/query-client.ts`

## Consumer trực tiếp hiện tại ngoài owner

- `src/app/[locale]/(shop)/layout.tsx`
- `src/app/layout.test.tsx`
- `src/app/layout.tsx`

## Config/docs cần đối chiếu

- `docs/architecture.md` và tài liệu owner tương ứng ở spec; chỉ cập nhật hiện trạng đã triển khai.

## Test cũ được thích ứng trong scope

- `src/app/_composition/AppProviders.test.tsx`
- `src/app/layout.test.tsx`

Các test mới đi cạnh owner hoặc e2e/production theo policy. Với consumer test khác chưa xuất hiện ở scan, bổ sung manifest/file scope trước triển khai; không thay assertion để né regression. Không công khai private stores để cứu setup test.
