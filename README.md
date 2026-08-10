# FE E-commerce Nike Style

Frontend monorepo cho nền tảng thương mại điện tử thời trang và giày thể thao tại thị trường Việt Nam. Repository chứa ba ứng dụng Next.js (`storefront`, `admin`, `cms`) và các package dùng chung, được quản lý bằng pnpm workspace và Turborepo.

> Dự án đang phát triển theo hướng mock-first. FE và contract foundation đã tồn tại; các feature và quá trình thay MSW bằng Backend thật được triển khai theo từng lát cắt. Backend canonical là NestJS modular monolith trong repository riêng.

## Mục lục

- [Trạng thái dự án](#trạng-thái-dự-án)
- [Phạm vi sản phẩm](#phạm-vi-sản-phẩm)
- [Kiến trúc tổng thể](#kiến-trúc-tổng-thể)
- [Ứng dụng](#ứng-dụng)
- [Shared packages](#shared-packages)
- [Tech stack](#tech-stack)
- [Bắt đầu nhanh](#bắt-đầu-nhanh)
- [Biến môi trường](#biến-môi-trường)
- [Lệnh thường dùng](#lệnh-thường-dùng)
- [Quy ước phát triển](#quy-ước-phát-triển)
- [Testing và CI](#testing-và-ci)
- [Tài liệu canonical](#tài-liệu-canonical)
- [Các lưu ý hiện tại](#các-lưu-ý-hiện-tại)

## Trạng thái dự án

| Khối                       | Trạng thái hiện tại                                                                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo và shared tooling | Đã có pnpm workspace, Turborepo, shared TypeScript/ESLint config và Git hooks                                                                                    |
| Design system foundation   | Đã có design tokens, Tailwind preset và UI primitives dùng chung                                                                                                 |
| Contract/API foundation    | Đã có Zod schemas, API SDK, MSW handlers và browser/server adapters                                                                                              |
| Storefront                 | Đã có locale routing và các route/component cho catalog, Product, Cart, Checkout, auth, profile và Order; vẫn tiếp tục hoàn thiện theo issue/acceptance criteria |
| Admin                      | Đã boot app shell, protected layout, providers và foundation-check feature; feature vận hành thật được triển khai sau                                            |
| CMS                        | Đã boot app shell, protected layout, providers và foundation-check feature; content workflows được triển khai sau                                                |
| Backend integration        | Chưa phải nguồn dữ liệu mặc định; FE hiện có thể chạy bằng MSW và sẽ chuyển dần sang API v1 theo contract đã pin                                                 |

Danh sách issue và thứ tự delivery được quản lý trên [GitHub Issues](https://github.com/LuongCongThanh/fe-ecommerce-nike-style/issues).

## Phạm vi sản phẩm

### Storefront

Storefront phục vụ Customer và là ứng dụng duy nhất có UI đa ngôn ngữ. Phạm vi MVP gồm:

- Duyệt Product theo Category và filter theo Gender.
- Product Listing Page với filter, sort, pagination và URL-as-state.
- Product Detail Page với Variant `{Color?, Size?}` ánh xạ tới đúng một SKU.
- Tìm kiếm Product cơ bản.
- Cart và Wishlist cho guest/authenticated, bao gồm merge sau đăng nhập.
- Checkout COD; MVP không tích hợp cổng thanh toán online.
- Đăng ký, đăng nhập, quên mật khẩu và đặt lại mật khẩu.
- Profile, địa chỉ và lịch sử Order.
- Locale `vi` và `en`; Locale mặc định là `vi`.

### Admin

Admin phục vụ Staff vận hành nội bộ. Phạm vi MVP gồm:

- CRUD Product, Variant và SKU.
- Quản lý Category.
- Xem và cập nhật tồn kho cơ bản.
- Quản lý vòng đời Order và duyệt yêu cầu trả hàng.
- Quản lý Staff/Role theo permission-based authorization.
- UI chỉ dùng tiếng Việt.

### CMS

CMS phục vụ Staff biên tập nội dung. Phạm vi MVP gồm:

- Hero Banner và Homepage Sections.
- Collection Landing Page và Promotion Banner.
- SEO Metadata.
- Blog và Campaign.
- UI quản trị chỉ dùng tiếng Việt; nội dung hiển thị trên Storefront vẫn hỗ trợ Localized Text.

### Ngoài phạm vi MVP

- Payment gateway online như VNPay, MoMo hoặc Stripe.
- Recommendation engine và AI Search.
- Multi-vendor, multi-warehouse hoặc microservices.
- Loyalty nâng cao, gift card và multi-currency.
- Headless CMS bên thứ ba.

Nếu code legacy còn nhắc tới Django hoặc payment gateway, không coi đó là quyết định hiện hành. Functional requirements và ADR trong `docs/00-core/` luôn có ưu tiên cao hơn.

## Ngôn ngữ domain cốt lõi

README chỉ tóm tắt các thuật ngữ cần biết khi đọc code. Định nghĩa đầy đủ nằm trong [glossary](./docs/00-core/glossary.md).

- **Product**: sản phẩm ở cấp khách hàng nhận biết, thường tương ứng một PDP.
- **Variant**: biến thể của Product theo tuple cố định `{Color?, Size?}`.
- **SKU**: đơn vị bán hàng/tồn kho cuối cùng, có giá và tồn kho riêng.
- **Category**: cây loại sản phẩm; không dùng để biểu diễn Gender.
- **Gender**: filter trên Product (`men`, `women`, `kids`, `unisex`).
- **Customer**: người mua ở Storefront; không dùng Role/Permission của Staff.
- **Staff**: nhân sự nội bộ sử dụng Admin/CMS.
- **Localized Text**: nội dung có giá trị theo Locale, bắt buộc có giá trị ở Locale mặc định `vi`.
- **Order**: đơn hàng COD với vòng đời và transition được giới hạn bởi business rules.

## Kiến trúc tổng thể

```mermaid
flowchart LR
  SF[Storefront]
  AD[Admin]
  CMS[CMS]

  UI[@repo/ui]
  TOKENS[@repo/design-tokens]
  SCHEMAS[@repo/schemas]
  SDK[@repo/api-sdk]
  MSW[MSW mocks]
  PROXY[Same-origin /api proxy]
  BE[NestJS Backend repo]

  SF --> UI
  AD --> UI
  CMS --> UI
  UI --> TOKENS

  SF --> SDK
  AD --> SDK
  CMS --> SDK
  SDK --> SCHEMAS
  SDK --> MSW
  SDK --> PROXY
  PROXY --> BE
```

### Nguyên tắc dependency

Luồng phụ thuộc chuẩn:

```text
app routes/layouts
  -> app feature modules
  -> shared UI/hooks/utilities
  -> api-sdk + schemas
```

Các boundary quan trọng:

- Feature/app không gọi API trực tiếp; network access đi qua `@repo/api-sdk`.
- `@repo/ui` không import code từ `apps/*` và không chứa business logic.
- Server state dùng TanStack Query; shared client state dùng Zustand; filter/navigation state ưu tiên URL.
- FE route guard chỉ hỗ trợ UX. Backend vẫn là nơi enforce authentication/authorization thật.
- Shared package export bằng subpath trong `package.json`; không tạo barrel `index.ts`.
- Code trong app dùng alias `@/*`; code dùng chung dùng subpath `@repo/*`.

### Mock-first và API thật

Trong mock mode, browser/server adapter của `@repo/api-sdk` khởi động MSW và intercept request. Khi tắt mock mode, cùng API SDK sẽ gọi endpoint thật.

Kiến trúc production mục tiêu dùng same-origin API proxy:

```text
browser -> https://<app-domain>/api/* -> reverse proxy -> Backend deployment
```

Storefront, Admin và CMS có domain độc lập. Refresh cookie là first-party, host-only cho từng app; proxy không chứa business logic.

Sau API v1 handshake, versioned OpenAPI artifact từ Backend là transport contract canonical. `@repo/schemas` và API SDK phải được generate/adapt theo phiên bản đã pin thay vì tự drift khỏi Backend.

## Ứng dụng

### `apps/storefront`

Đặc điểm chính:

- Next.js App Router với locale segment `app/[locale]/...`.
- Locale hiện có: `vi`, `en`; fallback về `vi`.
- Public shopping routes, auth routes, account/checkout routes.
- TanStack Query cho server state và Zustand cho shared client state.
- Serwist service worker chỉ bật ngoài development để không xung đột với MSW service worker.
- SEO-facing nên có performance budget chặt hơn Admin/CMS.

Các nhóm route hiện có:

```text
/{locale}
/{locale}/home
/{locale}/categories/{slug}
/{locale}/products
/{locale}/products/{slug}
/{locale}/search
/{locale}/cart
/{locale}/checkout
/{locale}/checkout/success
/{locale}/profile
/{locale}/orders
/{locale}/orders/{id}
/{locale}/login
/{locale}/register
/{locale}/forgot-password
/{locale}/reset-password/{token}
```

### `apps/admin`

Đặc điểm hiện tại:

- Next.js App Router.
- Protected route group tại `app/(protected)`.
- App providers và TanStack Query foundation.
- Có feature nhỏ dùng UI + schemas + API SDK để chứng minh app shell boot đúng.

Product/Category/Inventory/Order/Staff screens đầy đủ chưa nên được suy ra chỉ từ app shell hiện tại; chúng được triển khai qua các issue Admin tương ứng.

### `apps/cms`

Đặc điểm hiện tại:

- Next.js App Router.
- Protected route group tại `app/(protected)`.
- App providers và TanStack Query foundation.
- Có feature nhỏ dùng UI + schemas + API SDK để chứng minh app shell boot đúng.

Hero/Homepage/Collection/Promotion/SEO/Blog/Campaign workflows đầy đủ chưa nên được suy ra chỉ từ app shell hiện tại; chúng được triển khai qua các issue CMS tương ứng.

## Shared packages

Chỉ các package thực sự có trong workspace hiện tại được liệt kê dưới đây.

| Package                 | Trách nhiệm                                                                                       | Ví dụ subpath                     |
| ----------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------- |
| `@repo/api-sdk`         | Fetch client, auth runtime adapter, endpoints, MSW handlers và test adapters                      | `@repo/api-sdk/endpoints/auth`    |
| `@repo/schemas`         | Zod schemas và transport types cho Catalog, Cart, Wishlist, error envelope — baseline chuyển tiếp trước API v1 handshake (Decision #64) | `@repo/schemas/catalog`           |
| `@repo/ui`              | Radix-based primitives và layout helpers                                                          | `@repo/ui/button`                 |
| `@repo/shared`          | Utilities, notifications, generic states và reusable hooks                                        | `@repo/shared/utils`              |
| `@repo/design-tokens`   | Color, semantic, spacing, typography, radius, shadow, motion, breakpoint và z-index tokens        | `@repo/design-tokens/colors`      |
| `@repo/tailwind-config` | Tailwind preset, theme CSS, content paths và plugins                                              | `@repo/tailwind-config/theme.css` |
| `@repo/eslint-config`   | Base, React và Next.js ESLint flat configs                                                        | `@repo/eslint-config/next`        |
| `@repo/ts-config`       | Strict TypeScript configs cho base, Next.js và React library                                      | `@repo/ts-config/nextjs.json`     |

Một số tài liệu kiến trúc còn mô tả package tương lai như `commerce`, `hooks` hoặc `utils`. Không import hoặc document chúng như package đã tồn tại cho tới khi workspace thật được tạo.

## Tech stack

| Nhóm                  | Công nghệ                                                                               |
| --------------------- | --------------------------------------------------------------------------------------- |
| Runtime/workspace     | Node.js LTS, pnpm workspace, Turborepo, TypeScript strict                               |
| App framework         | Next.js App Router, React 19                                                            |
| Styling/UI            | Tailwind CSS v4, CSS custom properties, Radix UI, CVA, Lucide, shadcn-style composition |
| Contract              | Zod, versioned OpenAPI direction                                                        |
| Data                  | TanStack Query, custom API SDK, MSW                                                     |
| Client state          | Zustand                                                                                 |
| Forms                 | React Hook Form, `@hookform/resolvers`                                                  |
| Localization          | `next-intl` (`vi`, `en`)                                                                |
| Unit/integration test | Vitest, Testing Library, User Event, jsdom                                              |
| End-to-end test       | Playwright                                                                              |
| Monitoring            | Sentry integration ở Storefront                                                         |
| PWA                   | Serwist ở Storefront, production only                                                   |

Version chính xác được pin trong từng `package.json` và `pnpm-lock.yaml`; README không thay thế lockfile.

## Cấu trúc repository

```text
.
├── apps/
│   ├── storefront/          # Customer-facing application
│   ├── admin/               # Internal operations application
│   └── cms/                 # Content authoring application
├── packages/
│   ├── api-sdk/             # API entrypoint + MSW
│   ├── schemas/             # Zod contracts
│   ├── ui/                  # Shared UI primitives/layout
│   ├── shared/              # Generic shared code
│   ├── design-tokens/       # Design token source
│   ├── tailwind-config/     # Shared Tailwind setup
│   ├── eslint-config/       # Shared lint rules
│   └── ts-config/           # Shared TS configs
├── docs/
│   ├── 00-core/             # Canonical requirements, glossary, ADRs, decisions
│   ├── 01-delivery/         # Delivery, security and traceability docs
│   ├── 99-reference/        # Historical/reference material
│   └── FE/                  # FE overview, architecture and execution
├── .github/workflows/       # CI and PR title checks
├── .husky/                  # Git hooks
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Bắt đầu nhanh

### Yêu cầu môi trường

- Git.
- Node.js LTS; CI hiện dùng Node.js 24.
- pnpm `10.28.2`, đúng với trường `packageManager` ở root.

Kiểm tra package manager:

```bash
corepack enable
corepack pnpm@10.28.2 --version
```

Nếu máy đã cài một pnpm global khác phiên bản, ưu tiên gọi `corepack pnpm@10.28.2` để tránh lỗi version mismatch.

### Clone và cài dependency

```bash
git clone git@github.com:LuongCongThanh/fe-ecommerce-nike-style.git
cd fe-ecommerce-nike-style
corepack pnpm@10.28.2 install --frozen-lockfile
```

### Chạy từng app

```bash
# Storefront: http://localhost:3000
corepack pnpm@10.28.2 --filter storefront dev

# Admin: http://localhost:3001
corepack pnpm@10.28.2 --filter admin dev -- --port 3001

# CMS: http://localhost:3002
corepack pnpm@10.28.2 --filter cms dev -- --port 3002
```

Root có script `pnpm dev` để chạy song song các workspace, nhưng các app đều mặc định chọn port `3000`. Khi cần chạy cả ba, dùng lệnh riêng với port rõ ràng như ví dụ trên.

## Biến môi trường

Repository hiện chưa có `.env.example`. Tạo `.env.local` trong app cần chạy và chỉ khai báo biến phù hợp với luồng đang phát triển.

Baseline cho mock mode:

```dotenv
NEXT_PUBLIC_API_MOCKING=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Các biến được source hiện tại đọc trực tiếp:

| Biến                                | Phạm vi           | Ý nghĩa                                                                 |
| ----------------------------------- | ----------------- | ----------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_MOCKING`           | Cả ba app/API SDK | `true` để boot MSW adapters                                             |
| `NEXT_PUBLIC_SITE_URL`              | API SDK           | Absolute origin cho server-side fetch; mặc định `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL`               | Storefront        | Base URL cho canonical metadata và URL ứng dụng                         |
| `NEXT_PUBLIC_APP_NAME`              | Storefront        | Tên site trong metadata                                                 |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Storefront        | Cloudinary cloud name cho image URL builder                             |
| `NEXT_PUBLIC_SENTRY_DSN`            | Storefront        | DSN cho Sentry nếu monitoring được bật                                  |
| `PLAYWRIGHT_BASE_URL`               | E2E               | Override base URL của Playwright                                        |
| `ANALYZE`                           | Storefront build  | `true` để bật bundle analyzer                                           |

Không commit secret vào Git. Các biến có tiền tố `NEXT_PUBLIC_` được đưa vào client bundle và không được chứa secret.

## Lệnh thường dùng

Chạy từ root:

| Lệnh                | Mục đích                                                           |
| ------------------- | ------------------------------------------------------------------ |
| `pnpm dev`          | Chạy song song các workspace có script `dev`; cần xử lý port riêng |
| `pnpm build`        | Build toàn bộ workspace qua Turborepo                              |
| `pnpm lint`         | Chạy ESLint ở workspace có script lint                             |
| `pnpm typecheck`    | Chạy TypeScript `--noEmit`                                         |
| `pnpm test`         | Chạy unit/integration tests                                        |
| `pnpm test:e2e`     | Chạy E2E ở workspace có script tương ứng                           |
| `pnpm format`       | Áp dụng Prettier toàn repo và ESLint autofix cho Storefront        |
| `pnpm format:check` | Kiểm tra format ở workspace có khai báo script                     |
| `pnpm clean`        | Chạy clean task qua Turborepo                                      |

Chạy một task cho riêng workspace:

```bash
pnpm --filter storefront lint
pnpm --filter admin typecheck
pnpm --filter cms test
pnpm --filter @repo/schemas test
pnpm --filter @repo/api-sdk test
```

## Quy ước phát triển

### Imports và module boundaries

```ts
// App-local import
import { ROUTES } from '@/shared/constants/routes';

// Shared package subpath import
import { Button } from '@repo/ui/button';
import { ProductListResponseSchema } from '@repo/schemas/catalog';
```

Không dùng:

- Parent-relative import để đi xuyên module (`../../...`).
- Deep import vào private file của feature/package khác.
- Barrel `index.ts` để gom exports.
- `fetch`/Axios trực tiếp trong feature nếu endpoint thuộc API SDK.

### State ownership

| Loại state               | Nơi quản lý                               |
| ------------------------ | ----------------------------------------- |
| Server/API state         | TanStack Query                            |
| Shared client state      | Zustand                                   |
| Form state               | React Hook Form                           |
| Filter, sort, pagination | URL/search params khi cần share/deep-link |
| Local interaction state  | React component state                     |

### Git workflow

- `main`: stable, chỉ nhận Release PR từ `dev`.
- `dev`: integration branch và default branch.
- Feature/docs/fix branch tạo từ `dev`.
- Commit và PR title dùng Conventional Commits.
- Feature branch merge vào `dev` bằng squash merge.

Tên branch:

```text
<type>/<issue-number>-<slug>
```

Ví dụ:

```text
feat/9-storefront-catalog-browse
docs/4-project-readme
```

Chi tiết xem [CONTRIBUTING.md](./CONTRIBUTING.md).

## Testing và CI

### Test layers

- Unit/integration: Vitest + Testing Library.
- API contract/adapters: tests trong `@repo/schemas` và `@repo/api-sdk`.
- Browser flows: Playwright ở Storefront.
- Mock transport: MSW browser/server adapters.

Storefront Vitest chỉ collect các file dưới `src/**/__tests__` theo config hiện tại. Playwright chạy Chromium, Firefox và WebKit; CI bật retry và giữ trace/video khi phù hợp.

### CI gates

Pull request và push lên `main`/`dev` chạy:

```text
pnpm install --frozen-lockfile
pnpm run lint
pnpm run format:check
pnpm run typecheck
pnpm run test
```

PR title được kiểm tra riêng theo Conventional Commits. Branch protection yêu cầu CI xanh trước khi merge.

Trước khi push, nên chạy tối thiểu:

```bash
pnpm run lint
pnpm run format:check
pnpm run typecheck
pnpm run test
```

## Tài liệu canonical

Bắt đầu tại [docs/README.md](./docs/README.md).

Đường đọc dành cho FE:

1. [SRS](./docs/SRS.md)
2. [FE overview](./docs/FE/FE.md)
3. [FE architecture](./docs/FE/FE-ARCHITECTURE.md)
4. [FE execution](./docs/FE/FE-EXECUTION.md)
5. [Testing](./docs/TEST.md)

Thứ tự ưu tiên khi tài liệu mâu thuẫn:

1. [Functional requirements](./docs/00-core/requirements/functional-requirements.md)
2. [Glossary](./docs/00-core/glossary.md)
3. [ADRs](./docs/00-core/adr/)
4. [Decision log](./docs/00-core/decision-log.md)
5. [SRS](./docs/SRS.md)
6. Tài liệu FE/BE/Test/DevOps
7. Reference/historical documents

README là tài liệu onboarding, không phải nguồn sự thật để thay đổi business rules.

## Các lưu ý hiện tại

- Backend nằm ở repository riêng; không import source hoặc schemas trực tiếp từ Backend.
- Một số tài liệu cũ vẫn mô tả trạng thái “chưa scaffold” hoặc package chưa tồn tại; luôn đối chiếu với source tree.
- Một số file Storefront được kế thừa từ codebase cũ và có thể chứa tên Django/payment gateway. MVP canonical vẫn là NestJS backend riêng và COD-only.
- Root `pnpm dev` cần port riêng cho từng app nếu chạy đồng thời.
- Root `format:check` chỉ chạy ở workspace có khai báo script tương ứng.
- Không có `.env.example`; khi thêm biến runtime mới, nên cập nhật README hoặc tạo template không chứa secret.

## Liên kết nhanh

- [GitHub Issues](https://github.com/LuongCongThanh/fe-ecommerce-nike-style/issues)
- [Pull Requests](https://github.com/LuongCongThanh/fe-ecommerce-nike-style/pulls)
- [Contributing guide](./CONTRIBUTING.md)
- [Security baseline](./docs/01-delivery/security/security-baseline.md)
- [Requirements traceability](./docs/01-delivery/traceability/requirements-traceability-matrix.md)
