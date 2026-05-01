# Round 4F.14 Boundary Failure Diagnostics Remediation

## Round

Round 4F.14: Boundary Failure Diagnostics / Remediation.

## Phase Lock

- Allowed changes: contracts, codex-kernel, Supervisor, CLI, store-sqlite tests, and this review document.
- Forbidden changes: Dashboard, config enablement, approval state mutation, runtime worktree state, browser/CDP/Profile/Workspace automation, and any new process boundary module.
- Pilot status: no pilot was run in 4F.14.
- Adapter attempt status: no real adapter attempt was invoked in 4F.14.

## Mini GSD

- Goal: make future boundary-invoked failed attempts diagnosable through persisted metadata-only attempt/latest/timeline readback.
- Scope: add explicit post-run verification skip reason, preserve complete boundary diagnostics through attempt records, summaries, timelines, Supervisor readback, CLI output, and SQLite persistence tests.
- Non-scope: no retry, no process-boundary expansion, no raw output persistence, no Dashboard trigger, no workspace write, no danger full access, and no MVP approval.
- Acceptance criteria: focused contract/kernel/store/Supervisor/CLI tests pass; audits remain clean; readback tests prove failed boundary diagnostics include failure code, exit/signal, duration, timeout/cancel, stdout/stderr hashes, byte counts, line counts, truncation flags, and skip reason.
- Hard boundaries: raw prompt, command, stdout, stderr, argv, executable path, env plan, agent/reasoning body, and raw worktree path remain unpersisted.
- Affected apps/packages: `packages/contracts`, `packages/codex-kernel`, `packages/store-sqlite`, `apps/supervisor`, and `apps/cli`.
- Risk level: medium; this changes metadata contracts and readback behavior for the real read-only adapter control plane, but does not run a pilot.

## Root Cause Class

4F.13 produced authoritative persisted attempt `codex_real_read_only_adapter_attempt_8209e010-dbf8-43bc-bf05-c7f998d1be75` with `processBoundaryInvoked=true`, `status=failed`, and `postRunVerificationStatus=skipped`. 4G.6 confirmed the readback was metadata-only and safe, but it lacked complete attempt-level boundary diagnostics.

The remediation does not rewrite the historical 4F.13 record. Instead it closes the future-record gap by making diagnostic readback explicit and covered by tests.

## Changes

- Added `postRunVerificationSkipReason` with value `attempt_not_completed` to attempt record, summary, and timeline contracts.
- Extended attempt metadata hashing and summaries to include complete boundary diagnostic metadata, including output hashes and counts.
- Normalized Supervisor attempt telemetry so skipped post-run verification is recorded as `skipped` with reason `attempt_not_completed`, instead of only surfacing the nested aborted verification result.
- Expanded CLI human output for failed boundary attempts with signal, stdout/stderr byte counts, line counts, truncation flags, and post-run skip reason.
- Added persistence/readback tests proving failed boundary diagnostics survive SQLite save/get/list/latest behavior and Supervisor get/latest/timeline readback.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Latest governance input | `4ab1edf docs: add pilot review after approval alignment` | 4G.6 recorded boundary release blocker | 4F.14 allowed |
| Historical 4F.13 attempt | CLI readback before remediation | Boundary invoked, failed, post-run verification skipped, diagnostics incomplete | Historical blocker preserved |
| Contract shape | Contract tests | Skip reason and metadata-only diagnostics parse without raw fields | Contract accepted |
| Kernel record creation | Codex-kernel tests | Failed/aborted boundary records include diagnostics and skip reason | Creator accepted |
| Supervisor readback | Supervisor tests | POST response, get, latest, and timeline expose metadata-only diagnostics | Readback accepted |
| SQLite persistence | Store tests | Failed attempt diagnostics persist through save/get/list | Persistence accepted |
| CLI output | CLI tests | Human output includes metadata-only diagnostic fields and no raw bodies | CLI accepted |
| Safety boundaries | Audits | No-live and process-boundary audits must pass before commit | Boundary required |

## Outcome

`boundary_diagnostics_remediated_for_future_attempts`

4F.14 does not convert 4F.13 into a successful pilot. It prepares the next retry to produce complete metadata-only diagnostics if the boundary fails again.

## Next Round

Next allowed round: `Round 4F.15: Pilot Retry After Boundary Diagnostics Remediation`.

4H.5 remains blocked until a later pilot attempt completes, workspace mutation check is clean, post-run verification completes, evidence/audit/timeline are complete, and 4G.7 review finds no release blocker.

## Safety Boundary Confirmation

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- Raw stdout/stderr, prompt, command, argv, executable path, env plan, agent/reasoning body, and raw worktree path remain unpersisted.
- Broader autonomous use remains forbidden unless future governance approves it.
