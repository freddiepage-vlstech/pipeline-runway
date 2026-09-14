# Requirements — Pipeline Tracker

These 14 requirements are fixed across every track. Each one is traceable to a real page in [Twenty CRM's](https://twenty.com/) documentation ([GitHub](https://github.com/twentyhq/twenty)) — Twenty is the functional-requirements source and reference implementation for this benchmark, not the build target. Every track re-platforms this same scope onto the target stack described in the root README.

No track may add, drop, or reinterpret a requirement without recording that decision in its own ADR — silently changing scope is exactly the "spec-conformance drift" this benchmark measures.

---

## Core data model

### REQ-1: Company object
**Statement:** As a user, I can create, view, edit, and delete a Company record, so Opportunities and Contacts can be organized by the business they belong to.
**Source:** [Objects](https://docs.twenty.com/user-guide/data-model/capabilities/objects.md), [Fields](https://docs.twenty.com/user-guide/data-model/capabilities/fields.md)
**Acceptance criteria:**
- A Company has at minimum: name, domain/website, and an internal ID
- Companies can be created, edited, and deleted via the API and the UI
- Deleting a Company that has related Contacts/Opportunities is handled explicitly (soft-delete or block — the track's choice, documented in its ADR)

### REQ-2: Person/Contact object
**Statement:** As a user, I can create, view, edit, and delete a Person, optionally related to a Company.
**Source:** [Relation Fields](https://docs.twenty.com/user-guide/data-model/capabilities/relation-fields.md)
**Acceptance criteria:**
- A Person has: name, email, phone, and a relation to a Company
- A Person can exist without a Company (unassigned) or be linked to exactly one Company
- CRUD available via API and UI

### REQ-3: Opportunity object
**Statement:** As a user, I can create and edit an Opportunity with a stage, amount, expected close date, and relations to a Company and (optionally) a Person.
**Source:** [Set Up a Sales Pipeline](https://docs.twenty.com/user-guide/views-pipelines/how-tos/set-up-a-sales-pipeline.md)
**Acceptance criteria:**
- Fields: name, stage, amount (currency), expected close date, related Company, related Person
- An Opportunity must belong to exactly one Company; the related Person is optional
- CRUD available via API and UI

## Pipeline views

### REQ-4: Kanban board view
**Statement:** As a user, I can view Opportunities as a kanban board grouped by stage, and move one to another stage by dragging it.
**Source:** [Kanban Board Views](https://docs.twenty.com/user-guide/views-pipelines/capabilities/kanban-views.md)
**Acceptance criteria:**
- Each stage is a column; each Opportunity is a card showing name, amount, and company
- Dragging a card to another column updates that Opportunity's stage
- Moving a card into "Closed Won" triggers REQ-9's automation

### REQ-5: Table view
**Statement:** As a user, I can view Opportunities in a sortable, filterable table.
**Source:** [Table Views](https://docs.twenty.com/user-guide/views-pipelines/capabilities/table-views.md), [Filters & Sorting](https://docs.twenty.com/user-guide/views-pipelines/capabilities/filters-and-sorting.md)
**Acceptance criteria:**
- Columns: name, company, stage, amount, close date
- Sortable by any column
- Filterable by stage and by company

### REQ-6: Configurable pipeline stages
**Statement:** As an admin, I can define, rename, and reorder the stages Opportunities move through.
**Source:** [Set Up a Sales Pipeline](https://docs.twenty.com/user-guide/views-pipelines/how-tos/set-up-a-sales-pipeline.md)
**Acceptance criteria:**
- At least these default stages exist: New, Contacted, Proposal, Closed Won, Closed Lost
- Stages can be renamed and reordered without a code deploy (config or admin UI — the track's choice, documented in its ADR)

### REQ-7: Expected value rollup per stage
**Statement:** As a user, I can see the total value of Opportunities in each stage, and overall.
**Source:** [Show Expected Amount in Your Pipeline](https://docs.twenty.com/user-guide/views-pipelines/how-tos/show-expected-amount-in-pipeline.md)
**Acceptance criteria:**
- Each stage column/row shows the sum of Opportunity amounts within it
- Total pipeline value (all open stages) is visible somewhere in the view

### REQ-8: Time-in-stage tracking
**Statement:** As a user, I can see how long an Opportunity has been sitting in its current stage.
**Source:** [Track Time in Stage](https://docs.twenty.com/user-guide/views-pipelines/how-tos/track-time-in-stage.md)
**Acceptance criteria:**
- Each Opportunity records the timestamp it entered its current stage
- The UI displays elapsed time in the current stage (e.g., "14 days in Proposal")

## Pipeline intelligence / automation

### REQ-9: Closed Won automation
**Statement:** As a user, when I move an Opportunity to Closed Won, something happens automatically rather than requiring a manual follow-up step.
**Source:** [Closed Won Automations](https://docs.twenty.com/user-guide/workflows/how-tos/crm-automations/closed-won-automations.md)
**Acceptance criteria:**
- Moving an Opportunity to Closed Won publishes a Kafka event
- At minimum, a documented consumer reacts to it (e.g., logs it, sends a notification) — the specific reaction is the track's implementation choice, documented in its ADR

### REQ-10: Stale opportunity detection
**Statement:** As a user, I want Opportunities that haven't moved or been updated in a while flagged, so nothing silently goes cold.
**Source:** [Detect Stale Opportunities](https://docs.twenty.com/user-guide/workflows/how-tos/crm-automations/detect-stale-opportunities.md)
**Acceptance criteria:**
- A configurable threshold (default: 14 days) defines "stale"
- Stale Opportunities are visibly flagged in the UI and/or trigger a Kafka event
- The threshold is documented in the track's ADR

## Record detail

### REQ-11: Opportunity record page
**Statement:** As a user, I can open one Opportunity and see all its fields, relations, and history in one place.
**Source:** [Record Pages](https://docs.twenty.com/user-guide/layout/capabilities/record-pages.md)
**Acceptance criteria:**
- Shows all Opportunity fields, its related Company and Person, and a simple activity/audit trail (at minimum: stage-change history)

## Non-functional baseline

*(Not drawn from Twenty's docs — needed for a real deployable app.)*

### REQ-12: Real persistence
**Statement:** Data survives a service restart.
**Acceptance criteria:**
- Each service uses its own Postgres database/schema
- Restarting a service does not lose data

### REQ-13: Basic auth
**Statement:** The app is not reachable with zero authentication.
**Acceptance criteria:**
- At minimum, a single shared login (username/password or token) gates access to the UI and API
- Credentials are not hardcoded in source (env var or secret)

### REQ-14: Automated test suite
**Statement:** A fixed, repeatable test suite is the quality gate every track is graded against.
**Acceptance criteria:**
- Automated tests cover: CRUD for Company/Person/Opportunity, stage-move logic, the Closed Won automation firing, and the stale-opportunity flag logic
- Tests run in CI (`ci-<track>.yml`) on every push
- Test pass rate is what "Quality" measures in `results/comparison.md`
