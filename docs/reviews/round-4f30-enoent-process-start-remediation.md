# Round 4F.30: ENOENT Process Start Remediation

## Outcome

`enoent_process_start_remediation_complete`

Round 4F.30 remediated the current `process_start_failed` / `startFailureKind=enoent`
class without running a pilot and without invoking the real adapter attempt path.

## Development Workflow Protocol

### GSD Spec Phase

- Goal: narrow the Windows process-start ENOENT blocker so the approved process boundary can avoid non-spawnable targets and produce metadata-only diagnostics when ENOENT still occurs.
- Scope: `packages/contracts`, `packages/codex-kernel`, `apps/cli`, focused tests, and this review document.
- Non-scope: no pilot, no real adapter attempt, no Dashboard changes, no new process-boundary module, no shell execution, no broader automation approval.
- Acceptance criteria: focused contracts/kernel/Supervisor/CLI tests pass; process-boundary audit passes; diagnostics remain metadata-only.
- Hard boundaries: no Dashboard trigger, no `workspace_write`, no `danger_full_access`, no browser/CDP/Profile/Workspace/account automation, no raw prompt/command/stdout/stderr/argv/executable/env/worktree path persistence, no arbitrary executable path, no arbitrary argv, no `shell=true`.
- Affected apps/packages: `packages/contracts`, `packages/codex-kernel`, `apps/cli`, `docs/reviews`.
- Risk level: high, because this touches the read-only adapter process-boundary resolver and shared attempt diagnostics.

### GStack Delivery Phase

- Plan: inspect the resolver, boundary result shaping, shared diagnostics contracts, CLI readback, and focused tests.
- Build: add optional metadata-only ENOENT diagnostics and make Windows app-alias paths non-spawnable resolver targets.
- Review: verify that executable paths and env values are still hashes/counts only and that process launch remains isolated to the approved boundary module.
- QA: run focused contracts, kernel, Supervisor, CLI tests, and process-boundary audit before full verification.
- Ship: commit only after final verification passes and git is clean.
- Retro: the blocker has moved from generic ENOENT to a more precise spawn-target/dependency classification if it recurs in 4F.31.

### Superpowers Engineering Discipline

- Kept the change narrowly scoped to process-start compatibility and metadata-only diagnostics.
- Added focused tests before continuing to any retry round.
- Preserved existing gates and did not add a fallback authority path.

## Skills Used

### Workflow Skills Used and Why

- `gsd-spec-driver`: used to define the round objective, scope, non-scope, acceptance criteria, and hard boundaries before editing.
- `gstack-delivery-workflow`: used to keep the round as inspect, build, focused verification, full verification, commit.
- `superpowers-engineering-discipline`: used to keep the remediation small, evidence-driven, and bounded.

### Project Skills Used and Why

- `codexhub-architecture-planner`: used because the fix crosses contracts, kernel, and CLI boundaries.
- `codexhub-contract-designer`: used because shared diagnostic schemas and inferred types changed compatibly.
- `codexhub-workflow-policy-reviewer`: used because approval/policy gates and metadata-only guarantees must remain intact.
- `codexhub-codex-exec-adapter`: used because the approved read-only adapter process-boundary resolver was changed.
- `codexhub-release-auditor`: used for verification and release-blocker documentation.

### Skills Not Used and Why

- `codexhub-playwright-qa`: not used because Dashboard UI was not touched.
- `codexhub-electron-cdp-observer`: not used because Electron/CDP remains out of scope.
- `codexhub-browser-profile-observer`: not used because browser/profile/workspace/account automation remains out of scope.

## Root Cause Class

4F.29 ended with `process_start_failed` and `startFailureKind=enoent`.
The narrow likely class is Windows process-start compatibility where discovery can find a target that appears present but is not safe to spawn with `shell=false`, especially Windows app-alias style targets or a mismatch between the discovery target and the true spawn target.

## Remediation Summary

- Added compatible shared diagnostics fields:
  - `enoentKind`
  - `spawnTargetKind`
  - `executableHash`
  - `executableResolutionSource`
  - `dependencyResolutionStatus`
- Kept these fields metadata-only: hashes, labels, booleans, counts, and reason codes only.
- Made Windows app-alias locations non-spawnable resolver candidates.
- Preserved trusted shim parsing only as a discovery mechanism for a native target; the boundary still starts the native target with `shell=false`.
- Added ENOENT classification for:
  - cwd missing
  - executable missing
  - Windows app-alias mismatch
  - dependency or spawn-target mismatch
- Updated CLI readback to display the new metadata-only diagnostics.

## Evidence

Focused checks passed:

- `pnpm nx test contracts`
- `pnpm nx test codex-kernel`
- `pnpm nx test cli`
- `pnpm nx test supervisor`
- `pnpm tsx tools/audit-real-adapter-boundary.ts`

Boundary guarantees preserved:

- `shell=false`
- fixed argv builder
- fixed `codex_cli` executable policy label
- no user-supplied executable path accepted
- no arbitrary argv accepted
- process launch remains isolated to `packages/codex-kernel/src/real-read-only-adapter-process.ts`

Metadata-only guarantees preserved:

- executable target stored as hash only
- cwd/worktree path stored as hash only
- env stored as allowlist key count/hash only
- stdout/stderr stored as hashes, byte counts, line counts, and truncation flags only
- no prompt, command, argv, executable path, env value, agent, reasoning, or raw worktree path persistence

## Next Round

The next allowed round is 4F.31: one controlled CLI-only read-only retry after ENOENT remediation.

4F.31 must refresh gates, run exactly one retry, read back attempt/latest/timeline, and stop after committing its review document.
