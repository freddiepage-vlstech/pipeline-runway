# companies-service

Owns the Company aggregate (REQ-1). Currently INFRA-1 scaffolding only — no
endpoints, no entities.

- Contract: [`openapi.yaml`](openapi.yaml) (INFRA-7)
- Working agreement for this service: [`../../agents/services/companies-service.agent.md`](../../agents/services/companies-service.agent.md)
- Governing ADRs: [`../../docs/adr/`](../../docs/adr/) — all of them apply; ADR-0001 and ADR-0005 are the ones most specific to this service.
- Run locally: `mvn spring-boot:run` (needs `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USERNAME`/`DB_PASSWORD` env vars, or a running Postgres matching `application.yml`'s defaults). `docker compose up` from the track root (INFRA-5) is the normal way once that exists.
- Health: `GET /actuator/health`
