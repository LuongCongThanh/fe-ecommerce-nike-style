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
