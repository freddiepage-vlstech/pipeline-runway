# AGENTS.md — Durion Track Working Agreement

This is the working agreement for any AI session (or human) doing implementation work on `tracks/durion/`. Read this in full before writing code. It exists partly to build the software, and partly because how faithfully a session follows it is itself one of the things this benchmark measures (see "session-resume drift" in `/spec/methodology.md`).

## Start-of-session checklist

Before writing or changing anything, a session working on this track should:

1. Read this file (`AGENTS.md`) in full.
2. Read `/spec/requirements.md` — the fixed, track-agnostic requirements. Do not paraphrase or reinterpret them; if something is ambiguous, record the interpretation as an ADR rather than silently picking one.
3. Read every file under `docs/adr/` in this track, in numeric order. These are binding on this track until superseded by a later ADR — never contradicted by code without a new ADR explaining why.
4. Check `docs/adr/` for an ADR already covering the area you're about to touch before making an architectural choice. If none exists, write one before or alongside the code (see "When to write an ADR" below).
5. Check the open issues labeled `track:durion` in GitHub for what's already done vs. still open, and check this track's section of `/results/comparison.md` for known status.
6. Read the agent file for the area you're about to work in under `agents/` (see "Agent structure" below) — it adds role-specific MAY/MUST ASK/MUST NOT detail on top of this file, it doesn't replace any of the above.

## Build order

Contract-first, matching Durion Positivity's production pattern:

1. Define the OpenAPI contract for a service before writing its implementation.
2. Generate the Angular client SDK from the contract (`INFRA-7`) — the frontend consumes the generated SDK, never a hand-written HTTP client.
3. Implement the service to satisfy its own contract.
4. Wire cross-service concerns (Kafka events, gateway routing) after the services that produce/consume them exist.

Deviating from this order (e.g., writing frontend code against a service that has no contract yet) is itself a form of drift — avoid it, and if it happens, log why in an ADR rather than letting it pass silently.

## Agent structure

Implementation work is split across a two-tier agent structure under `agents/`: an `api-orchestrator` and `ui-orchestrator` coordinate backend and frontend work respectively, each delegating to service- or area-scoped leaf agents, with a `pr-review-orchestrator` as the final gate before merge. See [`agents/README.md`](agents/README.md) for the full structure and why this track keeps an orchestration tier that Durion Positivity's own current production setup has moved away from in favor of a flat per-domain pattern — that choice is deliberate for this benchmark, not a claim that it's the better default at every scale.

None of these agent files override the source-of-truth hierarchy below; they only add role-specific detail on top of it.

## When to write an ADR

Write an ADR (`docs/adr/NNNN-title.md`) before or alongside any decision that:

- Chooses between two or more reasonable technical approaches (e.g., how stage-change history is stored, how the stale-opportunity threshold is configured)
- Changes or narrows the scope of a requirement in `/spec/requirements.md` (never do this silently — the requirements file explicitly forbids silent scope changes)
- Introduces a new library, pattern, or cross-cutting convention not already covered by an existing ADR
- Reverses or amends an earlier ADR

Small, purely mechanical implementation choices (variable names, which specific Spring annotation to use for something with only one sensible answer) don't need an ADR.

## Conventions

- **Language / framework:** Java 21, Spring Boot 3.x, Maven (matches `ci-durion.yml`).
- **Per-service data:** each of `companies-service`, `contacts-service`, `opportunities-service` owns its own Postgres database/schema. No service reads another service's database directly — cross-service data needs go through its API or a Kafka event, never a shared table.
- **Health checks:** every service (including the gateway) exposes `/actuator/health`. `ci-durion.yml`'s smoke test depends on this.
- **Events:** Kafka topics and payload schemas live in `INFRA-6`'s output and must be documented in an ADR, not left implicit in code.
- **Testing:** every requirement issue's acceptance criteria should map to at least one automated test. `REQ-14` (automated test suite) is the quality gate this whole track is graded against — don't treat it as an afterthought issue to pick up last.

## Source of truth hierarchy

If anything conflicts, resolve it in this order:

1. `/spec/requirements.md` (fixed, cannot be silently changed)
2. This track's ADRs in `docs/adr/`
3. This file (`AGENTS.md`)
4. Existing code / prior convention in this track

If code and an ADR disagree, the ADR wins and the code is a bug. If this file and an ADR disagree, write a new ADR to resolve it explicitly rather than picking one side informally.
