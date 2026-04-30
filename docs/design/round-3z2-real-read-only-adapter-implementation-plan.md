# Round 3Z.2 Real Read-only Adapter Implementation Plan

## Status

Planning only. Round 3Z.2 does not approve implementation, a process adapter, process launch, real Codex execution, workspace mutation, or Dashboard-triggered actions.

This plan is enabled only by the Round 3Z.1 decision `go_to_real_adapter_implementation_plan`. That decision allows planning only.

## Planning Inputs

- Round 3Z ADR draft: `docs/adr/round-3z-real-read-only-adapter-adr-draft.md`
- Round 3Z.1 review: `docs/reviews/round-3z1-adr-review.md`
- Round 3Z.1 decision: `docs/adr/round-3z1-adr-go-no-go-decision.md`
- Round 3Y review id: `codex_real_read_only_adapter_readiness_review_4c2b2e74-04eb-438e-ad6d-fd1870f6d23a`
- Readiness package id: `codex_real_read_only_adapter_readiness_package_45e3d87f-5c9d-4670-9078-8d9197d4343e`
- Dry-run id: `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`

Unresolved findings carried forward:

- `symlink_escape_verification_pending`
- `documented_only_3tw_evidence`

## Future 4A Objective

If a later Round 3Z.3 review allows Round 4A to be considered, Round 4A may only add a minimal, explicitly gated, CLI-only, read-only adapter implementation.

Round 4A must still not be executed by this document. This plan does not create permission to implement, launch a process, call Codex, mutate a workspace, or add Dashboard triggers.

## Future Module And File Plan

Allowed future 4A file candidates, subject to 3Z.3 approval:

- `packages/contracts/src/*`: new adapter request, preflight, result, event, error, and audit DTOs.
- `packages/codex-kernel/src/*`: adapter interface, disabled/default implementation, preflight-to-boundary orchestration, JSONL event normalizer integration, and metadata-only result builder.
- `packages/codex-kernel/fixtures/*`: synthetic fixture updates only if needed for tests.
- `packages/security-kernel/src/*`: policy checks for read-only-only mode, hash binding, and forbidden sandbox rejection if existing helpers are insufficient.
- `packages/evidence-kernel/src/*`: metadata/hash-only evidence helpers if existing evidence helpers are insufficient.
- `packages/workflow-kernel/src/*`: approval/hash binding helpers if existing workflow helpers are insufficient.
- `packages/store-core/src/*`: repository interfaces only if a new metadata record type is needed.
- `packages/store-sqlite/src/*`: SQLite JSON payload table only if persistence is required and approved.
- `apps/cli/src/*`: CLI-only command path for a future read-only attempt.
- `apps/supervisor/src/*`: read-only status or audit query endpoints only if required; no process trigger endpoint unless separately approved.
- Tests adjacent to each touched package or app.

Default future 4A forbidden files and directories:

- Electron/CDP modules unless a separate review explicitly changes scope.
- Browser Profile or Chrome Profile modules.
- Dashboard trigger controls, forms, or action buttons.
- Any file whose only purpose is account, token, cookie, session, MFA, or credential handling.
- Any broad repository-wide refactor unrelated to the adapter boundary.

## Future Contracts To Add

Future contracts should be minimal and metadata-only. Candidate models:

- `CodexExecReadOnlyAdapterRequest`
- `CodexExecReadOnlyAdapterPreflight`
- `CodexExecReadOnlyAdapterBoundaryPlan`
- `CodexExecReadOnlyAdapterEvent`
- `CodexExecReadOnlyAdapterResult`
- `CodexExecReadOnlyAdapterError`
- `CodexExecReadOnlyAdapterEvidenceSummary`
- `CodexExecReadOnlyAdapterAuditSummary`

Each contract must include:

- `id`
- `schemaVersion`
- `createdAt` or `observedAt`
- optional `metadata`
- `liveExecution=false` until the later approved boundary explicitly records otherwise
- `externalProcessStarted=false` before boundary start
- `executionDisabled=true` until every hard gate passes in a later approved round
- `processAdapterApproved=false` unless a later explicit ADR changes it
- `implementationApproved=false` unless a later explicit ADR changes it
- `recommendationGrantsExecution=false`
- `workspaceWriteAllowed=false`
- `dangerFullAccessAllowed=false`
- `dashboardTriggerAllowed=false`

Contracts must not include raw prompt, raw command, raw stdout, raw stderr, agent message body, reasoning body, executable path body, shell snippet, or environment plan body.

## Codex Kernel Adapter Interface Design

Future design should separate planning, preflight, process boundary, event normalization, and result summarization.

Proposed future responsibilities:

- Adapter interface: receives an existing `dryRunId` and metadata refs only.
- Preflight: verifies config, approval artifact, hash binding, isolated worktree, evidence store, audit store, and operator checklist.
- Boundary plan: prepares a non-shell argument vector shape from approved metadata without exposing runnable command text in persisted records.
- Boundary execution implementation: allowed only in a later approved round and only after no-live audits are updated for the exact approved boundary.
- Event normalizer: accepts JSONL events from the approved boundary and returns metadata/hash-only summaries.
- Result builder: returns event counts, status, hashes, evidence refs, audit ids, and failure/abort reason summaries.

