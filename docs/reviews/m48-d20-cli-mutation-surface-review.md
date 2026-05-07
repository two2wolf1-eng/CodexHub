# M48-D20 CLI Mutation Surface Review

## Review Scope

- `apps/cli/src/main.test.ts`
- D20 scaffold and orchestration registration

## Findings

D20 did not find a product implementation bug. Existing CLI tests already covered POST count, local-control headers, token option bans, and read-only command-family isolation. The new hardening closes a drift gap by proving every POST call is owned by an explicitly reviewed function, so a future generic helper or relocated mutation cannot pass merely by preserving the total POST count.

No new CLI command, route, provider, store repository, live boundary, remote write, push, or PR was added.

## Controls Confirmed

- Every CLI POST call site is local-control gated.
- POST call ownership is restricted to the reviewed exact helper list.
- CLI still has no `--token`, `--local-token`, or `--local-control-token` option.
- Read-only command families remain free of local-control token reads, POST calls, adapter execution, and direct execute helpers.
- Generic POST helper drift is statically blocked.

## Residual Risk

D20 does not inspect MCP production source. D21 should scan MCP source for process/network/env token access, adapter execute calls, runtime/platform/GA mutation bypasses, and indirect dynamic import drift.

## Verification Evidence

- `pnpm nx run cli:test --skip-nx-cache` passed.

## Workflow Skills Used And Why

- `gsd-spec-driver`: bounded D20 as CLI mutation-surface debug only.
- `gstack-delivery-workflow`: guided staged inspection, test hardening, review, and QA.
- `superpowers-engineering-discipline`: kept the round small, reversible, and product-behavior-neutral.

## Project Skills Used And Why

- `codexhub-architecture-planner`: checked command/package boundaries.
- `codexhub-workflow-policy-reviewer`: checked token, POST, approval, and adapter bypass invariants.
- `codexhub-release-auditor`: shaped verification evidence and next-risk notes.

## Skills Not Used And Why

- `codexhub-contract-designer`: no schema changed.
- `codexhub-playwright-qa`: no Dashboard behavior changed.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, Codex exec runtime, deployment runtime, and external agent runtime skills were not used because D20 did not modify those execution surfaces.
