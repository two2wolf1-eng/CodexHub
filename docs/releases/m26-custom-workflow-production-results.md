# M26 Custom Workflow Production Results

## Scope

M26 productionized the M25 custom workflow catalog by binding existing governed custom workflow routes to catalog templates and adding operator-facing readiness plus fixture-only production rehearsal.

## Results

- Catalog template dry-runs now resolve persisted template ids and hash-match caller-provided template hashes.
- Disabled, missing, invalid, or stale catalog templates block before child capability coordination.
- Custom workflow runs now reject blocked dry-runs and non-approved workflow approval artifacts before recording a run.
- Missing or mismatched child record ids/hashes block later steps without consuming workflow approval.
- Operator readiness now reports `custom-workflow-production` as disabled by default with child approval requirements.
- CLI and Dashboard expose production rehearsal metadata as read-only fixture output.

## Verification

- `pnpm nx run workflow-kernel:test --skip-nx-cache`
- `pnpm nx run supervisor:test --skip-nx-cache`
- `pnpm nx run operator-readiness-kernel:test --skip-nx-cache`
- `pnpm nx run cli:test --skip-nx-cache`
- `pnpm nx run dashboard:test --skip-nx-cache`
- Focused lint/build for changed projects.

## Safety

No new route, provider, live boundary, or execution surface was added. Production workflow execution remains disabled by default, and workflow approval does not replace child capability approvals.
