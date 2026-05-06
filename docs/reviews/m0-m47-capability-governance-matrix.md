# M0-M47 Capability Governance Matrix

Status: completed

This matrix extends the M0-M45 baseline with M46 runtime/external agent operations and M47 platform operations.

| Surface | Current Stage | Default State | Mutation Authority | Boundary | Public Output Rule |
| --- | --- | --- | --- | --- | --- |
| Runtime scheduler | M46 | Disabled | Supervisor local-control plus persisted approval for governed jobs | Durable SQLite queue, lock, lease, checkpoint repositories | Queue, lock, lease, retry, cancel, and checkpoint records are metadata-only. |
| External agents | M46 | Disabled | Independent approval for every agent run | Fixed Codex CLI and Claude Code CLI argv boundary | Prompt, diff, patch, command, and path content are transient or hash-only. |
| Multi-agent coordination | M46 | Disabled | Workflow-kernel coordination only | Runtime slot state records | Agent slots expose ids, hashes, statuses, counts, evidence, and audit only. |
| Platform backups | M47 | Disabled | Persisted approval | Local backup target under configured backup root | Backup manifests are hash/count summaries; raw database rows are not public output. |
| Platform restores | M47 | Disabled; rehearsal-first | Restore replacement requires two approvals | Isolated restore rehearsal by default; active replacement disabled | Restore records expose manifest hashes, statuses, evidence, and audit only. |
| Store migrations | M47 | Disabled | Persisted approval | Built-in migration ids only | No request-body migration text or raw database body is accepted. |
| Retention | M47 | Disabled | Persisted approval | Preview before destructive retention | Retention output is counts/status summaries and requires backup readiness. |
| Audit export | M47 | Disabled | Persisted approval | Local metadata-only JSONL plus manifest hash | Raw audit bodies are not persisted or returned. |
| Operator roles | M47 | Disabled | Persisted approval | Operator hashes and role scopes only | Operator identities are represented by hashes and scopes. |
| Dashboard | M0-M47 | Read-mostly | Only reviewed guided panels | Supervisor route allowlists | No credential persistence and no direct adapter execution. |
| CLI | M0-M47 | Read-mostly | Existing approval decision path only for generic approvals | Exact command allowlists | No generic POST helper and no credential argument. |
| MCP server | M0-M47 | Read-only for platform operations | None for platform operations | No direct runtime, agent, backup, restore, migration, retention, audit export, or role mutation | Metadata-only responses. |

## Governance Baseline

- Product defaults remain disabled for M46/M47.
- External agent writes are isolated to governed sibling worktrees.
- Platform operations are local only; network backup/export is out of scope.
- Active store replacement is critical and requires two approvals.
- Capability providers remain non-authoritative; CodexHub approval, evidence, and audit stay final.

## M47-D Debug Completion

The M47-D series is complete and remains review-only. It added no providers, routes, store repositories, live boundaries, remote writes, pushes, or pull requests.

| Round | Governance Area | Completion State |
| --- | --- | --- |
| D1-D2 | Baseline drift and registration | Completed with docs, orchestration, integrations, and scaffold health aligned. |
| D3-D5 | Contracts, projections, and store round trips | Completed with metadata-only fuzz and round-trip coverage. |
| D6-D8 | Supervisor gates and approval semantics | Completed with route drift, token/Origin, CORS, authority rejection, and approval consumption checks. |
| D9-D13 | Capability boundaries | Completed across GitHub, deployment, platform, runtime, external agents, Browser, Electron, MCP, policy, and telemetry. |
| D14-D16 | Operator surfaces | Completed for Dashboard, CLI, and MCP mutation/read-only allowlists. |
| D17-D18 | Rehearsals and degraded states | Completed for late-stage scenarios and major operator routes. |
| D19 | Adversarial static audits | Completed with negative fixtures for imports, dynamic execution, generic POST/URL builders, token storage, env reads, and argv passthrough. |
| D20 | Final baseline | Completed with final release, review, runbook, matrix, orchestration, and scaffold health registration. |

Future milestones must treat this file as the starting capability/governance matrix and update it before broadening any execution surface.
