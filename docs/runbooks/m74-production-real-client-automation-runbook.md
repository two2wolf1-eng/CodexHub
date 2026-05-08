# M74 Production Real Client Automation Runbook

## Operator Model

M74 real-client automation is available only through registered surfaces and reviewed operation manifests. Operators do not submit raw CDP endpoints, selectors, JavaScript, prompts, DOM, request bodies, response bodies, or authority material to production routes.

## Preconditions

- Surface registered server-side or via a governed break-glass session.
- Operation manifest registered with reviewed operation id, surface kind, risk tier, evidence policy, and selector/script hashes where applicable.
- Local-control token configured for mutating Supervisor routes.
- `CODEXHUB_PRODUCTION_REAL_CLIENTS_ENABLED=true` only when the environment is ready for governed execution.
- High-risk operations have a dry-run and store-resolved approval binding.
- Break-glass operations have two distinct approver hashes, an incident reference, and a TTL.

## Standard Flow

1. Review registered surfaces with `GET /api/real-clients/surfaces`.
2. Review capability policy with `GET /api/real-clients/capabilities`.
3. Create a dry-run using ids and input refs only.
4. Route high-risk approvals through the existing approval path.
5. Resolve/store authority from the approved dry-run.
6. Execute only after authority is store-resolved and environment gates are enabled.
7. Review evidence and audit by ids.

## Break-Glass Flow

Break-glass is for temporary surface, selector, named script, delegated admin, or emergency bulk automation registration. It requires two approvals, an incident id, TTL, append-only audit, and post-run review. It cannot authorize forbidden capabilities or store E5 secret material.

## Rollback

Disable `CODEXHUB_PRODUCTION_REAL_CLIENTS_ENABLED`, remove or expire the relevant manifest/surface registration, and review the associated audit ledger entries. If a break-glass session was used, confirm TTL expiration and complete post-run review before allowing further high-risk work.
