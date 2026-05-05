# M24 Custom Workflow Operator Runbook

## Purpose

Use M24 to dry-run, approve, and coordinate custom workflows without bypassing child control planes.

## Enablement

- Keep `custom-workflows.enabled=false` in versioned config.
- Set `CODEXHUB_CUSTOM_WORKFLOWS_ENABLED=true` only in the local runtime environment when deliberately testing the control plane.
- Do not store local-control tokens or workflow secrets in templates.

## Operator Flow

1. Validate the template with `codexhub workflows validate --template-id <templateId>`.
2. Create a dry-run through the Supervisor local-control API.
3. Request and record a persisted custom workflow approval.
4. Ensure each child capability has its own required dry-run, approval, and run record.
5. Run the custom workflow coordinator with only `dryRunId`, `approvalArtifactId`, `templateId`, `templateHash`, and child record hashes.
6. Inspect results with `codexhub workflows runs list` or Dashboard `#/workflows`.

## Stop Conditions

- Template hash mismatch.
- Missing, denied, expired, used, or revoked workflow approval.
- Missing child record hash for a child-gated step.
- Any child run is blocked or failed.
- Any output contains raw prompt, diff, PR body, path, URL, token, cookie, session, env, or response body.

## Rollback

Disable the runtime flag `CODEXHUB_CUSTOM_WORKFLOWS_ENABLED`. Existing records remain as metadata-only audit history.

