---
description: Kiểm tra thay đổi hiện tại bằng bộ kiểm tra nhỏ nhất nhưng đầy đủ
allowed-tools: Bash(git diff *), Bash(git status *), Bash(pnpm *)
argument-hint: '[workspace hoặc phạm vi]'
---

Kiểm tra các thay đổi hiện tại trong working tree. Phạm vi tùy chọn được yêu cầu là: `$ARGUMENTS`.

1. Đọc `git status --short` và diff liên quan mà không thay đổi file.
2. Xác định workspace bị ảnh hưởng và các vùng rủi ro.
3. Chạy test liên quan có phạm vi hẹp nhất trước.
4. Chỉ chạy lint, format, typecheck, test, build và E2E ở mức cần thiết dựa trên file đã đổi và hướng dẫn của repository.
5. Không commit, push, mở PR hoặc sửa file không liên quan.
6. Kết thúc bằng bảng ngắn gọn gồm từng kiểm tra, kết quả và lý do cho kiểm tra chưa chạy.
