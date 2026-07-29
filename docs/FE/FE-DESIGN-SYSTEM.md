# FE Design System

Đây là tài liệu chốt riêng cho phần **design system** của Frontend website bán hàng.

Mục tiêu của file này là:

- làm rõ design system hiện đã chốt tới đâu
- định nghĩa các phần bắt buộc để FE build nhất quán
- tránh biến `FE.md` thành một file quá dày nhưng vẫn giữ đủ chuẩn thực thi

File này đi cùng:

- [`FE.md`](./FE.md): kiến trúc FE tổng thể, stack, workspace, package responsibilities
- [`FE-FOUNDATION.md`](./FE-FOUNDATION.md): foundation checklist để scaffold và boot các app
- [`FE-BOOTSTRAP-CHECKLIST.md`](./FE-BOOTSTRAP-CHECKLIST.md): runbook thực thi nhanh

## 1. Kết luận hiện tại

Cho đến thời điểm hiện tại, bộ FE docs đã có đủ **design system foundation** để bắt đầu scaffold và build FE.

Tuy nhiên, để được coi là **design system đủ dùng lâu dài** cho website bán hàng, nhóm FE sẽ bám theo tài liệu này như chuẩn chốt làm việc.

## 2. Phạm vi design system

Design system trong dự án này bao gồm:

- design tokens
- theme mapping
- layout rules
- component inventory
- component state rules
- accessibility baseline
- icon/media rules
- usage rules giữa `packages/ui`, `packages/commerce`, và app layer

Không bao gồm:

- business flow chi tiết của catalog, cart, checkout
- copywriting
- CMS content model
- backend contract

## 3. Nguyên tắc chốt

| ID | Nguyên tắc | Trạng thái | Ghi chú |
|---|---|---|---|
| DS-001 | Token là nguồn sự thật duy nhất cho style dùng chung | Đã chốt | Không hard-code design value trong shared layer |
| DS-002 | Shared UI chỉ chứa component thuần UI | Đã chốt | Nghiệp vụ commerce để ở `packages/commerce` khi thật sự share |
| DS-003 | Component variants đi qua `cva` | Đã chốt | Không tạo nhiều class rời rạc khó kiểm soát |
| DS-004 | Styling theo Tailwind v4 + CSS vars | Đã chốt | Mapping từ token qua `packages/tailwind-config` |
| DS-005 | A11y là baseline, không phải optional | Đã chốt | Keyboard, focus, contrast, aria |
| DS-006 | Design system ưu tiên phục vụ `storefront`, nhưng không phá `admin` và `cms` | Đã chốt | Layout và primitives dùng chung cho 3 app |
| DS-007 | `lucide-react` là icon library mặc định cho shared UI | Đã chốt | Không trộn nhiều icon set ở Phase 0 |

## 4. Token matrix

### 4.1. Cấu trúc token bắt buộc

| Nhóm token | Bắt buộc | Dùng cho | Ghi chú |
|---|---|---|---|
| Color | Có | text, surface, border, action, feedback | Tách base và semantic |
| Spacing | Có | margin, padding, gap, section spacing | Dùng scale thống nhất |
| Typography | Có | font family, size, line-height, weight, tracking | Phải support tiếng Việt |
| Radius | Có | button, input, card, modal | Không hard-code theo component |
| Shadow | Có | card, popover, modal, dropdown | Dùng theo elevation level |
| Motion | Có | transition duration, easing, enter/exit | Nhẹ, ưu tiên storefront |
| Breakpoints | Có | responsive layout | Dùng chung cho 3 app |
| Opacity | Nên có | disabled, overlay, skeleton | Có thể để cùng color/motion phase đầu |
| Z-index | Nên có | sticky, dropdown, modal, toast | Tránh z-index tự phát |

### 4.1.1. Breakpoint scale đã chốt

| Token | Min width | Ghi chú |
|---|---|---|
| `xs` | `0px` | mobile mặc định |
| `sm` | `480px` | mobile lớn |
| `md` | `768px` | tablet dọc / small laptop bắt đầu rõ layout |
| `lg` | `1024px` | desktop cơ bản |
| `xl` | `1280px` | desktop rộng |
| `2xl` | `1440px` | desktop lớn |

Quy tắc:

- không tạo breakpoint riêng cho từng app ở Phase 0
- mọi responsive rule trong `storefront`, `admin`, `cms` phải bám cùng một scale này
- utility có thể khác nhau giữa app, nhưng token breakpoint không đổi

### 4.2. Cấu trúc color token nên chốt

