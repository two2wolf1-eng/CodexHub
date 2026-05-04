# M18 Remote Publish Draft PR Operator Runbook

## Before Enabling

1. Confirm `github-provider.enabled=false` remains the product default.
2. Complete an approved M17 branch publish run for a new `codexhub/*` branch.
3. Complete or plan an approved M16 draft PR creation run that uses the newly published branch as head.
4. Confirm the branch publish and draft PR approvals are separate, persisted, unused at their respective execution time, and linked to evidence/audit ids.
5. Review M18 chain dry-run output for child run ids, lifecycle status, evidence refs, audit ids, and recovery notes.

## Review And Run

- Use the Supervisor local-control route only for chain dry-run/run projection creation.
- Do not paste token values, raw owner/repo/ref strings, URLs, PR markdown, or response bodies into request bodies.
- Treat the chain as an audit projection. Remote writes still occur only through M17 and M16 child control planes.
- If branch publish is blocked or failed, do not attempt draft PR creation from the chain.
- If draft PR creation fails after branch creation, record recovery metadata and handle any remote branch cleanup manually outside M18.

## Stop Conditions

Stop if the chain references missing child runs, mismatched source hashes, missing approvals, a non-`codexhub/*` branch, failed verification, stale branch metadata, token readiness failure, disabled provider flags, or missing evidence/audit links.

## Rollback

Remove or disable `/api/github/publish-draft-pr-chains/*` and the Dashboard/CLI publish-to-draft-PR views. Keep `CODEXHUB_GITHUB_PROVIDER_ENABLED=false` unless actively testing. M18 does not delete remote branches or draft PRs; handle remote cleanup manually according to repository governance.
