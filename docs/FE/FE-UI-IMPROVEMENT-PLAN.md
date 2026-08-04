# FE UI Improvement Plan

> Kế hoạch cải thiện UI cho `storefront`, `admin` và `cms`, được lập từ kết quả Hallmark audit ngày 2026-08-04.
>
> Tài liệu này là execution plan. Nếu có mâu thuẫn, thứ tự ưu tiên vẫn là functional requirements, glossary, ADR, decision log, `FE.md`, `FE-ARCHITECTURE.md`, rồi `FE-EXECUTION.md`.

## 1. Mục tiêu

- Storefront không còn Hallmark finding mức `critical`.
- Giữ nguyên routes, logic commerce, data flow và component ownership hiện có.
- Tiếp tục dùng Be Vietnam Pro cho body và display theo ADR 0003.
- Dùng token system hiện có trong `packages/design-tokens` và `packages/tailwind-config`; không tạo nguồn token song song.
- Storefront, Admin và CMS có cùng design language nhưng dùng macrostructure phù hợp với mục đích từng app.
- Không hiển thị social proof, metric hoặc testimonial giả như dữ liệu production.
- Đạt responsive baseline tại 320, 375, 414, 768 và 1440 px.

## 2. Ngoài phạm vi

- Không thay đổi business logic, API contract, authentication hoặc authorization.
- Không thay đổi route tree hoặc xóa production components nếu chưa có xác nhận riêng.
- Không chọn lại font family trái với ADR 0003.
- Không triển khai backend hoặc dữ liệu review/testimonial thật trong kế hoạch UI này.
- Không đặt timeline theo tuần/tháng; tiến độ được kiểm soát bằng phase và exit criteria.

## 3. Hiện trạng audit

### Critical

- Homepage có structural fingerprint dạng template: hero → category grid → nhiều product grid giống nhau → benefit cards → testimonial cards → newsletter → footer.
- Header mang cấu trúc AI nav phổ biến.
- Footer mang cấu trúc bốn cột SaaS phổ biến.
- Background, card và popover dùng trắng tuyệt đối.

### Major

- Có metric, rating, review và testimonial mock nhưng hiển thị như bằng chứng thật.
- Benefits dùng equal icon-tile cards.
- Nhiều section liên tiếp căn giữa.
- Product/category images cùng dùng `hover:scale-105`.
- Shared button dùng `transition-all`.
- Giá và rating chưa dùng tabular numerals.

### Rendering gaps

- Trust badges trên hero dùng foreground tối trên ảnh nền tối.
- Admin và CMS hiện mới là implementation scaffold, chưa có application shell hoàn chỉnh.
- Admin/CMS chưa render được product data ổn định khi chạy độc lập do API mocking/CORS.

## 4. Nguyên tắc triển khai

1. Thay đổi nhỏ, có thể kiểm chứng; không rebuild toàn bộ app trong một lượt.
2. Sửa visual correctness trước structural redesign.
3. Shared primitives được sửa trước khi polish page-level components.
4. Storefront ưu tiên retail/editorial-photographic; Admin/CMS ưu tiên workbench/utilitarian.
5. Mọi màu và font phải đi qua token hiện có.
6. Motion chỉ truyền đạt hierarchy hoặc state; không animate để trang trông “sống động”.
7. Mọi clickable label phải giữ trên một dòng.
8. Không tạo social proof để lấp khoảng trống layout.

## 5. Phase 1 — Khóa design contract

### Công việc

- Chốt genre chung: retail editorial/sport.
- Chốt macrostructure family:
  - Storefront marketing/home: photographic/catalogue.
  - Storefront commerce pages: product-led workbench/catalogue.
  - Admin/CMS: workbench.
- Ghi rõ Be Vietnam Pro là font duy nhất theo ADR 0003.
- Giữ cam-đỏ cho giá, sale và promotion; không dùng làm action colour chung.
- Chuyển surface trắng tuyệt đối sang neutral ấm hiện có.
- Chốt CTA voice, section rhythm, navigation và footer family.
- Chọn một brand placeholder duy nhất thay cho `ANTIGRAVITY.STORE` và `SHOP.VN`.
- Nếu tạo `design.md`, file này chỉ tham chiếu token canonical; không định nghĩa lại một token source song song.

### Exit criteria

- Design contract không mâu thuẫn với ADR hoặc `packages/design-tokens`.
- Có quy tắc rõ cho header, footer, cards, spacing và motion.
- Brand name dùng nhất quán trong toàn bộ app.

