# Real Capability Matrix

Status: M49.1 baseline for real capability inventory and boundary convergence.

This matrix is the entry gate for all M50+ real capability work. It converts the
M0-M48 GA governance baseline into a real-capability readiness map without
adding a provider, route, store repository, package, live boundary, or execution
surface.

## Classification Legend

| Classification | Meaning |
| --- | --- |
| `available-readonly` | Existing project code can safely represent or observe metadata-only state without live writes. |
| `available-dry-run` | Existing project code can produce a plan or rehearsal without crossing a live boundary. |
| `missing-real-adapter` | The future capability needs a new adapter, schema family, store family, or control-plane stage before use. |
| `requires-approval` | Any live execution or write/admin action must be store-approved, hash-bound, evidenced, and audited. |
| `forbidden` | The action is not allowed in M49/M50 and needs a later critical-risk milestone to reconsider. |

## Matrix

| Capability | Primary classification | Current project surface | M49/M50 allowed path | Forbidden or blocked path |
| --- | --- | --- | --- | --- |
| Browser | `available-readonly` | Browser profile/readiness models and Playwright observation plans exist; product defaults remain disabled for live observation. | Metadata-only profile registration and localhost/read-only observation planning. Live observation requires explicit enablement and approval. | Cookie/token/session/localStorage/sessionStorage reads, real profile scraping, click/type/submit automation, network body capture, and raw profile path persistence. |
| Electron | `available-readonly` | Electron/CDP target, endpoint, event, and controlled HTTP/WebSocket observation models exist; product defaults remain disabled. | Loopback-only endpoint and target metadata planning with explicit user-enabled state and approval before any future connection. | Electron main inspector, `Runtime.evaluate`, DOM mutation, click/type, generic CDP passthrough, screenshot/body capture, raw endpoint or raw WebSocket URL persistence. |
| Codex App Server | `missing-real-adapter` | Future package is planned in the M49-M60 backlog; existing Codex CLI/control-plane work remains separate. | M54 adapter skeleton after M51 contracts/store. Protocol drift must be verified before live dispatch. | App Server process launch, raw server response persistence, raw prompt persistence, task dispatch, approval write-back, or event ingestion in M49/M50. |
| ChatGPT Business | `missing-real-adapter` | Future read-first adapter is planned for membership, workspace, quota, and admin dry-runs. | M52 skeleton after M51 contracts/store and M53 profile readiness. Observation summaries only. | Invite/remove/replace live admin actions, account credential collection, workspace governance bypass, raw account secret output, or login/MFA automation. |
| Git | `available-dry-run` | Worktree manager has controlled git planning and a disabled-by-default fixed boundary. | Dry-run plans and metadata summaries. Real local git writes require explicit enablement, persisted approval, evidence, and audit. | Arbitrary git command passthrough, generic shell, force cleanup, repo-root mutation by default, push, hosted PR creation, raw command/path/diff persistence. |
| Worktree | `available-dry-run` | Controlled worktree create, diff summary, cleanup planning, and review/RC handoff surfaces exist. | Isolated sibling worktree planning and cleanup handoff through existing governed control planes. | Nested repo worktrees, filesystem delete fallback, force remove, raw diff/body/path output, direct UI/CLI adapter execution. |
| GitHub | `available-dry-run` | Provider surfaces exist for metadata, branch publish, draft PR, PR lifecycle, management, merge, Actions, releases, supersede, and cleanup. Most live gates remain disabled. | Dry-runs, metadata-only summaries, fixed endpoint families, and store-resolved approvals per route family. | Token value storage, arbitrary URL/API passthrough, release publish, unapproved push/PR/merge/cleanup, raw owner/repo/url/body persistence. |
| Approval | `requires-approval` | Approval UX, approval records, store-resolved authority checks, and manual approval paths exist. | Store-resolved, unused, unexpired, hash-bound approvals for write/admin and live-boundary actions. | Request-body approval artifacts, request-body execution authority, auto-approval for high/critical actions, child action authority granted by aggregate approvals. |
| Policy | `available-readonly` | Security kernel is authoritative; policy backend adapter remains advisory. | Local policy decisions, fixture/advisory evaluations, and future policy-source planning. | Policy backend granting execution authority, OPA/Cedar runtime as default, raw policy source output, advisory result replacing approval/evidence/audit. |
| Evidence | `available-readonly` | Evidence refs, metadata collectors, redaction helpers, and store repositories exist. | Metadata/hash-only evidence refs with ids, kinds, hashes, counts, summaries, and timestamps. | Raw prompt/diff/path/body/token/cookie/session/log/trace/database row storage or public return. |
| Audit | `available-readonly` | Audit events, audit chains, evidence linkage, and store repositories exist. | Metadata-only audit events that record actor/action/target/reason, policy decision, evidence refs, live boundary booleans, and outcome. | Audit events that hide live boundary truth, store raw request bodies, omit evidence refs for governed actions, or allow mutable fact-chain replacement. |

## Enablement Order

M50+ work must follow this sequence. A later step cannot claim readiness by
referencing an earlier aggregate milestone alone.

1. M49.1: Real capability matrix and boundary convergence.
2. M49.2: Security boundary document and policy planning note.
3. M50: Supervisor core API control plane with local-control and trusted-origin gates.
4. M51: Unified contracts and store models for accounts, clients, tasks, quota, diagnosis, recovery, evidence, and audit.
5. M52: ChatGPT Business read-first adapter skeleton, disabled by default.
6. M53: Chrome profile registry, login health, workspace identity, and quota readiness.
7. M54: Codex App Server adapter skeleton and protocol drift checks, disabled by default.
8. M55: Codex Desktop, Electron/CDP, and OS observation, read-only and loopback-only.
9. M56-M58: Account/client pools, task orchestration, diagnosis, and recovery.
10. M59-M60: Verification, review package, GitHub PR loop, canaries, drift, and production readiness.

## First Codex Development Task Queue

| Order | Task | Round | Entry gate |
| --- | --- | --- | --- |
| 1 | Supervisor core API surface | M50 | This matrix and `docs/security-boundaries.md` are registered and verified. |
| 2 | Unified contracts and SQLite store models | M51 | M50 read routes and mutation shell gates are verified. |
| 3 | Codex App Server adapter skeleton | M54 | M51 Codex account/client/task contracts and stores exist. |
| 4 | Thread, turn, and event ingestion | M54 | Adapter initialize/account/rate-limit paths pass fixture tests. |
| 5 | Approval bridge | M54 | Codex approval contracts and Approval UX handoff tests exist. |
| 6 | Account pool | M56 | Business, profile, Codex account, quota, and lease contracts exist. |
| 7 | Codex task dispatch | M57 | Scheduler, account/client pool, worktree, policy, and approval preflights exist. |
| 8 | Diagnosis kernel | M58 | Task run, event, quota, process, and observation records are available. |
| 9 | Recovery kernel | M58 | Diagnosis output and dry-run recovery action contracts exist. |
| 10 | Verification, review, and PR loop | M59 | Task completion is evidence-backed and review package contracts are stable. |

## M50 Entry Gate

M50 may begin only when:

- This matrix is registered in scaffold health and orchestration.
- `docs/security-boundaries.md` is registered and reviewed.
- `pnpm scaffold:health`, `pnpm audit:boundaries`,
  `pnpm audit:sqlite-isolation`, `pnpm audit:no-live-automation`, and
  `pnpm audit:skills` pass.
- No new live provider, route, store repository, package, or execution boundary
  was added by M49.1.
