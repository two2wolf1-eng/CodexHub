# Round 4F.26 Executable Accessibility Remediation

## Round

Round 4F.26: Executable Accessibility Remediation.

## Status

Outcome: `executable_accessibility_remediated_for_controlled_retry`.

This round remediated the pre-boundary `executable_inaccessible` blocker recorded by 4F.25 and reviewed by 4G.12 / 4H.7. No pilot was run, no real adapter attempt was invoked, and no approval was created or consumed.

## GSD Spec

Goal: prevent the Windows resolver from fail-closing solely because the execute/read access probe rejects an otherwise trusted native `codex.exe` candidate.

Scope:

- `packages/codex-kernel`
- `apps/supervisor`
- focused tests for kernel, Supervisor, and CLI readback behavior
- this review document

Non-scope:

- No real pilot retry.
- No adapter attempt invocation.
- No Dashboard changes or triggers.
- No config changes.
- No `workspace_write`.
- No `danger_full_access`.
- No browser/CDP/Profile/Workspace/account automation.
- No raw prompt, command, stdout/stderr, argv, executable path, env value, agent/reasoning body, or raw worktree path persistence.

Acceptance criteria:

- Windows native `.exe` resolution may proceed when the candidate exists, is selected through the fixed `codex_cli` policy label, is not a WindowsApps packaged resource, and only the access probe denies it.
- Shell-only shims, packaged app resources, missing executables, untrusted policy labels, and non-native inaccessible candidates remain blocked.
- Metadata remains hash/status/count-only; executable path, argv, env plan, and raw bodies are not persisted or returned.
- Focused tests and boundary audit pass.

Hard boundaries:

- Process launch remains isolated to `packages/codex-kernel/src/real-read-only-adapter-process.ts`.
- Fallback/degraded/local-only output is never authority.
- Dashboard trigger, `workspace_write`, and `danger_full_access` remain forbidden.

Affected apps/packages:

- `packages/codex-kernel`
- `apps/supervisor`
- `apps/cli` tests only
- `docs/reviews`

Risk level: high. The round changes process-boundary resolver behavior, but does not run a real pilot or broaden execution scope.

## Workflow Skills Used and Why

- `gsd-spec-driver`: used to restate objective, scope, non-scope, acceptance criteria, boundaries, affected projects, and risk before editing.
- `gstack-delivery-workflow`: used to keep the round in preflight, scoped build, focused verification, full verification, commit, and checkpoint order.
- `superpowers-engineering-discipline`: used to keep the change narrow, test-first where practical, and evidence-based.

## Project Skills Used and Why

- `codexhub-architecture-planner`: used to keep resolver logic in the kernel and Supervisor thin.
- `codexhub-codex-exec-adapter`: used because the change affects the real read-only adapter process-boundary resolver.
- `codexhub-workflow-policy-reviewer`: used to preserve metadata-only evidence, approval, audit, and no-live boundaries.
- `codexhub-release-auditor`: used for verification and closeout.

## Skills Not Used and Why

- `codexhub-contract-designer`: not used because shared contracts did not change.
- `codexhub-playwright-qa`: not used because Dashboard UI and browser smoke behavior were not touched.
- `codexhub-electron-cdp-observer`: not used because Electron/CDP remains out of scope.
- `codexhub-browser-profile-observer`: not used because Browser Profile, Chrome Profile, Workspace, and account automation remain forbidden and out of scope.

## Remediation

The resolver now treats a denied Windows access probe as non-authoritative for a trusted native `.exe` candidate. The candidate must still:

- be selected only through the fixed `codex_cli` policy label,
- be discovered from the allowed process environment,
- exist,
- be classified as `native_exe`,
- not be a WindowsApps packaged app resource,
- keep `shell=false`, `argvStored=false`, `executablePathStored=false`, and `envPlanStored=false`.

The resolver records metadata-only diagnostics:

- `executableAccessProbePassed`
- `windowsNativeExecutableAccessProbeBypassed`
- `executableExists`
- `executableAccessible`
- resolved executable kind
- env allowlist key count/hash

No raw executable path or env value is stored.

## Verification Evidence

Preflight passed before editing:

- `git status --short`: clean
- latest commit: `6c5505b docs: add read-only adapter mvp gate retry`
- `pnpm audit:skills`
- `pnpm audit:no-live-automation`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm tsx tools/audit-real-adapter-boundary.ts`
- `pnpm verify:foundation`

Focused checks passed after the change:

- `pnpm nx test codex-kernel`
- `pnpm nx test supervisor`
- `pnpm nx test cli`
- `pnpm tsx tools/audit-real-adapter-boundary.ts`

## Next Step

Round 4F.27 may run exactly one controlled CLI-only read-only retry after full verification and a clean git checkpoint.
