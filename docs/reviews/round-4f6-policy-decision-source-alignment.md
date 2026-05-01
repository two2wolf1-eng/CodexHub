# Round 4F.6 Policy Decision Source Alignment

## Status

Round 4F.6 remediates the Round 4F.5 policy blocker. It does not run a pilot, invoke a real adapter attempt, consume approval, broaden automation, or approve MVP use.

Outcome: policy decision source alignment implemented for future 4F.7 retry consideration.

## Scope

Allowed changes in this round:

- contracts for metadata-only policy source records
- codex-kernel policy source helpers and approval hash binding
- store-core and store-sqlite policy source repository
- Supervisor policy source endpoints and attempt preflight source selection
- CLI policy source prepare/get/list/latest commands
- focused tests for contracts, kernel, store, Supervisor, and CLI

Forbidden and not changed in this round:

- Dashboard trigger or Dashboard execution control
- workspace_write
- danger_full_access
- browser, CDP, Chrome Profile, ChatGPT Workspace, account, session, token, cookie, or MFA automation
- historical dry-run policy mutation
- fallback or local-only policy authority
- pilot execution
- raw prompt, command, stdout, stderr, argv, executable, environment, or raw absolute worktree path persistence

## Root Cause

Round 4F.5 produced authoritative persisted attempt `codex_real_read_only_adapter_attempt_702efb4a-2b92-435c-b357-e80b92760492`, but it stopped before the process boundary:

- status: `blocked`
- resultErrorCode: `preflight_failed`
- failedCheckCodes: `policy_decision_exists`
- processBoundaryInvoked: `false`

The attempt preflight was still using the historical dry-run policy decision. That decision remained `deny`, which is correct for the original no-live dry-run history but not sufficient as the current policy authority for the gated read-only pilot route.

## Remediation

4F.6 adds a separate authoritative read-only adapter policy source record. The record evaluates current read-only pilot policy from existing dry-run metadata and current explicit config, without mutating the historical dry-run policy decision.

Aligned policy source records require:

- Supervisor-backed persistence
- non-degraded store
- existing dry-run record
- explicit config enablement
- read-only-only config
- current non-deny policy decision
- dryRunPlanHash
- policyDecisionHash
- evidence/audit readiness
- no fallback authority
- no pilot execution
- no adapter attempt invocation

Approval requests may bind to an aligned policy source. The resulting approval artifact carries the aligned `policyDecisionHash` and `dryRunPlanHash`, so future attempt preflight can fail closed on mismatches instead of relying on historical deny policy.

## Evidence

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Contract schema coverage | `pnpm nx test contracts` | policy source schemas parse and reject degraded aligned records | Continue |
| Kernel classification | `pnpm nx test codex-kernel` | aligned, blocked, fallback, and metadata-only helpers covered | Continue |
| SQLite repository | `pnpm nx test store-sqlite` | policy source table save/get/list/latest path covered through store tests | Continue |
| Supervisor authority | `pnpm nx test supervisor` | policy source endpoints, approval binding, source prep, readiness, and guarded fake-runner attempt pass | Continue |
| CLI fallback | `pnpm nx test cli` | policy source fallback remains degraded/notPersisted and cannot align authority | Continue |

## Safety Boundary Confirmation

All 4F.6 records and summaries keep these fixed values:

- liveExecution=false
- externalProcessStarted=false
- executionDisabled=true
- implementationApproved=false
- processAdapterApproved=false
- recommendationGrantsExecution=false
- workspaceWriteAllowed=false
- dangerFullAccessAllowed=false
- dashboardTriggerAllowed=false
- pilotExecuted=false
- adapterAttemptInvoked=false

The only approved process boundary remains `packages/codex-kernel/src/real-read-only-adapter-process.ts`. 4F.6 did not add another process boundary and did not run a real pilot.

## Next Gate

Round 4F.7 may be considered only after 4F.6 focused and full verification pass, this round is committed, and git status is clean.

4F.7 must still run exactly one controlled CLI-only read-only retry. It must use a valid unused approval bound to the aligned policy source, matching dryRunPlanHash and policyDecisionHash, matching isolated worktree metadata, and non-degraded evidence/audit stores.
