# Round 3Z.2 Implementation Risk Matrix

## Status

Planning-only risk matrix. This document does not approve implementation, a process adapter, process launch, real Codex execution, workspace mutation, or Dashboard-triggered actions.

## Risk Summary

The future real read-only adapter is high-risk because it may eventually introduce a narrow process boundary. Round 3Z.2 does not introduce that boundary. It only records planning controls that Round 3Z.3 must review before any future 4A consideration.

## Risk Matrix

| Risk | Severity | Required control | 4A status requirement |
| --- | --- | --- | --- |
| Process boundary starts without full governance gates | critical | Abort before boundary start unless config, policy, approval, hashes, worktree, evidence, audit, and checklist all pass | Must be hard-gated |
| `workspace_write` requested or inferred | critical | Reject forbidden sandbox mode before boundary start | Must be hard-gated |
| `danger_full_access` requested or inferred | critical | Reject forbidden sandbox mode before boundary start | Must be hard-gated |
| Dashboard trigger added | critical | Keep Dashboard read-only and exclude action controls from allowed files | Must be hard-gated |
| Approval artifact missing or invalid | critical | Require valid, unexpired, not revoked, unused artifact | Must be hard-gated |
| `dryRunPlanHash` mismatch | critical | Compare approval artifact hash to current dry-run record | Must be hard-gated |
| `policyDecisionHash` mismatch | critical | Compare approval artifact hash to current policy decision | Must be hard-gated |
| Isolated worktree missing | high | Require isolated worktree metadata | Must be hard-gated |
| Git status dirty before attempt | high | Require clean git status | Must be hard-gated |
| Symlink escape verification unresolved | high | Resolve test or record accepted compensating control before 4A Go | Must be resolved or explicitly accepted by 3Z.3 |
| Round 3T-W evidence remains documented-only | medium | Persist evidence or record explicit acceptance by 3Z.3 | Must be resolved or explicitly accepted by 3Z.3 |
| Evidence store degraded | high | Abort before boundary start | Must be hard-gated |
| Audit store degraded | high | Abort before boundary start | Must be hard-gated |
| Raw prompt or command body persisted | critical | Contract and evidence tests forbid raw body persistence | Must be hard-gated |
| Raw stdout/stderr body persisted | critical | Normalizer stores summaries and hashes only | Must be hard-gated |
| Executable path leaks into records | high | Store policy label or hash only | Must be hard-gated |
| Shell string introduced | critical | Argument construction must be structured and non-shell | Must be hard-gated |
| Timeout leaves ambiguous state | high | Timeout audit and evidence summary required | Must be tested |
| Cancel leaves ambiguous state | high | Cancel audit and evidence summary required | Must be tested |
| Unexpected workspace diff | critical | Stop, audit, manual review, no auto-revert | Must be hard-gated |
| Post-run verification skipped | high | Require `pnpm verify:foundation` evidence | Must be hard-gated |

## Unresolved Findings

### `symlink_escape_verification_pending`

Status: unresolved.

Required before 4A Go:

- complete symlink escape verification in CI or local manual verification, or
- record explicit 3Z.3 acceptance of an alternative control.

Without one of these, 3Z.3 should not approve 4A implementation consideration.

### `documented_only_3tw_evidence`

Status: unresolved.

Required before 4A Go:

- replace documented-only 3T-W evidence with persisted control-plane evidence, or
- record explicit 3Z.3 acceptance of documented-only evidence for planning history only.

Without one of these, 3Z.3 should not approve 4A implementation consideration.

## 4A Minimum Test Plan

Future 4A must include focused tests for:

- disabled default config
- explicit enable required
- CLI-only entry path
- missing dry-run
- missing policy decision
- missing approval artifact
- expired, revoked, and used approval artifacts
- `dryRunPlanHash` mismatch
- `policyDecisionHash` mismatch
- forbidden sandbox modes
- missing isolated worktree
- dirty worktree
- symlink escape guard or accepted control
- documented-only evidence handling
- degraded evidence store
- degraded audit store
- malformed JSONL event
- timeout summary
- cancel summary
- no raw body storage
- no Dashboard trigger
- post-run verification requirement

## 4A Audit Plan

Future 4A must keep the existing audits strict:

- Skills audit must continue to require workflow and project skill declarations.
- No-live audit may only be adjusted after 3Z.3 explicitly approves a narrow process-boundary-specific audit rule.
- Boundary audit must continue to reject internal package imports.
- SQLite isolation audit must continue to isolate runtime SQLite bindings to `packages/store-sqlite`.
- Foundation verification must remain required before and after implementation.

## Go/No-Go Inputs For Round 3Z.3

Round 3Z.3 should review whether:

- the 3Z.2 implementation plan is concrete enough for a future 4A patch
- unresolved symlink verification is resolved or explicitly accepted with a control
- documented-only 3T-W evidence is resolved or explicitly accepted
- no-live audit strategy is specific enough for a future narrow boundary
- 4A allowed files are limited
- 4A forbidden files are explicit
- acceptance criteria are testable

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
