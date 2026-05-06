# M39 GitHub Actions CI/CD Operator Runbook

## Preconditions

- `CODEXHUB_GITHUB_PROVIDER_ENABLED=true`
- `CODEXHUB_GITHUB_TOKEN` configured in the local runtime environment
- For observation: `CODEXHUB_GITHUB_ACTIONS_OBSERVATION_ENABLED=true`
- For rerun: `CODEXHUB_GITHUB_ACTIONS_RERUN_ENABLED=true`
- For cancel: `CODEXHUB_GITHUB_ACTIONS_CANCEL_ENABLED=true`
- For dispatch: `CODEXHUB_GITHUB_ACTIONS_DISPATCH_ENABLED=true`
- Operator has a local-control token for Supervisor POST routes

## Observation Flow

1. Create a GitHub Actions observation dry-run for the target repository and optional run id.
2. Request and approve the observation approval artifact.
3. Start the observation run through the governed Supervisor route.
4. Review run status, job counts, conclusion counts, log hash summary, evidence refs, audit ids, and network boundary booleans.

## Rerun Or Cancel Flow

1. Create a rerun or cancel dry-run for the target workflow run id.
2. Request the matching approval artifact.
3. Approve the operation after checking the target run summary.
4. Start the rerun or cancel run through Supervisor.
5. Review the metadata-only result summary and audit chain.

## Dispatch Flow

1. Create a workflow dispatch dry-run for the target workflow id and hash-bound ref.
2. Confirm the workflow does not require unsupported inputs.
3. Request and approve dispatch.
4. Start dispatch through Supervisor.
5. Review the dispatch status summary, evidence refs, audit ids, and boundary booleans.

## Stop Conditions

- Provider or specific GitHub Actions flag disabled.
- Token missing.
- Approval missing, denied, expired, revoked, used, or hash-mismatched.
- Workflow run or workflow id not found.
- Observation logs exceed the configured transient byte cap.
- Dispatch includes arbitrary inputs or a non-hash-bound ref.
- GitHub network boundary fails or times out.

## Recovery Notes

- If a blocker occurs before the GitHub network boundary, approvals remain in their persisted state.
- If the GitHub network boundary is reached and fails, the relevant approval is consumed exactly once and the operator must create a fresh dry-run/approval pair for retry.
- CodexHub does not persist raw logs, artifacts, request bodies, response bodies, URLs, tokens, or env values.
