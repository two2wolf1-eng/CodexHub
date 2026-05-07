# Real Capability Codex Development Backlog

Status: planning queue after M48 GA governance baseline.

This backlog turns the real-capability roadmap for ChatGPT Business, Chrome profiles,
Codex Desktop, Codex App Server, workflow governance, worktrees, GitHub delivery,
diagnosis, recovery, and canary operations into CodexHub development tasks.

The completed M0-M48 sequence remains the governance baseline. To avoid milestone
collisions, the user-provided reference milestones M0-M12 are mapped to future
CodexHub milestones M49-M60.

References to verify at implementation time:

- Codex App Server protocol: https://github.com/openai/codex/blob/main/codex-rs/app-server/README.md
- Codex App product workflow context: https://openai.com/index/introducing-the-codex-app/

## Round Spec

Goal:

- Create a complete downstream Codex development queue for real ChatGPT Business
  and Codex Desktop automation.
- Keep the queue executable by future Codex rounds while preserving the M0-M48
  governance model.

Scope:

- Documentation and registration only.
- Define future milestones, issues, acceptance criteria, safety boundaries, and
  sequencing rules.
- Register the planning queue in orchestration, integrations, and scaffold health.

Non-scope:

- No live ChatGPT Business adapter.
- No live Chrome profile connection.
- No Codex App Server process launch.
- No Codex Desktop or Electron connection.
- No new Supervisor route, provider, store repository, or live boundary.
- No token, cookie, session, MFA, account credential, raw prompt, raw diff, raw
  event, raw path, or raw body collection.

Risk level: critical, because the backlog plans future real account, browser,
Codex, worktree, GitHub, and recovery actions.

## Hard Safety Boundaries

All future tasks in this backlog must preserve these rules unless a later
human-approved milestone explicitly changes the boundary and updates audits.

| Boundary | Rule |
| --- | --- |
| Governance authority | CodexHub security, workflow, approval, evidence, and audit remain authoritative. Capability providers are never authority providers. |
| Sensitive values | Do not collect, store, print, or return token, cookie, session, MFA, password, private key, raw env, account secret, or credential values. |
| Browser profiles | Chrome profile work starts as registration and read-only health. No cookie/session extraction and no click/type automation by default. |
| Electron/CDP | Electron observation starts read-only and loopback-only. Runtime.evaluate and main inspector writes require a later critical approval surface. |
| Codex App Server | Verify protocol locally before live use. Store summaries, ids, hashes, counts, statuses, and evidence refs only. |
| ChatGPT Business | Membership and quota observation are read-first. Invite/remove/replace are admin actions and require dry-run, approval, evidence, and audit. |
| Task prompts | Raw instructions are transient and hash-bound. Public and store output use prompt hash, length, and summary only. |
| Worktrees | Real coding tasks use governed isolated sibling worktrees. Repo-root mutation is blocked by default. |
| Recovery | Recovery actions are dry-run first. Restart, interrupt, terminal cleanup, login recovery, and task transfer require policy and approval by risk. |
| GitHub delivery | Branch publish and draft PR stay dry-run and approval gated. No push, PR, merge, release, or cleanup bypass. |
| Drift | Protocol, UI, browser profile, and adapter drift must block live execution until reviewed. |

## Milestone Map

| Future milestone | Reference milestone | Purpose |
| --- | --- | --- |
| M49 | Reference M0 | Capability inventory and safety boundary convergence. |
| M50 | Reference M1 | Supervisor real API control-plane foundation. |
| M51 | Reference M2 | Unified contracts and store models for accounts, clients, tasks, quota, diagnosis, recovery, evidence, and audit. |
| M52 | Reference M3 | ChatGPT Business adapter planning and read-first implementation. |
| M53 | Reference M4 | Chrome profile registry, login health, workspace identity, and quota readiness. |
| M54 | Reference M5 | Codex App Server adapter for initialize, account, rate limits, threads, turns, events, approvals, and drift. |
| M55 | Reference M6 | Codex Desktop, Electron/CDP, and OS process observation. |
| M56 | Reference M7 | Account pool, client pool, leases, and scheduler integration. |
| M57 | Reference M8 | Codex task intent, dispatch, event monitoring, and worktree integration. |
| M58 | Reference M9 and M10 | Diagnosis and recovery engines. |
| M59 | Reference M11 | Verification, review package, branch publish, draft PR, and CI feedback loop. |
| M60 | Reference M12 | Production readiness, canary, protocol drift, UI drift, and audit closeout. |

