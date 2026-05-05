# M24 Custom Workflow Results

## Scope

M24 adds a governed custom workflow control plane that coordinates existing child control-plane records by id and hash only.

## Delivered

- Added store repositories for custom workflow dry-runs, approvals, and runs.
- Added Supervisor routes under `/api/workflows/custom/*`.
- Added a run coordinator that blocks when workflow approval, child record hashes, or prerequisite states are missing.
- Added read-only Dashboard and CLI control UX.
- Added fixture acceptance rehearsal for custom workflow scenarios.

## Safety

- Product default remains disabled through `CODEXHUB_CUSTOM_WORKFLOWS_ENABLED`.
- POST routes require local-control token and trusted loopback Origin.
- Request-body approval artifacts and execution authority objects are rejected.
- The coordinator does not call adapter `execute()` and does not create child approvals.
- Child approvals remain separate from custom workflow approval.

## Verification

- Contract, workflow-kernel, store, Supervisor, CLI, and Dashboard tests cover the M24 control-plane path.
- Governance audits remain part of the release gate.

