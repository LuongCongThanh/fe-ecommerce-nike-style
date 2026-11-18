# ANTIGRAVITY.STORE storefront

Storefront thời trang bằng Next.js App Router, hỗ trợ tiếng Việt và tiếng Anh. Đây là app độc lập ở root; API do `be-demo` sở hữu, back-office do repo `cms` sở hữu. Catalog đọc API thật; các luồng mua hàng và tài khoản còn ở giai đoạn chuyển tiếp MSW.

## Chạy local

Dùng Node.js 24 và pnpm được pin trong `package.json`. Khởi động `be-demo` có dữ liệu catalog trước khi duyệt sản phẩm.

```bash
corepack pnpm install --frozen-lockfile
cp .env.example .env.local
corepack pnpm dev
```

Mở `http://127.0.0.1:3000`. `.env.example` mô tả URL local và mock flag; `API_ORIGIN` là origin backend phía server. Không có backend thì catalog không tự chuyển sang fixture. Không commit secret hoặc `.env.local`.

## Đọc tiếp

Bộ onboarding gồm trang này và năm trang sau:

- [Docs index](docs/README.md): tìm tài liệu theo câu hỏi và chủ sở hữu.
- [Overview](docs/overview.md): capability hiện có, real/mock và giới hạn.
- [Architecture](docs/architecture.md): module, data/state, locale, PWA và 3D.
- [API integration](docs/api-integration.md): proxy, contract pin và cutover.
- [Roadmap](docs/roadmap.md): rebuild còn mở và dependency sản phẩm.

Khi đóng góp đọc [CONTRIBUTING](CONTRIBUTING.md); khi sửa visual đọc [design](design.md); công cụ bắt đầu từ [AGENTS](AGENTS.md).

## Kiểm tra

```bash
pnpm lint
pnpm format:check
pnpm docs:check
pnpm typecheck
pnpm test
pnpm build
```

Chạy focused checks trước. `pnpm test:e2e` dùng Playwright cho browser flow; `pnpm gen:api` sinh type từ contract pin và cần nguồn OpenAPI. `pnpm docs:check` chạy offline để kiểm formatting, local links/anchors, consumer tài liệu đã xóa và graph task; xem phạm vi trong [runner](docs/agents/runner.md).
