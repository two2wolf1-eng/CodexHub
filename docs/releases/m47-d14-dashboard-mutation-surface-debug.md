# M47-D14 Dashboard Mutation Surface Debug

## Summary

M47-D14 hardened Dashboard mutation-surface regression coverage. The round did
not add product capability, routes, providers, store repositories, live
boundaries, remote writes, pushes, or pull requests.

## Scope

- `apps/dashboard`
- `.codexhub/orchestration.yaml`
- `tools/scaffold-health.ts`
- M47-D14 release/review documentation

## Findings

- No unsupported Dashboard mutation route was found.
- Dashboard guided mutation remains limited to the existing approval decision,
  recovery, merge, deployment operation, and policy/telemetry panels.
- Platform operations remain GET-only in the Dashboard source.
- No Dashboard token persistence alias was found.

## Fixes And Hardening

- Added a regression helper that extracts Dashboard POST route sets from
  `App.tsx` and compares them with an exact reviewed allowlist.
- Added guards against generic `/api` prefix expansion in Dashboard POST
  helpers.
- Added storage-alias checks covering local storage, session storage,
  IndexedDB, cookies, URL query parameters, and history mutation helpers.
- Registered D14 in orchestration and scaffold health.

## Verification

- `pnpm nx run dashboard:test --skip-nx-cache`

## Residual Risk

- D14 is static Dashboard source hardening. D15 should continue into CLI
  mutation allowlists and read-only command boundaries.
