# M43 Secrets Governance Operator Runbook

## Preconditions

- Set `CODEXHUB_SECRETS_GOVERNANCE_ENABLED=true`.
- Enable the specific provider readiness flag needed for the check.
- Keep provider credentials outside CodexHub storage.

## Flow

1. Create a secrets readiness dry-run for the provider and environment.
2. Review configured/missing/hash-only provider readiness.
3. Request and record readiness approval if a live readiness run is needed.
4. Run readiness through `/api/secrets/readiness/runs`.
5. Confirm secret value read/storage flags remain false and evidence/audit ids are present.

## Stop Conditions

- Any raw secret value, token, key, env value, config body, path, URL, request body, or response body appears in input or output.
- A provider API or CLI is used to retrieve secret values.
- Dashboard/CLI attempts to persist local-control tokens or call write adapters directly.

## Recovery

If readiness is blocked, fix external operator configuration and repeat dry-run. Do not paste secret values into CodexHub.
