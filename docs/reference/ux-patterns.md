# UX patterns tham khảo

Status: reference; owner maintainer. Rút từ phân tích Nike trước đây để giữ lý do hữu ích cho commerce. Đây không phải spec, design contract hay kiến trúc hiện tại. Không sao chép identity, copy, assets hoặc hierarchy của Nike. [Design](../../design.md) quyết định visual; [overview](../overview.md) quyết định capability.

## Navigation và cognitive load

Nhóm category theo cách người mua khám phá, không theo cấu trúc database. Mega menu chỉ có ích khi hierarchy và label đủ rõ; mobile cần drill-down/back/close và touch target dễ dùng. Không nhồi mọi campaign vào navigation. Giữ đường quay về category, search và cart dễ tìm.

## Hero và ảnh

Hero kể một ý với CTA cụ thể; sản phẩm/collection là trọng tâm. Text và CTA phải đọc được khi ảnh chưa tải hoặc canvas lỗi. Ưu tiên ảnh LCP thực sự, đặt kích thước để tránh layout shift, không eager-load cả carousel. Poster/static image là phần trải nghiệm hoàn chỉnh; motion/3D chỉ nâng cấp.

## Product card và grid

Ảnh nhất quán giúp scan; tên/giá/variant không cạnh tranh bằng nhiều badge. Giá gạch/discount chỉ xuất hiện khi data xác thực. Grid responsive cân bằng kích thước ảnh và lượng thông tin; kiểm tên dài, thiếu ảnh và sản phẩm hết hàng. Tách action wishlist khỏi product link bằng semantic controls.

## PLP/filter/search

Desktop có thể giữ filter sidebar và sort gần results; mobile dùng drawer/sheet có apply/reset/count rõ, focus return và trạng thái lựa chọn nhìn thấy. URL giữ filter/sort/page để chia sẻ/back-forward. Search cần query rõ, feedback loading/empty/error và gợi ý có data; không giả định autocomplete hoặc search engine đã triển khai.

Không giấu toàn bộ results khi một filter request đang chờ nếu có thể giữ context. Category hierarchy/breadcrumb giúp hiểu phạm vi. Filter giá/size/màu và sort phải khớp API semantics, không xếp hạng từ fixture để bù endpoint thiếu.

## PDP và commerce trust

Ảnh, chọn variant, giá và availability là các quyết định chính. Shipping/return/payment information phải có nguồn và đúng policy; không tạo urgency/countdown hoặc testimonial giả. Cho người mua biết vì sao action disabled. Giỏ/quote/order phải hiển thị lỗi có thể xử lý, không báo thành công trước server.

## Semantic tokens và accessibility

Dùng token cho surface/text/border/action và dark mode, không nhân bản palette nghiên cứu. Font dễ đọc với tiếng Việt, hierarchy ít cấp và spacing có mục đích. Keyboard/focus/ARIA/alt/contrast/touch targets phải được kiểm; drawer/dialog quản lý focus. Reduced motion giữ ý nghĩa và toàn bộ thao tác, không chỉ tắt một animation.

## Giới hạn của reference

Các đề xuất cũ về database, scaling, microservice, CMS, component tree hay stack không được chuyển thành backlog. UX không quyết định API/module hoặc readiness. Đánh giá pattern bằng business goal, source data và browser evidence của storefront hiện tại.
