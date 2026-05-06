# M41 Deployment Read-Only Operator Runbook

## Preconditions

- `CODEXHUB_DEPLOYMENT_OBSERVER_ENABLED=true` only when live observation is intentionally enabled.
- Provider-specific flags are enabled only for the provider under inspection.
- Local-control token is used only for Supervisor-gated observation routes.
- Provider credentials remain outside CodexHub storage.

## Operator Flow

1. Check deployment readiness.
2. Create or inspect deployment observation dry-runs.
3. Request approval if a live observation is required.
4. Run observation through the Supervisor control plane.
5. Review status summaries, drift summaries, plan/diff hashes, evidence refs, and audit ids.

## Stop Conditions

- Missing provider tool or disabled provider flag.
- Hash mismatch.
- Raw plan, diff, log, credential, env, URL, request body, or response body appears.
- Any apply, sync, rollback, delete, scale, restart, image push, Helm upgrade, Terraform apply, or arbitrary command is attempted.

## Rollback Notes

M41 does not mutate deployment state, so rollback is not part of the observation flow.
