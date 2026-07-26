# Đa Locale (UI) chỉ áp dụng cho storefront, không áp dụng cho Admin/CMS

Status: accepted

Cả 3 app (`storefront`, `admin`, `cms`) dùng chung `packages/design-tokens`, `packages/ui` và có thể dùng chung hạ tầng `next-intl`. Điều này dễ khiến người đọc sau này giả định đa Locale áp dụng đồng đều cho cả 3 app. Quyết định: chỉ giao diện `storefront` (khách hàng) hỗ trợ đa Locale (`vi`, `en`). Giao diện `admin` và `cms` chỉ tiếng Việt — người vận hành (Content Editor, Order Operator...) là nội bộ, giả định biết tiếng Việt, nên dịch toàn bộ label/form/thông báo lỗi của Admin/CMS là công sức không phục vụ khách hàng cuối.

Lưu ý: quyết định này **không** ảnh hưởng tới việc Content Editor vẫn nhập được Localized Text đa ngôn ngữ cho Product/CMS content (xem CONTEXT.md — `Localized Text`) — đó là dữ liệu khách hàng thấy trên storefront, khác với ngôn ngữ của giao diện Admin/CMS dùng để nhập liệu.

## Considered Options

- **Đa Locale cho cả 3 app**: bị từ chối vì chưa có nhân sự vận hành không biết tiếng Việt, và dịch toàn bộ UI Admin/CMS là chi phí lớn không tương xứng lợi ích trong giai đoạn hiện tại.
