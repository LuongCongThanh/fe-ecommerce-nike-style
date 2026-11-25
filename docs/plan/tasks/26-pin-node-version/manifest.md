# Manifest phạm vi — Pin Node

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng đường dẫn hiện hành thay vì path cũ. Đây không phải approved.files hay quyền sửa mọi file; spec là nguồn chuẩn về phạm vi và acceptance criteria. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `package.json` (`engines`)
- `README.md` (câu về phiên bản Node)

## Config/docs cần đối chiếu

- `.github/workflows/ci.yml`: sáu `actions/setup-node` ở dòng 25, 39, 54, 70, 84, 105
- `pnpm-lock.yaml`: chỉ kiểm `--frozen-lockfile`, không đổi

## File mới dự kiến (chưa tồn tại)

- `.nvmrc`

## Test cũ được thích ứng trong scope

- Không có. `allow-test-changes: false`; test hiện có chỉ chạy để kiểm, không sửa.

## Lệch với spec cần chốt trước plan

- `.github/workflows/contract-bump.yml` dòng 51 cũng có `node-version: 24`. Acceptance criteria `grep -n "node-version" .github/workflows/*.yml` chỉ đạt khi sửa cả file này, nhưng phạm vi và `approved.files` gợi ý chỉ nêu `ci.yml`. Người cần chọn: thêm `contract-bump.yml` vào phạm vi, hoặc thu hẹp criteria về `ci.yml`.

## Giao nhau với task khác

- Task 22: cùng sửa `.github/workflows/ci.yml` ở dòng khác; task merge sau rebase.
- Task 23, 27, 29: cùng sửa `package.json`; 26 chỉ thêm `engines`.
