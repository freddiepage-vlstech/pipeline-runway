# ADR-0001: Service boundaries and shared conventions

**Status:** Accepted
**Date:** 2026-09-14

## Context

`/spec/requirements.md` fixes what has to be built (companies, contacts, and a pipeline of opportunities with kanban/table views, stage rollups, and two automation triggers) and the root README fixes the target stack (Java + Spring Boot microservices, Spring Cloud Gateway, Kafka, Angular, OpenAPI-first contracts). What isn't yet decided is exactly how work is split across services and how those services talk to each other — this ADR settles that before any service code is written, per this track's contract-first, decide-before-you-build discipline (see `AGENTS.md`).

## Decision

**Three services, one per aggregate root:**

- `companies-service` — owns the Company object (REQ-1)
- `contacts-service` — owns the Person/Contact object (REQ-2)
- `opportunities-service` — owns the Opportunity object (REQ-3), the pipeline views' backing data (REQ-4–8), and both automation triggers (REQ-9, REQ-10)

This mirrors the three domain objects Twenty's own documentation treats as distinct, and keeps each service's write model to a single aggregate root.

**One API Gateway** (Spring Cloud Gateway, `INFRA-4`) is the only entry point the Angular frontend or any external client talks to. No service is called directly by the frontend.

**Data ownership:** each service owns its own Postgres database/schema (REQ-12). Cross-service reads (e.g., an Opportunity needing its Company's name) go through that service's API — never a shared table or a direct database connection into another service's schema.

**Relations that cross a service boundary are stored as an ID, not a foreign key.** `opportunities-service` stores `companyId` and `personId` as plain UUIDs; it does not join against `companies-service`'s or `contacts-service`'s tables. Resolving those into full objects for display is a gateway- or frontend-level composition step, not a database join.

**Synchronous vs. asynchronous communication — event-only between domain services:**

No domain service (`companies-service`, `contacts-service`, `opportunities-service`) calls another one synchronously — not even for "just one small lookup" like validating a `companyId` exists. This is adapted from Durion Positivity's real production ADR-0044, adopted here after that ADR's own reasoning proved directly applicable: a callee outage cascading into caller request failures, and a domain model leaking across a service boundary through ad hoc client DTOs, are exactly the failure modes a from-scratch microservices migration should avoid rather than reintroduce.

- **Reads use local replicas.** `opportunities-service` needs a Company's name and a Person's name/email to display on an Opportunity without calling `companies-service` or `contacts-service` live. It keeps its own read-only replica tables (named `ext_companies_company` and `ext_contacts_person`, so ownership is visible in the schema itself) populated exclusively by consuming that owner's events — never written by anything else, and never joined against the owner's real tables.
- **Every domain service publishes its own lifecycle events**, not just the two automation triggers. `companies-service` publishes to `company.events.v1` and `contacts-service` to `contact.events.v1` whenever a record is created, updated, or deleted, so `opportunities-service`'s replicas stay current. The two automation triggers (REQ-9 Closed Won, REQ-10 stale detection) are additional, `opportunities-service`-originated events on their own topics — `INFRA-6`'s deliverable, with its own ADR for topic/schema detail.
- **The gateway remains the sole synchronous entry point** from the frontend into any service (per the section above) — this rule is about domain-to-domain calls, not about how the frontend reaches a service.
- **Reliability is not optional.** Each publishing service writes its outgoing event to an `event_outbox` table in the same database transaction as the state change it describes, with a background process draining that table to Kafka — never publishing directly from request-handling code, which risks a committed state change whose event never sends. `opportunities-service` keeps a `processed_events` table keyed by event ID so a redelivered event is a no-op rather than a duplicate replica update.
- **Consciously out of scope** (documented here so it's a decision, not an oversight): real Durion's full pattern also includes command events for cross-service writes, a dead-letter queue with alerting, and scheduled reconciliation against the owner to catch replica drift. None of our 14 requirements need one service to write another's data, so command events aren't needed. A DLQ and reconciliation job would be reasonable production hardening but are more machinery than a single track's benchmark build needs to demonstrate the pattern faithfully — worth revisiting in a future ADR if replica drift actually becomes a problem in practice.

**Contracts:** every service publishes an OpenAPI spec (`INFRA-7`); the Angular frontend is generated from those specs and never hand-writes HTTP calls against a service.

**Stack baseline:** Java 21, Spring Boot 3.x, Maven — matching `ci-durion.yml`, which is already written against this baseline and should not need to change as a result of this ADR.

## Consequences

- Three separate Spring Boot codebases and three separate Postgres instances add real operational overhead (three sets of migrations, three health checks, three things that can be down) compared to a single monolith or a two-service split. This is accepted deliberately — it's the point of the "migrate to microservices" pitch this whole benchmark exists to support, not an accident of over-engineering.
- `opportunities-service`'s replica of Company/Person data can lag the owning service by however long the outbox-to-Kafka-to-consumer path takes — normally seconds. An Opportunity's display of "Acme Corp" can briefly be stale right after a rename. This is an accepted trade for not having a live call in the request path; REQ-4/REQ-5's acceptance criteria don't require sub-second consistency on the company/person name shown.
- Every domain service now needs an outbox table and publisher, and `opportunities-service` needs a `processed_events` table and the two replica tables — real implementation cost beyond what a "just call REST" design would need. Accepted because it's what makes the event-only rule actually reliable rather than a rule that quietly gets a synchronous-call exception carved out the first time someone finds events inconvenient.
- If a future need arises for two services to share data more tightly than an eventually-consistent replica allows, that is a reason to revisit this ADR with a documented, narrow exception (as real Durion's ADR-0044 does for a handful of money-moving flows) — not a reason to quietly add a synchronous call or a cross-service database link.

## Alternatives considered

- **Single service, three domains:** simplest to build, but doesn't exercise or demonstrate the "migrate a monolith to microservices" pitch this project exists to support, and doesn't match the target stack described in the README.
- **Foreign keys across a shared database:** rejected because it collapses REQ-12's "each service uses its own database/schema" requirement and would make later splitting the database itself (if ever needed) much harder.
- **Frontend calling services directly, no gateway:** rejected because `INFRA-4` (the gateway) is an explicit setup issue in this track's plan and matches Durion Positivity's own production pattern of a single entry point.
- **Synchronous REST between domain services for reads** (the original version of this ADR): simpler to build and fully consistent on every read, but reintroduces the exact coupling — a callee outage cascading into caller failures, deployment-order dependencies, domain models leaking through client DTOs — that Durion Positivity's own production experience (ADR-0044) shows doesn't hold up as a system grows. Superseded by the replica-and-events approach above on 2026-09-16, before any service code existed to migrate.

## Amendment (2026-09-16)

The original "Synchronous vs. asynchronous communication" section allowed direct REST calls between domain services for read/validation needs (e.g., checking a `companyId` exists). After reviewing Durion Positivity's real production ADR-0044 ("Event-Only Domain Walls"), that section was rewritten to close this gap: domain services are now event-only with each other, using read-only local replicas instead of live calls, backed by a transactional outbox and idempotent consumers. This ADR is revised in place, rather than superseded by a new ADR, because no service code existed yet when the change was made.
