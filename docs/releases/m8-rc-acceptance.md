# M8.6 RC Acceptance Smoke

Date: 2026-05-04

## Status

M8.6 is an operator-facing acceptance smoke for the M8 release candidate. It
does not add a feature, route, approval UI, adapter, process boundary, network
boundary, browser act path, Electron/CDP capability, worktree execution path,
push, or hosted PR flow.

Result: accepted for release-candidate pilot readiness.

## GSD Spec

Goal: confirm that an operator can understand and exercise the M8 release
candidate through the existing read-only CLI and Dashboard surfaces.

Scope:

- Run `codexhub doctor` from the local CLI source entrypoint.
- Run `codexhub governance runs list`.
- Run `codexhub rehearsal golden-path --fixture`.
- Smoke Dashboard `#/governance`.
- Smoke Dashboard `#/readiness`.
- Record the evidence in this release document.

Non-scope:

- No new route.
- No new command behavior.
- No Dashboard write UI.
- No local-control credential use in Dashboard.
- No adapter execution from Dashboard or read-only CLI.
- No real Codex, Nx, Git, Browser, Electron/CDP, OPA/Cedar, or telemetry
  exporter execution.

Acceptance criteria:

- CLI doctor returns a structured readiness report without exposing secret
  values.
- Governance run list returns a read-only projection or degraded metadata
  summary without invoking live execution.
- Golden path fixture rehearsal passes and reports no real write or live
  boundary.
- Dashboard `#/governance` and `#/readiness` render expected headings without
  client page errors.
- Foundation verification remains green.

Risk level: medium. This round exercises operator paths and a local Dashboard
server, but it does not change runtime capabilities.

## GStack Delivery

Plan:

- Verify the current git state is clean.
- Run the three operator CLI smoke commands.
- Serve the Dashboard locally and visit the two M8 operator routes.
- Document the results.
- Run release gates and commit only this document.

Build:

- No product code was changed.
- This document is the only M8.6 artifact.

Review:

- Checked that the smoke path used read-only commands and route visits only.
- Checked that the Dashboard smoke did not send POST requests or local-control
  credentials.
- Checked that no new process or network integration was added.

QA:

- CLI smoke evidence and Dashboard route smoke evidence are recorded below.
- Foundation verification was run after the document was added.

Ship:

- Commit after release gates pass and the worktree is clean.

Retro:

- The M8 operator path is understandable enough for a limited RC pilot.
- The expected warnings are conservative defaults: disabled live integrations
  and missing local-control keys for mutating routes.

## CLI Smoke Evidence

Command: `pnpm tsx apps/cli/src/main.ts doctor --json`

Result:

- Report status: `warn`.
- Passed checks: 9.
- Warning checks: 8.
- Failed checks: 0.
- Store available: true.
- Process boundary allowlist passed: true.
- Policy, risk, and integration configs were summarized by hash.
- Local-control keys were reported as missing without exposing values.
- Browser, Electron/CDP, Worktree, Policy backend, and Telemetry remained
  disabled or advisory/local-only by default.

Interpretation: the doctor output is actionable for an operator. The release
candidate is not fully enabled for live use, but the blockers are expected and
explained.

Command: `pnpm tsx apps/cli/src/main.ts governance runs list --json`

Result:

- Status: `degraded`.
- Projection count: 2.
- Sources: `policy`, `telemetry`.
- Evidence count: 2.
- Audit event count: 1.
- Process boundary count: 0.
- External process started count: 0.
- Network boundary count: 0.
- `liveExecution=false`.
- `externalProcessStarted=false`.
- `noRealWrite=true`.
- Degraded reasons were fetch failures from unavailable optional local data
  sources.

Interpretation: the governance projection is safe in a partially unavailable
local environment. It returns metadata-only summaries instead of failing the
operator flow.

Command: `pnpm tsx apps/cli/src/main.ts rehearsal golden-path --fixture --json`

Result:

- Rehearsal status: `passed`.
- Scenario: `all-pass`.
- Steps: development request, worktree fixture, Codex fixture, verification
  fixture, PR draft fixture, release audit fixture, telemetry projection fixture.
- Evidence refs: 7.
- Audit events: 7.
- PR draft status: `ready`.
- Release audit status: `ready`.
- `processBoundaryInvoked=false`.
- `externalProcessStarted=false`.
- `networkBoundaryInvoked=false`.
- `noRealWrite=true`.
- `pushAllowed=false`.
- `pullRequestOpened=false`.
- `telemetryAuthoritative=false`.

Interpretation: the fixture-only golden path proves the M8 governance shape
without starting real providers or touching remote systems.

## Dashboard Smoke Evidence

Dashboard was served locally on `127.0.0.1:4212` for the smoke check.

Route: `#/governance`

- HTTP status: 200.
- React root present: true.
- Expected heading rendered: `Unified Governance Projection`.
- Degraded/ready status text rendered: true.
- Page errors: 0.

Route: `#/readiness`

- HTTP status: 200.
- React root present: true.
- Expected heading rendered: `Operator Readiness`.
- Degraded/warn/ready status text rendered: true.
- Page errors: 0.

Interpretation: both M8 operator views render safely in a local browser smoke.
The Dashboard can be opened for RC review even when optional Supervisor-backed
data sources are unavailable.

## Release Gate Evidence

Final gates passed for this round:

```powershell
pnpm nx run dashboard:test --skip-nx-cache
pnpm nx run cli:test --skip-nx-cache
pnpm scaffold:health
pnpm audit:boundaries
pnpm audit:sqlite-isolation
pnpm audit:no-live-automation
pnpm audit:skills
pnpm verify:foundation
git diff --check
git status --short --branch
```

## Acceptance Decision

M8 is acceptable for a limited release-candidate pilot.

The next recommended round is M9a Limited Local Pilot. Keep it constrained to a
non-production local environment and begin with doctor, governance projection,
and fixture rehearsal before enabling any real provider boundary.

## Skills Used

Workflow skills:

- `gsd-spec-driver`: framed goal, scope, non-scope, acceptance criteria, hard
  boundaries, affected surfaces, and risk.
- `gstack-delivery-workflow`: kept the round to Plan, Build, Review, QA, Ship,
  and Retro.
- `superpowers-engineering-discipline`: enforced small scope, evidence over
  claims, clean git state, and no new live automation.

Project skills:

- `codexhub-architecture-planner`: confirmed the acceptance smoke did not
  change package boundaries or add new authority paths.
- `codexhub-playwright-qa`: guided the Dashboard route smoke and degraded-state
  checks.
- `codexhub-release-auditor`: guided verification evidence and release
  acceptance wording.

Skills not used:

- `codexhub-contract-designer`, `codexhub-workflow-policy-reviewer`,
  `codexhub-codex-exec-adapter`, `codexhub-browser-profile-observer`, and
  `codexhub-electron-cdp-observer` were not used for implementation because
  M8.6 does not modify contracts, policy behavior, Codex execution, Browser
  observation, or Electron/CDP observation.
