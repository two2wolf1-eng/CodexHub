# M47-D16 MCP Boundary Surface Review

## GSD Spec

- Goal: prove MCP production source remains read-only and cannot drift into
  runtime, external-agent, platform, Browser/Electron, or MCP write mutation.
- Scope: MCP server tests, orchestration registration, scaffold health, and
  closeout docs.
- Non-scope: new routes, providers, store repositories, live boundaries, MCP
  write tools, external agent execution, remote writes, pushes, or pull
  requests.
- Acceptance: focused MCP tests pass, D16 docs are registered in scaffold
  health, and full foundation gates pass before commit.
- Hard boundaries: no process/network provider bypass, no GitHub token reads,
  no Supervisor local-control token reads, no direct adapter execute, no
  runtime/agent/platform mutation routes, and metadata-only output.
- Affected projects: `codexhub-mcp-server`, docs, orchestration, scaffold
  tooling.
- Risk level: critical, because MCP can become a high-leverage tool boundary if
  widened accidentally.

## GStack Delivery

- Plan: add MCP source drift tests for env access and mutation route terms,
  then register and verify the round.
- Build: changed only MCP tests plus governance docs/config/tooling.
- Review: confirmed no runtime behavior, route, provider, store repository, or
  live boundary was added.
- QA: focused MCP tests run before broader closeout gates.
- Ship: commit only after full gate completion.
- Retro: D16 strengthened MCP source drift checks; D17 should focus on
  rehearsal matrix completeness.

## Superpowers Checklist

- Small scoped changes: yes.
- Tests first where practical: yes, D16 began with source regression tests.
- YAGNI: no shared source scanner was introduced.
- Evidence over claims: focused test results recorded in release notes.
- Clean git state target: required before D17.
- No unreviewed live automation: maintained.

## Review Notes

- MCP bootstrap env reads are now fixed to MCP transport/host/port only.
- MCP HTTP security env access remains MCP-local and does not read GitHub or
  Supervisor local-control token variables.
- MCP production source now rejects runtime, external-agent, platform, Browser,
  Electron, and MCP write route terms.
- Existing evidence/audit metadata-only tool behavior remains unchanged.

## Skills Used And Why

- `gsd-spec-driver`: bounded D16 to MCP boundary-surface debugging.
- `gstack-delivery-workflow`: kept Plan/Build/Review/QA/Ship sequencing
  explicit.
- `superpowers-engineering-discipline`: enforced small tests and no scope creep.
- `codexhub-architecture-planner`: reviewed MCP app boundary ownership.
- `codexhub-workflow-policy-reviewer`: reviewed read-only tool and local-control
  token invariants.
- `codexhub-release-auditor`: guided verification and release closeout.

## Skills Not Used And Why

- `codexhub-contract-designer`: no contract schema changed in D16.
- `codexhub-codex-exec-adapter`: Codex exec was not changed.
- `codexhub-playwright-qa`: Dashboard behavior was not modified.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime,
  and telemetry exporter runtime skills: D16 reviewed static MCP source and did
  not expand runtime surfaces.
