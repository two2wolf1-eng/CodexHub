# Round 3Z.3 Go/No-Go For 4A

## Status

Recorded docs-only go/no-go decision for future 4A consideration. This decision does not implement a real read-only adapter and does not approve process launch in Round 3Z.3.

## Decision

Outcome: `go_to_4a_real_read_only_adapter_implementation`

Meaning:

- A future, separate Round 4A may be considered.
- Round 4A must still follow AGENTS.md, workflow skills, project skills, preflight checks, implementation review constraints, and full verification.
- Round 3Z.3 does not execute Round 4A.

This outcome does not approve:

- implementation inside Round 3Z.3
- process launch inside Round 3Z.3
- real Codex execution inside Round 3Z.3
- workspace mutation
- Dashboard trigger
- `workspace_write`
- `danger_full_access`
- account, token, cookie, session, MFA, or credential automation
- Electron/CDP or Chrome Profile access

## Decision Basis

Round 3Z.2 provides a concrete implementation plan and risk matrix for a future narrow adapter. The plan defines:

- future modules and files
- future contracts
- codex-kernel adapter interface responsibilities
- disabled default config
- explicit config enablement
- process boundary design
- structured argument construction design
- no shell string design
- executable resolution policy
- timeout and cancel design
- JSONL event stream capture
- parser and normalizer reuse
- metadata/hash-only evidence
- audit event sequence
- worktree clean checks
- unexpected diff critical handling
- no auto-revert
- post-run `pnpm verify:foundation`
- operator manual review
- rollback and abort semantics
- tests and audits required before implementation acceptance
- exact future 4A allowed and forbidden files
- exact future 4A acceptance criteria

## Accepted Unresolved Findings

### `symlink_escape_verification_pending`

Accepted only as a future 4A precondition with compensating controls.

Round 4A must add symlink/path escape verification before any process boundary can become active. If this cannot be implemented or manually verified, the adapter must remain disabled and blocked.

### `documented_only_3tw_evidence`

Accepted only as planning provenance.

Round 4A must not treat documented-only 3T-W evidence as runtime readiness evidence. Any new 4A evidence must be persisted as metadata/hash-only records, and any runtime readiness claim must come from current control-plane checks.

## Required Round 4A Constraints

If Round 4A is started later, it must:

- remain CLI-only
- require an existing dry-run id
- keep default adapter config disabled
- require explicit config enablement
- restrict sandbox mode to `read_only`
- reject `workspace_write`
- reject `danger_full_access`
- keep Dashboard trigger forbidden
- require a valid approval artifact
- require matching `dryRunPlanHash`
- require matching `policyDecisionHash`
- require isolated worktree metadata
- require clean git status before any attempt
- require evidence store readiness
- require audit store readiness
- store metadata/hash-only evidence
- store no raw prompt body
- store no raw command body
- store no raw stdout/stderr body
- store no full agent message or reasoning body
- define timeout, cancel, abort, failure, and completion semantics
- run `pnpm verify:foundation` after any future attempt
- require operator review before any follow-up
- classify unexpected workspace changes as critical
- avoid auto-revert

## Round 4A Allowed Scope

The initial Round 4A patch may only touch the 3Z.2 allowed file candidates and their adjacent tests:

- contracts needed for metadata-only adapter records
- codex-kernel adapter interface and gated orchestration
- security/workflow/evidence helpers only if existing helpers are insufficient
- store-core/store-sqlite only if metadata persistence is required
- CLI-only entry path
- focused audit update only if 4A explicitly needs a narrow boundary-specific no-live rule

Any expansion beyond this scope requires stopping and recording why the expansion is required.

## Round 4A Forbidden Scope

Round 4A must not touch:

- Dashboard trigger controls
- Electron/CDP modules
- Browser Profile or Chrome Profile modules
- Codex app-server integration
- account, token, cookie, session, MFA, or credential code
- broad unrelated infrastructure
- unrelated docs or formatting

Round 4A must not add:

- Dashboard execution controls
- `workspace_write`
- `danger_full_access`
- browser click/input automation
- Electron/CDP connection
- Chrome Profile or ChatGPT Workspace access
- credential/session/account automation

## Audit Strategy For 4A

Round 4A must keep the existing audits strict.

If the narrow process boundary requires a no-live audit adjustment, the adjustment must be:

- specific to the approved 4A boundary
- covered by focused tests
- unable to allow app-server, Electron/CDP, browser profile, Dashboard trigger, workspace-write, or account automation paths
- reviewed before commit

No audit may be loosened broadly.

## Required 4A Verification

Round 4A must run:

- `pnpm audit:skills`
- `pnpm audit:no-live-automation`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm verify:foundation`
- `cmd /c pnpm nx run-many -t lint,test,build`
- focused tests for every touched package/app
- `git diff --check`
- `git status --short`

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

## Final Stop Rule

Round 3Z.3 stops here. Round 4A was not executed. No real adapter was implemented. No real Codex execution was performed. No process adapter was added. No Dashboard trigger was added. No workspace write was performed.
