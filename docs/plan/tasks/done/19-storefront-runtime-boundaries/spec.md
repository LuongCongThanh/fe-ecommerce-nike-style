---
status: done
blocked-by: [17-storefront-migration-inventory]
assignee: Luong Cong Thanh
kind: docs
labels: [wayfinder:grilling]
---

Part of 16-storefront-refactor-map

# Di chuyển provider và SDK thế nào để giữ đúng session, cache và server/client?

Type: grilling

## Question

Chốt ranh giới runtime khi chuyển app/_composition → providers/layouts và lib/api → integrations/backend. Giữ root/locale mount, vòng đời auth adapter, bootstrap/cleanup, query client và mock/PWA semantics đang có.

Xác định module browser-only, server-safe và nơi phải truyền dependency theo request. Chốt mapping client/endpoints/schemas/generated/mocks/models và helper tích hợp đang nằm dưới shared; output path generator, instrumentation và mọi consumer phải có owner. Không dùng singleton browser auth để lưu session của SSR.

Chọn phần thuộc migration giữ behavior và phần SSR catalog cần task runtime riêng; không đổi cookie/auth contract, query keys/retry hoặc backend endpoint ngầm theo rename. Resolution ghi invariant, boundary protection, điểm phải kiểm bằng browser/build và rollback seams. Dựa source thực tế, không khẳng định SSR hoặc cookie auth đã hoạt động.

## Context

Map: [Lập đường chuyển Storefront sang module nghiệp vụ và tên dễ hiểu](../16-storefront-refactor-map/spec.md).

Đọc resolution của: [Mỗi file hiện tại sẽ chuyển về đâu và còn consumer nào cần giữ?](../17-storefront-migration-inventory/spec.md).

## Comments

### 24/11/2026 — Claim và đối chiếu baseline

Đã claim ticket frontier sau khi public boundary được chốt. [Runtime Storefront — bản thảo để thảo luận](runtime.md) ghi baseline provider, auth memory, SDK/MSW và hai câu hỏi đầu về migration versus SSR design scope. Chưa resolve; chờ trao đổi theo loại grilling.

### 24/11/2026 — Đồng ý scope và nguyên tắc migration

Người dùng đồng ý giữ runtime khi đổi cấu trúc và bao gồm thiết kế SSR public catalog trong map, triển khai bằng delivery riêng. Cập nhật runtime.md với hai quyết định này; transport/cache/hydration đang là đề xuất vòng tiếp theo, chưa resolve.

### 24/11/2026 — Đồng ý transport/cache/hydration

Người dùng đồng ý reader catalog public phía server tách browser session, không forward cookie/token, và QueryClient theo request với hydration dùng key/shape hiện tại; chưa thêm persistent server cache. Ghi runtime.md, tiếp tục chốt phạm vi route và lỗi/fallback trước resolution.

### 24/11/2026 — Resolution

Người dùng đồng ý phạm vi SSR và cách xử lý lỗi/fallback ở vòng cuối, sau khi đã chốt nguyên tắc migration, transport isolation và cache/hydration. Chi tiết tại [Runtime Storefront — quyết định đã chốt](runtime.md).

- Migration giữ root/locale mount, QueryClient per mount, register-before-bootstrap và cleanup adapter, auth memory, retry/query key, mock/PWA semantics; không ghép auth/cookie cutover với rename.
- SSR public catalog là thiết kế trong map, implementation thành delivery riêng. Reader server-only gọi Backend trực tiếp, không forward cookie/token hoặc dùng browser auth singleton. Chia sẻ mapper/schema/type thuần; QueryClient riêng theo request, hydrate đúng key/shape vào provider browser hiện có; chưa thêm persistent server data cache/ISR.
- Phạm vi gồm products, category, search, PDP và hai phần API trên home cho vi/en, chia đợt bắt đầu products. Không mở PDP purchase hoặc biến fixture thành API.
- Server public read timeout 5 giây/request và không tự retry; chỉ hydrate query thành công, lỗi để browser tiếp tục luồng tải/error/retry hiện có. Giữ 404/null và category-missing semantics, không tự thêm redirect/HTTP status mới.
- Mapping SDK/generated/env/adapters/testing/mocks, instrumentation, generator/CI và provider được ghi cùng boundary protection, browser/build evidence cần có và rollback seams. Node mock adapter không phải authenticated SSR transport.
- Các phép kiểm hành vi mới là yêu cầu delivery, chưa được chạy trong planning. Chính sách kiểm chứng và chia delivery vẫn là các quyết định kế tiếp, không đổi status delivery hoặc tự tạo task ready.

Kiểm tra tài liệu: `corepack pnpm docs:check` và `git diff --check`. Source/config ứng dụng không đổi; done nghĩa Wayfinder có resolution, không phải SSR đã hoạt động hay PR đã merge.
