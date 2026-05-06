# M47-D11 Runtime External Agent Boundary Review

## GSD Spec

- Goal: prove runtime scheduler and external agent packages do not drift toward
  direct process/network execution, generic argv passthrough, repo-root
  mutation, or multi-agent bypass outside governed workflow coordination.
- Scope: runtime operations kernel tests, external agent adapter tests,
  orchestration registration, scaffold health, and closeout docs.
- Non-scope: new routes, providers, store repositories, live boundaries, real
  external agent execution, remote writes, pushes, or pull requests.
- Acceptance: focused runtime/external-agent tests pass, scaffold health
  recognizes D11 docs, and full foundation gates pass before commit.
- Hard boundaries: no arbitrary process, no arbitrary argv, no repo-root
  mutation, no raw prompt/diff/patch/command/path persistence, and no
  multi-agent bypass outside workflow-kernel.
- Affected projects: `runtime-operations-kernel`, `external-agent-adapter`,
  docs, orchestration, scaffold tooling.
- Risk level: critical, because runtime scheduling and external agent execution
  can coordinate long-running writes when widened incorrectly.

## GStack Delivery

- Plan: add source guards and deterministic metadata tests around the existing
  runtime and external-agent packages, then register and verify the round.
- Build: changed only package tests plus governance docs/config/tooling.
- Review: confirmed no runtime behavior, route, provider, store repository, or
  live boundary was added.
- QA: focused tests were run before broader closeout gates.
- Ship: commit only after full gate completion.
- Retro: D11 strengthened scheduler and external-agent drift checks; D12 should
  focus on Browser/Electron/MCP controlled write boundaries.

## Superpowers Checklist

- Small scoped changes: yes.
- Tests first where practical: yes, D11 began by adding regression tests.
- YAGNI: no new runtime scanner framework.
- Evidence over claims: focused test results recorded in release notes.
- Clean git state target: required before D12.
- No unreviewed live automation: maintained.

## Review Notes

- Runtime source now has an explicit guard against child-process, network,
  worker, direct Codex/GitHub execution, and external-agent runner bypass terms.
- Runtime metadata tests cover queue ordering, retry, concurrency, lease expiry,
  locks, checkpoints, and boundary booleans without invoking a process.
- External agent source now has an explicit guard against generic process
  passthrough, unsafe CLI flags, repo-root mutation drift, and raw command
  persistence.
- External agent tests lock the reviewed fixed argv shapes for Codex CLI and
  Claude Code CLI and prove blocked rehearsals remain metadata-only.

## Skills Used And Why

- `gsd-spec-driver`: bounded D11 to runtime/external-agent boundary debugging.
- `gstack-delivery-workflow`: kept Plan/Build/Review/QA/Ship sequencing explicit.
- `superpowers-engineering-discipline`: enforced small tests and no scope creep.
- `codexhub-architecture-planner`: reviewed package ownership and kept the
  checks inside existing packages.
- `codexhub-workflow-policy-reviewer`: reviewed approval, metadata-only, and
  no-bypass invariants.
- `codexhub-codex-exec-adapter`: reviewed Codex CLI fixed argv and external
  agent execution boundary expectations.
- `codexhub-release-auditor`: guided verification and release closeout.

## Skills Not Used And Why

- `codexhub-contract-designer`: no contract schema changed in D11.
- `codexhub-playwright-qa`: Dashboard behavior was not modified.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime,
  and telemetry exporter runtime skills: D11 reviewed runtime/external-agent
  package boundaries only and did not expand those surfaces.
