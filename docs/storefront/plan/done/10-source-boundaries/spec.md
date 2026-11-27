---
status: done
blocked-by: []
kind: docs
labels: [wayfinder:task]
assignee: maintainer-session
---

Part of 07-workflow-structure-map

# Ranh giới feature và các lớp service có còn cần thiết?

Type: task

## Question

Kiểm kê consumer và test trước khi quyết định bỏ các object chỉ alias endpoint trong account/addresses/services/address.ts, account/profile/services/profile.ts và checkout/services/checkout.ts. orderActions còn có getOrderOrNull mang hành vi fallback, không xóa đồng loạt. Xác định shared/types đang giữ domain type nào và seam nào cần công khai giữa feature. Giữ API và hành vi browser.

## Comments

### 18/11/2026 — Resolution

Đã kiểm kê consumer và đơn giản hóa alias endpoint, chuyển schema/UI/composition về nơi sở hữu; giữ service auth và fallback order có hành vi thực sự. Kiểm tra bản cuối đạt: lint, format, typecheck, 1044 test và production build. [Bằng chứng, seam được giữ và giới hạn](report.md). Phát hiện provider mount lặp được chuyển thành ticket riêng, không thay đổi vòng đời trong đợt di chuyển.
