# M0-M24 Deep Governance Debug Review

## Scope

M24.7 reviewed the M0-M24 governance baseline after the M24.6 foundation hardening pass. The review focused on static audit coverage, read-only human interfaces, MCP read-only tools, late-stage GitHub and custom workflow chains, and metadata-only public output.

## Control-Plane Coverage Map

| Chain | Authority Source | Boundary | Human Entry | Public Output |
| --- | --- | --- | --- | --- |
| Codex / Nx | policy decision plus persisted approval where execution is live | approved process boundaries | CLI and Dashboard summaries | ids, hashes, status, evidence, audit |
| MCP read-only | MCP tool policy and audit store | no live execution boundary | MCP read-only tools | structured summary plus evidence/audit refs |
| Browser / Electron | Supervisor dry-run, persisted approval, execution authority | approved Playwright, HTTP, or WebSocket boundary | Dashboard/CLI read-only records | target/profile/event hashes and counts |
| Worktree / cleanup | store-resolved approval plus hash-bound runtime input | single audited git boundary | Dashboard/CLI read-only records | path hashes, diff counts, cleanup flags |
| Review / RC packages | store-resolved approval plus artifact root policy | audited local artifact write boundaries | Dashboard/CLI read-only records | artifact hashes and byte/file counts |
| GitHub remote | store-resolved approval plus fixed endpoint boundary | single audited GitHub HTTP boundary | Dashboard/CLI read-only records | repo/ref/PR/commit hashes and boundary booleans |
| Rework / supersede / custom workflow | workflow approval plus child control-plane approvals | no direct child adapter execution | Dashboard/CLI projections and rehearsals | chain ids, hashes, blockers, evidence, audit |

## Findings And Fixes

- Static direct-execute audit was strengthened from a hand-maintained helper list to automatic discovery of public `execute*` function and const exports.
- Direct adapter execute protection now covers Dashboard, CLI, and MCP server production source.
- MCP read-only tool tests now assert that tools do not import or call adapter execute helpers, process modules, fetch, GitHub token env, or local-control token env.
- M24.7 governance docs and scaffold health now require this deep-debug review and release checkpoint.

## Rechecked Invariants

- Mutating Supervisor and orchestrator routes remain behind local-control token and trusted loopback Origin gates.
- Request-body approval artifacts and execution authorities remain untrusted; governed paths resolve authority from persisted records.
- Public projections remain metadata-only: ids, hashes, counts, statuses, summaries, evidence refs, audit ids, and boundary booleans.
- Capability providers remain execution or observation providers only; they do not grant authority.
- Dashboard and CLI read-only views remain degraded-safe and do not persist local-control tokens.

## Residual Risk

- GitHub remote write and local artifact write boundaries are intentionally present for already completed milestones. They remain disabled by default and approval-gated.
- Custom workflow templates can coordinate long chains, so M25+ production templates should continue to get template-specific release review.
- This round did not perform real remote writes, Browser act, Electron main inspector, MCP write tools, policy runtime execution, or telemetry export.

## Release Decision

M0-M24 remains suitable as the pre-M25 governance baseline. The new audit behavior makes future UI/CLI/MCP direct-execute regressions harder to introduce without failing `audit:no-live-automation`.
