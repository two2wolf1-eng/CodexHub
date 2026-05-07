# M48-D10 Supervisor Route Drift

## Summary

M48-D10 deepened the post-GA debug chain into Supervisor mutating route coverage. The round adds a stricter regression guard for late-stage POST route discovery and registration drift only; it does not add product capability, providers, routes, store repositories, live boundaries, or runtime execution.

## GSD Spec

- Goal: ensure every late-stage mutating Supervisor POST route remains synchronized with the table-driven local-control, Origin, CORS, and authority rejection matrix.
- Scope: `apps/supervisor`, D10 release/review docs, scaffold health, and orchestration registration.
- Non-scope: no public API, route family, provider, store repository, adapter boundary, remote write, push, or pull request.
- Acceptance: `supervisor:test` passes and closeout gates remain green.
- Risk: critical because uncovered POST route drift could weaken local-control and authority invariants.

## Debug Work

- Added direct literal POST route discovery that tolerates whitespace, single quotes, double quotes, and non-interpolated template strings.
- Kept helper route expansion tied to the existing late-stage matrix so registered helper prefixes must remain declared.
- Added explicit direct-route containment assertions before comparing registered late-stage routes with the gate matrix.

## Verification

- `pnpm nx run supervisor:test --skip-nx-cache`

## Residual Risk

D10 validates route coverage drift. D11 should next exercise the authority gate behavior itself across the covered routes.

## Skills

- Workflow Skills Used and Why: `gsd-spec-driver` for bounded D10 scope, `gstack-delivery-workflow` for Plan/Build/Review/QA/Ship sequencing, `superpowers-engineering-discipline` for small route-test hardening.
- Project Skills Used and Why: `codexhub-architecture-planner` for Supervisor route matrix boundaries, `codexhub-workflow-policy-reviewer` for local-control and authority invariants, `codexhub-release-auditor` for verification closeout.
- Skills Not Used and Why: Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, deployment runtime, external agent runtime, Codex exec runtime, and `codexhub-contract-designer` were not used because D10 does not change schemas or runtime surfaces.
