# Hướng dẫn dành cho agent

## Cấu trúc dự án

- pnpm/Turborepo frontend monorepo cho nền tảng thương mại điện tử thời trang và giày tại Việt Nam.
- `apps/storefront`: Next.js App Router; phục vụ khách hàng; hỗ trợ `vi` và `en`.
- `apps/admin`: Vite + TanStack Router; phục vụ vận hành nội bộ; mount tại `/admin`.
- `apps/cms`: Vite + TanStack Router; phục vụ quản trị nội dung; mount tại `/cms`.
- `packages/api-sdk`: lớp truy cập network duy nhất của ứng dụng, bao gồm MSW.
- `packages/schemas`: transport contract bằng Zod.
- `packages/ui`, `packages/shared`, `packages/design-tokens` và các package cấu hình dùng chung.

- Frontend phát triển mock-first; backend production là repository NestJS riêng.
- Không import source backend hoặc gọi API trực tiếp ngoài `@repo/api-sdk`.

## Nguồn sự thật

- `README.md`: phạm vi sản phẩm, kiến trúc, môi trường và quy ước repository.
- `CONTRIBUTING.md`: branch, commit, pull request, hook và CI.
- `docs/FRONTEND-GUIDE.md`: hướng dẫn triển khai frontend.
- `docs/nike-ui-ux-analysis.md`, `design.md` và `vocabulary.md`: định hướng UI.
- `docs/adr/`: các quyết định kiến trúc đã được chấp nhận và có trên branch này.

- Không dựa vào đường dẫn tài liệu trước khi xác nhận nó tồn tại trong checkout hiện tại.
- Nếu tài liệu và code mâu thuẫn, báo rõ thay vì tự suy diễn yêu cầu ảnh hưởng public API hoặc domain behavior.

## Cài đặt và kiểm tra

```bash
corepack pnpm install --frozen-lockfile
```

| Phạm vi   | Lệnh                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------- |
| Lint file | `pnpm --filter <workspace> exec eslint <file>`                                                            |
| Test file | `pnpm --filter <workspace> exec vitest run <file>`                                                        |
| Workspace | `pnpm --filter <workspace> lint && pnpm --filter <workspace> typecheck && pnpm --filter <workspace> test` |

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

- Chạy kiểm tra hẹp trước, sau đó gate cấp root tương ứng với phạm vi thay đổi.
- Chỉ chạy `pnpm test:e2e` khi thay đổi browser flow hoặc hạ tầng E2E.
- Không sửa thủ công file sinh tự động như `apps/*/src/routeTree.gen.ts`.

## Ranh giới triển khai

- Giữ đúng chiều phụ thuộc: route/layout của app -> feature -> UI hoặc utility dùng chung -> API SDK và schema.
- Dùng `@/*` cho import nội bộ app và subpath công khai như `@repo/ui/button` cho package dùng chung.
- Không dùng parent-relative import xuyên module, deep import vào file private của module khác hoặc tạo barrel `index.ts` mới.
- Dùng TanStack Query cho server state, Zustand cho shared client state, React Hook Form cho form và URL cho filter/sort/pagination có thể chia sẻ.
- Guard xác thực phía frontend chỉ phục vụ UX; backend phải chịu trách nhiệm enforce authorization.
- Storefront hỗ trợ hai ngôn ngữ. UI vận hành của Admin và CMS mặc định dùng tiếng Việt.
- Giữ thay đổi theo vertical slice có thể kiểm thử và bổ sung test gần nhất có giá trị.

- Convention chi tiết nằm trong `.claude/rules/` và được nạp theo đường dẫn.
- Xem bản đồ convention và checklist tại `docs/agents/code-conventions.md`.
- `CLAUDE.md` import file này để Codex và Claude Code dùng chung nguồn hướng dẫn cấp repository.

## Quy trình GitHub

- Issue và PRD được quản lý trong GitHub Issues.
- Tạo branch từ `dev` theo `<type>/<issue-number>-<slug>`; dùng Conventional Commits.
- Feature/fix target `dev`; `main` chỉ nhận release PR từ `dev`.
- Triage: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`.
- Không ghi tên AI tool/model/agent/assistant hoặc AI attribution trong commit, PR, review hay GitHub comment; hook và CI enforce các tên phổ biến.
- Không push, mở PR, merge hoặc thay đổi issue nếu người dùng chưa yêu cầu rõ.
