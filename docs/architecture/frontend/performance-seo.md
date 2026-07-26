# Performance & SEO

## Mục tiêu [Đã chốt — brainstorm-session.md §2, Assumption #1]

| Metric | Target |
|---|---|
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 200ms |
| Lighthouse | > 95 |

Áp dụng cho `storefront` (app hướng khách hàng, có SEO/traffic thật). `admin`/`cms` là công cụ nội bộ — **[Đã chốt — Decision #27]** không cần budget này nghiêm ngặt như storefront, để tránh over-engineering cho app không có traffic công khai; ngưỡng lỏng hơn nhưng vẫn đo được: LCP < 4s, INP < 500ms, không yêu cầu điểm Lighthouse tổng thể (chỉ chạy trên mạng nội bộ/VPN, không cần tối ưu cho mobile 3G như storefront).

## Font-loading [Đã chốt — Decision #26, hệ quả trực tiếp của ADR 0003]

ADR 0003 yêu cầu một font bold/condensed phong cách thể thao, phủ đủ dấu tiếng Việt — ràng buộc này có hệ quả performance cụ thể cần xử lý ở `storefront` (nơi có mục tiêu LCP/CLS nghiêm ngặt):

- **Self-host font** (không load từ Google Fonts runtime) — tránh round-trip DNS/TLS thêm tới domain bên thứ ba, kiểm soát được cache-control.
- **Subset theo bộ ký tự thực dùng** (Latin + đầy đủ tổ hợp dấu tiếng Việt: `Ầ`, `Ộ`, `Ẫ`, `Ự`...) — giảm kích thước file so với bộ glyph đầy đủ của font gốc.
- **`font-display: optional` hoặc `swap`** tuỳ đánh đổi giữa tránh FOIT và tránh layout shift khi font thật load xong — vì typography Nike-style dùng size lớn (48–72px ở Heading/Display), chênh lệch giữa fallback font và font thật ở các size này dễ gây CLS đáng kể; cần đo CLS thực tế với cả hai giá trị trước khi chốt.
- **Preload** file font chính (weight/style dùng ở above-the-fold: Hero, H1 PDP) bằng `<link rel="preload">`, không preload toàn bộ family nếu chỉ 1–2 weight xuất hiện above-the-fold.
- Việc kiểm tra đủ glyph tiếng Việt (đã là acceptance criteria ở ADR 0003/`roadmap.md` Phase 1) và việc đo CLS khi font thật thay thế fallback là hai bước riêng — không coi "đủ glyph" đã bao hàm "không gây layout shift".

## Kỹ thuật tối ưu cho storefront [Đề xuất — tổng hợp từ tài liệu tham khảo, không mâu thuẫn]

- Image optimization (Next.js Image, đúng kích thước cho mỗi breakpoint đã chốt ở `design-system.md`).
- Code splitting theo route group.
- ISR cho trang có nội dung đổi chậm (Home, Category, PDP) — cụ thể route nào dùng ISR/SSR/CSR là quyết định khi implement từng page, không thuộc phạm vi tài liệu kiến trúc này.
- Hero/Product Card không gây layout shift (nhất quán acceptance criteria đã có trong `implementation-plan.md` cho Application Shell/PLP, giữ vì hợp lý và đo được bằng CLS).

## Lazy-load component nặng trong cùng route [Đề xuất]

Code splitting theo route (mục trên) không tách được component nặng nằm chung một trang. Áp dụng cho: rich text/block editor của `cms` (Hero/Banner/Blog), data table lớn của `admin` (danh sách sản phẩm/đơn hàng nhiều dòng), modal/drawer lớn của `storefront` (size guide, quick view), và hiệu ứng thị giác nâng cao ở trang marketing/Home (three.js, Rombo — xem [`design-system.md`](./design-system.md#animation--hiệu-ứng-thị-giác-nâng-cao-đề-xuất)).

- Dùng `next/dynamic` với `{ ssr: false }` khi component chỉ cần chạy client (editor, chart) và không ảnh hưởng SEO.
- Ưu tiên lazy-load theo tương tác (mở modal, click "chỉnh sửa nội dung") thay vì lazy-load ngay khi trang mount.
- Không áp dụng cho mọi component — chỉ component vượt ngưỡng kích thước bundle rõ ràng (đo bằng `@next/bundle-analyzer`), tránh chia nhỏ quá mức làm tăng số network request nhỏ lẻ (nhất quán YAGNI).

## SEO đa Locale [Đề xuất — hệ quả trực tiếp của Decision #17/#18]

Vì chỉ `storefront` có đa Locale UI (ADR 0002) và dùng `app/[locale]/...` (Decision #18):

- Mỗi trang public của `storefront` cần `hreflang` alternate cho `vi`/`en` trỏ đúng URL locale tương ứng.
- Structured data (Product, Breadcrumb) render theo Locale hiện tại của trang, dùng Localized Text đã fallback đúng (xem [`i18n-locale.md`](./i18n-locale.md)) — không bao giờ render trường trống khi thiếu bản dịch (Decision #16).
- `admin`/`cms` không cần `hreflang`/structured data — không phải nội dung public, không index.

## Không thuộc phạm vi tài liệu này

Chọn CDN/hosting cụ thể — brainstorm-session.md xác nhận CI/CD & hosting "chưa quyết định" (Assumption #5).
