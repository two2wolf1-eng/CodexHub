# M12d Patch Retry Cleanup Lifecycle

## Status

M12d adds metadata-only retry, resume, and cleanup handoff projections for controlled patch lifecycles.

## Delivered Scope

- Added `ControlledPatchRetryCleanupProjection` for retry/resume/cleanup state.
- Added an orchestrator helper that maps M12c verification outcomes to next-step handoff metadata.
- Recorded attempt count, previous attempt hash, retry reason hash, last safe step, cleanup readiness, and dirty worktree summary hashes.
- Preserved draft-only behavior: no push, no remote PR, no force cleanup, and no filesystem delete fallback.

## Safety Invariants

- Real retry requires a new approval.
- Cleanup remains governed and non-force.
- Dirty worktrees are not cleanup-ready; only dirty counts and summary hashes are recorded.
- Raw prompt, stdout, stderr, diff, retry reason, path, command body, token, cookie, session, and body content are not persisted.
- No Supervisor route, process boundary, network boundary, or UI write entry was added.

## Rollback

Remove the M12d projection helper, the `ControlledPatchRetryCleanupProjection` contract, and this release registration. M12c remains valid as the verification gate and PR draft readiness boundary.