## M49: Capability Inventory And Boundary Convergence

Goal:

- Convert the current GA capability matrix into a real-capability readiness map.

Deliverables:

- `docs/real-capability-matrix.md`
- `docs/security-boundaries.md`
- Policy planning note for `packages/security-kernel/src/real-capability-policy.ts`
- M49.1 release, review, and runbook:
  - `docs/releases/m49.1-real-capability-boundary-convergence.md`
  - `docs/reviews/m49.1-real-capability-boundary-convergence-review.md`
  - `docs/runbooks/m49.1-real-capability-boundary-convergence-runbook.md`

Tasks:

| Task | Scope | Acceptance |
| --- | --- | --- |
| M49.1 Real capability matrix | Classify Browser, Electron, Codex App Server, ChatGPT Business, Git, Worktree, GitHub, Approval, Policy, Evidence, Audit. | Each capability is one of `available-readonly`, `available-dry-run`, `missing-real-adapter`, `requires-approval`, or `forbidden`. |
| M49.2 Safety boundary convergence | Define read, dry-run, write, admin, approval, evidence, audit, and default-disabled rules. | Every future real adapter has a documented policy gate and sensitive-output prohibition. |
| M49.3 Implementation queue validation | Convert this backlog into issue-ready tasks. | P0/P1 issues have scope, non-scope, acceptance, and verification gates. |

M49.1 status:

- Complete as a documentation and registration-only hardening round.
- `docs/real-capability-matrix.md` is the M50 entry matrix.
- `docs/security-boundaries.md` is the M50 route and sensitive-output boundary.
- M50 may begin with Supervisor control-plane shells only; live adapters remain
  out of scope.

Non-scope:

- No live browser, ChatGPT, Codex, or GitHub operation.

## M50: Supervisor Real API Control Plane

Goal:

- Make Supervisor the local API control plane for real capability coordination.

Planned routes:

| Route | Mode | Purpose |
| --- | --- | --- |
| `GET /health` | read | Supervisor, store, policy, workflow health. |
| `GET /capabilities` | read | Real capability matrix and blockers. |
| `GET /workflows` | read | Workflow catalog. |
| `POST /workflows/:id/dry-run` | dry-run | Workflow dry-run planning. |
| `POST /approvals/:id/decision` | write | Approval decision path. |
| `GET /accounts` | read | Account pool projection. |
| `GET /clients` | read | Codex client pool projection. |
| `GET /tasks` | read | Codex task list. |
| `POST /tasks` | write | Create governed task intent. |
| `GET /tasks/:id` | read | Task detail. |
| `POST /tasks/:id/recover` | write | Recovery dry-run or approved action entry. |
| `GET /evidence/:id` | read | Metadata-only evidence summary. |
| `GET /audit` | read | Metadata-only audit query. |

Tasks:

| Task | Scope | Acceptance |
| --- | --- | --- |
| M50.1 Supervisor server skeleton | `apps/supervisor/src/server.ts`, route modules, context. | Build and tests pass; `GET /health` works. |
| M50.2 Route gate layer | Local-control token, trusted loopback origin, CORS, authority rejection. | All mutating routes reject missing/bad token, malicious origin, and request-body authority. |
| M50.3 Core read routes | Health, capabilities, workflows, evidence, audit. | Responses are metadata/hash-only and schema-validated. |
| M50.4 Core mutation shells | Workflow dry-run, approval decision, task create, task recover. | Mutations create audit events and never trust request-body approval artifacts. |

M50.1 status:

- Complete as a Supervisor read-control-plane round.
- Added root-level `GET /capabilities`, `GET /accounts`, `GET /clients`,
  `GET /tasks`, `GET /workflows`, `GET /approvals`, `GET /evidence`,
  `GET /evidence/:id`, `GET /audit`, and `GET /audit/:id`.
- Account, client, and task routes intentionally return
  `missing-contracts-store` until M51 contracts and stores exist.
- Release, review, and runbook:
  - `docs/releases/m50.1-supervisor-core-read-control-plane.md`
  - `docs/reviews/m50.1-supervisor-core-read-control-plane-review.md`
  - `docs/runbooks/m50.1-supervisor-core-read-control-plane-runbook.md`

M50.2 status:

- Complete as a Supervisor route-gate hardening round.
- Added POST/OPTIONS trusted Host validation to the existing local-control and
  trusted-Origin guard.
