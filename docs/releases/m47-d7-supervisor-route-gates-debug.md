# M47-D7 Supervisor Route Gates Debug

## Summary

M47-D7 deepened late-stage Supervisor gate tests for token, Origin, CORS, and
request-body authority semantics. The round did not add product capability,
routes, providers, store repositories, live boundaries, or remote writes.

## Scope

- `apps/supervisor`
- `.codexhub/orchestration.yaml`
- `tools/scaffold-health.ts`
- M47-D7 release/review documentation

## Findings

- No route gate bypass was found.
- Trusted preflight behavior already required the local-control header.
- Missing local-control preflight is intentionally reported as
  `local_control_token_required`, which is more precise than the ordinary invalid
  token response.

## Fixes And Hardening

- Late-stage route gate coverage now includes malicious preflight requests and
  trusted preflight requests that omit the local-control header.
- CORS assertions now verify these blocked preflight responses never use wildcard
  `Access-Control-Allow-Origin`.
- Added a separate all-route authority rejection regression that sends
  caller-supplied `approvalArtifact`, `executionAuthority`, `authority`, and
  `childArtifacts` to every late-stage mutating route and requires an
  authority-focused rejection before route validation can proceed.
- Registered the round in orchestration and scaffold health.

## Verification

- `pnpm nx run supervisor:test --skip-nx-cache`

## Residual Risk

- D7 verifies gate and authority rejection behavior. Approval consumption and
  boundary-reached failure semantics remain assigned to D8.
