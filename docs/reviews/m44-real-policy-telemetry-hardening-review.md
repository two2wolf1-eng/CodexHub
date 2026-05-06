# M44 Real Policy Telemetry Hardening Review

## Scope

Reviewed contracts, `policy-backend-adapter`, `otel-adapter`, store repositories, Supervisor routes, Dashboard guided UX, CLI read-only commands, and no-live audit coverage for M44.

## Findings

- No ungoverned authority path was added. Policy backend decisions are stored as advisory summaries only.
- Raw policy source, raw input, raw output, raw spans, raw logs, endpoint values, token values, request bodies, and response bodies remain outside public outputs.
- Dashboard mutation is limited to exact M44 route allowlists and keeps the local-control token in React memory only.
- CLI remains read-only for M44 and does not read the local-control token.
- OpenTelemetry runtime/exporter vocabulary is allowed only in the reviewed telemetry boundary and audit vocabulary.

## Hardening Actions

- Added fixed process and HTTP boundary allowlists for real policy execution.
- Added fixed telemetry boundary allowlists and checks for network exporter gate behavior.
- Extended Dashboard mutation audits to cover the policy telemetry wizard.
- Registered release, review, runbook, orchestration, integration, and scaffold health entries.

## Residual Risk

- External OPA/Cedar and OTLP implementations may fail or be missing at runtime; CodexHub records this as blocked/failed metadata.
- Network telemetry exporter remains disabled by default and should stay loopback-only unless a later milestone reviews a wider allowlist.

