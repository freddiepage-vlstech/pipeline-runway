# Track: Durion

Durion Positivity's governance model applied to this project — ADRs before implementation, `AGENTS.md`/`CLAUDE.md` as the working agreement for AI sessions, a knowledge catalog for navigation, and a contract-first (OpenAPI → generated SDK) build order. This is the same governance pattern used in production for the actual Durion Positivity codebase, applied fresh here rather than reused directly.

Builds the 14 requirements in [`/spec/requirements.md`](../../spec/requirements.md) against the target stack described in the root README: Java + Spring Boot microservices (Companies, Contacts, Opportunities/Pipeline), Spring Cloud Gateway, Kafka for the automation events, Angular frontend.

## Structure

```
durion/
├── AGENTS.md / CLAUDE.md   — working agreement for AI sessions on this track
├── docs/adr/               — architecture decision records
├── services/
│   ├── companies-service/
│   ├── contacts-service/
│   └── opportunities-service/
├── gateway/                — Spring Cloud Gateway config
├── frontend/               — Angular app
├── contracts/              — OpenAPI specs + generated SDK
└── docker-compose.yml      — services + Postgres x3 + Kafka + gateway, local only
```

Start here: [`AGENTS.md`](AGENTS.md) is the working agreement for any session doing implementation on this track, and [`docs/adr/`](docs/adr/) holds the binding architecture decisions made so far.

## Status

In progress — governance docs and ADR-0001 (service boundaries and conventions) are in place. Service and frontend code not yet started; see the `track:durion` labeled issues in this repo for what's next (`INFRA-1` through `INFRA-8`, then `REQ-1` through `REQ-14`). See [`/results/comparison.md`](../../results/comparison.md) for this track's numbers once measurement begins.
