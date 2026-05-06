# M46 Runtime Scheduler And External Agent Results

## Summary

M46 adds the governed runtime operations foundation for scheduler metadata and external agent patch runs. The v1 external agent providers are `codex-cli` and `claude-code-cli`, but execution remains disabled by default and is constrained to controlled sibling worktrees through Supervisor-governed dry-run, persisted approval, evidence, and audit records.

## Delivered

- Runtime contracts for jobs, queue entries, leases, locks, retry policies, checkpoints, and multi-agent slot summaries.
- External agent contracts for manifests, readiness, patch plans, approval artifacts, patch summaries, runs, and fixture rehearsal runs.
- Runtime kernel helpers for deterministic queue, lock, lease, checkpoint, retry, and rehearsal metadata.
- External agent adapter helpers with fixed argv-shape hashes and injected-runner-only execution in this stage.
- Store repositories for runtime jobs, queue entries, leases, locks, checkpoints, worker heartbeats, multi-agent slots, external agent dry-runs, approvals, runs, and patch summaries.
- Supervisor control planes under `/api/runtime/*` and `/api/agents/external/*`.
- Read-only Dashboard `#/runtime` summaries and CLI list/show/status commands.
- Fixture CLI rehearsal for runtime scheduler and external agent governance paths.

## Safety Outcome

- No external agent CLI is started by default.
- Raw prompt, instructions, diff, patch, command, path, token, environment value, request body, and response body are not persisted or returned.
- External agent patch output is reduced to hashes, counts, evidence references, and audit ids.
- UI, CLI, and MCP direct external agent execution helpers are covered by the no-live automation audit.
- Multi-agent coordination remains metadata-only and must flow through workflow-kernel governance.

## Verification

- `pnpm nx run-many --target=test "--projects=contracts,runtime-operations-kernel,external-agent-adapter,store-sqlite,supervisor,cli,dashboard" --skip-nx-cache`
- `pnpm nx run-many --target=lint "--projects=contracts,runtime-operations-kernel,external-agent-adapter,store-sqlite,supervisor,cli,dashboard" --skip-nx-cache`
- `pnpm nx run-many --target=build "--projects=contracts,runtime-operations-kernel,external-agent-adapter,store-sqlite,supervisor,cli,dashboard" --skip-nx-cache`
- `pnpm scaffold:health`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm audit:no-live-automation`
- `pnpm audit:skills`
- `pnpm verify:foundation`
- `git diff --check`

## Residual Risk

- Runtime job approval routes are not used for direct work execution in M46; external agent patch runs carry the approval boundary.
- Dashboard runtime/external-agent operation remains read-only in this stage, even though route-level control planes exist.
- Real Codex CLI and Claude Code CLI process execution is not smoke-tested here; the boundary is represented by fixed argv-shape metadata and injected runners only.
