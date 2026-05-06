# M0-M32 Final Adversarial Debug Review

Review round: M32.7

Objective:
- Close the five-round M32.3-M32.7 debug sequence with a final adversarial governance baseline before future production automation work.

Rounds covered:
- M32.3: control-plane coverage drift matrix for late-stage Supervisor route families.
- M32.4: public projection and store round-trip fuzz coverage.
- M32.5: approval and boundary failure semantics.
- M32.6: operator UX, CLI, and MCP smoke boundaries.
- M32.7: final audit negative fixtures and capability/governance matrix registration.

Findings and fixes:
- Route coverage drift is now guarded by matrix-derived tests for mutating late-stage control planes.
- Public projection/store round trips have additional adversarial fixture coverage for raw prompt, output, diff, path, URL, body, token, session, environment, and response-body style leaks.
- Supervisor failure tests now assert pre-boundary blocks preserve approvals and boundary-reached failures consume approvals exactly once where the existing runner path supports it.
- Dashboard and CLI read-only smoke coverage now pins operator-facing routes and helper functions.
- MCP HTTP local-control no longer falls back to the Supervisor token.
- The no-live audit now self-tests segmented GitHub ref endpoint construction, generic Dashboard POST helper aliases, browser-storage token wrappers, dynamic MCP local-control token reads, and dynamic adapter execute property access.

Capability and governance matrix:

| Capability | Default state | Mutating path | Boundary | Approval | Public output |
| --- | --- | --- | --- | --- | --- |
| Codex | disabled | governed adapter/control plane | process | required for real execution | hash/summary only |
| Nx | disabled | governed verification adapter | process | required when governed execution is requested | hash/summary only |
| MCP | read-only | none in this baseline | no process/network write | not applicable for read-only tools | metadata only |
| Browser | disabled/read-only | none in foundation defaults | approved observer only | required for gated observation | metadata/hash only |
| Electron/CDP | disabled/read-only | controlled observation only | approved HTTP/WebSocket event boundary | required for gated observation | metadata/hash only |
| Worktree | disabled | controlled git worktree/cleanup | single audited git boundary | persisted approval | ids/hashes/counts/statuses |
| Policy backend | disabled/advisory | none | no runtime process | execution authority only for fixture | advisory metadata only |
| Telemetry | disabled/metadata | none | no exporter/network | execution authority only for fixture | non-authoritative metadata |
| GitHub | disabled | fixed provider control planes | single audited HTTP boundary | persisted approval per child action | ids/hashes/counts/statuses |
| Review/RC package | disabled | governed local artifact export | audited local file boundary | persisted approval | artifact hashes/counts only |
| Rework/supersede/cleanup | disabled/projection-first | child control planes only | existing child boundaries | separate child approvals | metadata only |
| Custom workflows | disabled | existing workflow control plane | no new provider boundary | workflow approval plus child approvals | metadata only |
| Production recovery | disabled | existing recovery control plane | child control planes only | workflow approval plus child approvals | metadata only |

Residual risk:
- These rounds strengthen regression tests and audits; they do not prove real-world external services will always behave safely.
- Dashboard visual smoke remains mostly source/helper based unless future UI changes require browser-level QA.
- Production automation should still proceed in narrow, separately approved milestones.

Skills used:
- gsd-spec-driver: defined goal, scope, non-scope, acceptance, and hard boundaries.
- gstack-delivery-workflow: kept the five-round delivery sequence auditable.
- superpowers-engineering-discipline: enforced small scope, clean state, and evidence-first closeout.
- codexhub-workflow-policy-reviewer: reviewed authority, approval, evidence, audit, and token invariants.
- codexhub-architecture-planner: kept changes in audit/docs/config rather than provider or route layers.
- codexhub-release-auditor: captured verification expectations and rollback notes.
