# M0-M45 Operator Surface Boundaries Review

Status: completed

## Review Scope

- Dashboard governed mutation panels and read-only controlled write views.
- CLI read-only command groups, approval decisions, and M45 exact controlled write commands.
- MCP production source read-only boundaries.
- Static audit coverage for token options, dynamic POST route guards, forged authority payloads, raw controlled-write input, direct adapter execute, and direct process/network access.

## Findings

- No new bypass was found in operator source.
- The strongest residual risk was future drift: a CLI command could add a token option, route-prefix guard, forged artifact payload, or raw patch/text field without changing provider code.
- MCP had broad read-only source coverage; adding the M45 controlled worktree tool-name guard makes that surface more explicit.

## Debug Hardening

- Added exact-route CLI tests for M45 controlled Browser/Electron/MCP mutation commands.
- Added MCP production-source protection for `workspace.applyPatchToControlledWorktree`.
- Added adversarial audit fixtures to prove no-live automation detects CLI token arguments, dynamic route-prefix checks, forged approval artifact payloads, and raw patch payloads.

## Residual Risk

- This round is source/audit hardening only. It does not execute Browser actions, Electron inspector commands, MCP writes, policy backends, telemetry exporters, deployments, or GitHub writes.
- Historical CLI mutation commands remain governed by their existing tests and routes; this round specifically tightens the newest M45 controlled write surface and generic operator drift patterns.

## Skills Used And Why

- `gsd-spec-driver`: scoped the debug round to operator surface boundaries.
- `gstack-delivery-workflow`: kept delivery in Plan/Build/Review/QA/Ship order.
- `superpowers-engineering-discipline`: added tests/audits without expanding capability.
- `codexhub-architecture-planner`: reviewed operator-to-control-plane boundaries.
- `codexhub-workflow-policy-reviewer`: reviewed token, authority, and child capability isolation.
- `codexhub-playwright-qa`: reviewed Dashboard mutation and degraded-state expectations.
- `codexhub-release-auditor`: documented verification, rollback, and residual risk.
