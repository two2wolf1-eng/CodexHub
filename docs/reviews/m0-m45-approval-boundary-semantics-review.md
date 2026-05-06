# M0-M45 Approval Boundary Semantics Review

Status: completed

## Review Scope

- Late-stage approval state transitions for GitHub, deployment, policy telemetry, controlled write, and production recovery control planes.
- Pre-boundary block behavior, boundary-started failure behavior, approval reuse, and request-body authority rejection.
- Store-resolved public dry-run id behavior for M44/M45 run routes.

## Findings

- Found a real control-plane defect in the newest surfaces: M44 policy/telemetry and M45 controlled write run routes looked up dry-runs by internal record id only, while public control-plane payloads use `dryRunId`.
- This prevented those routes from reaching the approval-consumption branch in normal public-id flows.

## Debug Fix

- Resolved M44/M45 dry-runs by internal id first, then by public `dryRunId`.
- Added regression coverage that proves disabled/pre-boundary runs leave approvals unused.
- Added regression coverage that proves governed M44/M45 runs consume approvals exactly once and block approval reuse.
- Added deployment operation boundary failure coverage for one-time approval consumption and truthful boundary booleans.

## Residual Risk

- This round uses injected/fixture Supervisor paths only. It does not run real providers, remote writes, Browser actions, Electron inspector calls, or MCP mutations.
- Older route families retain their existing resolver patterns; this round changed only the surfaces where the new regression exposed a defect.

## Skills Used And Why

- `gsd-spec-driver`: constrained the round to approval and boundary semantics debug hardening.
- `gstack-delivery-workflow`: kept the work in Plan/Build/Review/QA/Ship order.
- `superpowers-engineering-discipline`: made the smallest resolver fix and avoided new capability.
- `codexhub-workflow-policy-reviewer`: reviewed approval consumption and request-body authority invariants.
- `codexhub-release-auditor`: documented verification, rollback, and residual risk.
