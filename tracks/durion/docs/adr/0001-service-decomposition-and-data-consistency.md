# ADR-0001: Service decomposition and inter-service data consistency

**Status:** Accepted
**Date:** 2026-09-14 (amended 2026-09-16, 2026-09-17)

## Context

Any system built as several independently-deployable services has to answer two questions before writing code: how those services are divided, and how they stay consistent with each other's data without becoming tightly coupled. Left undecided, a project drifts toward either an accidental monolith (services calling each other synchronously until an outage anywhere takes everything down) or an inconsistent one (each pairing of services inventing its own ad hoc integration). This project's spec and target stack (Java/Spring Boot microservices, Kafka, Angular, OpenAPI-first) commit to building as separate services but don't specify the decomposition or communication policy — this ADR sets both, adapted from Durion Positivity's real production ADR-0044 ("Event-Only Domain Walls"), whose reasoning about cascading outages and domain models leaking through client DTOs applies to any freshly-decomposed microservices system, not only Durion's own.

## Decision

**Decompose by aggregate root, one write-owner per aggregate.** Each service owns exactly one aggregate root and is the sole writer of its own data. A service boundary is drawn at the aggregate boundary, not at a convenient code-organization line.

**Route all external traffic through a single gateway.** Nothing outside the backend — a frontend, an external client — calls a domain service directly; a gateway is the sole entry point.

**Each service owns an isolated datastore.** No shared tables, no foreign keys crossing a service boundary. A cross-service relationship is stored as an opaque identifier, never joined against another service's tables directly.

**Domain services communicate only through events — never synchronous calls to each other, not even for a simple lookup.** A service that needs another's data for its own reads keeps a read-only local replica, populated exclusively by consuming that owner's published events, never joined against or written by anything else. A service publishes an event for every meaningful change to data it owns, not only for changes some other, unrelated concern happens to need.

**Reliability is structural, not incidental.** Every publisher writes its outgoing event to a transactional outbox in the same database transaction as the state change it describes, with a background process draining that table to the message broker — never publishing directly from request-handling code. Every consumer building a replica keeps a record of processed event IDs so a redelivered event is a no-op.

**Command events and reconciliation are separate, opt-in decisions.** This policy covers reads (replicas) and facts (lifecycle events); it does not by itself require a cross-service write pattern (command events with pending/result states) or a reconciliation job against replica drift — adopt those only when an actual need for a cross-service write arises, documented on its own.

## Applying this here

This project splits into three services along its three aggregate roots: `companies-service` (Company), `contacts-service` (Person/Contact), and `opportunities-service` (Opportunity, the pipeline views' backing data, and both automation triggers). One Spring Cloud Gateway (`INFRA-4`) is the sole entry point for the Angular frontend. Each service gets its own Postgres schema (REQ-12). `opportunities-service` keeps read-only replicas of Company and Person data (`ext_companies_company`, `ext_contacts_person`) fed by `company.events.v1` and `contact.events.v1`; its own automation triggers (REQ-9 Closed Won, REQ-10 stale detection) publish on their own topics, detailed in `INFRA-6`'s own ADR. None of the 14 fixed requirements need a cross-service write, so command events, a dead-letter queue, and reconciliation jobs are explicitly out of scope for now — reasonable hardening to add later if replica drift becomes an actual problem, not before.

## Consequences

- Multiple independently-deployable services with isolated datastores cost real operational overhead (each has its own migrations, health check, and failure mode) compared to a monolith. Accepted deliberately, since demonstrating a genuine microservices decomposition is this benchmark's whole point.
- A consuming service's replica of another service's data can lag by however long the outbox-to-broker-to-consumer path takes — typically seconds. Any UI relying on a replica has to tolerate brief staleness rather than assuming live consistency.
- Every publishing service needs an outbox table and a publisher process, and every consuming service needs a processed-event ledger and its own replica tables — genuine implementation cost, but what makes "event-only" actually hold under load rather than becoming a rule with a synchronous-call exception carved out the first time it's inconvenient.
- If a future need arises for tighter consistency than an eventually-consistent replica allows, that's a reason to add a narrow, explicitly documented exception (as real Durion's ADR-0044 does for a handful of money-moving flows) — never a reason to quietly add a synchronous call or a shared database link.

## Alternatives considered

- **A single service covering every aggregate:** simplest to build, but doesn't exercise or demonstrate a genuine microservices decomposition, and doesn't match the target stack.
- **Foreign keys across a shared database:** collapses the "each service owns its own database/schema" requirement and makes later physically separating the databases much harder.
- **No gateway, clients call services directly:** reintroduces exactly the coupling a single entry point exists to prevent, and doesn't match the production pattern this track is modeled on.
- **Synchronous REST between domain services for reads:** simpler and fully consistent on every read, but reintroduces the coupling — a callee outage cascading into caller failures, deployment-order dependencies, domain models leaking through client DTOs — that this policy exists specifically to avoid. This was the original version of this ADR's decision, superseded on 2026-09-16 before any service code existed to migrate.

## Amendments

**2026-09-16** — The original decision allowed direct REST calls between domain services for read/validation needs. After reviewing Durion Positivity's real production ADR-0044, that was rewritten to close the gap: domain services became event-only with each other, using read-only local replicas instead of live calls, backed by a transactional outbox and idempotent consumers.

**2026-09-17** — The Decision was rewritten a second time to state the policy generically (aggregate-root decomposition, gateway-as-entry-point, database-per-service, event-only communication with replicas/outbox/idempotency) with no project-specific service or object names in it, so it reads as portable house style rather than a one-off. The concrete instance — our actual three services and their topics — moved to a new "Applying this here" section. No behavior changed; only where the general rule and its specific application are described.
