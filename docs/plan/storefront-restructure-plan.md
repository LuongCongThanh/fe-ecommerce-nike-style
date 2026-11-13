# Kế hoạch tái cấu trúc Storefront

Phạm vi thực thi là `fe-ecommerce-nike-style`. `be-demo` phát hành hợp đồng và sở hữu nghiệp vụ. `cms` là back-office, tham gia nghiệm thu các luồng cần thao tác vận hành.

Nguồn đối chiếu trong workspace là [Glossary Map](../../../GLOSSARY-MAP.md), [cây đích v3](../../../TARGET-REPOSITORY-TREE.md), [master plan](../../../THREE-REPO-RESTRUCTURE-PLAN.md) và [spec 11](../../../THREE-REPO-RESTRUCTURE-SPEC.md). Dùng bản cập nhật API-first ngày 14/11/2026 của master plan để sắp thứ tự triển khai. Dùng spec 11 cho hành vi và tiêu chí nghiệm thu.

## Baseline và đánh giá

| Hạng mục | Hiện trạng | Việc còn lại |
| --- | --- | --- |
| App độc lập | Next.js đã lên root từ #77, cấu hình được chỉnh tiếp trong #78 | Giữ `pnpm-workspace.yaml` làm nơi khai báo chính sách build và overrides của pnpm cho root |
| Dọn legacy | Cleanup xóa `apps/admin`, `apps/cms`, `packages/`, Turbo, proxy microfrontend và MSW back-office | Gỡ MSW storefront theo từng hợp đồng đã chuyển và kiểm tra phụ thuộc trước lần gỡ cuối |
| Catalog | #79 nối API thật cho home, PLP, danh mục, search và PDP qua proxy `/api/v1` | Nối Giá áp dụng khi có hợp đồng tương ứng. Mở nút mua khi API Tier 1 trả khả dụng và giỏ server đã chạy |
| Hợp đồng | `scripts/gen-api.mjs` pin `openapi-v0.5.0` tại baseline và sinh `src/lib/api/generated/openapi.ts`. CI so sánh file sinh | Tăng pin cùng PR dùng capability mới và kiểm tra lỗi theo contract thật |
| Commerce | Giỏ local, checkout mô phỏng, session và đơn còn phụ thuộc contract chuyển tiếp | Giỏ, Báo giá, Voucher, phí giao hàng, tồn kho và trạng thái Đơn hàng lấy từ API |
| Cấu trúc | Code feature còn nằm ở `app/[locale]/**/_lib`, `core/session` và `shared` | Chuyển từng nhóm theo PR có thể nghiệm thu. Giữ URL, locale và SEO hiện có khi chỉ di chuyển code |

## Ranh giới đích

- `src/app/[locale]` giữ route, layout và composition. Tám feature đích là `catalog`, `search`, `cart`, `wishlist`, `checkout`, `orders`, `account` và `auth`.
- Chuyển home, danh mục và PDP sang `catalog`. Chuyển search UI và header search sang `search`. Chuyển session và auth UI sang `auth`. Chuyển profile và địa chỉ sang `account`. Đặt tra cứu đơn khách vãng lai trong `orders`. Đưa header, navigation và layout dùng chung vào `components/layout`.
- Feature giữ mapper DTO → view model và schema form. `src/lib/api` giữ transport, typed endpoint và lỗi chuẩn hóa. Dùng alias `@/` và entry point public khi compose các feature. Component render từ view model. Kiểm tra boundary qua ESLint trước khi xóa đường dẫn cũ.
- Theo glossary `be-demo`, Người mua chọn **Biến thể**, SKU là mã định danh của Biến thể. API quyết định Giá áp dụng, lượng có thể bán, Voucher và hành động khả dụng của Đơn hàng. Wishlist là dữ liệu cục bộ theo Sản phẩm, ngoài MVP API.

## Trình tự triển khai

