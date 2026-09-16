# ADR-0005: Dependent-record flagging on upstream deactivation

**Status:** Accepted
**Date:** 2026-09-16 (amended 2026-09-17)

## Context

When one service's aggregate is referenced by records another service owns, the referencing service eventually has to decide what happens when the referenced aggregate is retired — silently doing nothing leaves stale, misleading data on screen; deleting the dependent records destroys information nobody asked to lose. This project's REQ-1 raises exactly this question for Companies and their related Contacts/Opportunities, explicitly deferring the choice to this track ("handled explicitly... document the choice in an ADR"). `ADR-0001`'s decomposition and event-only policy already provides a mechanism to answer it without either service writing the other's data.

## Decision

**An aggregate's owning service announces a deactivation; it does not command dependents to act.** When an aggregate transitions to an inactive/retired state, its owning service performs a soft-delete (a status field, never removing the row) and publishes a lifecycle event carrying the aggregate's identifier. Hard-deleting the row is rejected outright: it would leave any replica, and any dependent record's reference, pointing at nothing.

**Dependent services react by flagging, never by deleting or hiding.** A service holding records that reference the now-inactive aggregate consumes the event and marks each of its own matching records with an informational flag, surfaced in its own UI/API as a signal for follow-up. The dependent records themselves are never deleted, hidden, or automatically altered beyond the flag — the flag prompts a human decision, it doesn't make one.

**Reactivation is symmetric.** The owning service publishes a matching "reactivated" event when the aggregate returns to active status; dependent services clear the flag on consuming it.

**Ownership stays intact throughout.** The owning service never writes to a dependent service's data, and a dependent service never writes to the owner's data — what crosses the boundary is a fact about a lifecycle transition, not an instruction. How a dependent service reacts to that fact is entirely its own business logic, using the event mechanism `ADR-0001` already establishes.

## Applying this here

`companies-service` soft-deletes a Company (a `deactivatedAt` field) and publishes `company.deactivated` on `company.events.v1`. `opportunities-service` consumes it, updates its `ext_companies_company` replica to inactive, and sets a `companyInactive` flag on every Opportunity referencing that company, visible on both the kanban (REQ-4) and table (REQ-5) views. Reactivating a Company publishes `company.reactivated`, and `opportunities-service` clears the flag. Both sides record processed events idempotently via the ledger `ADR-0001` establishes, so redelivery never double-flags or double-clears.

## Consequences

- This gives `ADR-0001`'s event-only pattern a real behavioral job, not just replica-freshness maintenance — a lifecycle change in one service visibly and meaningfully affects what another service shows, a stronger demonstration of the architecture than passive replication alone.
- A service adopting this pattern needs to consume a second real event type beyond whatever it already needed for basic replica upkeep, and needs its own flag field and UI treatment — bounded, deliberate scope, not an incidental afterthought.
- A brief window exists between the upstream deactivation and the dependent flag appearing — the same eventual-consistency trade-off `ADR-0001` already accepts, and acceptable here for the same reasons.
- Reactivation has to correctly clear a previously-set flag, including under redelivery — this needs its own explicit test coverage, not just coverage of the deactivate direction.

## Alternatives considered

- **Block the deactivation outright when dependent records exist:** simplest, and technically satisfies REQ-1's acceptance criteria on its own. Rejected because it does no work to exercise cross-service event choreography, leaving `ADR-0001`'s event-only pattern doing only passive replica-sync — a weaker demonstration of the architecture this benchmark exists to showcase.
- **Hard delete cascading to dependent records:** rejected outright — silently destroying records that reference a deactivated aggregate is a real data-loss risk, and isn't what REQ-1 asks for.
- **A synchronous cross-service call at deactivation time:** rejected as a direct violation of `ADR-0001`'s event-only rule; would reintroduce the exact coupling that rule exists to avoid.

## Amendment (2026-09-17)

Retitled from "Company deactivation cascade" and rewritten so the Decision states the general pattern (an aggregate's owning service announces deactivation via an event; dependent services react by flagging their own records, never deleting; reactivation is symmetric) without naming Company or Opportunity, so the rule reads as reusable house style. The concrete instance moved to a new "Applying this here" section. No behavior changed.
