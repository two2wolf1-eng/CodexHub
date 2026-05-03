# 0003 Nx Affected Adapter

## Decision

CodexHub will integrate Nx affected verification through `packages/nx-verification-adapter`.
CodexHub remains the authority provider; Nx is only a verification capability provider.

## Provider

- Project: Nx
- Use: affected project discovery and allowlisted verification targets
- Provider type: external process
- Adapter: `nx-verification-adapter`
- Product default: disabled until Supervisor/Orchestrator wiring is reviewed

## License / Supply Chain

- License: MIT, tracked through the workspace package lock and existing Nx dev dependency.
- Version strategy: use the pinned workspace dependency; adapter fixtures cover command output parsing so upgrades can be reviewed without widening command input.
- Sensitive data handling: command output is treated as evidence input only and stored as hashes, counts, affected project names, exit code, status, and summaries.

## Process Boundary

- The adapter may start one audited local process boundary in
  `packages/nx-verification-adapter/src/process-boundary.ts`.
- The boundary uses `shell:false`, fixed argv builders, closed stdin, and metadata-only results.
- Dry-run planning must not use `nx affected --dry-run`; affected discovery uses
  `nx show projects --affected`, while execution uses `nx affected -t lint,test,build`.

## Policy

- Default risk: low
- Default action mode: read
- Allowed targets: `lint`, `test`, `build`
- Arbitrary shell commands and arbitrary flags are forbidden.
- Execution requires `ExecutionAuthority.allowed=true` and a non-empty `policyDecisionId`.

## Evidence

- stdout and stderr bodies are not persisted.
- Evidence stores command hashes, output hashes, line counts, affected project names,
  exit code, status, and summaries.
- Run evidence uses `verification.dry_run_plan`, `verification.command_summary`,
  and `verification.run_summary`.

## Rollback

Disable the `nx-affected` integration in `.codexhub/integrations.yaml`, remove the adapter
from orchestration wiring, and remove the process boundary allowlist entry if the package is
deleted.
