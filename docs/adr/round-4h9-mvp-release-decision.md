# Round 4H.9 MVP Release Decision

## Status

Accepted decision record for Round 4H.9.

## Decision

Outcome: `no_go_for_mvp`.

The real read-only adapter is not approved for controlled local MVP use by this gate.

## Context

Round 4H.8 recorded `no_go_for_mvp` after the first Aggressive Remediation Mode loop. Because the remaining blocker was still in the executable/process-start compatibility class, the route allowed one optional second remediation-and-retry loop.

Round 4F.28 remediated executable selection so that the resolver could evaluate multiple trusted direct candidates before failing closed. Round 4F.29 then ran one controlled CLI-only read-only retry. That retry created an authoritative, persisted, Supervisor-backed attempt record. It passed preflight and invoked the approved process boundary, but the boundary result failed during process start.

Round 4G.14 reviewed the 4F.29 result and recorded `pilot_review_complete_with_process_start_release_blocker`.

## Basis

- Attempt id: `codex_real_read_only_adapter_attempt_dc3fec94-be99-4ad4-9bd6-7dec96e648e9`
- Attempt status: `failed`
- Preflight status: `passed`
- Result status: `failed`
- Result error code: `boundary_failed`
- Process boundary invoked: `true`
- Boundary diagnostics complete: `true`
- Failure code: `process_start_failed`
- Start failure kind: `enoent`
- Resolved executable kind: `native_exe`
- Executable resolution status: `resolved`
- Executable exists: `true`
- Executable accessible: `true`
- Workspace mutation detected: `false`
- Post-run verification status: `skipped`
- Post-run verification skip reason: `attempt_not_completed`
- 4G.14 release blocker: `process_start_failed`

## Consequences

- 4H.9 does not approve local MVP use.
- 4H.9 does not approve broader autonomous use.
- Aggressive Remediation Mode is complete. Both allowed remediation-and-retry loops were used.
- No third remediation loop is approved in this route.
- A future release gate may be reconsidered only after a separately approved route resolves the process-start failure, another controlled retry completes, post-run verification completes, workspace mutation remains clean, evidence/audit/timeline records are complete, and a later review records no release blocker.

## Explicit Non-Approvals

- No Dashboard trigger is approved.
- No `workspace_write` mode is approved.
- No `danger_full_access` mode is approved.
- No browser/CDP/Profile/Workspace/account automation is approved.
- No raw prompt, command, stdout, stderr, agent, reasoning, argv, executable, env, or raw absolute worktree path persistence is approved.
- No broad autonomous use is approved.

## Next Recommended Work

The next work, if separately approved, should target the remaining Windows process-start `enoent` blocker. It must remain CLI-only, read-only, metadata-only, and within the single approved process-boundary module.
