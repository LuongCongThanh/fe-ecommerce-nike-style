# Cấu trúc module Storefront

Đối chiếu checkout ngày 18/11/2026. Tài liệu này thay thế cây đề xuất di chuyển từng file: source đã chuyển sang `features/shared`, test đã đặt cạnh mã và Vitest đã dùng `src/testing/setup.ts`.

## Cây hiện tại

```text
src/
├── app/                  # Route, layout, metadata, error và composition Next.js
│   ├── [locale]/         # Entry point auth/shop theo vi và en
│   ├── _composition/     # AppProviders ghép provider cấp app
│   └── ~offline/         # Trang PWA offline
├── features/
│   ├── account/          # Hồ sơ và địa chỉ
│   ├── auth/             # Session, đăng nhập và bảo vệ UX
│   ├── cart/             # Giỏ hàng
│   ├── catalog/          # Danh sách, chi tiết, danh mục và search
│   ├── checkout/         # Checkout và kết quả
│   ├── home/             # Trang chủ và motion
│   ├── orders/           # Danh sách và chi tiết đơn
│   ├── storefront-shell/ # Header, footer và phối hợp session/giỏ/wishlist
│   └── wishlist/         # Danh sách yêu thích
├── shared/               # UI, hooks, providers, types và tiện ích dùng chung
├── lib/
│   ├── api/              # HTTP, endpoints, OpenAPI và MSW chuyển tiếp
│   └── schemas/          # Validation/transport schema hiện có
├── testing/              # Setup Vitest và renderWithProviders
├── i18n/                 # Routing và request locale
├── lang/                 # Nội dung vi/en
├── pwa/                  # Service worker
└── styles/               # CSS dùng chung

e2e/                      # Playwright
scripts/                  # Generator, gate và task runner
docs/
├── agents/               # Convention và local tracker
├── adr/                  # Quyết định và hồ sơ lịch sử có nhãn
├── plan/                 # Kế hoạch, task và Wayfinder map
└── reference/            # Tư liệu tham khảo, không phải quy tắc triển khai
```

## Quy tắc sở hữu

- `app` giữ entry point theo Next.js; UI, hook và điều phối màn hình thuộc feature. Giữ URL, metadata, layout và hai locale khi refactor.
- Tạo `components`, `hooks`, `queries`, `stores`, `services`, `schemas`, `types` hoặc `constants` chỉ khi có file thực tế cần sở hữu. Không tạo thư mục rỗng hoặc barrel mới.
- Logic nghiệp vụ dùng qua nhiều route vẫn thuộc feature. UI và tiện ích không gắn nghiệp vụ thuộc `shared`; PageShell ở `shared/ui`. HTTP đi qua `lib/api`.
- TanStack Query giữ server state, URL giữ filter/sort/pagination, Zustand giữ client state dùng chung. Không đổi quyền sở hữu dữ liệu trong một lần chỉ di chuyển file.
- Test đặt cạnh mã hoặc điểm vào của luồng. Helper dùng chung import từ `@/testing/render`; setup ở `src/testing/setup.ts`; E2E ở `e2e`.

## Phần còn lại

Di chuyển source sang `features/shared` đã có trong checkout. Cutover session, giỏ hàng, checkout và orders sang API thật vẫn theo [kế hoạch storefront](storefront-restructure-plan.md); không coi việc đổi thư mục là hoàn tất cutover.

Trước khi xóa adapter, role cũ, mock, dependency hoặc asset, kiểm tra consumer, URL động, convention Next.js, generator và test. Giữ MSW cho các luồng chưa có API. Sau khi di chuyển, rà import cũ và chạy gate theo [workflow phát triển](../../CONTRIBUTING.md#development-workflow).

Schema form thuộc feature auth/account/checkout. Catalog sở hữu badge UI; transport types và quy tắc chuyển trạng thái đơn nằm ở SDK/schema. Query gọi endpoint trực tiếp khi service chỉ đổi tên hàm; giữ service có session side effect hoặc fallback thực sự như `getOrderOrNull`.
