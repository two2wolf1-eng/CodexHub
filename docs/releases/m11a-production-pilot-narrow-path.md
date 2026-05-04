# M11a Production Pilot Narrow Path

## Status

M11a adds the first production-pilot narrow path as a governed local control-plane slice. The implementation is intentionally narrow and conservative.

## Scope

- M11 pilot contracts for run, step, readiness, evidence summary, and failure summary.
- Orchestrator M11 runner that wraps the existing M9 local pilot chain and enforces Codex read-only dry-run behavior.
- Supervisor routes:
  - `POST /api/pilots/m11/local-runs`
  - `GET /api/pilots/m11/local-runs`
  - `GET /api/pilots/m11/local-runs/:id`
- Dashboard `#/pilot` read-only M11 summary.
- CLI read-only commands:
  - `codexhub pilot m11 readiness`
  - `codexhub pilot m11 runs list`
  - `codexhub pilot m11 runs show <runId>`
- Governance config and runbook documentation.

## Non-Scope

- No new process boundary.
- No new browser, Electron/CDP, MCP, policy backend, or telemetry execution surface.
- No Codex workspace write.
- No patch generation.
- No push.
- No opened pull request.
- No approval artifact or execution authority accepted from request bodies.

## Safety Properties

- Worktree execution still requires persisted approval and hash-bound runtime input.
- Codex remains read-only dry-run only.
- PR draft status is limited to `not_ready_no_patch` or `blocked`.
- Public outputs are metadata-only: ids, hashes, counts, statuses, summaries, evidence ids, audit ids, and boundary booleans.
- Dashboard and CLI M11 views are read-only and do not pass local-control tokens.

## Acceptance Evidence

Expected M11a verification:

```bash
pnpm nx run-many --target=test "--projects=contracts,orchestrator-kernel,supervisor,dashboard,cli" --skip-nx-cache
pnpm nx run-many --target=lint "--projects=contracts,orchestrator-kernel,supervisor,dashboard,cli" --skip-nx-cache
pnpm nx run-many --target=build "--projects=contracts,orchestrator-kernel,supervisor,dashboard,cli" --skip-nx-cache
pnpm scaffold:health
pnpm audit:boundaries
pnpm audit:sqlite-isolation
pnpm audit:no-live-automation
pnpm audit:skills
pnpm verify:foundation
git diff --check
```

## Residual Risk

The route can invoke existing audited worktree, Codex, and Nx boundaries when enabled and approved. M11a does not widen those boundaries, but operator enablement must stay explicit and short-lived.

## Next Step

M11b should add operator enablement detail: clearer readiness blockers, safe-enable guidance, and latest-run summaries. It should not add a CLI execution command.
