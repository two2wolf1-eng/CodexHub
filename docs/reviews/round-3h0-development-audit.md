# Round 3H.0 Long-form Development Audit

## Executive Summary

Round 1 through Round 3H foundations are structurally consistent with the current CodexHub rules. The repo still has 16 Nx projects, the required 11 skills are present, no-live automation audits pass, SQLite runtime bindings remain isolated to `packages/store-sqlite`, and the Codex control plane remains disabled-by-default and read-only where required.

One medium consistency issue was found and repaired: app code was using a replay summary DTO through a `codex-kernel` type alias instead of importing the shared contract type directly from `@codexhub/contracts`. The repair keeps runtime behavior unchanged and improves "contracts as shared language" and Nx affected dependency clarity.

No blocking or high safety issue was found.

## Baseline Status

Baseline commands were run before repairs.

- `git status --short`: clean.
- `git log --oneline -20`: latest commit was `f78e7b4 chore: add codex exec evidence audit drilldown`; the history includes scaffold, audit hardening, mock orchestration, fixture replay, disabled live control plane, approval state machine, timeline, workflow skills, and evidence/audit drilldown rounds.
- `pnpm nx show projects`: 16 projects were detected.
- `pnpm audit:skills`: passed; 3 workflow skills and 8 project skills verified.
- `pnpm audit:no-live-automation`: passed.
- `pnpm audit:boundaries`: passed.
- `pnpm audit:sqlite-isolation`: passed.
- `pnpm verify:foundation`: passed.

Detected Nx projects:

- `browser-profile-kernel`
- `electron-cdp-kernel`
- `orchestrator-kernel`
- `evidence-kernel`
- `observer-kernel`
- `security-kernel`
- `workflow-kernel`
- `skill-registry`
- `codex-kernel`
- `store-sqlite`
- `store-core`
- `contracts`
- `orchestrator`
- `supervisor`
- `dashboard`
- `cli`

## Architecture Findings

Blocking: none.

High: none.

Medium:

- Fixed: `apps/dashboard`, `apps/cli`, and `apps/supervisor` used `CodexExecReplaySummary` from `@codexhub/codex-kernel` as a DTO type. The canonical shared model is `CodexReplaySummary` in `@codexhub/contracts`. The apps now import `CodexReplaySummary` from contracts. Dashboard no longer has an unnecessary direct dependency on `codex-kernel`, and CLI's explicit Nx dependencies now include its direct public package dependencies.

Low:

- Some project `implicitDependencies` are intentionally conservative for app-level workflows. The repaired entries now better match direct imports for CLI and Dashboard.
- `orchestrator-kernel` depends on `store-core` for the mock development run persistence flow. This is consistent with later Round 2.5 requirements that allowed repository interfaces while still forbidding any dependency on `store-sqlite`.

Defer:

- If Nx dependency precision becomes a recurring issue, add an audit script that compares public `@codexhub/*` imports with project `implicitDependencies`.

## Contracts Findings

Blocking: none.

High: none.

Medium:

- Fixed: replay summary app usage now goes through `@codexhub/contracts`, not a kernel alias.

Low:

- Entity contracts for the major control-plane records consistently include `id`, `schemaVersion`, `createdAt`, optional `metadata`, and safety flags where relevant.
- Several nested value objects, such as detail summary items and metadata summary records, intentionally do not carry entity fields. That is reasonable as long as they remain embedded value objects and not persisted or addressed independently.
- `SkillDescriptor`, `SkillCapability`, and `SkillTrigger` are lightweight registry descriptors rather than persisted records. They have IDs and metadata where relevant, but do not currently use the full entity base. This is acceptable for now, but should be revisited before persisting skills as first-class records.

Defer:

- Decide in a future contracts cleanup whether all top-level registry descriptor schemas should adopt `schemaVersion` and `createdAt`, or whether the project should explicitly document entity vs value-object schema conventions.

## Policy / Evidence / Audit Findings

Blocking: none.

High: none.

Medium: none.

Low:

- Policy behavior remains conservative: live Codex control-plane execution is disabled by default, high-risk paths require approval, and danger-full-access remains blocked by default.
- Evidence refs remain summary/hash/metadata-only. Prompt bodies, command bodies, stdout/stderr bodies, full agent messages, and reasoning bodies are not exposed by the control-plane detail views.
- Audit events form a coherent chain for dry-run, config, preflight, approval request, manual approval decisions, approval state transitions, gate evaluation, replay, evidence, and drilldown views.
- The no-live audit allowlist is centralized and reasoned. It allows sensitive vocabulary in redaction code/tests and synthetic fixture text while keeping production external-process paths blocked.

