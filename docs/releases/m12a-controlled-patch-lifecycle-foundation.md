# M12a Controlled Patch Lifecycle Foundation

## Status

M12a establishes the fixture-only contract and orchestration language for the
future controlled patch lifecycle.

This release does not execute Codex patch generation, does not run git, does not
push, does not open a pull request, and does not add Supervisor routes.

## Delivered Scope

- Added metadata-only contracts for controlled patch plans, patch runs, diff
  review summaries, patch readiness, and lifecycle runs.
- Added fixture-only orchestrator helper
  `runM12ControlledPatchLifecycleFixture`.
- Added scenarios for all-pass, no-patch, policy-blocked, codex-failed,
  verification-failed, and aborted outcomes.
- Added evidence kinds for patch lifecycle plan, run summary, diff review, and
  readiness summary.
- Updated governance config and scaffold health expectations.

## Safety Invariants

- `fixtureOnly=true`
- `codexPatchExecuted=false`
- `processBoundaryInvoked=false`
- `externalProcessStarted=false`
- `pushAllowed=false`
- `pullRequestOpened=false`
- Raw diff bodies, raw PR bodies, raw command bodies, raw paths, prompts,
  stdout, stderr, tokens, cookies, and session data are not accepted by public
  schemas.

## Readiness Semantics

- `ready_for_review_draft_only` means the local metadata draft is reviewable
  after fixture verification passes. It does not permit push or PR creation.
- `not_ready_no_patch` means no patch metadata exists.
- `blocked_verification_failed` means changed-file metadata exists but the
  verification gate failed.
- `blocked_policy` means the lifecycle is stopped before patch readiness.

## Rollback

Revert this release by removing the M12a contracts, the fixture helper, the
governance config entries, and this release document. No runtime store migration
or cleanup is required because M12a persists no new records and adds no live
boundary.
