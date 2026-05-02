# Round 4G.11 Safety Corrections

## Round

Round 4G.11: Safety Corrections Assessment.

## Status

Outcome: `no_code_correction_applied`

Round 4G.11 is a docs-only review and safety assessment. No code correction is applied in this round.

## Scope Confirmation

No changes were made to:

- `packages/contracts`
- `packages/codex-kernel`
- `packages/store-core`
- `packages/store-sqlite`
- `apps/supervisor`
- `apps/cli`
- `apps/dashboard`
- `tools`
- `.codexhub/codex-exec.yaml`
- approval state
- runtime worktree state

The only files added in 4G.11 are:

- `docs/reviews/round-4g11-pilot-review-eperm-process-start-blocker.md`
- `docs/reviews/round-4g11-safety-corrections.md`

## Safety Assessment

No docs-only warning fix, CLI wording fix, or audit allowlist adjustment can close the remaining blocker.

The 4F.23 attempt:

- passed preflight,
- invoked the approved process boundary,
- remained metadata-only,
- did not detect workspace mutation,
- skipped post-run verification because the attempt did not complete,
- failed with `process_start_failed` and `startFailureKind=eperm`.

This is an implementation/runtime startup blocker, not a review-text issue.

## Corrections Decision

No code correction was applied because 4G.11 is review-only and because the remaining failure should be addressed in a separate remediation round with focused tests.

The next remediation target is a narrow Windows EPERM process-start follow-up that diagnoses why the real boundary still fails after:

- executable policy label `codex_cli` is accepted,
- executable resolution reports `native_exe`,
- shell remains disabled,
- cwd exists and is a directory,
- executable exists and is accessible,
- env allowlist metadata is present,
- argv, executable path, and env plan remain unstored.

## Boundaries Confirmed

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- Broader autonomous use remains blocked.
- Raw prompt, command, stdout/stderr, argv, executable path, env plan, agent/reasoning body, and raw local worktree path persistence remain forbidden.

## Recommended Follow-up

Recommended next round: `Round 4F.24: Windows EPERM Process Start Remediation`.

4F.24 should diagnose and fix only the EPERM process-start class. It should inspect:

- Windows native executable spawn compatibility,
- packaged executable or app-alias permission behavior,
- shell-disabled spawn options,
- safe environment allowlist casing and required platform keys,
- cwd metadata and runtime accessibility,
- process-start error classification.

4F.24 must not run a pilot, invoke a real adapter attempt, add Dashboard trigger, allow `workspace_write`, allow `danger_full_access`, persist raw stdout/stderr, relax the process-boundary audit, or approve broader autonomous use.

4H.7 remains blocked until a later controlled retry completes and is reviewed without a release blocker.

