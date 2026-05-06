# M42 Governed Deployment Results

## Summary

M42 adds the first governed deployment operation control plane for Docker, Kubernetes, Helm, Argo CD, Terraform, and OpenTofu. Product defaults remain disabled. Every operation is dry-run first, local-control gated, approval backed, evidence/audit projected, and metadata-only in public output.

## Delivered

- Added deployment operation contracts for readiness, environment approval policy, operation plans, rollback plans, approval artifacts, runs, result summaries, and fixture rehearsal.
- Added store-backed Supervisor records under `/api/deployments/operations/*`.
- Added a Dashboard `#/deployments` guided operation panel with page-memory local-control key handling and an exact route allowlist.
- Added read-only CLI commands for operation dry-runs, approvals, rollback plans, runs, and fixture rehearsal.
- Added audit coverage for the Dashboard deployment wizard, forbidden request-body authority, raw deployment body rejection, and no direct adapter execution.

## Safety Results

- Dev and staging require one persisted approval.
- Prod requires two persisted approvals with different approver hashes.
- Rollback requires a persisted rollback plan before run.
- Public output remains ids, hashes, counts, statuses, summaries, evidence refs, audit ids, and boundary booleans.
- Terraform/OpenTofu rollback is modeled as applying an approved rollback plan; destroy is out of scope.

## Residual Risk

M42 establishes the governed control plane and fixed-runner metadata path. Real provider command execution remains disabled by default and must be enabled only with runtime flags, approved dry-runs, and operator review.
