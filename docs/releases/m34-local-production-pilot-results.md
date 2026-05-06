# M34 Local Production Pilot Results

## Summary

M34 adds fixture/injected acceptance coverage and operator smoke metadata for the local production workflow pilot. It proves the local chain can be rehearsed without introducing new routes, providers, or live boundaries.

## Acceptance Scenarios

- `all-pass`
- `pilot-disabled`
- `workflow-approval-blocked`
- `child-approval-blocked`
- `worktree-failed`
- `codex-patch-failed`
- `nx-failed`
- `review-export-blocked`
- `resume-after-child-approval`

## Safety Outcomes

- Nx failure skips review package export.
- Worktree, Codex patch, Nx, and review export failures remain metadata-only in rehearsal output.
- Cleanup is represented as handoff metadata only; no force cleanup or file deletion is introduced.
- Boundary booleans remain false in fixture rehearsal and are left to child control planes for real runs.

## Verification

- `pnpm nx run contracts:test --skip-nx-cache`
- `pnpm nx run workflow-kernel:test --skip-nx-cache`
- `pnpm nx run cli:test --skip-nx-cache`
- `pnpm nx run dashboard:test --skip-nx-cache`

## Residual Risk

Real local child boundaries remain high risk and must continue to use each child control plane's dry-run, persisted approval, execution authority, evidence, and audit records.
