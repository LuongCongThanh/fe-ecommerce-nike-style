# Backend — Chỉ mục tài liệu

> Chưa có backend thật, chưa có code (Decision #3 — mock-first, framework backend cố tình chưa chọn). Các tài liệu trong thư mục này là **khung sườn thiết kế**, viết ở mức vừa đủ để khớp với contract mà `docs/architecture/frontend/api-integration.md` và `glossary.md` đang giả định phía Front-end — không phải đặc tả triển khai chi tiết.

## Khi nào cần đọc thư mục này

- Khi chuẩn bị bắt đầu triển khai backend thật, sau khi Front-end ổn định (xem `docs/architecture/frontend/roadmap.md`, Phase 8 — Hardening, và `planning/brainstorm-session.md` §3.1).
- Khi cần đối chiếu domain model/API contract mock hiện có với thiết kế backend trước khi viết code thật.

## Cây thư mục

```
backend/
├── README.md              # file này
├── backend-overview.md    # mục tiêu, ràng buộc, những gì CHƯA quyết định
├── domain-model.md         # domain model kế thừa từ glossary.md + phần còn thiếu
├── api-contracts.md        # đối chiếu contract mock (packages/schemas) với API thật
└── roadmap.md               # kế hoạch triển khai theo phase, không theo tuần
```

## Quan hệ với các tài liệu khác

- Phải tuân theo [`../../requirements/functional-requirements.md`](../../requirements/functional-requirements.md) — nguồn sự thật cao nhất.
- Domain model chính thức là [`../../glossary.md`](../../glossary.md); tài liệu trong thư mục này chỉ bổ sung phần chưa có (Cart, Order, Customer, Inventory, Promotion), và phải được chuyển vào `glossary.md` khi chốt chính thức, không tồn tại song song.
- `planning/reference/implementation-plan.md` chỉ dùng làm tham khảo domain model/API nháp (Decision #11) — không coi là quyết định.
