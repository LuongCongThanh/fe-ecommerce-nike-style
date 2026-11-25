---
status: todo
blocked-by: []
pr:
kind: docs
approved:
  files: []
  commands: []
retro-turns:
allow-test-changes: false
---

# Spec 31: Ghi commit nguồn cho các skill bên ngoài trong `skills-lock.json`

Branch: `chore/31-skills-lock-integrity`

## Problem Statement

`skills-lock.json` (do skills CLI sinh) có 13 skill. PR #109 đã điền lại `computedHash` cho mọi entry, nên nội dung `.agents/skills/` kiểm được. Nhưng 9 entry vẫn không có `commit`: tám skill từ `emilkowalski/skills` và `hallmark` từ `nutlope/hallmark`. Với các entry này, lock không chỉ ra phiên bản nguồn. Cài lại hoặc cập nhật sẽ kéo bản mới nhất, và chỉ phát hiện được khác biệt sau khi hash không khớp.

## Solution

Mỗi skill bên ngoài có `commit` trỏ tới đúng commit nguồn sinh ra nội dung đang có trong `.agents/skills/`, và `computedHash` vẫn khớp. Nếu không tìm được commit nào cho ra đúng hash đó, `report.md` nêu lý do, và entry được ghi là chưa pin.

## Phạm vi

Trong phạm vi: `skills-lock.json`.

Ngoài phạm vi: đổi nội dung `.agents/skills/` hoặc các mirror; thêm hoặc bỏ skill; skill do repo tự viết; `shared/skills.txt` ở workspace.

## Acceptance criteria

- [ ] `report.md` ghi lệnh skills CLI hoặc cách tìm commit đã dùng, kèm phiên bản CLI.
- [ ] `jq -r '.skills|to_entries[] | select(.value.commit == null) | .key' skills-lock.json` rỗng, hoặc mọi entry còn lại có lý do trong `report.md`.
- [ ] Với mỗi commit được ghi: tải nguồn tại commit đó, tính hash theo thuật toán version 2 của lock, kết quả trùng `computedHash` hiện có. Ghi cách tính vào `report.md`.
- [ ] `git diff --stat` chỉ có `skills-lock.json`; `computedHash` không đổi.
- [ ] `pnpm docs:check` xanh.

## Ghi chú/rủi ro

- `skills-lock.json` thuộc `denyPaths`. Task này nên làm trong phiên tương tác.
- Cần mạng để đọc lịch sử commit của repo nguồn trên GitHub.
- Giá trị thấp: hash đã bảo vệ toàn vẹn nội dung. Có thể đóng task nếu maintainer chấp nhận skill bên ngoài không pin commit.

## Comments

Tham khảo [manifest phạm vi](manifest.md); rà lại snapshot khi lập plan. Manifest không cấp quyền sửa file.
