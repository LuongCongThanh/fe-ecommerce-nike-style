# Reference — Không phải quyết định

Ba file trong thư mục này **không phải tài liệu quyết định** cho dự án FE (`E:\my-pj\FE`). Đây là tài liệu tham khảo thêm, được đối chiếu khi thiết kế nhưng không tự động áp dụng — xem Decision #11 trong [`../decision-log.md`](../decision-log.md).

| File | Vai trò | Nguồn gốc |
|---|---|---|
| [`vision-sketch.md`](./vision-sketch.md) | Phác thảo kiến trúc tổng thể ban đầu (stack, module, sitemap, database sơ bộ) | Bản nháp đầu tiên trước khi có Decision Log |
| [`implementation-plan.md`](./implementation-plan.md) | Implementation Plan chi tiết 41 mục / ~43 tuần, cả Front-end lẫn Back-end, kèm domain model tham khảo (Product/Variant/SKU, Order status, Inventory...) | Tài liệu độc lập xuất hiện giữa lúc brainstorming, không thay thế thiết kế đang làm |
| [`solution-architect-workflow.md`](./solution-architect-workflow.md) | Khung quy trình "Solution Architect" tổng quát cho stack khác (NestJS/PostgreSQL/Ant Design/AWS) | Template quy trình, không mô tả dự án này — chỉ mục Giai đoạn 2 (Front-end Architecture) được mượn làm khung sườn |

## Cách dùng đúng

- Khi một tài liệu đã chốt (`glossary.md`, `docs/adr/`, `docs/architecture/frontend/`, `planning/decision-log.md`) mượn ý tưởng từ 3 file trên, chỗ đó phải đánh dấu rõ "tham khảo từ `<tên file>`" hoặc "adopted from reference" — không được coi ý tưởng trong 3 file này là đã chốt chỉ vì nó xuất hiện ở đây.
- Khi 3 file này mâu thuẫn với `decision-log.md`/`glossary.md`/ADR, **tài liệu đã chốt luôn thắng**.
- Domain model tham khảo trong `implementation-plan.md` (Product → Variant → SKU, Order status machine, Inventory on_hand/reserved/available...) đặc biệt hữu ích khi grill domain model thật cho dự án — nhưng phải được xác nhận lại và ghi vào `glossary.md` trước khi coi là mô hình chính thức.
