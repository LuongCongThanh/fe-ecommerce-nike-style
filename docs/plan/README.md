# Kế hoạch và task

Task của storefront là file Markdown cục bộ (không dùng GitHub Issues), cùng định dạng với `be-demo`. Chỉ mục nằm ở bảng dưới; kế hoạch tổng nằm ở các file `*-plan.md` cùng thư mục. Hệ thống agent chạy task: `AGENT-SYSTEM-PLAN.md`. Hộp thư khi script cần người: `AGENT-INBOX.md`.

## Cấu trúc

```text
docs/plan/
├── README.md        <- file này: định dạng + bảng task
├── AGENT-INBOX.md   <- script ghi khi cần người
└── tasks/<NN>-<tên-kebab-tiếng-Anh>/
    ├── spec.md      <- trước khi code: mục tiêu, phạm vi, AC; frontmatter
    ├── plan.md      <- trước khi code: các bước, branch, rủi ro (planner viết)
    ├── report.md    <- implementer viết trước khi trả ok; retro nối thêm
    └── metric.md    <- số đo trước -> sau; script điền bảng token
```

`NN` là thứ tự làm việc. Không phải task nào cũng có `plan.md` hay `metric.md`. Cập nhật bảng task cùng lúc với `status`.

## spec.md

```yaml
---
status: todo # xem vòng đời bên dưới
blocked-by: [] # tên thư mục task, ví dụ [03-product-card]
pr: # số PR khi đã mở, ví dụ #86
kind: ui # ui | logic | refactor | docs
approved: false # người đã duyệt spec/plan
retro-turns: # số lượt retro đã dùng, script điền
---
```

Thân bài: `# Spec <NN>: <tiêu đề>`, dòng `Branch: \`<type>/<NN>-<slug>\``, `## Problem Statement`, `## Solution`, `## Acceptance criteria` (danh sách gạch đầu dòng).

## Vòng đời trạng thái

```text
todo -> ready-for-agent -> in-progress -> review -> done
                              |  ^
                              v  |
                  needs-info / blocked
                              |
                              v
                       ready-for-human -> (người tự làm) -> done
```

| Trạng thái        | Ý nghĩa                                                 | Ai đặt |
| ----------------- | ------------------------------------------------------- | ------ |
| `todo`            | Chưa đủ rõ để giao                                      | Người  |
| `ready-for-agent` | Spec đủ rõ, mọi `blocked-by` đã `done`; agent được nhận | Người  |
| `in-progress`     | `agent-run` đang chạy task                              | Script |
| `needs-info`      | Script dừng vì cần câu trả lời của người                | Script |
| `blocked`         | Chờ task khác hoặc quyết định bên ngoài                 | Script |
| `ready-for-human` | Đã chạy tiếp 2 lần vẫn dừng; người tự làm               | Script |
| `review`          | PR đã mở vào `dev`, chờ người review                    | Script |
| `done`            | PR đã merge                                             | Người  |

Agent không tự sửa `status`. Agent chỉ nhận task `ready-for-agent` mà mọi `blocked-by` đã `done`.

## report.md và metric.md

`report.md` (implementer viết ngay trước khi trả `ok`; retro nối thêm mục cuối):

```markdown
# Report <NN>

- **PR:** #<số>
- **Ngày merge:**

## Đã làm

## Lệch so với spec và rủi ro còn lại

## Test cũ đã chạm

## Kiểm tra

## Acceptance criteria: chạy tay

## Đề xuất cho môi trường <- retro thêm: skill/agent/quy tắc cần sửa
```

`metric.md`: bảng `| Chỉ số | Trước | Sau |` rồi mục `## Token (đo thật)` do script điền bằng `pnpm tokens` (bảng `| Loại | Messages | Input | Cache write | Cache read | Output |` với các hàng code, test, docs, other, explore/chat, TOTAL). Script `tokens` và `agent-run` chưa có ở bước này; chúng được thêm ở các bước sau của `AGENT-SYSTEM-PLAN.md`.

## Bảng task

| #   | Task | Status | Blocked by | PR  |
| --- | ---- | ------ | ---------- | --- |
