# FE UI Design Contract

> Phase 1 output của `FE-UI-IMPROVEMENT-PLAN.md`. Đây là quyết định thiết kế đã chốt, không phải nguồn token — mọi giá trị màu/font tham chiếu `packages/design-tokens` và `packages/tailwind-config` (canonical). File này không định nghĩa token song song.
>
> Nếu có mâu thuẫn, thứ tự ưu tiên vẫn là functional requirements, glossary, ADR, decision log, `FE.md`, `FE-ARCHITECTURE.md`, `FE-EXECUTION.md`, rồi `FE-UI-IMPROVEMENT-PLAN.md`.

## 1. Genre

**Retail editorial/sport** — dùng chung cho cả 3 app, nhưng thể hiện khác nhau theo mục đích:

- Storefront: photographic, editorial, sản phẩm là trung tâm hình ảnh.
- Admin/CMS: workbench/utilitarian, không mang tính marketing.

## 2. Macrostructure family

| App        | Trang                                        | Macrostructure                    |
| ---------- | -------------------------------------------- | --------------------------------- |
| Storefront | Marketing/home                               | Photographic / catalogue          |
| Storefront | Commerce (product, category, cart, checkout) | Product-led workbench / catalogue |
| Admin      | Toàn bộ                                      | Workbench                         |
| CMS        | Toàn bộ                                      | Workbench                         |

Không dùng macrostructure kiểu "AI landing page" (hero → grid đều → benefit cards → testimonial → newsletter → footer lặp lại nguyên khối) cho homepage — xem Phase 3.

## 3. Typography

- Be Vietnam Pro là font duy nhất cho cả body và display, theo [ADR 0003](../00-core/adr/0003-single-typography-token-set-across-locales.md).
- Một bộ typography token duy nhất cho mọi locale (không override theo locale).
- Không chọn font khác dưới bất kỳ lý do "phù hợp tone" nào — điều này đã bị khóa bởi ADR, không mở lại ở Phase 3/4.

## 4. Màu sắc

Tham chiếu `packages/design-tokens/src/colors.ts` và `packages/tailwind-config/src/theme.css`. Không tạo palette song song.

- **`brand` (hue 25, cam-đỏ)** là màu canonical cho giá, sale, khuyến mãi. Đây là action colour giới hạn — **không** dùng làm màu nút hành động chung (primary CTA vẫn dùng token `primary`/`primary-foreground`).
- **`accent` (hue 55)** hiện trùng vai trò với `brand` trong `semantic.ts` (`accentHighlight = accent[500]`). Quyết định: `accent` chỉ dùng cho nhấn nhá UI phi thương mại (badge trạng thái, highlight nhẹ); mọi thứ liên quan đến giá/sale/promotion bắt buộc dùng `brand`. Không thêm hue thứ ba.
- **Surface**: không còn `oklch(1 0 0)` (trắng tuyệt đối) trong `--background`/`--card`/`--popover` — đã chuyển sang `neutral-50` (`oklch(0.98 0.004 30)`) ở Phase 2. Mọi surface mới phải dùng token `background`/`card`/`popover`/`muted`, không viết `bg-white` trực tiếp.
- **Neutral** (hue 30, warm gray) là nền tảng cho text, border, muted surface.

## 5. CTA voice

- Primary CTA: động từ hành động ngắn, không hỏi ("Mua ngay", "Xem sản phẩm" — không "Bạn có muốn mua không?").
- Không dùng CTA rỗng nghĩa kiểu "Tìm hiểu thêm" khi có thể nói rõ hành động ("Xem toàn bộ ưu đãi", "Xem bộ sưu tập").
- CTA label luôn giữ trên một dòng ở mọi breakpoint bắt buộc (320–1440px).
- Không dùng nhãn số liệu giả trong CTA hoặc gần CTA (ví dụ "Hơn 10,000 khách hàng tin dùng" khi không có nguồn) — xem Phase 5.

## 6. Section rhythm

- Không lặp lại đúng một loại "equal-card grid" ở nhiều section liên tiếp (tối thiểu 3 mức spacing/role khác nhau theo Phase 3 exit criteria).
- Không căn giữa nhiều section liên tiếp — bias trái cho hero và editorial strip, giữ symmetry chỉ cho grid sản phẩm thuần.
- Mỗi section có một vai trò rõ: hero (photographic), category rail, flash sale (treatment riêng, không lặp voice product-grid), best sellers (grid chính duy nhất), new arrivals (editorial strip/spotlight), service benefits (typographic strip, không icon-tile đều), testimonials (chỉ khi có dữ liệu thật), newsletter/footer.

## 7. Navigation & footer family

- **Header**: retail masthead hai tầng hoặc category-led navigation — không dùng mẫu "wordmark + vài link + button phải" (N1a) làm mặc định vì storefront có nhiều điểm đến (category, search, cart, account).
- **Footer**: bỏ mẫu 4-cột SaaS mặc định (brand blurb + 3 cột link + copyright nhỏ) làm cấu trúc chính — chuyển sang brand statement lớn hoặc newsletter-first close, gom Mua sắm/Tài khoản/Hỗ trợ thành một utility area cô đọng, tách legal/copyright thành hàng riêng. Chi tiết implementation ở Phase 4.

## 8. Brand name

Một brand name duy nhất cho toàn bộ storefront: **`ANTIGRAVITY.STORE`**.

- Lý do chọn: đây là tên đã dùng trong JSON-LD (`WebSite`, `Product.brand`), `<title>` metadata, Header, MobileNav — tức là đã là brand chính thức theo SEO/schema. `SHOP.VN` chỉ xuất hiện lẻ trong `Footer.tsx` (brand mark, email, copyright) — đây là drift cần sửa, không phải một brand thứ hai hợp lệ.
- Đã áp dụng: `Footer.tsx` brand mark, email hỗ trợ (`support@antigravity.store`), dòng copyright.
- Không dùng "SHOP.VN" ở bất kỳ nơi nào khác trong codebase kể từ Phase 1.

## 9. Nguyên tắc bất biến (không mở lại ở phase sau)

1. Không tạo token màu/font song song với `packages/design-tokens` + `packages/tailwind-config`.
2. Không đổi font khỏi Be Vietnam Pro (ADR 0003).
3. Admin/CMS UI chỉ tiếng Việt (ADR 0002) — không áp dụng cho nội dung do Content Editor nhập.
4. `brand` hue chỉ dùng cho giá/sale/promotion, không dùng làm action colour chung.
5. Một brand name duy nhất: `ANTIGRAVITY.STORE`.
