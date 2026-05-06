# M47-D1 Baseline Drift Debug

## GSD Spec

- Goal: confirm the M0-M47 baseline still matches the latest platform operations lifecycle commit.
- Scope: orchestration, integrations, scaffold health, capability matrix, latest commit chain, and no-live automation audit.
- Non-scope: no new capability, route, provider, store repository, or live boundary.
- Risk: critical, because this anchors the following 19 hardening rounds.

## Result

- Current baseline is `74b2b34a Harden platform operations lifecycle`.
- The worktree started clean and the branch was ahead of origin by 28 commits.
- M46 runtime/external agent and M47 platform operations registrations are present in orchestration, integrations, scaffold health, and the M0-M47 capability matrix.
- No baseline drift required implementation repair in this round.

## Verification

- `git status --short --branch`
- `pnpm scaffold:health`
- `pnpm audit:no-live-automation`

## Next Round

M47-D2 will tighten scaffold registration consistency so future missing release/review/runbook docs are caught earlier.