- Added tests for malicious Host rejection, trusted loopback Host acceptance,
  and malicious preflight Host rejection.
- Release, review, and runbook:
  - `docs/releases/m50.2-supervisor-route-gate-hardening.md`
  - `docs/reviews/m50.2-supervisor-route-gate-hardening-review.md`
  - `docs/runbooks/m50.2-supervisor-route-gate-hardening-runbook.md`

Non-scope:

- No direct adapter execution from routes.
- No real Codex App Server process launch.

## M51: Unified Contracts And Store

Goal:

- Create the shared data language and persistence layer for Business accounts,
  Chrome profiles, Codex App Server sessions, clients, quotas, tasks, diagnosis,
  recovery, evidence, and audit.

Contract families:

- `BusinessWorkspace`
- `BusinessMembershipMirror`
- `ChromeProfileBinding`
- `ChatGptSessionHealth`
- `BusinessQuotaSnapshot`
- `CodexClientInstance`
- `CodexAppServerSession`
- `CodexAccountBinding`
- `CodexRateLimitSnapshot`
- `UnifiedQuotaSnapshot`
- `CodexProjectBinding`
- `CodexThreadMirror`
- `CodexTurnMirror`
- `CodexItemMirror`
- `CodexTaskIntent`
- `CodexTaskRun`
- `CodexTaskDiagnosis`
- `CodexRecoveryRun`
- `AccountPoolEntry`
- `ClientPoolEntry`
- `AccountPoolLease`
- `ClientPoolLease`
- `WorktreeLease`
- `CodexEvidenceBundle`

Store families:

- Business workspaces, membership mirrors, profile bindings, session health,
  quota snapshots.
- Codex clients, app-server sessions, account bindings, rate limits, unified
  quota snapshots.
- Project, thread, turn, item, task, diagnosis, recovery records.
- Account pool entries, client pool entries, leases, evidence refs, audit
  events, approval artifacts.

Acceptance:

- Every shared schema has `schemaVersion`.
- Store save/list/get round trips preserve ids, hashes, statuses, evidence refs,
  audit ids, and timestamps.
- Sensitive fields are rejected, redacted, or hash-only.
- SQLite migrations are idempotent.

## M52: ChatGPT Business Adapter

Goal:

- Introduce a read-first ChatGPT Business adapter for workspace, membership,
  session health, quota, and later admin workflows.

Planned package:

- `packages/chatgpt-business-adapter`

Capabilities:

| Capability | Mode | Default |
| --- | --- | --- |
| Membership page observation | read | disabled until profile readiness exists |
| Quota page observation | read | disabled until profile readiness exists |
| Workspace identity check | read | disabled until profile readiness exists |
| Login state check | read | disabled until profile readiness exists |
| Invite dry-run | dry-run | disabled |
| Invite live | write + approval | disabled |
| Remove dry-run | dry-run | disabled |
| Remove live | admin + approval | disabled |
| Replace dry-run | dry-run | disabled |
| Replace live | admin + approval | disabled |

Tasks:

| Task | Scope | Acceptance |
| --- | --- | --- |
| M52.1 Adapter skeleton | Manifest, readiness, dry-run, evidence, audit placeholders. | No live profile or account operation. |
| M52.2 Membership sync | Generate `BusinessMembershipMirror` from approved observation summaries. | Owner/admin/member and active/pending/removed states are represented without raw account secrets. |
| M52.3 Business quota snapshot | Generate `BusinessQuotaSnapshot`. | Single-account failures are isolated; all-account failure fails the run. |
| M52.4 Admin workflow planning | Invite/remove/replace dry-run contracts and approval artifacts. | Live admin operations remain disabled and owner protection is default-on. |

## M53: Chrome Profile, Login Health, Workspace, And Quota

Goal:

- Register real Chrome profiles as governed resources while preserving
  read-only defaults.

Tasks:

| Task | Scope | Acceptance |
| --- | --- | --- |
| M53.1 Chrome profile registry | Register/list/readiness/lock/unlock/profile health. | Profile path is hash-only; no cookie/token/session reads. |
| M53.2 ChatGPT login health | `healthy`, logged-out, wrong account, workspace mismatch, 2FA/captcha, unknown auth states. | Wrong account and uncertain workspace block task dispatch. |
| M53.3 Login recovery workflow planning | Human checkpoint model for 2FA, captcha, passkey, or manual account selection. | No password, code, token, or session is logged. |
| M53.4 Workspace/quota cross-check | Browser-side Business quota and workspace identity readiness. | Quota ambiguity blocks live dispatch instead of fabricating reset windows. |

