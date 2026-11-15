# Hướng dẫn dùng UI/UX Skills

Hướng dẫn này dành cho `fe-ecommerce-nike-style`. Mục tiêu là chọn **ít skill
nhất nhưng đúng việc nhất**, không gọi toàn bộ skill cho một thay đổi nhỏ.

## Cú pháp nhanh

| Môi trường | Cú pháp |
| --- | --- |
| Codex | `$ten-skill yêu cầu cụ thể` |
| Claude Code | `/ten-skill yêu cầu cụ thể` |
| Skill không hiện trong menu | Mô tả mục tiêu bằng ngôn ngữ tự nhiên và nêu tên skill trong prompt. |

> Trong Codex, dùng `/skills` để xem các skill đã nạp. Khởi động một session
> mới sau khi cài skill để danh sách được làm mới.

## Workflow chuẩn cho storefront

```text
Đọc AGENTS.md + design.md
        ↓
Chọn direction: UI/UX Pro Max + Taste hoặc Hallmark
        ↓
Triển khai bằng component/design system hiện có
        ↓
Mobile + edge cases: mobile-native + break-ui
        ↓
Motion khi thật sự cần: Emil skills hoặc GSAP
        ↓
Audit trước bàn giao: Impeccable
```

Luôn giữ các nguyên tắc trong `design.md`: màu đỏ chỉ dành cho sale/giá/promo,
CTA chính dùng token `primary`, mọi UI mới phải hỗ trợ `vi` và `en`, keyboard,
focus, loading, empty, error và reduced motion.

---

## 1. UI/UX Pro Max

UI/UX Pro Max là bộ skill điều phối thiết kế tổng thể.

```text
ui-ux-pro-max
├── ui-ux-pro-max  → định hướng tổng thể
├── design          → layout/page mới
├── design-system   → token, typography, component rules
├── ui-styling      → CSS/Tailwind polish
├── brand           → brand identity
├── banner-design   → hero/banner
└── slides          → presentation
```

### Khi dùng

- Bắt đầu một trang mới hoặc redesign lớn.
- Cần chọn hierarchy, layout, responsive strategy và visual direction.

### Ví dụ

```text
$ui-ux-pro-max thiết kế trang collection “Autumn Atelier”.
Đọc design.md trước, giữ token hiện có, ưu tiên mobile conversion và ảnh sản phẩm.
```

```text
$design-system audit token của product card và filter sidebar.
Không đổi palette đã khóa trong design.md.
```

```text
$banner-design đề xuất hero campaign theo hướng warm editorial.
Không dùng gradient/glassmorphism và không sao chép Nike.
```

---

## 2. Taste Skill

Skill chính: `design-taste-frontend`.

Nó xử lý art direction, palette/font pairing, hero layout, imagery/reference,
browser consistency check và finish gate.

### Khi dùng

- Trang marketing, collection, landing page hoặc homepage cần cá tính.
- Muốn tránh giao diện mặc định, chung chung do AI tạo.

### Ví dụ

```text
$design-taste-frontend xây dựng collection page “Summer Edit”.
Hướng: warm fashion editorial; dùng ảnh sản phẩm thật; một idea xuyên suốt;
kiểm tra browser trước khi bàn giao.
```

Trong Claude plugin, tên có thể là:

```text
/taste-skill:design-taste-frontend xây dựng collection page “Summer Edit”.
```

---

## 3. Impeccable

Impeccable là một skill audit/polish, có các chế độ như audit, critique,
polish, redesign và detector.

### Khi dùng

- UI đã tồn tại và cần rà lỗi hierarchy, spacing, responsive, accessibility.
- Trước khi merge hoặc bàn giao một thay đổi visual quan trọng.

### Ví dụ

```text
$impeccable audit src/features/home và /vi/home.
Tìm lỗi P0/P1 về hierarchy, spacing, accessibility và AI-slop.
Giữ design.md; không thay đổi API hay checkout.
```

