# Round 3O Read-only Adapter Design Spec

## Status

Design only.

Round 3O does not approve implementation, does not approve a process adapter, and does not grant execution permission.

The Round 3N ADR decision remains in force: future work may continue designing a read-only adapter, but implementation is still blocked until a later ADR and go/no-go review explicitly approves it.

## Goal

Define the narrowest acceptable future design for a Codex read-only adapter path, without creating any live adapter code.

The design must make the future implementation decision explicit, reviewable, and reversible before any process adapter exists.

## Non-goals

Round 3O does not:

- implement a process adapter
- start Codex
- start any external process
- import process-launching modules
- connect to Codex app-server
- connect to Electron/CDP
- connect to Chrome Profile or ChatGPT Workspace
- allow `workspace_write`
- allow `danger_full_access`
- allow Dashboard-triggered execution
- add browser click/input automation
- grant execution permission through recommendation, report review, handoff, ADR draft, or ADR decision records

## Design Principles

- Read-only only: the only allowed future sandbox mode is `read_only`.
- CLI-only trigger: any future attempt must originate from a local CLI command, never Dashboard.
- Explicit enablement: all live defaults remain disabled until a later approved round changes config.
- Hash-bound approval: approval must bind the dry-run plan hash and policy decision hash.
- Isolated worktree: future attempts require an isolated worktree even for read-only mode.
- Evidence and audit first: every stage must produce metadata/hash-only evidence and audit events.
- Abort over ambiguity: any mismatch, missing artifact, unexpected write, or degraded state blocks the attempt.
- Verification required: post-run `pnpm verify:foundation` is mandatory for any future approved attempt.

## Future Control-plane Preconditions

A future read-only adapter attempt may be considered only if all preconditions are true:

- `liveEnabled` is explicitly true in reviewed local config.
- The approved capability is explicitly `read_only`.
- `workspace_write` and `danger_full_access` remain forbidden.
- A dry-run record exists.
- A policy decision exists.
- An approval artifact exists.
- The approval artifact is not expired, revoked, or already used.
- The approval artifact binds `dryRunPlanHash`.
- The approval artifact binds `policyDecisionHash`.
- The current dry-run plan hash matches the bound hash.
- The current policy decision hash matches the bound hash.
- An isolated worktree is present and recorded as metadata.
- Operator checklist is completed.
- Evidence and audit repositories are writable.
- Dashboard trigger remains forbidden.

If any precondition fails, the future adapter must stay disabled and record a blocked result.

## Future CLI-only Trigger Shape

The future trigger surface must be CLI-only and must require an existing dry-run id.

The CLI must not accept raw prompt body for the final attempt. It must resolve all sensitive intent through the existing dry-run record and metadata/hash summaries.

The CLI must print these fields before any future adapter attempt:

- dry-run id
- sandbox mode
- policy outcome
- approval artifact status
- dry-run hash match result
- policy hash match result
- isolated worktree status
- evidence/audit readiness
- `liveExecution=false` until the later implementation boundary changes
- `externalProcessStarted=false` until the later implementation boundary changes
- `executionDisabled=true` until the later implementation boundary changes

Dashboard may display these fields read-only, but must not expose a trigger control.

## Future Configuration Design

Default config remains disabled:

- `liveEnabled: false`
- `allowedSandboxModes: ["read_only"]`
- `forbiddenSandboxModes: ["workspace_write", "danger_full_access"]`
- `dashboardTriggerAllowed: false`
- `requiresIsolatedWorktree: true`
- `requiresApprovalArtifact: true`
- `requiresDryRunPlanHashMatch: true`
- `requiresPolicyDecisionHashMatch: true`
- `requiresPostRunVerification: true`

Any future config enabling must be:

- reviewed through ADR
- committed as local governance config
- covered by policy evaluation
- reflected in evidence and audit
- visible in CLI and Dashboard as read-only state

Round 3O does not change current config defaults.

## Future State Machine

The future read-only adapter design should use these states:

