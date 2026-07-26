# Design System

## 3 tầng token [Đã chốt — brainstorm-session.md §8]

**Tầng 1 — Primitive** (`packages/design-tokens/{colors,spacing,typography,radius,shadow,motion,breakpoints}.ts`):

- Color: `black #111111`, `white #FFFFFF`, `gray100–400`, `red`, `green`
- Spacing: `0,4,8,12,16,20,24,32,40,48,64,80,120` — thiên về spacing lớn (48/64/80/120), ít dùng 16/24
- Typography size: `72,64,48,32,24,20,18,16,14,12`
- Radius: `none, xs(4), sm(8), md(12), lg(16), xl(24)`
- Motion duration: `200ms` (hover/image scale), `300ms` (fade), `400ms` (drawer)
- Breakpoints: `375, 768, 1024, 1280, 1440`

**Tầng 2 — Semantic** (map primitive → ý nghĩa): `background-primary`, `foreground-primary`, `foreground-muted`, `border-default`, `action-primary`, `action-hover`, `status-success`, `status-error`. Component dùng semantic token, không hard-code primitive (vd: Button dùng `action-primary`, không dùng `black`).

**Tầng 3 — Component tokens**: **không** khai báo tập trung trước. Mỗi component tự khai báo token riêng (`button-primary-background`, `card-background`...) ngay khi được build, tham chiếu semantic token — tránh đoán trước nhu cầu cho component chưa tồn tại (YAGNI, nhất quán với Decision #10).

**Cơ chế hiện thực hoá token [Đã chốt — Decision #23]**: token 3 tầng ở trên định nghĩa **giá trị** (TypeScript object trong `packages/design-tokens`), không tự nói token compile ra runtime style bằng gì. **Tailwind CSS v4 (`@theme`)** — token TypeScript trong `packages/design-tokens` là nguồn sự thật duy nhất, một script build sinh ra CSS custom properties (`--color-*`, `--spacing-*`, `--font-size-*`...) từ đó, và `apps/*` import file CSS đó vào cấu hình Tailwind v4 (`@theme` đọc trực tiếp custom property, không cần file `tailwind.config.ts` riêng theo cách v3). Component dùng utility class Tailwind trỏ vào token (`bg-action-primary`, không `bg-[#111111]`) — khớp với acceptance criteria "không hex trực tiếp" bên dưới. Lý do chọn Tailwind thay vì CSS-in-JS (vanilla-extract, styled-components): nhất quán với `packages/ui` dùng Radix primitives (không styling sẵn) + `shadcn`-style component (vốn build trên Tailwind), tránh runtime CSS-in-JS overhead ảnh hưởng mục tiêu Lighthouse > 95.

**Acceptance criteria** [Đã chốt, giữ từ `implementation-plan.md` vì hợp lý và không mâu thuẫn]: không dùng hex trực tiếp trong feature code; không dùng spacing tùy ý ngoài token.

> Typography (line-height, letter-spacing): **một bộ duy nhất** cho mọi Locale — xem ADR 0003 và [`i18n-locale.md`](./i18n-locale.md). Ràng buộc: font phải có đầy đủ glyph tiếng Việt.

## Animation & hiệu ứng thị giác nâng cao [Đề xuất]

Token motion (`200ms/300ms/400ms` ở Tầng 1) áp dụng cho **animation thông thường** (hover, fade, drawer) — hiện thực bằng CSS transition/Tailwind utility thuần, nhất quán với lý do chọn Tailwind ở Decision #23 (tránh runtime CSS/JS overhead ảnh hưởng Lighthouse).

Cho **hiệu ứng thị giác phức tạp hơn mức token thông thường đáp ứng được** (three.js cho 3D/particle background, Rombo cho animation component kiểu landing page) — dùng có chọn lọc theo nguyên tắc:

- Chỉ ở nơi hiệu ứng thực sự phát huy giá trị thương hiệu (Hero Home, trang editorial/story trong route group `(marketing)`) — quyết định dùng hay không cho từng vị trí cụ thể là judgment call lúc build component đó, không phải danh sách route cố định trước (nhất quán rule-of-three/YAGNI).
- **Không dùng trên critical path mua hàng** (PDP, PLP, Cart, Checkout) — nơi mục tiêu LCP < 2.5s/Lighthouse > 95 áp dụng nghiêm ngặt nhất và có traffic thật.
- Load qua `next/dynamic({ ssr: false })`, tách biệt hoàn toàn khỏi bundle chính — xem [`performance-seo.md`](./performance-seo.md#lazy-load-component-nặng-trong-cùng-route-đề-xuất).

**Không thuộc phạm vi tài liệu này**: công cụ hỗ trợ thiết kế lúc phát triển (vd Hallmark — Claude Code skill giúp tránh giao diện marketing trông "AI-generated") — đây là workflow tool, không phải runtime dependency, không cần quyết định kiến trúc.

## Tổ chức class Tailwind trong component [Đã chốt — Decision #33]

Quyết định Tailwind v4 ở trên (Decision #23) mới nói token compile bằng gì, còn chỗ đặt **class Tailwind trong component** là quyết định riêng (Decision #33). Hai phương án đã cân nhắc:

- **Inline trong JSX** (cách phổ biến nhất của cộng đồng Tailwind): `className="flex flex-col gap-4"` viết trực tiếp, dùng `cva` cho variant (đã ngụ ý ở hợp đồng Storybook "Variants" bên dưới). Ưu điểm: giữ nguyên lợi ích cốt lõi của Tailwind — markup và style nằm cùng một chỗ, không phải nhảy file để biết một element trông thế nào; ít boilerplate hơn cho component đơn giản.
- **Co-located `{component}.styles.ts`**: mọi class Tailwind của component tách ra file riêng, export named string/`cva` config, JSX chỉ tham chiếu (`styles.header`). Ưu điểm: tách biệt rõ style khỏi logic render khi component phức tạp (nhiều variant, nhiều trạng thái).

**Đã chọn**: mặc định **inline trong JSX + `cva` cho variant** (đơn giản hơn, nhất quán YAGNI/Foundation-first đã chọn — Decision #10), chỉ tách ra `{component}.styles.ts` khi một component có đủ độ phức tạp thật sự cần (nhiều trạng thái/variant khiến JSX khó đọc) — áp dụng rule-of-three tương tự component/hook, không áp quy ước tách file trước cho toàn bộ design system.

## Phân tầng component [Đã chốt — Decision #12, hình thức hoá]

```
design-tokens
    ↓
packages/ui           → Button, Input, Card, Modal, Drawer, Tabs, Badge, Skeleton,
                         Toast, Pagination, Tooltip
                         + primitive bố cục: Container, Grid, Stack, Section
    ↓
packages/commerce      → ProductCard, ProductGallery, MiniCart, CheckoutStepper,
                         CouponInput, OrderTimeline, SizeSelector, ColorSelector
    ↓
apps/*/Header, Footer  → cụ thể riêng từng app (KHÔNG dùng chung, KHÔNG lên package)
    ↓
apps/*/features        → ghép ui + commerce + layout thành page thật
```

Lý do Header/Footer không lên package (Decision #12): khác nhau nhiều giữa storefront/admin/cms (mega menu + locale switcher cho storefront, sidebar nav cho admin/cms) — ép chung sẽ tạo abstraction giả, và đối chiếu `implementation-plan.md` cũng không tách package `layouts` riêng.

## Hợp đồng Storybook mỗi component [Đề xuất — adopted from `implementation-plan.md`, không mâu thuẫn]

Mỗi component trong `packages/ui` và `packages/commerce` phải có story cho:

- Default
- Variants
- Disabled
- Loading
- Error
- Responsive (tối thiểu breakpoint mobile + desktop)
- Keyboard interaction
- Ghi chú accessibility

Đây là điều kiện để một component được coi là "xong" trong giai đoạn Foundation-first, không phải chỉ dựng UI xong là đủ.
