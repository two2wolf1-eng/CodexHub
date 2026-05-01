# Round 4F.12 Approval Freshness Alignment

## Round

Round 4F.12: Approval Freshness / Attempt Preflight Alignment.

## Phase Lock

- Allowed files/directories: approval authority contracts, store repository interfaces, SQLite approval lookup, Supervisor approval authority resolver, focused tests, and this review document.
- Forbidden files/directories: Dashboard code, Electron/CDP modules, Browser Profile modules, Chrome Profile or ChatGPT Workspace automation, `.codexhub/*`, and real pilot records.
- Expected tests: focused contracts, `codex-kernel`, `store-sqlite`, Supervisor, CLI, boundary audit, no-live audit, and full verification before commit.
- Expected output: one committed remediation round that aligns source-prep, prerequisite readiness, and attempt preflight on the same approval authority path.

## Mini GSD

- Goal: remove the split where readiness/source-prep accepted an approval artifact while actual attempt preflight reported missing or mismatched approval.
- Scope: exact approval artifact lookup, metadata-only approval authority summary, shared Supervisor-backed resolver, focused tests, and governance review.
- Non-scope: no pilot, no real adapter attempt, no approval creation, no approval consumption, no Dashboard change, no permission expansion, and no raw body/path persistence.
- Acceptance criteria: source-prep, prerequisite readiness, and attempt preflight resolve the same valid approval by exact artifact id; stale, missing, expired, revoked, used, dry-run hash mismatch, and policy hash mismatch fail closed; verification passes.
- Hard boundaries: Dashboard trigger, `workspace_write`, `danger_full_access`, browser/CDP/Profile/Workspace/account automation, raw prompt/command/stdout/stderr/agent/reasoning bodies, raw argv, executable paths, env plans, and raw worktree paths remain forbidden.
- Affected apps/packages: `packages/contracts`, `packages/store-core`, `packages/store-sqlite`, `apps/supervisor`, and focused tests.
- Risk level: high, because this is a gate alignment change before the next controlled retry.

## Skills Used

- Workflow skills: `gsd-spec-driver`, `gstack-delivery-workflow`, and `superpowers-engineering-discipline` were read before implementation for round structure, gated delivery, and evidence-over-claims discipline.
- Project skills: `codexhub-architecture-planner`, `codexhub-contract-designer`, `codexhub-workflow-policy-reviewer`, `codexhub-codex-exec-adapter`, and `codexhub-release-auditor` were used because this round touched shared contracts, store boundaries, approval policy behavior, adapter attempt preflight, and closeout verification.
- Not used: `codexhub-playwright-qa`, `codexhub-electron-cdp-observer`, and `codexhub-browser-profile-observer`; no Dashboard UI, browser QA, Electron/CDP, Chrome Profile, or ChatGPT Workspace surface was changed.

## Root Cause Class

Round 4F.11 produced an authoritative blocked attempt:

- Attempt id: `codex_real_read_only_adapter_attempt_d82a5461-c3c0-45d3-8afa-4445bc5ec191`
- Result error code: `missing_approval`
- Failed check codes: `approval_artifact_exists`, `approval_artifact_valid`, `dry_run_hash_match`, `policy_hash_match`
- Process boundary invoked: `false`

The safe failure showed the same source class as earlier config, policy, and worktree alignment issues: readiness/source-prep and actual attempt preflight did not rely on one approval authority resolver. The older path used list/filter behavior for dry-run approvals, while the attempt path could fail to find or accept the artifact by exact id and current hash expectations.

## Remediation

4F.12 adds a single Supervisor-backed approval authority path:

- Store-core now exposes exact approval artifact lookup plus dry-run-scoped listing.
- Store-sqlite implements exact artifact lookup without relying on limited generic list results.
- Contracts include `CodexExecRealReadOnlyAdapterApprovalAuthoritySummary`, which stores only ids, hashes, statuses, timestamps, match flags, and reason codes.
- Supervisor source-preparation, prerequisite readiness, and attempt preflight call the same resolver.
- The resolver requires the requested approval artifact id and fails closed when it is missing.
- The resolver validates artifact existence, exact id, approval status, unused state, revoked state, expiry, dry-run binding, dry-run hash match, and latest aligned policy hash match.
- Attempt metadata now records stable approval authority diagnosis fields without raw bodies, paths, argv, executable paths, or env plans.

## Fail-Closed Outcomes

The shared resolver blocks or marks unresolved approval authority for:

- missing artifact id or missing artifact record
- artifact id mismatch
- approval status not approved
- revoked approval
- used approval
- expired approval
- dry-run mismatch
- dry-run plan hash mismatch
- policy decision hash mismatch

Source-prep and prerequisite readiness cannot become ready through an approval artifact that attempt preflight would reject.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Contract shape | `pnpm nx test contracts` | Approval authority schema parses and metadata-only assertions pass | Contract accepted |
| Kernel guard baseline | `pnpm nx test codex-kernel` | Existing approval/hash guard tests remain passing | Kernel behavior preserved |
| Exact store lookup | `pnpm nx test store-sqlite` | Approval lookup by artifact id and dry-run scoped list pass | Store path accepted |
| Source-prep/readiness/attempt consistency | `pnpm nx test supervisor` | Valid exact artifact remains ready/passed; unrelated artifact is blocked before ready | Authority alignment accepted |
| CLI pass-through and fallback boundary | `pnpm nx test cli` | Approval id pass-through and fallback non-authority tests pass | CLI behavior preserved |
| Process boundary isolation | `pnpm tsx tools/audit-real-adapter-boundary.ts` | Boundary remains isolated to the approved module | Boundary accepted |

## Metadata-Only Review

- Approval diagnosis stores ids, hashes, statuses, checked timestamps, expiry timestamps, and match booleans only.
- Raw prompt body is not stored.
- Raw command body is not stored.
- Raw stdout/stderr bodies are not stored.
- Raw agent or reasoning bodies are not stored.
- Raw argv, executable paths, env plans, and raw absolute worktree paths are not stored.

## Safety Boundary Confirmation

- No pilot was run in 4F.12.
- No real adapter attempt was invoked in 4F.12.
- No approval artifact was created, renewed, revoked, consumed, or marked used outside test fixtures.
- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- Broader autonomous use remains forbidden.

## Round Decision

Outcome: `approval_authority_aligned`.

Round 4F.13 may be considered after this commit if the worktree is clean and verification passes. 4F.13 may run exactly one controlled CLI-only read-only retry. 4G.6 and 4H.5 remain blocked until 4F.13 produces an authoritative retry result and a later review accepts it.
