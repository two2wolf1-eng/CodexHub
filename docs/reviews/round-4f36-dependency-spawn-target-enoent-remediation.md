# Round 4F.36: Dependency / Spawn Target ENOENT Remediation

## Outcome

`dependency_spawn_target_enoent_remediated`

Round 4F.36 did not run a pilot and did not invoke a real adapter attempt. The round narrowed the 4F.35 `dependency_or_spawn_target_enoent` failure to executable resolution behavior before the process boundary.

## Workflow Protocol

Goal: diagnose and remediate the Windows `process_start_failed` / `dependency_or_spawn_target_enoent` class without running a pilot.

Scope: `packages/codex-kernel` process-boundary resolver and focused tests, plus this review document.

Non-scope: Dashboard trigger, `workspace_write`, `danger_full_access`, browser/CDP/Profile/Workspace/account automation, shell execution, arbitrary executable paths, arbitrary argv, approval/policy/config/worktree gate changes, and real adapter attempt execution.

Acceptance criteria: resolver tests cover stale trusted shim targets, missing targets, current native target recovery, metadata-only guarantees, and boundary audit remains isolated to the approved process module.

Hard boundaries: `shell=false` remains fixed, `codex_cli` remains the only executable policy label, argv remains fixed by the process plan, and raw executable paths/env values/stdout/stderr/worktree paths are not persisted.

Affected packages: `packages/codex-kernel`.

Risk level: medium, because the fix changes executable resolution for the real read-only adapter process boundary.

## Skills Used

Workflow skills used:

- `gsd-spec-driver`: framed the round objective, scope, non-scope, acceptance criteria, and hard boundaries before code edits.
- `gstack-delivery-workflow`: kept the change small, verified focused tests first, and prepared a commit checkpoint.
- `superpowers-engineering-discipline`: kept the fix evidence-driven and avoided scope expansion.

Project skills used:

- `codexhub-architecture-planner`: preserved the package boundary and kept process launch isolated to `codex-kernel`.
- `codexhub-codex-exec-adapter`: applied the resolver remediation in the read-only adapter process-boundary path.
- `codexhub-workflow-policy-reviewer`: preserved approval, policy, metadata-only, and no-fallback authority guarantees.
- `codexhub-release-auditor`: used focused verification and release-blocker documentation.

Skills not used:

- `codexhub-contract-designer`: existing optional diagnostics and kernel types were sufficient; no shared contract schema change was needed.
- Dashboard, Playwright, Electron/CDP, browser profile, and account automation skills: those areas stayed out of scope.

## Root Cause Class

The resolver already rejected Windows packaged app resources and shell-only shims. However, a trusted npm shim can point at a native executable inside a versioned OpenAI ChatGPT extension directory that no longer exists after the extension updates.

Before this round, the trusted shim target path was not independently checked for existence before the Windows native executable access-probe bypass. That allowed a missing native target to be treated as executable-accessible. The process boundary then attempted to spawn the missing target with `shell=false`, producing `process_start_failed` with `startFailureKind=enoent`.

## Remediation

The resolver now:

- checks trusted shim targets for existence before applying the Windows native `.exe` access-probe bypass;
- recovers only from a stale trusted OpenAI ChatGPT extension shim by selecting an existing native `codex.exe` from the same fixed extension family;
- keeps `executableResolutionSource=trusted_shell_shim_target` for traceability while using `spawnTargetKind=native_exe` for the actual spawn target;
- blocks stale trusted shim targets with `executable_resolution_failed` when no current native target exists;
- still rejects shell-only shims, Windows packaged app resources, arbitrary executable labels, arbitrary argv, and `shell=true`.

## Metadata-Only Evidence

Persisted and readback metadata remains hash/count/status only:

- executable path is represented by hash only;
- env plan values are not persisted;
- argv is not persisted;
- stdout/stderr bodies are not persisted;
- raw worktree paths are not persisted.

## Verification Evidence

Focused verification completed:

- `pnpm nx test codex-kernel`
- `pnpm nx test supervisor`
- `pnpm nx test cli`
- `pnpm tsx tools/audit-real-adapter-boundary.ts`

The `codex-kernel` tests now cover:

- recovering from a stale trusted Windows shim target to a current native extension target;
- blocking stale trusted shim targets when no current native target exists;
- maintaining `shell=false`, fixed policy label, metadata-only flags, and no argv/env-plan persistence.

## Next Round

Round 4F.37 may run exactly one controlled CLI-only read-only retry after full verification and a clean git checkpoint. If the retry still fails in the ENOENT/process-start family, the route may proceed through 4G.18 and 4H.13, then use the bounded optional remediation loop only if the blocker remains in the same class.
