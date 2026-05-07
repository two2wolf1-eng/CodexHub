# M48-D8 Kernel Projection Fuzz Review

## Review Scope

- `packages/production-ga-kernel/src/production-ga-kernel.test.ts`
- `packages/governance-projection-kernel/src/governance-projection-kernel.test.ts`
- `packages/operator-readiness-kernel/src/operator-readiness-kernel.test.ts`
- D8 scaffold and orchestration registration

## Findings

No kernel implementation leak was found. The first D8 test run exposed only a test expectation mismatch: Production GA kernel hashes are plain SHA-256 hex strings, not display-prefixed `sha256:` strings. The test was corrected to assert the existing 64-character hash convention.

## Controls Confirmed

- Production GA kernel hashes upstream governance/readiness/workflow/runtime/platform seeds.
- Governance projection hashes adversarial source ids and titles while preserving safe evidence and audit refs.
- Operator readiness hashes late-stage config and local-control values.
- Public projection round trips remain free of forbidden raw prompt, stdout, stderr, diff, path, URL, token, env, release body, deployment payload, log, patch, DB row, and audit body examples.

## Residual Risk

D8 does not prove repository persistence or HTTP response serialization. Those move to D9 and D11 respectively.
