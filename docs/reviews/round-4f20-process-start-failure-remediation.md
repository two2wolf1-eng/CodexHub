# Round 4F.20 Process Start Failure Remediation

## Round

Round 4F.20: Process Start Failure Remediation.

## Status

Outcome: `process_start_failure_remediated_for_retry`

Round 4F.20 remediates the process-start failure class found in 4F.19 and confirmed by 4G.9. It does not run a pilot, invoke a real adapter attempt from CLI, consume approvals, modify Dashboard, or approve MVP use.

## GSD Spec

Goal: make the read-only adapter process boundary start path use a safe executable resolver and minimal environment so the next controlled retry can test the real boundary without relying on a shell shim.

Scope:

- Update `packages/codex-kernel/src/real-read-only-adapter-process.ts`.
- Update the Supervisor real read-only adapter attempt path.
- Add focused kernel and Supervisor tests for executable resolution, env allowlisting, and resolver-failure behavior.
- Add this 4F.20 review document.

Non-scope:

- No pilot retry.
- No real adapter attempt invocation.
- No Dashboard code, trigger, or config control.
- No `workspace_write`.
- No `danger_full_access`.
- No browser/CDP/Profile/Workspace/account automation.
- No raw prompt, command, stdout/stderr, argv, executable path, env plan, agent/reasoning body, or raw worktree path persistence.
- No process-boundary broadening beyond the approved module.

Acceptance criteria:

- Only policy label `codex_cli` is accepted for adapter executable resolution.
- Windows resolution prefers a direct `.exe` target and rejects shell-only `.cmd` / `.bat` shims.
- The process plan keeps fixed argv and `shell=false`.
- The process runner receives only an allowlisted runtime environment.
- API/readback metadata records only resolver status, reason codes, env key count/hash, and storage flags.
- Resolver failure blocks before boundary invocation.
- Focused tests and boundary audit pass before 4F.21 can be considered.

Hard boundaries:

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Process launch remains isolated to `packages/codex-kernel/src/real-read-only-adapter-process.ts`.
- Runtime executable paths and environment values must not be persisted or returned.

Affected apps/packages:

- `packages/codex-kernel`
- `apps/supervisor`
- `docs/reviews`

Risk level: high. This round touches the approved process-boundary startup path, but keeps changes narrow, tested with fake/injected runners, and does not run a pilot.

## Workflow Skills Used and Why

- `gsd-spec-driver`: used to bound goal, scope, non-scope, acceptance criteria, boundaries, affected projects, and risk before editing.
- `gstack-delivery-workflow`: used to keep implementation ordered as preflight, build, review, focused tests, full verification, and commit.
- `superpowers-engineering-discipline`: used to keep the change small, evidence-based, and scoped to the startup failure class.

## Project Skills Used and Why

- `codexhub-architecture-planner`: used to preserve package boundaries and keep process launch isolated.
- `codexhub-codex-exec-adapter`: used because the change touches adapter boundary planning and Supervisor attempt behavior.
- `codexhub-workflow-policy-reviewer`: used because the change affects process-start gating, audit/evidence metadata, and fail-closed behavior.
- `codexhub-contract-designer`: used to verify no shared contract change was required; existing metadata fields were sufficient.
- `codexhub-release-auditor`: used for verification, diff review, and release-gate evidence.

## Skills Not Used and Why

- `codexhub-playwright-qa`: not used because Dashboard UI and browser smoke behavior were not changed.
- `codexhub-electron-cdp-observer`: not used because Electron/CDP remains out of scope.
- `codexhub-browser-profile-observer`: not used because Browser Profile, Chrome Profile, ChatGPT Workspace, and account automation remain forbidden.

## Preflight

Starting commit:

- `b2f3a95 docs: add process start failure pilot review`

Preflight passed before code changes:

- `git status --short`: clean
- `git log --oneline -5`: confirmed 4G.9 as latest
- `pnpm audit:skills`: passed
- `pnpm audit:no-live-automation`: passed
- `pnpm audit:boundaries`: passed
- `pnpm audit:sqlite-isolation`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm verify:foundation`: passed

## Root Cause Class

4F.19 reached the approved process boundary and failed with normalized boundary failure code `process_start_failed`.

The likely startup class was:

- Supervisor built a process plan from policy label `codex_cli` but used a bare command name.
- The process runner starts with `shell=false`.
- The runner previously used an empty runtime env.
- On Windows, a bare command can resolve to a shell shim such as `.cmd`, which is not directly runnable with `shell=false`.

4F.20 addresses that class by resolving a direct executable path at runtime and passing only the minimal startup environment to the runner.

## Remediation

Kernel process-boundary module:

- Added `resolveRealReadOnlyAdapterExecutable`.
- Accepts only policy label `codex_cli`.
- Uses direct executable resolution for `codex.exe` before any shell shim.
- Rejects shell-only shim availability with `executable_requires_shell`.
- Rejects any non-approved executable label with `executable_policy_forbidden`.
- Returns runtime executable path only to the caller; storage flags remain `executablePathStored=false`, `envPlanStored=false`, and `argvStored=false`.

Environment allowlist:

- Added `createRealReadOnlyAdapterAllowedProcessEnv`.
- Allows only platform startup keys: `PATH`, `PATHEXT`, `SystemRoot` / `SYSTEMROOT`, `WINDIR`, `TEMP`, and `TMP`.
- Deduplicates case-insensitive key variants.
- Summarizes allowed keys with count and hash only.
- Does not persist or return environment values.

Supervisor attempt path:

- Resolves `codex_cli` after all preflight gates pass and before boundary planning.
- Creates the process plan with the resolved runtime executable and allowlisted env.
- Persists only resolver status, failure reason, env key count/hash, and storage flags.
- If executable resolution is blocked, the attempt remains authoritative and persisted but does not invoke the process boundary.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Skills and governance preflight | `pnpm audit:skills`, no-live, boundaries, SQLite, process-boundary, foundation checks | Passed before editing | 4F.20 allowed |
| Kernel resolver behavior | `pnpm nx test codex-kernel` | Resolver chooses direct `.exe`, rejects shell-only shim, rejects non-approved label, keeps env metadata-only | Accepted |
| Supervisor fake-runner path | `pnpm nx test supervisor` | Injected resolver + runner completes; resolver failure blocks before boundary; no raw executable/env/worktree values appear | Accepted |
| CLI readback boundary | `pnpm nx test cli` | Existing CLI metadata-only output remains valid | Accepted |
| Process boundary isolation | `pnpm tsx tools/audit-real-adapter-boundary.ts` | Passed; process launch still isolated to approved module | Accepted |

## Safety Boundary Confirmation

- No pilot was run in 4F.20.
- No real adapter attempt was invoked from CLI.
- No approval was created, renewed, revoked, consumed, or marked used.
- No Dashboard code or trigger was added.
- The process boundary module remains the only production module importing process-launch APIs.
- Runtime executable path is not persisted or returned.
- Runtime env values are not persisted or returned.
- Raw prompt, command, stdout/stderr, argv, executable path, env plan, agent/reasoning body, and raw worktree path persistence remain forbidden.

## Why 4F.21 Is Next

4F.20 fixes the startup class with fake/injected-runner coverage only. It does not prove a controlled local pilot can complete.

Next allowed round:

`4F.21 Pilot Retry After Process Start Remediation`

4F.21 may run exactly one CLI-only read-only retry after full verification passes and git is clean. 4G.10 and 4H.6 remain blocked until 4F.21 produces an authoritative retry result and 4G.10 reviews it.
