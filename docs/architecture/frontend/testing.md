# Testing Strategy

Công cụ [Đề xuất — cả 3 tài liệu tham khảo (`vision-sketch.md`, `nike-ui-ux-analysis.md`, `implementation-plan.md`) đều đồng thuận, không có mâu thuẫn nào cần bạn quyết định]: **Vitest** (unit + component), **Playwright** (E2E), **MSW** (integration, dùng chung handler với dev), **Storybook** (visual states — xem [`design-system.md`](./design-system.md)).

**Visual regression** [Đã chốt — Decision #25, lấp khoảng trống với `roadmap.md` Phase 8]: dùng **Playwright screenshot comparison** (`toHaveScreenshot()`, built-in, không thêm dịch vụ trả phí) chụp story quan trọng của từng component trong `packages/ui`/`packages/commerce` và các trang critical path, chạy trên CI. Chọn Playwright thay vì Chromatic/Percy vì đã có sẵn trong stack cho E2E (không thêm công cụ mới), phù hợp solo dev không cần dashboard review cộng tác. Có thể cân nhắc Chromatic sau nếu cần review UI qua link chia sẻ (không phải nhu cầu hiện tại).

## Test pyramid

```
E2E (Playwright)              → Critical path người dùng thật, chạy trên CI
        ↑
Integration (Vitest + MSW)    → Feature flow qua mock API thật (không mock fetch thủ công)
        ↑
Component (Vitest + Storybook)→ ProductCard, SizeSelector, CartItem, CouponInput...
        ↑
Unit (Vitest)                 → Pure function: price formatting, variant selection logic,
                                 Localized Text fallback, filter serialization, zod schema
```

## Accessibility tooling [Đề xuất]

"Ghi chú accessibility" trong hợp đồng Storybook ([`design-system.md`](./design-system.md)) là điều kiện thủ công, cần một gate tự động đi kèm để không bị trôi theo thời gian khi feature tăng lên:

- **Storybook a11y addon** (`@storybook/addon-a11y`) chạy trên mọi story `packages/ui`/`packages/commerce`, fail CI nếu có lỗi mức critical/serious.
- **`axe-core` qua Playwright** (`@axe-core/playwright`) chạy trên các trang thuộc Critical path bên dưới — không thay thế audit thủ công (contrast màu thật, screen reader thật) nhưng bắt được phần lớn lỗi phổ biến (missing alt, contrast, ARIA sai) sớm hơn Phase 8.

## Critical path cho MVP [Đề xuất — điều chỉnh từ `implementation-plan.md`, bỏ bước payment gateway vì Decision #7: MVP chỉ COD]

```
Browse → PDP → Chọn variant → Add to cart → Checkout (COD) → Order success
```

Các flow khác cần E2E riêng: Search, Apply filter, Sign in/up (trong MVP — Decision #20, xem [`authentication-authorization.md`](./authentication-authorization.md)), Wishlist toggle, Admin cập nhật sản phẩm, CMS publish Hero/Banner/Blog/Campaign (phạm vi CMS Phase 1 đã chốt — Decision #21, xem [`roadmap.md`](./roadmap.md)).

## Acceptance criteria chung cho một feature được coi là "test xong"

- Unit test cho logic thuần (không cần mock React).
- Component test cho mọi trạng thái quan trọng: loading, empty, error (nhất quán hợp đồng Storybook).
- Story a11y addon không có lỗi mức critical/serious (xem "Accessibility tooling" ở trên).
- Integration test qua MSW cho luồng chính + luồng lỗi (vd: out-of-stock, coupon invalid).
- E2E chỉ bắt buộc cho flow nằm trong "Critical path" ở trên — không bắt buộc E2E cho mọi feature (tránh chi phí test vượt quá lợi ích cho một solo dev).

## Không thuộc phạm vi tài liệu này

Cấu hình CI cụ thể (GitHub Actions, quality gates `pnpm lint/typecheck/test/build`) là quyết định triển khai, để dành cho lúc scaffold code thật — brainstorm-session.md §1 xác nhận CI/CD & hosting "chưa quyết định, để giai đoạn sau" (Assumption #5).
