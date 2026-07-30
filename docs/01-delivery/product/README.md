# Product Layer — Chỉ mục tài liệu

> Nhóm tài liệu này đứng giữa `requirements/` và `architecture/`. Mục tiêu của nó là biến phạm vi đã chốt thành kế hoạch phát hành, tiêu chí thành công, và danh sách quyết định còn mở có thể theo dõi được.

## Vai trò

- `requirements/` trả lời: hệ thống phải làm gì.
- `product/` trả lời: ship gì trước, đo thế nào, còn gì chưa chốt.
- `architecture/` trả lời: build bằng cách nào.

## Chỉ mục

1. [`success-metrics.md`](success-metrics.md) — Success metrics ở cấp sản phẩm và cấp capability.
2. [`open-decisions.md`](open-decisions.md) — Các quyết định còn mở, owner, mốc cần chốt, và fallback tạm thời.
3. [`release-slicing.md`](release-slicing.md) — Cắt lát phát hành theo `Launch-blocking`, `Post-launch`, `Later`.
4. [`../traceability/requirements-traceability-matrix.md`](../traceability/requirements-traceability-matrix.md) — Bản đồ coverage giữa requirement, release, design, test, metric và gap.

## Cách dùng

- Scope đổi: cập nhật `requirements/functional-requirements.md` trước, rồi mới sửa `product/`.
- Cần biết nên ship gì trước: xem [`release-slicing.md`](release-slicing.md).
- Cần biết feature có đáng xem là thành công không: xem [`success-metrics.md`](success-metrics.md).
- Gặp câu hỏi chưa chốt: xem [`open-decisions.md`](open-decisions.md).
- Cần biết scope nào đã nối sang design/test và scope nào còn hở: xem [`../traceability/requirements-traceability-matrix.md`](../traceability/requirements-traceability-matrix.md).
- Cần thứ tự build kỹ thuật: quay lại [`../FE/FE.md`](../FE/FE.md) §10.
