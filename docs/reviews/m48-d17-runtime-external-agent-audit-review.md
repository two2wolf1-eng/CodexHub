# M48-D17 Runtime External Agent Audit Review

## Review Scope

- `packages/external-agent-adapter/src/external-agent-adapter.test.ts`
- `packages/external-agent-adapter/src/index.ts`
- `packages/runtime-operations-kernel/src/runtime-operations-kernel.test.ts`
- D17 scaffold and orchestration registration

## Findings

D17 found one implementation gap: `runExternalAgentPatchWithRunner` could cross the injected process boundary when the plan was `planned` and the approval was `approved`, even if readiness was blocked or the approval artifact belonged to a stale plan. The fix requires readiness gates, worktree hash binding, approval status, dry-run id, dry-run record id, and expected plan hash to match before invoking the runner.

No new provider, route, store repository, live boundary, process runner, CLI invocation, generic argv passthrough, direct multi-agent spawn, or repo-root mutation was added.

## Controls Confirmed

- Runtime source remains free of direct process, network, worker, and adapter execution bypasses.
- Runtime queue entries, leases, locks, retries, and checkpoints are metadata-only and deterministic.
- External agent manifests remain fixed argv for Codex CLI and Claude Code CLI.
- External agent prompts, instructions, patch content, commands, and paths remain hash-only in public output.
- External agent boundary entry now requires readiness and approval to be store-resolved and plan-bound.

## Residual Risk

D17 does not inspect platform backup, restore, migration, retention, audit export, or operator role boundaries. D18 should focus on those platform operations surfaces.

## Verification Evidence

- `pnpm nx run external-agent-adapter:test --skip-nx-cache` failed before the fix.
- `pnpm nx run external-agent-adapter:test --skip-nx-cache` passed after the fix.

## Workflow Skills Used And Why

- `gsd-spec-driver`: bounded D17 as runtime/external-agent audit only.
- `gstack-delivery-workflow`: guided staged test, fix, review, and QA.
- `superpowers-engineering-discipline`: kept the fix narrow and metadata-only.

## Project Skills Used And Why

- `codexhub-architecture-planner`: checked no new control-plane or package boundary was introduced.
- `codexhub-workflow-policy-reviewer`: reviewed readiness and approval binding before execution.
- `codexhub-release-auditor`: shaped closeout evidence and next-risk notes.

## Skills Not Used And Why

- `codexhub-contract-designer`: no schema changed.
- `codexhub-playwright-qa`: no Dashboard behavior changed.
- `codexhub-codex-exec-adapter`: no Codex exec control-plane behavior changed.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, deployment runtime, and external agent runtime skills were not used because D17 stayed in local tests and boundary predicate hardening.
