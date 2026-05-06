# M0-M32 Operator UX Smoke Review

Review round: M32.6

Objective:
- Confirm operator-facing Dashboard, CLI, and MCP surfaces remain understandable, degraded-safe, and bounded before continuing deeper M32 hardening.

Findings and fixes:
- Dashboard smoke routes were already present; a regression test now pins the M32.6 smoke route set as stable hash views.
- CLI read-only command coverage already covered many GitHub and governance GET paths; a source-level guard now covers the operator smoke helper set, including production recovery list/show helpers.
- MCP source scanning already blocked direct adapter execute and live boundary helpers; the MCP HTTP gate still accepted the Supervisor local-control token fallback. That fallback was removed so MCP HTTP uses only the MCP-specific local-control key.

Residual risk:
- Dashboard smoke remains source/test based in this round; browser-level visual smoke is still deferred unless a later UI round changes behavior.
- MCP HTTP remains a local-control gated surface; this round only narrowed token reuse and did not redesign MCP transport configuration.

Skills used:
- gsd-spec-driver: bounded the debug-only round.
- gstack-delivery-workflow: kept the work in Plan, Build, Review, QA, Ship order.
- superpowers-engineering-discipline: enforced no scope creep and evidence-first closeout.
- codexhub-workflow-policy-reviewer: reviewed token, approval, and adapter-execute boundaries.
- codexhub-playwright-qa: scoped Dashboard smoke to degraded-safe route/source checks.
- codexhub-release-auditor: captured verification and rollback notes.
