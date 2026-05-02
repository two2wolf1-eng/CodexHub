# Round 4F.18 Approval Authority Readiness Attempt Alignment

## Round

Round 4F.18: Approval Authority Readiness / Attempt Alignment.

## Phase Lock

- Allowed files/directories: approval authority trace contracts, kernel helpers, store repository interfaces, SQLite persistence, Supervisor read-only trace routes and shared resolver use, CLI read-only trace commands, focused tests, and this review document.
- Forbidden files/directories: Dashboard code, Electron/CDP modules, Browser Profile modules, Chrome Profile or ChatGPT Workspace automation, `.codexhub/*`, config, runtime worktree state, and real pilot records.
- Expected tests: focused contracts, `codex-kernel`, `store-sqlite`, Supervisor, CLI, process-boundary audit, no-live audit, and full verification before commit.
- Expected output: one committed remediation round that makes source-prep, prerequisite readiness, CLI input, exact approval lookup, and attempt preflight use one approval authority trace.

## Mini GSD

- Goal: close the split where source-prep/prerequisite readiness accepts an approval artifact while actual attempt preflight rejects it with missing, stale, used, expired, revoked, dry-run hash mismatch, or policy hash mismatch checks.
- Scope: metadata-only approval authority trace model, persisted trace repository, Supervisor trace endpoints, CLI read-only trace commands, shared trace use in source-prep/readiness/attempt preflight, and focused tests.
- Non-scope: no pilot retry, no real adapter attempt, no approval creation, no approval renewal, no approval revocation, no approval consumption, no Dashboard change, no permission expansion, and no raw body/path/output persistence.
- Acceptance criteria: the same exact approval artifact id is traced across source-prep, prerequisite readiness, CLI input, exact store lookup, and attempt preflight; readiness cannot report ready when that trace would fail attempt preflight; fallback/degraded traces never become authority; focused and full verification pass.
- Hard boundaries: Dashboard trigger, `workspace_write`, `danger_full_access`, browser/CDP/Profile/Workspace/account automation, raw prompt/command/stdout/stderr/agent/reasoning bodies, raw argv, executable paths, env plans, and raw worktree paths remain forbidden.
- Affected apps/packages: `packages/contracts`, `packages/codex-kernel`, `packages/store-core`, `packages/store-sqlite`, `apps/supervisor`, and `apps/cli`.
- Risk level: high, because this round changes the approval authority gate before another controlled retry can be considered.

## Skills Used

- Workflow skills: `gsd-spec-driver`, `gstack-delivery-workflow`, and `superpowers-engineering-discipline` were read before implementation for round structure, gated delivery, small-step discipline, and evidence-over-claims closeout.
- Project skills: `codexhub-architecture-planner`, `codexhub-contract-designer`, `codexhub-workflow-policy-reviewer`, `codexhub-codex-exec-adapter`, and `codexhub-release-auditor` were used because this round touched shared contracts, package boundaries, approval policy behavior, adapter preflight, store persistence, CLI/Supervisor readback, and release-audit verification.
- Not used: `codexhub-playwright-qa`, `codexhub-electron-cdp-observer`, and `codexhub-browser-profile-observer`; no Dashboard UI, browser QA, Electron/CDP, Chrome Profile, or ChatGPT Workspace surface was changed.

## Root Cause Class

Round 4F.17 produced an authoritative blocked attempt:

- Attempt id: `codex_real_read_only_adapter_attempt_5ce2ee92-a2e4-4489-b16d-e91971efb681`
- Result error code: `missing_approval`
- Failed check codes: `approval_artifact_exists`, `approval_artifact_valid`, `dry_run_hash_match`, and `policy_hash_match`
- Process boundary invoked: `false`
- Post-run verification status: `not_required`

The safe failure showed another approval authority split. The source-prep/prerequisite path surfaced an approval as valid and unused, but the actual attempt preflight rejected the approval artifact and related dry-run/policy hashes. This round treats that as an authority lineage problem rather than bypassing approval checks.

## Remediation

4F.18 adds a metadata-only approval authority trace:

- Contracts define trace status `aligned`, `blocked`, and `requires_review` plus record, summary, and query schemas.
- Kernel helpers build and summarize traces from the existing approval authority resolver output.
- Store-core and store-sqlite persist trace records in a JSON payload table with save/get/list/latest behavior.
- Supervisor exposes read-only trace endpoints and uses the same trace logic in source-prep, prerequisite readiness, and attempt preflight.
- CLI adds read-only `approval-authority trace|get|list|latest` commands.
- Fallback output is display-only, degraded, not persisted, and cannot be aligned.
- Attempt preflight receives an approval artifact only when the trace is `aligned`.

## Trace Alignment Rules

An approval trace is `aligned` only when all of these are true:

- Supervisor/store authority is available, persisted, non-degraded, and non-fallback.
- CLI/input approval artifact id exactly matches the resolved approval artifact id.
- Source-prep approval artifact id matches the resolved artifact id when present.
- Prerequisite approval artifact id matches the resolved artifact id when present.
- The approval is approved, unused, not revoked, and not expired.
- The dry-run plan hash matches the current dry-run plan.
- The policy decision hash matches the latest aligned pilot policy source.

Any missing, stale, used, revoked, expired, or mismatched approval state produces a stable blocked trace reason code and keeps attempt preflight closed.

## Metadata-Only Review

- Approval trace records store ids, hashes, booleans, statuses, timestamps, reason codes, evidence refs, audit event ids, and summaries only.
- Raw prompt body is not stored.
- Raw command body is not stored.
- Raw stdout/stderr bodies are not stored.
- Raw agent or reasoning bodies are not stored.
- Raw argv, executable paths, env plans, and raw absolute worktree paths are not stored.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Contract shape | `pnpm nx test contracts` | 24 tests passed; trace record/summary/query parse and metadata-only assertions pass | Contract accepted |
| Kernel trace classification | `pnpm nx test codex-kernel` | 77 tests passed; aligned and stale trace classifications pass | Kernel accepted |
| Store persistence | `pnpm nx test store-sqlite` | 1 test passed after adding the idempotent trace table migration | Store accepted |
| Supervisor consistency | `pnpm nx test supervisor` | 9 tests passed; source-prep, prerequisite, and attempt paths share trace authority in focused fixtures | Supervisor accepted |
| CLI fallback boundary | `pnpm nx test cli` | 24 tests passed; CLI passes approval id unchanged and fallback cannot create authority | CLI accepted |
| Process boundary isolation | `pnpm tsx tools/audit-real-adapter-boundary.ts` | Audit passed; process boundary remains isolated to the approved module | Boundary accepted |
| Foundation verification | `pnpm verify:foundation` | Scaffold health, audits, and Nx lint/test/build passed | Round verification accepted |
| Full Nx verification | `cmd /c pnpm nx run-many -t lint,test,build` | Lint, test, and build passed for 16 projects | Full verification accepted |
| Diff hygiene | `git diff --check` | No whitespace errors reported | Diff accepted |

## Safety Boundary Confirmation

- No pilot was run in 4F.18.
- No real adapter attempt was invoked in 4F.18.
- No approval artifact was created, renewed, revoked, consumed, or marked used outside test fixtures.
- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- Broader autonomous use remains forbidden.

## Round Decision

Outcome: `approval_authority_readiness_attempt_aligned`.

Round 4F.19 may be considered after this commit if verification passes and git is clean. 4F.19 may run exactly one controlled CLI-only read-only retry. 4G.9 and 4H.6 remain blocked until 4F.19 produces an authoritative retry result and a later review accepts it.