## M54: Codex App Server Adapter

Goal:

- Add a real Codex App Server adapter with strict protocol, transport, schema,
  and no-raw-output rules.

Planned package:

- `packages/codex-app-server-adapter`

Initial modules:

- transport
- initialize
- account
- rate-limits
- thread
- turn
- events
- approvals
- interrupt
- background-terminals
- schema-drift

Tasks:

| Task | Scope | Acceptance |
| --- | --- | --- |
| M54.1 Transport and initialize | Stdio transport and initialize handshake. | Calls before initialize fail as `not_initialized`; request/response schemas validate. |
| M54.2 Account and rate limits | `account/read`, `account/rateLimits/read`, login start planning. | Generates `CodexAccountBinding` and `CodexRateLimitSnapshot`; mismatch with Business account blocks dispatch. |
| M54.3 Thread, turn, events | `thread/start`, `thread/resume`, `thread/fork`, `turn/start`, event ingestion. | Mirrors thread, turn, item, token usage summaries without raw prompt persistence. |
| M54.4 Approval bridge | Convert command/file approval requests to CodexHub approvals and write decisions back. | High/critical requests cannot auto-approve; full audit chain exists. |
| M54.5 Protocol drift | Generate schema drift reports from local Codex version. | Incompatible drift blocks live task dispatch. |

## M55: Codex Desktop, Electron, And OS Observation

Goal:

- Observe Codex Desktop and related local processes without expanding write
  surfaces.

Tasks:

| Task | Scope | Acceptance |
| --- | --- | --- |
| M55.1 Electron CDP read-only observation | Discover Electron processes/endpoints/targets, collect console and network metadata summaries. | Loopback-only; Runtime.evaluate, DOM mutation, click/type, and network body reads remain forbidden. |
| M55.2 OS process observer | Process tree, health, CPU/memory/duration/exit summaries. | Full command lines are not stored; only hashes and classified summaries. |
| M55.3 Desktop/App Server reconciliation | Compare UI metadata, App Server health, auth state, quota state, and process state. | Produces `desktop_ui_frozen`, `app_server_unresponsive`, `codex_logged_out`, or `quota_depleted` diagnosis hints. |

## M56: Account Pool, Client Pool, Scheduler

Goal:

- Coordinate Business accounts, Chrome profiles, Codex accounts, clients,
  worktrees, and quotas through leases and scheduler constraints.

Tasks:

| Task | Scope | Acceptance |
| --- | --- | --- |
| M56.1 Account pool kernel | Score accounts using membership, seat, session, workspace, Business quota, Codex binding, Codex rate limit, failures, active leases, manual disable. | Only `account_ready` accounts can be scheduled. |
| M56.2 Client pool kernel | Score desktop and App Server clients. | Only `client_ready` clients can receive tasks; protocol mismatch blocks dispatch. |
| M56.3 Scheduler fusion | Account lease, client lease, profile lock, thread lock, worktree lock, repo branch lock, quota guard, policy, approval. | No account, App Server, thread, or worktree conflict under concurrent scheduling. |

## M57: Codex Task Orchestrator

Goal:

- Dispatch real development tasks through Codex App Server under CodexHub
  governance.

Tasks:

| Task | Scope | Acceptance |
| --- | --- | --- |
| M57.1 `CodexTaskIntent` standardization | Task id, title, instruction hash, repo target, risk, expected output, verification, selection policies. | Raw prompt is transient; idempotency and duplicate detection exist. |
| M57.2 Real task dispatch | Account/client/quota/project/worktree preflight, policy dry-run, approval, thread/turn start, event subscription. | Generates `CodexTaskRun` with account, client, thread, turn, and worktree refs; failures enter diagnosis. |
| M57.3 Worktree integration | Governed isolated worktree selection or creation, diff collection, cleanup handoff. | Task writes do not touch repo root by default. |

## M58: Diagnosis And Recovery

Goal:

- Diagnose why Codex tasks stop and choose governed recovery actions.

Diagnosis types:

- completed
- completed_with_no_diff
- completed_with_diff
- waiting_approval
- waiting_user_input
- waiting_rate_limit_reset
- failed_quota
- failed_auth
- failed_workspace
- failed_permission
- failed_tool
- failed_network
- failed_environment
- model_stalled
- tool_stuck
- process_hung
- app_server_unresponsive
- desktop_ui_frozen
- protocol_drift
- unknown
- needs_manual_review

