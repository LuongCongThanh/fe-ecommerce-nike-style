# FE — E-commerce Platform

Nền tảng e-commerce thời trang/giày thể thao (kiểu Nike), monorepo gồm Storefront, Admin, CMS. Dự án mới, độc lập, đang ở giai đoạn brainstorming/thiết kế.

Tài liệu này là từ điển thuật ngữ domain (ubiquitous language): mỗi thuật ngữ có một định nghĩa duy nhất, dùng thống nhất trong code, tài liệu và trao đổi của dự án.

## Language

**Locale**:
Ngôn ngữ hiển thị của mọi nội dung người dùng thấy: UI strings, format ngày/số, và nội dung Product/CMS qua Localized Text. Locale không kéo theo thay đổi tiền tệ, catalog, thuế hay vận chuyển — đó là phạm vi của Market. Danh sách Locale được hỗ trợ là cố định, quản lý trong code (xem ADR 0001), không phải cấu hình runtime.
_Avoid_: Language (khi ý muốn nói riêng khái niệm domain này), i18n (đây là kỹ thuật triển khai, không phải khái niệm domain)

**Locale mặc định (Default Locale)**:
Locale bắt buộc có giá trị đầy đủ cho mọi Localized Text; các Locale khác là optional và fallback về Locale mặc định khi thiếu bản dịch. Trong dự án này, Locale mặc định là `vi`.
_Avoid_: Primary locale, base locale

**Localized Text**:
Một trường nội dung (tên sản phẩm, mô tả, nội dung CMS...) có giá trị khác nhau theo từng Locale — bắt buộc có giá trị ở Locale mặc định, các Locale khác optional với fallback về Locale mặc định khi thiếu.
_Avoid_: Translation, i18n string (khi ý muốn nói riêng khái niệm domain này)

**Market**:
Vùng kinh doanh riêng biệt, có tiền tệ, thuế, catalog và vận chuyển riêng. Chưa được dùng trong phạm vi hiện tại — chỉ có một Market: Việt Nam. Khái niệm này được đặt tên trước để tránh nhầm lẫn với Locale khi/nếu dự án mở rộng sang thị trường khác.
_Avoid_: Region, country (khi ý muốn nói riêng khái niệm domain có tiền tệ/catalog riêng)

## Catalog

Phạm vi sản phẩm: giày, quần áo, và phụ kiện (mũ, túi, tất, dây giày...) — cả ba loại đều được bán, không giới hạn chỉ một loại.

**Product**:
Một sản phẩm ở cấp khách hàng nhận biết (một tên, một trang PDP) — có thể mua trực tiếp hoặc phải chọn Variant trước khi mua, tuỳ Product đó có Variant hay không.
_Avoid_: Item, sản phẩm (khi ý muốn nói riêng khái niệm domain này, phân biệt với Variant/SKU)

**Variant**:
Một biến thể của Product theo tuple cố định `{Color?, Size?}` — đúng 2 trục, không phải danh sách option mở rộng. Một Product có thể có **0 hoặc nhiều** Variant — không bắt buộc phải có (ví dụ phần lớn phụ kiện không có Variant). Với Product có Variant, một trục có thể chỉ có đúng 1 giá trị (VD: áo chỉ có 1 màu, nhiều size) — vẫn coi là Variant hợp lệ, không phải trường hợp đặc biệt.
_Avoid_: Option, biến thể (khi ý muốn nói riêng khái niệm domain này)

**SKU**:
Đơn vị bán hàng/tồn kho cuối cùng, duy nhất, có giá và tồn kho riêng. Khi Product có ≥1 Variant, phải chọn đủ Color/Size để xác định đúng một SKU. Khi Product không có Variant nào, Product ánh xạ 1-1 với đúng một SKU ẩn (không cần chọn gì, "Add to cart" dùng thẳng SKU đó). `Price` gắn ở cấp SKU, không phải Product — các SKU của cùng một Product được phép lệch giá nhau; PLP hiển thị "giá từ" (giá SKU thấp nhất) khi các SKU của Product đó lệch giá.
_Avoid_: Mã sản phẩm, product code (khi ý muốn nói riêng khái niệm domain này)

**Category**:
Cây phân cấp theo **loại sản phẩm thuần** (Shoes, Apparel, Accessories, có thể có cây con như `Apparel > T-Shirts`). Không kết hợp Giới tính/nhóm tuổi — xem `Gender`.
_Avoid_: Danh mục (khi ý muốn nói riêng khái niệm domain này, phân biệt với Gender)

**Gender**:
Thuộc tính trên Product (`men | women | kids | unisex`), dùng làm **filter**, không phải một node trong cây Category. URL dạng `/men/shoes` là kết quả filter `gender=men` áp trên Category `Shoes`, không phải một Category thật — tránh một Product unisex phải gán trùng vào nhiều Category.
_Avoid_: Category, danh mục giới tính (khi ý muốn nói riêng khái niệm domain này)

## Cart & Order

> Kết quả phiên grilling `grilling` + `domain-modeling` cho Cart/Order/Inventory, chốt thay thế phần "chưa chốt" ở `docs/architecture/backend/domain-model.md`.

**CartItem**:
Một dòng trong Cart, tham chiếu thẳng tới **SKU** (`{ skuId, quantity }`) — không lưu `productId` + Color/Size rời rạc. Giá và tồn kho của một CartItem luôn đọc trực tiếp từ SKU tại thời điểm truy vấn, không suy luận lại từ Color/Size.
_Avoid_: lưu productId + color + size riêng lẻ trong CartItem (buộc phải tra cứu ngược ra SKU mỗi lần cần giá/tồn kho)

