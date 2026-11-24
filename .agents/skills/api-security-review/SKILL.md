---
name: api-security-review
description: Perform a static, read-only review of storefront API contracts and client-side authentication or authorization handling. Do not probe live services or perform active security testing.
---

# Read-only API security review

Review only repository code, checked-in API contracts, and documentation provided for the task. This skill does not authorize network requests to running services, active scans, fuzzing, credential use, or state-changing tests.

## Review focus

- Inspect how the client handles authentication state, token/session material, redirects, and API errors without exposing secrets.
- Check API request/response schemas and generated contracts for unsafe assumptions or sensitive data handled by the UI.
- Treat route guards and hidden controls as UX only. Authorization must be enforced by the backend; do not infer server-side enforcement from storefront code.
- Treat backend-only controls as unverified unless their implementation or authoritative contract is included in the review scope.

## Report

For each actionable finding, include the file and relevant code location, explain the violated security boundary and impact at a high level, and give a defensive remediation. Separate confirmed findings from questions or verification gaps. Do not include exploit payloads, proof-of-concept attack steps, or claims based only on the absence of backend code in this repository.
