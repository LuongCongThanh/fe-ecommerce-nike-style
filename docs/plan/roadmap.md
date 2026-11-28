# Roadmap

Chỉ theo dõi việc chưa hoàn tất. Hiện trạng ở [overview](../business/overview.md), trạng thái từng ticket ở [plan](README.md). Migration module và SSR (34–48), cùng hồ sơ workflow/docs đã hoàn tất, được giữ trong `plan/done/`.

## Backlog hiện tại

| Nhóm                | Ticket hoặc điều kiện tiếp tục                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| UI đơn hàng         | [04 — nhãn trạng thái theo i18n](tasks/todo/04-order-status-badge-i18n/spec.md)                                           |
| Trả hàng            | [06 — vòng đời trả toàn đơn](tasks/todo/06-order-return-lifecycle/spec.md), cần thống nhất với API owner                  |
| Cấu hình repository | Ticket 22–31 trong [todo](README.md): env, Sentry, Tailwind, hooks, Node, ESLint, Next config, pnpm, format và skill lock |
| Proxy               | [33 — gỡ guard admin](tasks/todo/33-remove-admin-route-guard/spec.md), phụ thuộc ticket 32 đã hoàn tất                    |
| Bằng chứng SSR      | Có unit/HTTP-level; chưa có production browser assertion riêng cho các slice SSR. Chỉ bổ sung khi có phạm vi được duyệt   |
| Retro runner        | Đề xuất cho mở PR khi code qua gate nhưng retro hết lượt chưa thực thi; runtime vẫn dừng xin `retro-turns`                |

Không tự chuyển `todo` thành `ready-for-agent`. Quyết định đang chờ không phải `wontfix`.

## Thứ tự tích hợp sản phẩm

API phải có contract và endpoint dùng được trước khi consumer cutover. Các tier dưới đây là thứ tự dependency, không khẳng định Backend đã sẵn sàng.

| Tier                           | Việc Storefront cần nối                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| 1 — bán COD                    | Cart server, Guest/Customer merge, quote, Voucher, đặt đơn idempotent, tra cứu và lịch sử đơn               |
| 2 — account/operations         | Profile, địa chỉ, ngôn ngữ và bestseller từ dữ liệu Orders thật                                             |
| 3 — tích hợp                   | Shipping GHN/fallback, VNPay/MoMo, trạng thái thanh toán, email theo locale và Google login khi có contract |
| 4 — hậu mãi và dữ liệu cá nhân | Return/refund, sự cố giao hàng, consent/data requests và verified reviews                                   |

SalePrice/Voucher UI và section khuyến mãi còn cần contract/data tương ứng. Không tự bật flash sale, countdown, rating hoặc bestseller bằng số liệu giả.

## Quyết định còn mở

- **Trả hàng:** glossary và ticket 06 mô tả trả toàn đơn; bối cảnh liên repo cũ mô tả theo dòng. Cần API owner chốt phạm vi trước triển khai; không dùng một phía để suy ra contract.
- **Session và cart thật:** phải xác minh cookie, refresh, Guest cart, merge và ownership; session mock hiện chưa đáp ứng cutover.
- **Readiness:** các flow mock và trạng thái done của refactor không chứng minh đã bán hàng thật.

## Điều kiện giữ khi cutover

- Product → Variant → SKU; giá, discount, stock, filter/sort và các hành động Order theo API. Backend là nguồn sự thật; không dùng localStorage hay catalog mới để viết lại OrderLine snapshot.
- Cart Guest thuộc server/cookie; Customer cart đồng nhất đa thiết bị. Quote xác nhận subtotal, Voucher, shipping và tổng; thay đổi giá/stock phải lấy quote mới với feedback rõ.
- Retry/double-click đặt đơn dùng idempotency key cho cùng lần đặt. API quản lý reservation/expiry, concurrency tồn kho và Order transition.
- Payment return phục vụ UX; API IPN xác thực và quyết định paid. Shipping/email/side effects do API/worker xử lý. Storefront không tự quyết refund hoặc inventory.
- Customer tách khỏi role nội bộ; API enforce authorization/ownership. Consent, retention và access/erasure cần contract trước go-live.
- Một Store/một Warehouse; không tenant header và không gọi CMS từ Storefront. Wishlist ngoài MVP API có thể tiếp tục local trong boundary riêng.

Readiness cần đi qua API thật: publish/stock → catalog; Guest cart → quote → đặt/thanh toán → tra cứu; return/refund và consent khi nằm trong phạm vi release. Kiểm endpoint, integration và browser journey trước khi gỡ mock.

Chi tiết nghiệp vụ lịch sử được giữ tại [commerce context](tasks/done/07-workflow-structure-map/commerce-context.md), cần xác minh lại với Backend trước khi áp dụng. Cách kiểm contract/cutover nằm tại [API integration](../architecture/api-integration.md); schema và vòng đời ticket thuộc [tracker](../agents/issue-tracker.md).
