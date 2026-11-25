# Manifest phạm vi — Rule và convention hỗ trợ migration có giới hạn

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng owner đích trong mapping. Đây không phải approved.files hay quyền sửa mọi file. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- Không chuyển source feature; phạm vi là config/gate/audit được nêu trong spec.

## Consumer trực tiếp hiện tại ngoài owner

- Không thấy consumer ngoài owner bằng quét literal alias; vẫn phải rà config/dynamic import ở plan.

## Config/docs cần đối chiếu

- `AGENTS.md`
- `docs/agents/code-conventions.md`
- `eslint.config.mjs`
- `eslint.base.mjs`
- `vitest.config.ts`
- `docs/architecture.md` và tài liệu owner tương ứng ở spec; chỉ cập nhật hiện trạng đã triển khai.

## File mới dự kiến (chưa tồn tại)

- `scripts/check-module-boundaries.ts`
- `scripts/check-module-boundaries.test.ts`

## Test cũ được thích ứng trong scope

- Chưa có test cũ ở owner này trong snapshot; regression mới chỉ theo risk trong spec.

Các test mới đi cạnh owner hoặc e2e/production theo policy. Với consumer test khác chưa xuất hiện ở scan, bổ sung manifest/file scope trước triển khai; không thay assertion để né regression. Không công khai private stores để cứu setup test.
