# Round 4F.34 Boundary Deferred Readback Propagation Fix

## Outcome

`boundary_deferred_readback_propagation_fixed`

Round 4F.34 fixed the narrow readback gap where an authoritative attempt could stop as `boundary_deferred` while get/latest/list/timeline and CLI readback failed to consistently expose the existing deferred reason metadata.

## GSD Spec

Goal: make existing `boundaryDeferredReasonCode`, `boundaryDeferredReasonCodes`, and `boundaryDeferredDiagnostics` propagate through persisted attempt records, summaries, timelines, Supervisor responses, and CLI output.

Scope:

- `packages/codex-kernel`: deferred readback alignment and reconstruction from metadata-only attempt fields.
- `packages/codex-kernel` tests: legacy/partial deferred record reconstruction.
- `packages/store-sqlite` tests: persisted deferred payload round-trip.
- `apps/supervisor` tests: attempt get/latest/list/timeline readback after store round-trip.
- `apps/cli` tests: deferred metadata display for attempt/list/timeline output.
- This review document.

Non-scope:

- No pilot retry.
- No real adapter attempt.
- No new deferred reason taxonomy.
- No Dashboard work.
- No config, approval, policy, worktree, or process-boundary scope expansion.

Acceptance criteria:

- Boundary deferred attempts expose non-empty deferred reason fields after readback.
- Older or partially shaped metadata-only deferred records can reconstruct safe top-level deferred diagnostics.
- Store, Supervisor, and CLI readback paths preserve metadata-only deferred fields.
- Raw worktree path, executable path, argv, env values, prompt, command, stdout, and stderr remain absent from persisted/readback payloads.

Hard boundaries:

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- Fallback/degraded/local-only output must never become authority.
- No raw prompt, command, stdout/stderr, argv, executable path, env values, agent/reasoning body, or raw worktree path persistence.

Affected apps/packages:

- `packages/codex-kernel`
- `packages/store-sqlite`
- `apps/supervisor`
- `apps/cli`
- `docs/reviews`

Risk level: high, because this touches governance readback for controlled adapter attempts. The change is intentionally constrained to metadata-only propagation and test coverage.

## Delivery Notes

The kernel now aligns attempt records before summary/timeline generation. If an older or partially shaped `boundary_deferred` attempt has no top-level deferred diagnostics but still has safe metadata fields, the kernel reconstructs:

- `boundaryDeferredReasonCode`
- `boundaryDeferredReasonCodes`
- `boundaryDeferredDiagnostics`

The reconstruction uses only booleans, statuses, hashes, labels, and reason codes. It does not persist or return raw runtime paths, executable paths, argv, env values, prompt bodies, command bodies, stdout, or stderr.

Store, Supervisor, and CLI tests now cover the real propagation path rather than only direct helper formatting:

- save attempt
- get/list/latest from store
- Supervisor get/latest/list/timeline readback
- CLI attempt/list/timeline formatting

## Evidence

Focused checks:

- `pnpm nx test contracts` passed.
- `pnpm nx test codex-kernel` passed after adding the local deferred reason-code guard.
- `pnpm nx test store-sqlite` passed.
- `pnpm nx test supervisor` passed.
- `pnpm nx test cli` passed.

Full verification:

- `pnpm audit:skills` passed.
- `pnpm audit:no-live-automation` passed.
- `pnpm audit:boundaries` passed.
- `pnpm audit:sqlite-isolation` passed.
- `pnpm tsx tools/audit-real-adapter-boundary.ts` passed.
- `pnpm verify:foundation` passed.
- `cmd /c pnpm nx run-many -t lint,test,build` passed.
- `git diff --check` passed.

## Skill Usage

Workflow Skills Used and Why:

- `gsd-spec-driver`: converted the round into goal, scope, non-scope, acceptance criteria, boundaries, touched packages, and risk.
- `gstack-delivery-workflow`: kept the work in inspect, build, focused-test, full-verify, commit order.
- `superpowers-engineering-discipline`: kept the fix small, evidence-backed, and within the no-live/no-scope-expansion boundaries.

Project Skills Used and Why:

- `codexhub-architecture-planner`: preserved package boundaries between contracts, kernel, store, Supervisor, and CLI.
- `codexhub-codex-exec-adapter`: applied the change inside the read-only adapter control-plane/readback path.
- `codexhub-workflow-policy-reviewer`: preserved authority, evidence, audit, and metadata-only constraints.
- `codexhub-contract-designer`: verified existing deferred contract fields were sufficient; no contract change was needed.
- `codexhub-release-auditor`: used for focused verification and final round closeout.

Skills Not Used and Why:

- `codexhub-playwright-qa`: Dashboard was not touched.
- `codexhub-electron-cdp-observer`: Electron/CDP scope remains forbidden.
- `codexhub-browser-profile-observer`: browser/profile/account automation remains forbidden.

## Next Gate

Round 4F.35 may be considered only after this round is committed cleanly. 4F.35 is limited to one controlled CLI-only read-only retry. MVP gate retry remains blocked until a later pilot review confirms a completed attempt with complete evidence, audit, timeline, workspace mutation, and post-run verification metadata.
