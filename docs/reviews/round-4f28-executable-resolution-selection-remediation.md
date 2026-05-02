# Round 4F.28: Executable Resolution Selection Remediation

Date: 2026-05-02

## GSD Spec

Goal: remediate the remaining `executable_inaccessible` class from Round 4F.27 without running another pilot.

Scope:

- `packages/codex-kernel/src/real-read-only-adapter-process.ts`
- `packages/codex-kernel/src/codex-kernel.test.ts`
- `docs/reviews/round-4f28-executable-resolution-selection-remediation.md`

Non-scope:

- No pilot retry.
- No real adapter attempt.
- No Dashboard changes or trigger.
- No `workspace_write`.
- No `danger_full_access`.
- No browser, CDP, profile, workspace, account, session, token, cookie, or MFA automation.
- No raw prompt, command, stdout, stderr, argv, executable path, env value, agent body, reasoning body, or raw worktree path persistence.

Acceptance criteria:

- The resolver keeps the fixed `codex_cli` executable policy label.
- The resolver rejects arbitrary executable labels and shell-only shims.
- Windows executable resolution evaluates safe direct executable candidates before failing closed on accessibility.
- Probe-passed native executables are preferred over compatibility-bypassed native executables.
- Process launch remains isolated to the approved process-boundary module.
- Focused and full verification pass before commit.

Hard boundaries: this round does not approve MVP use, broader autonomous use, Dashboard triggering, workspace writes, or `danger_full_access`.

Affected packages: `codex-kernel`.

Risk level: medium. The change is in process-boundary preparation, but it remains policy-label constrained and uses fake/injected test coverage only.

## Skills

Workflow skills used:

- `gsd-spec-driver`: defined this round's goal, scope, non-scope, acceptance criteria, and hard boundaries.
- `gstack-delivery-workflow`: used a scoped build, focused tests, full verification, and commit checkpoint.
- `superpowers-engineering-discipline`: kept the change narrow, evidence-first, and within the existing guarded process-boundary design.

Project skills used:

- `codexhub-architecture-planner`: preserved package boundaries and avoided app/UI scope.
- `codexhub-codex-exec-adapter`: updated only the read-only adapter executable resolver and tests.
- `codexhub-workflow-policy-reviewer`: kept fixed executable policy, metadata-only diagnostics, and no fallback authority.
- `codexhub-release-auditor`: used full closeout verification before commit.

Project skills not used:

- `codexhub-contract-designer`: no contract changes were needed.
- `codexhub-playwright-qa`: Dashboard was not changed.
- `codexhub-electron-cdp-observer` and `codexhub-browser-profile-observer`: Electron, browser profile, and account automation stayed out of scope.

## Root Cause Class

Round 4F.27 still stopped before boundary with `executable_inaccessible`. The remediation target remains Windows executable selection and access-probe compatibility, not governance readiness. The existing resolver allowed a compatibility bypass for trusted Windows `.exe` files, but it returned the first safe direct candidate outcome too early instead of ranking all safe direct candidates by stronger launch evidence.

## Remediation

The resolver now evaluates all non-packaged direct executable candidates before deciding:

- prefer a probe-passed native `.exe`;
- otherwise allow a native `.exe` that qualifies for the Windows compatibility bypass;
- otherwise prefer any probe-passed direct executable;
- otherwise prefer any accessibility-compatible direct executable;
- if none qualify, fail closed with `executable_inaccessible`.

This keeps:

- `shell=false`;
- fixed `codex_cli` policy label;
- no user-supplied executable path;
- no arbitrary argv;
- no raw executable path persistence;
- no env value persistence.

## Test Evidence

Focused test coverage was added for a denied first native candidate followed by a probe-passed native candidate. The resolver now selects the probe-passed native candidate and still blocks inaccessible bare-command candidates.

Verification completed before commit:

- `pnpm nx test codex-kernel`
- `pnpm nx test supervisor`
- `pnpm nx test cli`
- `pnpm tsx tools/audit-real-adapter-boundary.ts`
- `pnpm audit:skills`
- `pnpm audit:no-live-automation`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm verify:foundation`
- full Nx lint/test/build verification

## Outcome

Outcome: `executable_resolution_selection_remediated`.

Next allowed round: `4F.29: Pilot Retry After Executable Selection Remediation`.

Round 4F.29 may run exactly one controlled CLI-only read-only retry. If it still fails or blocks, Round 4G.14 must review the result and Round 4H.9 is the final gate for this aggressive remediation mode. No third remediation loop is approved.
