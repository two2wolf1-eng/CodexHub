# Round 4F.24 Windows EPERM Process Start Remediation

## Round

Round 4F.24: Windows EPERM Process Start Remediation.

## Status

Outcome: `process_start_eperm_remediated_for_retry`

Round 4F.24 made a narrow process-start remediation after 4G.11 confirmed `process_start_failed` with `startFailureKind=eperm`. This round did not run a pilot, invoke a real adapter attempt, create or consume approvals, modify config, change Dashboard, or approve MVP use.

## GSD Spec

Goal: remediate the Windows EPERM process-start class without widening the adapter boundary.

Scope:

- Update the approved process-boundary resolver in `packages/codex-kernel`.
- Add focused resolver tests for the Windows packaged-app/native-executable split.
- Document this remediation round.

Non-scope:

- No pilot retry.
- No real adapter attempt invocation.
- No Dashboard change or trigger.
- No store or config change.
- No approval creation, renewal, revocation, consumption, or mark-used operation.
- No `workspace_write`.
- No `danger_full_access`.
- No browser/CDP/Profile/Workspace/account automation.
- No raw prompt, command, stdout/stderr, argv, executable path, env plan, agent/reasoning body, or raw local worktree path persistence.
- No MVP approval and no broader autonomous-use approval.

Acceptance criteria:

- Resolver keeps policy label fixed to `codex_cli`.
- Resolver rejects arbitrary executable labels.
- Resolver does not execute `.cmd` or `.bat` shell shims.
- On Windows, resolver avoids packaged Windows app resource binaries when a trusted shim points to a native executable outside those resources.
- The process plan still uses fixed argv and `shell:false`.
- Focused tests and full verification pass before commit.

Hard boundaries:

- Process launch remains isolated to `packages/codex-kernel/src/real-read-only-adapter-process.ts`.
- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Raw executable paths and env values remain runtime-only and are not persisted.

Affected apps/packages:

- `packages/codex-kernel`
- `docs/reviews`

Risk level: high. The change affects the approved process-boundary startup path, but the round uses tests only and does not run a real attempt.

## Workflow Skills Used and Why

- `gsd-spec-driver`: used to restate objective, scope, non-scope, acceptance criteria, boundaries, affected files, and risk.
- `gstack-delivery-workflow`: used to keep the round in preflight, build, focused QA, full verification, commit, and checkpoint order.
- `superpowers-engineering-discipline`: used to keep the fix narrow, test-backed, and free of scope expansion.

## Project Skills Used and Why

- `codexhub-architecture-planner`: used to keep the remediation within the existing kernel boundary and avoid new app/process modules.
- `codexhub-codex-exec-adapter`: used because the change affects the read-only adapter process-boundary resolver.
- `codexhub-workflow-policy-reviewer`: used to preserve metadata-only evidence, approval/policy boundaries, and no-live constraints.
- `codexhub-release-auditor`: used for verification, boundary review, and next-round recommendation.

## Skills Not Used and Why

- `codexhub-contract-designer`: not used because existing optional diagnostic fields were sufficient and no contracts changed.
- `codexhub-playwright-qa`: not used because Dashboard UI and browser smoke behavior were not touched.
- `codexhub-electron-cdp-observer`: not used because Electron/CDP remains out of scope.
- `codexhub-browser-profile-observer`: not used because Browser Profile, Chrome Profile, ChatGPT Workspace, and account automation remain forbidden and out of scope.

## Preflight

Starting commit:

- `d2888d9 docs: add eperm process start pilot review`

Preflight passed before code changes:

- `git status --short`: clean
- `pnpm audit:skills`: passed
- `pnpm audit:no-live-automation`: passed
- `pnpm audit:boundaries`: passed
- `pnpm audit:sqlite-isolation`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm verify:foundation`: passed

## Root Cause Class

4F.23 showed:

- `processBoundaryInvoked=true`
- `failureCode=process_start_failed`
- `startFailureKind=eperm`
- `platform=win32`
- `resolvedExecutableKind=native_exe`
- executable existed and was accessible
- cwd existed and matched the isolated worktree metadata

Read-only command discovery during 4F.24 showed a likely Windows-specific split:

- a packaged Windows app resource native executable was discoverable,
- a normal command shim was first in command resolution,
- that shim pointed to a native executable outside the packaged app resources.

The prior resolver preferred the packaged native executable because it searched for `codex.exe` before shell shims. That can still fail under the packaged app permission context even when filesystem existence and access checks pass.

## Remediation

The resolver now:

- keeps policy label fixed to `codex_cli`,
- filters Windows packaged Codex app resource binaries out of direct executable selection,
- uses `codex.cmd` / `codex.bat` only as trusted metadata to discover a quoted native `codex.exe` target,
- refuses to execute the shell shim itself,
- rejects shim targets inside packaged Windows app resources,
- returns a native executable target for the process plan when the target exists and is accessible,
- keeps `shell:false`, fixed argv, `argvStored=false`, `executablePathStored=false`, and `envPlanStored=false`.

The resolved executable path remains runtime-only. Persisted/readback material keeps hashes, counts, booleans, labels, and reason codes only.

## Test Evidence

Focused test added:

- `packages/codex-kernel/src/codex-kernel.test.ts`: verifies a Windows PATH containing both a packaged app resource executable and a trusted shim resolves to the trusted native executable target outside the packaged app resources, while still keeping `shell:false` and metadata-only flags.

Focused verification:

- `pnpm nx test codex-kernel`: passed.
- `pnpm nx test supervisor`: passed.
- `pnpm nx test cli`: passed.
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed.

Full verification before commit:

- `pnpm audit:skills`: passed.
- `pnpm audit:no-live-automation`: passed.
- `pnpm audit:boundaries`: passed.
- `pnpm audit:sqlite-isolation`: passed.
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed.
- `pnpm verify:foundation`: passed.
- `cmd /c pnpm nx run-many -t lint,test,build`: passed.
- `git diff --check`: passed.

## Boundary Review

The remediation does not:

- add a new process-launching module,
- import `node:child_process` outside the approved process-boundary module,
- accept user-supplied executable paths,
- accept arbitrary argv,
- execute shell shims,
- persist executable paths,
- persist env values or env plans,
- persist raw stdout/stderr.

## Next Round

Next allowed round: `Round 4F.25 Pilot Retry After EPERM Remediation`.

4F.25 may run exactly one controlled CLI-only read-only retry after:

- prerequisite readiness is refreshed and ready,
- approval authority is aligned and unused,
- config remains enabled and read-only only,
- policy source remains aligned,
- main repo and isolated pilot worktree are clean,
- runtime worktree path hash matches persisted metadata,
- process-boundary and no-live audits pass.

4F.25 must stop after its review commit and must not enter 4G.12 or 4H.7 automatically.

## Safety Boundary Confirmation

- No pilot retry was run in 4F.24.
- No real adapter attempt path was invoked in 4F.24.
- No approval was created, renewed, revoked, consumed, or marked used.
- No config was changed.
- No Dashboard code or trigger was added.
- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- Broader autonomous use remains forbidden.
- Raw prompt, command, stdout, stderr, agent message, reasoning, argv, executable path, env plan, and raw absolute worktree path persistence remain forbidden.
