# M47-D9 GitHub Fixed Boundary Review

## GSD Spec

- Goal: prove GitHub endpoint construction and mutating helper calls remain
  fixed, reviewed, and isolated to the GitHub HTTP boundary.
- Scope: GitHub provider adapter tests, orchestration registration, scaffold
  health, and closeout docs.
- Non-scope: new GitHub routes, providers, store repositories, live boundaries,
  remote writes, pushes, pull requests, release publish, or merge behavior
  changes.
- Acceptance: focused GitHub provider tests pass, scaffold health recognizes D9
  docs, and full foundation gates pass before commit.
- Hard boundaries: no arbitrary GitHub passthrough, no release publish, no
  push/force/update-ref drift, and no raw token/body/response public output.
- Affected projects: `github-provider-adapter`, docs, orchestration, scaffold
  tooling.
- Risk level: critical, because GitHub endpoint drift can silently widen remote
  write authority.

## GStack Delivery

- Plan: add the smallest source-level regression net around the existing GitHub
  boundary, then register and verify the round.
- Build: changed only adapter tests plus governance docs/config/tooling.
- Review: confirmed no new runtime behavior, route, provider, store repository,
  or live boundary was added.
- QA: focused GitHub provider tests were run before broader closeout gates.
- Ship: commit only after full gate completion.
- Retro: D9 strengthened GitHub remote boundary drift checks; D10 should focus
  on deployment/platform process boundaries.

## Superpowers Checklist

- Small scoped changes: yes.
- Tests first where practical: yes, D9 began with a boundary regression test.
- YAGNI: no new scanner framework or runtime abstraction.
- Evidence over claims: focused test result recorded in release notes.
- Clean git state target: required before D10.
- No unreviewed live automation: maintained.

## Review Notes

- Direct GitHub API route fragments are now checked against production source
  outside `github-http-boundary.ts`.
- The mutating helper call sequence is intentionally pinned; adding a write path
  will now require an explicit test update.
- Forbidden terms cover unreviewed GraphQL, deployments, contents, release
  publish, force, auto-merge, collaboration, and team surfaces.
- Public output remains metadata/hash-only; no token, response body, raw PR body,
  or release body persistence was introduced.

## Skills Used And Why

- `gsd-spec-driver`: bounded D9 to GitHub fixed-boundary drift.
- `gstack-delivery-workflow`: kept Plan/Build/Review/QA/Ship sequencing explicit.
- `superpowers-engineering-discipline`: enforced small tests and no scope creep.
- `codexhub-architecture-planner`: reviewed package boundary ownership and kept
  the GitHub HTTP boundary single-file.
- `codexhub-workflow-policy-reviewer`: reviewed remote authority, evidence, and
  no-passthrough invariants.
- `codexhub-release-auditor`: guided verification and release closeout.

## Skills Not Used And Why

- `codexhub-contract-designer`: no contract schema changed in D9.
- `codexhub-codex-exec-adapter`: Codex exec was not changed.
- `codexhub-playwright-qa`: Dashboard behavior was not modified.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, and
  telemetry exporter runtime skills: D9 reviewed GitHub provider source only and
  did not expand those surfaces.
