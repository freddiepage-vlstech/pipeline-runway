# Architecture Decision Records — Durion Track

Read these in numeric order before doing implementation work (see `AGENTS.md`). Each one is binding until superseded by a later ADR that explicitly says so.

| # | Title | Status |
|---|---|---|
| [0001](0001-service-boundaries-and-conventions.md) | Service boundaries and shared conventions | Accepted (amended 2026-09-16 — event-only between services) |
| [0002](0002-http-status-code-classification.md) | HTTP status code classification | Accepted |
| [0003](0003-domain-exceptions-own-their-status-code.md) | Domain exceptions own their status code | Accepted |
| [0004](0004-openapi-contract-sync.md) | OpenAPI contract sync | Accepted |
| [0005](0005-company-deactivation-cascade.md) | Company deactivation cascade | Accepted |

ADR-0002 through ADR-0004 are adapted from Durion Positivity's real production ADRs (ADR-0017, ADR-0056, and its API Artifacts Sync CI pattern, respectively) — reused because they're general-purpose engineering decisions, not because this track needs everything the production platform has. ADR-0001's event-only revision is likewise adapted from real Durion's ADR-0044. ADR-0005 resolves REQ-1's own deferred "document the choice in an ADR" acceptance criterion, using ADR-0001's event pattern to do real cross-service business logic (not just replica-freshness) — see each ADR's Context section for what was adapted vs. skipped.

Use [`template.md`](template.md) for new ADRs. Number sequentially — never reuse or renumber.
