# M73 Real Client Direct Automation Review

## Findings

No unresolved high-risk implementation findings in the scoped tests.

## Review Notes

- The new Supervisor connection probe route is local-control protected and registered in the mutating route gate matrix.
- Chrome CDP action execution is available only as a fixed-step boundary and does not accept request-body authority.
- Business admin fixed-flow execution can use environment-provided fixed flow JSON, but the route still requires the existing live-write gate and approval-derived authority.
- Codex Desktop CDP probing reads only `/json/version` and `/json/list` over loopback HTTP, hashing response bodies and returning counts.

## Residual Risks

- Real production selectors must be maintained through canary/drift gates before enabling admin writes.
- Operators must keep `CODEXHUB_BUSINESS_ADMIN_UI_FIXED_FLOW_JSON` out of logs and treat it as transient runtime configuration.
- This round does not implement direct Codex Desktop write actions; it establishes safe connection readiness for later governed workflows.

## Skills Used and Why

- `gsd-spec-driver`: bounded the round to direct-client capability without generic automation expansion.
- `gstack-delivery-workflow`: kept implementation ordered across contracts, adapters, Supervisor, docs, and verification.
- `superpowers-engineering-discipline`: kept the slice small and evidence-driven.
- `codexhub-architecture-planner`: preserved package boundary direction.
- `codexhub-contract-designer`: added shared metadata-only contracts.
- `codexhub-workflow-policy-reviewer`: checked authority, approval, and raw-payload rejection.
- `codexhub-browser-profile-observer`: applied Chrome/CDP privacy safeguards while honoring the explicit direct-connection authorization.
- `codexhub-electron-cdp-observer`: kept Codex Desktop CDP loopback-only and metadata-only.
- `codexhub-release-auditor`: prepared closeout docs and verification.
