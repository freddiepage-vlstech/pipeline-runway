# ADR-0008: Gateway-enforced authentication

**Status:** Accepted
**Date:** 2026-09-21

## Context

Every service's OpenAPI contract already declares `security: bearerAuth` and documents 403 responses on its endpoints, per REQ-13's single shared bearer token. This gap surfaced concretely while fixing an unrelated bug in `companies-service` (an unhandled 500 on out-of-range `page`/`size` query params): nothing in the service actually checks the bearer token. No Spring Security, no filter, no enforcement anywhere — the contract documents an auth requirement that isn't implemented. `AGENTS.md`'s build order says cross-service concerns (gateway routing among them) get wired after the services that produce/consume them exist, and `INFRA-4` (the gateway) hasn't been built yet — only the three services' own scaffolds and, now, `companies-service`'s REQ-1 implementation exist. Left undecided, whoever builds `INFRA-4` or picks up the next service could go either way — enforce per-service, enforce at the gateway, or (worst case) enforce inconsistently across the two — without a documented rule to follow.

## Decision

When a system fronts multiple internal services with a single external gateway, and the auth model is a single shared credential rather than per-user identity that individual services need to inspect for their own authorization decisions, authentication enforcement belongs at the gateway boundary — checked once, on the way in — not duplicated in each backend service behind it. A downstream service trusts that any request reaching it already passed the gateway's check; it does not re-implement the same shared-credential check itself. This holds specifically because the credential is a single shared token with no per-user distinction. If the auth model ever grows per-user roles or resource-level permissions that a downstream service needs to evaluate on its own, this decision should be revisited — gateway-only enforcement stops being sufficient the moment a service needs to know *who* is asking, not just *that* someone with the shared token is asking.

## Applying this here

`INFRA-4` (the Spring Cloud Gateway) is the sole entry point for the Angular frontend per ADR-0001, so it is where REQ-13's single shared bearer token gets enforced: a request without a valid token is rejected with 403 before it's ever routed onward. `companies-service`, `contacts-service`, and `opportunities-service` implement no auth logic of their own — no Spring Security dependency, no token filter — and trust that traffic reaching them already cleared the gateway. Each service's `security: bearerAuth` declaration in its own `openapi.yaml` stays as-is: it documents the contract's auth requirement for anyone reading or generating a client against that spec, not a claim that the service itself enforces it. This is consistent with `AGENTS.md`'s build order — auth enforcement is written when `INFRA-4` is built, not retrofitted into each service now.

## Consequences

- No duplicated shared-token logic across three services — one place to get REQ-13's auth model right, one place to change if it ever grows.
- Any service run or tested directly, bypassing the gateway — including REQ-14's own test suite, which exercises each service's controllers directly via MockMvc — has zero auth enforcement by design. This is intentional, not an oversight: don't treat "hitting a service on its own port has no protection" as a vulnerability to fix later without first checking this ADR.
- Until `INFRA-4` exists, none of the three services has any auth enforcement at all if deployed somewhere reachable directly. Acceptable for this track's current scope (contract-first build order, a single shared credential, not a production hardening exercise) but worth stating plainly rather than discovering it by surprise.
- If REQ-13's auth model ever grows beyond a single shared token — per-user identity, resource-scoped permissions — gateway-only enforcement is no longer sufficient on its own, and this ADR should be amended or superseded rather than quietly patched around.

## Alternatives considered

- **Each service enforces the shared bearer token itself (e.g., a small servlet filter checking the token against an env var):** rejected as unnecessary duplication for a single shared credential with no per-user distinction — three copies of the same trivial check, three places for it to drift out of sync. Would be the right call if the auth model needed per-service authorization decisions; it doesn't, per REQ-13.
- **Enforce at both the gateway and each service (defense in depth):** rejected for this track's scope — reasonable in a production hardening pass, but adds real duplication for no benefit against this project's actual threat model (a demo/reference track with a single shared token, not a production multi-tenant system). Worth reconsidering if this track's purpose changes.
- **Leave it undecided and let whoever builds INFRA-4 or the next service decide ad hoc:** rejected outright — this is exactly the kind of decision that drifts inconsistently across services if left implicit, per the same reasoning `ADR-0002`/`ADR-0003` already apply to status codes and exception handling.
