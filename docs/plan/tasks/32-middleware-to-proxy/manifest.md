# Manifest phạm vi — Đổi middleware sang proxy

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng đường dẫn hiện hành thay vì path cũ. Đây không phải approved.files hay quyền sửa mọi file; spec là nguồn chuẩn về phạm vi và acceptance criteria. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `src/middleware.ts` → `src/proxy.ts`

## Consumer trực tiếp hiện tại ngoài owner

- `src/app/layout.tsx` (comment dòng 43)
- `src/app/[locale]/(shop)/checkout/layout.tsx` (comment dòng 5)
- `src/app/[locale]/(shop)/account/layout.tsx` (comment)
- `src/testing/setup.ts` (comment dòng 9)
- `e2e/checkout.spec.ts` (comment dòng 20)

## Config/docs cần đối chiếu

- `docs/research/nextjs-naming-conventions.md` dòng 112
- `.claude/agent-guard.json` dòng 51 (`askPaths`)

## File mới dự kiến (chưa tồn tại)

- `src/proxy.ts`
- `src/proxy.test.ts`

## Test cũ được thích ứng trong scope

- `src/middleware.test.ts` → `src/proxy.test.ts`: chỉ đổi tên file, đường dẫn import và tên hàm; giữ 6 test và assertion
- Chạy kiểm: `e2e/checkout.spec.ts`, `e2e/auth.spec.ts`

## Lệch với spec cần chốt trước plan

- `.claude/hooks/lib/guard.test.ts` dòng 98 dùng `src/middleware.ts` làm ví dụ `ask-path`. Đổi `askPaths` sang `src/proxy.ts` làm test này đỏ, và criteria `grep ... .claude` cũng bắt dòng này. Spec chưa nêu file này, còn `allow-test-changes` chỉ cho test proxy. Người cần cấp quyền sửa test guard hoặc chốt cách xử lý.

## Giao nhau với task khác

- Task 33: blocked by 32, sửa tiếp `src/proxy.ts` và `src/proxy.test.ts`.
- Task 28: ghi `src/middleware.ts` là ngoài phạm vi; không xung đột.
