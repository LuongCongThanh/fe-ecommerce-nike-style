# Manifest phạm vi — Gỡ guard admin

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng đường dẫn hiện hành thay vì path cũ. Đây không phải approved.files hay quyền sửa mọi file; spec là nguồn chuẩn về phạm vi và acceptance criteria. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `src/proxy.ts` (trước task 32 là `src/middleware.ts`)
- `src/shared/constants/auth-cookies.ts` (xoá)

## Consumer trực tiếp hiện tại ngoài owner

- Không có. `USER_ROLE_COOKIE` chỉ được file proxy import.

## Config/docs cần đối chiếu

- Docs hiện hành nhắc `is_admin` hoặc chặn `/admin` nếu `grep` tìm thấy
- `src/lib/api/endpoints/order-transitions.ts`, `src/shared/ui/SocialMarks.tsx`, `src/lib/api/generated/openapi.ts`: ngoài phạm vi, không sửa

## Test cũ được thích ứng trong scope

- `src/proxy.test.ts` (trước task 32 là `src/middleware.test.ts`): xoá ba test `/admin`, đổi tên một test; không sửa assertion khác
- Chạy kiểm: `e2e/checkout.spec.ts`, `e2e/auth.spec.ts`

## Giao nhau với task khác

- Task 32: blocker; làm sau rename để diff nằm gọn trên `src/proxy.ts`.
