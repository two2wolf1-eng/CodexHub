# M8 Final Release Audit

Date: 2026-05-04

## Scope

This audit covers the M8 release-candidate productization line:

- M8a release-candidate hardening baseline.
- M8b unified Run / Evidence / Audit projection.
- M8c operator readiness and config doctor.
- M8d fixture-only golden path rehearsal.
- M8.5 final release-candidate documentation and health registration.

The audit reviewed contracts, projection kernels, operator readiness helpers,
orchestrator rehearsal behavior, Dashboard read-only views, CLI read-only
commands, governance configuration, health checks, audit scripts, and release
documentation.

## Release Decision

M8 is release-candidate ready.

No release-blocking finding was identified in the final documentation and
health-registration pass. No runtime feature was added in M8.5.

## Safety Boundaries Confirmed

- M8 does not add new Supervisor routes or MCP tools.
- M8 does not add new process, WebSocket, CDP, browser, git, policy runtime, or
  telemetry network boundaries.
- Dashboard and CLI M8 views are read-only.
- Dashboard does not receive local-control credentials.
- Read-only CLI commands do not read local-control credentials or call adapter
  execution functions.
- Unified projections expose ids, hashes, counts, statuses, summaries, evidence
  refs, audit ids, and boundary booleans only.
- Operator doctor reports configured/missing/hash state only and does not expose
  environment values.
- Golden path rehearsal uses fixture/injected data and does not start Codex, Nx,
  Git, Browser, Electron/CDP, OPA/Cedar, or telemetry exporters.
- Policy backend output remains advisory and cannot create execution authority.
- Telemetry projection remains non-authoritative and cannot replace Evidence or
  Audit.

## Review Evidence

Static review checked M8 surfaces for:

- raw prompt, stdout, stderr, diff, trace payload, path, URL, title, token,
  cookie, session, MFA, credential, request body, response body, and command body
  exposure;
- direct adapter execution from Dashboard or CLI;
- request-body approval artifact or execution authority trust;
- new live automation allowlist entries;
- internal package imports and SQLite runtime isolation;
- policy backend or telemetry becoming an authority provider;
- write routes, approval UI, push, hosted PR creation, or remote account flow.

No new issue was found requiring runtime code changes in M8.5.

## Verification Evidence

M8b verification passed before commit `e1d6bf2`:

- `pnpm nx run-many --target=test "--projects=contracts,governance-projection-kernel,dashboard,cli" --skip-nx-cache`
- changed-project lint and build checks
- governance audits
- `pnpm verify:foundation`

M8c verification passed before commit `e718848`:

- `pnpm nx run-many --target=test "--projects=contracts,operator-readiness-kernel,dashboard,cli" --skip-nx-cache`
- changed-project lint and build checks
- governance audits
- `pnpm verify:foundation`

M8d verification passed before commit `dc9af60`:

- `pnpm nx run-many --target=test "--projects=contracts,orchestrator-kernel,governance-projection-kernel,otel-adapter,evidence-kernel,security-kernel" --skip-nx-cache`
- changed-project lint and build checks
- governance audits
- `pnpm verify:foundation`

M8.5 final gates passed in this round:

- `pnpm scaffold:health`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm audit:no-live-automation`
- `pnpm audit:skills`
- `pnpm verify:foundation`
- `git diff --check`
- `git status --short --branch`

## Residual Risk

- Real execution capabilities still require explicit operator enablement,
  persisted approval where required, and local-control gates.
- The release candidate does not include approval UI; adding it should be a
  separate high-risk milestone.
- Hosted PR, push, account integration, real policy runtime, and telemetry
  network exporter flows remain out of scope.
- Future product rounds should preserve the unified projection and doctor views
  as the operator-facing starting point for governance readiness.

## Skills Used

Workflow skills:

- `gsd-spec-driver`: defined goal, scope, non-scope, acceptance, and risk.
- `gstack-delivery-workflow`: kept M8b, M8c, M8d, and M8.5 as independent
  Plan/Build/Review/QA/Ship rounds.
- `superpowers-engineering-discipline`: kept the release candidate scoped to
  read-only productization, verification evidence, clean git state, and no new
  live automation.

Project skills:

- `codexhub-architecture-planner`: reviewed projection, readiness, rehearsal,
  Dashboard, and CLI boundaries.
- `codexhub-contract-designer`: reviewed M8 contracts and metadata-only public
  response guarantees.
- `codexhub-workflow-policy-reviewer`: reviewed authority, approval, evidence,
  audit, and local-control invariants.
- `codexhub-release-auditor`: guided final release gates, audit evidence, and
  release-candidate decision.

Skills not used:

- `codexhub-codex-exec-adapter`, `codexhub-browser-profile-observer`,
  `codexhub-electron-cdp-observer`, and `codexhub-playwright-qa` were not used
  for implementation because M8.5 does not modify those execution or observation
  surfaces.
