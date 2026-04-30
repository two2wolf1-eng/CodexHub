# Round 3Z.4 Preimplementation Hardening

## Status

Round 3Z.4 closes the missing pre-4A hardening artifacts. It does not implement the real read-only adapter, does not add a process boundary, does not launch a process, does not call real Codex, does not mutate a workspace, and does not add Dashboard-triggered actions.

## Current Pre-4A Status

Round 3Z.3 recorded `go_to_4a_real_read_only_adapter_implementation`, which means a future separate Round 4A may be considered. The 3Z.3 decision did not approve implementation in 3Z.3 and did not approve process launch, real Codex execution, workspace mutation, Dashboard trigger, `workspace_write`, or `danger_full_access`.

Before this round, 4A remained blocked because these required artifacts were missing:

- `docs/reviews/round-3z4-preimplementation-hardening.md`
- `docs/checklists/round-4a-implementation-checklist.md`

Round 3Z.4 adds those artifacts and records current evidence for the remaining hardening gates.

## 3Z.3 Decision Summary

Round 3Z.3 accepted two unresolved findings only as future 4A controls:

- `symlink_escape_verification_pending`: Round 4A must add symlink/path escape verification before any future boundary can become active. If verification is missing, skipped, degraded, or ambiguous, the adapter must remain disabled and blocked.
- `documented_only_3tw_evidence`: Round 4A must treat 3T-W evidence as planning provenance only. Runtime readiness must come from current metadata/hash-only control-plane records.

These acceptances do not grant implementation, process launch, Codex execution, workspace mutation, Dashboard trigger, `workspace_write`, or `danger_full_access`.

## Symlink And Path Escape Verification

Current coverage exists for the fixture-backed replay boundary path guard, not for a future real adapter boundary.

| Check | Evidence source | Result | 4A Decision |
| --- | --- | --- | --- |
| absolute fixture path rejected | `apps/supervisor/src/server.test.ts`, test `keeps disabled skeleton and fixture-backed replay boundary read-only` | existing test covers rejected absolute fixture payloads | Reuse as guard evidence for fixture boundary only |
| traversal fixture path rejected | `apps/supervisor/src/server.test.ts`, same test | existing test covers `../codex-exec-basic.jsonl` | Reuse as guard evidence for fixture boundary only |
| non-jsonl fixture path rejected | `apps/supervisor/src/server.test.ts`, same test | existing test covers `.txt` fixture path | Reuse as guard evidence for fixture boundary only |
| outside fixture root rejected | `apps/supervisor/src/server.test.ts`, same test | existing test covers `package.json` outside fixture root | Reuse as guard evidence for fixture boundary only |
| missing fixture path safe error | `apps/supervisor/src/server.test.ts`, same test | existing test expects 404 and checks response body does not contain local absolute workspace path | Reuse as guard evidence for fixture boundary only |
| symlink escape rejected where supported | `apps/supervisor/src/server.test.ts`, same test | existing test attempts to create a symlink under fixture root to `package.json` and expects rejection when symlink creation is available | Reuse as guard evidence for fixture boundary only |

4A requirement: add real adapter path guard tests before any callable adapter path is accepted. The future tests must cover absolute paths, traversal, non-jsonl or unsupported stream source, outside-root access, missing-file safe errors, and symlink escape. If symlink creation is unavailable on a platform, the test must record a skipped/degraded result and 4A must remain blocked unless a human review explicitly accepts an alternative control.

## Worktree Guard Status

Current evidence exists at the control-plane simulator/preflight level. A real adapter worktree guard does not exist yet because no real adapter exists.

| Check | Evidence source | Result | 4A Decision |
| --- | --- | --- | --- |
| workspace write requires isolated worktree | `packages/codex-kernel/src/codex-kernel.test.ts`, test `blocks workspace writes without an isolated worktree` | existing control-plane test blocks workspace-write mode without an isolated worktree | Reuse as policy evidence only |
| missing isolated worktree blocks simulator | `packages/codex-kernel/src/codex-kernel.test.ts`, test `fails simulation on hash mismatch or missing isolated worktree` | existing simulator test fails when isolated worktree is absent | Reuse as simulator evidence only |
| dirty worktree blocks future adapter | no real adapter test yet | not applicable before adapter exists | 4A must add before any callable adapter path |
| unexpected diff detection | no real adapter test yet | not applicable before adapter exists | 4A must add before any callable adapter path |
| no auto-revert and manual review | 3Z.2 plan and 3Z.3 decision | documented as required future behavior | 4A must convert into testable behavior before acceptance |

