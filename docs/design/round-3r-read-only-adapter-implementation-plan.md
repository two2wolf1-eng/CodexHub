# Round 3R Read-only Adapter Implementation Plan

## Status

Planning only.

Round 3R does not implement a live adapter, does not approve a process adapter, and does not grant execution permission. It records the implementation architecture that a later round may review. The Round 3N and Round 3Q decisions remain in force:

- Round 3N allowed future read-only adapter design only.
- Round 3Q allowed implementation planning only.
- A later ADR and Go/No-Go review is still required before any implementation or process boundary exists.

## Goal

Define the narrowest future implementation plan for a Codex read-only adapter while preserving the current no-live boundary.

The plan must be specific enough for Round 3S to review, but it must not add code, contracts, APIs, runtime behavior, process launching, or Dashboard triggers in Round 3R.

## Non-goals

Round 3R does not:

- implement a process adapter
- import `node:child_process`
- use `spawn`
- use `exec`
- call real `codex exec`
- connect to Codex app-server
- connect to Electron/CDP
- connect to Chrome Profile or ChatGPT Workspace
- allow browser click/input automation
- allow `workspace_write`
- allow `danger_full_access`
- allow Dashboard-triggered execution
- add an approval-and-run, start, run, live, or execute control
- grant execution permission through recommendation, simulator review, ADR decision, or this plan

## Implementation Architecture

A later approved implementation should be split into four layers. Round 3R only names these layers.

1. Control-plane resolver
   - Resolves an existing dry-run id.
   - Loads dry-run, policy decision, approval artifact, live config, ADR decision, simulator review, evidence readiness, and audit readiness.
   - Rejects raw prompt body at the final attempt boundary.

2. Gate evaluator
   - Reuses existing control-plane and simulator checks.
   - Confirms read-only-only mode, explicit config enablement, approval validity, hash matches, isolated worktree, evidence/audit readiness, and operator checklist completion.
   - Returns blocked or ready metadata. It must not start a process.

3. Process boundary adapter
   - May exist only after a later ADR explicitly approves implementation.
   - Must be isolated behind a small interface so process-launching imports cannot spread through `codex-kernel`, Supervisor, Dashboard, or shared packages.
   - Must remain disabled by default and CLI-only.

4. Event ingestion and governance recorder
   - Parses JSONL through the existing Codex exec parser and normalizer.
   - Stores metadata/hash-only evidence and audit.
   - Does not store prompt body, command body, stdout body, stderr body, full agent messages, full reasoning, tokens, cookies, sessions, credentials, MFA material, account data, or local absolute paths.

## Future File And Module Plan

If Round 3S approves a disabled-by-default skeleton, Round 3T should keep changes narrow:

- `packages/codex-kernel`: add interface-only adapter types, gate composition helpers, and disabled result helpers.
- `apps/cli`: add a CLI-only command surface that calls the gate evaluator and stops before any process boundary unless a later ADR approves otherwise.
- `apps/supervisor`: expose read-only status only, not a trigger endpoint.
- `packages/contracts`: add shared types only if existing control-plane contracts cannot represent the disabled skeleton result.
- `packages/store-core` and `packages/store-sqlite`: add persistence only for metadata/hash-only attempt summaries if a later approved skeleton needs records.
- `apps/dashboard`: show read-only state only. No trigger, no form, no button that implies live action.

Round 3T must not place process-launching code in shared contracts, Dashboard, Supervisor route handlers, store packages, or generic workflow packages.

## Risk Controls

Future implementation must preserve these hard gates:

- Sandbox mode is exactly `read_only`.
- `workspace_write` is forbidden.
- `danger_full_access` is forbidden.
- Dashboard trigger is forbidden.
- Existing dry-run record is required.
- Existing policy decision is required and compatible.
- Existing approval artifact is required.
- Approval artifact is approved, unexpired, not revoked, and unused.
- Approval artifact `dryRunPlanHash` matches the current dry-run plan hash.
- Approval artifact `policyDecisionHash` matches the current policy decision hash.
- Isolated worktree is present and recorded as metadata.
- Evidence repository is ready.
- Audit repository is ready.
- Operator checklist is complete.
- Future separate ADR approves implementation before any process adapter exists.
- Post-run verification includes `pnpm verify:foundation`.

