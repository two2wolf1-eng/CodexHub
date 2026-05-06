# M47-D9 GitHub Fixed Boundary Debug

## Summary

M47-D9 hardened the GitHub provider against fixed-boundary drift. The round did
not add product capability, routes, providers, store repositories, live
boundaries, remote writes, pushes, or pull requests.

## Scope

- `packages/github-provider-adapter`
- `.codexhub/orchestration.yaml`
- `tools/scaffold-health.ts`
- M47-D9 release/review documentation

## Findings

- No arbitrary GitHub endpoint passthrough defect was found.
- The single reviewed HTTP boundary file still owns concrete GitHub endpoint
  construction.
- A narrow exception remains for the provider manifest host constant in
  `index.ts`; it is not a route or write endpoint.

## Fixes And Hardening

- Added a source guard proving direct GitHub endpoint construction terms stay
  out of production source files except the reviewed boundary file.
- Added a mutating helper callset regression so future write endpoint expansion
  must intentionally update the fixed boundary test.
- Added forbidden-term coverage for GraphQL, deployments, contents, release
  publish drift, auto-merge, force, and unreviewed collaboration/team surfaces.
- Registered D9 in orchestration and scaffold health.

## Verification

- `pnpm nx run github-provider-adapter:test --skip-nx-cache`

## Residual Risk

- D9 is source-level boundary hardening. D10 should continue into deployment and
  platform operation boundaries, where shell/process drift is the larger risk.
