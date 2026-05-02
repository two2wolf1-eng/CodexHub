# Round 4F.22 Process Start Failure Deep Diagnostics

## Round

Round 4F.22: Process Start Failure Deep Diagnostics / Spawn Compatibility Remediation.

## Status

Outcome: `spawn_compatibility_diagnostics_remediated_for_retry`

Round 4F.22 narrows the repeated `process_start_failed` blocker after 4H.6 No-Go. It adds metadata-only spawn compatibility diagnostics and safe resolver/readback alignment. It does not run a pilot, invoke a real adapter attempt, create or consume approvals, modify Dashboard, or approve MVP use.

## GSD Spec

Goal: make the approved read-only adapter process boundary expose enough metadata-only startup diagnostics to distinguish executable resolution, cwd, env allowlist, and spawn failure classes before the next controlled retry.

Scope:

- Update `packages/contracts` boundary diagnostic schemas.
- Update `packages/codex-kernel` process resolver, cwd self-check, boundary result, and attempt/timeline metadata helpers.
- Update Supervisor attempt planning/readback metadata.
- Update CLI attempt readback formatting.
- Add focused contracts, kernel, Supervisor, CLI, and dependent store-sqlite fixture tests.
- Add this 4F.22 review document.

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

- Boundary diagnostics include start failure kind, platform, resolved executable kind, cwd hash/existence/directory metadata, executable existence/accessibility, and env allowlist key count/hash.
- Windows executable resolution still prefers direct `.exe`, rejects shell-only `.cmd` / `.bat` shims, and rejects inaccessible executable candidates.
- Runtime env allowlisting preserves safe platform key casing while hashing canonical key names and never storing env values.
- Supervisor passes resolver and cwd self-check metadata into process plans without returning raw executable or worktree paths.
- CLI readback surfaces only metadata, hashes, counts, and flags.
- Focused tests and boundary audit pass before commit.

Hard boundaries:

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Process launch remains isolated to `packages/codex-kernel/src/real-read-only-adapter-process.ts`.
- Runtime executable paths, env values, argv, raw outputs, and raw worktree paths must not be persisted or returned.

Affected apps/packages:

- `packages/contracts`
- `packages/codex-kernel`
- `packages/store-sqlite` test fixture coverage
- `apps/supervisor`
- `apps/cli`
- `docs/reviews`

Risk level: high. This round changes shared contracts and the approved process-boundary diagnostics path, but it uses fake/injected-runner tests only and does not run a pilot.

## Workflow Skills Used and Why

- `gsd-spec-driver`: used to bound goal, scope, non-scope, acceptance criteria, boundaries, affected projects, and risk before editing.
- `gstack-delivery-workflow`: used to keep implementation ordered as preflight, build, review, focused tests, full verification, and commit.
- `superpowers-engineering-discipline`: used to keep the remediation narrow, evidence-based, and scoped to diagnostics and spawn compatibility only.

## Project Skills Used and Why

- `codexhub-architecture-planner`: used to preserve package boundaries and keep process launch isolated.
- `codexhub-contract-designer`: used because shared diagnostic DTO/schema fields changed.
- `codexhub-workflow-policy-reviewer`: used because the change affects approval-gated attempt evidence/audit metadata and fail-closed readback.
- `codexhub-codex-exec-adapter`: used because the change touches the adapter process boundary and Supervisor attempt planning.
- `codexhub-release-auditor`: used for verification, boundary review, commit evidence, and next-round recommendation.

## Skills Not Used and Why

- `codexhub-playwright-qa`: not used because Dashboard UI and browser smoke behavior were not changed.
- `codexhub-electron-cdp-observer`: not used because Electron/CDP remains out of scope.
- `codexhub-browser-profile-observer`: not used because Browser Profile, Chrome Profile, ChatGPT Workspace, and account automation remain forbidden.

## Preflight

Starting commit:

- `adfcb22 docs: add read-only adapter mvp gate retry`

Preflight passed before code changes:

