---
status: done
blocked-by: [18-storefront-module-boundaries, 19-storefront-runtime-boundaries, 20-storefront-verification-policy]
assignee: Luong Cong Thanh
kind: docs
labels: [wayfinder:grilling]
---

Part of 16-storefront-refactor-map

# Chia các đợt triển khai và blocker thế nào để mỗi đợt có thể build và kiểm tra độc lập?

Type: grilling

## Question

Từ mapping và các boundary đã chốt, quyết định thứ tự chuyển rule/config, provider/layout, catalog thí điểm, SDK và các module còn lại. So sánh rename nguyên khối với compatibility path có thời hạn; xác định consumer phải đổi cùng lượt và điều kiện xóa bridge. Không giữ hai source cùng semantics thiếu owner.

Chốt phạm vi và điểm dừng của mỗi delivery slice, prerequisite, acceptance criteria, kiểm tra và rollback; đảm bảo generator, import graph và executable rule khớp ở từng đợt. Tách SSR runtime khỏi mechanical rename. Giữ task/delivery đang có, không tự đổi status hoặc giả định chúng đã merge.

Resolution cần backlog đủ chi tiết để viết spec.md theo tracker cho từng đợt: file/module scope, dependency, behavior invariants, tests được phép sửa, gates và docs owner. Những delivery spec được tạo sau quyết định bắt đầu ở todo; không đánh dấu ready-for-agent hoặc chạy runner thay người dùng.

## Context

Map: [Lập đường chuyển Storefront sang module nghiệp vụ và tên dễ hiểu](../16-storefront-refactor-map/spec.md).

Đọc resolution của: [Module nào được dùng phần công khai nào của module khác?](../18-storefront-module-boundaries/spec.md), [Di chuyển provider và SDK thế nào để giữ đúng session, cache và server/client?](../19-storefront-runtime-boundaries/spec.md), [Cần giữ hoặc bổ sung bằng chứng nào để xác nhận refactor không đổi hành vi?](../20-storefront-verification-policy/spec.md).

## Comments

### 24/11/2026 — Claim và lập backlog thảo luận

Đã claim frontier sau khi inventory, boundary, runtime và verification resolve. [Backlog chuyển cấu trúc Storefront — bản thảo để thảo luận](delivery.md) ghi nguyên tắc handoff và khung đợt; đang đối chiếu coupling để chọn scope buildable. Chưa resolve, chưa tạo delivery specs hoặc thay status task hiện có.

### 24/11/2026 — Đồng ý chiến lược chuyển consumer và catalog pilot

Người dùng trả lời đồng ý sau yêu cầu tiếp tục: chốt owner+consumer chuyển cùng slice, không bridge mặc định; catalog 50 file là pilot nguyên owner, gồm wishlist composition nhưng tách SDK/SSR. Delivery.md cụ thể hóa backlog để trao đổi tiếp về thứ tự migration và bốn đợt SSR; chưa resolve hoặc tạo delivery specs.

### 25/11/2026 — Resolution

Người dùng đồng ý thứ tự migration và chia bốn đợt SSR, sau khi đã chốt owner+consumer chuyển cùng slice và catalog pilot nguyên owner. Backlog canonical: [Backlog chuyển cấu trúc Storefront — quyết định đã chốt](delivery.md).

- Mười một đợt chuẩn bị/migration: nền kiểm chứng/baseline → rule/convention → shared → providers/layouts → catalog pilot → integration Backend → auth/account → cart/wishlist → orders/checkout → home/thin routes → khóa migration.
- Bốn đợt SSR sau migration: public reader+products, category/search, PDP+related, home API. Evidence production/rollback nằm trong từng slice.
- Mỗi đợt có prerequisite, owner/consumer scope, điểm dừng, quyền sửa test, gates, docs và rollback; SDK gồm generator/CI/lint/test strings đồng lượt. Không bridge mặc định; ngoại lệ cần owner và đợt xóa cụ thể.
- Các task/PR đang có phải reconcile trước owner slice, giữ identity/status/artifact. Policy/stop files cần người cùng sửa trong phiên tương tác, không giao runner tự mở khóa.
- Bàn giao đủ để viết delivery specs todo và wire blocked-by bằng identity thật sau khi tạo; chưa tạo specs/ready status hay chạy runner trong phiên resolution.

Kiểm tra phiên này: `corepack pnpm docs:check`, `git diff --check` và đối chiếu trạng thái toàn bộ child Wayfinder. Không chạy suite/build/E2E hoặc thay source/config ứng dụng. Done nghĩa quyết định đã được ghi, không phải các đợt đã triển khai/merge.
