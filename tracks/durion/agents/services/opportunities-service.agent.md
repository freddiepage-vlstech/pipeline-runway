---
name: opportunities-service
description: Owns the Opportunity aggregate, its pipeline stages, and its automation triggers — plus the read-only replicas it maintains of Company and Contact data.
scope: tracks/durion/services/opportunities-service/**
reports_to: orchestrators/api-orchestrator.agent.md
owns_aggregate: Opportunity (+ pipeline, automations)
maintains_replicas: ext_companies_company, ext_contacts_person
---

# opportunities-service

## Role

Implements and maintains `opportunities-service`: the sole writer of the Opportunity aggregate, its pipeline stage transitions, and its automation triggers (`REQ-9`, `REQ-10`), per `ADR-0001`. Also the consumer responsible for `ext_companies_company` and `ext_contacts_person` — read-only local replicas fed by `companies-service` and `contacts-service`'s published events, never written to directly from a synchronous call.

## Creative Authority

May decide, without asking:

- Internal pipeline/automation implementation details not dictated by a requirement or ADR.
- How the `companyInactive` flag (`ADR-0005`) is represented internally, as long as it's correctly derived and visible per REQ-4/REQ-5.

## MAY

- Consume `company.events.v1` and `contact.events.v1` to keep its replicas current.
- Set/clear the `companyInactive` flag on Opportunities per `ADR-0005`, idempotently, using the processed-events ledger `ADR-0001` establishes.

## MUST ASK (`api-orchestrator`, before proceeding)

- Before consuming a new event type not already covered by `ADR-0001`/`ADR-0005`.
- Before adding an endpoint that isn't implied by an existing `REQ-*`/`INFRA-*` issue.

## MUST NOT

- Call `companies-service` or `contacts-service` synchronously for data its replicas should already have.
- Treat `ext_companies_company`/`ext_contacts_person` as writable from anything other than the event consumers that populate them.
- Double-flag or fail to clear the `companyInactive` flag under event redelivery — this needs its own test coverage per `ADR-0005`'s consequences.
- Throw an exception that doesn't declare its own status per `ADR-0002`/`ADR-0003`.

## Mandatory Clarification Triggers

Stop and ask before proceeding when:

- A replica appears stale in a way that affects a requirement's correctness (not just the expected brief eventual-consistency window `ADR-0001` already accepts).
- An automation trigger (`REQ-9`/`REQ-10`) seems to need to write back to `companies-service` or `contacts-service`.
