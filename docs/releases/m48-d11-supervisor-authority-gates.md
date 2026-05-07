# M48-D11 Supervisor Authority Gates

## Summary

M48-D11 deepened the post-GA debug chain from route coverage into gate behavior. The round adds hostile authority-payload regression coverage for all late-stage mutating Supervisor routes; it does not add product capability, providers, routes, store repositories, live boundaries, or runtime execution.

## GSD Spec

- Goal: verify local-control and Origin gates reject hostile authority payloads before route validation or handler-specific logic can process them.
- Scope: `apps/supervisor`, D11 release/review docs, scaffold health, and orchestration registration.
- Non-scope: no public API, route family, provider, store repository, adapter boundary, remote write, push, or pull request.
- Acceptance: `supervisor:test` passes and closeout gates remain green.
- Risk: critical because caller-supplied authority, approval artifacts, child artifacts, raw payloads, tokens, and env values must never become trusted or echoed.

## Debug Work

- Centralized the hostile authority payload fixture used by late-stage Supervisor tests.
- Reused a single leak assertion for approval/run rejection paths and all-route authority rejection paths.
- Added a local-gate precedence test across every late-stage mutating route:
  - missing local-control token returns `invalid_local_control_token`.
  - bad local-control token returns `invalid_local_control_token`.
  - malicious Origin returns `untrusted_origin`.
  - none of those gate failures echoes caller-supplied artifact, authority, raw body, URL, token, env, or child artifact data.

## Verification

- `pnpm nx run supervisor:test --skip-nx-cache`

## Residual Risk

D11 proves gate precedence and metadata-only errors. D12 should next focus on approval consumption timing and boundary-truth preservation after a route reaches a governed execution boundary.

## Skills

- Workflow Skills Used and Why: `gsd-spec-driver` for bounded D11 scope, `gstack-delivery-workflow` for Plan/Build/Review/QA/Ship sequencing, `superpowers-engineering-discipline` for small gate-focused hardening.
- Project Skills Used and Why: `codexhub-architecture-planner` for Supervisor route boundaries, `codexhub-workflow-policy-reviewer` for authority and approval-artifact invariants, `codexhub-release-auditor` for verification closeout.
- Skills Not Used and Why: Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, deployment runtime, external agent runtime, Codex exec runtime, and `codexhub-contract-designer` were not used because D11 does not change schemas or runtime surfaces.