Any failed hard gate must produce a blocked result with metadata/hash-only evidence and audit.

## Allowed Command Preview Shape

Future UI and CLI may show a safe command preview, but not a copy-paste executable command.

Allowed preview fields:

- command family label, for example `codex exec`
- dry-run id
- sandbox mode, always `read_only`
- approval artifact id
- dry-run hash match result
- policy hash match result
- isolated worktree status
- evidence/audit readiness
- disabled or ready state

Forbidden preview fields:

- full shell command line
- prompt body
- environment variables
- secrets
- token, cookie, session, MFA, account, or credential material
- local absolute paths that are not necessary for safe review
- write sandbox modes
- flags that imply `workspace_write` or `danger_full_access`

Until a later approved implementation changes the boundary, previews must still show:

- `liveExecution=false`
- `externalProcessStarted=false`
- `executionDisabled=true`
- `processAdapterApproved=false`
- `dashboardTriggerAllowed=false`
- `recommendationGrantsExecution=false`

## Process Boundary Design

The future process boundary must be the smallest possible module and must be reviewed separately.

Design constraints:

- It is CLI-only.
- It accepts an already validated dry-run id and gate result.
- It does not accept raw prompt body.
- It does not accept arbitrary shell strings.
- It does not expose a generic process runner.
- It does not allow caller-provided executable paths.
- It does not allow caller-provided environment overrides except a later reviewed allowlist.
- It emits JSONL into the existing parser and normalizer path.
- It reports blocked, aborted, failed, verification_failed, or completed_read_only states.

Round 3R does not implement this boundary.

## Config Gates

Future config must remain disabled by default:

- `liveEnabled: false`
- `allowedSandboxModes: ["read_only"]`
- `forbiddenSandboxModes: ["workspace_write", "danger_full_access"]`
- `dashboardTriggerAllowed: false`
- `requiresIsolatedWorktree: true`
- `requiresApprovalArtifact: true`
- `requiresDryRunPlanHashMatch: true`
- `requiresPolicyDecisionHashMatch: true`
- `requiresPostRunVerification: true`

Any later enabling config must be:

- reviewed in an ADR
- visible in CLI output
- visible in Dashboard as read-only status
- covered by policy evaluation
- captured as metadata/hash-only evidence
- recorded in audit

Config enablement alone must not start a process.

## Approval And Hash Binding

Future implementation must treat approval as invalid unless all bindings match:

- approval artifact id exists
- approval artifact status is approved
- approval artifact is not expired
- approval artifact is not revoked
- approval artifact is not used
- approval artifact is single-use
- approval artifact `dryRunPlanHash` equals the current dry-run plan hash
- approval artifact `policyDecisionHash` equals the current policy decision hash
- approval artifact scope is read-only and bound to the dry-run

The implementation must not create a new approval artifact at the final attempt boundary. Approval creation remains a separate manual control-plane workflow.

## Isolated Worktree Model

Even read-only attempts must require an isolated worktree.

The future adapter must record only metadata:

- worktree label
- worktree relative path or safe id
- repository state hash summary, if available
- clean-state check summary
- unexpected-change check summary

The adapter must not auto-create, auto-modify, or auto-clean a worktree unless a separate future round explicitly approves that behavior. If unexpected workspace changes are detected, the attempt must stop, record a critical audit event, and require manual review. It must not auto-revert files.

## Evidence Model

Future evidence must remain metadata/hash-only.

Required evidence kinds:

- live config summary
- dry-run plan summary
- policy decision summary
- approval artifact summary
- hash match summary
- isolated worktree summary
- operator checklist summary
- preflight or simulator summary
- adapter attempt summary, only if later approved
- verification summary, only if later approved

Evidence must include ids, hashes, counts, timestamps, status, and summaries. Evidence must not include prompt body, command body, stdout body, stderr body, full agent messages, full reasoning, token, cookie, session, credential, MFA, or account data.

## Audit Model

Future audit events must form a linear, reviewable chain:

- config evaluated
- dry-run resolved
- policy resolved
- approval artifact evaluated
- dry-run hash match evaluated
- policy hash match evaluated
- isolated worktree evaluated
- operator checklist evaluated
- preflight completed
- adapter attempt blocked, aborted, failed, verification_failed, or completed_read_only
- verification completed, if a later approved attempt reaches that point