## 6. Phase 2 — Visual correctness và shared primitives

### Công việc

1. Sửa trust badge foreground thành inverse colour hoặc đặt badge trên một surface có contrast phù hợp.
2. Rút ngắn hero entrance; reduced-motion phải hiển thị nội dung tức thời.
3. Thay trắng tuyệt đối trong semantic surface bằng neutral ấm.
4. Thay `transition-all` trong shared primitives bằng danh sách thuộc tính cụ thể.
5. Focus ring phải xuất hiện tức thời và đạt contrast tối thiểu 3:1.
6. Thêm `tabular-nums` cho giá, rating, quantity, ngày và metric dạng bảng.
7. Kiểm tra CTA và navigation labels không wrap.

### Files dự kiến

- `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/TrustBadgeList.tsx`
- `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionHero.tsx`
- `packages/tailwind-config/src/preset.css`
- `packages/tailwind-config/src/theme.css`
- `packages/ui/src/components/Button.tsx`
- `apps/storefront/src/app/[locale]/(shop)/_lib/components/common/ProductCard.tsx`

### Exit criteria

- Hero, subtitle, CTA và trust badges đọc rõ trên ảnh nền.
- Không có focus ring bị transition chậm.
- Shared button không còn `transition-all`.
- Không có horizontal overflow tại các breakpoint bắt buộc.

## 7. Phase 3 — Homepage structural redesign

### Cấu trúc đề xuất

1. **Header** — retail masthead hoặc category-led navigation.
2. **Hero** — photographic, bias trái, một primary CTA rõ ràng.
3. **Featured categories** — catalogue rail hoặc asymmetric category grid.
4. **Flash Sale** — treatment riêng, không lặp product-grid voice thông thường.
5. **Best Sellers** — product grid chính duy nhất của homepage.
6. **New Arrivals** — horizontal editorial strip hoặc spotlight 60/40.
7. **Service benefits** — typographic strip, không dùng equal icon cards.
8. **Testimonials** — chỉ render khi có dữ liệu xác thực.
9. **Newsletter/Footer** — newsletter-first hoặc statement close.

### Files dự kiến

- `apps/storefront/src/app/[locale]/(shop)/home/page.tsx`
- `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionHero.tsx`
- `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionFeaturedCategories.tsx`
- `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionFlashSale.tsx`
- `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionBestSellers.tsx`
- `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionNewArrivals.tsx`
- `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionWhyChooseUs.tsx`
- `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionTestimonials.tsx`
- `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionNewsletter.tsx`

### Exit criteria

- Không còn chuỗi section toàn equal-card grids.
- Có ít nhất ba mức section spacing theo vai trò.
- Homepage có một visual focal point rõ sau hero.
- Product browsing và CTA routes không thay đổi.
- Không xóa component nếu chưa có xác nhận file-level riêng.

## 8. Phase 4 — Header, footer và component voice

### Header

- Chuyển sang retail masthead hai tầng hoặc category-led navigation.
- Giữ nguyên search, cart, mega menu và mobile navigation logic.
- Dùng một brand name thống nhất.
- Primary navigation và action labels không wrap.
- Thể hiện focus, active route và expanded menu state rõ ràng.

### Footer

- Bỏ cấu trúc bốn cột SaaS mặc định.
- Dùng brand statement lớn hoặc newsletter-first close.
- Gom shopping, account và support thành utility area cô đọng.
- Tách legal/copyright thành một hàng riêng.
- Giữ các link chức năng hiện có.

### Product/category cards

- Bỏ `hover:scale-105` dùng chung cho mọi card.
- Chọn một hover signal nhẹ: border, underline hoặc translate 1 px.
- Thêm focus-visible cho toàn card.
- Dùng tabular numerals cho giá/rating.
- Không hiển thị rating/review giả trong production.

### Files dự kiến

- `apps/storefront/src/app/[locale]/(shop)/_lib/components/layout/Header.tsx`
- `apps/storefront/src/app/[locale]/(shop)/_lib/components/layout/Footer.tsx`
- `apps/storefront/src/app/[locale]/(shop)/_lib/components/navigation/DesktopMegaMenu.tsx`
- `apps/storefront/src/app/[locale]/(shop)/_lib/components/navigation/MobileNav.tsx`
- `apps/storefront/src/app/[locale]/(shop)/_lib/components/common/ProductCard.tsx`
- `apps/storefront/src/app/[locale]/(shop)/_lib/components/common/CategoryCard.tsx`
- `apps/storefront/src/app/[locale]/(shop)/_lib/components/common/SectionHeading.tsx`

