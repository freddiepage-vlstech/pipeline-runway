# Agent contracts — Durion track

This track uses a two-tier agent structure: **orchestrators** that coordinate work across services, and **service-scoped leaf agents** that own a single service's implementation. An AI coding session (or a human) picks up work by first reading the orchestrator responsible for the area it's touching, which delegates to the relevant leaf agent(s).

## Why this exists

Durion Positivity's own real `.github/agents/` folder has two subfolders: `archive/`, holding orchestrator-pattern agents (`api.orchestrator`, `ui.orchestrator`, `pr-review-orchestrator`, paired planner/coder agents) that are no longer used, and `domains/`, the current live pattern — one flat `.agent.md` file per business domain, no orchestration tier. The real platform moved from orchestrators to flat domain agents because at its scale (dozens of domains, five repos), an extra coordination tier added overhead that a flat structure didn't need once each domain's boundaries were well understood.

This track intentionally keeps the orchestrator tier instead of going flat. It's a much smaller system — three services, one frontend — where a flat structure wouldn't need much coordinating either. The tier is here because the benchmark's purpose includes demonstrating enterprise agentic-development patterns at a range of scales, including one Durion itself has since retired for its own scale. Reusing the flat-only pattern would leave that pattern unexercised. Treat this as a deliberate scope decision, not a claim that orchestration is the better choice generally.

## Structure

| Agent | Scope | Coordinates / reports to |
|---|---|---|
| [`orchestrators/api-orchestrator.agent.md`](orchestrators/api-orchestrator.agent.md) | Backend: all three services, cross-service event contracts | Delegates to the three service leaf agents |
| [`orchestrators/ui-orchestrator.agent.md`](orchestrators/ui-orchestrator.agent.md) | Frontend: Angular app + generated SDK consumption | Requests contract changes from `api-orchestrator`, never calls a service directly |
| [`orchestrators/pr-review-orchestrator.agent.md`](orchestrators/pr-review-orchestrator.agent.md) | Every PR touching `tracks/durion/` | Final gate; can block a merge either orchestrator approved |
| [`services/companies-service.agent.md`](services/companies-service.agent.md) | `tracks/durion/services/companies-service/**` | Reports to `api-orchestrator` |
| [`services/contacts-service.agent.md`](services/contacts-service.agent.md) | `tracks/durion/services/contacts-service/**` | Reports to `api-orchestrator` |
| [`services/opportunities-service.agent.md`](services/opportunities-service.agent.md) | `tracks/durion/services/opportunities-service/**` | Reports to `api-orchestrator` |

All seven files follow `AGENTS.md`'s source-of-truth hierarchy (spec > ADRs > `AGENTS.md` > existing code) — none of them override it, they only add role-specific MAY/MUST ASK/MUST NOT detail on top of it.

These files describe a working agreement, not a specific tool's custom-agent feature — whatever AI coding session (Claude, Copilot, or otherwise) picks up work in this track reads the relevant file(s) the same way it reads `AGENTS.md`.
