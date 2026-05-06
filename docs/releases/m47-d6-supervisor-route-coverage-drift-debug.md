# M47-D6 Supervisor Route Coverage Drift Debug

## Summary

M47-D6 hardened the Supervisor route drift net so late-stage mutating helper routes
cannot silently diverge from the local-control gate matrix. The round did not add
product capability, routes, providers, store repositories, live boundaries, or
remote writes.

## Scope

- `apps/supervisor`
- `.codexhub/orchestration.yaml`
- `tools/scaffold-health.ts`
- M47-D6 release/review documentation

## Findings

- No unguarded POST route was found.
- The existing test already compared registered POST route families with the
  late-stage gate matrix.
- The previous drift guard did not independently inspect helper-generated POST
  suffixes, so a helper could add a new suffix and only be caught indirectly
  through a broader route registration change.

## Fixes And Hardening

- Added a focused helper-suffix drift regression for late-stage Supervisor route
  registration helpers.
- The new check verifies that every standard helper still registers only the
  expected `dry-runs`, `approval-requests`, `manual-approvals`, and `runs`
  mutation suffixes, with explicit exceptions for version plans, rollback plans,
  and runtime jobs.
- Registered the round in orchestration and scaffold health.

## Verification

- `pnpm nx run supervisor:test --skip-nx-cache`

## Residual Risk

- D6 verifies route coverage drift. It does not exercise every approval
  consumption path; those boundary semantics remain assigned to later M47-D
  rounds.
