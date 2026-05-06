# M47-D8 Approval Consumption Semantics Review

## GSD Spec

- Goal: prove representative late-stage control planes preserve approvals before
  boundary reach and consume them exactly once after a governed boundary attempt.
- Scope: Supervisor approval/boundary tests, orchestration registration,
  scaffold health, and closeout docs.
- Non-scope: new routes, providers, store repositories, live boundaries, real
  remote writes, pushes, or pull requests.
- Acceptance: focused Supervisor tests pass, scaffold health recognizes D8 docs,
  and full foundation gates pass before commit.
- Hard boundaries: request-body authority remains untrusted, pre-boundary blocks
  must not consume approvals, and boundary-reached failures must preserve
  boundary truth.
- Affected projects: `supervisor`, docs, orchestration, scaffold tooling.
- Risk level: critical, because early or repeated approval consumption can hide
  unsafe retries or bypass child authority.

## GStack Delivery

- Plan: identify existing approval semantics coverage, add the smallest missing
  remote-write failure injection, then register and verify the round.
- Build: changed only Supervisor tests plus governance docs/config/tooling.
- Review: confirmed no product route, provider, store repository, or live
  boundary was added.
- QA: focused Supervisor tests were run before broader closeout gates.
- Ship: commit only after full gate completion.
- Retro: D8 strengthened approval consumption semantics; D9 should focus on
  GitHub fixed boundary drift.

## Superpowers Checklist

- Small scoped changes: yes.
- Tests first where practical: yes, D8 began by adding a regression test.
- YAGNI: no new helper framework or runtime behavior.
- Evidence over claims: focused test result recorded in release notes.
- Clean git state target: required before D9.
- No unreviewed live automation: maintained.

## Review Notes

- The GitHub PR labels control plane now proves mismatch blocks before any
  network call and leaves approvals unused.
- Failed GitHub write attempts preserve `networkBoundaryInvoked=true` and consume
  the approval once.
- A reused approval does not trigger another network boundary.
- Raw owner, repo, token, label, and response body content remain absent from
  public outputs.

## Skills Used And Why

- `gsd-spec-driver`: bounded D8 to approval consumption and boundary truth.
- `gstack-delivery-workflow`: kept Plan/Build/Review/QA/Ship sequencing explicit.
- `superpowers-engineering-discipline`: enforced small tests and no scope creep.
- `codexhub-workflow-policy-reviewer`: reviewed approval consumption,
  request-body authority, and boundary invariants.
- `codexhub-release-auditor`: guided verification and release closeout.

## Skills Not Used And Why

- `codexhub-contract-designer`: no contract schema changed in D8.
- `codexhub-architecture-planner`: package and route boundaries were unchanged.
- `codexhub-codex-exec-adapter`: Codex exec was not changed.
- `codexhub-playwright-qa`: Dashboard behavior was not modified.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, and
  telemetry exporter runtime skills: D8 reviewed Supervisor approval semantics
  only and did not expand those surfaces.
