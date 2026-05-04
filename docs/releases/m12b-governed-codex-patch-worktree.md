# M12b Governed Codex Patch In Isolated Worktree

## Status

M12b adds the governed Codex patch handoff language for an approved isolated
worktree. This is a package-level product slice: it does not add a new
Supervisor route, does not add a new process boundary, does not push, and does
not open a pull request.

## Delivered Scope

- Added contracts for `GovernedCodexPatchPlan` and `GovernedCodexPatchRun`.
- Added `codex.patch_plan` and `codex.patch_run_summary` evidence kinds.
- Added `codex-exec-adapter` helpers for hash-bound patch plans and
  metadata-only injected run summaries.
- Added orchestrator projection from governed Codex patch handoff to M12 patch
  lifecycle state.
- Added `not_ready_pending_verification` so generated patch metadata cannot be
  marked PR-ready before Nx verification.

## Safety Invariants

- `writeScope=isolated-worktree-only`
- `repoRootWriteAllowed=false`
- `pushAllowed=false`
- `pullRequestOpened=false`
- `approvalRequired=true`
- `persistedApprovalRequired=true`
- `hashBoundWorktreeRequired=true`
- Raw prompt, stdout, stderr, diff, path, PR body, token, cookie, and session
  fields are rejected or summarized as hashes/counts only.

## Runtime Boundary

M12b does not introduce a new runtime boundary. The helper records boundary
truth supplied by an existing governed Codex execution path. It does not import
process-launching modules and does not invoke Codex directly.

## Rollback

Revert this release by removing the M12b governed Codex patch contracts,
`patch-mode` helper, orchestrator projection, governance config entries, and
this document. No store migration or worktree cleanup is required.
