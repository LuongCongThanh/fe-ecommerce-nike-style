---
status: done
blocked-by: [17-storefront-migration-inventory, 18-storefront-module-boundaries, 19-storefront-runtime-boundaries]
assignee: Luong Cong Thanh
kind: docs
labels: [wayfinder:grilling]
---

Part of 16-storefront-refactor-map

# Cần giữ hoặc bổ sung bằng chứng nào để xác nhận refactor không đổi hành vi?

Type: grilling

## Question

Chốt kiểm chứng theo từng boundary từ inventory: unit/schema/mapper, hook + QueryClient + MSW, provider lifecycle, build/routing và E2E hành trình. Chọn test cũ phải thích ứng đường dẫn, test hồi quy có giá trị và test không nên thêm cho đổi tên thuần.

Cần tách baseline lỗi sẵn có khỏi regression, bảo toàn fixture/mock semantics, locale, URL/filter và offline fallback; không bỏ test hoặc giảm gate để qua refactor. Xác định cách đo request trùng/HTML khi tới SSR, giới hạn async Server Component của Vitest và môi trường cần cho E2E.

Resolution là ma trận thay đổi → bằng chứng → lệnh → điều kiện đạt/rollback, gồm quyền chỉnh test cũ cần ghi trong delivery specs. Đây là quyết định với người dùng, không chạy toàn bộ test suite để ngầm coi kế hoạch đã được chứng minh.

## Context

Map: [Lập đường chuyển Storefront sang module nghiệp vụ và tên dễ hiểu](../16-storefront-refactor-map/spec.md).

Đọc resolution của: [Mỗi file hiện tại sẽ chuyển về đâu và còn consumer nào cần giữ?](../17-storefront-migration-inventory/spec.md).

## Comments

### 24/11/2026 — Làm rõ prerequisite

Có thể khảo sát test từ inventory, nhưng chỉ chốt ma trận kiểm chứng sau quyết định public boundary và runtime để bằng chứng khớp boundary cuối. Bổ sung hai blocker tương ứng; giữ status todo.

### 24/11/2026 — Claim và khảo sát bằng chứng

Đã claim sau khi inventory/public boundary/runtime done. [Chính sách kiểm chứng migration Storefront — bản thảo](verification.md) ghi ma trận kiểm chứng, giới hạn CI/dev browser và độ lệch E2E đọc từ source; chưa chạy suite hay kết luận test thất bại. Chờ người dùng chốt baseline và quyền sửa test trước khi chốt môi trường SSR/PWA.

### 24/11/2026 — Đồng ý baseline và quyền sửa test

Người dùng đồng ý ghi baseline và reconcile test/fixture với hành vi hiện tại trước khi làm bằng chứng; đồng ý allow-test-changes theo file scope của từng delivery spec, giữ ý nghĩa assertion và không thêm test cho rename thuần. Ghi verification.md; môi trường harness và production gates đang là đề xuất cần chốt tiếp.

### 24/11/2026 — Resolution

Người dùng đồng ý harness HTTP catalog có fixture cố định cho browser/server và gates production SSR/PWA, sau khi đã chốt baseline và quyền sửa test. Chính sách canonical tại [Chính sách kiểm chứng migration Storefront — quyết định đã chốt](verification.md).

- Ghi baseline trước slice, reconcile test/fixture lệch hiện trạng; không mở lại PDP purchase để cứu E2E, không bỏ test/giảm gate hoặc tự miễn required CI.
- Mỗi delivery spec cấp allow-test-changes theo file scope để thích ứng import/mock/colocation/setup public boundary, giữ ý nghĩa assertion và chỉ bổ sung hồi quy có giá trị.
- Catalog dùng HTTP test harness deterministic ở boundary đúng Contract Version, browser qua proxy và SSR trực tiếp cùng origin; log server/browser request riêng. Commerce chưa cutover giữ MSW. Harness không thay bằng chứng Backend thật.
- Giữ root gates hiện hành, coverage khi tập file/glob bị tác động và full E2E ba engine theo flow/routing/auth/storage. Thêm production Chromium CI gate cho SSR/PWA hoặc runtime thay đổi có ảnh hưởng; foundation delivery phải xây harness/config/gate trước consumer slices.
- Ma trận ghi bằng chứng/lệnh/điều kiện đạt cho rename, public boundary, composition, provider/session, SDK/generated, commerce, coverage, SSR và PWA; phân biệt HTTP HTML trước JavaScript với DOM sau hydrate, dev offline route với service-worker offline fallback.
- Report phải ghi môi trường, baseline, command/exit, engine/mode và artifacts; thiếu điều kiện kiểm chứng nghĩa acceptance chưa đạt. Rollback theo slice, không sửa assertion để hợp thức regression.

Kiểm tra trong phiên planning: `corepack pnpm docs:check` và `git diff --check`. Chưa chạy suite, coverage, build, E2E hoặc production harness. Done nghĩa đã resolve chính sách Wayfinder; source/test/config/CI chưa được triển khai. Bàn giao phạm vi foundation, baseline reconciliation và các delivery slice cho quyết định chia đợt tiếp theo.
