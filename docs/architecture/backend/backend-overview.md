# Backend Overview

## Mục tiêu

Cung cấp API thật thay thế dần MSW mock hiện có ở `packages/api-sdk`, giữ nguyên contract (request/response/error schema) đã định nghĩa ở `packages/schemas`, để Front-end không phải sửa component khi chuyển từ mock sang thật (nguyên tắc đã chốt — Decision #28, xem `../frontend/api-integration.md`).

## Ràng buộc từ requirements

Xem [`../../requirements/functional-requirements.md`](../../requirements/functional-requirements.md) §3 cho phạm vi chức năng đầy đủ. Điểm quan trọng nhất với backend:

- MVP chỉ **COD** — không tích hợp payment gateway online (Decision #7). Không thiết kế module Payment/Webhook/Refund cho MVP.
- Không cần strong consistency phức tạp cho inventory ở quy mô MVP (solo dev, chưa có traffic thật) — nhưng vẫn nên tách `on_hand`/`reserved`/`available` ngay từ đầu để tránh oversell khi có traffic (tham khảo domain model ở `implementation-plan.md`, chưa chốt, xem `domain-model.md`).
- Không cần SLA production ở giai đoạn build (brainstorm-session §2.3).

## Những gì CHƯA quyết định (open questions)

Không tự ý chốt các mục sau khi viết code thật — cần một quyết định tường minh, ghi vào `planning/decision-log.md`, trước khi implement:

1. **Framework/ngôn ngữ backend** — `implementation-plan.md` đề xuất NestJS, nhưng đây chỉ là tham khảo (Decision #11). Có sẵn `be-nest-ecom` (NestJS) và một dự án Django khác trong workspace — cả hai đều là lựa chọn khả dĩ, chưa chọn (Decision #3, brainstorm-session §3.1).
2. **Database** — chưa chọn PostgreSQL hay khác; `implementation-plan.md` đề xuất PostgreSQL + Prisma/TypeORM chỉ là tham khảo.
3. **Kiến trúc tổng thể** — Modular Monolith vs khác. `implementation-plan.md` khuyến nghị Modular Monolith trước Microservices — hợp lý cho solo dev nhưng chưa được xác nhận là quyết định của dự án này.
4. **Search engine** — Meilisearch được đề xuất tham khảo, chưa chọn.
5. **Hạ tầng deploy** — chưa quyết định (brainstorm-session §2.5).
6. **RBAC chi tiết cho Admin/CMS** — số vai trò thật và ma trận quyền chưa chốt (brainstorm-session §3.3, xem thêm `requirements/functional-requirements.md` §3.2).

## Nguyên tắc khi bắt đầu implement thật

1. Đối chiếu mock API hiện có (`packages/schemas`, `packages/api-sdk`) trước khi viết bất kỳ model/endpoint nào — không thiết kế lại từ đầu.
2. Chọn framework/DB/kiến trúc qua một quyết định tường minh (ghi vào decision-log), không mặc định theo `implementation-plan.md` chỉ vì tài liệu đó chi tiết nhất.
3. Không implement Payment/RBAC chi tiết cho tới khi các open-question ở trên được trả lời.
