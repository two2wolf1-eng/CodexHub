# M47-D16 MCP Boundary Surface Debug

## Summary

M47-D16 hardened MCP source-boundary regression coverage. The round did not
add product capability, routes, providers, store repositories, live boundaries,
remote writes, pushes, or pull requests.

## Scope

- `apps/codexhub-mcp-server`
- `.codexhub/orchestration.yaml`
- `tools/scaffold-health.ts`
- M47-D16 release/review documentation

## Findings

- No MCP runtime, external-agent, or platform mutation route drift was found.
- No MCP direct adapter execute path was found.
- MCP bootstrap environment access remains limited to MCP transport/host/port
  and the MCP-local HTTP control key.
- No GitHub token or Supervisor local-control token read was found in MCP
  production source.

## Fixes And Hardening

- Added MCP source tests that pin bootstrap/security environment access to the
  narrow MCP-owned variables.
- Added MCP production-source tests that reject runtime, external-agent,
  platform, Browser, Electron, and MCP write route terms.
- Added guards against process/network boundary imports and dynamic env access
  in MCP bootstrap/security source.
- Registered D16 in orchestration and scaffold health.

## Verification

- `pnpm nx run codexhub-mcp-server:test --skip-nx-cache`

## Residual Risk

- D16 is MCP static/source hardening. D17 should continue into rehearsal matrix
  completeness across late-stage capability surfaces.
