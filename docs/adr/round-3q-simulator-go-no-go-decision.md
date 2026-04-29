# Round 3Q Simulator Go/No-Go Decision

## Status

Recorded.

## Decision

`go_to_implementation_planning`

This decision allows Round 3R planning only. It is not implementation approval, not process adapter approval, and not execution permission.

## Context

Round 3P added a read-only adapter preflight simulator that checks config, sandbox mode, policy, approval artifact state, hash matching, isolated worktree readiness, evidence/audit readiness, Dashboard trigger prohibition, and operator checklist state. Round 3Q records the governance review of that simulator.

## Approved Scope

- Continue to Round 3R implementation planning.
- Keep future design CLI-only.
- Keep future design read-only only.
- Require explicit config enablement before any later implementation can be considered.
- Require approval artifact binding to `dryRunPlanHash` and `policyDecisionHash`.
- Require isolated worktree and post-run `pnpm verify:foundation` in any future implementation design.
- Require metadata/hash-only evidence and audit.

## Explicit Non-Approval

- No live `codex exec`.
- No `child_process`, `spawn`, or `exec`.
- No Codex app-server.
- No Electron/CDP connection.
- No Chrome Profile or ChatGPT Workspace access.
- No browser click/input automation.
- No workspace write.
- No `workspace_write` or `danger_full_access`.
- No Dashboard trigger.
- No implementation or process adapter approval.

## Required Future Hard Gates

- `read_only` sandbox only.
- `workspace_write` and `danger_full_access` forbidden.
- Dashboard trigger forbidden.
- Dry-run exists.
- Policy decision exists and is compatible.
- Approval artifact exists, is valid, unexpired, not revoked, and unused.
- `dryRunPlanHash` match.
- `policyDecisionHash` match.
- Isolated worktree present.
- Evidence store ready.
- Audit store ready.
- No sensitive body storage.
- Future separate ADR approves implementation.

## Consequences

Round 3R may design how an implementation would satisfy these gates. It must not treat this decision as permission to start a process adapter.
