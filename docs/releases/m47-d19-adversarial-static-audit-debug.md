# M47-D19 Adversarial Static Audit Debug

## Summary

M47-D19 hardened the no-live automation audit against future false negatives.
The round added no product capability, routes, providers, store repositories,
live boundaries, remote writes, pushes, or pull requests.

## Scope

- `tools/audit-no-live-automation.ts`
- `.codexhub/orchestration.yaml`
- `tools/scaffold-health.ts`
- M47-D19 release/review documentation

## Findings

- The audit already contained broad adversarial sentinels for adapter execute,
  Dashboard mutation, MCP env/network access, GitHub endpoint drift, and token
  persistence.
- Sentinel self-checks did not previously exercise the same TypeScript import
  and call-expression scans used by the real file audit.

## Fixes And Hardening

- Updated adversarial sentinel execution to run import and call-expression
  checks before text and scoped helper checks.
- Added negative sentinels for array-joined dynamic execute property access,
  external process import aliases, bare `spawn` with argv passthrough, bracket
  `fetch` POST aliases, split storage wrappers, double-quoted segmented GitHub
  ref URL builders, and CLI local-control token env reads.
- Registered D19 in orchestration and scaffold health.

## Verification

- `pnpm audit:no-live-automation`

## Residual Risk

- D19 strengthens static audit sentinels. D20 should produce the final M0-M47
  governance baseline and run the full closeout gates.
