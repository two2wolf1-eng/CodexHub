# Round 4F.40: Process Exit Nonzero Remediation

## GSD Spec

Goal: remediate the controlled read-only adapter pilot blocker where the approved process boundary reached Codex CLI but exited nonzero with `exitCode=2`.

Scope:
- `packages/contracts`: metadata-only diagnostic schema for nonzero Codex CLI exits.
- `packages/codex-kernel`: approved process-boundary argv, stdin handling, nonzero-exit classification, attempt evidence/readback metadata.
- `apps/cli`: metadata-only display of nonzero-exit classification.
- `apps/supervisor` and focused tests: readback assertions for the new metadata.
- This review document.

Non-scope:
- No pilot retry in 4F.40.
- No Dashboard trigger or Dashboard change.
- No prompt body, raw command body, raw stdout/stderr body, argv, executable path, env value, agent body, reasoning body, or raw worktree path persistence.
- No `workspace_write`, `danger_full_access`, `shell=true`, arbitrary executable path, or arbitrary argv.

Acceptance criteria:
- The process plan uses only the supported Codex CLI shape `exec --json --sandbox read-only --ephemeral`.
- Internal `dryRunId` and approval artifact id remain internal governance metadata and are not passed to the subprocess argv.
- The runner closes stdin without writing prompt content.
- Nonzero exit code diagnostics expose `nonzeroExitKind` metadata without raw output.
- Focused and full verification pass before commit.

Hard boundaries:
- CLI-only, read-only, local, operator-supervised control path remains enforced.
- Process launch remains isolated to `packages/codex-kernel/src/real-read-only-adapter-process.ts`.
- Fallback/degraded output must never become authority.

Affected apps/packages:
- `packages/contracts`
- `packages/codex-kernel`
- `apps/cli`
- `apps/supervisor`
- `docs/reviews`

Risk level: medium. The change touches the approved process-boundary invocation contract, but keeps execution scope narrower and removes unsupported CLI arguments.

## Workflow Skills Used And Why

- `gsd-spec-driver`: defined round goal, scope, non-scope, acceptance criteria, boundaries, affected packages, and risk.
- `gstack-delivery-workflow`: used small-step build, focused tests, full verification, commit checkpoint.
- `superpowers-engineering-discipline`: kept the fix narrow, evidence-first, and inside existing policy/audit gates.

## Project Skills Used And Why

- `codexhub-codex-exec-adapter`: process-boundary and Codex exec adapter invocation were changed.
- `codexhub-workflow-policy-reviewer`: approval/policy/evidence/audit boundaries and metadata-only guarantees were preserved.
- `codexhub-architecture-planner`: package boundaries were kept through shared contracts and public package entrypoints.
- `codexhub-contract-designer`: a shared metadata-only diagnostic field was added.
- `codexhub-release-auditor`: verification, diff review, and commit readiness were part of closeout.

## Skills Not Used And Why

- Dashboard and Playwright skills: Dashboard remained out of scope.
- Electron/CDP and browser profile skills: no browser, account, profile, or CDP automation was touched.

## Root Cause Class

The prior process plan passed unsupported Codex CLI arguments and values into the subprocess:

- `--jsonl` instead of supported `--json`
- internal sandbox value `read_only` instead of Codex CLI value `read-only`
- internal governance ids via `--dry-run-id` and `--approval-artifact-id`

The local Codex CLI help supports `exec --json --sandbox read-only` and `--ephemeral`. The governance ids are CodexHub control-plane metadata, not Codex CLI process arguments.

## Fix Summary

- Replaced the subprocess argv with fixed metadata-reviewed arguments: `exec --json --sandbox read-only --ephemeral`.
- Removed internal dry-run and approval ids from subprocess argv.
- Kept the worktree as runtime cwd only; no raw worktree path is placed in argv or persisted.
- Added stdin metadata flags and closes stdin without writing prompt content.
- Added `nonzeroExitKind` diagnostics for metadata-only classification of nonzero Codex CLI exits.
- Propagated `nonzeroExitKind` through attempt diagnostics, evidence metadata, summaries, timeline metadata, Supervisor readback, and CLI display.

## Verification Evidence

Focused checks passed:
- `pnpm nx test contracts`
- `pnpm nx test codex-kernel`
- `pnpm nx test supervisor`
- `pnpm nx test cli`

Full verification was run before commit:
- `pnpm audit:skills`
- `pnpm audit:no-live-automation`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm tsx tools/audit-real-adapter-boundary.ts`
- `pnpm verify:foundation`
- `cmd /c pnpm nx run-many -t lint,test,build`
- `git diff --check`
- `git status --short`

## Outcome

4F.40 remediates the known `process_exit_nonzero` usage-error class without running a pilot. The next allowed round is 4F.41: one controlled read-only retry after gate refresh.

Dashboard trigger remains forbidden. `workspace_write` remains forbidden. `danger_full_access` remains forbidden. Browser/CDP/Profile/Workspace/account automation remains forbidden. Broader autonomous use remains blocked.
