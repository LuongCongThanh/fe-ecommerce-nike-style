# Manifest phạm vi — Nguồn của skill

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng đường dẫn hiện hành thay vì path cũ. Đây không phải approved.files hay quyền sửa mọi file; spec là nguồn chuẩn về phạm vi và acceptance criteria. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `skills-lock.json`

## Config/docs cần đối chiếu

- `.agents/skills/`: nội dung để tính hash, không sửa
- `.claude/skills/`, `.github/skills/`: mirror, không sửa

## Test cũ được thích ứng trong scope

- Không có. `allow-test-changes: false`; test hiện có chỉ chạy để kiểm, không sửa.

## Giao nhau với task khác

- Không có task 22–33 nào sửa `skills-lock.json`. Task 30 có thể thêm `.agents/` vào `.prettierignore`, không đổi nội dung skill.