Defer:

- Add regression tests that assert no detail/search view contains raw prompt, command, stdout, stderr, agent message, or reasoning body keys after future expansion.

## Codex Control-plane Findings

Blocking: none.

High: none.

Medium: none.

Low:

- Codex fixture replay is parser/replay only and persists replay summaries without full JSONL body storage.
- Dry-run, preflight, approval, gate, timeline, evidence, audit, and drilldown flows preserve `liveExecution: false`, `externalProcessStarted: false`, and `executionDisabled: true`.
- The legacy `/api/codex/exec/approval-artifact` path returns `410 Gone`, so it cannot bypass the manual approval state machine.
- CLI fallback paths use local control-plane data and do not start external processes.

Defer:

- Any live adapter work must wait for a separate ADR and go/no-go review. This audit did not approve live execution.

## Store Findings

Blocking: none.

High: none.

Medium: none.

Low:

- `store-core` exposes async repository interfaces only.
- `store-sqlite` is the only package that imports `node:sqlite` or references `DatabaseSync`.
- SQLite initialization keeps WAL and foreign keys enabled, and migrations are idempotent.
- Repository queries for evidence and audit are sufficient for the current read-only drilldown behavior.

Defer:

- Add store-core contract-level tests with an in-memory fake repository if the repository surface grows further. Current persistence behavior is covered through store-sqlite tests.

## Supervisor / CLI / Dashboard Findings

Blocking: none.

High: none.

Medium:

- Fixed: Dashboard no longer imports replay summary types from `codex-kernel`.

Low:

- Supervisor APIs use safe 400/404 responses and avoid leaking local absolute paths for fixture and dry-run lookups.
- CLI fallbacks explicitly include no-live flags in control-plane outputs.
- Dashboard remains read-only, has degraded and empty states, and does not expose execution, live, approve-and-run, or process-start affordances.
- Dashboard currently relies on build and lightweight smoke coverage rather than a full UI test harness. This matches the current foundation-only scope.

Defer:

- If Dashboard state grows further, add a small component test harness before adding more panels.

## Skills Workflow Findings

Blocking: none.

High: none.

Medium: none.

Low:

- `AGENTS.md` requires reading workflow skills first, then task-relevant project skills.
- `docs/development/skills-workflow.md` and `docs/development/round-template.md` reflect GSD, GStack, Superpowers, workflow skills, project skills, skills not used, and the release closeout protocol.
- `.agents/skills` contains the required 11 skills.
- `tools/audit-skills.ts` verifies required skill presence, frontmatter shape, trigger language, AGENTS protocol references, docs, round template fields, and registry alignment.

Defer:

- Keep the skill registry descriptors aligned manually until a future safe reader is approved. This round did not add skill execution or external automation.

## No-live Boundary Confirmation

This audit found no production path that starts a live Codex process, app-server integration, Electron/CDP connection, Chrome Profile connection, ChatGPT Workspace access, browser click/input automation, account automation, token/cookie/session/MFA handling, or workspace write operation.

The only references to guarded terms remain in documented redaction logic, tests, fixtures, docs, or audit vocabulary, and `pnpm audit:no-live-automation` passes.

## Technical Debt List

- Contracts should eventually document which schemas are entity records and which are embedded value objects.
- Skill descriptors may need entity fields if they become persisted or addressable records.
- Dashboard can use a lightweight component test harness before further UI expansion.
- A dependency-alignment audit could compare direct public package imports with Nx `implicitDependencies`.
- Store-core fake repository tests would help if more repository methods are added.

## Recommended Repairs

Applied in this round:

- Import `CodexReplaySummary` directly from `@codexhub/contracts` in app code.
- Remove Dashboard's unnecessary `codex-kernel` explicit dependency.
- Add CLI's direct `contracts` and `security-kernel` dependencies to its Nx metadata.

Recommended before live adapter ADR:

- Write an ADR that restates default-disabled live execution, explicit opt-in config, approval artifact binding, isolated worktree rules, evidence/audit requirements, and rollback expectations.
- Add an audit or test that fails if live process modules enter production source.
- Add a small Dashboard component test harness before adding any execution-adjacent UI.

## Round 3H Readiness Decision

Round 3H can proceed for read-only evidence/audit drilldown work. There are no blocking findings from this retrospective audit.

Live adapter work is not approved by this report. A separate ADR and go/no-go review are still required before any real process adapter, shell execution, app-server integration, Electron/CDP connection, Chrome Profile connection, or browser automation is considered.
