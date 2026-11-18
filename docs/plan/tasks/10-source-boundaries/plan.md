# Kế hoạch rà và đơn giản hóa ranh giới source

1. Kiểm kê import và consumer; phân biệt alias endpoint với service có side effect/fallback.
2. Query gọi thẳng endpoint SDK cho address, profile, reservation và order; giữ auth orchestration và getOrderOrNull.
3. Đưa form schema về auth/account, badge về catalog; bỏ schema/filter và alias không còn consumer. Giữ transport và validation.
4. Rà toàn bộ import nội bộ và ranh giới shared/API; ghi lại cross-feature seam thay vì chuyển toàn bộ vào shared.
5. Chạy test hành vi hiện có, lint/format/typecheck/build; ghi resolution và giới hạn.

Không đổi branch, API, URL, query key, cache invalidation, session, ngưỡng validation hay browser flow.
