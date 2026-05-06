# M47-D6 Supervisor Route Coverage Drift Review

## GSD Spec

- Goal: ensure newly introduced late-stage Supervisor POST route helper suffixes
  cannot bypass the table-driven gate matrix.
- Scope: Supervisor route-registration tests, orchestration registration,
  scaffold health, and closeout docs.
- Non-scope: new routes, providers, store repositories, live boundaries, real
  remote writes, pushes, or pull requests.
- Acceptance: focused Supervisor tests pass, scaffold health recognizes D6 docs,
  and full foundation gates pass before commit.
- Hard boundaries: all mutating Supervisor routes must remain behind
  local-control token, trusted loopback Origin, non-wildcard CORS, and
  request-body authority/artifact rejection coverage.
- Affected projects: `supervisor`, docs, orchestration, scaffold tooling.
- Risk level: critical, because route drift is a direct governance bypass risk.

## GStack Delivery

- Plan: start from the clean D5 baseline, add a small static helper-suffix
  regression, run focused Supervisor tests, then register the round.
- Build: changed only Supervisor tests plus governance docs/config/tooling.
- Review: confirmed no product route or live boundary was added.
- QA: focused Supervisor tests passed before broader closeout gates.
- Ship: commit only after full gate completion.
- Retro: D6 makes future helper-level route drift harder to miss; D7 should now
  stress token, Origin, CORS, and request-body authority semantics across the
  full matrix.

## Superpowers Checklist

- Small scoped changes: yes.
- Tests first where practical: yes, the route drift regression was added before
  docs registration.
- YAGNI: no new abstractions or runtime behavior.
- Evidence over claims: focused test result recorded in release notes.
- Clean git state target: required before D7.
- No unreviewed live automation: maintained.

## Review Notes

- Helper route suffixes are now checked at the source helper level, not just via
  final route registration.
- Standard approval route helpers remain limited to their expected mutating
  suffixes.
- Runtime job and release version plan helpers keep their documented narrower
  suffix sets.

## Skills Used And Why

- `gsd-spec-driver`: bounded the route drift goal and acceptance criteria.
- `gstack-delivery-workflow`: kept Plan/Build/Review/QA/Ship sequencing explicit.
- `superpowers-engineering-discipline`: enforced no scope creep and
  evidence-first hardening.
- `codexhub-architecture-planner`: preserved Supervisor route/package
  boundaries.
- `codexhub-workflow-policy-reviewer`: checked local-control, authority, and
  approval gate invariants.
- `codexhub-release-auditor`: guided verification and release closeout.

## Skills Not Used And Why

- `codexhub-contract-designer`: no contract schema changed in D6.
- `codexhub-codex-exec-adapter`: Codex exec was not changed.
- `codexhub-playwright-qa`: Dashboard behavior was not modified.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, and
  telemetry exporter runtime skills: D6 reviewed Supervisor route tests only and
  did not expand those surfaces.
