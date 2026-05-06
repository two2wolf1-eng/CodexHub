# M47-D15 CLI Mutation Surface Debug

## Summary

M47-D15 hardened CLI mutation-surface regression coverage. The round did not
add product capability, routes, providers, store repositories, live boundaries,
remote writes, pushes, or pull requests.

## Scope

- `apps/cli`
- `.codexhub/orchestration.yaml`
- `tools/scaffold-health.ts`
- M47-D15 release/review documentation

## Findings

- No unsupported CLI mutation surface was found.
- Existing CLI POST call sites remain local-control gated through the shared
  header helper.
- Read-only CLI command registrations remain free of local-control mutation
  helpers.
- No CLI token option or token persistence alias was found.

## Fixes And Hardening

- Added a regression test that scans every CLI POST call site and verifies it
  uses local-control headers.
- Added guards against generic `/api` prefix expansion around POST call sites.
- Added guards for token options and storage aliases.
- Added read-only registration checks for GitHub, Actions, releases,
  deployments, runtime, external agents, platform operations, secrets, and PR
  management command families.
- Registered D15 in orchestration and scaffold health.

## Verification

- `pnpm nx run cli:test --skip-nx-cache`

## Residual Risk

- D15 is CLI source hardening. D16 should continue into MCP production source
  boundaries and tool-surface drift.
