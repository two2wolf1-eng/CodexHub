# M48c Production GA Control Plane Runbook

## Purpose

Use the Production GA control plane to collect release readiness metadata and produce a governed GA signoff record. The GA control plane never grants child authority and never executes child adapters.

## Required Gates

- `CODEXHUB_PRODUCTION_GA_ENABLED=true`
- Local-control token supplied through the existing Supervisor local token header.
- Trusted loopback Origin for browser-guided POST requests.
- Two approved GA approval artifacts with distinct approver hashes.
- No unresolved critical GA blocker.

## Operator Flow

1. Create a GA dry-run.
2. Review the metadata-only readiness, threat model, training, and E2E summaries.
3. Record two independent manual GA approvals.
4. Submit a signoff request using only the dry-run id and approval artifact ids.
5. Verify the signoff status and evidence/audit summary.

## Forbidden Inputs

Do not send raw E2E payloads, docs, paths, URLs, tokens, env values, request bodies, response bodies, child artifacts, approval artifacts, or execution authority objects in request bodies.

## Recovery

If signoff is blocked, inspect blocker summaries and resolve the underlying child control-plane evidence. Do not bypass GA approval requirements.
