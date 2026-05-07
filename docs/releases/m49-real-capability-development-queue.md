# M49 Real Capability Development Queue

Status: planning release.

## GSD Spec

Goal:

- Convert the real ChatGPT Business and Codex Desktop automation reference plan
  into an auditable CodexHub development queue.

Scope:

- Add `docs/development/real-capability-codex-development-backlog.md`.
- Add release, review, and runbook docs for the planning round.
- Register the docs in orchestration, integrations, and scaffold health.

Non-scope:

- No new route, provider, store repository, package, or live boundary.
- No live browser, Electron, ChatGPT Business, Codex App Server, GitHub, or
  external process operation.

Acceptance:

- The backlog maps future work to M49-M60 without reusing completed M0-M48 names.
- The first Codex task queue is issue-ready.
- The queue restates no-token, no-cookie, no-session, no-raw-body, no-raw-prompt,
  no-raw-diff, no-unapproved-live-automation boundaries.
- Scaffold health and governance checks pass.

Risk level: critical, because the queue plans future real account, browser,
Codex, recovery, and delivery capabilities.

## GStack Plan

Plan:

- Read the required workflow skills and relevant project skills.
- Inspect current M48-D25 registration patterns.
- Add the planning backlog and closeout docs.
- Register docs in `tools/scaffold-health.ts`, `.codexhub/orchestration.yaml`,
  and `.codexhub/integrations.yaml`.
- Run closeout gates and commit.

Build:

- Documentation and registration only.

Review:

- Confirm no product code path, provider, route, store, or live boundary was added.
- Confirm future live capability tasks remain explicitly gated.

QA:

- Run scaffold health, audits, foundation verification, diff check, and git status.

Ship:

- Commit after clean verification.

Retro:

- Next round should start with M49.1 real capability matrix and security boundary
  docs before any code capability work.

## Superpowers Checklist

- Small scope: yes, documentation and registration only.
- YAGNI: yes, no placeholder implementation packages were created.
- Evidence over claims: verification commands are recorded in final closeout.
- Clean git state: required before commit.
- No unreviewed live automation: preserved.

## Changes

- Added a future M49-M60 real capability development roadmap.
- Converted the first ten Codex development tasks into issue-ready entries.
- Registered the planning round as disabled, review-only, and documentation-only.

## Verification

Completed on 2026-05-07:

- `pnpm scaffold:health`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm audit:no-live-automation`
- `pnpm audit:skills`
- `pnpm verify:foundation`
- `git diff --check`

Result:

- Passed. The round added documentation and registration only.
- No new provider, route, store repository, package, or live boundary was added.
- No live ChatGPT Business, Chrome profile, Codex App Server, Electron/CDP,
  GitHub, or external process operation was executed.

## Skills

Workflow Skills Used and Why:

- `gsd-spec-driver`: defined goal, scope, non-scope, acceptance, boundaries, and
  risk before edits.
- `gstack-delivery-workflow`: structured the round as Plan, Build, Review, QA,
  Ship, and Retro.
- `superpowers-engineering-discipline`: kept this as a small, non-live planning
  change.

Project Skills Used and Why:

- `codexhub-architecture-planner`: mapped future packages and app boundaries.
- `codexhub-contract-designer`: planned future contracts without changing current
  schemas.
- `codexhub-workflow-policy-reviewer`: preserved approval, evidence, audit, and
  metadata-only invariants.
- `codexhub-codex-exec-adapter`: constrained future Codex App Server and process
  integration.
- `codexhub-browser-profile-observer`: constrained future Chrome profile work.
- `codexhub-electron-cdp-observer`: constrained future Electron/CDP work.
- `codexhub-release-auditor`: prepared release closeout evidence.

Skills Not Used and Why:

- `codexhub-playwright-qa`: no Dashboard runtime UI changed.
- Runtime Browser, Electron/CDP, MCP, policy backend, telemetry exporter,
  deployment, and external agent skills were not used because no live capability
  was executed or expanded.