Recovery actions:

- wait
- request_human_approval
- resume_after_approval
- login_recover
- quota_wait
- switch_account
- reconnect_app_server
- restart_app_server
- restart_desktop
- interrupt_turn
- clean_background_terminals
- resume_thread
- fork_thread
- transfer_task
- rollback_worktree
- manual_review

Tasks:

| Task | Scope | Acceptance |
| --- | --- | --- |
| M58.1 Diagnosis kernel | App Server events, rate limits, Business quota, Desktop observation, process, git signals. | Every task run can produce a diagnosis with evidence refs. |
| M58.2 Quota diagnosis | Business quota and Codex rate-limit reconciliation. | Rate-limit reached type wins; conflicts become `quota_mismatch`; reset windows create wait state. |
| M58.3 Stuck/hung diagnosis | Event stream inactivity, process state, command item state, App Server ping, UI observation. | Distinguishes model stalled, tool stuck, app server unresponsive, desktop frozen, process leak. |
| M58.4 Recovery kernel | Dry-run and governed action selection. | High-risk recovery requires approval; recovery re-diagnoses after execution. |
| M58.5 Login, interrupt, terminal cleanup recovery | Codex login recovery, turn interrupt, background terminal clean. | 2FA/captcha/passkey create human checkpoints; terminal cleanup requires explicit approval. |

## M59: Verification, Review Package, And GitHub PR Loop

Goal:

- Close the loop from Codex task completion to diff validation and draft PR.

Tasks:

| Task | Scope | Acceptance |
| --- | --- | --- |
| M59.1 Task result acceptance | Diff, changed files, test/lint/build, final message, expected output. | Turn completed is not enough; verification failure changes task status. |
| M59.2 Review package generation | Task summary, account/client/thread/turn summary, diff summary, verification, approvals, diagnosis, evidence, audit. | Package is metadata-only and excludes raw secret, token, session, or credential data. |
| M59.3 Branch publish and draft PR | Dry-run, approval, branch publish, draft PR body from review package, CI status linkback. | Live PR creation requires approval; remote cleanup remains governed. |

## M60: Production Readiness, Canary, Drift, Audit

Goal:

- Make real capability operation durable, observable, and drift-resistant.

Tasks:

| Task | Scope | Acceptance |
| --- | --- | --- |
| M60.1 Codex App Server protocol drift | Generate local TS/JSON schema, diff methods/events, version mapping, replay fixtures. | Incompatible schema blocks live dispatch until reviewed. |
| M60.2 Desktop UI/Electron drift | Target title/url hash, console/network metadata anomaly, UI/App Server conflict. | Drift enters diagnosis without Runtime.evaluate or DOM mutation. |
| M60.3 Canary tasks | Account, quota, login, App Server, thread/turn, approval, worktree, draft PR canaries. | Canary failure blocks high-risk live tasks. |
| M60.4 Production readiness closeout | Audit export, sensitive redaction tests, operator dashboard, runbooks, E2E rehearsal. | Full gates pass and residual risks are documented. |

## Issue Backlog

### P0: Foundation For Real Capability

| Issue | Title | Target milestone |
| --- | --- | --- |
| P0-001 | Implement Supervisor Fastify server and core routes | M50 |
| P0-002 | Add real capability matrix and security boundary docs | M49 |
| P0-003 | Extend contracts for BusinessAccount, CodexClient, CodexTaskRun, QuotaSnapshot | M51 |
| P0-004 | Add SQLite store tables for accounts, clients, tasks, evidence, audit | M51 |
| P0-005 | Create `@codexhub/codex-app-server-adapter` package skeleton | M54 |
| P0-006 | Implement Codex App Server stdio transport and initialize | M54 |
| P0-007 | Implement `account/read` and `account/rateLimits/read` | M54 |
| P0-008 | Create `@codexhub/chatgpt-business-adapter` package skeleton | M52 |
| P0-009 | Implement account pool scoring and lease model | M56 |
| P0-010 | Implement CodexTaskRun lifecycle model | M57 |

### P1: Real Codex Task Loop

