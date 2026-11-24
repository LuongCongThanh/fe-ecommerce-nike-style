---
status: todo
blocked-by:
  - 32-middleware-to-proxy
pr:
kind: refactor
approved:
  files: []
  commands: []
retro-turns:
allow-test-changes: true
---

# Spec 33: Gỡ nhánh chặn `/admin` khỏi proxy

Branch: `refactor/33-remove-admin-route-guard`

## Problem Statement

Proxy của Storefront (`src/middleware.ts`, sau task 32 là `src/proxy.ts`) vẫn giữ logic từ thời repo còn `apps/admin`:

- `/(vi|en)/admin` nằm trong `PROTECTED_PATTERNS`, và `ADMIN_PATTERN` chuyển người dùng có cookie `is_admin` khác `'true'` về `/home`.
- `src/shared/constants/auth-cookies.ts` chỉ export `USER_ROLE_COOKIE = 'is_admin'`, và chỉ proxy dùng.

Kiểm tra ngày 24/11/2026:

- Storefront không có route nào dưới `src/app/[locale]/**/admin`, và không có link nào trỏ tới `/admin`.
- Không code nào trong Storefront hay `be-demo/src` đặt cookie `is_admin`.
- Back-office thuộc repo `cms` (AGENTS.md của workspace).

Nhánh này vì vậy không bảo vệ trang nào. Nó chỉ khiến người đọc nghĩ Storefront có khu admin và có kiểm tra quyền theo cookie.

## Solution

- Bỏ `/(vi|en)/admin` khỏi `PROTECTED_PATTERNS`; xoá `ADMIN_PATTERN` và khối kiểm `USER_ROLE_COOKIE`.
- Xoá `src/shared/constants/auth-cookies.ts`.
- Giữ ý của comment "cookie chỉ là gợi ý cho UX, Backend enforce authorization" ở chỗ kiểm `access_token`, vì ý đó vẫn đúng.
- Test: xoá ba test về `/admin`. Đổi tên test `does not touch the admin role check for non-admin protected paths` thành một mô tả không nhắc admin, giữ nguyên assertion.

Hành vi sau khi gỡ: `/vi/admin/...` đi thẳng vào `next-intl` và trả 404 như mọi đường dẫn không tồn tại, không còn chuyển về `/login` hay `/home`.

## Phạm vi

Trong phạm vi: `src/proxy.ts`, `src/proxy.test.ts`, `src/shared/constants/auth-cookies.ts` (xoá), docs hiện hành nhắc tới cookie `is_admin` hoặc chặn `/admin` (nếu `grep` tìm thấy).

Ngoài phạm vi:

- `ADMIN_STATUS_TRANSITIONS`, `canAdminTransition`, `adminTransitionsFrom` trong `src/lib/api/endpoints/order-transitions.ts` (logic trạng thái đơn, cần đánh giá riêng).
- Comment nhắc "storefront/admin/cms" trong `src/shared/ui/SocialMarks.tsx`.
- Các path `/api/v1/admin/*` trong `src/lib/api/generated/openapi.ts` (file sinh tự động).
- Danh sách route `/checkout`, `/account`, `/login`, `/register` và cách đọc `access_token`.
- Hồ sơ quyết định đã `done` của task 17 và 18.

## Acceptance criteria

- [ ] Trước khi sửa, ghi vào `report.md` kết quả của `find src/app -path "*admin*"`, `grep -rn "is_admin\|USER_ROLE_COOKIE\|auth-cookies" src e2e scripts` và `grep -rn "is_admin" ../be-demo/src` (nếu có checkout `be-demo`). Nếu thấy route admin, hoặc code đặt cookie `is_admin`, dừng và hỏi.
- [ ] `grep -rn "admin" src/proxy.ts src/proxy.test.ts` rỗng.
- [ ] `src/shared/constants/auth-cookies.ts` không còn; `grep -rn "auth-cookies\|USER_ROLE_COOKIE" src` rỗng.
- [ ] `src/proxy.test.ts` còn 3 test (offline fallback, chuyển về login khi chưa đăng nhập, cho qua khi có token), assertion không đổi, tất cả xanh.
- [ ] Chạy tay với `pnpm dev`: `/vi/checkout` khi chưa đăng nhập vẫn chuyển về `/vi/login?returnUrl=...`; `/vi/admin/dashboard` trả 404 cả khi chưa đăng nhập và khi đã đăng nhập.
- [ ] Playwright `e2e/checkout.spec.ts` và `e2e/auth.spec.ts` xanh trên chromium.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check`, `pnpm docs:check`, `pnpm build` xanh.

## Ghi chú/rủi ro

- Blocked by task 32, vì hai task cùng sửa file proxy. Làm sau rename thì diff của task này nằm gọn trên `src/proxy.ts`.
- `allow-test-changes: true` chỉ để xoá ba test `/admin` và đổi tên một test; không sửa assertion nào khác.
- Bảng ranh giới của task 18 dự định chuyển `constants/auth-cookies.ts` sang `shared/routing/auth-cookies.ts`. File này bị xoá, nên ghi vào `report.md` để bản đồ tái cấu trúc Storefront (task 16) bỏ dòng đó khi cập nhật inventory.
- Nếu sau này Storefront cần trang chỉ dành cho nhân viên, việc kiểm quyền phải dựa vào Backend, không dựa vào cookie do client giữ.

## Comments
