# M47-D7 Supervisor Route Gates Review

## GSD Spec

- Goal: prove late-stage Supervisor mutating routes consistently enforce token,
  Origin, CORS, and request-body authority rejection semantics.
- Scope: Supervisor gate tests, orchestration registration, scaffold health, and
  closeout docs.
- Non-scope: new routes, providers, store repositories, live boundaries, real
  remote writes, pushes, or pull requests.
- Acceptance: focused Supervisor tests pass, scaffold health recognizes D7 docs,
  and full foundation gates pass before commit.
- Hard boundaries: no mutating route may trust caller-supplied approval artifacts,
  execution authority, child artifacts, or wildcard CORS.
- Affected projects: `supervisor`, docs, orchestration, scaffold tooling.
- Risk level: critical, because a route gate regression can become an authority
  bypass.

## GStack Delivery

- Plan: extend existing late-stage route gate tests, add an all-route authority
  rejection regression, then register and verify the round.
- Build: changed only Supervisor tests plus governance docs/config/tooling.
- Review: confirmed no product route, provider, store repository, or live
  boundary was added.
- QA: focused Supervisor tests passed before broader closeout gates.
- Ship: commit only after full gate completion.
- Retro: D7 sharpened route entry semantics; D8 should now inject pre-boundary
  and boundary-reached approval failures.

## Superpowers Checklist

- Small scoped changes: yes.
- Tests first where practical: yes, D7 began by extending Supervisor tests.
- YAGNI: no new abstractions or runtime behavior.
- Evidence over claims: focused test result recorded in release notes.
- Clean git state target: required before D8.
- No unreviewed live automation: maintained.

## Review Notes

- Missing token and bad token remain blocked before route logic.
- Malicious origins and malicious preflight requests are blocked.
- Trusted preflight without a local-control header is blocked with
  `local_control_token_required`.
- Caller-supplied authority artifacts are rejected on every late-stage mutating
  route and are not echoed in responses.

## Skills Used And Why

- `gsd-spec-driver`: bounded the gate semantics goal and acceptance criteria.
- `gstack-delivery-workflow`: kept Plan/Build/Review/QA/Ship sequencing explicit.
- `superpowers-engineering-discipline`: enforced no scope creep and
  evidence-first hardening.
- `codexhub-architecture-planner`: preserved Supervisor route/package
  boundaries.
- `codexhub-workflow-policy-reviewer`: reviewed token, Origin, CORS, and
  authority invariants.
- `codexhub-release-auditor`: guided verification and release closeout.

## Skills Not Used And Why

- `codexhub-contract-designer`: no contract schema changed in D7.
- `codexhub-codex-exec-adapter`: Codex exec was not changed.
- `codexhub-playwright-qa`: Dashboard behavior was not modified.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, and
  telemetry exporter runtime skills: D7 reviewed Supervisor route gates only and
  did not expand those surfaces.
