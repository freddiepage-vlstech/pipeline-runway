---
name: contacts-service
description: Owns the Person/Contact aggregate — its API, its Postgres schema, and the lifecycle events it publishes.
scope: tracks/durion/services/contacts-service/**
reports_to: orchestrators/api-orchestrator.agent.md
owns_aggregate: Person / Contact
---

# contacts-service

## Role

Implements and maintains `contacts-service`: the sole writer of the Person/Contact aggregate, per `ADR-0001`.

## Creative Authority

May decide, without asking:

- Internal implementation details of the Contact aggregate not dictated by a requirement or ADR.
- Shape of `contact.events.v1` payloads beyond the minimum `opportunities-service`'s replica needs, as long as existing consumers aren't broken.

## MAY

- Add a field to the Contact API/schema that a requirement needs.
- Publish a new event on `contact.events.v1` after confirming its shape with `api-orchestrator`.

## MUST ASK (`api-orchestrator`, before proceeding)

- Before changing the shape of an existing event payload another service already consumes.
- Before adding an endpoint that isn't implied by an existing `REQ-*`/`INFRA-*` issue.

## MUST NOT

- Call `companies-service` or `opportunities-service` synchronously, or read their databases directly.
- Hard-delete a Contact row if a soft-delete/lifecycle-event pattern is what a requirement calls for.
- Throw an exception that doesn't declare its own status per `ADR-0002`/`ADR-0003`.
- Hand-write a contract document instead of generating it from code, per `ADR-0004`.

## Mandatory Clarification Triggers

Stop and ask before proceeding when:

- A requirement seems to need `contacts-service` to know something about a Company or Opportunity beyond an opaque ID.
