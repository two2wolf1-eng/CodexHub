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
- All write operations must pass policy, approval, evidence, and audit gates.
- No token, cookie, session, MFA, account, or credential collection is allowed.
- New features must include focused tests.

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

Every round must declare which project skills are used and why. If a listed skill is relevant, use it before editing the related area.

- `codexhub-architecture-planner`: use when planning architecture, package boundaries, or cross-plane changes.
- `codexhub-contract-designer`: use when modifying contracts, schemas, DTOs, or shared inferred types.
- `codexhub-workflow-policy-reviewer`: use when modifying workflow, security, evidence, approval, or audit behavior.
- `codexhub-codex-exec-adapter`: use when modifying `codex-kernel` or the Codex exec control plane.
- `codexhub-electron-cdp-observer`: use when modifying Electron/CDP observation modules.
- `codexhub-browser-profile-observer`: use when modifying Browser Profile or Chrome Profile modules.
- `codexhub-playwright-qa`: use when modifying Dashboard browser QA or smoke-test behavior.
- `codexhub-release-auditor`: use during every round closeout, verification, commit, and release-note summary.

The custom skills live under `.agents/skills`. They are project process rules only; they must not contain executable scripts, real external automation, account operations, secrets, or workspace-specific private data.
