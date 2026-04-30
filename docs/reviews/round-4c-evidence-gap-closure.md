# Round 4C Evidence Gap Closure / Hardening

## Status

Round 4C closes the Round 4B evidence gap at the control-plane record level. It does not approve continued local use, a pilot, broader automation, Dashboard triggering, `workspace_write`, or `danger_full_access`.

Outcome: `evidence_gap_closed`, contingent on the verification commands recorded for this round remaining green.

Round 4B.1 is still required before continued limited local use can be considered.

## 4B Gap

Round 4B recorded `no_go_for_continued_use` because the adapter implementation had guarded, fail-closed CLI behavior but lacked an authoritative Supervisor-backed attempt record path and structured attempt evidence. CLI fallback also needed to remain unable to create a record that looked authoritative.

## 4C Changes

| Area | Evidence | Result |
| --- | --- | --- |
| Contracts | `CodexExecRealReadOnlyAdapterAttemptRecord`, summary, query, evidence summary, audit summary | Metadata-only attempt records are part of shared contracts. |
| Kernel | `createRealReadOnlyAdapterAttemptRecord`, summarize/list/latest helpers | Records can be built from preflight, boundary result, evidence refs, and audit events. |
| Store | `CodexExecRealReadOnlyAdapterAttemptRepository` and SQLite JSON payload table | Attempt records can be saved, read, listed, and queried by latest dry-run id. |
| Supervisor | `/api/codex/exec/real-read-only-adapter/attempt*` routes | Store-backed blocked attempts are authoritative; missing store returns degraded/not persisted. |
| CLI | `real-read-only-adapter attempts get/list/latest` | Read-only query fallback is degraded and cannot create records. |
| Boundary audit | `tools/audit-real-adapter-boundary.ts` | The process boundary remains isolated to the approved kernel module. |

## Authoritative Attempt Semantics

An authoritative attempt record requires Supervisor and a writable governance store. Default-disabled or missing-gate attempts can be recorded as `blocked` when the store is available. Store-unavailable responses must be `degraded=true` and `notPersisted=true`; they are not authoritative.

The CLI cannot create an authoritative local attempt fallback. If Supervisor is unavailable, actual attempts remain blocked and read-only query fallbacks are display-only.

## Attempt Statuses

- `blocked`: stopped before boundary planning or before boundary invocation.
- `completed`: produced only from an approved boundary result and recorded as metadata.
- `failed`: records boundary or verification failure metadata.
- `aborted`: records timeout/cancel/abort metadata.

Completed, failed, and aborted paths are covered with injected/fake runners in tests. Round 4C does not run a pilot and does not grant continued use.

## Metadata-only Evidence

Attempt records persist hashes, counts, timestamps, status, ref ids, and summaries only. They do not persist raw prompt body, raw command body, raw stdout/stderr body, agent message body, reasoning body, raw worktree path, executable path, shell snippet, argv array, or environment plan.

## Safety Boundary

The following remain forbidden:

- Dashboard trigger or run/start/live/execute controls.
- `workspace_write`.
- `danger_full_access`.
- Browser/CDP/Profile/Workspace automation.
- Account, session, token, cookie, or MFA automation.
- Raw body persistence.
- Arbitrary argv passthrough or shell-string execution.
- Continued limited local use without a 4B.1 retry review.

## Review Decision

Round 4C may close the evidence gap, but it cannot overturn Round 4B. The next required governance step is Round 4B.1, which must review the new attempt evidence and decide either `no_go_for_continued_use` or `conditional_go_for_limited_local_use`.

This document is not implementation approval and does not authorize a pilot.