| Issue | Title | Target milestone |
| --- | --- | --- |
| P1-001 | Implement Codex `thread/start`, `thread/resume`, `turn/start` | M54 |
| P1-002 | Implement App Server event stream ingestion | M54 |
| P1-003 | Mirror thread, turn, item, and token usage into store | M51/M54 |
| P1-004 | Bridge Codex approval requests to CodexHub Approval UX | M54 |
| P1-005 | Implement Codex task dispatch workflow | M57 |
| P1-006 | Implement worktree preparation for Codex tasks | M57 |
| P1-007 | Implement git diff collection after task completion | M59 |
| P1-008 | Implement task verification with lint/test/build | M59 |
| P1-009 | Implement review package generation | M59 |
| P1-010 | Implement draft PR dry-run and approval path | M59 |

### P2: Accounts And Quota

| Issue | Title | Target milestone |
| --- | --- | --- |
| P2-001 | Implement ChatGPT Business membership sync | M52 |
| P2-002 | Implement ChatGPT workspace identity check | M52/M53 |
| P2-003 | Implement ChatGPT login health check | M53 |
| P2-004 | Implement ChatGPT login recovery checkpoints | M53/M58 |
| P2-005 | Implement Business Codex quota reader | M52/M53 |
| P2-006 | Implement UnifiedQuotaSnapshot aggregator | M51/M56 |
| P2-007 | Cross-check Business quota and App Server rate limits | M56/M58 |
| P2-008 | Block task dispatch on wrong account or workspace mismatch | M56/M57 |
| P2-009 | Disable CodexAccountBinding when Business member is removed | M56 |
| P2-010 | Add account pool dashboard API | M50/M56 |

### P3: Diagnosis And Recovery

| Issue | Title | Target milestone |
| --- | --- | --- |
| P3-001 | Create `@codexhub/diagnosis-kernel` | M58 |
| P3-002 | Implement quota diagnosis | M58 |
| P3-003 | Implement auth/workspace diagnosis | M58 |
| P3-004 | Implement approval waiting diagnosis | M58 |
| P3-005 | Implement tool stuck and process hung diagnosis | M58 |
| P3-006 | Implement App Server unresponsive diagnosis | M58 |
| P3-007 | Implement Desktop UI frozen diagnosis | M55/M58 |
| P3-008 | Create `@codexhub/recovery-kernel` | M58 |
| P3-009 | Implement App Server reconnect/restart recovery | M58 |
| P3-010 | Implement turn interrupt and background terminal clean recovery | M58 |
| P3-011 | Implement quota wait and switch account recovery | M58 |
| P3-012 | Implement task transfer, fork, and resume recovery | M58 |

### P4: Productionization

| Issue | Title | Target milestone |
| --- | --- | --- |
| P4-001 | Implement Codex App Server schema drift detection | M60 |
| P4-002 | Implement Desktop UI and Electron target drift detection | M60 |
| P4-003 | Implement canary task system | M60 |
| P4-004 | Implement end-to-end audit export | M60 |
| P4-005 | Implement sensitive data redaction tests | M60 |
| P4-006 | Implement operator dashboard for account, client, and task status | M56/M57/M60 |
| P4-007 | Implement production runbook and recovery playbooks | M60 |
| P4-008 | Add full E2E rehearsal workflow | M60 |
| P4-009 | Add upgrade and rollback strategy for adapters | M60 |
| P4-010 | Add production readiness checklist | M60 |

## First Codex Development Tasks

Use these as the first concrete Codex task queue after this planning round.

### Task 1: Supervisor Core API

Title:

- Implement CodexHub Supervisor core API surface.

Goal:

- Implement `apps/supervisor/src/server.ts` and core route skeletons for health,
  capabilities, accounts, clients, tasks, workflows, approvals, evidence, and
  audit.

Acceptance:

- Lint, tests, and build pass for touched projects.
- `GET /health` is available.
- `GET /capabilities` returns the current capability matrix.
- All mutating routes have local-control key and origin guards.
- No response returns raw token, cookie, session, body, or path.

### Task 2: Unified Contracts And SQLite Store

Title:

- Add unified contracts and SQLite store models for Business and Codex automation.

Goal:

- Add schemas and repositories for Business workspace, membership, ChatGPT session
  health, Codex client, Codex account, Codex task, diagnosis, quota, and leases.

Acceptance:

- All schemas use Zod and include `schemaVersion`.
- SQLite migrations are idempotent.
- CRUD tests pass.
- Sensitive fields are redacted or hash-only.

### Task 3: Codex App Server Adapter Skeleton

Title:

- Create real Codex App Server adapter with stdio transport and initialize/account/rateLimits.

Goal:

- Add `@codexhub/codex-app-server-adapter` with stdio transport, initialize,
  `account/read`, and `account/rateLimits/read`.

Acceptance:

- Adapter supports the initialize lifecycle.
- `account/read` creates a `CodexAccountBinding`.
- `account/rateLimits/read` creates a `CodexRateLimitSnapshot`.
- Errors distinguish `not_initialized`, `transport_failed`, `account_missing`,
  and `rate_limit_unavailable`.
- Raw prompts and raw server responses are not persisted.

### Task 4: Thread, Turn, Event Ingestion

Title:

- Implement Codex thread/turn lifecycle and event ingestion.

Goal:

- Implement thread start/resume, turn start, event stream ingestion, and mirrors
  for thread, turn, item, and token usage.

Acceptance:

- Creates a real thread when live gates are enabled.
- Submits a turn and tracks status.
- Ingests item and turn events.
- `CodexTaskRun` can move from submitted to running to completed or failed.
- Event summaries are hash-only by default.

### Task 5: Approval Bridge

Title:

- Bridge Codex App Server approval requests to CodexHub Approval UX.

Goal:

- Convert App Server command and file approval requests into CodexHub approval
  artifacts and write decisions back to App Server.

Acceptance:

- Command approval enters approval inbox.
- File change approval enters approval inbox.
- accept, decline, and cancel decisions can be written back.
- High and critical requests cannot auto-approve.
- Every decision creates audit events.

### Task 6: Account Pool

Title:

- Implement Account Pool for Business and Codex account eligibility.

Goal:

- Score Business membership, Chrome session, workspace identity, Business quota,
  Codex account, and Codex rate limits into schedulable account entries.

Acceptance:

- Only `account_ready` accounts can receive tasks.
- removed, pending, wrong_account, workspace_mismatch, and quota_depleted accounts
  cannot receive tasks.
- Account leases prevent concurrent overuse.
- Account pool status is queryable from Supervisor.

### Task 7: Codex Task Dispatch

Title:

- Implement Codex task dispatch workflow with account/client/worktree preflight.

Goal:

- Convert `CodexTaskIntent` into account selection, client selection, worktree
  preparation, thread start, turn start, and event monitoring.

Acceptance:

- Dispatch runs account, client, quota, project, worktree, policy, and approval
  preflights.
- Dispatch produces a `CodexTaskRun`.
- The run references thread, turn, account, client, and worktree ids.
- Dispatch failure enters diagnosis and does not report false success.

### Task 8: Diagnosis Kernel

Title:

- Implement Codex task diagnosis engine.

Goal:

- Diagnose completed, quota, auth, workspace, approval wait, tool stuck, model
  stalled, App Server unresponsive, Desktop UI frozen, and environment failures.

Acceptance:

- Every diagnosis has evidence refs.
- `failed_quota` has rate-limit or Business quota evidence.
- `failed_auth` has account or session evidence.
- `tool_stuck` has command, item, or process evidence.
- `unknown` becomes `needs_manual_review`.

### Task 9: Recovery Kernel

Title:

- Implement Codex task recovery engine.

Goal:

- Choose governed recovery actions for wait, login, quota switch, reconnect,
  restart, interrupt, terminal cleanup, resume, fork, transfer, rollback, and
  manual review.

Acceptance:

- Every recovery action has a dry-run.
- High-risk recovery requires approval.
- Recovery re-runs diagnosis after action.
- Recovery writes `CodexRecoveryRun` and evidence refs.

### Task 10: Verification, Review, PR Loop

Title:

- Implement Codex task verification, review package, and draft PR workflow.

Goal:

- Read diff, run verification, generate review package, and support branch publish
  and draft PR through existing governance.

Acceptance:

- Changed files and diff summary are available.
- Project lint/test/build or configured verification runs.
- Review package is metadata-only.
- Draft PR dry-run is available.
- Live draft PR requires approval.

## Workflow Template Backlog

Future templates should be versioned under `.codexhub/workflows`:

- `account.codex-ready.workflow.json`
- `client.codex-ready.workflow.json`
- `business.membership-sync.workflow.json`
- `business.quota-sync.workflow.json`
- `codex.task-dispatch.workflow.json`
- `codex.task-monitor.workflow.json`
- `codex.task-diagnose.workflow.json`
- `codex.task-recover.workflow.json`
- `codex.review-package.workflow.json`
- `github.draft-pr-from-codex.workflow.json`
- `codex.protocol-drift.workflow.json`
- `system.canary.workflow.json`