### Exit criteria

- Header/footer có fingerprint phù hợp retail.
- Mọi interactive component có default, hover, focus, active và disabled state phù hợp.
- Không có clickable label xuống hai dòng.
- Không regression search, navigation hoặc cart.

## 9. Phase 5 — Honest proof data

### Công việc

- Tách catalog mock data khỏi marketing proof data.
- Cho phép product mock data trong development/test.
- Với testimonial, product count, rating, review count và các claim như `100%`/`24/7`:
  - lấy từ nguồn xác thực; hoặc
  - gắn nhãn demo rõ ràng; hoặc
  - không render trong production.
- Không để layout phụ thuộc vào testimonial hoặc metric giả.

### Files dự kiến

- `apps/storefront/src/app/[locale]/(shop)/_lib/data/home.ts`
- `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/SectionTestimonials.tsx`
- `apps/storefront/src/app/[locale]/(shop)/_lib/components/home/TestimonialCard.tsx`
- Các MSW fixtures liên quan nếu cần phân biệt demo/production data.

### Exit criteria

- Mọi metric và testimonial hiển thị đều truy được nguồn hoặc có nhãn demo.
- Production build không hiển thị social proof giả.
- Homepage vẫn giữ hierarchy hợp lý khi testimonials không tồn tại.

## 10. Phase 6 — Admin và CMS workbench shell

### Công việc

- Sửa API mocking/CORS để dashboard render được dữ liệu trước khi polish.
- Thêm sidebar, topbar, page title và content canvas.
- Dùng chung token, typography và component voice với Storefront.
- Giữ UI Admin/CMS chỉ tiếng Việt theo ADR 0002.
- Thêm loading skeleton, empty state và error state.
- Navigation phải phản ánh đúng chức năng riêng của Admin và CMS.

### Files dự kiến

- `apps/admin/src/app/(protected)/layout.tsx`
- `apps/admin/src/app/(protected)/page.tsx`
- `apps/admin/src/features/dashboard/ProductsSummary.tsx`
- `apps/admin/src/app/globals.css`
- `apps/cms/src/app/(protected)/layout.tsx`
- `apps/cms/src/app/(protected)/page.tsx`
- `apps/cms/src/features/dashboard/ProductsSummary.tsx`
- `apps/cms/src/app/globals.css`

### Exit criteria

- Admin/CMS không còn là trang HTML thô.
- Loading, error, empty và data states đều kiểm tra được.
- Hai app nhất quán về design language nhưng không dùng marketing layout.
- UI chrome của Admin/CMS chỉ dùng tiếng Việt.

## 11. Phase 7 — Verification

### Automated checks

- `pnpm lint`
- `pnpm typecheck`
- Unit tests cho components bị thay đổi.
- Playwright smoke test cho homepage, navigation và primary CTA.
- Screenshot comparison tại 320, 375, 414, 768 và 1440 px.

### Manual checks

- Keyboard-only navigation.
- Focus order và focus visibility.
- Reduced-motion.
- Contrast cho body text, trust badges, focus ring, CTA và sale price.
- Không horizontal overflow.
- Không clickable label wrap.
- Không fake proof trong production surface.

### Hallmark re-audit

Mục tiêu cuối:

- `0 critical`.
- `0 major` cho structural fingerprint, AI nav/footer, fake proof và motion.
- Tối đa các minor không ảnh hưởng hierarchy hoặc usability.

## 12. Thứ tự thực hiện

1. Phase 1 — Design contract.
2. Phase 2 — Visual correctness và shared primitives.
3. Phase 3 — Homepage structural redesign.
4. Phase 4 — Header, footer và component voice.
5. Phase 5 — Honest proof data.
6. Phase 7 — Verification cho Storefront.
7. Phase 6 — Admin/CMS như một delivery slice độc lập.
8. Chạy lại Phase 7 cho toàn bộ ba app.

## 13. Definition of Done

- Không còn Hallmark critical finding.
- Không có accessibility regression rõ ràng.
- Không overflow ngang tại các breakpoint bắt buộc.
- Không regression functional cho navigation, search, cart và product links.
- Không mâu thuẫn với ADR hoặc design tokens canonical.
- Không có metric/testimonial giả trên production surface.
- Admin/CMS có application shell và state coverage tối thiểu.
- Lint, typecheck, tests và Playwright smoke tests đều pass.
