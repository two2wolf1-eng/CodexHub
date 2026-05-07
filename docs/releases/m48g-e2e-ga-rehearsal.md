# M48g E2E GA Rehearsal

## Summary

M48g strengthens the Production GA fixture rehearsal chain for `patch -> verify -> PR -> merge -> release -> deploy -> observe -> rollback`.

- Each scenario now derives deterministic metadata-only step counts.
- Failed steps mark later steps blocked.
- Blocked steps preserve completed-before-block counts.
- Conditional live smoke remains recorded as `readiness_blocked` unless an operator-configured environment completes it.

## Safety

- The GA rehearsal does not call child adapters.
- Rehearsal records store hashes, counts, statuses, evidence refs, audit ids, and boundary booleans only.
- Raw E2E payloads, child artifacts, authority objects, tokens, paths, logs, patches, and request/response bodies remain rejected.

## Verification

- `pnpm nx run production-ga-kernel:test --skip-nx-cache`
- `pnpm nx run supervisor:test --skip-nx-cache`
- `pnpm scaffold:health`
- `pnpm audit:no-live-automation`
- `git diff --check`