| PR | Điều kiện bắt đầu | Phạm vi và tiêu chí nghiệm thu |
| --- | --- | --- |
| Cleanup | Root đã độc lập | Xóa mã và tooling monorepo dư thừa. Giữ mock phục vụ khách hàng. Frozen install, lint, format, typecheck, test hiện có và build chạy ở root |
| Catalog và Giá áp dụng | OpenAPI có trường và filter/sort tương ứng | Di chuyển catalog/search theo feature. Home, PLP, search và PDP hiển thị Giá áp dụng, Giá bán gạch ngang khi phù hợp. Kiểm tra URL filter và locale. Dùng contract cho `onSale` |
| Tier 1, session và Giỏ hàng | API công bố contract session Người mua, cookie Giỏ vãng lai, Gộp giỏ và tồn khả dụng | Nối session qua proxy, cập nhật query cache theo người dùng và giỏ. Thử reload, nhiều tab, Gộp giỏ sau login và giỏ tài khoản trên thiết bị khác. Xóa giỏ local khi có phương án xử lý giỏ cũ đã xác nhận |
| Tier 1, Checkout COD và Đơn hàng | API phát hành Báo giá, Voucher, phí giao, đặt đơn idempotent, lịch sử, huỷ và tra cứu | Mở mua hàng cùng luồng COD thật. Thử Giá áp dụng hoặc tồn thay đổi sau Báo giá, Voucher bị từ chối và retry sau timeout với cùng khóa idempotency. Hiển thị Báo giá mới để xác nhận lại. Tra cứu bằng Mã đơn và số điện thoại. Đi tay một đơn từ storefront đến CMS |
| Tier 2, Tài khoản | API địa chỉ, hồ sơ, ngôn ngữ và bestseller được phát hành | Nối sổ địa chỉ, hồ sơ, ngôn ngữ và dữ liệu bán chạy theo contract. Thử chọn địa chỉ tại checkout và kiểm tra dữ liệu tài khoản khi đăng xuất rồi đăng nhập tài khoản khác |
| Tier 3, Tích hợp | Contract payment, GHN và session mới sẵn sàng | Chuyển đến cổng thanh toán từ URL do API trả. Trang kết quả tải trạng thái từ API sau redirect. Thử callback đến muộn, phiên thanh toán hết hạn và luồng phí vận chuyển theo Báo giá |
| Tier 4, Hậu mãi và dữ liệu cá nhân | Contract đổi trả, hoàn tiền, consent, yêu cầu dữ liệu và review theo từng đợt | Hiển thị tiến trình theo Đơn hàng và Dòng đơn. Chỉ render hành động API cho phép. Đi tay đổi trả một phần, hoàn tiền, lựa chọn xử lý dữ liệu và review đủ điều kiện mua |
| Hoàn tất MSW và Phase 7 | Mọi runtime consumer đã được thay hoặc bỏ theo scope | Xóa startup, worker, env, fixture và dependency MSW còn lại sau khi rà cả test harness. Cập nhật test theo Verification matrix của master plan và xác minh hành trình thật |

## Rủi ro và điểm kiểm tra

- **Giỏ cũ.** ID giả có thể không ánh xạ được sang Biến thể thật. Trước cutover, kiểm kê dữ liệu localStorage và thống nhất cách xử lý với chủ sản phẩm nếu có dữ liệu người dùng thật. Kiểm tra Gộp giỏ đồng thời ở hai tab theo contract.
- **Session và cache.** Kiểm tra thuộc tính cookie qua proxy, logout/refresh, và phân tách cache của từng người mua. Backend xác thực và kiểm tra quyền sở hữu. Kiểm tra service worker tránh lưu response tài khoản, Giỏ hàng và Báo giá.
- **Đơn trùng và Báo giá cũ.** Giữ khóa idempotency cho retry của cùng lần xác nhận theo contract. Nếu Báo giá đổi, hiển thị dữ liệu API mới và yêu cầu Người mua xác nhận.
- **Rollback.** Duyệt catalog có thể quay về phiên bản API tương thích đã pin. Khi luồng mua thật lỗi, tạm khóa thao tác mua bị ảnh hưởng và giữ dữ liệu Đơn hàng phía server. Mock chỉ phục vụ phát triển.
- **Mỗi PR.** Chạy kiểm tra hẹp rồi chạy lint, format, typecheck, test hiện có và build. Nếu đổi hợp đồng, sinh lại types và kiểm tra diff. Nếu đổi luồng trình duyệt, đi tay theo tier và chạy E2E phù hợp. Bổ sung bộ test theo Phase 7 của master plan.
