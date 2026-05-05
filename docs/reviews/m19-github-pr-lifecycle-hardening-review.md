# M19 GitHub PR Lifecycle Hardening Review

Scope reviewed:

- PR lifecycle contracts and evidence kinds.
- GitHub provider fixed GET boundary.
- Supervisor PR lifecycle dry-run, approval, and run routes.
- Store repositories.
- Dashboard and CLI read-only UX.
- Governance config, integration decision, and no-live automation audit.

Findings and fixes:

- PR lifecycle observation is approval-gated even though it is read-only, because it crosses the GitHub network boundary.
- Boundary truth is preserved: pre-boundary blocks report `networkBoundaryInvoked=false`; attempts that reach the fixed GET boundary report `networkBoundaryInvoked=true` and consume approval.
- Public outputs are metadata-only: ids, hashes, counts, statuses, summaries, evidence refs, audit ids, and boundary booleans.
- Request-body approval artifacts and execution authority objects are rejected by Supervisor routes.
- Dashboard and CLI PR lifecycle views use GET/local fixture helpers only and do not read local-control tokens.

Residual risk:

- M19 can observe live PR/check metadata only when the GitHub provider, lifecycle observer flag, token, approval, and hash-bound runtime input are present.
- GitHub API schema drift can cause failed or degraded observations; failures remain metadata-only.
- M20 rework will consume M19 summaries but must not update existing remote branches or bypass child approvals.

Release gate:

- Run focused tests for changed packages/apps.
- Run `pnpm scaffold:health`.
- Run `pnpm audit:boundaries`.
- Run `pnpm audit:sqlite-isolation`.
- Run `pnpm audit:no-live-automation`.
- Run `pnpm audit:skills`.
- Run `pnpm verify:foundation`.
- Run `git diff --check`.

