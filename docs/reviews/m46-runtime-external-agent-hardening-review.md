# M46 Runtime External Agent Hardening Review

## Scope

Reviewed the M46 scheduler, queue, lock, lease, checkpoint, multi-agent coordination, external agent adapter, store records, Supervisor routes, Dashboard/CLI surfaces, and audits.

## Findings

No release-blocking governance defect remains after hardening. The main hardening addition is a no-live automation guard that rejects UI, CLI, and MCP source calling external agent execution helpers directly.

## Controls Verified

- External agent providers are limited to `codex-cli` and `claude-code-cli`.
- External agent runs require store-resolved dry-runs and approvals through Supervisor.
- Request-body approval artifacts, execution authority objects, raw prompts, raw patches, raw commands, raw paths, token values, environment values, request bodies, and response bodies are rejected by the Supervisor route guard.
- External agent output is metadata-only: patch hash, counts, evidence refs, audit ids, and boundary booleans.
- Runtime queue and lock records are metadata-only and do not grant capability authority.
- Dashboard `#/runtime` and CLI runtime/external agent list/show/status commands do not call adapters directly.
- MCP remains blocked from scheduling runtime jobs or invoking external agents.

## Hardening Changes

- Added audit sentinels for direct external agent runner imports from CLI, Dashboard, and MCP source.
- Added dynamic property sentinel for reconstructed external agent runner access.
- Registered M46 release/review/runbook artifacts in scaffold health.
- Registered runtime scheduler and external agent governance in CodexHub config.

## Verification Evidence

The focused checks and foundation gates were run for the changed contracts, kernels, store, Supervisor, CLI, Dashboard, docs, and audit tooling. `pnpm verify:foundation` completed successfully.

## Residual Risk

M46 does not yet provide platform-level backup/restore or operator role controls. Those are intentionally left for M47. Real external agent process invocation remains disabled and is represented by injected runner paths until a later governed live smoke.
