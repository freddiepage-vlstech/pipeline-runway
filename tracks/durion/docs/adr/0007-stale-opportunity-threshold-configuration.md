# ADR-0007: Stale-opportunity threshold configuration

**Status:** Accepted
**Date:** 2026-09-21

## Context

REQ-10 requires that "stale" (not moved or updated in a while) be defined by a configurable threshold, defaulting to 14 days, and explicitly requires the mechanism to be documented in an ADR.

## Decision

A business-tunable numeric threshold that changes how an already-persisted, derived flag is read — "is this record stale" being the case here — is configurable per deployment without a rebuild, and ships with a safe, spec-defined default. Whether the flag is evaluated in real time from stored timestamps, or pre-computed and stored by a batch process, is a separate implementation decision from this one. What this decision fixes is that the threshold's source of truth is a single, per-deployment configuration value — never hardcoded at the point of use, and never duplicated across more than one place that could drift out of sync with each other.

## Applying this here

`opportunities-service` reads the threshold from an environment variable, `STALE_THRESHOLD_DAYS`, defaulting to `14` per REQ-10's stated default. The `stale` field on Opportunity (already part of the service's OpenAPI contract) is computed at read time: an Opportunity is stale when the time since the later of `currentStageEnteredAt` or `updatedAt` meets or exceeds `STALE_THRESHOLD_DAYS`. No separate scheduled job is required for the flag itself to be correct whenever it's read. REQ-10 also allows a Kafka event as the staleness signal instead of (or alongside) a UI flag; if that's implemented, it needs its own periodic sweep to detect the moment a record crosses the threshold, since nothing else triggers a state change at that exact boundary — that sweep is scoped to `INFRA-6`'s implementation, not resolved by this ADR.

## Consequences

- Changing the threshold takes effect immediately for every future read, with no redeploy — this is what REQ-10 actually asks for.
- Because staleness is computed at read time rather than stored, lowering the threshold immediately surfaces more Opportunities as stale, including ones that were already sitting in their current stage before the change — a deliberate choice: a lowered threshold should apply to existing data, not just newly-created records.
- If the Kafka-event form of REQ-10 is implemented, it needs a scheduled sweep to fire the event at the moment a record crosses the threshold — an open implementation detail, not something this ADR resolves.

## Alternatives considered

- **Hardcode 14 days directly in application code:** rejected outright — contradicts REQ-10's explicit requirement that the threshold be configurable.
- **Store the threshold as an admin-editable setting in the database rather than an environment variable:** a reasonable alternative, rejected only because REQ-13's minimal shared-credential auth model doesn't distinguish an admin role from a general user, so a database setting would be editable by anyone who can log in at all. An environment variable keeps the value operator-controlled rather than exposed in the app itself. Worth revisiting if REQ-13's auth model ever grows a real admin role.
