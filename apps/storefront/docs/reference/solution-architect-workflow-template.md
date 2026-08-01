> 📌 **Không áp dụng trực tiếp cho repo này** — file mô tả quy trình "Solution Architect" tổng quát cho stack NestJS/PostgreSQL/Ant Design/AWS (xem mục 12), không khớp stack thật của repo (Next.js + Django REST + Radix/Tailwind, xem [`architecture/tech-stack.md`](../architecture/tech-stack.md)). Giữ lại vì danh mục ở **Giai đoạn 2 — Front-end Architecture** bên dưới (Module structure, Routing, State ownership, API client, Authentication UI flow, Authorization, Error handling, Design System integration, Performance, Front-end testing) đã được dùng làm khung để tái cấu trúc [`architecture/frontend/`](../architecture/frontend/README.md). Giai đoạn 1, 3, 4, 5 và toàn bộ nội dung backend/cloud/mục 12 không áp dụng cho repo này.

Giai đoạn 1 — Requirements và Solution Overview

Dùng:

architecture
docs-architect

Output:

- Business context
- Functional requirements
- Non-functional requirements
- Constraints
- Assumptions
- System scope
- External systems
- Initial solution options
- Trade-off matrix

  Giai đoạn 2 — Front-end Architecture

Dùng:

frontend-architecture
nextjs-app-router-patterns

Output:

- Module structure
- Routing
- State ownership
- API client
- Authentication UI flow
- Authorization
- Error handling
- Design System integration
- Performance
- Front-end testing

  Giai đoạn 3 — Data và Back-end Architecture

Dùng:

database-architect
backend-architect
architecture-patterns

Output:

- Domain model
- Database model
- Service/module boundaries
- API contracts
- Events
- Transactions
- Caching
- Background jobs
- Error model
- Resilience
- Testing

architecture-patterns cung cấp các pattern như Clean Architecture, Hexagonal Architecture và DDD, nhưng cũng cảnh báo tránh áp dụng kiến trúc phức tạp cho hệ thống CRUD đơn giản.

Giai đoạn 4 — Cloud, Security và Operations

Dùng:

cloud-architect
threat-modeling-expert
observability-engineer

Output:

- Deployment topology
- Networking
- Identity and access
- Secrets
- Encryption
- Logging
- Metrics
- Tracing
- Alerting
- Scaling
- Backup
- Disaster recovery
- Cost considerations
  Giai đoạn 5 — Documentation và Diagrams

Dùng:

docs-architect
c4-architecture-c4-architecture
architecture-decision-records
mermaid-expert

Output:

- C4 Context
- C4 Container
- Selected C4 Components
- Sequence diagrams
- ERD
- Deployment diagram
- API diagrams
- ADRs
- Final architecture handbook

11. Cấu trúc tài liệu Solution Architecture nên tạo
    docs/
    └── architecture/
    ├── README.md
    ├── 01-executive-summary.md
    ├── 02-business-context.md
    ├── 03-scope-and-requirements.md
    ├── 04-non-functional-requirements.md
    ├── 05-system-context.md
    ├── 06-solution-overview.md
    │
    ├── frontend/
    │ ├── frontend-overview.md
    │ ├── module-architecture.md
    │ ├── routing.md
    │ ├── state-management.md
    │ ├── api-integration.md
    │ ├── authentication.md
    │ ├── design-system.md
    │ ├── performance.md
    │ └── testing.md
    │
    ├── backend/
    │ ├── backend-overview.md
    │ ├── domain-boundaries.md
    │ ├── module-boundaries.md
    │ ├── api-contracts.md
    │ ├── authentication.md
    │ ├── authorization.md
    │ ├── events.md
    │ ├── transactions.md
    │ ├── caching.md
    │ ├── resilience.md
    │ └── testing.md
    │
    ├── data/
    │ ├── data-architecture.md
    │ ├── erd.md
    │ ├── indexing.md
    │ ├── multi-tenancy.md
    │ ├── retention.md
    │ └── migration.md
    │
    ├── infrastructure/
    │ ├── cloud-architecture.md
    │ ├── network.md
    │ ├── deployment.md
    │ ├── ci-cd.md
    │ ├── observability.md
    │ ├── disaster-recovery.md
    │ └── cost.md
    │
    ├── security/
    │ ├── security-architecture.md
    │ ├── threat-model.md
    │ ├── data-protection.md
    │ └── access-control.md
    │
    ├── diagrams/
    │ ├── c4-context.md
    │ ├── c4-container.md
    │ ├── c4-components.md
    │ ├── sequences.md
    │ └── deployment.md
    │
    ├── decisions/
    │ ├── 0001-example.md
    │ └── README.md
    │
    └── roadmap/
    ├── implementation-phases.md
    ├── risks.md
    └── migration-plan.md
12. Prompt hoàn chỉnh nên dùng
    Act as a Solution Architect.

Use these skills in sequence:

1. architecture
2. frontend-architecture
3. database-architect
4. backend-architect
5. cloud-architect
6. docs-architect
7. c4-architecture-c4-architecture
8. architecture-decision-records

Project stack:

- Frontend: Next.js App Router, React, TypeScript
- UI: Ant Design and Tailwind CSS
- State: TanStack Query and project-approved client state
- Backend: NestJS, TypeScript
- Database: PostgreSQL
- Cloud: AWS
- Testing: Jest, React Testing Library and Playwright

Goal:
Produce a complete solution architecture document for the system.
Do not implement or modify production code.

First analyze:

- Business context
- Functional requirements
- Non-functional requirements
- Users and roles
- Scale assumptions
- Data sensitivity
- Compliance requirements
- External integrations
- Team constraints
- Existing codebase and infrastructure

Separate:

- Current architecture: AS-IS
- Proposed architecture: TO-BE
- Migration path from AS-IS to TO-BE

Design:

1. System context
2. Frontend architecture
3. Backend architecture
4. Domain and module boundaries
5. Database and data architecture
6. API and event contracts
7. Authentication and authorization
8. Cloud and deployment architecture
9. Security architecture
10. Observability
11. Resilience and failure handling
12. Performance and scalability
13. Testing strategy
14. CI/CD
15. Disaster recovery
16. Risks and trade-offs

Documentation requirements:

- Generate Markdown documents under docs/architecture/
- Generate C4 Context and Container diagrams
- Generate selected Component diagrams
- Generate sequence diagrams for critical flows
- Generate ERD
- Use Mermaid
- Create ADRs for significant decisions
- Include alternatives considered
- Include rationale and consequences
- Clearly label assumptions and unknowns
- Link conclusions to actual repository files
- Do not invent requirements or infrastructure
- Prefer the simplest architecture that satisfies the requirements

For every architectural recommendation provide:

- Problem being solved
- Decision
- Alternatives considered
- Advantages
- Disadvantages
- Operational complexity
- Security impact
- Cost impact
- Migration impact
- Validation method

Return a document index first, then produce each document.