- `git status --short`: clean
- `git log --oneline -8`: confirmed 4H.6 as latest completed route point
- `pnpm audit:skills`: passed
- `pnpm audit:no-live-automation`: passed
- `pnpm audit:boundaries`: passed
- `pnpm audit:sqlite-isolation`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm verify:foundation`: passed

## Root Cause Class

4F.21 still failed with `process_start_failed` after earlier process-start remediation. The previous diagnostics showed the normalized failure code but did not expose enough startup compatibility metadata to distinguish:

- executable kind,
- executable existence and accessibility,
- cwd existence and directory status,
- platform,
- env allowlist key shape,
- process start failure kind.

4F.22 does not claim the runtime issue is fixed. It makes the next retry diagnosable without storing raw paths, env values, argv, stdout, or stderr.

## Remediation

Contracts:

- Added `startFailureKind`.
- Added `platform`.
- Added `resolvedExecutableKind`.
- Added cwd metadata: `cwdHash`, `cwdExists`, and `cwdIsDirectory`.
- Added executable metadata: `executableExists` and `executableAccessible`.
- Added env allowlist metadata: `envAllowlistKeyCount` and `envAllowlistKeyHash`.
- Added these fields to boundary diagnostic completeness checks.

Kernel process-boundary module:

- Classifies start failures as stable kinds: `enoent`, `eacces`, `eperm`, `spawn_unknown`, or `unknown`.
- Avoids persisting raw OS error messages from process start failures.
- Records executable kind and executable path hash only.
- Adds cwd self-check metadata with hash, existence, and directory flags only.
- Preserves safe runtime env key casing and hashes canonical env key names.
- Keeps `shell=false`, fixed argv, metadata-only output summaries, and process launch isolated to the approved module.

Supervisor attempt path:

- Computes cwd self-check metadata before boundary invocation.
- Passes executable resolver metadata and cwd metadata into the process plan.
- Blocks before the boundary if cwd self-check fails.
- Persists only resolver status/reason, start compatibility flags, hashes, counts, and storage flags.

CLI:

- Prints boundary start diagnostics as metadata-only lines.
- Does not print raw executable paths, env values, raw worktree paths, argv, or raw output bodies.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Contracts diagnostic schema | `pnpm nx test contracts` | Passed | New diagnostic DTO fields parse and remain metadata-only |
| Kernel resolver/runner diagnostics | `pnpm nx test codex-kernel` | Passed | `.exe` preference, shell-shim rejection, inaccessible executable block, env allowlist, cwd metadata, and fake-runner start failure diagnostics covered |
| Supervisor readback | `pnpm nx test supervisor` | Passed | Injected resolver/runner readback includes diagnostics and does not expose raw paths/env/argv |
| CLI readback | `pnpm nx test cli` | Passed | CLI renders only hashes, counts, statuses, and flags |
| Store fixture compatibility | `pnpm nx test store-sqlite` / `pnpm nx build store-sqlite` | Passed | Persisted failed-attempt fixtures include the new metadata-only diagnostics |
| Process boundary isolation | `pnpm tsx tools/audit-real-adapter-boundary.ts` | Passed | Process launch remains isolated to the approved module |

## Safety Boundary Confirmation

- No pilot was run in 4F.22.
- No real adapter attempt was invoked from CLI.
- No approval was created, renewed, revoked, consumed, or marked used.
- No Dashboard code or trigger was added.
- No config permission was widened.
- The process boundary module remains the only production module importing process-launch APIs.
- Runtime executable path is not persisted or returned.
- Runtime env values are not persisted or returned.
- Raw prompt, command, stdout/stderr, argv, executable path, env plan, agent/reasoning body, and raw worktree path persistence remain forbidden.

## Why 4F.23 Is Next

4F.22 adds diagnostics and spawn compatibility alignment with fake/injected-runner coverage only. It does not prove a controlled local pilot can complete.

Next allowed round:

`4F.23 Pilot Retry After Spawn Compatibility Remediation`

4F.23 may run exactly one CLI-only read-only retry after full verification passes and git is clean. 4G.11 and 4H.7 remain blocked until 4F.23 produces an authoritative retry result and 4G.11 reviews it.

## Verification

Focused verification:

- `pnpm nx test contracts`: passed
- `pnpm nx test codex-kernel`: passed
- `pnpm nx test supervisor`: passed
- `pnpm nx test cli`: passed
- `pnpm nx test store-sqlite`: passed
- `pnpm nx build store-sqlite`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm audit:no-live-automation`: passed

Final verification:

- `pnpm audit:skills`: passed
- `pnpm audit:boundaries`: passed
- `pnpm audit:sqlite-isolation`: passed
- `pnpm verify:foundation`: passed
- `cmd /c pnpm nx run-many -t lint,test,build`: passed
- `git diff --check`: passed
- `git status --short`: expected 4F.22 files modified before commit
