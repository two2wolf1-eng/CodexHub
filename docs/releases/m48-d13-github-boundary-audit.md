# M48-D13 GitHub Boundary Audit

## GSD Spec

- Goal: deepen M0-M48 GitHub fixed-boundary regression coverage for PR management, merge, Actions, release/tag, and cleanup surfaces.
- Scope: `packages/github-provider-adapter` tests, D13 release/review docs, scaffold health registration, and orchestration registration.
- Non-scope: no product capability, provider, route, store repository, live boundary, remote write, push, pull request, release publish, or arbitrary GitHub passthrough.
- Acceptance criteria: focused GitHub adapter tests pass; scaffold health, governance audits, foundation verification, and diff checks pass before commit.
- Hard boundaries: all GitHub calls remain in the reviewed HTTP boundary file, write endpoints stay fixed, payloads stay shaped, and public output stays metadata/hash-only.
- Affected apps/packages: `packages/github-provider-adapter`, `.codexhub/orchestration.yaml`, `tools/scaffold-health.ts`, release/review docs.
- Risk level: critical, because GitHub write surfaces include PR management, merge, Actions, release draft/tag, and cleanup boundaries.

## GStack Plan

- Plan: add injected-fetch boundary tests rather than adding live calls or route behavior.
- Build: record method/path sequences for PR management, merge, Actions, and cleanup surfaces.
- Review: verify tests assert fixed endpoint shape and metadata-only output without broadening allowlists.
- QA: run GitHub adapter focused tests first, then full foundation gates.
- Ship: register D13 docs and commit after clean verification.
- Retro: D14 should continue into deployment fixed runner boundaries.

## Superpowers Checklist

- Small scoped test-first change.
- No unrelated refactor.
- No unreviewed live automation.
- No new GitHub endpoint or boundary.
- Evidence over claims: closeout requires recorded command results.

## Changes

- Added PR management endpoint sequence tests for labels, assignees, reviewers, milestones, and comments.
- Added merge and GitHub Actions endpoint sequence tests covering merge, observation, rerun, cancel, and fixed-ref dispatch.
- Added remote cleanup endpoint sequence tests proving cleanup stays limited to PR close plus `codexhub/` branch ref deletion.
- Kept all fetches injected and local to tests; no network call or product behavior changed.

## Verification

- `pnpm nx run github-provider-adapter:test --skip-nx-cache` passed.

## Workflow Skills Used And Why

- `gsd-spec-driver`: framed D13 goal, scope, non-scope, acceptance, and critical boundaries.
- `gstack-delivery-workflow`: kept the round in Plan/Build/Review/QA/Ship order.
- `superpowers-engineering-discipline`: kept the work scoped to tests/docs/registration and no live automation.

## Project Skills Used And Why

- `codexhub-architecture-planner`: confirmed the hardening stays inside the existing GitHub adapter package and boundary.
- `codexhub-workflow-policy-reviewer`: reviewed fixed endpoint, payload-shape, and metadata-only output invariants.
- `codexhub-release-auditor`: used for closeout verification and D14 residual-risk framing.

## Skills Not Used And Why

- `codexhub-contract-designer`: contracts were not changed.
- `codexhub-playwright-qa`: Dashboard UI was not changed.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, Codex exec runtime, deployment runtime, and external agent runtime skills were not used because this round stayed in injected GitHub boundary tests.
