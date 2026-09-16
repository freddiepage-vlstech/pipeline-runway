# ADR-0002: HTTP status code classification

**Status:** Accepted
**Date:** 2026-09-16 (amended 2026-09-17)

## Context

Any system exposing multiple HTTP APIs across service boundaries needs a single, consistent rule for how a domain refusal maps to a status code — left undecided, each service (or each developer session) picks codes ad hoc, and the same category of failure answers differently depending on which service handled it. This is adapted from Durion Positivity's own production ADR-0017, which exists for exactly this reason and has already been refined once after real reviewer disagreement over the 409/422 boundary.

## Decision

Every domain refusal is classified by a fixed, three-question test, checked in this order:

1. **Is this an authorization failure?** (missing credentials, expired token, insufficient permission) → **403**
2. **Does it collide with the target resource's own identity, version, or lifecycle status** — and only those three things? → **409**
3. **Everything else** — any other domain-policy refusal → **422**

**400** is reserved for request-shape validation only — never a domain-policy refusal. **503** is reserved for genuine unavailability, not domain conditions.

The rule that matters most: resource *state* alone never selects 409. Only identity, version, or lifecycle status do.

## Applying this here

Across `companies-service`, `contacts-service`, `opportunities-service`, and the gateway: editing an Opportunity that's already Closed Won, a stale optimistic-lock version, or a duplicate unique key are 409s; a negative Opportunity amount or any other policy violation is 422; a missing required field is 400. REQ-14's test suite asserts on these codes generically across all three services, not per-service.

## Consequences

- Every service returns predictable, consistent error codes for the same category of failure, which any client (a generated SDK, a test suite) can rely on without knowing which specific service it's talking to.
- Requires discipline: whoever adds a new domain exception (a developer or an AI session) has to think about which bucket it falls into rather than picking whatever feels right. See `ADR-0003` for how this is enforced structurally rather than left to convention.
- Some refusals are genuinely ambiguous under this test — Durion's own production version needed one rewrite to clarify the 409/422 boundary after reviewer disagreement. Resolve an ambiguous case by asking "does this fail because of who/what the resource *is* right now (409), or because of a rule about the request itself (422)" — and if still unclear, amend this ADR with the worked example rather than silently picking one.

## Alternatives considered

- **Decide status codes per-endpoint, case by case:** rejected — this is exactly the inconsistency this ADR exists to prevent, and the default outcome of deciding nothing.
- **Use only 400 and 422, skip 409 entirely:** simpler, but collapses a real distinction (a version/identity conflict vs. a policy violation) this project's own requirements (stage transitions, duplicate detection) rely on being able to tell apart.

## Amendment (2026-09-17)

The Decision was rewritten to remove references to specific requirement numbers and service names, so it reads as a portable classification rule rather than something tied to this project. Those specifics moved to the new "Applying this here" section. No behavior changed.
