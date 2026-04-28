# Round 3E Skills Retrospective Review

## Executive Summary

This review covers the CodexHub foundation from Round 1 through Round 3E. The implementation is still foundation-only and control-plane-only. The current system has a clear Nx monorepo shape, package public entrypoints, a contracts-first model, SQLite isolation, mock development orchestration, Codex fixture replay, disabled Codex exec dry-run control plane, config loading, manual approval records, and an approval state machine.

No blocking issue was found for continuing to Round 3F as another no-live control-plane round. One small naming drift was fixed during this review: the `codexhub-codex-exec-adapter` mock registry descriptor now says "Codex run-control plane" to match the project skill metadata without placing live-entrypoint wording in production source.

The main pre-Round-3F risk is governance clarity around the older `/api/codex/exec/approval-artifact` compatibility endpoint. It still creates an approval artifact without the newer manual approval request/decision state-machine path. It does not execute anything and the live gate remains disabled, but it should be deprecated, guarded, or routed through the state machine before any future live adapter work.

## Architecture Consistency Review

The architecture remains consistent with the current six-plane direction:

- Runtime and Codex control-plane work is isolated in `packages/codex-kernel` plus app entrypoints.
- Policy, evidence, workflow, observer, store, and skill registry logic live in packages rather than being hard-coded only in apps.
- `apps/supervisor`, `apps/cli`, `apps/dashboard`, and `apps/orchestrator` are thin entrypoints over package APIs.
- Nx recognizes exactly 16 projects, and `nx.json` uses `targetDefaults` with `cache: true` plus `build.dependsOn = ["^build"]`.

The package boundary audit is aligned with the intended dependency direction for apps and packages. Tools intentionally operate as local audit utilities and currently read source files directly where needed.

## Contracts Consistency Review

`packages/contracts` remains the shared DTO/schema/type language. The core created/observed models use `id`, `schemaVersion`, `createdAt` or `observedAt`, optional `metadata`, Zod schemas, inferred TypeScript types, and public exports from `src/index.ts`.

The Codex exec contracts are explicit about no-live state:

- replay records preserve fixture metadata and counts, not full JSONL bodies;
- dry-run records preserve prompt summary/hash/length, not full prompt body;
- config, preflight, approval artifact, manual approval request/decision/state, and execution gate models carry `liveExecution: false`, `externalProcessStarted: false`, and `executionDisabled: true`.

Current risk: contracts are growing in a single file. This is acceptable for the scaffold, but Round 3F or 4 should consider splitting by domain while preserving `@codexhub/contracts` as the only public entrypoint.

## Workflow / Policy / Evidence / Audit Review

The policy skeleton covers read/write defaults, risk-based approval, Codex live intent blocking, execution gate checks, and manual approval transition checks. High and critical paths remain approval-gated, and Codex live intent stays disabled unless explicitly enabled by future reviewed work.

Evidence behavior is consistent with the project rule: sensitive or large content is summarized and hashed. Codex replay, dry-run plans, command previews, policy decisions, preflight results, approval artifacts, approval requests, approval decisions, approval states, and gate results are metadata/hash-only.

Audit events consistently include control-plane metadata such as `liveExecution: false`, `externalProcessStarted: false`, `executionDisabled: true`, and `mockOnly` where appropriate.

Current risk: audit events are stored as JSON payloads and are append-like through repository APIs, but SQLite tables are not yet cryptographically append-only or chained. This is acceptable for local scaffold, but should be improved before using audit data as tamper-evident evidence.

## Codex Exec Control-Plane Review

Round 3A through 3E built a safe progression:

- JSONL fixture parser and replay, with malformed and unknown events normalized safely.
- Replay persistence as summary/count/hash records only.
- Dry-run intent, command preview, policy evaluation, disabled live run records.
- Config loading from the fixed `.codexhub/codex-exec.yaml` path.
- Preflight and execution gate evaluation with live disabled by default.
- Manual approval request, decision, artifact, state, and transition checks.

The no-live boundary is preserved: no production source imports external process modules, and no production source starts Codex or any other external process.

Current risk: the config parser is a deliberately small allowlist parser. That is a reasonable scaffold choice. If config grows beyond current simple keys, use a reviewed YAML parser and add parser hardening tests.

## Approval State Machine Review

Round 3E added a useful state model:

- `pending` requests can transition through approve, deny, or revoke.
- `approved` records can only transition to revoke.
- `denied`, `revoked`, `expired`, and `used` are terminal for decision flow.
- duplicate approval decisions are blocked by supervisor with HTTP 409.
- state and transition outputs generate hash-only evidence and audit events.

This is a good basis for Round 3F timeline aggregation.

Current risk: the older `/api/codex/exec/approval-artifact` endpoint can create an artifact outside the manual approval request/decision state-machine path. It is still no-live and blocked by disabled config, but it is a governance inconsistency. Recommended action before live work: deprecate it, hide it from normal workflows, or route it through the manual approval state machine.

## Store And Persistence Review

`store-core` exposes async repository interfaces and does not leak SQLite details. `store-sqlite` is the only package with `node:sqlite` and `DatabaseSync`, and it enables WAL and foreign keys. Migrations are idempotent through `CREATE TABLE IF NOT EXISTS`.

Persistence covers workflow runs, audit events, evidence refs, observations, mock development runs, Codex replay summaries, Codex exec dry-run records, and Codex exec approval records.

Current risk: payloads are stored as JSON blobs. This keeps the scaffold simple, but Round 3F may need indexed timeline queries. Add indexes or a dedicated timeline table only when the query shape is clear.

## CLI / Supervisor / Dashboard Review

Supervisor exposes mock and control-plane APIs only. It limits fixture replay paths and Codex exec cwd handling. Store failures degrade to memory where implemented and report degraded state instead of executing anything.

CLI commands prefer supervisor and fallback to local control-plane functions when supervisor is unavailable. Fallback approval listing is intentionally empty because fallback state is not persisted across commands.

Dashboard is minimal and read-only. It displays health, mock runs, fixture replays, dry-run records, config status, approval state, next actions, and degraded placeholders. It does not provide execution buttons.

Current risk: Dashboard has build coverage but no browser smoke test in this no-browser-automation stage. When allowed, use the `codexhub-playwright-qa` skill to add a read-only smoke check.

## Safety Audit Review

The hardening scripts now cover:

- project count and governance file health;
- import boundaries for apps/packages;
- SQLite runtime isolation;
- no-live automation vocabulary and process-launching imports/calls;
- skills workflow and registry alignment.

Manual broad text scans can match generated workspace `node_modules` mirrors, but the audit scripts intentionally skip `node_modules`, `dist`, and coverage folders. The authoritative gates are the audit scripts and `verify:foundation`.

Current risk: `audit:no-live-automation` is a source-level guardrail, not a proof system. Keep it strict, add tests for new allowlist rules, and avoid broad production-source allowlists.

## Skills Workflow Compliance Review

The project now has:

- `AGENTS.md` Development Workflow Protocol;
- `docs/development/skills-workflow.md`;
- `docs/development/round-template.md`;
- eight project skills under `.agents/skills`;
- `tools/audit-skills.ts`;
- mock registry descriptors aligned with required skill names.

This round used the required skills before writing the report. The workflow is now repeatable and auditable for future rounds.

## Risks

- The legacy approval artifact endpoint is not yet routed through the newer manual approval state machine.
- Contracts are centralized in one large file and may become harder to review as domains grow.
- SQLite JSON blob storage is simple but limits indexed operational views.
- Audit records are not tamper-evident yet.
- CLI local fallback does not persist approvals across commands without supervisor.
- Dashboard has build verification but no browser-level smoke coverage yet.
- No-live audit relies on static patterns and should be expanded as new adapter surfaces are introduced.

## Recommended Fixes Before Round 3F

1. Deprecate or route `/api/codex/exec/approval-artifact` through the manual approval state machine.
2. Add a read-only control-plane timeline API that aggregates dry-run, config, preflight, approval, gate, evidence, and audit records.
3. Keep timeline data metadata/hash-only and avoid storing prompt bodies or executable commands.
4. Add indexed persistence only for the timeline fields that the Dashboard actually reads.
5. Add tests that the timeline never reports live execution or external process start.
6. Consider splitting contracts internally by domain while preserving one public `@codexhub/contracts` entrypoint.

## No-Live Boundary Confirmation

This review found no implemented live Codex execution path. The current codebase still does not implement real Codex exec, Codex app-server integration, Electron/CDP connection, Chrome Profile connection, ChatGPT Workspace access, account or credential automation, browser click/input automation, or real workspace write operations.

All current Codex exec paths are fixture replay, dry-run, config, approval, preflight, execution gate, evidence, audit, and disabled-record control-plane paths.
