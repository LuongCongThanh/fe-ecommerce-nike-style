# Thiết kế đích và lộ trình chuyển cấu trúc Storefront

Bản đồ quyết định triển khai: [Lập đường chuyển Storefront sang module nghiệp vụ và tên dễ hiểu](tasks/16-storefront-refactor-map/spec.md). Tài liệu này sở hữu thiết kế đích; các child ticket của map sở hữu quyết định chi tiết để biến lộ trình thành delivery specs.

Trạng thái: **thiết kế được duyệt ngày 24/11/2026; chưa triển khai source**. Quyết định: [ADR 0001](../adr/0001-domain-modules-and-readable-names.md). Đây là lộ trình thiết kế, không phải task spec đủ điều kiện cho runner và không tự đổi trạng thái task hiện có.

## Cây đích

```text
src/
  app/                         # Chỉ điểm vào Next.js và phần nối mỏng
  providers/                   # Query, theme, auth context; giữ một owner
  layouts/                     # Khung trang, header, footer, navigation
  modules/
    catalog/
      product-list/
      product-detail/
      category-detail/
      search/
      components/              # Thành phần chung nội bộ catalog khi cần
    cart/
    checkout/
      shipping-address/
      payment-method/
      services/
      types/
    orders/
    account/
    auth/
    wishlist/
    home/
  integrations/
    backend/
      client/                  # HTTP và runtime browser hiện hành
      endpoints/               # Request và response mapping
      schemas/                 # Validation hợp đồng API
      generated/               # Chỉ sinh qua gen:api
      mocks/                   # Mock API cho luồng chưa cutover
  shared/
    components/                # UI không gắn nghiệp vụ
  i18n/
  lang/
  styles/
  pwa/
  testing/                     # Setup và helper kiểm thử
e2e/
```

Cây thể hiện owner chính, không liệt kê mọi helper hoặc yêu cầu tạo thư mục rỗng. Mỗi helper hiện tại phải được phân loại trước khi chuyển, tránh thay `shared/lib` bằng một kho chứa tên khác. Adapter riêng server chỉ thêm khi slice SSR cần, có isolation theo request; không sao chép singleton session browser vào SSR.

## Quy tắc bên trong module

Có thể tạo `components`, `hooks`, `queries`, `schemas`, `stores`, `services`, `types` theo nhu cầu. Ít file thì giữ phẳng; chức năng lớn gom các file liên quan vào folder có tên như `shipping-address`. Các nhóm `services`/`types` đông file chia theo chức năng, không theo số lượng cố định.

```text
modules/checkout/
  CheckoutScreen.tsx
  services/
    order-submission/
      placeOrder.service.ts
      placeOrder.service.test.ts
  types/
    orderSubmission.types.ts
  shipping-address/
    ShippingAddressForm.tsx
    ShippingAddressForm.test.tsx
    schemas/
      shippingAddress.schema.ts
      shippingAddress.schema.test.ts
```

Props/type chỉ một file dùng ở cạnh consumer; type chung đặt trong `types`. Schema form thuộc chức năng, schema request/response API thuộc `integrations/backend/schemas`. Không nhân đôi contract hoặc validation giống hệt chỉ để đủ tầng. Dùng union/`as const`, không thêm TypeScript enum; interface không có tiền tố `I`.

Tên service theo hành động; `.service.ts` không bắt buộc là class. Service chỉ chuyển tiếp endpoint thì không cần tạo. Workflow thuần độc lập React khi có giá trị; hook/query sở hữu router, cache và tương tác React. Dependency inversion dùng interface nhỏ cho boundary thật; không thêm repository/interface cho mỗi endpoint.

Module chỉ dùng public module cụ thể được cho phép, không import private hoặc tạo barrel. Ví dụ home có thể dùng `FeaturedProducts` do catalog công khai; không mặc định được import mọi query/service catalog. Public API và chiều dependency cần được ghi/lint, không chỉ dựa vào `export`. Phối hợp cấp app ưu tiên route/layout; phần triển khai UI nằm ngoài `app`.

## Bản đồ chuyển đổi

| Hiện tại                           | Đích                                         | Ràng buộc                                                           |
| ---------------------------------- | -------------------------------------------- | ------------------------------------------------------------------- |
| `app/_composition`                 | `providers` hoặc `layouts` theo trách nhiệm  | Giữ mount/lifecycle, không tạo provider trùng                       |
| UI, hooks, logic trong route       | Module sở hữu                                | Giữ special files, metadata và route config tại vị trí Next yêu cầu |
| `features`                         | `modules`                                    | Giữ owner nghiệp vụ, public import và behavior                      |
| `features/storefront-shell`        | `layouts` và component trực thuộc            | Kiểm seam session/cart/wishlist, không gom nghiệp vụ vào shared     |
| `shared/ui`                        | `shared/components`                          | Giữ accessibility và visual contract                                |
| `lib/api`                          | `integrations/backend`                       | Giữ endpoint, mapper, refresh, lỗi, mock và generated contract      |
| `lib/schemas`                      | `integrations/backend/schemas` cho transport | Phân loại schema trước, giữ semantics validation                    |
| Service/type/schema/store hiện tại | Suffix đã chốt khi migrate owner             | Test giữ basename source rồi thêm `.test`                           |

