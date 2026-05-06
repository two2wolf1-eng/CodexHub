# M47-D14 Dashboard Mutation Surface Review

## GSD Spec

- Goal: prove Dashboard mutation remains confined to reviewed guided panels and
  cannot drift through generic POST helpers or token persistence aliases.
- Scope: Dashboard source tests, orchestration registration, scaffold health,
  and closeout docs.
- Non-scope: new routes, providers, store repositories, live boundaries,
  Dashboard execution capability, remote writes, pushes, or pull requests.
- Acceptance: focused Dashboard tests pass, D14 docs are registered in scaffold
  health, and full foundation gates pass before commit.
- Hard boundaries: no generic API POST expansion, no token persistence, no
  direct adapter execution from Dashboard, no unsupported platform operations
  mutation, and metadata-only public output.
- Affected projects: `dashboard`, docs, orchestration, scaffold tooling.
- Risk level: critical, because Dashboard is an operator-facing mutation
  surface for high-risk governed workflows.

## GStack Delivery

- Plan: add an exact Dashboard POST route regression, register the round, then
  verify with focused Dashboard checks and foundation gates.
- Build: changed only Dashboard tests plus governance docs/config/tooling.
- Review: confirmed no app behavior, route, provider, store repository, or live
  boundary was added.
- QA: focused Dashboard tests run before broader closeout gates.
- Ship: commit only after full gate completion.
- Retro: D14 strengthened UI mutation drift checks; D15 should harden CLI
  mutation surfaces.

## Superpowers Checklist

- Small scoped changes: yes.
- Tests first where practical: yes, D14 began with a regression test.
- YAGNI: no shared route-parser package was added.
- Evidence over claims: verification commands are recorded in release notes.
- Clean git state target: required before D15.
- No unreviewed live automation: maintained.

## Review Notes

- Dashboard POST route sets now have an exact allowlist test covering recovery,
  merge, deployment operations, policy backend evaluations, and telemetry
  exports.
- The new test rejects generic `/api` prefix expansion patterns that could make
  future POST helpers too broad.
- The new test rejects token persistence aliases and URL/history token
  propagation.
- Platform operations remain GET-only in the Dashboard source.

## Skills Used And Why

- `gsd-spec-driver`: bounded D14 to Dashboard mutation-surface debugging.
- `gstack-delivery-workflow`: kept Plan/Build/Review/QA/Ship sequencing
  explicit.
- `superpowers-engineering-discipline`: enforced small tests and no scope creep.
- `codexhub-architecture-planner`: reviewed app boundary ownership and avoided
  new shared abstractions.
- `codexhub-workflow-policy-reviewer`: reviewed local-control token and
  mutation-surface invariants.
- `codexhub-playwright-qa`: reviewed Dashboard degraded-safe and memory-only
  token expectations.
- `codexhub-release-auditor`: guided verification and release closeout.

## Skills Not Used And Why

- `codexhub-contract-designer`: no contract schema changed in D14.
- `codexhub-codex-exec-adapter`: Codex exec was not changed.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime,
  and telemetry exporter runtime skills: D14 reviewed Dashboard static behavior
  and did not expand runtime surfaces.