Claude Code:

```text
/impeccable audit trang home và product detail.
```

---

## 4. Hallmark

Hallmark là một skill thiết kế/review có các reference bên trong:

```text
hallmark
├── themes/                 → theme thẩm mỹ
├── layout + macrostructure → bố cục trang
├── typography + color      → hierarchy và màu
├── responsive              → responsive rules
├── motion                  → motion rules
└── slop test               → kiểm tra UI rập khuôn
```

### Khi dùng

- Cần chọn một hướng thẩm mỹ rõ ràng cho redesign.
- Cần kiểm tra một page có đang “generic” hay không.

### Ví dụ

```text
$hallmark redesign product detail theo hướng quiet utility.
Giữ flow chọn variant, add-to-cart và design.md; không thay đổi nghiệp vụ.
```

```text
$hallmark custom tạo direction mới cho trang campaign.
Không dùng theme có sẵn; phải có một ý tưởng đặc trưng cho thương hiệu.
```

---

## 5. Skills for Designers & Engineers

Đây là bộ nhiều skill nhỏ. Với web Next.js hiện tại, các skill hữu ích nhất là:

| Skill | Dùng khi | Ví dụ |
| --- | --- | --- |
| `emil-design-eng` | Review cấu trúc UI | `$emil-design-eng review component structure của home.` |
| `pick-ui-library` | Cân nhắc dependency UI | `$pick-ui-library đánh giá có cần thư viện carousel mới không.` |
| `prototype` | So sánh 2–3 direction | `$prototype tạo 3 hero direction cho Autumn Atelier.` |
| `mobile-native` | Rà UX mobile | `$mobile-native kiểm tra PDP ở 320px, 375px và 414px.` |
| `break-ui` | Thử dữ liệu xấu/edge case | `$break-ui thử tên dài, ảnh thiếu, hết hàng và 0 sản phẩm.` |
| `learn-taste` | Lưu bài học sau nhiều lần chỉnh | `$learn-taste cập nhật design.md từ các chỉnh sửa UI vừa hoàn thành.` |
| `find-animation-opportunities` | Tìm chỗ cần motion | `$find-animation-opportunities audit home; nêu rõ phần không nên animate.` |
| `animation-vocabulary` | Mô tả motion rõ ràng | `$animation-vocabulary đề xuất chuyển động cho hero.` |
| `review-animations` | Review motion hiện có | `$review-animations review carousel và card interactions.` |
| `improve-animations` | Lập kế hoạch sửa motion | `$improve-animations audit toàn bộ motion trong features/home.` |
| `animation-performance` | Tìm frame drop/jank | `$animation-performance kiểm tra animation gây lag.` |
| `choreograph` | Phối hợp nhiều phần tử | `$choreograph tạo sequence eyebrow → heading → CTA → trust badges.` |
| `remove-animations` | Bỏ motion thừa | `$remove-animations tìm animation không hỗ trợ UX.` |
| `gestures` | Drag/swipe/sheet | `$gestures review swipe của hero carousel.` |

Không cần dùng `write-swift` hay `animate-expo` cho dự án Next.js web này.

---

## 6. GSAP Skills

```text
gsap-skills
├── gsap-core          → tween/easing/stagger cơ bản
├── gsap-timeline      → chuỗi animation nhiều bước
├── gsap-scrolltrigger → animation theo scroll
├── gsap-react         → lifecycle/cleanup trong React
├── gsap-frameworks    → framework integration
├── gsap-plugins       → Flip, SplitText, MorphSVG…
├── gsap-utils         → helper GSAP
└── gsap-performance   → performance
```

### Khi dùng

- Framer Motion không đủ cho timeline, scroll choreography hoặc hiệu ứng phức tạp.
- Không dùng nếu chỉ cần hover/tap/reveal đơn giản đã có trong Framer Motion.

### Ví dụ

