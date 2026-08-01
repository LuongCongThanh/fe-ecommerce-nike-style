# E-commerce Next.js Frontend

Frontend-first e-commerce platform for the Vietnam market — built on Next.js App Router, talking to a Django REST backend.

> **Full documentation lives in [`docs/`](./docs/).**

## Quick Start

```bash
npm install
npm run dev        # Dev server (Turbopack) → http://localhost:3000
```

## Commands

```bash
# Development
npm run dev             # Start dev server (Turbopack)
npm run build           # Production build
npm run start           # Start production server

# Code quality
npm run lint            # ESLint
npm run format          # Prettier (apply)
npm run format:check    # Prettier (check only)

# Testing
npm run test            # Vitest (run once)
npm run test:watch      # Vitest (watch mode)
npm run test:coverage   # Hiện hỏng (scripts/coverage.mjs không tồn tại) — xem issue #10
npm run test:e2e        # Playwright end-to-end

# Utilities
npm run analyze         # Bundle size analysis
```

Tech stack, routing, module structure, state management, quality gates: xem [`docs/architecture/`](./docs/architecture/) — không lặp lại ở đây để tránh 2 nguồn sự thật lệch nhau theo thời gian.

## Import convention — always use `@/*` alias

```ts
// WRONG — triggers ESLint error
import { Foo } from '../_lib/types';

// CORRECT
import { Foo } from '@/shared/lib/http/client';
```

## MVP Scope

**In scope:** storefront (home, category discovery, product detail, search/filter), auth (register, login, forgot/reset password), cart and COD checkout with order confirmation, customer order history and detail, admin (product CRUD + order status workflow), foundational NFRs (responsive UI, basic SEO, error tracking).

**Out of scope (deferred):** online payment gateways, advanced loyalty/voucher engine, marketplace/multi-vendor, advanced BI dashboards.

Chi tiết đầy đủ (personas, KPI, acceptance criteria) và roadmap theo phase: [`docs/planning/01-mvp-overview.md`](./docs/planning/01-mvp-overview.md), [`docs/planning/02-roadmap.md`](./docs/planning/02-roadmap.md) (snapshot 06/2026).

## Documentation

Bản đồ tài liệu đầy đủ: [`docs/README.md`](./docs/README.md) — chia 2 tầng: **tầng sống** (`docs/architecture/`, phải luôn đúng với code) và **tầng lịch sử** (`docs/planning/`, `docs/reports/`, snapshot tại thời điểm).

| File                                                                             | Contents                                                                                               |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [`docs/architecture/tech-stack.md`](./docs/architecture/tech-stack.md)           | Tech stack theo layer                                                                                  |
| [`docs/architecture/conventions.md`](./docs/architecture/conventions.md)         | Coding conventions: imports, naming, typing, i18n, SEO, commit                                         |
| [`docs/architecture/frontend/README.md`](./docs/architecture/frontend/README.md) | Module structure, routing, state, API client, auth, authorization, design system, testing, performance |
| [`docs/adr/`](./docs/adr/)                                                       | Quyết định kiến trúc (ADR)                                                                             |
| [`docs/planning/01-mvp-overview.md`](./docs/planning/01-mvp-overview.md)         | Business scope, personas, KPIs, acceptance criteria (snapshot 06/2026)                                 |
| [`docs/planning/02-roadmap.md`](./docs/planning/02-roadmap.md)                   | Phase plan, delivery gates, RACI, risk register, priority backlog (snapshot 06/2026)                   |
