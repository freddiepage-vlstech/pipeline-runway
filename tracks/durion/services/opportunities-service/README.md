# opportunities-service

Owns the Opportunity aggregate, pipeline stages, and automation triggers
(REQ-3 through REQ-11). Currently INFRA-3 scaffolding only — no endpoints,
no entities, no Kafka wiring yet (that's INFRA-6).

- Contract: [`openapi.yaml`](openapi.yaml) (INFRA-7)
- Working agreement for this service: [`../../agents/services/opportunities-service.agent.md`](../../agents/services/opportunities-service.agent.md)
- Governing ADRs: [`../../docs/adr/`](../../docs/adr/) — all of them apply; ADR-0001, ADR-0005, ADR-0006, and ADR-0007 are the ones most specific to this service.
- Run locally: `mvn spring-boot:run` (needs `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USERNAME`/`DB_PASSWORD` env vars, or a running Postgres matching `application.yml`'s defaults). `docker compose up` from the track root (INFRA-5) is the normal way once that exists.
- Health: `GET /actuator/health`
