# Roadmap và điều kiện hoàn tất

Owner: maintainer storefront. Đây là backlog/dependency, không phải hiện trạng. [Overview](overview.md) và [architecture](architecture.md) giữ code hiện có; [map rebuild](plan/tasks/07-workflow-structure-map/spec.md) giữ quyết định. Không thay trạng thái delivery từ sự tồn tại của report.

## Rebuild repository trước

| Phạm vi              | Owner/ticket                                             | Điều kiện hoàn tất                                                                       |
| -------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Workflow runner      | [11](plan/tasks/11-runner-workflow/spec.md)              | Selection, status, resume/provider preflight và UI evidence được kiểm chứng bằng runtime |
| Ownership tài liệu   | [12 plan](plan/tasks/12-documentation-ownership/plan.md) | Nội dung độc nhất chuyển đúng owner, consumer/link/anchor không mất; có ledger           |
| Legacy source/config | [14](plan/tasks/14-rebuild-source-audit/spec.md)         | Chỉ xóa sau import/dynamic/asset/config audit và checks phù hợp                          |
| Quality gate docs    | [15](plan/tasks/15-docs-quality-gate/spec.md)            | Đã có `pnpm docs:check`, CI job và verify-gates offline; report ghi phạm vi/ngoại lệ     |

Convention/boundary/provider decisions đã có resolution trong task08–10/13; đọc hồ sơ, không mở lại chỉ vì đổi docs. Đã đối chiếu PR merge bằng gh/git trong lần triển khai: task01/#96, task02/#97, task03/#99, task05/#94 đã merge vào dev trong khi spec còn ready-for-agent; giữ artifact và chờ maintainer reconcile, không đổi delivery status ở đây. Task index có thể lệch spec: chỉ dùng để điều hướng, không tự suy diễn merge/done.

## Ba quyết định runner được bảo toàn

Các quyết định cuối system plan cũ đã được chấp nhận, nhưng phải phân biệt với runtime:

1. UI cần bằng chứng browser đã chạy, route, viewport/trạng thái và kết quả; browser không khả dụng phải dừng. Task11 đã thêm fail-closed và artifact PNG mới dưới checkout, route cùng origin devserver, viewport dương, trạng thái/actions đã kiểm tra; xem report để biết giới hạn bằng chứng.
2. Status đọc từ spec; index chỉ navigation. Delivery và Wayfinder có nghĩa done khác nhau. Task11 đã loại Wayfinder bằng labels/body Type khỏi selection, kể cả explicit --task; vẫn giữ record để xét blocker.
3. Khi code qua gates/review, retro hết lượt vẫn có thể mở PR với ghi nhận retro dang dở. Đây là accepted backlog, chưa thực thi: runtime hiện dừng xin retro-turns. Không mô tả đã cho PR đi tiếp.

Không phục hồi ngoại lệ tự merge hoặc thêm worktree từ system plan lịch sử. CI đã enforce `docs:check` cho formatting, link/anchor, consumer và graph task; E2E vẫn chỉ chạy khi thay đổi browser flow, không thuộc gate docs offline.

## Lộ trình tích hợp sản phẩm riêng

Kế hoạch liên repo ngày 14/11/2026 đổi sang API-first theo tier. Đây là dependency order, không khẳng định tier đã xong. API phải có contract chạy được trước CMS/storefront tương ứng; không chuyển checkout trong đợt docs.

| Tier                  | Dependency API/operations                                                                                                       | Công việc storefront sau readiness                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1: bán COD            | Inventory/reservations/movement, Guest/Customer cart+merge, quote/order/COD/Voucher/cancel/lookup/history, settings phí cố định | Cart thật, quote xác nhận, đặt đơn idempotent, tra cứu Guest và lịch sử đơn                           |
| 2: account/operations | Address book/profile/language, stock count, revenue/bestseller                                                                  | Profile/address thật, bestseller khi có dữ liệu Orders                                                |
| 3: integration        | Outbox/worker/email, GHN, VNPay/MoMo, Google login                                                                              | Payment-link/return/status, shipping quote/fallback, email theo locale, login Google khi contract sẵn |
| 4: after-sales/legal  | Returns/refunds, shipment incidents, personal data, reviews                                                                     | Trạng thái trả/hoàn, consent/data requests, verified reviews                                          |

SalePrice display và Voucher screens được hoãn từ B2 sang CMS/storefront follow-up. Không lấy pin v0.5.0 để khẳng định đã có Effective price/available/quote. Flash sale/Best sellers/reviews chỉ bật khi data thật tương ứng; khuyến mãi không dùng countdown tự chế.

## Invariants frontend phải giữ khi nối API

Các yêu cầu sau từng chỉ được ghi đầy đủ trong kế hoạch ba repo; giữ ở đây đến khi spec/contract liên repo có bằng chứng thay thế.

### Catalog, giá và Voucher