| Tầng | Ví dụ | Mục đích |
|---|---|---|
| Base token | `gray-100`, `gray-900`, `blue-600` | Giá trị nền |
| Semantic token | `surface-default`, `text-primary`, `border-subtle`, `action-primary-bg` | Ánh xạ để component dùng |
| Component alias | `button-primary-bg`, `input-border-focus` | Chỉ tạo khi semantic chưa đủ rõ |

Quy tắc:

- component ưu tiên dùng `semantic token`
- chỉ tạo `component alias` khi nhiều component cần cùng một nghĩa đặc thù
- không cho feature layer gọi trực tiếp base token nếu đang ở shared layer

### 4.3. Semantic token tối thiểu

| Nhóm | Token tối thiểu cần có |
|---|---|
| Surface | `surface-default`, `surface-subtle`, `surface-inverse`, `surface-overlay` |
| Text | `text-primary`, `text-secondary`, `text-muted`, `text-inverse`, `text-disabled` |
| Border | `border-default`, `border-subtle`, `border-strong`, `border-focus`, `border-error` |
| Action | `action-primary-bg`, `action-primary-fg`, `action-primary-bg-hover`, `action-secondary-bg`, `action-secondary-fg` |
| Feedback | `success`, `warning`, `danger`, `info` cùng foreground/background/border tương ứng |

## 5. Typography rules

| Hạng mục | Quy định |
|---|---|
| Font family | `Be Vietnam Pro` cho body và heading mặc định |
| Font scale | Dùng scale cố định cho `xs` đến `5xl` |
| Line height | Phải an toàn cho tiếng Việt, nhất là uppercase |
| Letter spacing | Chỉ dùng có chủ đích cho heading hoặc badge |
| Font weight | Chuẩn hóa các mốc `regular`, `medium`, `semibold`, `bold` |
| Locale | Không tạo typography token riêng theo locale ở Phase 0 |

### 5.1. Typography baseline đã chốt

| Token | Font size | Line height | Weight mặc định |
|---|---|---|---|
| `body-sm` | `14px` | `20px` | `400` |
| `body-md` | `16px` | `24px` | `400` |
| `body-lg` | `18px` | `28px` | `400` |
| `label-sm` | `12px` | `16px` | `500` |
| `label-md` | `14px` | `20px` | `500` |
| `title-sm` | `20px` | `28px` | `600` |
| `title-md` | `24px` | `32px` | `600` |
| `title-lg` | `30px` | `38px` | `700` |
| `display-sm` | `36px` | `44px` | `700` |

Mức typography tối thiểu nên có:

- `body-sm`
- `body-md`
- `body-lg`
- `label-sm`
- `label-md`
- `title-sm`
- `title-md`
- `title-lg`
- `display-sm`

## 6. Layout và responsive rules

### 6.1. Layout primitives bắt buộc

| Primitive | Mục đích | Thuộc package |
|---|---|---|
| `Container` | khống chế max-width và padding ngang | `packages/ui` |
| `Section` | nhịp dọc cho page sections | `packages/ui` |
| `Stack` | xếp dọc có gap thống nhất | `packages/ui` |
| `Inline` | xếp ngang đơn giản | `packages/ui` |
| `Grid` | layout lưới responsive | `packages/ui` |
| `Cluster` | nhóm tag, badge, action nhỏ | `packages/ui` |

### 6.2. Responsive baseline

| Hạng mục | Quy định chốt |
|---|---|
| Breakpoint source | Lấy từ `packages/design-tokens` |
| Container behavior | `storefront` dùng container rõ theo viewport, `admin/cms` ưu tiên fluid layout |
| Grid usage | Product grid, collection grid, dashboard cards phải dùng primitive hoặc utility chuẩn |
| Spacing scale | Tăng theo viewport nhưng không tạo scale riêng cho từng app |
| Mobile-first | Bắt buộc |

### 6.3. Container width đã chốt

| Breakpoint | Max width container | Horizontal padding |
|---|---|---|
| `xs` | `100%` | `16px` |
| `sm` | `100%` | `20px` |
| `md` | `720px` | `24px` |
| `lg` | `960px` | `24px` |
| `xl` | `1200px` | `32px` |
| `2xl` | `1280px` | `32px` |

Quy tắc:

- `storefront` dùng `Container` với bảng trên làm baseline
- `admin` và `cms` có thể fluid, nhưng spacing ngang vẫn đi theo token tương ứng
- không tạo container width ngẫu hứng ở từng page

### 6.4. Grid baseline cho storefront đã chốt

| Use case | Mobile | Tablet | Desktop |
|---|---|---|---|
| Product list grid | `2 cột` | `3 cột` | `4 cột` |
| Collection hero blocks | `1 cột` | `2 cột` | `2 hoặc 3 cột` |
| CMS content cards | `1 cột` | `2 cột` | `3 cột` |
| Admin summary cards | `1 cột` | `2 cột` | `4 cột` |

