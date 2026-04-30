# Round 3Z Real Read-only Adapter ADR Draft

## Status

Draft only. Round 3Z does not approve implementation, a process adapter, process launch, real Codex execution, workspace mutation, or Dashboard-triggered actions.

This draft is prepared from the recorded Round 3Y readiness review:

- Review id: `codex_real_read_only_adapter_readiness_review_4c2b2e74-04eb-438e-ad6d-fd1870f6d23a`
- Readiness package id: `codex_real_read_only_adapter_readiness_package_45e3d87f-5c9d-4670-9078-8d9197d4343e`
- Dry-run id: `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`
- Outcome: `conditional_go_to_separate_adr_draft`
- Status: `recorded`

The Round 3Y outcome permits only this separate ADR draft. It does not grant implementation, process launch, Codex execution, workspace mutation, or Dashboard trigger permission.

## Problem And Context

CodexHub has built a no-live Codex exec control plane through fixture replay, dry-run, policy, approval, preflight, gate evaluation, timeline, evidence/audit drill-down, report export, report review, readiness package, and readiness review.

The next question is whether a future real read-only adapter should be considered. This ADR draft captures the required constraints and blockers before any later go/no-go review may decide whether implementation planning can proceed.

## Decision Drivers

- Preserve the no-live boundary until a later explicit review changes it.
- Keep the future adapter CLI-only and read-only.
- Require an existing dry-run id rather than a raw prompt body.
- Require explicit config enablement while default config remains disabled.
- Bind any future approval to both `dryRunPlanHash` and `policyDecisionHash`.
- Require an isolated worktree and clean git status before any future attempt.
- Store only metadata, summaries, hashes, counts, and reference ids.
- Generate evidence and audit before, after, abort, and failure paths.
- Keep Dashboard read-only with no trigger controls.

## Allowed Future Scope

A later round may discuss a narrow real read-only adapter only if it remains:

- CLI-triggered only.
- Bound to an existing `dryRunId`.
- Restricted to `read_only`.
- Explicitly config-enabled, with default config disabled.
- Hash-bound to the current dry-run plan and policy decision.
- Guarded by a valid, unexpired, not revoked, not used approval artifact.
- Scoped to an isolated worktree with clean git status.
- Evidence-backed and audit-backed with metadata/hash-only records.
- Followed by `pnpm verify:foundation` and operator review.

## Forbidden Scope

This ADR draft and any future implementation planning must continue to forbid:

- real `codex exec`
- process adapter implementation
- process launch
- Codex app-server integration
- Electron/CDP connection
- Chrome Profile or ChatGPT Workspace access
- token, cookie, session, MFA, account, or credential automation
- browser click/input automation
- Dashboard trigger, execution button, or approve-and-run control
- `workspace_write`
- `danger_full_access`
- workspace mutation
- raw prompt, command, stdout, stderr, agent message, or reasoning body storage

## Required Control Gates

Any later review must require all of the following before implementation planning or implementation can be considered:

- Existing dry-run id is supplied.
- Config is explicitly enabled for read-only use and remains disabled by default.
- Sandbox mode is exactly `read_only`.
- `workspace_write` and `danger_full_access` remain forbidden.
- Dashboard trigger remains forbidden.
- Approval artifact exists and is valid.
- Approval artifact is unexpired, not revoked, and not used.
- `dryRunPlanHash` matches the current dry-run record.
- `policyDecisionHash` matches the current policy decision.
- Isolated worktree metadata exists.
- Git status is clean before any future attempt.
- Evidence repository is ready.
- Audit repository is ready.
- Timeout semantics are defined.
- Operator cancel semantics are defined.
- Abort semantics are defined for ambiguity, degraded store, missing approval, hash mismatch, missing worktree, incomplete hard gate, and unexpected workspace change.

## Evidence And Audit Model

Future evidence must be metadata/hash-only. It may contain:

- ids
- timestamps
- summaries
- hashes
- event counts
- status flags
- evidence ref ids
- audit event ids

Future evidence must not contain:

- full prompt body
- full command body
- raw stdout or stderr
- full agent message body
- full reasoning body
- runnable command strings
- argv arrays
- executable paths
- shell snippets
- environment plans

Audit must cover at least:

- intent created
- dry-run checked
- policy evaluated
- approval verified
- preflight completed
- boundary checks completed
- process-start abort when applicable
- completion, abort, timeout, cancel, and failure outcomes

## Unresolved Blockers

The current Round 3Y review acknowledged these unresolved findings:

- `symlink_escape_verification_pending`
- `documented_only_3tw_evidence`

The current Round 3X readiness package remains `requires_review`, not `ready_for_separate_adr`, because symlink escape verification is pending and Round 3T-W evidence is documented-only.

Before any future real process boundary can be considered, symlink escape verification must be executed in CI or manually verified on a platform where symlink creation is available, or a later review must document an accepted alternative control.

Before any future implementation can be considered, documented-only Round 3T-W evidence must be either replaced by persisted evidence or explicitly accepted by a later review.

## Required Post-Run Verification For Any Future Attempt

If a later ADR and implementation review ever approve a real read-only attempt, that attempt must still:

- verify no workspace mutation occurred
- run `pnpm verify:foundation`
- generate a metadata/hash-only report
- require operator review before any next step
- avoid auto-revert on unexpected workspace changes
- classify unexpected workspace changes as critical

## No-live Boundary Confirmation

Round 3Z keeps:

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

## Decision State

This draft does not make a final go/no-go decision. Round 3Z.1 must separately review this ADR draft before any implementation planning round may be considered.

