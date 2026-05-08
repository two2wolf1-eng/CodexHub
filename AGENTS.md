# CodexHub Agent Rules

## Build Order

Work from shared language outward:

1. `packages/contracts`
2. Kernel packages
3. Apps

Contracts are the only shared DTO/schema/type language. When shared contracts change, update tests in every dependent package touched by the change.

## Safety Rules

- All dangerous actions must be dry-run first.
- Do not bypass login, MFA, account limits, quotas, permissions, or workspace governance.
- Browser and Electron automation are read-only by default.
- Browser click/input automation is not allowed in the foundation scaffold.
- Electron main inspector connections are not allowed in the foundation scaffold.
- Explicitly approved production real automation rounds may enter real Browser/Electron/Codex write surfaces only through `codexhub-production-real-automation-governor`: registered surface, reviewed operation manifest, dry-run, approval, store-resolved authority, evidence, audit, runtime gates, and fixed adapter boundaries.
- All write operations must pass policy, approval, evidence, and audit gates.
- No token, cookie, session, MFA, account, or credential collection is allowed.
- New features must include focused tests.
- Capability providers are not authority providers: adapters may execute or observe, but only CodexHub governance can allow execution.
- All capability adapters must declare a manifest, produce a dry-run plan, receive an execution authority, and emit evidence plus audit.
- Capability adapters must not be called directly by UI, CLI, MCP tools, or tests that bypass workflow/security kernels.
- Browser act, Electron main inspector, workspace mutation, and real git write operations require explicit approval and are not foundation defaults.

## Package Boundaries

- Apps and packages must import from public package entrypoints only.
- Do not import from another package's internal `src` path.
- SQLite runtime bindings are isolated to `packages/store-sqlite`.
- `store-core` exposes async repository interfaces only.

## Development Workflow Protocol

Every CodexHub development round must explicitly document and follow this protocol before changing code.

### A. GSD Spec Phase

- Goal: state the user-visible objective.
- Scope: list the exact apps, packages, docs, and tools to change.
- Non-scope: list what must not be implemented in this round.
- Acceptance criteria: define commands, tests, APIs, or docs that prove completion.
- Hard boundaries: restate safety boundaries, especially no unreviewed live automation.
- Affected apps/packages: name every project touched.
- Risk level: classify as low, medium, high, or critical using CodexHub contracts.

### B. GStack Delivery Phase

- Plan: write the small-step plan before implementation.
- Build: make scoped changes only.
- Review: inspect diffs for policy, boundary, and regression risks.
- QA: run focused tests first, then foundation verification when appropriate.
- Ship: commit only after verification passes and the worktree is clean.
- Retro: summarize what changed, evidence gathered, and next risks.

### C. Superpowers Engineering Discipline

- Work in small steps.
- Prefer tests first where practical.
- Apply YAGNI and avoid scope creep.
- Keep shared abstractions DRY without premature framework work.
- Prefer evidence over claims: every completion summary needs verification evidence.
- Start and finish with a clean git state unless explicitly preserving user changes.
- Do not add unreviewed live automation.
- Do not bypass existing policy, approval, evidence, or audit paths.

### D. CodexHub Custom Skills Declaration

Every round must read workflow skills first, then task-relevant project skills.

Workflow skills are always required:

- `gsd-spec-driver`: use when starting any CodexHub development round to write the GSD Spec before editing.
- `gstack-delivery-workflow`: use when planning and executing the delivery flow for any CodexHub round.
- `superpowers-engineering-discipline`: use when enforcing small steps, tests where practical, YAGNI, DRY, evidence-over-claims, clean git state, no scope creep, and no unreviewed live automation.

After workflow skills are read, every round must declare which project skills are used and why. If a listed skill is relevant, use it before editing the related area.

- `codexhub-architecture-planner`: use when planning architecture, package boundaries, or cross-plane changes.
- `codexhub-contract-designer`: use when modifying contracts, schemas, DTOs, or shared inferred types.
- `codexhub-workflow-policy-reviewer`: use when modifying workflow, security, evidence, approval, or audit behavior.
- `codexhub-codex-exec-adapter`: use when modifying `codex-kernel` or the Codex exec control plane.
- `codexhub-electron-cdp-observer`: use when modifying Electron/CDP observation modules.
- `codexhub-browser-profile-observer`: use when modifying Browser Profile or Chrome Profile modules.
- `codexhub-production-real-automation-governor`: use when implementing explicitly approved production real-client automation or real write expansion for Chrome/ChatGPT, Codex Web, Codex Desktop/Electron, Codex CLI, cross-profile, cross-workspace, delegated admin, or break-glass surfaces.
- `codexhub-playwright-qa`: use when modifying Dashboard browser QA or smoke-test behavior.
- `codexhub-release-auditor`: use during every round closeout, verification, commit, and release-note summary.

Every round output must include:

- Workflow Skills Used and Why.
- Project Skills Used and Why.
- Skills Not Used and Why.

The custom skills live under `.agents/skills`. They are project process rules only; they must not contain executable scripts, real external automation, account operations, secrets, or workspace-specific private data.