4A requirement: add clean, dirty, missing, ambiguous, and unexpected-diff worktree guard tests before any future adapter run path can be accepted. Unexpected diff must be critical, must stop further action, must audit, and must not auto-revert.

## Approval Hash Binding Status

Current evidence exists for manual approval and read-only adapter simulator gates.

| Check | Evidence source | Result | 4A Decision |
| --- | --- | --- | --- |
| approval artifact hash mismatch blocked | `packages/codex-kernel/src/codex-kernel.test.ts`, test `blocks approval artifact hash mismatch` | existing execution gate blocks mismatched `dryRunPlanHash` | Reuse as control-plane evidence |
| expired, revoked, or used approvals blocked | `packages/codex-kernel/src/codex-kernel.test.ts`, test `blocks expired, revoked, or used approvals` | existing execution gate blocks invalid approval states | Reuse as control-plane evidence |
| simulator hash mismatch blocked | `packages/codex-kernel/src/codex-kernel.test.ts`, test `fails simulation on hash mismatch or missing isolated worktree` | existing simulator test fails on `dryRunPlanHash` mismatch | Reuse as simulator evidence |
| policy decision hash mismatch blocked | 3Z.2 plan requires this for 4A | existing helpers compare policy hash in gate code, but 4A-specific adapter test does not exist | 4A must add adapter-level test |
| approval single-use enforced | existing approval artifact model and gate tests cover used approval state | present at control-plane level | 4A must preserve and test at adapter boundary |

4A requirement: add adapter-level tests for missing approval, expired approval, revoked approval, used approval, `dryRunPlanHash` mismatch, `policyDecisionHash` mismatch, and single-use behavior before any callable adapter path is accepted.

## Process-boundary-specific Audit Strategy

Round 3Z.4 does not add `tools/audit-real-adapter-boundary.ts`. Adding the script now would introduce a new tool before a real adapter module exists. Instead, 3Z.4 records the exact strategy future 4A must follow.

Future 4A audit requirements:

- Keep `pnpm audit:no-live-automation` strict.
- Do not loosen app-server, Electron/CDP, browser profile, Dashboard trigger, workspace-write, or account automation restrictions.
- If 4A introduces a narrow process boundary, any audit exception must be limited to one explicitly approved adapter module.
- The audit must reject `child_process`, `node:child_process`, `spawn`, and `exec` in every other production path.
- The audit must reject shell-string execution, arbitrary argv passthrough, Dashboard trigger, `workspace_write`, and `danger_full_access`.
- The audit must be covered by tests or a focused audit smoke command before 4A can be accepted.

If 4A cannot make that audit precise, 4A must stop before adding any process boundary.

## Documented-only 3T-W Evidence Treatment

`documented_only_3tw_evidence` remains planning provenance only.

Future 4A must not treat documented-only 3T-W evidence as runtime readiness evidence. Runtime readiness must be checked from current records, current approval state, current policy decision, current worktree guard result, current evidence store status, and current audit store status. New 4A evidence must be metadata/hash-only and must not contain prompt body, command body, raw stdout, raw stderr, full agent message body, or reasoning body.

This limitation does not grant execution permission.

## No-live Boundary Confirmation

Round 3Z.4 keeps:

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

Round 3Z.4 does not approve implementation by itself. It does not implement an adapter. It does not add a process boundary. It only prepares gates for future 4A.

## Remaining 4A Prerequisites

Before a future 4A can be accepted, it must still prove:

- default disabled adapter state
- explicit config enable
- CLI-only entry
- existing dry-run id required
- valid approval artifact required
- `dryRunPlanHash` match
- `policyDecisionHash` match
- sandbox exactly `read_only`
- `workspace_write` rejected
- `danger_full_access` rejected
- Dashboard trigger absent
- isolated worktree required
- clean git status before start
- dirty worktree blocked
- unexpected diff detected as critical
- no auto-revert
- metadata/hash-only evidence
- audit before, after, abort, and failure
- timeout and cancel behavior
- post-run `pnpm verify:foundation`
- no raw prompt, command, stdout, stderr, agent, or reasoning body persistence

## Final 3Z.4 Recommendation

After this document and the 4A checklist are committed, Round 4A may be reconsidered as a separate round. Reconsidered does not mean approved. A future 4A must still run its own preflight, tests, audits, focused verification, full verification, and commit gate.

Round 3Z.4 stops here. Round 4A was not executed.