Template rules:

- Templates are discoverable and rehearseable before live use.
- Production execution is disabled by default.
- Every live child action remains separately governed by its own control plane.
- Template public output stays metadata-only.

## End-To-End Completion Scenarios

### E2E 1: Account Discovery And Quota Sync

1. Sync Business members.
2. Read Business Codex quota for each eligible account.
3. Read Codex App Server account and rate limits.
4. Produce `UnifiedQuotaSnapshot`.
5. Account pool shows available and unavailable accounts with blocker summaries.

### E2E 2: Real Codex Task Dispatch

1. User submits a governed development task.
2. CodexHub selects eligible account and client.
3. CodexHub creates or selects an isolated worktree.
4. CodexHub starts a Codex thread.
5. CodexHub submits a turn.
6. CodexHub monitors events.
7. CodexHub reads diff after completion.
8. CodexHub runs verification.
9. CodexHub generates a review package.

### E2E 3: Quota Exhaustion And Account Switch

1. Task detects Codex rate limit or Business quota exhaustion.
2. Diagnosis reports `failed_quota` or `waiting_rate_limit_reset`.
3. Scheduler selects another eligible account.
4. Recovery performs approved transfer or resume.
5. New account continues the task.

### E2E 4: Login Recovery

1. Codex account read reports logged out.
2. Recovery starts login workflow.
3. Chrome profile and ChatGPT identity recover through human checkpoint if needed.
4. Account, workspace, and Codex identity are rechecked.
5. Task resumes or is re-dispatched.

### E2E 5: Stuck Task Diagnosis And Recovery

1. Task has no event progress.
2. App Server, Desktop, process, and item state are compared.
3. Diagnosis reports model stalled, tool stuck, process hung, or UI frozen.
4. Recovery chooses wait, interrupt, clean terminal, resume, fork, transfer, or manual review.
5. Evidence and audit are updated.

### E2E 6: GitHub PR Delivery

1. Codex completes code changes.
2. CodexHub collects diff.
3. CodexHub verifies the work.
4. CodexHub creates review package.
5. CodexHub publishes branch after approval.
6. CodexHub creates draft PR after approval.
7. CodexHub observes CI.
8. CodexTaskRun reaches final status.

## Required Verification Per Future Round

Minimum verification:

- Focused tests for touched contracts, kernels, stores, Supervisor, CLI, Dashboard,
  MCP, or adapters.
- Focused lint/build for touched projects.
- `pnpm scaffold:health`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm audit:no-live-automation`
- `pnpm audit:skills`
- `pnpm verify:foundation`
- `git diff --check`

Every round must record:

- Workflow Skills Used and Why.
- Project Skills Used and Why.
- Skills Not Used and Why.
- Verification evidence.
- Residual risks.
- Next recommended task.

## Skills Declaration For This Planning Queue

Workflow Skills Used and Why:

- `gsd-spec-driver`: scoped this as a planning and backlog round.
- `gstack-delivery-workflow`: kept the queue staged from shared contracts to
  kernels to apps.
- `superpowers-engineering-discipline`: preserved no-live boundaries and kept
  the round documentation-only.

Project Skills Used and Why:

- `codexhub-architecture-planner`: mapped package and route ownership across
  contracts, kernels, stores, Supervisor, CLI, Dashboard, and adapters.
- `codexhub-contract-designer`: defined future shared DTO/schema families while
  avoiding current public API changes.
- `codexhub-workflow-policy-reviewer`: preserved dry-run, approval, evidence,
  audit, and metadata-only requirements.
- `codexhub-codex-exec-adapter`: constrained future Codex process and prompt
  handling to fixed, approved, hash-bound paths.
- `codexhub-browser-profile-observer`: kept Chrome profile work read-only and
  privacy-preserving by default.
- `codexhub-electron-cdp-observer`: kept Electron/CDP observation read-only and
  loopback-only by default.
- `codexhub-release-auditor`: registered release/review/runbook evidence and
  closeout gates.

Skills Not Used and Why:

- `codexhub-playwright-qa`: not used because this round does not modify Dashboard
  runtime UI or browser smoke tests.
- Browser Profile runtime, Electron/CDP runtime, MCP runtime, policy backend
  runtime, telemetry exporter runtime, deployment runtime, and external agent
  runtime were not used because this round only creates the future development
  queue and does not execute live capability surfaces.
