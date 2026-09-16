# ADR-0002: HTTP status code classification

**Status:** Accepted
**Date:** 2026-09-16

## Context

With three services and a gateway all fielding requests (`ADR-0001`), each one will eventually need to reject a request for some domain reason — a duplicate Company, an Opportunity moved into an invalid stage, a caller without permission. Left undecided, each service (or each developer session working on a service) will pick status codes ad hoc, and the same kind of failure will answer differently depending on which service hit it. This is adapted from Durion Positivity's own production ADR-0017, which exists for exactly this reason and has already been refined once in response to real reviewer disagreement over the 409/422 boundary.

## Decision

Every domain refusal in this track is classified by a fixed, three-question test, checked in this order:

1. **Is this an authorization failure?** (missing credentials, expired token, insufficient permission) → **403**
2. **Does it collide with the target resource's own identity, version, or lifecycle status** — and only those three things? (e.g., editing an Opportunity that's already Closed Won, a stale optimistic-lock version, a duplicate unique key) → **409**
3. **Everything else** — any other domain-policy refusal not covered above → **422**

**400** is reserved for request-shape validation only (malformed JSON, a missing required field, a value that fails basic type/format checks) — never for a domain-policy refusal. **503** is reserved for genuine unavailability (e.g., a dependency not yet healthy), not for domain conditions.

The rule that matters most: resource *state* alone never selects 409. Only identity, version, or lifecycle status do. An Opportunity failing validation because its amount is negative is a 422 (a policy refusal), not a 409, even though it "involves the resource's state" in a loose sense.

## Consequences

- Every service returns predictable, consistent error codes for the same category of failure, which matters for the frontend's error handling and for REQ-14's test suite (it can assert on status codes generically rather than per-service).
- Requires discipline: a developer (or AI session) adding a new domain exception has to think about which bucket it falls into rather than picking whatever "feels right" in the moment. See `ADR-0003` for how this is enforced structurally rather than left to convention alone.
- Some real-world refusals are genuinely ambiguous under this test (Durion's own production version required one rewrite to clarify the 409/422 boundary after reviewers disagreed on it). If a case in this track is ambiguous, resolve it by asking "does this fail because of who/what the resource *is* right now (409) or because of a rule about the request itself (422)" — and if it's still unclear, amend this ADR with the worked example rather than silently picking one.

## Alternatives considered

- **Decide status codes per-endpoint, case by case:** rejected — this is exactly what produces the inconsistency this ADR exists to prevent, and it's the default outcome of not deciding anything.
- **Use only 400 and 422, skip 409 entirely:** simpler, but collapses a real distinction (a duplicate/version conflict vs. a policy violation) that REQ-3 and REQ-6's acceptance criteria implicitly rely on being able to tell apart.
