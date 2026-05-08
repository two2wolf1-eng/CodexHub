# M63 Runbook

## Operate

1. Use Business quota read-only plans to identify the source kind and source health.
2. Use DOM/AX or Electron renderer observations only as redacted metadata inputs.
3. For any UI action, create an intent, create a dry-run plan, resolve approval authority from governance/store, then summarize the run.
4. Treat `forbidden_credential_action` as permanently blocked. Approval records do not make it executable.

## Failure Handling

- `quota_canary_required`: run M65 quota/source canary before live dispatch depends on the source.
- `redaction_failed`: block persistence and create a HumanCheckpoint for manual review.
- `approval_waiting`: do not execute; request an approval through the Supervisor control plane.
- `desktop_ui_frozen` or `app_server_unresponsive`: route to diagnosis/recovery kernels instead of pretending success.

## Rollback

- Disable imports of `@codexhub/ui-automation-kernel` from adapters.
- Remove M63 source-health and UI automation projections from Supervisor in M64 if a later integration fails.
- Existing M62 metadata tables remain compatible and do not need migration rollback.
