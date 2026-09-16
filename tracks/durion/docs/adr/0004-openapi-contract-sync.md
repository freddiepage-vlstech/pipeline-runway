# ADR-0004: OpenAPI contract sync

**Status:** Accepted
**Date:** 2026-09-16 (amended 2026-09-17)

## Context

A contract-first build order (spec first, generate the client SDK, implement to satisfy the spec) only holds if the generated client actually stays in sync with the contract — left to a developer remembering to regenerate it, a consumer keeps compiling against a stale client while the producer has already moved on, and the drift is invisible until something breaks at runtime. Durion Positivity's real production platform hit this problem often enough to justify a dedicated CI job that regenerates contract artifacts and downstream SDKs automatically.

## Decision

Contract regeneration is automated, never manual. Each service's API contract is generated from its own code as part of its build, not hand-maintained as a document that can drift from the implementation. A CI step regenerates the client SDK from the current contract on every push that touches contract-relevant code, and fails the build if the regenerated SDK differs from what's committed. Consuming code never hand-writes a call against a service endpoint directly; it only calls generated SDK methods. A consumer's need for an endpoint the SDK doesn't yet expose is a signal the contract needs to change first, not a reason to reach around the SDK as a shortcut.

## Applying this here

Each of `companies-service`, `contacts-service`, and `opportunities-service` generates its OpenAPI spec from annotations (`INFRA-7`); a CI step (its own job, or added to `ci-durion.yml` once services exist) regenerates the Angular SDK from all three services' current contracts and fails if it doesn't match what's committed. The Angular frontend only calls generated SDK methods, never `HttpClient` directly against a service.

## Consequences

- Producer and consumer can't silently drift apart on what a contract looks like — CI catches it at merge time instead of at runtime.
- Adds a real CI step, and its own point of failure, that has to be kept working — accepted deliberately, since manual regeneration is the exact failure mode this ADR exists to close.
- Slightly slows down a producer-only change that touches a contract, since the regeneration step has to run and pass before merge — a reasonable trade for the guarantee.

## Alternatives considered

- **Manually regenerate the SDK when a developer remembers to:** rejected — the status quo failure mode Durion's own production experience shows doesn't hold up.
- **Hand-write the client HTTP layer instead of generating it:** rejected — reintroduces exactly the contract drift this ADR and the broader contract-first build order exist to prevent.

## Amendment (2026-09-17)

The Decision was rewritten to describe the sync policy generically (producer generates its contract from code, CI regenerates and verifies the client, consumers never hand-write calls) without naming this project's specific services or workflow file. Those specifics moved to the new "Applying this here" section. No behavior changed.
