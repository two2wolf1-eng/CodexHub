# Round 3Z.1 ADR Go/No-Go Decision

## Status

Recorded docs-only governance decision. This decision is not execution approval.

## Decision

Outcome: `go_to_real_adapter_implementation_plan`

This outcome allows only Round 3Z.2 real read-only adapter implementation planning.

It does not approve:

- implementation
- process adapter
- process launch
- real Codex execution
- workspace mutation
- Dashboard trigger
- `workspace_write`
- `danger_full_access`

## Decision Basis

The Round 3Z ADR draft covers the required planning constraints:

- CLI-only trigger.
- Existing dry-run id required.
- Explicit config enablement required.
- Default config remains disabled.
- Sandbox remains `read_only` only.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Dashboard trigger remains forbidden.
- Approval artifact is required.
- `dryRunPlanHash` binding is required.
- `policyDecisionHash` binding is required.
- Isolated worktree is required.
- Clean git status is required.
- Raw prompt, command, stdout, stderr, agent message, and reasoning bodies remain forbidden from storage.
- Evidence remains metadata/hash-only.
- Audit coverage is required before, after, abort, timeout, cancel, and failure paths.
- Timeout and cancel semantics must be designed.
- `pnpm verify:foundation` is required after any future attempt.
- Operator review is required before any later step.

## Unresolved Findings Carried Forward

Round 3Z.2 must carry these findings as explicit planning inputs:

- `symlink_escape_verification_pending`
- `documented_only_3tw_evidence`

These findings remain unresolved. They do not block planning, but they must block future implementation approval unless a later review records resolution or an accepted compensating control.

## Scope Of Permission

Permitted next step:

- Write a docs-only Round 3Z.2 implementation plan.

Not permitted:

- Adding contracts.
- Adding codex-kernel runtime behavior.
- Adding Supervisor APIs.
- Adding CLI commands.
- Adding Dashboard controls.
- Adding store tables.
- Adding a process adapter.
- Adding process launch behavior.
- Calling real Codex.
- Mutating the workspace through adapter behavior.

## Required 3Z.2 Constraints

Round 3Z.2 must specify, without implementing:

- future modules and files
- future contracts
- future codex-kernel adapter interface
- disabled default config
- explicit config enablement
- process boundary design
- allowed argv construction design
- no shell string design
- executable resolution policy
- timeout and cancel design
- JSONL event stream capture
- parser and normalizer reuse
- metadata/hash-only evidence
- audit event sequence
- worktree clean check
- unexpected diff critical handling
- no auto-revert
- post-run `pnpm verify:foundation`
- operator manual review
- rollback and abort semantics
- required tests and audits before implementation
- exact future 4A allowed and forbidden files
- exact future 4A acceptance criteria

## No-live Boundary Confirmation

This decision keeps:

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

Round 3Z.1 stops after this decision is committed. Round 3Z.2 may begin only after verification passes and the worktree is clean.
