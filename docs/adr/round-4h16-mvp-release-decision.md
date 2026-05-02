# Round 4H.16 MVP Release Decision

## Status

Accepted decision record for Round 4H.16.

## Decision

Outcome: `no_go_for_mvp`.

The real read-only adapter is not approved for controlled local MVP use by this gate.

## Context

Round 4F.42 remediated the nonzero invocation diagnostics and added a Supervisor health handshake so retry rounds could confirm the active server was running the current supported Codex CLI invocation contract. Round 4F.43 then ran one controlled CLI-only read-only retry.

The 4F.43 retry created an authoritative, persisted, Supervisor-backed attempt record. It passed preflight and invoked the approved process boundary, but the boundary result failed with `process_exit_nonzero`, `exitCode=1`, and `nonzeroExitKind=codex_cli_input_missing_suspected`. Post-run verification was skipped because the attempt did not complete.

Round 4G.21 reviewed that result and recorded `pilot_review_complete_with_input_governance_release_blocker`.

## Basis

- Attempt id: `codex_real_read_only_adapter_attempt_6f5c3a95-c017-45c4-a899-1cabd1765385`
- Attempt status: `failed`
- Preflight status: `passed`
- Process boundary invoked: `true`
- Result status: `failed`
- Result error code: `boundary_failed`
- Boundary failure code: `process_exit_nonzero`
- Exit code: `1`
- Nonzero exit kind: `codex_cli_input_missing_suspected`
- Boundary diagnostics complete: `true`
- Post-run verification status: `skipped`
- Post-run verification skip reason: `attempt_not_completed`
- Workspace mutation detected: `false`
- 4G.21 outcome: `pilot_review_complete_with_input_governance_release_blocker`

## Consequences

- 4H.16 does not approve local MVP use.
- 4H.16 does not approve broader autonomous use.
- 4H.16 does not approve Dashboard triggering.
- 4H.16 does not approve `workspace_write` or `danger_full_access`.
- The optional process-start/invocation remediation route is closed. The remaining blocker is input governance, not another supported-argv or executable-start issue.
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

The next allowed route should be a new input-governance remediation/design route.

That route must decide how a read-only, metadata-only adapter can provide permitted input to the Codex subprocess while preserving these boundaries:

- no raw prompt or command body persistence,
- no raw input in argv,
- no Dashboard trigger,
- no `workspace_write`,
- no `danger_full_access`,
- approval, policy, evidence, and audit gates remain authoritative,
- fallback/degraded output remains display-only and never authority.

The next route must not be another process-start, ENOENT, executable-accessibility, or CLI-invocation loop unless new evidence shows the blocker has moved back into that class.
