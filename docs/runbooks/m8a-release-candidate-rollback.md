# M8a Release Candidate Rollback

Date: 2026-05-04

## Scope

M8a is documentation and release-baseline hardening only. It creates no runtime
state, no route, no store table, no external process boundary, and no network
exporter. Rollback is therefore limited to reverting documentation/checklist
changes if needed.

## Default Runtime Rollback Controls

Keep or restore these conservative states:

| Capability | Rollback Control |
| --- | --- |
| Codex CLI | Keep `codex-cli.enabled=false`; do not provide real execution approval |
| Nx affected | Keep `nx-affected.enabled=false` unless running explicit verification |
| MCP server | Keep tools read-only; keep HTTP loopback/token-gated |
| Browser observation | Keep `playwright-observer.enabled=false`; unset `CODEXHUB_PLAYWRIGHT_OBSERVER_ENABLED` |
| Electron/CDP | Keep `electron-cdp.enabled=false`; unset `CODEXHUB_ELECTRON_CDP_OBSERVER_ENABLED` and `CODEXHUB_ELECTRON_CDP_EVENTS_ENABLED` |
| Worktree manager | Keep `worktree-manager.enabled=false`; unset `CODEXHUB_WORKTREE_MANAGER_ENABLED` and `CODEXHUB_WORKTREE_CLEANUP_ENABLED` |
| Policy backend | Keep `policy-backend.enabled=false`; no OPA/Cedar runtime configured |
| Telemetry | Keep `otel-adapter.enabled=false`; no OpenTelemetry SDK or OTLP exporter configured |

## Rollback Steps

1. Revert the M8a documentation commit if the release baseline is wrong.
2. Rerun:

   ```powershell
   pnpm scaffold:health
   pnpm audit:no-live-automation
   pnpm verify:foundation
   git status --short --branch
   ```

3. Confirm no runtime enablement flags were changed as part of the rollback.
4. If a previous controlled runtime round produced state, use that capability's
   integration decision and runbook. M8a itself does not create cleanup work.

## Stop Conditions

Rollback is mandatory if M8a accidentally:

- Adds a route or adapter execution path.
- Adds a new process, WebSocket, CDP, git, or network boundary.
- Enables a product default that was previously disabled.
- Makes policy backend or telemetry authoritative.
- Requires local-control credentials for a read-only UX surface.
