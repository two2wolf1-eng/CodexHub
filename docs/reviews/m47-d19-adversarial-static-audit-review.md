# M47-D19 Adversarial Static Audit Review

## GSD Spec

- Goal: make the no-live automation audit harder to regress by testing more
  adversarial false-negative patterns.
- Scope: audit tooling, orchestration registration, scaffold health, and
  closeout docs.
- Non-scope: new routes, providers, store repositories, live boundaries,
  runtime execution, remote writes, pushes, or pull requests.
- Acceptance: `audit:no-live-automation` passes with strengthened sentinel
  self-checks, D19 docs are registered in scaffold health, and full foundation
  gates pass before commit.
- Hard boundaries: audit-only negative fixtures, no allowlist widening, no
  external process/network execution, and no product behavior change.
- Affected projects: tools, docs, orchestration, scaffold tooling.
- Risk level: critical, because static audits are the backstop against future
  unsafe operator and adapter-surface drift.

## GStack Delivery

- Plan: make sentinel self-checks run the real import/call scans, then add
  missing adversarial cases and verify.
- Build: changed only audit tooling plus governance docs/config/tooling.
- Review: confirmed no live boundary allowlist entry, product route, provider,
  or store repository was added.
- QA: `audit:no-live-automation` run before full closeout gates.
- Ship: commit only after full gate completion.
- Retro: D19 strengthened static audit negative fixtures; D20 should finalize
  the M0-M47 baseline.

## Superpowers Checklist

- Small scoped changes: yes.
- Tests first where practical: yes, the audit is self-testing through
  adversarial sentinels.
- YAGNI: no new audit framework was introduced.
- Evidence over claims: audit result recorded in release notes.
- Clean git state target: required before D20.
- No unreviewed live automation: maintained.

## Review Notes

- Sentinel self-checks now exercise TypeScript import collection and call
  expression scanning, matching the real audit path more closely.
- Added bad examples cover alias imports, dynamic execute reconstruction,
  generic POST helpers, generic GitHub ref URL builders, token storage wrappers,
  dynamic env reads, and shell argv passthrough.
- No production source allowlist was widened.

## Skills Used And Why

- `gsd-spec-driver`: bounded D19 to adversarial static audit debugging.
- `gstack-delivery-workflow`: kept Plan/Build/Review/QA/Ship sequencing
  explicit.
- `superpowers-engineering-discipline`: enforced small audit-only changes and
  no scope creep.
- `codexhub-architecture-planner`: reviewed tool boundary ownership.
- `codexhub-workflow-policy-reviewer`: reviewed no-live automation and
  authority-bypass sentinel coverage.
- `codexhub-release-auditor`: guided verification and release closeout.

## Skills Not Used And Why

- `codexhub-contract-designer`: no contract schema changed in D19.
- `codexhub-codex-exec-adapter`: Codex exec was not changed.
- `codexhub-playwright-qa`: Dashboard behavior was not modified in D19.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime,
  telemetry exporter runtime, and external agent runtime skills: D19 reviewed
  static audit fixtures and did not execute or expand runtime surfaces.
