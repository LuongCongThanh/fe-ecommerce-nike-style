# Tài liệu Storefront

Đọc theo nhu cầu; mỗi tài liệu giữ một vai trò để tránh lặp nội dung.

| Cần tìm                                | Tài liệu                             |
| -------------------------------------- | ------------------------------------ |
| Tính năng hiện có, API thật và mock    | [Tổng quan](overview.md)             |
| Cấu trúc code, state và runtime        | [Kiến trúc](architecture.md)         |
| Proxy, contract, SSR reader và cutover | [Tích hợp API](api-integration.md)   |
| Việc chưa làm và quyết định còn mở     | [Roadmap](roadmap.md)                |
| Ticket theo `todo`, `done`, `wontfix`  | [Kế hoạch và ticket](plan/README.md) |
| Test gì, ở tầng nào; traceability      | [Kiểm thử](testing/strategy.md)      |

```text
docs/storefront/
├── README.md
├── overview.md
├── architecture.md
├── api-integration.md
├── roadmap.md
├── testing/
│   ├── strategy.md
│   └── traceability.md
└── plan/
    ├── README.md
    ├── todo/
    ├── done/
    └── wontfix/
```

Thiết kế migration đã triển khai nằm tại [ticket 16 — design](plan/done/16-storefront-refactor-map/design.md); kiến trúc hiện tại đọc tại `architecture.md`.

Quy trình chung: [quickstart](../../README.md), [Git/PR](../../CONTRIBUTING.md), [UI contract](../../design.md), [code conventions](../agents/code-conventions.md), [tracker](../agents/issue-tracker.md), [runner](../agents/runner.md). Quyết định kiến trúc và nghiên cứu giữ tại [ADR](../adr/) và [research](../research/).

Khi thay đổi code, cập nhật đúng tài liệu sở hữu nội dung đó. `spec.md` giữ trạng thái ticket; không dùng roadmap hoặc báo cáo làm bằng chứng một tính năng đã chạy với API thật.
