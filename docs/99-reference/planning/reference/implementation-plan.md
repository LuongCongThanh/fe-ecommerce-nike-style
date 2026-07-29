# Implementation Plan — Chỉ mục sau khi tách

> File gốc đã được tách để giảm độ dài và tách rõ phần nào đáng đọc theo từng mục đích. Đây vẫn là tài liệu tham khảo, không phải nguồn sự thật kiến trúc hiện hành.

## Đọc file nào

- Nếu bạn cần bức tranh chung, drift notes, và định hướng cấp cao: xem [`./implementation-plan-overview.md`](implementation-plan-overview.md).
- Nếu bạn đang tham khảo thứ tự build và checklist FE dài hạn: xem [`./implementation-plan-frontend-reference.md`](implementation-plan-frontend-reference.md).
- Nếu bạn đang tham khảo BE, integration, release readiness, hoặc backlog dài hạn: xem [`./implementation-plan-backend-release-reference.md`](implementation-plan-backend-release-reference.md).

## Khi nào nên bỏ qua hoàn toàn

- Bạn chỉ cần scope MVP hiện hành: quay lại [`../../requirements/functional-requirements.md`](../../../00-core/requirements/functional-requirements.md).
- Bạn chỉ cần thứ tự build kỹ thuật hiện tại: quay lại [`../../architecture/frontend/11-roadmap.md`](../../../01-delivery/architecture/frontend/11-roadmap.md) và [`../../architecture/backend/roadmap.md`](../../../01-delivery/architecture/backend/roadmap.md).
- Bạn chỉ cần release framing hiện tại: quay lại [`../../product/release-slicing.md`](../../../01-delivery/product/release-slicing.md).

## Thứ tự ưu tiên khi có mâu thuẫn

Khi nội dung ở các file tách ra dưới đây không khớp với tài liệu hiện hành, ưu tiên:

1. [`../../requirements/functional-requirements.md`](../../../00-core/requirements/functional-requirements.md)
2. [`../../glossary.md`](../../../00-core/glossary.md)
3. [`../../adr/`](../../../00-core/adr/)
4. [`../decision-log.md`](../../../00-core/decision-log.md)
5. `docs/architecture/*`

## Ba file sau khi tách

| File | Vai trò |
|---|---|
| [`implementation-plan-overview.md`](implementation-plan-overview.md) | Tổng quan, drift notes, nguyên tắc triển khai, phạm vi tham khảo, kiến trúc lớn |
| [`implementation-plan-frontend-reference.md`](implementation-plan-frontend-reference.md) | Phase tham khảo cho Front-end |
| [`implementation-plan-backend-release-reference.md`](implementation-plan-backend-release-reference.md) | Phase tham khảo cho Back-end, integration, release, backlog |
