# Round 3Z.3 Implementation Plan Review

## Status

Docs-only implementation plan review. This review does not implement an adapter, add a process boundary, launch a process, call real Codex, mutate a workspace, or add Dashboard-triggered actions.

## Source Documents

- Implementation plan: `docs/design/round-3z2-real-read-only-adapter-implementation-plan.md`
- Risk matrix: `docs/reviews/round-3z2-implementation-risk-matrix.md`
- ADR review decision: `docs/adr/round-3z1-adr-go-no-go-decision.md`
- ADR draft: `docs/adr/round-3z-real-read-only-adapter-adr-draft.md`

## Review Scope

Round 3Z.3 decides only whether a future, separate Round 4A may be considered. It does not approve implementation inside this round and does not grant execution permission.

## Required Checks

| Check | Result | Evidence | 4A condition |
| --- | --- | --- | --- |
| Symlink escape verification completed or accepted with alternative control | accepted with control | 3Z.2 risk matrix names `symlink_escape_verification_pending` and requires verification or accepted control | 4A must add symlink/path escape tests before any boundary can become active |
| Documented-only 3T-W evidence resolved or accepted | accepted for planning provenance only | 3Z.2 carries `documented_only_3tw_evidence` and requires persisted evidence or explicit acceptance | 4A must not treat documented-only 3T-W evidence as runtime readiness evidence |
| No-live audit strategy prepared for narrow 4A boundary | covered for planning | 3Z.2 audit plan requires strict audit behavior and a precise process-boundary-specific audit rule if 4A changes audit logic | 4A must not loosen no-live audit broadly |
| Process-boundary-specific audit plan exists | covered | 3Z.2 risk matrix states that audit changes must target only the separately approved narrow boundary | 4A must include focused audit changes only if needed |
| Worktree guard tests planned | covered | 3Z.2 lists clean, dirty, missing, and ambiguous worktree tests | 4A must add these tests before acceptance |
| Approval hash binding tests planned | covered | 3Z.2 lists approval artifact state and `dryRunPlanHash` / `policyDecisionHash` mismatch tests | 4A must add these tests before acceptance |
| Timeout and cancel plan exists | covered | 3Z.2 defines timeout and cancel semantics | 4A must add timeout and cancel tests before acceptance |
| Post-run verification plan exists | covered | 3Z.2 requires post-run `pnpm verify:foundation` evidence | 4A must preserve this requirement |
| Dashboard trigger remains forbidden | covered | 3Z.2 forbidden files and acceptance criteria exclude Dashboard trigger controls | 4A must not add Dashboard trigger controls |
| `workspace_write` remains forbidden | covered | 3Z.2 hard-gates forbidden sandbox modes | 4A must reject `workspace_write` |
| `danger_full_access` remains forbidden | covered | 3Z.2 hard-gates forbidden sandbox modes | 4A must reject `danger_full_access` |
| Implementation plan defines 4A minimum scope | covered | 3Z.2 lists exact future 4A allowed files and acceptance criteria | 4A must stay within that scope unless a new review expands it |
| Implementation plan defines 4A forbidden scope | covered | 3Z.2 lists exact future 4A forbidden files | 4A must not touch forbidden areas |
| Review avoids current execution approval | covered | 3Z.2 and this review state non-approval semantics | Round 3Z.3 must stop after commit |

## Accepted Controls For Unresolved Findings

### `symlink_escape_verification_pending`

The finding is not resolved. Round 3Z.3 accepts it only as a controlled precondition for considering a future Round 4A.

Required 4A control:

- Add symlink/path escape tests before any boundary can become active.
- Keep the future adapter default disabled.
- Abort before boundary start if symlink/path escape protection is missing, skipped, degraded, or ambiguous.
- Record safe error summaries without absolute path leakage.

This acceptance does not approve a process boundary in Round 3Z.3.

### `documented_only_3tw_evidence`

The finding is not resolved. Round 3Z.3 accepts documented-only 3T-W evidence only as planning provenance.

Required 4A control:

- Do not treat documented-only 3T-W evidence as runtime readiness evidence.
- Re-check required control-plane records during 4A preflight.
- Persist any new 4A evidence as metadata/hash-only records.
- Keep readiness, review, or ADR records from granting execution permission.

This acceptance does not approve execution in Round 3Z.3.

## Findings

No blocking gap was found that prevents a future Round 4A from being considered as a separate round.

The following constraints remain hard requirements for any future Round 4A:

- CLI-only trigger.
- Existing dry-run id required.
- Explicit config enablement required.
- Default adapter config disabled.
- Sandbox must be `read_only`.
- `workspace_write` forbidden.
- `danger_full_access` forbidden.
- Dashboard trigger forbidden.
- Approval artifact required.
- Approval artifact must be valid, unexpired, not revoked, and unused.
- `dryRunPlanHash` and `policyDecisionHash` must match current records.
- Isolated worktree required.
- Clean git status required.
- Evidence and audit stores required.
- Metadata/hash-only evidence.
- No raw prompt, command, stdout, stderr, agent, or reasoning body storage.
- Timeout, cancel, abort, failure, and post-run verification paths required.
- Unexpected workspace changes are critical and require manual review with no auto-revert.

## Outcome Recommendation

Recommended outcome: `go_to_4a_real_read_only_adapter_implementation`.

This means a future Round 4A may be considered. It does not mean Round 3Z.3 implements anything. It does not approve process launch, real Codex execution, workspace mutation, `workspace_write`, `danger_full_access`, or Dashboard-triggered actions.

## Evidence Table

| Check | Evidence source | Result | Decision |
| --- | --- | --- | --- |
| 3Z.2 plan exists | `docs/design/round-3z2-real-read-only-adapter-implementation-plan.md` | inspected | Continue |
| 3Z.2 risk matrix exists | `docs/reviews/round-3z2-implementation-risk-matrix.md` | inspected | Continue |
| Required controls covered | 3Z.2 plan and matrix | covered for planning | Continue |
| Unresolved findings retained | 3Z.2 plan and matrix | both findings retained | Continue with accepted controls |
| Non-approval semantics retained | 3Z.2 plan and this review | retained | Continue |

## No-live Boundary Confirmation

Round 3Z.3 keeps:

- `liveExecution=false`
- `externalProcessStarted=false`
- `executionDisabled=true`
- `processAdapterStarted=false`
- `processAdapterApproved=false`
- `implementationApproved=false`
- `recommendationGrantsExecution=false`
- `workspaceWriteAllowed=false`
- `dangerFullAccessAllowed=false`
- `dashboardTriggerAllowed=false`

## Stop Rule

Round 3Z.3 must stop after the decision is committed. Round 4A must not be executed in this round.
