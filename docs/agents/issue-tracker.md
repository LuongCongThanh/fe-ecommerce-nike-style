# Tracker: task Markdown cục bộ

Owner: maintainer. Canonical schema/lifecycle của task; GitHub dùng cho PR/review, không dùng Issues. `spec.md` giữ trạng thái; [index](../plan/README.md) chỉ điều hướng.

## Schema và artifact

Đường dẫn `docs/plan/tasks/<NN>-<kebab-name>/spec.md`. Blocker là tên thư mục chính xác. Không đổi identity hay basename để dọn docs.

```yaml
---
status: todo
blocked-by: []
pr:
kind: docs # ui | logic | refactor | docs
approved:
  files: []
  commands: []
retro-turns:
allow-test-changes: false
---
```

Parser là subset frontmatter, không phải YAML tổng quát: flat key:value, blocker inline/dash list và nested approved.files/commands. `approved` là danh sách quyền file/lệnh do người cấp, không phải bool sign-off spec. Bỏ trống/false không cấp quyền. Runner đọc lúc startup và chuyển sang AGENT_APPROVED; không mở khóa secret/stop file. `retro-turns` là số lượt bổ sung người cấp khi retro hết hạn, không phải token/lượt agent đã dùng. `allow-test-changes: true` cho phép refactor sửa test cũ theo gate hiện hành.

Body delivery: `# Spec NN: title`, `Branch:`, Problem Statement, Solution, Acceptance criteria. Tạo mới ở todo, thêm index; giữ status khi chỉ sửa nội dung. Đọc spec rồi plan/report/handoff và diff trước khi tiếp tục. Đọc GLOSSARY root nếu có và tài liệu owner theo chủ đề; dùng từ vựng chuẩn, báo xung đột thay vì tự đổi domain.

Artifact: plan.md trước code (steps/seams/risks), report.md trước implementer trả ok, metric.md cho trước/sau và bảng token, handoff.md cho việc dang dở. Không xóa artifact khi còn resume/PR/blocker hoặc evidence độc nhất. Comment append dưới `## Comments` có ngày, không viết lại lịch sử. Bare `#42` trên GitHub là PR, task dùng folder name.

## Vòng đời delivery

`todo → ready-for-agent → in-progress → review → done`; khi dừng có needs-info/blocked/ready-for-human.

| Status          | Ai đặt | Nghĩa                                |
| --------------- | ------ | ------------------------------------ |
| todo            | Người  | Cần làm rõ/triage                    |
| ready-for-agent | Người  | Spec đủ rõ, blocker đã done          |
| in-progress     | Agent  | Agent hoặc runner đang thực thi      |
| needs-info      | Script | Chờ câu trả lời/quyền/quyết định     |
| blocked         | Script | Dependency hoặc lỗi cần xử lý        |
| ready-for-human | Script | Dừng sau hai lần resume theo runtime |
| review          | Agent  | PR mở vào dev                        |
| done            | Agent  | PR đã merge                          |

Agent nhận task tự đặt in-progress, review và done (sau khi PR merge); chỉ người chuyển todo sang ready-for-agent. Cập nhật index cùng lượt; script hiện chỉ sửa spec và marker nên bảng có thể chậm. Done chỉ đặt khi PR đã merge. Runner chọn ready-for-agent theo thứ tự folder, mọi blocked-by phải done; PR marker có thể coi ready-for-agent thành review để tránh chạy trùng.

## Triage role mapping

| Role của skill  | Status storefront                                                                  |
| --------------- | ---------------------------------------------------------------------------------- |
| needs-triage    | todo                                                                               |
| needs-info      | needs-info                                                                         |
| ready-for-agent | ready-for-agent                                                                    |
| ready-for-human | ready-for-human                                                                    |
| wontfix         | Không có status; ghi quyết định với người, không xóa hồ sơ đang có consumer/resume |

Labels không thay status delivery. Metadata Wayfinder có labels riêng như bên dưới. Khi skill nói publish/fetch ticket, dùng folder/spec cục bộ và quyền trạng thái repo, không gh issue.

## Report và metric

Implementer dùng cấu trúc sau (không tự điền ngày merge chưa xác minh):

```markdown
# Report NN

- **PR:**
- **Ngày merge:**

## Đã làm

## Lệch so với spec và rủi ro còn lại

## Test cũ đã chạm

## Kiểm tra

## Acceptance criteria: chạy tay

## Đề xuất cho môi trường
```

Retro nối mục cuối; implementer không tự viết đề xuất thay retro. Ghi lệnh/kết quả/giới hạn thật, không coi chưa chạy là pass. metric.md có bảng `Chỉ số | Trước | Sau`; `pnpm tokens` điền `## Token (đo thật)` với các cột Loại/Messages/Input/Cache write/Cache read/Output và hàng code/test/docs/other/explore-chat/TOTAL. Script đo token trước commit; không ước lượng như số đo thật.

## Wayfinding operations

Wayfinder là decision workflow riêng, không phải hàng đợi delivery. Map ở một spec kind: docs với Notes/Decisions-so-far/Fog, labels `[wayfinder:map]`. Child có `Part of <map>`, `Type: research|prototype|grilling|task` và labels Wayfinder; blocker vẫn dùng folder name.

Frontier là child todo/ready-for-agent không còn blocker, theo thứ tự map. Phiên Wayfinder được claim in-progress/assignee ở lần ghi đầu; resolve bằng comment câu trả lời, done và pointer trong Decisions-so-far. Done ở đây nghĩa resolution đã ghi, không phải PR merge; ghi authorized execution trong Notes khi có.

Runtime loại các spec có labels Wayfinder (inline hoặc dash list) hoặc body `Type: research|prototype|grilling|task` khỏi delivery selection, kể cả `--task`. Record vẫn được đọc để kiểm tra blocker đã done. Bằng chứng và giới hạn: [task11 report](../plan/tasks/11-runner-workflow/report.md).
