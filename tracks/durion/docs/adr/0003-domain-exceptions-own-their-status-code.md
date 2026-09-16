# ADR-0003: Domain exceptions own their status code

**Status:** Accepted
**Date:** 2026-09-16

## Context

`ADR-0002` defines *what* status code a domain refusal should return, but not *where* that decision lives in the code. If it's left to whoever writes a given controller method to remember and apply the rule correctly every time, the classification will drift out of sync in practice even though it's well documented — exactly the kind of gap Durion Positivity's own ADR-0056 was written to close, after enforcement testing found real holes where a generic catch-all was silently swallowing domain exceptions and answering with the wrong code (or a bare 500).

## Decision

Every domain exception in this track's services declares its own HTTP status as part of the exception class itself — not decided at the point where it's thrown, and never inferred by a generic catch-all handler guessing based on exception type name or message content.

Concretely: a shared base exception type (e.g., `DomainException`) exposes the status code as a required constructor argument or an abstract accessor, so a new domain exception *cannot* be written without explicitly picking one of `ADR-0002`'s three buckets. A single `@ControllerAdvice`-style global handler per service reads that status off the exception and maps it to the response envelope — it does not contain per-exception-type branching logic that could quietly diverge from `ADR-0002`.

No service catches `Exception` or `RuntimeException` generically and returns a fixed code (e.g., defaulting everything unrecognized to 500 or 400). An uncaught, unclassified exception is a bug to fix by giving it a proper domain type — not a case to paper over with a catch-all.

## Consequences

- Adding a new domain refusal forces the developer (or AI session) to consult `ADR-0002` and make an explicit choice, rather than letting the framework's default exception handling pick something incidentally.
- The global exception handler stays thin — a lookup, not a decision tree — which makes it easy to verify by inspection that it isn't secretly reintroducing inconsistency.
- REQ-14's test suite should include a test that fails if a genuinely uncaught/unclassified exception reaches a controller boundary in any of the three services, mirroring how Durion's own ADR-0056 enforcement was hardened after real gaps were found in production.
- This requires slightly more ceremony per exception class than throwing a bare `IllegalStateException` and letting Spring's defaults handle it — accepted deliberately, since that ceremony is what makes `ADR-0002` actually enforceable instead of aspirational.

## Alternatives considered

- **Decide status codes in a big switch statement inside the global exception handler:** rejected — this recreates the exact failure mode Durion's ADR-0056 was written to close: a central place where it's easy to add a new exception type and forget to route it, silently falling through to a wrong default.
- **Trust convention and code review alone:** rejected as insufficient on its own — Durion's production history (ADR-0056's own enforcement-testing PRs) shows this doesn't hold up over time without a structural forcing function.