## 7. Component inventory

### 7.1. Primitive UI tối thiểu phải có

| Nhóm | Component tối thiểu |
|---|---|
| Actions | `Button`, `IconButton` |
| Form foundation | `Label`, `Input`, `Textarea`, `Checkbox`, `RadioGroup`, `Switch`, `Select` |
| Overlay | `Dialog`, `Drawer` hoặc `Sheet`, `Popover`, `Tooltip` |
| Feedback | `Alert`, `InlineError`, `Spinner`, `Skeleton`, `EmptyState` |
| Navigation | `Tabs`, `Breadcrumb`, `Pagination` |
| Surfaces | `Card`, `Divider`, `Badge` |
| Layout helpers | `Container`, `Section`, `Stack`, `Grid` |

### 7.2. Commerce-shared component nên có sau primitive

| Component | Thuộc package | Ghi chú |
|---|---|---|
| `ProductCard` | `packages/commerce` | dùng ở storefront là chính |
| `ProductPrice` | `packages/commerce` | format price thống nhất |
| `ProductGallery` | `packages/commerce` | chỉ share nếu thật sự tái dùng |
| `QuantitySelector` | `packages/commerce` | tránh duplicate ở cart/PDP |
| `RatingDisplay` | `packages/commerce` | nếu business có review/rating |

### 7.3. Không nên đưa vào shared quá sớm

- page section đặc thù campaign
- hero banner đặc thù từng landing page
- widget chỉ xuất hiện ở một flow duy nhất
- checkout step business-heavy

## 8. Component state matrix

Mỗi component tương tác được phải định nghĩa tối thiểu các state sau nếu có ý nghĩa:

| State | Bắt buộc cho | Ghi chú |
|---|---|---|
| `default` | tất cả component | trạng thái nền |
| `hover` | desktop interactive components | không dùng như nguồn thông tin duy nhất |
| `active` | button, tabs, item selectable | phản hồi khi tương tác |
| `focus-visible` | tất cả interactive components | bắt buộc cho keyboard |
| `disabled` | input, button, select | phải có cả visual và semantic |
| `loading` | button, async blocks, list/table | không làm layout nhảy quá mạnh |
| `error` | form controls, async blocks | gắn với message rõ ràng |
| `selected` | tabs, radio, selectable cards | tách với hover |
| `empty` | list/table/result areas | có guidance phù hợp |

Quy tắc:

- `focus-visible` phải có token riêng hoặc semantic token đủ rõ
- `disabled` không chỉ giảm opacity mù quáng nếu làm giảm contrast quá mức
- `loading`, `empty`, `error` phải được coi là một phần của component contract

## 9. Accessibility baseline

| Chủ đề | Chuẩn tối thiểu |
|---|---|
| Keyboard | mọi interactive component dùng được bằng bàn phím |
| Focus | có `focus-visible` rõ ràng, không bị cắt |
| Contrast | text và control states phải đạt contrast phù hợp |
| Aria | dùng aria khi native semantic chưa đủ |
| Labeling | input/select/checkbox/radio phải có label rõ |
| Error announcement | form error nên có liên kết với field |
| Modal behavior | trap focus, close bằng keyboard, restore focus |
| Tooltip/popover | không che mất luồng keyboard chính |

### 9.1. Focus ring baseline đã chốt

| Hạng mục | Giá trị chốt |
|---|---|
| Kích thước ring | `2px` |
| Offset | `2px` trên surface sáng, `1px` nếu control quá nhỏ |
| Màu | semantic token `border-focus` hoặc `focus-ring` |
| Trigger | dùng `:focus-visible`, không style mọi `:focus` giống nhau |
| Cấm | không bỏ focus ring mà không có thay thế tương đương |

### 9.2. Contrast baseline đã chốt

| Loại | Chuẩn làm việc |
|---|---|
| Body text | tối thiểu theo mức AA thông thường |
| Interactive control text | phải đọc rõ ở mọi state quan trọng |
| Disabled state | không dùng opacity quá thấp làm mất khả năng nhận biết |
| Focus state | phải nhìn ra ngay trên cả nền sáng và nền ảnh |

## 10. Icon và media rules

| Hạng mục | Quy định |
|---|---|
| Icon library | `lucide-react` là nguồn icon mặc định cho `packages/ui` và `apps/*` |
| Icon size | Dùng 3 mốc chuẩn `16`, `20`, `24` |
| Icon usage | Icon không thay thế hoàn toàn label nếu hành động không hiển nhiên |
| Product image ratio | Chốt ratio chuẩn theo card/PDP để tránh layout shift |
| Placeholder | Có placeholder thống nhất cho image loading/error |
| Empty illustration | Chỉ dùng khi thực sự giúp hiểu trạng thái, không lạm dụng |

