# FE E-commerce Nike Style

Storefront thời trang chạy bằng Next.js App Router tại root, hỗ trợ tiếng Việt và tiếng Anh. API nghiệp vụ nằm trong repo `be-demo`. Back-office nằm trong repo `cms`.

## Chạy local

Dùng Node.js 24 và phiên bản pnpm khai báo trong `package.json`. Khởi động `be-demo` với dữ liệu danh mục để duyệt sản phẩm.

```bash
corepack pnpm install --frozen-lockfile
cp .env.example .env.local
corepack pnpm dev
```

Mở `http://127.0.0.1:3000`. Next.js chuyển tiếp `/api/v1/*` đến `API_ORIGIN`. Catalog luôn đọc API thật. Các luồng tài khoản, giỏ hàng, checkout, wishlist và đơn hàng còn dùng dữ liệu giả khi bật `NEXT_PUBLIC_API_MOCKING` cho phát triển local.

## Cấu trúc

| Đường dẫn | Trách nhiệm |
| --- | --- |
| `src/app/[locale]/` | Entry point route và layout của App Router |
| `src/features/` | Màn hình và module nghiệp vụ |
| `src/shared/ui/` | UI primitives và trạng thái hiển thị dùng chung |
| `src/lib/api/` | HTTP client, endpoint, hợp đồng sinh từ OpenAPI và MSW chuyển tiếp |
| `src/lib/schemas/` | Zod validation hiện có |
| `src/i18n/` | Locale routing và cấu hình bản dịch |
| `src/shared/` | Utilities, hooks, UI và kiểu dữ liệu dùng chung hiện có |

Gọi API qua `src/lib/api`. Dùng TanStack Query cho server state và URL cho bộ lọc có thể chia sẻ. Thuật ngữ nghiệp vụ theo glossary của `be-demo`.

## Kiểm tra

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

`pnpm gen:api` sinh `src/lib/api/generated/openapi.ts` từ tag pin trong `scripts/gen-api.mjs`. CI kiểm tra file sinh khớp với tag. `pnpm test:e2e` chạy Playwright.

- [Kế hoạch tái cấu trúc Storefront](docs/plan/storefront-restructure-plan.md)
- [Quy trình đóng góp](CONTRIBUTING.md)
- [Quy ước repository](AGENTS.md)
