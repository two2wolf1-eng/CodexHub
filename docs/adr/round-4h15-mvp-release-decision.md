# Round 4H.15 MVP Release Decision

## Status

Accepted decision record for Round 4H.15.

## Decision

Outcome: `no_go_for_mvp`.

The real read-only adapter is not approved for controlled local MVP use by this gate.

## Context

Round 4F.40 remediated the Codex CLI invocation contract by using the supported CLI shape, removing internal governance ids from subprocess argv, keeping the fixed `codex_cli` policy label, keeping `shell=false`, and closing stdin without prompt body. Round 4F.41 then ran one controlled CLI-only read-only retry.

The 4F.41 retry created an authoritative, persisted, Supervisor-backed attempt record. It passed preflight and invoked the approved process boundary, but the boundary result failed with `process_exit_nonzero` and `exitCode=2`. Post-run verification was skipped because the attempt did not complete.

Round 4G.20 reviewed that result and recorded `pilot_review_complete_with_invocation_release_blocker`.

## Basis

- Attempt id: `codex_real_read_only_adapter_attempt_6ff16386-b97a-4527-af41-ebdd57c187bb`
- Attempt status: `failed`
- Preflight status: `passed`
- Process boundary invoked: `true`
- Result status: `failed`
- Result error code: `boundary_failed`
- Boundary failure code: `process_exit_nonzero`
- Exit code: `2`
- Boundary diagnostics complete: `true`
- Post-run verification status: `skipped`
- Post-run verification skip reason: `attempt_not_completed`
- Workspace mutation detected: `false`
- 4G.20 outcome: `pilot_review_complete_with_invocation_release_blocker`

## Consequences

- 4H.15 does not approve local MVP use.
- 4H.15 does not approve broader autonomous use.
- 4H.15 does not approve Dashboard triggering.
- 4H.15 does not approve `workspace_write` or `danger_full_access`.
- Because the remaining blocker is still in the CLI invocation/nonzero usage-error class, the optional bounded route may continue to 4F.42.
- A future release gate may be reconsidered only after a controlled retry completes, post-run verification completes, workspace mutation remains clean, evidence/audit/timeline records are complete, and a later review records no release blocker.

## Explicit Non-Approvals

- No Dashboard trigger is approved.
- No `workspace_write` mode is approved.
- No `danger_full_access` mode is approved.
- No browser/CDP/Profile/Workspace/account automation is approved.
- No `shell=true` process launch is approved.
- No arbitrary executable path or arbitrary argv is approved.
- No raw prompt, command, stdout, stderr, agent, reasoning, argv, executable, env, or raw absolute worktree path persistence is approved.
- No broad autonomous use is approved.

## Next Route

The next allowed round is 4F.42 only because the remaining blocker is still `process_exit_nonzero` / `exitCode=2`, which is in the bounded CLI invocation/nonzero usage-error remediation scope.

If 4F.42 discovers the true blocker is prompt/input governance, auth, config, approval, policy, worktree, Dashboard, permission, raw-data persistence, workspace mutation, or another non-invocation class, the route must stop after the next review/gate and report the new blocker instead of forcing MVP approval.
