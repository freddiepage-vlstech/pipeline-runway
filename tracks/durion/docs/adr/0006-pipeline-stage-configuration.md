# ADR-0006: Pipeline stage configuration

**Status:** Accepted
**Date:** 2026-09-21

## Context

REQ-6 requires that pipeline stages be definable, renameable, and reorderable without a code deploy, and explicitly requires the mechanism to be documented in an ADR. This also interacts with REQ-9: the Closed Won automation needs to reliably identify "the stage that ends the pipeline successfully" in a way that survives someone renaming that stage — matching on a display string is fragile by construction.

## Decision

Pipeline or workflow stages that need runtime reconfiguration — creating, renaming, or reordering without a redeploy — are modeled as data: a stage resource with an explicit display order, not a code-level enum or a hardcoded list. Any downstream logic that needs to detect a special or terminal stage (one that ends the pipeline successfully, for instance) keys off an explicit flag on that stage record, never off its display name. A name is mutable by design once stages are configurable, so it can never double as a control key. Reconfiguration happens through the owning service's own API, not a config file that requires a redeploy to change — otherwise "configurable" is nominal, not real.

## Applying this here

`opportunities-service` owns a `Stage` resource (`name`, `order`, `isClosedWon`, `isClosedLost`) with `GET/POST /stages`, `PATCH /stages/{id}`, and `POST /stages/reorder` endpoints. It's seeded at first boot with the five default stages REQ-6 requires — New, Contacted, Proposal, Closed Won, Closed Lost — with `isClosedWon: true` set on the seeded Closed Won stage and `isClosedLost: true` on Closed Lost. Reconfiguration is admin-gated by REQ-13's single shared credential (the requirements don't call for a separate admin role). REQ-9's Closed Won automation checks `isClosedWon` on the stage an Opportunity is being moved into, not the stage's name — renaming "Closed Won" to anything else doesn't silently break the automation.

## Consequences

- REQ-6 is satisfied for real (stages can be added, renamed, and reordered live), not with a static list that only supports relabeling.
- REQ-9's automation is rename-safe, which a name-matching approach would not have been.
- Adds a small amount of extra modeling — a Stage table and its own small CRUD surface — for a track this size. Accepted as the direct cost of satisfying REQ-6's own acceptance criteria rather than a shortcut.
- Deleting or unflagging the stage currently marked `isClosedWon` needs a guard at implementation time so the pipeline doesn't silently end up with zero stages that trigger REQ-9's automation (or, if that's ever wanted deliberately, it should be an explicit, visible state rather than an accident). This is an implementation-time detail, not a further architectural decision.

## Alternatives considered

- **Hardcoded stage enum with a static default list, renaming only changes a separately-stored display label:** rejected — doesn't satisfy REQ-6's requirement to define and reorder stages, only to relabel a fixed set.
- **A config file (e.g. YAML) that requires redeploying the service to change stages:** rejected outright — REQ-6's own acceptance criteria requires this without a code deploy.
- **Match "Closed Won" by display-name string in the automation logic:** rejected — breaks the moment someone renames the stage, which REQ-6 explicitly allows them to do.
