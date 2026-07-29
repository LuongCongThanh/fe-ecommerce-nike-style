# FE Architecture

Đây là tài liệu chốt riêng cho **kiến trúc Frontend** của website bán hàng này.

Mục tiêu của file này là:

- chốt kiến trúc chuẩn cho `storefront`, `admin`, `cms`
- chốt kiến trúc module chung để dev không tự chia mỗi app theo một kiểu
- làm rõ boundary giữa `app layer`, `feature layer`, và shared packages

File này đi cùng:

- [`FE.md`](./FE.md): tài liệu FE tổng thể
- [`FE-DESIGN-SYSTEM.md`](./FE-DESIGN-SYSTEM.md): chuẩn design system
- [`FE-FOUNDATION.md`](./FE-FOUNDATION.md): foundation checklist

## 1. Kết luận hiện tại

Sau file này, phần kiến trúc FE được coi là **đủ chuẩn để execution** cho cả 3 app ở mức scaffold, foundation, và feature implementation.

Những phần vẫn còn mở sau file này không còn là câu hỏi kiến trúc lớn, mà chủ yếu là:

- chi tiết RBAC thật cho `admin/cms`
- auth spike với `MSW + Set-Cookie + Next.js middleware`
- package manifest thật sau khi scaffold code

## 2. Nguyên tắc kiến trúc đã chốt

| ID | Nguyên tắc | Trạng thái | Ghi chú |
|---|---|---|---|
| ARC-001 | Monorepo 3 app, shared packages dùng chung | Đã chốt | `storefront`, `admin`, `cms` |
| ARC-002 | App Router cho cả 3 app | Đã chốt | Không trộn Pages Router |
| ARC-003 | Feature-first trong từng app | Đã chốt | Không tổ chức theo technical folders toàn cục |
| ARC-004 | API access chỉ đi qua `packages/api-sdk` | Đã chốt | Không `fetch` trực tiếp từ feature |
| ARC-005 | Shared UI giữ thuần UI | Đã chốt | Nghiệp vụ chỉ vào `packages/commerce` khi thật sự share |
| ARC-006 | Server state, client state, URL state tách riêng | Đã chốt | Không dùng Zustand làm server cache |
| ARC-007 | Route guard ở FE chỉ là UX layer | Đã chốt | Authz thật do backend enforce |
| ARC-008 | Mỗi feature phải có public API rõ | Đã chốt | Chỉ export qua `index.ts` |

## 3. Kiến trúc tổng thể

```text
apps/*
  -> app layer
  -> feature layer
  -> providers
  -> app-specific config

packages/*
  -> shared platform layer
  -> shared UI layer
  -> shared commerce layer
  -> shared schemas/contracts
  -> shared API access
```

Luồng phụ thuộc chuẩn:

```text
app routes/layouts
  -> feature modules
  -> shared hooks/utils/ui/commerce
  -> api-sdk + schemas
```

Không được đi ngược:

- `packages/ui` import từ app
- feature này import sâu vào file private của feature khác
- app gọi API bỏ qua `packages/api-sdk`

## 4. Vai trò từng app

### 4.1. `storefront`

Mục tiêu:

- phục vụ người mua hàng cuối
- tối ưu UX, performance, SEO, locale routing
- chứa các flow catalog, PDP, search, cart, wishlist, auth/account, checkout

Trách nhiệm kiến trúc:

- route public và account/checkout
- i18n UI
- commerce experience chính
- chịu trách nhiệm SEO-facing pages

Không nên chứa:

- logic quản trị nội bộ
- CMS authoring workflows

### 4.2. `admin`

Mục tiêu:

- phục vụ vận hành nội bộ
- quản trị dữ liệu kinh doanh như product, category, inventory, orders

Trách nhiệm kiến trúc:

- protected routes
- data-heavy backoffice screens
- table/filter/form CRUD flows
- audit-friendly interaction patterns

Không nên chứa:

- public storefront concerns
- SEO editing flows thuần content nếu đã thuộc `cms`

### 4.3. `cms`

Mục tiêu:

- phục vụ quản trị nội dung marketing/content
- chỉnh sửa hero, section trang chủ, landing page, blog, campaign, SEO metadata

Trách nhiệm kiến trúc:

- protected routes
- content editing flows
- preview-oriented UX nếu sau này cần

Không nên chứa:

- inventory/order backoffice
- storefront public routing logic