Every audit event must include:

- `liveExecution`
- `externalProcessStarted`
- `executionDisabled`
- `dashboardTriggerAllowed: false`
- `sandboxMode: read_only`
- `workspaceWriteAllowed: false`
- `dangerFullAccessAllowed: false`
- evidence refs
- reason codes

Before a later implementation is approved, audit events must continue to show `liveExecution=false`, `externalProcessStarted=false`, and `executionDisabled=true`.

## Failure And Abort Model

Future behavior must prefer blocked or aborted outcomes over partial execution.

Blocked before process boundary:

- config disabled
- unsupported sandbox mode
- Dashboard trigger attempt
- missing dry-run
- missing policy decision
- policy denied
- missing approval artifact
- invalid approval artifact
- dry-run plan hash mismatch
- policy decision hash mismatch
- missing isolated worktree
- evidence repository unavailable
- audit repository unavailable
- incomplete hard-gate checklist
- implementation not approved by a later ADR

Aborted before process boundary:

- operator cancels
- non-critical metadata is missing and requires review
- degraded simulator or preflight state
- uncertainty about repository state

Failed after a later approved process boundary:

- process cannot be prepared safely
- JSONL event stream cannot be parsed safely
- parser detects unsafe or malformed event volume
- verification fails
- evidence or audit append fails after start
- unexpected workspace change is detected

Failure responses must not leak absolute local paths or sensitive body content.

## Post-run Verification Requirement

If a later round ever approves an actual read-only attempt, `pnpm verify:foundation` is mandatory after the attempt.

Verification output must be summarized as metadata/hash-only evidence and audit. A verification failure must mark the attempt as `verification_failed` and require manual review.

## Operator Checklist

Before any future read-only adapter attempt, the operator must confirm:

- The attempt is CLI-only.
- Dashboard trigger is forbidden.
- The sandbox mode is `read_only`.
- `workspace_write` is forbidden.
- `danger_full_access` is forbidden.
- The dry-run id is correct.
- The approval artifact exists.
- The approval artifact is approved, unexpired, not revoked, and unused.
- The dry-run hash matches.
- The policy hash matches.
- The isolated worktree is present.
- Evidence storage is ready.
- Audit storage is ready.
- `pnpm verify:foundation` will run after any later approved attempt.
- Any uncertainty should abort.
- The recommendation does not grant execution.

## Round 3S Manual Go/No-Go Checklist

Round 3S must decide whether Round 3T may add a disabled-by-default skeleton only.

Round 3S must answer:

- Is the implementation architecture narrow enough?
- Is the process boundary isolated enough?
- Are `workspace_write` and `danger_full_access` still impossible?
- Is Dashboard still read-only only?
- Is the CLI-only trigger sufficiently constrained?
- Is raw prompt body excluded from the final attempt boundary?
- Are approval and hash bindings mandatory?
- Is isolated worktree metadata mandatory?
- Are evidence and audit required before and after the boundary?
- Is post-run `pnpm verify:foundation` mandatory?
- Are failure, abort, and unexpected-change semantics safe?
- Does any text imply execution permission before implementation approval?
- Should Round 3T be allowed to add a disabled-by-default skeleton?

The default answer remains No-Go for real execution. If Round 3S approves anything, it should approve only a disabled-by-default skeleton with no process launch unless explicitly stated otherwise in a later ADR.

## Round 3T Guardrails If Approved Later

Round 3T, if approved, should start with a skeleton that:

- keeps live defaults disabled
- exposes no Dashboard trigger
- starts no external process unless explicitly approved by Round 3S and a separate ADR
- produces blocked/disabled records by default
- reuses existing parser, simulator, evidence, and audit contracts where possible
- adds focused tests for blocked defaults, forbidden modes, hash mismatch, approval invalidity, and Dashboard no-trigger behavior

Round 3T must not treat this document as implementation approval.

## Current Decision

Round 3R is complete when this implementation plan is reviewed and verified. It is a planning artifact only.

The recommended next step is Round 3S: Read-only Adapter Implementation Plan Review / Go-No-Go.
