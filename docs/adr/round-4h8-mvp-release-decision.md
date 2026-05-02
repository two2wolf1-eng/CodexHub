# Round 4H.8 MVP Release Decision

## Status

Accepted decision record for Round 4H.8.

## Decision

Outcome: `no_go_for_mvp`.

The real read-only adapter is not approved for controlled local MVP use by this gate.

## Context

Round 4F.26 remediated executable accessibility handling by allowing a trusted Windows native executable candidate to bypass an over-strict access probe only when safe metadata checks pass. It preserved the fixed `codex_cli` policy label, `shell:false`, fixed argv, and metadata-only process-plan evidence.

Round 4F.27 then ran one controlled CLI-only read-only retry. That retry created an authoritative, persisted, Supervisor-backed attempt record and passed preflight, but executable resolution still blocked before process-boundary invocation with `executable_inaccessible`.

Round 4G.13 reviewed the 4F.27 result and recorded `pilot_review_complete_with_executable_accessibility_release_blocker`.

## Basis

- Attempt id: `codex_real_read_only_adapter_attempt_23d93a4d-ca51-47a7-8d6a-9a8178ee5d04`
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
- 4G.13 release blocker: `executable_inaccessible`

## Consequences

- 4H.8 does not approve local MVP use.
- 4H.8 does not approve broader autonomous use.
- Because the same executable/process-start compatibility class remains, Aggressive Remediation Mode may proceed into its one optional second remediation+retry loop.
- A future release gate may be reconsidered only after executable accessibility is remediated, another controlled retry is performed, that retry completes with post-run verification, and a later review records no release blocker.

## Explicit Non-Approvals

- No Dashboard trigger is approved.
- No `workspace_write` mode is approved.
- No `danger_full_access` mode is approved.
- No browser/CDP/Profile/Workspace/account automation is approved.
- No raw prompt, command, stdout, stderr, agent, reasoning, argv, executable, env, or raw absolute worktree path persistence is approved.
- No broad autonomous use is approved.

## Next Recommended Round

The next implementation work may be Round 4F.28, the optional second and final executable/process-start remediation loop in Aggressive Remediation Mode.

4F.28 should not run a pilot first. It should diagnose why the trusted native executable candidate still reports `executable_inaccessible` after 4F.26 and should keep all process-boundary, metadata-only, and read-only restrictions in place.
