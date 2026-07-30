# End-To-End Traceability Matrix

Generated on July 29, 2026.

## Matrix

| PRD Requirement | SRS Requirement | Technical Design Section | Implementation Task | Test Case | Acceptance Evidence |
|---|---|---|---|---|---|
| `PRD-F017` Storefront MVP scope | `FR-001` to `FR-010`, `AC-001` to `AC-008` | `technical-design.md` sections 3, 5, 6, 7, 9 | `TSK-004`, `TSK-005`, `TSK-006`, `TSK-007` | `FE-UNIT-001`, `FE-UNIT-002`, `FE-UNIT-003`, `FE-INT-001` to `FE-INT-006`, `FE-E2E-001` to `FE-E2E-005` | Passing storefront unit, integration, and Playwright evidence for browse, PDP, search, cart, wishlist, auth, checkout, and locale flows |
| `PRD-F018` Admin MVP scope | `FR-011` to `FR-016`, `AC-009` | `technical-design.md` sections 3, 4, 8, 10, 14 | `TSK-008`, `TSK-010`, `TSK-012` | `FE-INT-101` to `FE-INT-104`, `FE-E2E-101`, `FE-E2E-102`, `SEC-007`, `SEC-008`, `BE-INT-005` | Passing Admin CRUD, order-state, authorization, and audit evidence |
| `PRD-F019` CMS Phase 1 scope | `FR-017` to `FR-019`, `AC-010` | `technical-design.md` sections 3, 4, 7, 8, 10, 14 | `TSK-009`, `TSK-010`, `TSK-012` | `FE-INT-201` to `FE-INT-203`, `FE-E2E-201`, `FE-E2E-202`, `SEC-006`, `SEC-007`, `BE-INT-005` | Passing draft, preview, publish, permission, and sanitized public-render evidence |
| `PRD-F004` COD launch objective | `FR-007`, `BR-008` to `BR-010`, `AC-006` | `technical-design.md` sections 4, 6, 7, 13, 14 | `TSK-007`, `TSK-012` | `FE-E2E-001`, `BE-INT-003` | Successful COD flow in mock mode and then real API mode without duplicate orders |
| `PRD-F006` Storefront VN and EN support | `FR-010`, `BR-002` to `BR-005`, `VR-003`, `AC-008` | `technical-design.md` sections 3, 6, 9, 11 | `TSK-003`, `TSK-009` | `FE-UNIT-003`, `FE-E2E-005`, `FE-INT-203` | Evidence that locale switching works and missing translation falls back to `vi` safely |
| `PRD-F027` Mock-to-real API transition | `FR-020`, `NFR-005`, `AC-012` | `technical-design.md` sections 5, 7, 13, 14 | `TSK-002`, `TSK-012` | `BE-INT-001` to `BE-INT-005` plus contract-parity suite | Schema-parity test results and successful runtime switch by configuration |
| `PRD-F029` Sensitive action enforcement | `PERM-003` to `PERM-005`, `AC-011` | `technical-design.md` sections 8, 10, 12, 14 | `TSK-008`, `TSK-009`, `TSK-010`, `TSK-012` | `SEC-001` to `SEC-008`, `FE-E2E-102`, `FE-E2E-202`, `BE-INT-005` | Security-test evidence for auth hardening, server-side permissions, publish safety, and audit trails |
| `PRD-F039` to `PRD-F044` Success metrics | `NFR-004`, `[Question] analytics ownership` | `technical-design.md` section 12 | `TSK-011` | event-schema validation suite, targeted instrumentation tests | Verified event emissions for documented product metrics without PII leakage |

## Known Gaps

- `GAP-001` Detailed endpoint-level API contracts are referenced by existing traceability docs but are not fully present in this checkout.
- `GAP-002` Granular backend architecture files linked by existing docs are missing from the repository; backend architecture is summarized only. (Frontend side resolved: detailed FE architecture now lives in `docs/FE/FE-ARCHITECTURE.md` and `docs/FE/FE-EXECUTION.md`, not as separate numbered files.)
- `GAP-003` Detailed RBAC beyond the baseline remains open and therefore cannot be traced more deeply without inventing requirements.
- `GAP-004` Real backend technology choices remain open, so backend task execution order after scaffold is still partly conditional.
