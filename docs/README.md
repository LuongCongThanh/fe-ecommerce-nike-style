# Tài liệu storefront

Bắt đầu ở [README](../README.md), sau đó đọc theo câu hỏi. Hiện trạng được đối chiếu source/config ngày 18/11/2026; backlog không phải cam kết đã triển khai.

| Câu hỏi                               | Nguồn chuẩn                            | Khi nào đọc                           |
| ------------------------------------- | -------------------------------------- | ------------------------------------- |
| Sản phẩm hiện làm được gì?            | [Overview](overview.md)                | Onboarding, đánh giá real/mock        |
| Code, state và runtime nằm ở đâu?     | [Architecture](architecture.md)        | Sửa feature, session, locale, PWA, 3D |
| API/proxy/contract hoạt động thế nào? | [API integration](api-integration.md)  | Đổi transport hoặc chuẩn bị cutover   |
| Còn thiếu gì?                         | [Roadmap](roadmap.md)                  | Ưu tiên rebuild hoặc sản phẩm         |
| Làm Git/PR/release thế nào?           | [CONTRIBUTING](../CONTRIBUTING.md)     | Khi đóng góp                          |
| Visual nào được chấp nhận?            | [Design](../design.md)                 | Thiết kế/review UI                    |
| Code convention nào áp dụng?          | [Rule map](agents/code-conventions.md) | Trước khi sửa code                    |
| Task/field/status nghĩa gì?           | [Tracker](agents/issue-tracker.md)     | Viết spec, plan, report               |
| Chạy và tiếp tục tự động ra sao?      | [Runner](agents/runner.md)             | Vận hành `agent-run`                  |
| Chọn UI skill thế nào?                | [UI workflow](agents/ui-workflow.md)   | Thực thi công việc UI                 |

## Kế hoạch và lịch sử

[Task index](plan/README.md) chỉ điều hướng; `spec.md` giữ trạng thái. [Map rebuild](plan/tasks/07-workflow-structure-map/spec.md) điều phối các quyết định, [plan task12](plan/tasks/12-documentation-ownership/plan.md) ghi phạm vi đợt docs này.

Không có archive nguyên bản dài, ADR hoặc thư mục reference lịch sử trong cây hiện tại: Git giữ lịch sử. Visual/UX contract nằm ở `design.md`; runtime và regression checklist nằm ở architecture.

## Ownership

README sở hữu quickstart; overview sở hữu capability; architecture sở hữu runtime/cây hiện tại; API integration sở hữu transport/cutover; roadmap sở hữu việc chưa làm. CONTRIBUTING sở hữu Git, tracker sở hữu schema/lifecycle, runner sở hữu manual vận hành, `.claude/rules/` sở hữu convention và CSS sở hữu giá trị token. Tài liệu khác dẫn tới owner thay vì sao chép recipe.
