# Hợp đồng visual storefront

Owner: maintainer; đối chiếu CSS, root layout, homepage và login ngày 18/11/2026. Đây là narrative design contract; giá trị chính xác nằm trong `src/styles/theme.css`, `preset.css`, `login.css`. Không chép token số sang tài liệu để tạo nguồn thứ hai.

## Ý đồ và hierarchy

ANTIGRAVITY.STORE là cửa hàng thời trang Việt Nam có cảm giác bình tĩnh, đáng tin, ưu tiên ảnh và quyết định mua hàng rõ ràng. Tham khảo editorial commerce, không sao chép Nike identity/copy/assets. Nội dung, hierarchy và khả năng dùng quan trọng hơn decoration.

Be Vietnam Pro là font body/display, tải từ next/font ở root layout với subsets latin/vietnamese và font swap. Dùng type roles/token hiện có, cân nhắc dấu tiếng Việt và chuỗi tiếng Anh dài; không dùng chữ display làm body. Primary action rõ, secondary action ít cạnh tranh; giữ focus/disabled/loading semantics.

Nền paper/ink và warm neutrals tạo bề mặt. Brand red dành cho price/sale/promo, không navigation hoặc CTA tổng quát; trust blue cho ngữ cảnh tin cậy và action phù hợp. Primary CTA dùng semantic primary theo component, không mặc định tô đỏ mọi nút. Giá trị OKLCH/palette, radius, container breakpoint, spacing và typography theo CSS; base radius hiện 0.5rem nhưng component có thể dùng shape chủ ý riêng.

Dark mode đổi cả surface/text/border/accent/contrast qua semantic tokens, không chỉ đảo nút đen thành trắng. Root ThemeProvider mặc định light, system tự động tắt; không mô tả mọi route đã có switch UI. Hero/WebGL đọc token thay hardcode màu. Không đổi locked palette vì một comp riêng.

## Composition đang ship

Homepage route `src/app/[locale]/(shop)/home/page.tsx`:

1. Hero: ảnh/câu chuyện và CTA trong DOM; enhancement 3D có fallback.
2. Featured categories: điều hướng khám phá từ catalog.
3. Editorial collection: nhịp kể chuyện giữa nhóm hàng.
4. New arrivals: dữ liệu sản phẩm API thật.
5. Why choose us: thông tin tạo tin cậy.
6. Newsletter: feedback form rõ ràng.

Flash Sale, Best Sellers và Testimonials không render trong route hiện tại. Không tự tạo discount, stock, review/testimonial hoặc trust claim thiếu căn cứ. CMS/gateway/email thật chỉ được tuyên bố khi có integration evidence. Header/footer/navigation do `src/layouts` sở hữu, không đưa vào home feature chỉ để khớp comp.

PLP ưu tiên scan ảnh/giá và filter/sort rõ; mobile filter không che mất context hoặc làm khó đóng. PDP ưu tiên ảnh, variant, giá và availability từ API. Out-of-stock/loading/error/empty phải có hierarchy và thông báo riêng; UI không tính nghiệp vụ để bù transport thiếu.

## Login và responsive

Login dùng `src/styles/login.css` cùng implementation auth: giữ visual storefront, responsive composition và form readability. Các mô tả sync login admin/CMS/packages trước đây là provenance lịch sử, không phải bằng chứng ba repo hiện đồng bộ. Không nhập lại shared-package theme vào app root.

Desktop có khoảng thở cho ảnh; mobile ưu tiên nội dung, target size và bàn phím. Giữ container/section rhythm được đặt tên trong theme, tránh padding đồng loạt làm mất phân cấp. Card ảnh không thay thế accessible link/control. Loading cục bộ không phủ toàn trang cho một mutation nhỏ; toast và inline feedback không lặp.

## Commerce interaction checks

Navigation nhóm category theo cách người mua khám phá, không theo cấu trúc database. Mega menu chỉ dùng khi hierarchy và label đủ rõ; mobile cần drill-down, back, close và touch target dễ dùng. Search giữ query, loading, empty và error rõ ràng; không giả định autocomplete khi chưa có data. Filter, sort và page nằm trong URL để chia sẻ và dùng back/forward; mobile filter có apply/reset/count và trả focus đúng chỗ.

Product card ưu tiên ảnh nhất quán, tên, giá và variant; không cạnh tranh bằng badge hoặc urgency giả. Giá gạch, discount, stock, shipping, return, payment và trust claim chỉ hiển thị khi có nguồn xác thực. PDP cho biết lý do action disabled và không báo thành công trước server. Kiểm tên dài, thiếu ảnh, hết hàng, lỗi có thể xử lý, semantic control, keyboard, alt, contrast và touch target. Motion/3D chỉ nâng cấp; nội dung, CTA và hành vi mua hàng vẫn đầy đủ khi ảnh, canvas hoặc animation thất bại.

## Motion, accessibility và review

Motion giải thích hierarchy/continuity hoặc phản hồi thao tác; dùng Framer Motion hiện có trước khi thêm kỹ thuật. Root MotionConfig reducedMotion=user; từng interaction vẫn cần kiểm reduced motion, focus/keyboard, semantic control, alt và contrast. Không scroll-jacking hoặc ép autoplay media.

3D hiện ở Hero và PDP. [Architecture](docs/architecture/README.md#3d-trong-storefront) sở hữu gate, disposal, shader pitfalls và baseline LCP. Scene là enhancement pixel, DOM giữ commerce/ARIA/focus; failure không chặn mua hàng. Surface mới cần lý do và quyết định riêng; không phát tán 3D sang grid/filter/cart/auth/checkout.

Khi sửa UI đọc [workflow](docs/agents/ui-workflow.md), inspect route/data/messages, xác định desktop/mobile và loading/empty/error/unavailable/reduced-motion, rồi kiểm browser với viewport/state cụ thể. Pattern mới không tự đổi contract đã chấp nhận.
