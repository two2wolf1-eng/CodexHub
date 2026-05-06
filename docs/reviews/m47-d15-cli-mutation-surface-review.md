# M47-D15 CLI Mutation Surface Review

## GSD Spec

- Goal: prove CLI mutation remains confined to reviewed exact commands and
  read-only command groups do not drift into local-control POST behavior.
- Scope: CLI source tests, orchestration registration, scaffold health, and
  closeout docs.
- Non-scope: new routes, providers, store repositories, live boundaries,
  execution behavior changes, remote writes, pushes, or pull requests.
- Acceptance: focused CLI tests pass, D15 docs are registered in scaffold
  health, and full foundation gates pass before commit.
- Hard boundaries: no `--token`, no token persistence, no direct adapter
  execution, no generic POST helper expansion, and no local-control read from
  read-only command groups.
- Affected projects: `cli`, docs, orchestration, scaffold tooling.
- Risk level: critical, because CLI is an operator-facing mutation surface.

## GStack Delivery

- Plan: add source-level CLI POST and read-only registration regressions, then
  register and verify the round.
- Build: changed only CLI tests plus governance docs/config/tooling.
- Review: confirmed no runtime behavior, route, provider, store repository, or
  live boundary was added.
- QA: focused CLI tests run before broader closeout gates.
- Ship: commit only after full gate completion.
- Retro: D15 strengthened CLI drift checks; D16 should focus on MCP source and
  tool boundaries.

## Superpowers Checklist

- Small scoped changes: yes.
- Tests first where practical: yes, D15 began with CLI regression tests.
- YAGNI: no shared CLI route-scanner package was added.
- Evidence over claims: focused test results recorded in release notes.
- Clean git state target: required before D16.
- No unreviewed live automation: maintained.

## Review Notes

- CLI POST call sites now have a source-level regression requiring
  `createSupervisorPostHeaders()`.
- The same regression rejects nearby generic `/api` prefix matching and raw
  authority/payload markers.
- Read-only command registrations now have a shared guard proving they do not
  use POST, local-control headers, local-control env reads, direct adapter
  execution, or token options.

## Skills Used And Why

- `gsd-spec-driver`: bounded D15 to CLI mutation-surface debugging.
- `gstack-delivery-workflow`: kept Plan/Build/Review/QA/Ship sequencing
  explicit.
- `superpowers-engineering-discipline`: enforced small tests and no scope creep.
- `codexhub-architecture-planner`: reviewed CLI/app boundary ownership and
  avoided broad abstractions.
- `codexhub-workflow-policy-reviewer`: reviewed local-control token and
  mutation-surface invariants.
- `codexhub-release-auditor`: guided verification and release closeout.

## Skills Not Used And Why

- `codexhub-contract-designer`: no contract schema changed in D15.
- `codexhub-codex-exec-adapter`: Codex exec behavior was not changed.
- `codexhub-playwright-qa`: Dashboard behavior was not modified.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime,
  and telemetry exporter runtime skills: D15 reviewed CLI static behavior and
  did not expand runtime surfaces.
