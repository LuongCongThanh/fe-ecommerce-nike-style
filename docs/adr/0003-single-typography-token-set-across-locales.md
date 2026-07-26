# Một bộ typography token duy nhất cho mọi Locale (không override theo locale)

Status: accepted

Typography Nike-style (BOLD + BIG + UPPERCASE, line-height chặt ở các size Heading/Display 72/64/48px) có rủi ro thật với tiếng Việt: chữ hoa có dấu (Ầ, Ộ, Ẫ, Ự...) cần nhiều không gian dọc hơn Latin thường, dễ bị cắt/đè dòng khi line-height quá chặt. `storefront` cho phép chuyển Locale ngay trong phiên (không build riêng theo locale), nên override token riêng theo locale (line-height/letter-spacing khác nhau giữa `vi`/`en`) sẽ gây layout nhảy khi đổi ngôn ngữ. Quyết định: dùng **một bộ typography token duy nhất**, line-height đã tính dư khoảng trống an toàn cho dấu tiếng Việt, áp dụng cho cả `vi` và `en` — chấp nhận `en` không chặt tuyệt đối như bản gốc Nike để đổi lấy sự nhất quán layout.

Ràng buộc đi kèm: font chữ được chọn cho hệ thống (bold/condensed, phong cách thể thao) phải được kiểm tra có đầy đủ bộ dấu tiếng Việt trước khi đưa vào `packages/design-tokens` — nhiều font thể thao phương Tây thiếu glyph tiếng Việt.

## Considered Options

- **Override typography token theo Locale** (`en` giữ line-height chặt bản gốc, `vi` nới hơn): bị từ chối vì gây layout shift khi user đổi locale trong cùng phiên.
