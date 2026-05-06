# M47-D11 Runtime External Agent Boundary Debug

## Summary

M47-D11 hardened runtime scheduler and external agent boundary regression
coverage. The round did not add product capability, routes, providers, store
repositories, live boundaries, remote writes, pushes, or pull requests.

## Scope

- `packages/runtime-operations-kernel`
- `packages/external-agent-adapter`
- `.codexhub/orchestration.yaml`
- `tools/scaffold-health.ts`
- M47-D11 release/review documentation

## Findings

- No runtime scheduler process, network, worker, or adapter bypass defect was
  found.
- External agent execution already uses fixed argv shapes for Codex CLI and
  Claude Code CLI.
- Codex CLI fixed argv includes `--json`; the regression test was updated to
  lock that reviewed shape.
- External agent public summaries already avoid raw prompt, diff, patch,
  command, and worktree path persistence.

## Fixes And Hardening

- Added a runtime source guard against direct child-process, network, worker,
  Codex/GitHub execution, and external-agent runner bypass drift.
- Added deterministic runtime metadata coverage for queue ordering, retry
  policy, concurrency limits, lease expiry, locks, checkpoints, and boundary
  booleans.
- Added an external-agent source guard against generic process passthrough,
  unsafe flags, repo-root mutation drift, and raw command persistence.
- Added external-agent rehearsal coverage for repo-root blocked and command
  passthrough blocked states.
- Registered D11 in orchestration and scaffold health.

## Verification

- `pnpm nx run external-agent-adapter:test --skip-nx-cache`
- `pnpm nx run runtime-operations-kernel:test --skip-nx-cache`

## Residual Risk

- D11 is package-level boundary hardening. D12 should continue into Browser,
  Electron, and MCP controlled write surface boundaries.
