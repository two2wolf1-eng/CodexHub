# Round 4H.6 MVP Release Decision

## Status

Accepted decision record for Round 4H.6.

## Decision

Outcome: `no_go_for_mvp`.

The real read-only adapter is not approved for controlled local MVP use by this gate.

## Context

Round 4F.20 remediated the `process_start_failed` class with safe executable resolution, a minimal startup environment allowlist, and fake/injected-runner tests. Round 4F.21 then ran one controlled CLI-only read-only retry. That retry created an authoritative, persisted, Supervisor-backed attempt record and invoked the approved process boundary, but it failed with `process_start_failed`.

Round 4G.10 reviewed the 4F.21 result and recorded `pilot_review_complete_with_release_blocker`.

## Basis

- Attempt id: `codex_real_read_only_adapter_attempt_7455f983-adf8-45d7-a5cf-d14c67897e31`
- Attempt status: `failed`
- Preflight status: `passed`
- Result status: `failed`
- Result error code: `boundary_failed`
- Process boundary invoked: `true`
- Normalized boundary failure code: `process_start_failed`
- Boundary diagnostics complete: `true`
- Post-run verification status: `skipped`
- Post-run verification skip reason: `attempt_not_completed`
- Workspace mutation detected: `false`
- 4G.10 release blocker: `process_start_failed`

## Consequences

- 4H.6 does not approve local MVP use.
- 4H.6 does not approve broader autonomous use.
- A future release gate may be reconsidered only after the process-start failure is remediated, another controlled retry is performed, that retry completes with post-run verification, and a later review records no release blocker.

## Explicit Non-Approvals

- No Dashboard trigger is approved.
- No `workspace_write` mode is approved.
- No `danger_full_access` mode is approved.
- No browser/CDP/Profile/Workspace/account automation is approved.
- No raw prompt, command, stdout, stderr, agent, reasoning, argv, executable, env, or raw absolute worktree path persistence is approved.
- No broad autonomous use is approved.

## Next Recommended Round

The next implementation work should be a narrow process-start follow-up. It should not run a pilot first, and it should not broaden the boundary. It should diagnose why the real process start still fails even though executable resolution reports `resolved`, shell remains disabled, and runtime executable/env details remain metadata-only.
