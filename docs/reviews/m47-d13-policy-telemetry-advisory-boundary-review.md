# M47-D13 Policy Telemetry Advisory Boundary Review

## GSD Spec

- Goal: prove real policy backends remain advisory-only and real telemetry
  export remains non-authoritative, metadata-only, and confined to reviewed
  boundaries.
- Scope: policy backend adapter tests, OTel adapter tests, orchestration
  registration, scaffold health, and closeout docs.
- Non-scope: new routes, providers, store repositories, live boundaries,
  policy authority transfer, telemetry-as-audit replacement, network exporter
  default enablement, remote writes, pushes, or pull requests.
- Acceptance: focused policy/telemetry tests pass, scaffold health recognizes
  D13 docs, and full foundation gates pass before commit.
- Hard boundaries: OPA/Cedar are advisory, `security-kernel` is final
  authority, telemetry cannot replace Evidence/Audit, network exporter remains
  disabled by default, raw policy/input/output/span/log/body values are not
  persisted or returned.
- Affected projects: `policy-backend-adapter`, `otel-adapter`, docs,
  orchestration, scaffold tooling.
- Risk level: critical, because policy and telemetry integrations can be
  mistaken for authority or audit if widened incorrectly.

## GStack Delivery

- Plan: add source guards plus loopback/hash-bound boundary behavior tests,
  then register and verify the round.
- Build: changed only package tests plus governance docs/config/tooling.
- Review: confirmed no runtime behavior, route, provider, store repository, or
  live boundary was added.
- QA: focused tests were run before broader closeout gates.
- Ship: commit only after full gate completion.
- Retro: D13 strengthened policy/telemetry drift checks; D14 should focus on
  Dashboard mutation surfaces.

## Superpowers Checklist

- Small scoped changes: yes.
- Tests first where practical: yes, D13 began by adding regression tests.
- YAGNI: no new shared scanner framework.
- Evidence over claims: focused test results recorded in release notes.
- Clean git state target: required before D14.
- No unreviewed live automation: maintained.

## Review Notes

- Policy backend tests now prove real child-process and HTTP boundaries are
  isolated to `real-policy-boundary.ts`.
- Policy HTTP tests block non-loopback and wrong-path endpoints before `fetch`
  and allow only hash-bound loopback fixed paths.
- Telemetry tests now prove network exporter code is isolated to
  `real-exporter-boundary.ts`.
- Telemetry network export tests block hash mismatch and non-loopback endpoints
  before `fetch`, and successful loopback export remains non-authoritative and
  metadata-only.

## Skills Used And Why

- `gsd-spec-driver`: bounded D13 to policy/telemetry advisory boundary
  debugging.
- `gstack-delivery-workflow`: kept Plan/Build/Review/QA/Ship sequencing
  explicit.
- `superpowers-engineering-discipline`: enforced small tests and no scope creep.
- `codexhub-architecture-planner`: reviewed package ownership and boundary file
  placement.
- `codexhub-workflow-policy-reviewer`: reviewed security-kernel authority,
  advisory-only policy, and telemetry non-authority invariants.
- `codexhub-release-auditor`: guided verification and release closeout.

## Skills Not Used And Why

- `codexhub-contract-designer`: no contract schema changed in D13.
- `codexhub-codex-exec-adapter`: Codex exec was not changed.
- `codexhub-playwright-qa`: Dashboard behavior was not modified.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime,
  and telemetry exporter runtime skills: D13 reviewed package-level boundaries
  through injected tests and did not expand runtime surfaces.