`app`, `i18n`, `lang`, `styles`, `pwa`, `testing` và root `e2e` giữ vai trò hiện có. Không đổi URL, locale hoặc offline fallback vì đổi tên folder kỹ thuật. Không bulk-rename file không liên quan trong một slice.

## Thứ tự chuyển đổi

[Backlog bàn giao đã chốt ngày 25/11/2026](tasks/21-storefront-delivery-breakdown/delivery.md) sở hữu thứ tự chi tiết, scope/dependency/gates từng đợt. Các bước dưới mô tả lộ trình ở mức tổng quan; shared components/cơ chế dùng chung được chuyển trước providers/layouts theo backlog. Map Wayfinder đã hoàn tất quyết định, source chưa được chuyển.

1. **Chuẩn bị boundary:** kiểm status/source/config mới nhất; inventory path, import, test, owner, public dependency và runtime. Lập spec/task theo tracker trước khi triển khai; xác định mapping không làm đổi behavior.
2. **Rule và cấu hình:** cập nhật `AGENTS.md`, rule owner, ESLint boundary, alias/test/config glob chịu tác động theo slice. Cho phép cả path cũ/mới có giới hạn trong giai đoạn chuyển; không tắt lint toàn cục. Đối chiếu TypeScript path, build, mocks và gen:api output.
3. **Providers và layouts:** đưa `_composition` và triển khai shell ra ngoài `app`; giữ một provider owner và cleanup session adapter. Route/layout vẫn khai báo phần framework bắt buộc.
4. **Catalog thí điểm:** chuyển toàn owner catalog cùng component/query/schema/test và direct consumers có liên quan theo quyết định chia đợt ngày 25/11/2026; áp naming, public entry và wishlist composition đã chốt. Giữ URL/filter/locale và API behavior. Chốt mẫu bằng review trước khi mở rộng.
5. **Tích hợp Backend:** di chuyển SDK và transport schemas theo mapping, cập nhật mọi consumer và generator output path trong cùng thay đổi có thể build. Không sửa nội dung generated contract thủ công hoặc vô tình đổi contract khi đổi path.
6. **Các module còn lại:** chuyển lần lượt auth/account, cart/wishlist, orders/checkout theo dependency đã kiểm; bảo toàn reservation, idempotency, cache invalidation và error behavior. Chia spec nhỏ theo thực tế, không coi thứ tự này là quyền chạy task chưa ready.
7. **Server rendering:** sau khi slice ổn định, bổ sung lấy dữ liệu public catalog phía server như thiết kế đã chọn; thống nhất cache/query key/hydration. Đây là thay đổi runtime riêng, không gộp với rename, auth cutover hoặc Backend API change.
8. **Kết thúc:** loại compatibility path/rule tạm; cập nhật architecture thành hiện trạng đã kiểm, liên kết tài liệu và rà import cũ còn sót. Không đánh dấu task done chỉ dựa vào có report.

## Kiểm chứng và tiêu chí hoàn tất

- Test gần source chứng minh hành vi có ý nghĩa: business rule, mapper/schema, query và state transition; không viết test cho mỗi suffix/type.
- E2E chứng minh routing, locale, session và hành trình mua hàng. Async Server Component cần kiểm tại boundary phù hợp; không suy ra RSC hoạt động chỉ từ unit-test reader.
- Chạy kiểm tra hẹp trước, sau đó gate repo áp dụng: lint, format, docs, typecheck, test; build cho thay đổi routing/config/import graph; E2E theo các browser flow bị tác động.
- Đối chiếu public HTML và request trùng khi triển khai SSR; không tuyên bố rename cải thiện hiệu năng nếu chưa đo.
- Không còn triển khai màn hình/nghiệp vụ trong `app`; file framework giữ tên đúng. Không HTTP ngoài SDK, circular/private imports hoặc barrel mới.
- Có mapping mọi file được chuyển, không tạo bản source cũ/mới đồng thời thiếu owner. Nếu phát sinh regression, revert lát cắt cùng config/import tương ứng; không che lỗi bằng tắt gate.
- Các convention mới được cập nhật cùng executable config và owner docs; source thực tế khớp cây được ghi. Việc chuyển đổi không bao gồm commit/push/PR khi chưa có yêu cầu riêng.

Tham khảo [nghiên cứu cấu trúc](../research/nextjs-storefront-structure.md), [naming và các quyết định đã duyệt](../research/nextjs-naming-conventions.md), [tracker](../agents/issue-tracker.md). [Architecture](../architecture.md) tiếp tục mô tả runtime hiện tại cho đến khi từng slice được triển khai.