```text
$gsap-react thêm reveal animation cho editorial section.
Cleanup animation khi unmount và tôn trọng prefers-reduced-motion.
```

```text
$gsap-scrolltrigger reveal campaign section khi vào viewport.
Không scroll-jacking, không pin content quan trọng trên mobile.
```

```text
$gsap-performance audit GSAP trong src/features/home trước khi thêm effect mới.
```

---

## 7. Scroll World

Skill duy nhất: `scroll-world`. Nó hỗ trợ brief thương hiệu, lên cảnh 3D,
camera flight, asset workflow, fallback mobile và tích hợp web.

### Khi dùng

- Hero cho campaign lớn, lookbook hoặc brand story.

### Không dùng

- Product grid, search, filter, cart, authentication và checkout.

### Ví dụ

```text
$scroll-world tạo hero 3D cho campaign “Autumn Atelier”.
Lazy-load, poster fallback, giảm/tắt ở reduced motion;
không để WebGL chặn CTA hoặc làm xấu LCP.
```

---

## 8. Google DESIGN.md

Đây là định dạng tài liệu, không có slash command. Nó nên mô tả:

```text
design.md
├── brand + voice
├── color tokens
├── typography
├── spacing + grid
├── radius + shadow
├── components
├── responsive
├── motion
├── accessibility
└── do / don't
```

### Ví dụ prompt

```text
Đọc design.md và bổ sung quy tắc cho product card, filter, empty/error state
và motion. Không tự đổi token hoặc source code UI.
```

---

## 9. Awesome DESIGN.md

Đây là thư viện các file `DESIGN.md` mẫu, không có skill để gọi trực tiếp.

### Ví dụ prompt

```text
Tham khảo cấu trúc phù hợp trong Awesome DESIGN.md, sau đó đề xuất các mục còn
thiếu cho design.md của dự án. Không sao chép nhận diện thương hiệu khác.
```

---

## 10. Open Design

Open Design là design workspace/prototype tool, không phải slash skill.

### Khi dùng

- Muốn thử wireframe, prototype hoặc nhiều visual direction trước khi code.

### Ví dụ brief

```text
Tạo prototype homepage fashion commerce: hero, category grid, new arrivals,
editorial collection và newsletter. Dùng tokens từ design.md.
```

---

## 11. React Bits

React Bits là thư viện component/effect React, không phải slash skill.

Các nhóm thường dùng: text animation, animated components, backgrounds,
buttons, cards, loaders, navigation và effects.

### Ví dụ prompt

```text
Tìm một React Bits text animation phù hợp cho hero heading.
Đánh giá bundle size, accessibility và reduced-motion; chỉ tích hợp nếu
Framer Motion hiện có không đáp ứng.
```

---

## 12. Canvas UI

Canvas UI là thư viện hiệu ứng WebGL phủ trên HTML, không phải slash skill.

### Khi dùng

- Một hiệu ứng hero/marketing rất có chủ đích, nhưng HTML vẫn cần click/chọn được.

### Ví dụ prompt

```text
Đánh giá Canvas UI cho hover effect nhẹ ở hero editorial.
Phải có static fallback, tắt khi reduced motion và không ảnh hưởng mobile performance.
```

---

## Prompt điều phối khuyến nghị

```text
$fashion-storefront-ui-director cải thiện trang [tên trang].

1. Đọc AGENTS.md và design.md trước.
2. Chọn skill nhỏ nhất phù hợp:
   - Page mới: ui-ux-pro-max + design-taste-frontend
   - Redesign/audit: hallmark + impeccable
   - Mobile/edge cases: mobile-native + break-ui
   - Motion: find-animation-opportunities, rồi Framer Motion hoặc gsap-*
   - 3D campaign hero: scroll-world
3. Không thay đổi API, checkout hoặc domain behavior.
4. Hỗ trợ vi/en, loading, empty, error, keyboard và reduced motion.
5. Chạy lint, typecheck và test liên quan trước khi bàn giao.
```
