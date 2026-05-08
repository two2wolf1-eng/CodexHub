# M64 Business Quota Supervisor Control Plane

## GSD Spec

- Goal: expose Business quota, UI observation, attribution, readiness, and automation run metadata through Supervisor without direct adapter calls.
- Scope: Supervisor store projections, M51 `/accounts` readiness aggregation, M64 route-gate tests, and release/review/runbook docs.
- Non-scope: no live quota read, no UI execution, no credential/session/storage collection, no raw DOM/body/path/account/email/diff/prompt persistence.
- Acceptance: `pnpm nx test supervisor`, `pnpm nx build supervisor`, and `pnpm nx lint supervisor` pass.
- Hard boundaries: POST routes create dry-run, approval, evidence, and audit shells only. Authority cannot come from request bodies.
- Affected projects: `apps/supervisor`, `packages/business-quota-kernel`, `packages/ui-automation-kernel`, `packages/store-core`, `packages/store-sqlite`.
- Risk: high, because readiness affects live task dispatch.

## Changes

- Added `/api/business-quota/sources`, `/observations`, `/attributions`, `/readiness`, and `/automation-runs` GET projections.
- Added governed POST shells for observation rehearsal, UI action dry-run, approval request, quota-read dry-run, and critical action request.
- Extended `/accounts` with quota readiness counts and redaction/canary-aware live-dispatch gate projection.
- Kept Supervisor as a governance projection layer; it does not call Business, CDP, Electron, or App Server adapters directly.

## Verification

- `pnpm nx test supervisor`
- `pnpm nx build supervisor`
- `pnpm nx lint supervisor`
