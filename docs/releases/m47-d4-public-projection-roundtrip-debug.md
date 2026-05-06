# M47-D4 Public Projection Round Trip Debug

Status: completed

## GSD Spec

- Goal: verify representative public projection paths remain metadata-only after serialize/list/get style JSON round trips.
- Scope: governance projection, operator readiness, Dashboard summaries, CLI formatters, MCP tool summaries, docs, and scaffold registration.
- Non-scope: no provider, route, store repository, live boundary, remote write, push, or pull request behavior.
- Risk: critical, because public projection paths sit between governed stores and operator-facing surfaces.
- Acceptance: adversarial store values are hashed out of MCP development-request summaries; focused MCP tests and full foundation gates pass.

## Result

- Fixed MCP `getOpenDevelopmentRequests` output to expose development run ids, titles, and summaries as hashes/counts/statuses instead of raw request metadata.
- Added an adversarial MCP store round-trip regression that feeds raw prompt/path/token/log/SQL/audit fixtures through the tool response.
- Registered D4 release/review docs in scaffold health and orchestration.

## Verification

- `pnpm nx run codexhub-mcp-server:test --skip-nx-cache`
- `pnpm nx run-many --target=test "--projects=governance-projection-kernel,operator-readiness-kernel,dashboard,cli,codexhub-mcp-server" --skip-nx-cache`
- `pnpm scaffold:health`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm audit:no-live-automation`
- `pnpm audit:skills`
- `pnpm verify:foundation`
- `git diff --check`
