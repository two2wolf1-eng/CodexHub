# M11c Pilot Failure Recovery Projection

## Summary

M11c adds a read-only recovery projection for the M11 production pilot narrow path. It maps M11 failure classifications to operator recovery actions and exposes cleanup handoff metadata through existing M11 GET views.

## Scope

- Added M11 recovery and cleanup handoff contracts.
- Added an orchestrator-kernel recovery projection helper.
- Extended existing Supervisor M11 run responses with recovery metadata.
- Extended Dashboard `#/pilot` and CLI M11 read-only output.
- Updated the M11 runbook and governance config.

## Safety

- No new Supervisor route.
- No new write UI.
- No new process, network, browser, Electron/CDP, MCP, or git boundary.
- No push or pull request creation.
- No Codex workspace write or patch generation.
- Recovery output is metadata-only: ids, hashes, counts, statuses, summaries, evidence ids, audit ids, and boundary booleans.

## Operator Behavior

Recovery actions include readiness resolution, worktree approval review, worktree boundary inspection, Codex dry-run review, Nx verification review, projection source inspection, and cleanup handoff review. Cleanup handoff is display-only; cleanup still requires the existing governed cleanup control plane.

## Verification

This round must pass focused contracts, orchestrator, Supervisor, Dashboard, and CLI checks, followed by governance audits and `pnpm verify:foundation`.
