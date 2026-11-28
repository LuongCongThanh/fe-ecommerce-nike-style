# Tài liệu Storefront

Cấu trúc thư mục theo [chuẩn tài liệu chung của workspace](agents/docs-structure.md). Mỗi tài liệu giữ một vai trò; tài liệu dẫn về owner thay vì chép lại nội dung.

| Thư mục                                         | Nội dung                                                                                                             |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [business/](business/overview.md)               | Tính năng hiện có, API thật và mock                                                                                  |
| [architecture/](architecture/README.md)         | Cấu trúc code, state, runtime; [tích hợp API](architecture/api-integration.md): proxy, contract, SSR reader, cutover |
| [conventions/](conventions/code-conventions.md) | Bản đồ convention và checklist trước/sau khi tạo file                                                                |
| [testing/](testing/strategy.md)                 | Test gì, ở tầng nào; [traceability](testing/traceability.md)                                                         |
| [plan/](plan/README.md)                         | Ticket theo `todo`, `done`, `wontfix`; [roadmap](plan/roadmap.md) giữ việc chưa làm                                  |
| [adr/](adr/)                                    | Quyết định kiến trúc và lý do lựa chọn                                                                               |
| [research/](research/)                          | Nghiên cứu, không tự trở thành yêu cầu triển khai                                                                    |
| [agents/](agents/)                              | Tracker, runner, UI workflow; `workspace.md` và `docs-structure.md` được sync từ workspace                           |

Bắt đầu với [quickstart](../README.md). [CONTRIBUTING](../CONTRIBUTING.md) sở hữu Git/PR, [DESIGN](../DESIGN.md) sở hữu visual/interaction contract. Thiết kế migration đã triển khai nằm tại [ticket 16 — design](plan/tasks/done/16-storefront-refactor-map/design.md).

Khi thay đổi code, cập nhật đúng tài liệu sở hữu nội dung đó. `spec.md` giữ trạng thái ticket; không dùng roadmap hoặc báo cáo làm bằng chứng một tính năng đã chạy với API thật.

## Khác biệt của repo này

- `business/` chỉ có `overview.md` (capability hiện có). Luật nghiệp vụ đầy đủ thuộc Backend.
- Ticket có thêm `manifest.md` (danh sách file trong phạm vi) và có thể có `handoff.md` do `agent-run` để lại.
- `pnpm docs:check` kiểm tra link, anchor, frontmatter ticket và các đường dẫn đã bỏ (`scripts/check-docs.ts`). Thư mục ticket do `scripts/agent-run/tasks.ts` quy định.
- Không có `archive/`: tài liệu hết hiệu lực được xóa và đưa đường dẫn vào danh sách đã bỏ của `docs:check`.
