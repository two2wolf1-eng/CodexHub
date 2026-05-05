# M20 Rework Loop Hardening Review

## Review Scope

Reviewed the M20 rework loop contracts, orchestrator projection, Supervisor control plane, store repositories, CLI/Dashboard read-only UX, governance config, and release docs.

## Findings And Fixes

- Confirmed rework plans and runs remain metadata-only. The rework loop does not call patch, branch publish, draft PR, GitHub, Git, or Codex execution directly.
- Confirmed request-body `approvalArtifact`, `authority`, and `executionAuthority` are rejected by Supervisor mutating routes.
- Confirmed child approvals remain required. Rework runs expose `childApprovalsRequired=true` and `directChildExecutionAllowed=false`.
- Confirmed CLI/Dashboard use GET or fixture-only helpers for the read-only UX and do not read or persist local-control credentials.
- Added regression tests for raw diff, raw PR body, raw reason, path, token, and body storage flags.

## Residual Risks

- M20 is an orchestration/projection layer. Real patch retry, remote branch publish, and draft PR creation still depend on their child control planes and must keep separate approvals.
- Supersede metadata does not delete or update remote branches. Operators must use later governed cleanup or supersede workflows if remote artifacts need lifecycle management.

## Release Gate

M20 is acceptable for the long-chain baseline only if focused tests, governance audits, `pnpm verify:foundation`, and `git diff --check` pass.
