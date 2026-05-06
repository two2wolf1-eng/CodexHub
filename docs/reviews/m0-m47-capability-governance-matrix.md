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
