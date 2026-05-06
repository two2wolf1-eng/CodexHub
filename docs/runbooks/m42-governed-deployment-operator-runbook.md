# M42 Governed Deployment Operator Runbook

## Preconditions

- Set `CODEXHUB_DEPLOYMENT_OPERATOR_ENABLED=true`.
- Enable exactly the provider write flag required for the target provider.
- For prod, also set `CODEXHUB_DEPLOYMENT_PROD_WRITE_ENABLED=true`.
- Confirm local-control token is available only in the active operator session.

## Flow

1. Create a deployment operation dry-run.
2. Review provider, action, environment, target hash, artifact hash, blockers, evidence refs, and audit ids.
3. For rollback, create or select a persisted rollback plan first.
4. Request approval.
5. For dev/staging, record one approval. For prod, record two approvals from different approver hashes.
6. Run the operation through the governed Supervisor route.
7. Confirm the result summary, boundary booleans, evidence refs, and audit ids.

## Stop Conditions

- Missing runtime flag.
- Missing or stale rollback plan for rollback.
- Missing approval or duplicate prod approver hash.
- Hash mismatch.
- Any raw manifest, plan, diff, log, path, token/env, request body, or response body appears in public output.

## Rollback

Rollback is never implicit. It requires a persisted rollback plan and a fresh governed run.
