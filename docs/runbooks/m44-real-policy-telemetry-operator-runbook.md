# M44 Real Policy Telemetry Operator Runbook

## Preconditions

- Set `CODEXHUB_POLICY_BACKEND_REAL_ENABLED=true` before real policy backend runs.
- Set `CODEXHUB_POLICY_BACKEND_OPA_ENABLED=true` or `CODEXHUB_POLICY_BACKEND_CEDAR_ENABLED=true` for the selected backend.
- Set `CODEXHUB_OTEL_REAL_ENABLED=true` before telemetry export runs.
- Set `CODEXHUB_OTEL_NETWORK_EXPORTER_ENABLED=true` only when the OTLP HTTP exporter is intentionally enabled.
- Provide the Supervisor local-control token only in the Dashboard field or the existing governed approval path; do not persist it.

## Operator Flow

1. Create a policy evaluation or telemetry export dry-run.
2. Review the metadata-only plan, blocker summary, evidence refs, and audit ids.
3. Request and record a persisted approval.
4. Start the run only after the approval is approved and unused.
5. Treat policy backend results as advisory; CodexHub governance remains authoritative.

## Safety Notes

- Raw policy source, input, traces, logs, endpoints, and token values are transient only.
- Telemetry export summaries are hashes/counts/statuses only.
- Telemetry does not replace Evidence or Audit.

