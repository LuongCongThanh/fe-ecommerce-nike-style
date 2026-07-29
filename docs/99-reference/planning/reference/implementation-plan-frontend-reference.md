# Implementation Plan — Frontend Reference

> Bản tách này giữ phần Front-end của implementation plan cũ ở mức tham khảo. Nó không thay thế [`../../architecture/frontend/11-roadmap.md`](../../../01-delivery/architecture/frontend/11-roadmap.md).

## Cách dùng

- Dùng file này như checklist tham khảo khi cần nhìn một phase FE theo kiểu implementation plan dài hạn.
- Nếu cần thứ tự build kỹ thuật hiện hành, ưu tiên [`../../architecture/frontend/11-roadmap.md`](../../../01-delivery/architecture/frontend/11-roadmap.md).
- Nếu cần scope MVP chính thức, ưu tiên [`../../requirements/functional-requirements.md`](../../../00-core/requirements/functional-requirements.md).

## Các phase FE trong implementation plan cũ

### 7. Front-end Phase 0 — Discovery và Architecture

- Luồng trọng tâm: browse product, search, filter, view product, select variant, add to cart, update cart, checkout, track order, wishlist, account.
- Người dùng tham chiếu: guest, customer, member, admin, content editor, order operator.
- Tài liệu cần có: frontend overview, module architecture, routing, state management, api integration, authentication, authorization, design system, performance, testing.
- Deliverables: sitemap, user-flow diagrams, initial C4 container, FE architecture doc, API contract draft, initial ADRs.
- Acceptance criteria: mọi route rõ ràng, mọi data có owner, mọi feature biết server/client state, không có feature nào bắt đầu khi chưa rõ dữ liệu cần thiết.

### 8. Front-end Phase 1 — Monorepo và Engineering Foundation

- Setup tham khảo: Turborepo, Next.js, TypeScript strict, Tailwind CSS, ESLint, Prettier, Husky/Lefthook, commitlint, Storybook, Vitest, Playwright, MSW, environment validation, import boundaries, path aliases.
- Quality gates: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`.
- Acceptance criteria: storefront/admin/cms chạy độc lập, shared packages import đúng, không circular dependency, CI chạy được bộ lệnh nền.

### 9. Front-end Phase 2 — Design System Foundation

- Token layers tham khảo: Primitive -> Semantic -> Component.
- Foundation: color, typography, spacing, grid, radius, shadow, motion, iconography, breakpoint, elevation.
- Primitive components: button, input, textarea, checkbox, radio, switch, select, badge, tag, card, tabs, accordion, tooltip, dialog, drawer, toast, skeleton, pagination, breadcrumb, carousel.
- Layout components: container, grid, stack, inline, section, aspect ratio, page shell, sticky panel, responsive drawer.
- Storybook requirements: default, variants, disabled, loading, error, responsive, keyboard interaction, accessibility notes.
- Acceptance criteria: không hex trực tiếp, không spacing tùy ý, keyboard accessibility cơ bản, visual states đủ dùng.

### 10. Front-end Phase 3 — Application Shell

- Components tham khảo: announcement bar, utility navigation, main header, desktop navigation, mega menu, mobile navigation, predictive search, account menu, wishlist button, cart button, mini cart, footer, cookie banner.
- Routing tham khảo:

```text
app/
├── (marketing)/
├── (shop)/
├── (checkout)/
├── (account)/
└── api/
```

- Trạng thái chính: guest, authenticated, empty cart, cart with products, search open, menu open, mobile drawer, network error.
- Acceptance criteria: header chạy tốt desktop/mobile, mega menu hỗ trợ keyboard, search và cart drawer không xung đột focus, layout không gây CLS lớn.

### 11. Front-end Phase 4 — Homepage và Brand Commerce

- Homepage sections tham khảo: hero story, campaign banner, featured collection, trending products, product carousel, shop by sport, editorial story, membership banner, recommendation section, newsletter.
- Ý chính còn đáng giữ: section không hard-code nội dung trực tiếp; homepage nên đi qua content model thay vì nhúng data vào component.

### 12. Front-end Phase 5 — Catalog và PLP

- Features trọng tâm: category, filter, sort, pagination, listing performance, URL-as-state.
- Ý chính còn đáng giữ: URL phải giữ trạng thái tìm kiếm; state ownership giữa URL, server state, và local UI cần rõ từ đầu.

### 13. Front-end Phase 6 — Product Detail Page

- Trọng tâm: media gallery, variant selection, price/inventory theo SKU, add-to-cart guard.
- Ý chính còn đáng giữ: không cho add-to-cart khi chưa xác định được SKU hợp lệ.

### 14. Front-end Phase 7 — Search và Wishlist

- Search: predictive search, debounce, recent/trending search theo hướng tham khảo.
- Wishlist: add/remove/merge flow.
- Drift note: search cơ bản hiện đã thuộc Launch 1; search nâng cao mới để sau.

### 15. Front-end Phase 8 — Cart

- Features: cart item list, quantity update, remove item, pricing summary, coupon placeholder.
- Ý chính còn đáng giữ: server/mock phải là nguồn tính lại giá và availability, không để UI tự suy diễn.

### 16. Front-end Phase 9 — Checkout

- Flow tham khảo: contact -> address -> shipping -> review -> place order -> order success.
- Drift note: checkout MVP hiện là COD-only; mọi giả định payment gateway chỉ nên xem là hướng dài hạn.

### 17. Front-end Phase 10 — Authentication và Account

- Features tham khảo: sign up, sign in, forgot/reset password, account core, order history.
- Security principles: session-based auth, rate limit, reset token expiry, guard rõ ràng.

### 18. Front-end Phase 11 — Admin và CMS UI

- Admin tham khảo: product, category, inventory, order management.
- CMS tham khảo: hero banner, homepage sections, collection landing page, promotion banner, SEO metadata, blog, campaign.
- Drift note: scope chính thức hiện phải xem lại ở SRS và release slicing.

### 19. Front-end Phase 12 — Testing và Performance

- Các lớp test tham khảo: unit, component, integration với MSW, E2E, visual regression.
- Performance budgets tham khảo:

```text
LCP: < 2.5s
CLS: < 0.1
INP: < 200ms
JavaScript initial budget: theo route
Image size budget: theo component
```

- Acceptance criteria tham khảo: critical flow E2E xanh, không lỗi accessibility nghiêm trọng, route chính đạt mục tiêu Lighthouse, bundle analyzer không có dependency bất thường, không có hydration error.

## Đọc tiếp

- Thứ tự build kỹ thuật hiện hành: [`../../architecture/frontend/11-roadmap.md`](../../../01-delivery/architecture/frontend/11-roadmap.md)
- API integration hiện hành: [`../../architecture/frontend/07-api-integration.md`](../../../01-delivery/architecture/frontend/07-api-integration.md)
- Test coverage hiện hành: [`../../traceability/test-traceability-matrix.md`](../../../01-delivery/traceability/test-traceability-matrix.md)
