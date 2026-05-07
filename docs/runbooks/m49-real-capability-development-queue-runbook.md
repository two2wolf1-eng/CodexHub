# M49 Real Capability Development Queue Runbook

Purpose:

- Give operators and future Codex rounds a safe way to consume the real-capability
  backlog without accidentally opening live automation.

## How To Use This Queue

1. Start with the planning document:
   `docs/development/real-capability-codex-development-backlog.md`.
2. Pick the next milestone in order. Do not skip ahead to live browser, account,
   Codex task, or recovery actions.
3. Open a small development round using the CodexHub protocol:
   GSD Spec, GStack Plan, Superpowers Checklist, project skills, focused tests,
   audits, release doc, review doc, and commit.
4. Implement contracts before kernels, kernels before apps.
5. Add or tighten tests before enabling any new live path.
6. Keep defaults disabled until a later round proves dry-run, approval, evidence,
   audit, and rollback behavior.

## First Safe Sequence

Run these before any real adapter work:

1. M49.1 real capability matrix.
2. M49.2 security boundary convergence.
3. M50 Supervisor route skeleton and gates.
4. M51 contracts and store.
5. M54 Codex App Server adapter skeleton behind disabled gates.

## Do Not Do These In Planning Rounds

- Do not open a real Chrome profile.
- Do not read cookies, tokens, sessions, storage, passwords, MFA data, or raw env.
- Do not start Codex App Server or Codex Desktop processes.
- Do not connect to Electron/CDP.
- Do not submit a real Codex task.
- Do not create a branch, push, open PR, invite/remove Business users, or change
  workspace membership.

## Live Capability Enablement Checklist

Before a future milestone enables any real live path, it must prove:

- Contract schemas parse valid fixtures and reject forbidden raw values.
- Store round trips are metadata-only.
- Supervisor POST routes reject missing/bad token, malicious origin, request-body
  authority, and request-body approval artifacts.
- The action has a dry-run plan.
- Required approvals are store-resolved, approved, unused, unexpired, and
  hash-bound.
- Evidence and audit are emitted.
- Boundary booleans truthfully record whether a live boundary was reached.
- Failure paths degrade safely and do not report false success.

## Emergency Stop

If a future round observes unexpected live behavior:

1. Stop the round.
2. Do not continue implementing adjacent capability.
3. Record the route, package, command, or adapter that crossed the boundary.
4. Add an audit or test regression before attempting any fix.
5. Rerun the failed focused check and the full closeout gates.

## Closeout Gates

Every future round should end with:

- Focused tests for touched projects.
- Focused lint/build for touched projects.
- `pnpm scaffold:health`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm audit:no-live-automation`
- `pnpm audit:skills`
- `pnpm verify:foundation`
- `git diff --check`
- clean `git status --short --branch`

## Skills

Workflow Skills Used and Why:

- `gsd-spec-driver`: keeps each future task scoped before edits.
- `gstack-delivery-workflow`: keeps each future task independently buildable and
  reviewable.
- `superpowers-engineering-discipline`: prevents scope creep and unreviewed live
  automation.

Project Skills Used and Why:

- `codexhub-architecture-planner`: use for package, route, store, and control-plane
  changes.
- `codexhub-contract-designer`: use before modifying shared contracts.
- `codexhub-workflow-policy-reviewer`: use before changing workflow, approval,
  evidence, audit, or risk behavior.
- `codexhub-codex-exec-adapter`: use before Codex App Server or Codex execution
  changes.
- `codexhub-browser-profile-observer`: use before Chrome profile changes.
- `codexhub-electron-cdp-observer`: use before Electron/CDP changes.
- `codexhub-playwright-qa`: use before Dashboard UX or browser smoke changes.
- `codexhub-release-auditor`: use for every closeout.

Skills Not Used By Default:

- Browser Profile runtime, Electron/CDP runtime, MCP runtime, policy backend
  runtime, telemetry exporter runtime, deployment runtime, and external agent
  runtime. Use only when a later approved implementation round touches that live
  surface.
