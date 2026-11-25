# Plan 34: Nền kiểm chứng và baseline có thể tái lập

Branch: `refactor/34-storefront-verification-foundation` (từ `dev`). Một PR vào `dev`; không đổi behavior production.

## Phạm vi

- Tạo `e2e/support/catalog-server.ts`, `catalog-fixtures.ts` và test cho HTTP harness; fixture phải theo generated contract đang pin và làm nguồn dữ liệu chung cho browser lẫn server.
- Cập nhật các E2E trong manifest để dùng harness và khớp hành vi source hiện tại; giữ PDP purchase disabled, không dùng PDP để seed cart/checkout.
- Tạo `playwright.production.config.ts` cùng production runtime/PWA specs; CI chạy production build riêng và job Chromium production, không đổi dev Playwright config thành production.
- Cập nhật script, `.env.example`, README/tài liệu test và `docs/architecture.md` theo đúng harness/gates mới. Không sửa feature/backend, không bật API bypass hoặc bỏ/giảm coverage.
- `.env.example` đã có đủ các URL public, mock flag và `API_ORIGIN`; xác nhận giữ nguyên thay vì tạo diff không cần thiết.

## Coverage baseline bổ sung đã được duyệt

Lần đo đầu của coverage scope hiện có là 95.23% statements, 87.9% branches, 93.65% functions và 96.4% lines. Người dùng duyệt bổ sung test public-behavior trong manifest để đáp ứng threshold 99%, không đổi implementation, threshold hay tập file được đo. Các seam và file cụ thể được ghi trong `manifest.md`. Nhánh `useMediaQuery` effect guard khi thiếu `window` không được gọi trong SSR vì React không chạy effect ở server; không mock React nội bộ để ép nhánh.

## Seams kiểm thử

- HTTP harness public endpoint: request `GET /api/v1` theo contract pin trả payload catalog cố định; probe kiểm method/path/query, response contract, fixture 404/empty/5xx/delay và request log/count. Catches contract drift và dữ liệu không tái lập; không chứng minh Backend thật.
- Browser qua Next rewrite: catalog/search/PDP assertions và flow checkout setup kiểm browser tới cùng HTTP harness, giữ URL, locale, filter/search, trạng thái not-found và disabled purchase. Catches rewrite/client behavior; không tự chứng minh SSR HTML.
- Production HTTP/SSR: Playwright Chromium đọc HTML response trước khi JavaScript chạy, rồi kiểm hydration/runtime trên server production riêng. Catches production-only render/wiring; không thay full E2E ba engine.
- Production PWA: worker registration/controller và navigation offline tới URL chưa cache phải dẫn fallback theo policy hiện tại. Catches service-worker path; không khẳng định offline checkout hay hỗ trợ mọi engine.
- Unit/integration harness test chỉ kiểm hợp đồng quan sát được qua HTTP, không import private state hoặc phụ thuộc implementation.

## Các bước

1. [ ] (Bỏ qua, xem report) Chạy baseline hiện tại trên Node 24/pnpm 11.24: focused Chromium `e2e/catalog.spec.ts`, `search.spec.ts`, `pdp.spec.ts`, `checkout.spec.ts`; lưu command, exit code và failure/artifact trong report, không chỉnh test trước khi ghi nhận.
2. [x] Chốt các seams trên trước khi thêm/sửa assertion mới; cập nhật manifest theo các consumer/config thực tế.
3. [ ] (Harness và test đã có; không có bằng chứng bước chạy đỏ) Viết một HTTP harness probe test đầu tiên; chạy đỏ, triển khai server/fixture tối thiểu, chạy xanh và mở rộng theo từng behavior của spec.
4. [x] Thích ứng browser setup/assertions theo baseline và behavior hiện tại; chạy focused Chromium với harness, giữ nguyên các behavior assertion hợp lệ.
5. [x] Thêm production Playwright config/spec và CI production gate; build production riêng, xác minh SSR/runtime/PWA đúng boundary, không placeholder.
6. [x] Cập nhật README, `.env.example`, architecture và task report/metric; rà diff, file path/consumer, coverage scope và rollback.
7. [x] Chạy focused test/lint/browser trước; sau đó root gates `pnpm lint`, `pnpm format:check`, `pnpm docs:check`, `pnpm typecheck`, `pnpm test`, `pnpm test:coverage`, `pnpm build`, focused Chromium và full `pnpm test:e2e` ba engine; chạy production Chromium bằng config riêng.
8. [ ] Ghi report/metric với kết quả thật; review theo spec. Mở PR vào `dev`; chỉ sau khi merge mới chuyển status `done` và cập nhật index.

## Rủi ro

- Catalog E2E hiện phụ thuộc API/backend và fixture kỳ vọng có thể lệch source. Baseline phải ghi rõ drift; không phục hồi behavior PDP đã disabled.
- Next server-side API reader và browser rewrite phải trỏ đúng cùng harness, nhưng env của production build/server không được vô tình dùng `.env.local` hoặc Backend thật.
- PWA test cần production build, service workers enabled và context sạch; không coi truy cập trực tiếp `/~offline` là offline evidence.
- CI hiện chưa có browser/coverage gate; thêm job phải quản lý server/harness port và đảm bảo CI không nhận nhầm devserver.
