# ADR-0004: OpenAPI contract sync

**Status:** Accepted
**Date:** 2026-09-16

## Context

`AGENTS.md` already commits this track to a contract-first build order: define a service's OpenAPI spec, generate the Angular SDK from it (`INFRA-7`), then implement and consume against that generated client. Left unenforced, that order erodes the first time a service's contract changes and someone forgets to regenerate the SDK — the frontend keeps compiling against a stale client while the backend has already moved on, and the drift is invisible until something breaks at runtime. Durion Positivity's production platform hit this exact problem enough times to justify a dedicated CI job ("API Artifacts Sync") that regenerates OpenAPI artifacts and downstream SDKs automatically whenever a backend contract changes, rather than relying on a developer to remember.

## Decision

Contract regeneration is automated, not manual:

- Each service's OpenAPI spec is generated from its code (annotations) as part of its own build, not hand-maintained as a separate document that can drift from the implementation.
- A CI step — either its own job or a step added to `ci-durion.yml` once services exist — regenerates the Angular SDK from the three services' current OpenAPI output on every push that touches a service's contract-relevant code, and fails the build if the regenerated SDK differs from what's committed. This mirrors Durion's own API Artifacts Sync workflow spanning backend, SDK, and frontend.
- The Angular frontend never hand-writes an HTTP call against a service endpoint; it only calls generated SDK methods. A frontend change that needs an endpoint the SDK doesn't yet expose is a signal that the backend contract needs to change first — not a reason to reach for `HttpClient` directly as a shortcut.

## Consequences

- Backend and frontend can't silently drift apart on what a contract looks like — CI catches it at merge time instead of at runtime.
- Adds a real CI step (and its own point of failure) that has to be kept working — accepted deliberately, since the alternative (manual regeneration) is the exact failure mode this ADR exists to close.
- Slightly slows down a backend-only change that touches a contract, since the SDK regeneration step has to run and pass before merge — a reasonable trade for the guarantee.

## Alternatives considered

- **Manually regenerate the SDK when a developer remembers to:** rejected — this is the status quo failure mode Durion's own production experience shows doesn't hold up.
- **Hand-write the Angular HTTP layer instead of generating it:** rejected — defeats the purpose of `INFRA-7` and reintroduces exactly the kind of contract drift this ADR and the broader contract-first build order (`AGENTS.md`) exist to prevent.
