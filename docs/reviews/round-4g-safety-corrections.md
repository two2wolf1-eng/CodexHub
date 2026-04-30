# Round 4G Safety Corrections

## Status

Round 4G applied no code correction.

Correction outcome: `no_code_correction_applied_release_blocker_recorded`

The Round 4F.2 pilot retry was authoritative and safe, but it blocked before
the process boundary with `errorCode=config_disabled`. That issue is not a
wording-only defect, test fixture gap, or audit allowlist mismatch. It is a
release blocker in the pilot route and should be handled by a future scoped
correction round before another pilot retry.

## Why No Code Change Was Made

The allowed 4G remediation scope includes small safety corrections, warning
text, audit alignment, metadata assertion gaps, docs/runbook clarification, and
focused tests for issues discovered during the pilot review.

Changing the attempt preflight behavior so that it consumes the explicit config
enablement source would alter runtime gate behavior. That is larger than a
small 4G correction and must be designed as a separate gated fix. Any future
fix must preserve:

- default-disabled behavior
- explicit config enablement
- CLI-only access
- read-only sandbox only
- valid approval requirement
- dry-run and policy hash binding
- isolated clean worktree requirement
- metadata/hash-only evidence
- audit before/after/failure/abort behavior
- no Dashboard trigger
- no `workspace_write`
- no `danger_full_access`

## Required Future Correction

A future correction round should:

1. Trace why Round 4F.1B prerequisite readiness reported
   `configExplicitlyEnabled=true` while Round 4F.2 attempt preflight blocked
   with `config_disabled`.
2. Decide whether the attempt path should consume the same reviewed config
   source used by the prerequisite readiness workflow.
3. Add focused tests proving that explicit config enablement is required and
   correctly honored by the attempt preflight.
4. Add mismatch tests proving that disabled config still blocks before the
   process boundary.
5. Re-run the pilot prerequisite check and a new single pilot retry only after
   the fix is reviewed and committed.

## Non-Corrections

Round 4G did not:

- add a Dashboard trigger
- add a Dashboard run, start, live, execute, or approve-and-run control
- allow `workspace_write`
- allow `danger_full_access`
- broaden browser, Electron/CDP, Chrome Profile, ChatGPT Workspace, account,
  token, session, cookie, or MFA automation
- persist raw prompt, command, stdout, stderr, agent message, reasoning, or raw
  absolute worktree path bodies
- retry the pilot
- mark the approval artifact used
- launch a real Codex process

## Release Gate Impact

The Round 4H MVP gate should treat the Round 4F.2 result as authoritative pilot
evidence but not as MVP success.

Required 4H decision unless a later correction is completed before the gate:
`no_go_for_mvp`.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Pilot issue type | Round 4F.2 attempt summary | `config_disabled` before boundary | Record release blocker |
| Small correction available | Round 4G review | No wording-only or audit-only fix identified | No code correction |
| Safety boundary | Round 4F.2 report | No Dashboard trigger, no workspace write, no danger full access | Preserve |
| Retry behavior | Round 4G scope | No retry performed | Preserve one-shot pilot policy |
| MVP impact | Round 4G review | No completed attempt verification metadata | Force conservative 4H gate |

## Final 4G Recommendation

Proceed to Round 4H for a conservative release gate. Round 4H should record
`no_go_for_mvp` because the pilot route remains release-blocked by
`config_disabled` and lacks completed adapter-attempt verification metadata.
