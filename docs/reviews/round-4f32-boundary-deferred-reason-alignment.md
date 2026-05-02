# Round 4F.32 Boundary Deferred Reason Alignment

Outcome: `boundary_deferred_reason_alignment_implemented`

Round 4F.32 diagnoses and remediates the pre-boundary `boundary_deferred` readback gap. It does not run a pilot, invoke a real adapter attempt, create approvals, modify config, change Dashboard, or approve MVP use.

## GSD Spec

Goal: make `boundary_deferred` explainable through stable, metadata-only reason codes in attempt records, summaries, timelines, Supervisor readback, and CLI output.

Scope:

- `packages/contracts`: shared deferred reason and diagnostic schemas.
- `packages/codex-kernel`: deferred reason classification and propagation into attempt records, summaries, and timelines.
- `apps/supervisor`: metadata source fields for runtime worktree, approval input, executable resolution, and cwd self-check state.
- `apps/cli`: metadata-only display for deferred reason readback.
- Focused tests for contracts, kernel, Supervisor, and CLI.

Non-scope:

- No pilot retry.
- No real adapter attempt.
- No Dashboard trigger or Dashboard UI.
- No `workspace_write`.
- No `danger_full_access`.
- No browser/CDP/Profile/Workspace/account automation.
- No raw prompt, command, stdout, stderr, argv, executable path, env values, agent/reasoning body, or raw worktree path persistence.

Acceptance criteria:

- `boundary_deferred` remains the high-level result code for pre-boundary defer.
- Readback includes `boundaryDeferredReasonCode`, `boundaryDeferredReasonCodes`, and `boundaryDeferredDiagnostics`.
- Deferred reasons distinguish missing runtime worktree, missing approval input, skipped/blocked executable resolution, skipped/failed cwd self-check, and unexpected missing boundary result after readiness.
- Attempt get/latest/list/timeline and CLI output expose the same safe metadata.
- Focused and full verification pass before commit.

Affected apps/packages: `packages/contracts`, `packages/codex-kernel`, `apps/supervisor`, `apps/cli`, and this review doc.

Risk level: medium. This changes shared readback contracts and control-plane metadata, but it does not widen execution authority or process-boundary scope.

## Workflow Skills Used and Why

- `gsd-spec-driver`: used to define goal, scope, non-scope, acceptance criteria, boundaries, affected projects, and risk.
- `gstack-delivery-workflow`: used to keep the round ordered as preflight, scoped implementation, focused tests, full verification, commit, and checkpoint.
- `superpowers-engineering-discipline`: used to keep changes small, metadata-only, evidence-based, and clean-git gated.

## Project Skills Used and Why

- `codexhub-architecture-planner`: used to preserve shared contracts first, kernel second, apps last.
- `codexhub-contract-designer`: used because shared DTO/schema fields changed.
- `codexhub-workflow-policy-reviewer`: used to preserve approval, evidence, audit, and metadata-only boundaries.
- `codexhub-codex-exec-adapter`: used because the real read-only adapter control-plane readback changed.
- `codexhub-release-auditor`: used for focused/full verification and commit gating.

## Skills Not Used and Why

- `codexhub-playwright-qa`: not used because Dashboard UI was not changed.
- `codexhub-electron-cdp-observer`: not used because Electron/CDP remains out of scope.
- `codexhub-browser-profile-observer`: not used because browser profile/account automation remains out of scope.

## Implementation Summary

- Added stable deferred reason codes:
  - `runtime_worktree_missing`
  - `approval_input_missing`
  - `executable_resolution_not_run`
  - `executable_resolution_blocked`
  - `cwd_self_check_not_run`
  - `cwd_self_check_failed`
  - `boundary_result_missing_after_ready`
  - `unknown`
- Added metadata-only deferred diagnostics with runtime booleans, resolver/cwd statuses, safe reason codes, and no raw paths or command details.
- Propagated deferred diagnostics into attempt records, summaries, and timeline entries.
- Supervisor now passes safe metadata needed for classification, including runtime worktree/input presence and resolver/cwd status.
- CLI output now displays deferred reason metadata beside boundary diagnostics.

## Evidence

Focused verification passed before this doc was created:

- `pnpm nx test contracts`
- `pnpm nx test codex-kernel`
- `pnpm nx test supervisor`
- `pnpm nx test cli`
- `pnpm nx build store-sqlite`
- `pnpm nx test store-sqlite`

Full verification before commit:

- `pnpm audit:skills`: passed
- `pnpm audit:no-live-automation`: passed
- `pnpm audit:boundaries`: passed
- `pnpm audit:sqlite-isolation`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm verify:foundation`: passed
- `cmd /c pnpm nx run-many -t lint,test,build`: passed
- `git diff --check`: passed
- `git status --short`: passed with intended 4F.32 changes only before commit

## Boundary Review

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- Process launch remains isolated to `packages/codex-kernel/src/real-read-only-adapter-process.ts`.
- Deferred diagnostics store only labels, booleans, statuses, hashes, counts, and reason codes.
- Raw worktree path, executable path, argv, env values, prompt, command, stdout, stderr, agent, and reasoning bodies remain unpersisted.

## Next Route

If 4F.32 verifies and commits cleanly, the next allowed round is 4F.33: exactly one controlled CLI-only read-only retry after boundary deferred reason alignment.