## 5. So sánh kiến trúc 3 app

| Chủ đề | `storefront` | `admin` | `cms` |
|---|---|---|---|
| Audience | khách mua hàng | vận hành nội bộ | content/marketing team |
| Route type | public + account/checkout | protected | protected |
| i18n UI | có | chưa bắt buộc | chưa bắt buộc |
| SEO pressure | rất cao | thấp | thấp |
| Performance pressure | cao nhất | trung bình | trung bình |
| Commerce UI | chính | phụ | hầu như không |
| CMS editing | không | không | chính |

## 6. Shared package architecture

| Package | Vai trò kiến trúc | Ai được dùng |
|---|---|---|
| `packages/design-tokens` | token source of truth | cả 3 app + shared UI |
| `packages/tailwind-config` | theme/preset chung | cả 3 app |
| `packages/ui` | primitive UI + layout helpers | cả 3 app |
| `packages/commerce` | reusable commerce components | chủ yếu `storefront`, có thể `admin` khi hợp lý |
| `packages/schemas` | typed contract và validation schemas | cả app và `api-sdk` |
| `packages/api-sdk` | network entrypoint duy nhất | cả 3 app |
| `packages/hooks` | hook thật sự cross-app hoặc cross-feature | cả 3 app khi hợp lý |
| `packages/utils` | helper thuần, không phụ thuộc app | cả 3 app |

## 7. Kiến trúc module chung

## 7.1. Mẫu module chuẩn

Decision hiện tại đã chốt theo pattern:

`features/{feature}/pages/{page}/`

Mẫu tối thiểu:

```text
src/features/{feature}/
  pages/
  components/
  hooks/
  stores/
  utils/
  index.ts
```

Không phải feature nào cũng bắt buộc có đủ mọi thư mục. Chỉ tạo khi cần thật.

## 7.2. Ý nghĩa từng phần trong feature

| Thư mục | Dùng cho | Không dùng cho |
|---|---|---|
| `pages/` | page-level composition của feature | reusable shared UI |
| `components/` | component riêng của feature | primitive dùng chung toàn app |
| `hooks/` | hook nghiệp vụ hoặc orchestration của feature | fetch trực tiếp bỏ qua `api-sdk` |
| `stores/` | client state ngắn hạn, UI state có ý nghĩa trong feature | server cache |
| `utils/` | helper thuần của feature | business logic bị chia vụn bừa bãi |
| `index.ts` | public API của feature | export mọi file private |

## 7.3. Public API của feature

Mỗi feature chỉ được expose ra ngoài qua `index.ts`.

Được export:

- page-level entrypoints
- component entrypoints thật sự cần dùng ngoài feature
- hooks được coi là public
- type public của feature nếu cần

Không export:

- file helper private
- selector/internal constants không cần reuse
- component thử nghiệm hoặc WIP

## 8. Import boundary đã chốt

## 8.1. Luật import

| Từ đâu | Được import gì |
|---|---|
| `app/*` | `src/features/*`, `src/providers/*`, shared packages |
| feature A | shared packages, file private trong chính feature A |
| feature A | public API của feature B nếu có nhu cầu thật |
| shared packages | shared packages khác nếu hợp lý và không vòng phụ thuộc |

## 8.2. Cấm

- import xuyên vào file private của feature khác
- app import từ đường dẫn sâu khó kiểm soát nếu feature đã có `index.ts`
- `packages/ui` import `packages/commerce`
- feature import trực tiếp từ backend endpoint URL constants bên ngoài `api-sdk`

## 8.3. Decision matrix đặt code ở đâu

| Nếu code là... | Đặt ở đâu |
|---|---|
| primitive thuần UI | `packages/ui` |
| component commerce có reuse thật | `packages/commerce` |
| logic gọi API typed | `packages/api-sdk` |
| schema contract | `packages/schemas` |
| helper thuần đa app | `packages/utils` |
| hook thật sự dùng đa app | `packages/hooks` |
| page/business logic riêng một domain | `src/features/{feature}` |
| route/layout/provider riêng app | app tương ứng |

## 9. Routing và layout architecture

## 9.1. `storefront`

Route baseline:

```text
app/[locale]/
  (public)/
  account/
  cart/
  checkout/
  wishlist/
```

Layout baseline:

- root layout toàn app
- locale layout cho `next-intl`
- account/checkout có thể có nested layout riêng khi cần

