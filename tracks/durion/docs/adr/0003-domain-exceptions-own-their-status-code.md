# ADR-0003: Domain exceptions own their status code

**Status:** Accepted
**Date:** 2026-09-16 (amended 2026-09-17)

## Context

A status-code classification policy (`ADR-0002`) only holds if it's applied the same way everywhere it's needed — if that responsibility is left to whoever writes a given controller method, the classification drifts out of sync with the documented rule even when the documentation itself is fine. This is adapted from Durion Positivity's own production ADR-0056, written after real enforcement testing found holes where a generic catch-all was silently swallowing domain exceptions and answering with the wrong code, or a bare 500.

## Decision

Every domain exception declares its own HTTP status as part of the exception class itself — never decided at the point where it's thrown, and never inferred by a generic catch-all guessing from the exception's type name or message. A shared base exception type exposes the status as a required constructor argument or abstract accessor, so a new domain exception cannot be written without explicitly picking a status. A single, thin global exception handler per service reads that status off the exception and maps it to the response — it contains no per-exception-type branching that could quietly diverge from the classification policy. No service catches `Exception` or `RuntimeException` generically and returns a fixed default code; an uncaught, unclassified exception is a bug to fix by giving it a proper domain type, never a case to paper over.

## Applying this here

Each of `companies-service`, `contacts-service`, and `opportunities-service` defines its own `DomainException` base type carrying the status chosen per `ADR-0002`, with one `@ControllerAdvice`-style handler per service. REQ-14's test suite includes a check that fails if any genuinely uncaught, unclassified exception reaches a controller boundary in any of the three services.

## Consequences

- Adding a new domain refusal forces whoever's writing it to consult the classification policy and make an explicit choice, rather than letting framework defaults decide incidentally.
- The global exception handler stays thin — a lookup, not a decision tree — easy to verify by inspection that it isn't secretly reintroducing inconsistency.
- Requires slightly more ceremony per exception class than throwing a bare unchecked exception and letting framework defaults handle it — accepted deliberately, since that ceremony is what makes the classification policy actually enforceable instead of aspirational.

## Alternatives considered

- **Decide status codes in a big switch statement inside the global handler:** rejected — recreates the exact failure mode this ADR exists to close: a central place where it's easy to add a new exception type and forget to route it correctly.
- **Trust convention and code review alone:** rejected as insufficient — Durion's own production history (the enforcement-testing work behind ADR-0056) shows this doesn't hold up over time without a structural forcing function.

## Amendment (2026-09-17)

The Decision was rewritten to state the rule (status lives on the exception class, one thin handler per service, no generic catch-all) without naming this project's specific services in the rule itself. Those specifics moved to the new "Applying this here" section. No behavior changed.
