# Manifest phạm vi — Đổi middleware sang proxy

Snapshot tham chiếu ngày 25/11/2026, dựa trên spec hiện có. Rà lại đường dẫn, consumer và diff khi lập plan, đặc biệt sau các blocker. Danh sách này không phải approved.files và không cấp quyền sửa file; spec là nguồn chuẩn về phạm vi và điều kiện nghiệm thu.

## File và consumer cần đối chiếu

`src/middleware.ts`, `src/middleware.test.ts`, `src/proxy.ts` và `src/proxy.test.ts` (đích dự kiến), `src/app/layout.tsx`, `src/app/[locale]/(shop)/checkout/layout.tsx`, `src/app/[locale]/(shop)/account/layout.tsx`, `src/testing/setup.ts`, `e2e/checkout.spec.ts`, `e2e/auth.spec.ts`, `docs/research/nextjs-naming-conventions.md`, `.claude/agent-guard.json`.

## Kiểm tra và giới hạn

Rà mọi tham chiếu hiện hành; test chỉ đổi tên, import và hàm theo spec; giữ matcher và hành vi.

## Giao nhau và bàn giao

Task 33 phụ thuộc rename; guard cần xử lý theo quyền thực tế. Giữ status, identity và blocker hiện có; ghi phát hiện và kết quả thực tế vào report khi thực hiện.
