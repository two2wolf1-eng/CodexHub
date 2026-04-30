# Round 4A Implementation Checklist

## Status

This checklist is a pre-implementation control for a future Round 4A. It does not implement a real read-only adapter, does not add a process boundary, does not launch a process, does not call real Codex, does not mutate a workspace, and does not add Dashboard-triggered actions.

## Pre-implementation Artifact Checklist

| Check | Required Evidence | Status Before 4A |
| --- | --- | --- |
| Round 3Y readiness review exists | persisted review with `conditional_go_to_separate_adr_draft` | required |
| Round 3Z ADR draft exists | `docs/adr/round-3z-real-read-only-adapter-adr-draft.md` | required |
| Round 3Z.1 ADR review exists | `docs/reviews/round-3z1-adr-review.md` and `docs/adr/round-3z1-adr-go-no-go-decision.md` | required |
| Round 3Z.2 implementation plan exists | `docs/design/round-3z2-real-read-only-adapter-implementation-plan.md` | required |
| Round 3Z.2 risk matrix exists | `docs/reviews/round-3z2-implementation-risk-matrix.md` | required |
| Round 3Z.3 Go/No-Go exists | `docs/reviews/round-3z3-implementation-plan-review.md` and `docs/adr/round-3z3-go-no-go-for-4a.md` | required |
| Round 3Z.4 hardening exists | `docs/reviews/round-3z4-preimplementation-hardening.md` | required |
| 4A checklist exists | `docs/checklists/round-4a-implementation-checklist.md` | required |
| symlink/path escape verification done or explicitly accepted | focused test evidence or explicit 4A blocker/alternative control | required before callable adapter path |
| process-boundary-specific audit strategy exists | 3Z.4 audit strategy plus any 4A implementation-specific audit update | required |
| worktree guard tests exist | clean, dirty, missing, ambiguous, unexpected-diff tests | required before callable adapter path |
| approval hash binding tests exist | missing, invalid, expired, revoked, used, dry-run hash mismatch, policy hash mismatch tests | required before callable adapter path |
| timeout and cancel plan exists | 3Z.2 plan plus 4A tests | required |
| post-run verification plan exists | 3Z.2 plan plus 4A evidence path | required |

## 4A Allowed Scope

A future 4A may only be considered if all pre-implementation checks pass. Its initial implementation must stay within the 3Z.2 allowed file list and must remain:

- CLI-only
- read-only only
- default disabled
- explicitly enabled by config
- existing `dryRunId` required
- valid approval artifact required
- `dryRunPlanHash` match required
- `policyDecisionHash` match required
- isolated worktree required
- clean git status required before any attempt
- metadata/hash-only evidence only
- audit before, after, abort, and failure
- timeout and cancel behavior required
- post-run `pnpm verify:foundation` required
- operator review required before any next step

The future adapter must stop before any boundary start if any hard gate is missing, ambiguous, degraded, or mismatched.

## 4A Forbidden Scope

A future 4A must not add or permit:

- Dashboard trigger
- Dashboard run, start, live, execute, or approve-and-run controls
- `workspace_write`
- `danger_full_access`
- browser/CDP automation
- Electron/CDP automation
- Browser Profile or Chrome Profile automation
- ChatGPT Workspace access
- account, token, cookie, session, MFA, or credential automation
- browser click/input automation
- shell-string execution
- arbitrary argv passthrough
- raw prompt body persistence
- raw command body persistence
- raw stdout or stderr body persistence
- full agent message or reasoning body persistence
- auto-retry by default
- long-lived process adapter
- hidden background process
- auto-revert of workspace changes

## Required Hard Gates

The future 4A implementation must block before boundary start when any of these are true:

- adapter config is disabled
- explicit config enable is absent
- `dryRunId` is missing
- dry-run record is missing
- policy decision is missing or denies the attempt
- approval artifact is missing
- approval artifact is invalid
- approval artifact is expired
- approval artifact is revoked
- approval artifact is already used
- `dryRunPlanHash` mismatches current dry-run record
- `policyDecisionHash` mismatches current policy decision
- sandbox is not exactly `read_only`
- `workspace_write` is requested or inferred
- `danger_full_access` is requested or inferred
- Dashboard trigger is attempted
- isolated worktree is missing
- git status is dirty before start
- evidence store is degraded
- audit store is degraded
- symlink/path escape guard is missing, skipped, degraded, or ambiguous
- documented-only 3T-W evidence is treated as runtime readiness evidence
- boundary plan is ambiguous
- executable resolution is ambiguous
- operator checklist hard gate is incomplete

## Stop Conditions

The future 4A round must stop and not commit acceptance if any of these occur:

- required artifact is missing
- focused test fails
- full verification fails
- no-live audit fails
- boundary audit fails
- missing approval
- mismatched hashes
- dirty worktree
- degraded evidence or audit store
- policy denial
- non-read-only mode
- unexpected diff after attempt
- post-run verification failure
- raw body persistence is detected
- Dashboard trigger is present
- `workspace_write` is present
- `danger_full_access` is present
- shell string or arbitrary argv passthrough appears

Unexpected diff must be classified as critical, audited, and sent to manual review. The adapter must not auto-revert.

## Required 4A Tests

A future 4A must add focused tests for:

- config disabled blocks adapter attempt
- explicit enable required
- missing `dryRunId` blocks attempt
- missing dry-run blocks attempt
- missing policy decision blocks attempt
- policy denial blocks attempt
- missing approval blocks attempt
- expired approval blocks attempt
- revoked approval blocks attempt
- used approval blocks attempt
- `dryRunPlanHash` mismatch blocks attempt
- `policyDecisionHash` mismatch blocks attempt
- non-`read_only` sandbox blocks attempt
- `workspace_write` blocks attempt
- `danger_full_access` blocks attempt
- Dashboard trigger unavailable
- isolated worktree missing blocks attempt
- dirty worktree blocks attempt
- symlink/path escape guard enforced
- documented-only 3T-W evidence not used as runtime readiness evidence
- evidence store degraded blocks attempt
- audit store degraded blocks attempt
- no shell string execution
- no arbitrary argv passthrough
- timeout path records safe metadata
- cancel path records safe metadata
- malformed JSONL handled safely
- no raw prompt, command, stdout, stderr, agent, or reasoning body persisted
- unexpected diff detection marks critical and does not auto-revert
- post-run `pnpm verify:foundation` requirement recorded

## Required 4A Verification

A future 4A must run and record:

- `pnpm audit:skills`
- `pnpm audit:no-live-automation`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm verify:foundation`
- `cmd /c pnpm nx run-many -t lint,test,build`
- focused tests for each touched package or app
- process-boundary-specific audit if a boundary module is added
- worktree guard tests if workspace guard code is added
- approval binding tests if approval logic is touched
- `git diff --check`
- `git status --short`

## Non-approval Confirmation

This checklist does not approve implementation by itself. It does not approve a process adapter, process launch, Codex execution, workspace mutation, Dashboard trigger, `workspace_write`, or `danger_full_access`.

The required flags remain:

- `implementationApproved=false`
- `processAdapterApproved=false`
- `recommendationGrantsExecution=false`
- `workspaceWriteAllowed=false`
- `dangerFullAccessAllowed=false`
- `dashboardTriggerAllowed=false`
- `executionDisabled=true`
