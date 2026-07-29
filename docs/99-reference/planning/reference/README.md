# Reference — Không phải quyết định

Các file trong thư mục này không phải nguồn sự thật cho dự án FE (`E:\my-pj\FE`). Chúng chỉ giữ góc nhìn tham khảo, ý tưởng mở rộng, hoặc khung làm việc tổng quát đã được đối chiếu lại khi viết tài liệu chính thức.

Nếu cần chỗ chốt cuối cùng, quay lại `requirements/`, `glossary.md`, `adr/`, `planning/decision-log.md`, và `architecture/`. Xem thêm Decision #11 trong [`../decision-log.md`](../../../00-core/decision-log.md).

| File | Vai trò | Nguồn gốc |
|---|---|---|
| [`vision-sketch.md`](vision-sketch.md) | Phác thảo kiến trúc tổng thể ban đầu (stack, module, sitemap, database sơ bộ) | Bản nháp đầu tiên trước khi có Decision Log |
| [`implementation-plan.md`](implementation-plan.md) | Chỉ mục sau khi tách Implementation Plan thành 3 file nhỏ hơn | Tài liệu độc lập xuất hiện giữa lúc brainstorming, không thay thế thiết kế đang làm |
| [`implementation-plan-overview.md`](implementation-plan-overview.md) | Tổng quan, drift notes, nguyên tắc, phạm vi tham khảo, kiến trúc lớn | Tách ra từ file cũ để dễ đọc hơn |
| [`implementation-plan-frontend-reference.md`](implementation-plan-frontend-reference.md) | Phase tham khảo cho Front-end | Tách ra từ file cũ để dễ đọc hơn |
| [`implementation-plan-backend-release-reference.md`](implementation-plan-backend-release-reference.md) | Phase tham khảo cho Back-end, integration, release | Tách ra từ file cũ để dễ đọc hơn |
| [`solution-architect-workflow.md`](solution-architect-workflow.md) | Khung quy trình "Solution Architect" tổng quát cho stack khác (NestJS/PostgreSQL/Ant Design/AWS) | Template quy trình, không mô tả dự án này — chỉ mục Giai đoạn 2 (Front-end Architecture) được mượn làm khung sườn |

## Cách dùng đúng

- Đừng đọc liền mạch toàn bộ thư mục này ở vòng đầu. Chỉ mở khi đang cần thêm góc nhìn cho một chủ đề cụ thể.
- Khi một tài liệu đã chốt (`glossary.md`, `docs/adr/`, `docs/architecture/frontend/`, `planning/decision-log.md`) mượn ý tưởng từ các file ở đây, chỗ đó phải đánh dấu rõ "tham khảo từ `<tên file>`" hoặc "adopted from reference" — không được coi ý tưởng trong thư mục này là đã chốt chỉ vì nó xuất hiện ở đây.
- Khi các file ở đây mâu thuẫn với `decision-log.md`/`glossary.md`/ADR, **tài liệu đã chốt luôn thắng**.
- Domain model tham khảo trong `implementation-plan.md` (Product → Variant → SKU, Order status machine, Inventory on_hand/reserved/available...) đặc biệt hữu ích khi grill domain model thật cho dự án — nhưng phải được xác nhận lại và ghi vào `glossary.md` trước khi coi là mô hình chính thức.

## Khi nào nên bỏ qua

- Bạn chỉ cần bắt đầu implement FE theo tài liệu hiện hành.
- Bạn chỉ cần biết scope MVP, release slicing, roadmap, hoặc test coverage.
- Bạn đang cố xác định "cái nào là quyết định cuối cùng".
