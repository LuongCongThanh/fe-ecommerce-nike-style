# Đề xuất kiến trúc ban đầu

Status: historical stub supporting early ADRs. The initial proposal grouped storefront/admin/CMS as three apps with shared packages in a monorepo; that tree is not current implementation.

[ADR 0001](../adr/0001-single-repo-khong-monorepo.md) records the small-team decision at the time. Today storefront is an independent root app; [architecture](../architecture.md) owns current structure, [API integration](../api-integration.md) owns cross-repo seams and [roadmap](../roadmap.md) owns pending dependencies. Git retains the original proposal.
