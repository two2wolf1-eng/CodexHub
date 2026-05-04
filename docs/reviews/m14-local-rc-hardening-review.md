# M14 Local RC Hardening Review

## Status

M14.5 reviewed the M14a-M14d local release candidate chain and found no need for new runtime behavior. The round records the release baseline and keeps all M14 outputs metadata-only.

## Review Scope

- M14 local RC contracts in `packages/contracts`.
- RC readiness, export, and acceptance helpers in `packages/release-candidate-kernel`.
- Release candidate Supervisor control-plane routes and store repositories.
- Dashboard and CLI read-only release candidate surfaces.
- No-live automation audit coverage for the local artifact export boundary.
- M13 review package handoff and M12 verification readiness inputs used by M14.
- M14 orchestration, integration configuration, and release documentation.

## Findings And Fixes

- Confirmed RC readiness is blocked when review, verification, or operator readiness is blocked.
- Confirmed RC bundle export uses fixed summary filenames and sibling artifact-root policy.
- Confirmed request-body approval artifacts and execution authority objects remain untrusted.
- Confirmed acceptance rehearsal is fixture-only and cannot write artifacts or contact remote providers.
- Confirmed Dashboard and CLI RC views do not send POST requests, read local-control credentials, or call exporter execution helpers.
- Added M14 release, review, and operator runbook documentation to scaffold health so future rounds cannot silently drop the M14 acceptance record.

## Safety Review

- Raw diff, PR body, review reason, path body, command body, env value, token, cookie, session, request body, and response body data remain outside public RC projections.
- Local RC export is constrained to `../CodexHub-artifacts/release-candidates/<bundle-id>/` and fixed summary filenames.
- Approval artifacts are store-resolved; request-body authority objects remain untrusted.
- Dashboard/CLI are read-only for RC inspection.
- No remote provider, push, PR creation, Browser/Electron/MCP execution surface, policy backend authority transfer, telemetry network exporter, or generic filesystem passthrough was introduced.

## Residual Risk

- M14b is a real local filesystem write boundary and must remain disabled unless the Supervisor gate, persisted approval, authority, and hash binding all pass.
- RC readiness is a local acceptance signal only; it does not create a remote release, branch, tag, PR, or deployment.
- Future remote integration must be a separate reviewed milestone with new contracts, approval gates, evidence, audit, and rollback documentation.

## Verification Evidence

The M14.5 release gate requires focused RC tests, focused lint/build, scaffold health, boundary audit, SQLite isolation audit, no-live automation audit, skills audit, foundation verification, and diff check.