## 9.2. `admin`

Route baseline:

```text
app/(protected)/
  products/
  categories/
  inventory/
  orders/
```

Layout baseline:

- root layout
- protected layout
- shell layout cho sidebar/header/backoffice actions

## 9.3. `cms`

Route baseline:

```text
app/(protected)/
  hero-banner/
  homepage-sections/
  collection-landing/
  promotion-banner/
  seo-metadata/
  blog/
  campaign/
```

Layout baseline:

- root layout
- protected layout
- content editing shell layout

## 10. Provider architecture

Mỗi app tối thiểu có:

- `app-providers.tsx`
- `query-provider.tsx`

`storefront` có thêm:

- `intl-provider.tsx`

Nguyên tắc:

- provider chung của app đặt tại `src/providers/`
- không nhét provider logic vào từng feature nếu nó là concern cấp app
- query client config được chuẩn hóa, không mỗi feature tự tạo client mới

## 11. Auth và authorization architecture

## 11.1. Auth baseline

- FE phụ thuộc `httpOnly` session-cookie
- middleware và protected layout là UX gate
- backend là nơi enforce permission thật

## 11.2. App-specific auth

| App | Baseline auth |
|---|---|
| `storefront` | session cho account/checkout nếu có |
| `admin` | protected shell bắt buộc |
| `cms` | protected shell bắt buộc |

## 11.3. Điều còn mở

- RBAC thật cho `admin/cms`
- mapping role -> route visibility
- spike xác nhận `MSW + Set-Cookie + Next.js middleware`

Vì vậy phần auth architecture hiện đã đủ khung, nhưng chưa được coi là fully closed ở mức permission detail.

## 12. Error, loading, empty architecture

## 12.1. Route-level

Mỗi app nên có baseline cho:

- loading state theo route segment
- error boundary theo route segment
- not-found handling khi hợp lý

## 12.2. Feature-level

Mỗi feature phải coi các state sau là bắt buộc:

- loading
- empty
- error
- success

Quy tắc:

- loading không làm nhảy layout quá mạnh
- empty phải có hướng dẫn hoặc CTA nếu phù hợp
- error phải có retry hoặc next action nếu có thể

## 12.3. App-specific emphasis

| App | Ưu tiên |
|---|---|
| `storefront` | skeleton và optimistic UX hợp lý |
| `admin` | table empty/error states rõ ràng |
| `cms` | form save/error/preview states rõ ràng |

## 13. State ownership architecture

| Loại state | Công cụ chính | Ví dụ |
|---|---|---|
| URL state | route/search params | filter, sort, pagination |
| Server state | TanStack Query | product list, orders, CMS data |
| Client state | Zustand | modal state, step state, UI-only flows |
| Local component state | React state | input interaction ngắn hạn |

Nguyên tắc cứng:

- không copy response API vào Zustand để làm cache phụ
- data fetch phải đi qua `api-sdk`
- query key phải có cấu trúc ổn định

## 14. Module implementation checklist

Một feature được coi là đúng kiến trúc khi:

- có boundary rõ giữa page composition và reusable feature parts
- không gọi API trực tiếp bỏ qua `api-sdk`
- chỉ expose public API cần thiết
- không kéo shared UI vào feature rồi fork vô tội vạ
- loading/empty/error states được xử lý
- state ownership đúng lớp

## 15. Definition of Done cho FE architecture

Kiến trúc FE chỉ được coi là đủ chuẩn khi:

- 3 app có vai trò rõ và không chồng trách nhiệm
- module structure dùng thống nhất giữa các app
- import boundary rõ
- routing/layout/provider architecture rõ
- auth architecture rõ ở mức shell
- error/loading/empty architecture được coi là contract
- decision matrix đặt code ở đâu đã rõ

## 16. Kết luận thực thi

Sau file này:

- `FE.md` giữ vai trò master doc tổng quan
- `FE-DESIGN-SYSTEM.md` chốt chuẩn UI/design
- `FE-FOUNDATION.md` chốt foundation
- `FE-ARCHITECTURE.md` chốt kiến trúc chạy thật cho 3 app và module chung

Như vậy bộ FE docs hiện đã có đủ 4 lớp tài liệu chính để bắt đầu scaffold và build Frontend theo cùng một kiến trúc, thay vì để mỗi app tự phát triển theo một kiểu khác nhau.
