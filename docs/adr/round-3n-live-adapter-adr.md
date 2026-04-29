# Round 3N Live Adapter ADR

## Status

Conditional Go for future read-only adapter design only.

No implementation is approved in Round 3N. No process adapter is approved in Round 3N.

## Context

CodexHub has built a read-only Codex control plane around fixture replay, dry-run planning, preflight checks, approval state, execution gate evaluation, timeline, evidence and audit drilldown, report export, report review history, governance package, and ADR draft generation.

The next decision is whether future work may design a live adapter path. This ADR records governance guidance only. It does not create execution permission and does not enable live behavior.

## Decision

Future work may design a read-only live adapter path under a separate ADR and go/no-go review.

The only allowed future sandbox mode for that design is `read_only`.

The following remain forbidden:

- `workspace_write`
- `danger_full_access`
- browser click/input automation
- Electron/CDP live connection
- Chrome Profile or ChatGPT Workspace access
- token, cookie, session, MFA, account, or credential handling
- permission, quota, or governance bypass

## Trigger Policy

Any future read-only adapter attempt must be CLI-only.

Dashboard remains read-only. Dashboard must not trigger live adapter actions, approval-and-run flows, start actions, run actions, or execute actions.

## Required Future Gates

Before any future read-only live adapter can be considered, all of the following must be true:

- A dry-run exists.
- An approval artifact exists.
- The approval artifact binds `dryRunPlanHash`.
- The approval artifact binds `policyDecisionHash`.
- The dry-run hash matches the current dry-run record.
- The policy hash matches the current policy decision.
- An isolated worktree is present.
- Evidence is generated.
- Audit events are generated.
- Post-run verification must include `pnpm verify:foundation`.

## Non-Approval Clauses

This ADR does not approve implementation.

This ADR does not approve a process adapter.

This ADR does not grant execution permission.

This ADR does not change live config defaults.

This ADR does not allow Dashboard-triggered execution.

## Consequences

Round 3N may add structured governance records, read-only API/CLI/Dashboard views, local persistence, evidence, audit, and human-readable documentation for the ADR decision.

Round 3N must not add a process launcher, live adapter, shell execution path, workspace write path, browser/CDP path, account path, or credential path.

## Follow-up

The next safe step is a separate read-only adapter design review. Implementation remains blocked until a future ADR explicitly approves a limited design and a separate implementation round is approved.
