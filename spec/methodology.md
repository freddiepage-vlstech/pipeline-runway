# Benchmark Methodology

Held constant across every track, so the framework/methodology being tested is the only variable. Modeled loosely on how [Artificial Analysis benchmarks coding agents](https://artificialanalysis.ai/methodology/coding-agents-benchmarking): a fixed task set, a consistent model, and no solution retrieval from the internet during the build.

## Fixed across all tracks

- **Requirements**: the 14 items in `spec/requirements.md`, unchanged
- **Target stack**: Java + Spring Boot microservices (Companies, Contacts, Opportunities/Pipeline), Spring Cloud Gateway, Kafka, Angular frontend, OpenAPI-first contracts with a generated Angular SDK
- **Model**: the same underlying AI model across every track's build
- **No internet solution retrieval** during a track's build — the point is testing the framework's own discipline, not its ability to find and copy an existing implementation

## What's measured

### Drift — tracked three ways

**Spec-conformance drift.** Did the finished build stay faithful to the 14 requirements as written, or did scope wander (features added that weren't asked for, requirements reinterpreted, acceptance criteria quietly narrowed)? Measured by checking the final implementation against each requirement's acceptance criteria and noting any deviation.

**Architecture/decision drift.** Did the build violate its own recorded ADRs over the course of development? Only meaningful for tracks that produce ADRs (Durion does; a no-framework baseline won't have any to violate, which is itself a data point). Measured by diffing the final code against what each ADR committed to.

**Session-resume drift.** Does consistency or quality degrade if the build is paused and resumed later — a real pain point for anyone actually using AI to build software over multiple sessions rather than one continuous sitting. Measured by deliberately pausing at least once mid-build and noting whether the resumed session picked up cleanly (read its own governance docs, stayed consistent) or needed significant re-grounding.

### Quality

Automated test pass rate against the fixed test suite (REQ-14), run identically against every track's output. A track that "finishes" all 14 requirements but fails its own test suite is not actually done.

### Speed

Wall-clock time and/or agent-turn count from a track's start to it passing REQ-14's full test suite against all 14 requirements.

### Cost

Tokens and dollars spent per track, from the same model pricing, tracked from start to the same "done" definition used for Speed.

## Recording results

Each track logs its own numbers as it finishes requirements — not reconstructed after the fact — and `results/comparison.md` is the rollup once more than one track exists.