### 10.1. Quy tắc icon đã chốt

| Hạng mục | Giá trị chốt |
|---|---|
| Package | `lucide-react` |
| Stroke width | giữ mặc định của lib, không custom bừa ở từng component |
| Size `sm` | `16px` |
| Size `md` | `20px` |
| Size `lg` | `24px` |
| Color source | lấy từ semantic token của text hoặc action |
| Nơi wrap icon | nếu cần wrapper chung thì đặt ở `packages/ui` |

### 10.2. Image ratio baseline đã chốt

| Use case | Ratio | Ghi chú |
|---|---|---|
| Product card image | `4:5` | ưu tiên ecommerce fashion/general merchandise |
| PDP main gallery image | `4:5` | thống nhất với card để giảm lệch ảnh |
| PDP thumbnail | `1:1` | dễ sắp thumbnail strip |
| Collection/banner image | `16:9` | cho hero và promo section |
| Category tile | `1:1` | ổn định grid nhỏ |

Quy tắc:

- dùng ratio box hoặc `next/image` container ổn định để tránh layout shift
- nếu business sau này là điện máy hoặc furniture và ratio khác rõ rệt, update ở một quyết định riêng thay vì tự sửa từng màn

### 10.3. Placeholder và empty media baseline

| Hạng mục | Quy định chốt |
|---|---|
| Image loading | dùng skeleton theo ratio thật của vùng ảnh |
| Image error | fallback nền trung tính + icon ảnh + label ngắn |
| Empty illustration | chỉ dùng cho trạng thái cấp trang hoặc module lớn |
| Inline empty | ưu tiên icon + heading + body text ngắn |

### 10.4. Z-index scale đã chốt

| Token | Giá trị |
|---|---|
| `z.base` | `0` |
| `z.sticky` | `10` |
| `z.dropdown` | `20` |
| `z.popover` | `20` |
| `z.overlay` | `30` |
| `z.drawer` | `40` |
| `z.modal` | `40` |
| `z.toast` | `50` |
| `z.debug` | `60` |

Quy tắc:

- không set `z-[9999]` tùy tiện trong app layer
- dropdown/popover không được vượt modal
- toast được phép nổi trên modal overlay nhưng không che nút đóng modal

## 11. Usage rules theo layer

| Layer | Được phép | Không được phép |
|---|---|---|
| `packages/design-tokens` | token definitions | component, business logic |
| `packages/tailwind-config` | theme mapping, plugin config | business styling đặc thù |
| `packages/ui` | primitives, layout, UI-only patterns | commerce flow logic |
| `packages/commerce` | reusable commerce components | API call trực tiếp, page logic nặng |
| `apps/*` | page composition, feature-specific styling | bypass shared contract bừa bãi |

## 12. Tài liệu prove component

Trạng thái hiện tại:

- Storybook chưa được chốt dùng ngay ở Phase 0
- vì vậy baseline prove component hiện tại vẫn là:
  - doc trong repo
  - example usage trong app shell
  - test bằng Vitest và Playwright

Quy tắc chốt:

- chưa bắt buộc tạo Storybook trước khi scaffold
- nếu số lượng component shared tăng nhanh, Storybook nên được mở như một task riêng

## 13. Definition of Done cho design system

Design system chỉ được coi là **đủ dùng cho execution** khi:

- token matrix đã định nghĩa rõ base và semantic layers
- typography rules đủ để render tiếng Việt ổn định
- layout primitives đã được chốt
- primitive inventory tối thiểu đã được chốt
- state matrix cho component interactive đã rõ
- loading, empty, error states được xem là contract bắt buộc
- accessibility baseline được ghi thành rule, không chỉ nói chung chung
- rule phân tầng giữa `ui`, `commerce`, và app layer đã rõ

## 14. Gap còn lại sau khi chốt file này

Sau file này, phần còn mở không còn là câu hỏi lớn về cấu trúc design system nữa. Các phần còn lại chủ yếu là execution detail:

- quyết định có mở Storybook sớm hay không
- viết code scaffold thật cho token, primitives và examples
- tinh chỉnh nhỏ nếu UI mock thực tế cho thấy cần đổi spacing hoặc grid density

## 15. Khuyến nghị thực thi

Thứ tự làm phù hợp nhất:

1. dựng `packages/design-tokens`
2. dựng `packages/tailwind-config`
3. dựng `packages/ui` với primitives và layout helpers
4. prove trong `apps/storefront`
5. chỉ khi có reuse thật mới đẩy component sang `packages/commerce`

Nếu đi theo thứ tự này, phần design system sẽ đủ chắc để không phải đập lại khi vào catalog, PDP, cart và checkout.
