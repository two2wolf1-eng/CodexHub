# Round 3S Disabled Skeleton Go/No-Go Decision

## Status

Recorded governance decision model. This ADR does not approve a process adapter or live execution.

## Decision

CodexHub supports a dual-option Round 3S decision:

- `no_go`
- `conditional_go_to_disabled_skeleton`

There is no implicit Go. The operator must explicitly record the outcome.

## Conditional Go Meaning

`conditional_go_to_disabled_skeleton` allows only a future Round 3T disabled-by-default read-only adapter skeleton. It does not approve implementation of a process adapter and does not grant execution permission.

Allowed future Round 3T scope:

- public interfaces and disabled-by-default skeleton wiring
- no-live status reporting
- config checks that remain disabled by default
- tests proving no process starts
- audit compatibility checks

Forbidden future Round 3T scope:

- `node:child_process`
- `spawn`
- `exec`
- real `codex exec`
- Codex app-server integration
- Dashboard trigger
- browser click/input automation
- Electron/CDP live connection
- Chrome Profile or ChatGPT Workspace access
- `workspace_write`
- `danger_full_access`

## Required Future Gates

Any later round that proposes real process execution must first pass a separate ADR and Go/No-Go review. That later review must require:

- existing dry-run record
- valid approval artifact
- `dryRunPlanHash` match
- `policyDecisionHash` match
- isolated worktree metadata
- ready evidence repository
- ready audit repository
- failure/abort plan
- post-run `pnpm verify:foundation`

## Dashboard Rule

Dashboard remains read-only. It must not include execution, start, run, live, or approve-and-run controls.

## Execution Permission

This decision is governance guidance only:

- `implementationApproved=false`
- `processAdapterApproved=false`
- `recommendationGrantsExecution=false`
- `dashboardTriggerAllowed=false`
- `workspaceWriteAllowed=false`
- `dangerFullAccessAllowed=false`

## Consequences

Round 3T can proceed only as a disabled-by-default skeleton if a matching governance record exists. Real adapter implementation remains out of scope until a later explicit ADR approves it.