No future codex-kernel implementation may import SQLite runtime bindings. No future codex-kernel implementation may depend on `packages/store-sqlite`.

## Disabled Default Config

Default config must remain disabled.

Future config requirements:

- Adapter capability disabled by default.
- Explicit operator-configured enablement required.
- Sandbox mode must be exactly `read_only`.
- `workspace_write` forbidden.
- `danger_full_access` forbidden.
- Dashboard trigger forbidden.
- Process adapter capability disabled unless a later ADR and implementation review explicitly allow it.

Config must never be enabled by a recommendation, readiness package, review record, report, or Dashboard display.

## Trigger Model

Future trigger must be CLI-only.

Required input:

- existing `dryRunId`

Forbidden input:

- raw prompt body
- raw command body
- Dashboard action
- browser click/input action
- Electron/CDP action
- account/session/token/cookie/MFA input

The CLI must describe any future attempt as read-only and explicitly gated. It must not describe readiness, review, or ADR records as execution approval.

## Process Boundary Design

Round 3Z.2 does not implement a process boundary.

If later approved, the boundary must:

- construct an argument vector from approved constants and metadata only
- avoid shell strings
- avoid shell interpolation
- avoid writing command text into persistent records
- capture JSONL events through a parser and normalizer
- classify boundary start, completion, abort, timeout, cancel, and failure
- store metadata/hash-only summaries
- stop before boundary start on any missing or ambiguous gate

The process boundary must not:

- support `workspace_write`
- support `danger_full_access`
- accept Dashboard triggers
- accept raw prompt input
- bypass approval or hash checks
- write workspace files as an adapter behavior

## Allowed Argument Construction Design

Future argument construction must be non-shell and structured.

Allowed planning-level shape:

- executable identity: resolved by policy from a narrow allowlist, not persisted as a local absolute path
- argument slots: fixed slot names with validated metadata values
- dry-run reference: existing `dryRunId`
- sandbox slot: must equal `read_only`
- output mode slot: JSONL event stream

Forbidden:

- persisted runnable command strings
- persisted argv arrays containing local executable paths
- shell snippets
- environment variable plans containing secrets
- user-supplied arbitrary arguments
- arguments derived from raw prompt body

## Executable Resolution Policy

Future executable resolution must be policy-controlled.

Requirements:

- Resolve from a narrow configured allowlist.
- Reject absolute path overrides unless a later review explicitly approves a safe local policy.
- Reject relative traversal.
- Reject shell wrappers.
- Record only a hash or policy label of the resolved executable identity.
- Return a safe error without leaking local absolute paths.

## Timeout Design

Future timeout semantics must include:

- pre-start timeout for preflight steps
- boundary startup timeout
- event stream idle timeout
- total duration timeout
- timeout audit event
- timeout evidence summary
- operator-facing timeout reason

Timeout must lead to a controlled abort or failure summary, not an automatic retry.

## Cancel Design

Future cancel semantics must include:

- operator cancel before boundary start
- operator cancel after boundary start, if a later process boundary is approved
- audit event for cancel request and cancel result
- evidence summary with timestamps and status only

Cancel must not mutate workspace state and must not auto-revert changes.

## JSONL Event Stream Capture

Future event capture must:

- parse line-delimited JSON events
- reject malformed events safely
- summarize event kind, count, timestamps, and hashes
- normalize known event types through codex-kernel helpers
- preserve unknown event metadata without raw body storage
- avoid storing raw stdout/stderr

Malformed event handling must produce a safe failure summary and audit event.

## Parser And Normalizer Reuse

Future implementation should reuse the existing replay and fixture-backed boundary parser/normalizer patterns where possible.

New parser behavior is allowed only when existing fixture-backed logic is insufficient. Any parser addition must include tests for:

- valid synthetic JSONL
- malformed JSONL
- unknown event kind
- oversized event body summary handling
- no raw body persistence

## Evidence Model

Future evidence must be metadata/hash-only.

Allowed evidence content:

- ids
- timestamps
- summaries
- hashes
- event counts
- status flags
- related dry-run, approval, policy, worktree, and audit refs

Forbidden evidence content:

- prompt body
- command body
- raw stdout
- raw stderr
- agent message body
- reasoning body
- runnable command strings
- argv arrays
- executable paths
- shell snippets
- secret or environment body

## Audit Event Sequence

Future audit sequence should include:

1. intent received
2. dry-run record loaded
3. config checked
4. policy decision checked
5. approval artifact checked
6. hash binding checked
7. isolated worktree checked
8. evidence store checked
9. audit store checked
10. operator checklist checked
11. boundary pre-start decision recorded
12. boundary start recorded only if a later round approves it
13. event stream summary recorded
14. completion, abort, timeout, cancel, or failure recorded
15. post-run verification recorded
16. operator review required

Every audit record must preserve no-live and non-approval flags until a later explicit ADR changes the boundary.

## Worktree Guard

Future implementation must require:

- isolated worktree metadata before any attempt
- clean git status before any attempt
- no workspace mutation expected
- post-attempt workspace mutation check
- unexpected diff classified as critical
- no auto-revert
- manual review required on unexpected workspace change

