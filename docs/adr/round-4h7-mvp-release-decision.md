# Round 4H.7 MVP Release Decision

## Status

Accepted decision record for Round 4H.7.

## Decision

Outcome: `no_go_for_mvp`.

The real read-only adapter is not approved for controlled local MVP use by this gate.

## Context

Round 4F.24 remediated the Windows EPERM process-start class by narrowing executable resolution to the fixed `codex_cli` policy label, avoiding shell shims as direct launch targets, filtering Windows packaged app resource executables, and preserving metadata-only process-plan evidence.

Round 4F.25 then ran one controlled CLI-only read-only retry. That retry created an authoritative, persisted, Supervisor-backed attempt record and passed preflight, but executable resolution blocked before process-boundary invocation with `executable_inaccessible`.

Round 4G.12 reviewed the 4F.25 result and recorded `pilot_review_complete_with_release_blocker`.

## Basis

- Attempt id: `codex_real_read_only_adapter_attempt_5d7bf134-bb9f-4f4b-87cc-43d1176818b4`
- Attempt status: `blocked`
- Preflight status: `passed`
- Result status: `not_started`
- Result error code: `boundary_deferred`
- Process boundary invoked: `false`
- Executable resolution status: `blocked`
- Executable resolution reason code: `executable_inaccessible`
- Resolved executable kind: `native_exe`
- Executable exists: `true`
- Executable accessible: `false`
- Post-run verification status: `not_required`
- 4G.12 release blocker: `executable_inaccessible`

## Consequences

- 4H.7 does not approve local MVP use.
- 4H.7 does not approve broader autonomous use.
- A future release gate may be reconsidered only after executable accessibility is remediated, another controlled retry is performed, that retry completes with post-run verification, and a later review records no release blocker.

## Explicit Non-Approvals

- No Dashboard trigger is approved.
- No `workspace_write` mode is approved.
- No `danger_full_access` mode is approved.
- No browser/CDP/Profile/Workspace/account automation is approved.
- No raw prompt, command, stdout, stderr, agent, reasoning, argv, executable, env, or raw absolute worktree path persistence is approved.
- No broad autonomous use is approved.

## Next Recommended Round

The next implementation work should be a narrow executable accessibility follow-up. It should not run a pilot first, and it should not broaden the boundary. It should diagnose why the trusted native executable candidate exists but is reported inaccessible before process-boundary invocation.
