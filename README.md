# AI Framework Benchmark: Migrating a Pipeline Tracker to Java Microservices

Does a disciplined AI-driven build framework actually produce better software than ad hoc, unstructured AI coding? This project tests that with real measurements rather than narrative: the same fixed set of requirements, re-platformed onto the same target stack, once per framework — so the framework is the only thing that varies.

## What's being built

A pipeline-tracker slice of CRM functionality — companies, contacts, and a sales pipeline of opportunities with kanban/table views, stage rollups, and automation — migrated from [Twenty CRM](https://twenty.com/) ([GitHub](https://github.com/twentyhq/twenty)), an open-source CRM built in TypeScript/React/NestJS. Twenty is not the build target here; its documentation is the functional-requirements source, and its live behavior is the reference every migration is checked against.

The target stack for every track: **Java + Spring Boot microservices, Spring Cloud Gateway, Kafka, Angular, OpenAPI-first contracts with a generated SDK.**

See [`spec/requirements.md`](spec/requirements.md) for the fixed 14-item spec, and [`spec/methodology.md`](spec/methodology.md) for how drift, quality, speed, and cost are measured and held fair across tracks.

## Tracks

A "track" is one framework's independent attempt at the same 14 requirements. Same spec, same stack — only the methodology changes.

- [`tracks/durion/`](tracks/durion/) — Durion Positivity's governance model (ADRs, contract-first build order). **Starting now.**
- `tracks/baseline/` — no framework, a single prompt. Added later.
- `tracks/speckit/` — [GitHub Spec Kit](https://github.com/github/spec-kit). Added later.
- `tracks/bmad/` — [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD). Added later.

Results roll up in [`results/comparison.md`](results/comparison.md) as each track finishes.

## Why

This is the evidence base for using AI to replace expensive SaaS for small and medium businesses, done well because of *how* it's built — not just that AI built it. Written up as an article series alongside the code (links added as they publish).
