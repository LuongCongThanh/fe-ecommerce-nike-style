# Bối cảnh tích hợp thương mại trước khi rút gọn roadmap

Hồ sơ tham khảo lịch sử, chuyển từ roadmap ngày 27/11/2026 để giữ thông tin độc nhất. Đây không phải contract API hiện hành hoặc quyền triển khai. Xác minh lại với Backend trước khi dùng từng quy tắc; các đường dẫn ghi trong code span là bối cảnh từ bản cũ.

Đặc biệt, trả hàng theo dòng trong hồ sơ này chưa thống nhất với trả toàn đơn trong glossary và ticket 06. Quyết định còn mở được theo dõi ở [roadmap](../../../roadmap.md).

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

- Returns theo dòng đơn, duyệt/từ chối theo policy/Mức giảm, nhận hàng hoàn cập nhật stock qua API. Refund MVP thủ công, có history/audit; storefront hiển thị return/refund status. Đề xuất task06 local (`docs/plan/tasks/todo/06-order-return-lifecycle/spec.md`) còn cần xác nhận nghiệp vụ: phạm vi toàn đơn trong đề xuất local và theo dòng trong chương trình liên repo chưa thống nhất. Không coi cả hai là yêu cầu đã chốt hoặc contract backend.
- Consent cho từng loại xử lý dữ liệu có đồng ý/từ chối và đổi lựa chọn; Customer gửi access/erasure request. API/CMS xử lý retention, audit ai truy cập dữ liệu cá nhân và xóa theo chính sách trước go-live.
- Một Store/một Warehouse, không StoreScope/X-Store-Id; CMS/API tách repo, storefront không gọi CMS. RBAC global và duy nhất một active Admin là dependency backend, không vai trò storefront.
- Release readiness cần walk API thật: publish/stock → catalog; Guest cart → quote → payment → lookup; return/refund visibility; consent/data request. Test ưu tiên backend gồm migration Admin, concurrency stock, order idempotency, IPN duplicate/signature. Tiếp theo API contract, CMS, storefront integration và E2E mỗi P1/verification flow.
- Quy tắc cũ “không viết test Phases 1–6” là lịch sử chương trình rebuild liên repo, không thay quy tắc test hiện tại của repo này. Các backend migration phải được owner review/dry-run trên bản sao, không reset dữ liệu chung. Không xóa mock/assets/chức năng trước bằng chứng consumer và manual/API checks phù hợp.
