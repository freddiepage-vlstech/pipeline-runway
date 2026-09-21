# Durion track — generated Angular SDK

Closes `INFRA-7`'s second half (the OpenAPI contracts themselves live in
`../../services/*/openapi.yaml`). This is the generated client the future
Angular app (`INFRA-8`) will depend on — per `ADR-0004`, the frontend calls
only these generated methods, never a hand-written HTTP call against a
service endpoint directly.

## Regenerating

```
./generate.sh
```

Regenerates all three clients from the current contracts into `src/`. Run
this after any change to a service's `openapi.yaml`, then commit the diff —
`src/` is committed, not gitignored, so contract drift shows up as a normal
code review diff. `ci-durion.yml`'s `sdk-contract-sync` job runs the same
script and fails the build if regeneration produces anything different from
what's committed (`ADR-0004`).

## What's generated, and with what

`src/companies/`, `src/contacts/`, `src/opportunities/` — one per service,
each self-contained:

- `<X>Api.ts` — an `NgModule` that wires up the generated service(s) and an
  `OpenAPI` config object (base URL, and a `TOKEN` field for REQ-13's shared
  bearer token).
- `services/*.ts` — one `@Injectable` Angular service per OpenAPI tag,
  methods returning `Observable<T>`, matching each service's contract
  (including the ADR-0002 status codes as documented `@throws` cases).
- `models/*.ts` — one TypeScript interface per schema in the contract.
- `core/` — shared request/error plumbing, generated the same in all three
  (harmless duplication, not worth a shared package for a track this size).

Generated with **openapi-typescript-codegen**, not
`@openapitools/openapi-generator-cli` (the tool named in `ADR-0004`'s
original "same contract-first pattern Durion Positivity uses in
production" framing). That tool's actual generation step downloads a JAR
from `repo1.maven.org` at run time; this project's network egress doesn't
allow that host, on either the cloud sandbox or the local dev machine used
so far. `openapi-typescript-codegen` is pure npm/Node, needs no JVM, and
its `--client angular` output is equivalent for what this track needs: a
real Angular service class per endpoint group, typed models, and an
`NgModule`. This substitution is a tooling detail, not an architectural
one — `ADR-0004`'s actual decision (generate, never hand-write; CI fails on
drift) is unaffected, so it didn't need its own ADR. If that ever changes
(e.g. Maven Central becomes reachable, or `INFRA-8` needs something this
tool doesn't support), swap the tool in `generate.sh` and regenerate — the
committed output and this README both stay accurate to whatever ran last.

## Known rough edges

- `models/PageParam.ts` / `SizeParam.ts` in each service are generated from
  the contract's reusable query-parameter definitions and aren't really
  request/response models — harmless, just a naming quirk of this
  generator. Safe to ignore.
- Nothing here has been `npm install`ed against real `@angular/core` /
  `rxjs` yet, since `INFRA-8`'s Angular app doesn't exist. Verified instead
  with a standalone `tsc --noEmit` pass — every generated file type-checks
  cleanly aside from the expected "cannot find `@angular/core`" /
  "cannot find `rxjs`" errors, which resolve once `INFRA-8` scaffolds a real
  Angular workspace these packages install into.
