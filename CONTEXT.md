# FE — E-commerce Platform

Nền tảng e-commerce thời trang/giày thể thao (kiểu Nike), monorepo gồm Storefront, Admin, CMS. Dự án mới, độc lập, đang ở giai đoạn brainstorming/thiết kế.

## Language

**Locale**:
Ngôn ngữ hiển thị của toàn bộ nội dung người dùng thấy — UI strings, format ngày/số, và nội dung Product/CMS (qua Localized Text). Không kéo theo thay đổi tiền tệ, catalog, thuế hay vận chuyển (xem Market). Danh sách Locale được hỗ trợ là cố định, quản lý trong code (xem ADR 0001), không phải cấu hình runtime.
_Avoid_: Language (khi ý muốn nói riêng khái niệm domain này), i18n (đây là kỹ thuật triển khai, không phải khái niệm domain)

**Locale mặc định (Default Locale)**:
Locale bắt buộc phải có giá trị đầy đủ cho mọi Localized Text; các Locale khác là optional và fallback về Locale mặc định khi thiếu bản dịch. Trong dự án này, Locale mặc định là `vi`.
_Avoid_: Primary locale, base locale

**Localized Text**:
Một trường nội dung (tên sản phẩm, mô tả, nội dung CMS...) có giá trị khác nhau theo từng Locale — bắt buộc có giá trị ở Locale mặc định, các Locale khác optional với fallback về Locale mặc định khi thiếu.
_Avoid_: Translation, i18n string (khi ý muốn nói riêng khái niệm domain này)

**Market**:
Vùng kinh doanh riêng biệt — có tiền tệ, thuế, catalog và vận chuyển riêng. Chưa được dùng trong phạm vi hiện tại (chỉ có một Market: Việt Nam); khái niệm này được đặt tên trước để tránh nhầm lẫn với Locale khi/nếu dự án mở rộng sang thị trường khác.
_Avoid_: Region, country (khi ý muốn nói riêng khái niệm domain có tiền tệ/catalog riêng)
