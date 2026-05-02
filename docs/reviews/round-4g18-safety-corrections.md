# Round 4G.18: Safety Corrections

## GSD Spec

- Goal: determine whether the 4F.37 review requires a safety correction before the MVP gate.
- Scope: docs-only safety assessment for the 4F.37 dependency ENOENT retry result.
- Non-scope: no code changes, no pilot retry, no adapter attempt invocation, no approvals, no config edits, no Dashboard changes, and no permission expansion.
- Acceptance criteria: safety correction need is stated explicitly and the next route is bounded by the observed blocker class.
- Hard boundaries: Dashboard trigger, `workspace_write`, `danger_full_access`, browser/CDP/Profile/Workspace/account automation, arbitrary executable paths, arbitrary argv, `shell=true`, fallback authority, and raw body/path/output persistence remain forbidden.
- Affected apps/packages/docs: `docs/reviews` only.
- Risk level: low, because this round is review-only.

## Safety Assessment

No code correction is applied in 4G.18.

The 4F.37 retry produced an authoritative, persisted, metadata-only attempt with `preflightStatus=passed`, `processBoundaryInvoked=true`, complete boundary diagnostics, and `workspaceMutationDetected=false`.

The remaining issue is not a docs-only warning issue and is not the dependency ENOENT/process-start class. The boundary process started and exited nonzero:

- Boundary failure code: `process_exit_nonzero`.
- Start failure kind: `none`.
- ENOENT kind: `none`.
- Exit code: `2`.
- Post-run verification: `skipped`, reason `attempt_not_completed`.

## Release Impact

This remains a release blocker because MVP readiness requires a completed attempt, completed post-run verification, clean workspace mutation check, complete evidence/audit/timeline records, and no unresolved release blocker.

The ENOENT optional remediation loop must not continue from 4G.18, because the blocker changed from dependency/spawn-target ENOENT to boundary command nonzero exit.

## Boundaries Reconfirmed

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- Broader autonomous use remains blocked.
- Fallback/degraded output remains non-authoritative.
- Raw prompt, command, stdout/stderr, executable path, env values, agent/reasoning body, and raw worktree path persistence remain forbidden.

## Recommended Follow-Up

Proceed to Round 4H.13 as the required governance gate for the current loop. Expected outcome: `no_go_for_mvp`.

After 4H.13, the next remediation route should target the new blocker class: boundary process nonzero exit diagnosis/remediation, not another ENOENT loop.
