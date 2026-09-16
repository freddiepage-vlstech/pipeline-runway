# ADR-0005: Company deactivation cascade

**Status:** Accepted
**Date:** 2026-09-16

## Context

REQ-1's acceptance criteria require that "deleting a Company with related Contacts/Opportunities is handled explicitly (soft-delete or block — document the choice in an ADR)" — the requirement itself defers this decision to this track. `ADR-0001` already establishes that domain services communicate only through events, with each service owning and writing only its own data. This ADR picks the concrete behavior and shows that pattern doing real work, not just keeping a display field in sync: a lifecycle change in `companies-service` needs to visibly affect records that `opportunities-service` owns, without either service reaching into the other's data.

## Decision

**Soft-delete, not hard delete or block.** Deleting a Company sets a status/`deactivatedAt` field rather than removing the row. A hard delete would leave `opportunities-service`'s `ext_companies_company` replica (and any Opportunity's `companyId`) pointing at nothing, with no way to show the user what company an old Opportunity used to belong to. Blocking the delete outright (the other option REQ-1 allows) is simpler but forecloses the more useful behavior below, and gives the user no way to retire a Company that's genuinely done.

**The cascade is event-driven, not a cross-service call.** When `companies-service` deactivates a Company, it publishes a `company.deactivated` event (on the `company.events.v1` topic established in `ADR-0001`) carrying the `companyId`. `opportunities-service`, on consuming it:

1. Updates its own `ext_companies_company` replica row to reflect the inactive status.
2. Flags every Opportunity it owns whose `companyId` matches — a `companyInactive` field on the Opportunity — visible in both the kanban (REQ-4) and table (REQ-5) views as a badge or similar visual marker. Opportunities are never deleted or hidden as a result; the flag is informational, prompting the user to follow up, not an automated decision to abandon the deal.
3. Records the change idempotently via the `processed_events` table from `ADR-0001`, so a redelivered event doesn't re-flag anything or double-log.

Reactivating a Company publishes a symmetric `company.reactivated` event; `opportunities-service` clears the flag on consuming it.

Each service still only ever writes rows it owns — `companies-service` never touches `opportunities-service`'s database, and vice versa. What crosses the boundary is a fact ("this Company is now inactive"), not a command telling the other service what to do with it; how `opportunities-service` reacts to that fact is entirely its own decision, encoded in its own consumer.

## Consequences

- This is a genuine example of event-driven cross-service business logic, not just replica-freshness maintenance — a Company's lifecycle state change produces a visible, meaningful effect in a different service's UI, entirely through the event-only pattern `ADR-0001` establishes. That's a stronger demonstration of the "migrate to real microservices" pitch than passive replicas alone.
- Requires `opportunities-service` to consume a second real event type (beyond automation triggers and read-replica updates) and to add the `companyInactive` field and its UI treatment — genuine but bounded scope, traceable directly to REQ-1's own acceptance criteria rather than an invented addition.
- A brief window exists between a Company being deactivated and its Opportunities being flagged (the same eventual-consistency trade-off `ADR-0001` already accepts). Acceptable for the same reason: nothing in REQ-1, REQ-4, or REQ-5 requires this to be instantaneous.
- If a Company is reactivated, previously-flagged Opportunities need their flag cleared correctly — this needs its own test case in REQ-14's suite (flag set on deactivation, cleared on reactivation, survives a redelivered event without double-processing).

## Alternatives considered

- **Block deletion of a Company with related records:** simplest, and technically satisfies REQ-1's acceptance criteria on its own. Rejected here because it does nothing to exercise cross-service event choreography, leaving `ADR-0001`'s event-only pattern doing only passive replica-sync work rather than real business logic — a weaker demonstration of the architecture this benchmark exists to showcase.
- **Hard delete with cascading delete of related Opportunities:** rejected outright — silently destroying Opportunity records because their Company was deleted is a real data-loss risk no reasonable CRM would accept, and it isn't what REQ-1 asks for.
- **Synchronous cross-service call at delete time** (companies-service directly notifying opportunities-service): rejected as a direct violation of `ADR-0001`'s event-only rule; would reintroduce the coupling that ADR exists to avoid.