- Product → Variant → SKU; variant là size × màu, ảnh theo màu. Chỉ sản phẩm đang bán hiện public. Publish từ CMS phải xuất hiện không cần deploy frontend.
- Search không dấu; filters category/size/color/price/gender và sort theo contract. MEN/WOMEN gồm UNISEX, KIDS không tự gồm UNISEX; API quyết định semantics. Giá sort là applied price thấp nhất của active variants.
- Giá bán/Effective price, giá gạch và phần trăm giảm lấy API; `onSale=true` và section khuyến mãi theo discount khi được contract hỗ trợ. Không countdown hoặc ratings giả; reviews sau Orders để xác minh mua hàng.
- SalePrice có lịch sử theo variant; “all variants” fixed/percent làm tròn xuống đồng, all-or-nothing. Upcoming sửa/xóa; active chỉ đổi end/kết thúc; ended read-only. Giá giảm dưới SalePrice hiện tại/tương lai bị API từ chối 409 (BR-PRC-05).
- Voucher là thuật ngữ chuẩn, không Coupon/Promotion. Code bất biến; unused được sửa/xóa, đã dùng chỉ sửa end/limit (không dưới used)/per-buyer/active và deactivate. Eligibility, counting, allocation/release usages do API ở checkout. CMS nhập giờ Việt Nam, API lưu UTC.

### Cart, quote và order

- Guest cart do server sở hữu, nhận diện cookie trình duyệt, có expiry; Customer cart đồng nhất đa thiết bị. Đăng nhập merge Guest vào Customer theo contract và thể hiện kết quả/giới hạn rõ. localStorage không là nguồn sự thật của Cart sau cutover; Wishlist vẫn có thể local sau feature boundary, ngoài MVP API.
- Quote hiển thị subtotal, Voucher, shipping và tổng do API tính. Place-order chỉ thành công với quote đã xác nhận; price/stock/Voucher thay đổi phải báo và lấy quote mới, không tự tính lại rồi đặt im lặng.
- Idempotency key cho lần đặt đơn: double-click/retry mạng tạo đúng một order. API recheck stock/price/Voucher/shipping trong transaction; frontend không quyết định inventory hoặc Order transitions.
- OrderLine snapshot giá và phân bổ Voucher; không đọc lại catalog để viết lại lịch sử. Không oversell khi đặt đồng thời. Trừ tồn khi Hàng chờ xuất theo API ADR; giữ hàng online 15 phút và tự nhả hết hạn.
- Guest lookup dùng Mã đơn + điện thoại; Customer chỉ xem đơn của mình, hủy khi API cho phép. UI render hành động được API trả, không ô chọn trạng thái tùy ý. Order flags/history là operations API/CMS, frontend chỉ hiển thị contract phù hợp.

### Account, payment và fulfillment

- Customer không phải internal Role; auth customer không bị nhập với RBAC Admin/Staff. API enforce ownership/authorization, frontend guard chỉ UX. Profile, address book và ngôn ngữ phải dựa contract thật; cookie/session/refresh được xác minh trước cutover.
- MVP dùng COD, VNPay, MoMo và GHN; ZaloPay env placeholder không chứng minh hỗ trợ. Payment-link redirect/return chỉ dẫn UX, API IPN quyết định paid. Duplicate IPN ghi nhận đúng một lần; signature sai bị từ chối; đối soát phát hiện lệch.
- GHN quote theo địa chỉ, phí dự phòng khi gateway lỗi và miễn ship theo settings. Shipment tạo/cập nhật qua API và webhook xác thực. Email xác nhận/thay đổi trạng thái theo locale và có log; side effect qua outbox/worker sau commit, Redis hỏng không làm API unready.

### Returns, privacy và readiness

- Returns theo dòng đơn, duyệt/từ chối theo policy/Mức giảm, nhận hàng hoàn cập nhật stock qua API. Refund MVP thủ công, có history/audit; storefront hiển thị return/refund status. Đề xuất task06 local (`docs/plan/tasks/06-order-return-lifecycle/spec.md`) còn cần xác nhận nghiệp vụ: phạm vi toàn đơn trong đề xuất local và theo dòng trong chương trình liên repo chưa thống nhất. Không coi cả hai là yêu cầu đã chốt hoặc contract backend.
- Consent cho từng loại xử lý dữ liệu có đồng ý/từ chối và đổi lựa chọn; Customer gửi access/erasure request. API/CMS xử lý retention, audit ai truy cập dữ liệu cá nhân và xóa theo chính sách trước go-live.
- Một Store/một Warehouse, không StoreScope/X-Store-Id; CMS/API tách repo, storefront không gọi CMS. RBAC global và duy nhất một active Admin là dependency backend, không vai trò storefront.
- Release readiness cần walk API thật: publish/stock → catalog; Guest cart → quote → payment → lookup; return/refund visibility; consent/data request. Test ưu tiên backend gồm migration Admin, concurrency stock, order idempotency, IPN duplicate/signature. Tiếp theo API contract, CMS, storefront integration và E2E mỗi P1/verification flow.
- Quy tắc cũ “không viết test Phases 1–6” là lịch sử chương trình rebuild liên repo, không thay quy tắc test hiện tại của repo này. Các backend migration phải được owner review/dry-run trên bản sao, không reset dữ liệu chung. Không xóa mock/assets/chức năng trước bằng chứng consumer và manual/API checks phù hợp.

## Nguồn và giới hạn

API domain/ADR/OpenAPI và CMS plan được repo tương ứng sở hữu; xem [API integration](api-integration.md) để biết đường liên repo. Các tree Nest/Prisma/Vue, khóa học, model pricing hoặc stack speculation từ bản nghiên cứu không trở thành backlog frontend. Khi contract mới mâu thuẫn invariants ở đây, ghi quyết định trong task trước khi đổi hành vi.