- `disabled_by_config`: live adapter is not enabled.
- `dry_run_missing`: no dry-run record exists.
- `policy_missing`: no policy decision exists.
- `approval_missing`: no approval artifact exists.
- `approval_invalid`: approval is expired, revoked, already used, or hash mismatched.
- `worktree_missing`: isolated worktree requirement is not met.
- `preflight_blocked`: preflight failed or returned degraded risk.
- `ready_for_read_only_attempt`: all gates are satisfied, but no process has started yet.
- `attempt_aborted`: operator or policy aborted before start.
- `attempt_failed`: future process boundary failed after a later approved implementation exists.
- `verification_failed`: post-run verification failed.
- `completed_read_only`: future read-only attempt completed and verification passed.

In Round 3O, only design names are defined. No state transition may start a process.

## Evidence Requirements

Future evidence must remain metadata/hash-only:

- config summary hash
- dry-run plan hash
- policy decision hash
- approval artifact hash
- isolated worktree metadata hash
- preflight result hash
- operator checklist hash
- adapter attempt summary hash, if a later implementation is approved
- verification summary hash

Evidence must not store prompt body, command body, stdout body, stderr body, full agent message body, full reasoning body, token, cookie, session, credential, account, or MFA material.

## Audit Requirements

Future audit chain must include:

- config evaluated
- dry-run resolved
- policy resolved
- approval artifact evaluated
- hash match evaluated
- isolated worktree evaluated
- operator checklist completed
- preflight completed
- adapter attempt blocked, aborted, failed, or completed
- verification completed

Every audit event must include:

- `liveExecution`
- `externalProcessStarted`
- `executionDisabled`
- `dashboardTriggerAllowed: false`
- `sandboxMode: read_only`
- `workspaceWriteAllowed: false`
- `dangerFullAccessAllowed: false`

Before a later approved implementation exists, audit events must continue to show `liveExecution=false`, `externalProcessStarted=false`, and `executionDisabled=true`.

## Failure Handling

Failure handling must prefer blocked or aborted outcomes over partial execution.

Required blocked cases:

- config disabled
- unsupported sandbox mode
- Dashboard trigger attempt
- missing dry-run
- missing policy decision
- policy denied
- missing approval artifact
- approval artifact expired, revoked, or already used
- dry-run plan hash mismatch
- policy decision hash mismatch
- missing isolated worktree
- evidence repository unavailable
- audit repository unavailable
- operator checklist incomplete

Required failed cases for a later approved implementation:

- read-only adapter process cannot be prepared
- event stream cannot be parsed safely
- post-run verification fails
- evidence or audit append fails after start
- unexpected workspace change is detected

All failures must return safe summaries without absolute local path leakage.

## Abort And Rollback Semantics

Abort is allowed before any future process boundary starts.

Rollback is metadata-only for Round 3O because no workspace write is allowed. A future read-only adapter must not rely on rollback to recover from writes; unexpected writes are treated as a critical safety issue.

If a future approved read-only attempt detects unexpected workspace changes, it must:

- mark the run critical
- stop further adapter activity
- record evidence and audit
- require manual review
- not auto-revert files
- not continue to another attempt

## Operator Checklist

Before any future read-only adapter attempt, the operator must confirm:

- This is a read-only attempt.
- `workspace_write` is forbidden.
- `danger_full_access` is forbidden.
- Dashboard trigger is forbidden.
- The dry-run id is correct.
- The approval artifact is present.
- The dry-run hash matches.
- The policy hash matches.
- The isolated worktree is present.
- Evidence and audit storage are healthy.
- Post-run verification will run `pnpm verify:foundation`.
- Failure or uncertainty should abort.
- The recommendation does not grant execution.

The checklist should be represented as metadata and hash-only evidence in a future simulator round.

## Round 3P Preflight Simulator Scope

Round 3P should implement a simulator only. It may evaluate the design preconditions and return simulated states, blockers, evidence refs, and audit events.

Round 3P must still not:

- start Codex
- start external processes
- implement a process adapter
- allow Dashboard trigger
- allow `workspace_write`
- allow `danger_full_access`

## Round 3Q Go / No-Go Review

Round 3Q should review Round 3O design and Round 3P simulator output.

Only after Round 3Q may the project consider whether a later round can implement a narrowly scoped read-only adapter.

The default recommendation remains No-Go for implementation until proven otherwise.