**Merge Cart** (gộp giỏ hàng khách vào giỏ hàng tài khoản sau đăng nhập):
Khi guest cart và cart của tài khoản đã đăng nhập cùng có một SKU, quantity được **cộng dồn** (không lấy giá trị lớn hơn, không ghi đè), sau đó **clamp** (giới hạn) theo `available` hiện tại của SKU đó — không bao giờ để CartItem sau merge vượt quá tồn kho khả dụng.
_Avoid_: ghi đè quantity, lấy max(quantity) giữa hai bên

**Reservation** (tạm giữ tồn kho):
Chỉ được tạo tại thời điểm khách **bắt đầu Checkout**, không tạo khi add-to-cart — add-to-cart chỉ kiểm tra `available > 0` tại thời điểm đó, không giữ chỗ. Có thời hạn (expiry); nếu khách rời khỏi Checkout mà không hoàn tất, Reservation hết hạn và tồn kho được giải phóng lại vào `available`.
_Avoid_: reserve ngay khi add-to-cart (gây khoá tồn kho oan khi khách add rồi bỏ giỏ)

**Order** — vòng đời trạng thái (`OrderStatus`, MVP COD-only, không có bước payment gateway):
```
PENDING → PROCESSING → PACKED → SHIPPED → DELIVERED
                                              ↓
                                    RETURN_REQUESTED → RETURNED
PENDING/PROCESSING → CANCELLED (nhánh riêng, chỉ từ 2 trạng thái này)
```
- **CANCELLED** chỉ hợp lệ từ `PENDING` hoặc `PROCESSING`. Từ `PACKED` trở đi, đơn **không thể** chuyển thẳng sang `CANCELLED` nữa — phải chờ `DELIVERED` rồi đi qua luồng `RETURN_REQUESTED` → `RETURNED`.
- **Reservation → committed stock**: chuyển ngay tại thời điểm Order được tạo thành công (Place Order thành công), không chờ thêm bước xác nhận nào khác (khác với luồng có payment gateway — nơi thường chờ webhook thanh toán trước khi commit).
- **Tồn kho được trả lại** (`committed` → `available`) chỉ ở hai thời điểm: khi Order chuyển sang `CANCELLED`, hoặc khi luồng `RETURNED` hoàn tất — không trả lại tồn kho ở bất kỳ trạng thái trung gian nào khác.
_Avoid_: coi PACKED/SHIPPED có thể huỷ trực tiếp như PENDING/PROCESSING

**OrderItem**:
Phải **snapshot** dữ liệu tại thời điểm mua (tên, SKU, Color/Size đã chọn, đơn giá, discount nếu có, ảnh) — không chỉ tham chiếu Product/SKU hiện tại, vì Product có thể đổi (giá, tên, ảnh...) sau khi đơn đã được tạo.
_Avoid_: chỉ lưu `skuId` và suy ra mọi thứ khác từ SKU hiện tại lúc hiển thị lại đơn cũ

## Wishlist

**WishlistItem**:
Tham chiếu tới **Product** (không gắn Variant/SKU cụ thể) — khớp với UX bấm tim ngay trên `ProductCard` ở PLP, nơi khách chưa chọn Color/Size. Khác với `CartItem` (luôn cần SKU vì sắp mua ngay), Wishlist chỉ đánh dấu quan tâm.
_Avoid_: gắn SKU/Variant cụ thể vào WishlistItem

**Merge Wishlist** (gộp guest wishlist vào wishlist tài khoản sau đăng nhập):
**Hợp nhất (union)** theo Product, khử trùng — không có khái niệm xung đột số lượng như Cart vì WishlistItem không có quantity.

**Move to cart** (từ Wishlist):
- Product có ≥1 Variant: điều hướng sang PDP để khách tự chọn Variant — hệ thống không tự suy đoán Color/Size khách muốn.
- Product không có Variant (ánh xạ 1-1 SKU ẩn): add thẳng vào Cart, không cần mở PDP.
_Avoid_: tự động chọn Variant đầu tiên còn hàng rồi add thẳng vào Cart cho Product có Variant

## Return & Refund

> Áp dụng cho Order ở trạng thái `DELIVERED` — xem state machine Order ở mục "Cart & Order" phía trên.

**Cửa sổ trả hàng (Return window)**:
Khách chỉ được tạo `RETURN_REQUESTED` trong vòng **7 ngày** kể từ thời điểm Order chuyển `DELIVERED`. Quá hạn, hệ thống từ chối request ngay ở tầng validate, không tạo `RETURN_REQUESTED`.
_Avoid_: cho phép return không giới hạn thời gian

**Return approval** (duyệt yêu cầu trả hàng):
`RETURN_REQUESTED` không tự động thành `RETURNED` — cần nhân viên (Order Operator) kiểm tra hàng trả về thực tế trước khi duyệt. Có hai kết quả:
- **Duyệt**: chuyển `RETURNED`, tồn kho SKU liên quan được giải phóng lại `available` (đã chốt ở Decision #38/39).
- **Từ chối** (hàng không đủ điều kiện — đã qua sử dụng, thiếu phụ kiện...): Order quay lại `DELIVERED`, không có trạng thái `RETURNED` nào được tạo, tồn kho không thay đổi.
_Avoid_: coi RETURN_REQUESTED tự động dẫn tới RETURNED mà không qua bước kiểm tra hàng thực tế

**Hoàn tiền COD (Refund)**:
Vì MVP không có cổng thanh toán online, hệ thống **không tự động chuyển tiền**. Khi `RETURNED` được duyệt, hệ thống chỉ lưu số tiền cần hoàn và thông tin nhận hoàn (do khách cung cấp) — nhân viên tự chuyển khoản tay ngoài hệ thống, rồi đánh dấu đã hoàn xong.
_Avoid_: giả định có refund API tự động gọi cổng thanh toán (không tồn tại ở MVP COD-only)
