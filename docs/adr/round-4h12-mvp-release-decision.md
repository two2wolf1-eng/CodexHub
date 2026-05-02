# Round 4H.12 MVP Release Decision

## Status

Accepted decision record for Round 4H.12.

## Decision

Outcome: `no_go_for_mvp`.

The real read-only adapter is not approved for controlled local MVP use by this gate.

## Context

Round 4H.11 recorded `no_go_for_mvp` after the latest controlled retry returned `boundary_deferred` without exposing complete deferred reason readback. A new Boundary Deferred Readback Propagation route was then approved.

Round 4F.34 fixed metadata-only deferred reason propagation through attempt records, summaries, timeline entries, Supervisor readback, and CLI readback. Round 4F.35 then ran exactly one controlled CLI-only read-only retry. That retry created an authoritative, persisted, Supervisor-backed attempt record. It passed preflight and invoked the approved process boundary, but failed with `process_start_failed` / `enoent`.

Round 4G.17 reviewed the 4F.35 result and recorded `pilot_review_complete_with_process_start_release_blocker`.

## Basis

- Attempt id: `codex_real_read_only_adapter_attempt_50c6f46a-f653-407c-9d07-e8dd74acfdcf`
- Attempt status: `failed`
- Preflight status: `passed`
- Process boundary invoked: `true`
- Result status: `failed`
- Result error code: `boundary_failed`
- Boundary failure code: `process_start_failed`
- Start failure kind: `enoent`
- ENOENT kind: `dependency_or_spawn_target_enoent`
- Boundary diagnostics complete: `true`
- Post-run verification status: `skipped`
- Post-run verification skip reason: `attempt_not_completed`
- Workspace mutation detected: `false`
- 4G.17 release blocker: Windows process-start ENOENT/dependency resolution

## Consequences

- 4H.12 does not approve local MVP use.
- 4H.12 does not approve broader autonomous use.
- No further remediation loop is approved in this route.
- A future release gate may be reconsidered only after a separately approved route resolves the process-start ENOENT/dependency-resolution blocker, another controlled retry completes, post-run verification completes, workspace mutation remains clean, evidence/audit/timeline records are complete, and a later review records no release blocker.

## Explicit Non-Approvals

- No Dashboard trigger is approved.
- No `workspace_write` mode is approved.
- No `danger_full_access` mode is approved.
- No browser/CDP/Profile/Workspace/account automation is approved.
- No raw prompt, command, stdout, stderr, agent, reasoning, argv, executable, env value, or raw absolute worktree path persistence is approved.
- No broad autonomous use is approved.

## Next Recommended Work

The next work, if separately approved, should target Windows process-start ENOENT/dependency resolution. It must remain CLI-only, read-only, metadata-only, and within the single approved process-boundary module.
