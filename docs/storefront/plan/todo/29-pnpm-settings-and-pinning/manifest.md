# Manifest phạm vi — Cấu hình và pin pnpm

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng đường dẫn hiện hành thay vì path cũ. Đây không phải approved.files hay quyền sửa mọi file; spec là nguồn chuẩn về phạm vi và acceptance criteria. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `.npmrc`
- `pnpm-workspace.yaml`
- `package.json` (`dependencies`, `devDependencies`)
- `pnpm-lock.yaml` (chỉ dòng `specifier`, qua `pnpm install`)

## Test cũ được thích ứng trong scope

- Không có. `allow-test-changes: false`; test hiện có chỉ chạy để kiểm, không sửa.

## Giao nhau với task khác

- Task 23: nếu 23 đã merge và gỡ `@sentry/cli`, theo `allowBuilds` hiện hành; nếu chưa, không đụng `allowBuilds`.
- Task 27: nếu 27 merge trước, rebase và pin phần devDependency còn lại; nếu sau, 27 cần thêm dependency với phiên bản chính xác.
- Task 26: cùng sửa `package.json`; `engines` không ảnh hưởng việc pin.
