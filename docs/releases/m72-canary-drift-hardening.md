# M72 Canary / Drift / Hardening

## Summary

M72 closes the high-privilege Business/Codex automation chain by making production readiness canary and drift records a real blocker for Business admin writes and Codex dispatch readiness. The existing production-readiness control plane now understands owner-admin members, billing, pending-invites, manage-seats, App Server quota, admin write live-smoke, and network-endpoint drift checks.

No new provider, route, store repository, or generic Browser/CDP surface is introduced. M72 reuses metadata-only readiness records and forces high-risk actions to stop when the latest readiness gates indicate canary or drift blockers.

## Scope

- Added M72 Business/Codex canary and drift gate kinds to shared contracts.
- Registered the new canary/drift kinds in Supervisor production-readiness rehearsal normalization.
- Blocked governed Business admin fixed-flow execution when production readiness has high-risk blockers.
- Blocked Business quota dispatch and quota fusion readiness when production readiness has high-risk blockers.
- Added regression tests proving readiness drift prevents admin write runner invocation and Codex dispatch readiness.

## Non-Scope

- No live Chrome connection.
- No real account operation.
- No generic click/type/CDP command passthrough.
- No browser storage, credential, cookie, token, session, MFA, or network body access.
- No new Supervisor route or store repository.

## Verification

- Focused contracts, business quota, UI automation, and Supervisor tests cover the M72 readiness hard gates.
- Closeout gates must pass before M72 is considered complete.

## Skills

- Workflow Skills Used and Why: `gsd-spec-driver` for scope and acceptance, `gstack-delivery-workflow` for staged delivery, `superpowers-engineering-discipline` for critical-risk small steps.
- Project Skills Used and Why: `codexhub-architecture-planner` for route/store reuse, `codexhub-contract-designer` for canary/drift enum extension, `codexhub-workflow-policy-reviewer` for readiness blocking semantics, `codexhub-browser-profile-observer` for Browser/Profile safety boundaries, `codexhub-release-auditor` for closeout.
- Skills Not Used and Why: Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, deployment runtime, and external agent runtime are not expanded in M72.