The worktree guard must be tested with clean, dirty, missing, and ambiguous worktree states.

## Approval And Hash Binding

Future implementation must require:

- approval artifact exists
- approval artifact valid
- approval artifact unexpired
- approval artifact not revoked
- approval artifact unused
- `dryRunPlanHash` matches current dry-run
- `policyDecisionHash` matches current policy decision
- approval is single-use

Any mismatch must abort before boundary start.

## Rollback And Abort Semantics

Rollback is not an adapter action because read-only mode should not mutate workspace state.

Abort must occur before boundary start when:

- config disabled
- sandbox not `read_only`
- forbidden mode requested
- Dashboard trigger attempted
- approval missing
- approval invalid
- approval expired
- approval revoked
- approval already used
- hash mismatch
- isolated worktree missing
- evidence store degraded
- audit store degraded
- operator checklist incomplete for a hard gate
- symlink guard unresolved without accepted control
- documented-only evidence unresolved without accepted control
- ambiguous executable resolution
- malformed boundary plan

If unexpected workspace mutation is detected later, classify as critical, stop, audit, and require manual review. Do not auto-revert.

## Post-run Verification Requirement

Any later approved attempt must:

- verify no workspace mutation occurred
- run `pnpm verify:foundation`
- generate a metadata/hash-only report
- generate an audit trail
- require operator review before any next step

Failure of post-run verification must be recorded as a blocking outcome for further action.

## Operator Manual Review

Operator review must check:

- dry-run id and hashes
- approval artifact state
- policy decision state
- sandbox mode
- worktree state
- evidence and audit readiness
- event summary
- post-run verification result
- no raw body persistence
- no Dashboard trigger
- unresolved findings

Operator review is not execution permission for any future follow-up.

## Tests Required Before Implementation

Future implementation must include tests for:

- config disabled default
- explicit enable required
- sandbox must equal `read_only`
- `workspace_write` rejected
- `danger_full_access` rejected
- Dashboard trigger rejected
- missing dry-run rejected
- missing policy decision rejected
- missing approval rejected
- expired approval rejected
- revoked approval rejected
- used approval rejected
- `dryRunPlanHash` mismatch rejected
- `policyDecisionHash` mismatch rejected
- isolated worktree missing rejected
- dirty worktree rejected
- symlink escape verification or accepted control enforced
- documented-only evidence accepted only by explicit review
- evidence store degraded rejected
- audit store degraded rejected
- malformed JSONL event handled safely
- timeout handled safely
- cancel handled safely
- no raw prompt, command, stdout, stderr, agent, or reasoning body persisted
- post-run `pnpm verify:foundation` result recorded

## Audits Required Before Implementation

Future implementation must pass:

- `pnpm audit:skills`
- `pnpm audit:no-live-automation`, updated only through an explicit 4A audit plan if a narrow process boundary is approved
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm verify:foundation`
- `cmd /c pnpm nx run-many -t lint,test,build`
- `git diff --check`
- `git status --short`

The no-live audit must remain strict. Any 4A adjustment must target only the separately approved boundary and must not loosen browser, app-server, profile, Dashboard, or workspace write restrictions.

## Exact Future 4A Allowed Files

If Round 3Z.3 allows 4A to be considered, the initial 4A patch should be limited to:

- `packages/contracts/src/*`
- `packages/contracts/src/*.test.ts`
- `packages/codex-kernel/src/*`
- `packages/codex-kernel/src/*.test.ts`
- `packages/security-kernel/src/*`, only if policy helper reuse is insufficient
- `packages/workflow-kernel/src/*`, only if approval/hash helper reuse is insufficient
- `packages/evidence-kernel/src/*`, only if evidence helper reuse is insufficient
- `packages/store-core/src/*`, only if metadata persistence is required
- `packages/store-sqlite/src/*`, only if metadata persistence is required
- `apps/cli/src/*`, only for CLI-only trigger
- `tools/audit-no-live-automation.ts`, only if 3Z.3 approves a precise 4A audit strategy
- adjacent tests for each touched area

## Exact Future 4A Forbidden Files

Future 4A must not touch:

- `apps/dashboard/*` for action controls
- Electron/CDP modules
- Browser Profile or Chrome Profile modules
- Codex app-server integrations
- account, token, cookie, session, MFA, or credential code
- broad unrelated package infrastructure
- unrelated docs or formatting

## Exact Future 4A Acceptance Criteria

Before any 4A implementation could be accepted, it must prove:

- default disabled state
- explicit config gate
- CLI-only entry
- existing dry-run id required
- read-only sandbox only
- hash-bound approval
- isolated worktree requirement
- evidence/audit readiness
- pre-start abort on every missing hard gate
- safe timeout and cancel outcomes
- metadata/hash-only output
- no raw body persistence
- no Dashboard trigger
- no `workspace_write`
- no `danger_full_access`
- no workspace mutation
- no auto-revert
- post-run `pnpm verify:foundation` requirement
- complete focused tests and full repository verification

## No-live Boundary Confirmation

Round 3Z.2 keeps:

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
