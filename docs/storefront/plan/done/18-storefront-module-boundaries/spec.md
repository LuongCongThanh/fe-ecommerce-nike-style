---
status: done
blocked-by: [17-storefront-migration-inventory]
assignee: Luong Cong Thanh
kind: docs
labels: [wayfinder:grilling]
---

Part of 16-storefront-refactor-map

# Module nào được dùng phần công khai nào của module khác?

Type: grilling

## Question

Dựa trên inventory, chốt danh sách dependency có hướng và các public entry cụ thể cho catalog/home, layouts/auth/cart/wishlist, account/orders và checkout/cart/orders. Chọn nơi phối hợp nhiều module, tránh private import, vòng phụ thuộc và barrel index.ts.

Thiết kế đã cho phép public API có kiểm soát; ticket này chốt từng boundary thực tế và cách lint enforce trong cả giai đoạn chuyển lẫn đích cuối, không mở lại lựa chọn kiến trúc. Cần quyết định owner cho helper/domain type dùng lại, và khi nào service phải nhận interface nhỏ thay vì import module khác. Phân biệt exported symbol và public entry được phép.

Resolution cần ma trận consumer → entry được phép → trách nhiệm, dependency bị cấm và ngoại lệ có lý do. Cùng người dùng duyệt trade-off; không tự quyết thay người.

## Context

Map: [Lập đường chuyển Storefront sang module nghiệp vụ và tên dễ hiểu](../16-storefront-refactor-map/spec.md).

Đọc resolution của: [Mỗi file hiện tại sẽ chuyển về đâu và còn consumer nào cần giữ?](../17-storefront-migration-inventory/spec.md).

## Comments

### 24/11/2026 — Claim và đề xuất để thảo luận

Đã claim theo thứ tự frontier, đọc inventory và đối chiếu source. [Public boundary Storefront — bản đề xuất đang thảo luận](boundaries.md) ghi consumer/entry ứng viên và vòng dependency catalog/wishlist. Chưa resolve; cần trao đổi trực tiếp để chốt trade-off theo loại grilling.

### 24/11/2026 — Người dùng đồng ý hai hướng đầu

Người dùng trả lời “đồng ý” cho cả hai đề xuất: bỏ vòng catalog–wishlist qua composition; dùng public API nhỏ đã có và giữ orchestration ở consumer/layouts. Ghi lại trong boundaries.md; chưa đóng ticket vì owner helper/type, allowlist chi tiết và enforcement còn đang thảo luận.

### 24/11/2026 — Resolution

Người dùng tiếp tục trả lời “đồng ý” cho owner helper/type và enforcement sau khi đã đồng ý composition/public API ở vòng trước. Bốn nhóm quyết định được ghi tại [Public boundary Storefront — quyết định đã chốt](boundaries.md), gồm ma trận public entry, consumer production cụ thể, owner helper/type, dependency bị cấm, contract wishlist action slot và ngoại lệ test/migration.

- Catalog không phụ thuộc wishlist: chuyển phần nối action qua client composition; wishlist giữ quyền dùng quy tắc sản phẩm công khai của catalog và hook cart. Không đổi visual, ID hoặc mở flow mua hàng đang disabled.
- Checkout dùng public useCart (kể cả clearCart có sẵn), orders giữ cache key; login merge thuộc layouts. Không thêm facade/interface cho mọi endpoint.
- Helper/type về owner đã duyệt; file chưa có consumer production giữ nguyên có danh sách, không tự xóa. Contract User/ApiError không nhân đôi.
- Allowlist theo consumer/file/symbol, chặn private import và module cycle; test chỉ được chạm private của owner, ngoại lệ chính xác; path cũ có slice chịu trách nhiệm xóa.
- Runtime/session/SSR, ma trận test và chia delivery tiếp tục thuộc các ticket đang mở tương ứng. Không mở lại ADR hoặc đổi source/config trong phiên này.

Kiểm tra tài liệu: `corepack pnpm docs:check` và `git diff --check`; không chạy test/build vì chỉ ghi quyết định. Done là đã resolve Wayfinder, không phải migration hoặc PR đã merge.
