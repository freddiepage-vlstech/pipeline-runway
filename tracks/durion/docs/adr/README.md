# Architecture Decision Records — Durion Track

Read these in numeric order before doing implementation work (see `AGENTS.md`). Each one is binding until superseded by a later ADR that explicitly says so.

Each ADR's **Decision** section states a general, portable rule with no project-specific names in it — the kind of thing that could be lifted into a different Java/Spring project as-is. A separate **Applying this here** section maps that rule onto this project's actual services and objects. This mirrors how Durion Positivity's own real ADRs (e.g., ADR-0044) separate a general policy from its concrete, named application.

| # | Title | Status |
|---|---|---|
| [0001](0001-service-decomposition-and-data-consistency.md) | Service decomposition and inter-service data consistency | Accepted (amended 2026-09-16, 2026-09-17) |
| [0002](0002-http-status-code-classification.md) | HTTP status code classification | Accepted (amended 2026-09-17) |
| [0003](0003-domain-exceptions-own-their-status-code.md) | Domain exceptions own their status code | Accepted (amended 2026-09-17) |
| [0004](0004-openapi-contract-sync.md) | OpenAPI contract sync | Accepted (amended 2026-09-17) |
| [0005](0005-dependent-record-flagging-on-deactivation.md) | Dependent-record flagging on upstream deactivation | Accepted (amended 2026-09-17) |

ADR-0002, ADR-0003, and ADR-0001's event-only policy are adapted from Durion Positivity's real production ADRs (ADR-0017, ADR-0056, and ADR-0044, respectively) — reused because they're general-purpose engineering decisions, not because this track needs everything the production platform has. ADR-0004 is adapted from Durion's real "API Artifacts Sync" CI pattern. ADR-0005 resolves REQ-1's own deferred "document the choice in an ADR" acceptance criterion, using ADR-0001's event pattern to do real cross-service business logic. See each ADR's Context section for what was adapted vs. skipped.

Use [`template.md`](template.md) for new ADRs. Number sequentially — never reuse or renumber.
