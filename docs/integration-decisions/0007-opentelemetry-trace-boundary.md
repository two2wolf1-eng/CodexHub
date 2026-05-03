# 0007 OpenTelemetry Trace Boundary

Date: 2026-05-04

## Decision

CodexHub will prepare a telemetry adapter surface for future OpenTelemetry traces, metrics, and logs, but M7a does not import the OpenTelemetry SDK or export telemetry over the network.

Telemetry is observability metadata only. It does not replace CodexHub EvidenceRef or AuditEvent facts.

## Provider

- Provider name: OpenTelemetry.
- M7a adapter: `otel-adapter`.
- Runtime status: disabled, noop/fixture only.
- SDK pinning: deferred until a real exporter round.

## Boundary

- Starts external process: no.
- Touches network or OTLP endpoint: no.
- Reads local trace files: no.
- Handles sensitive data: only hashes, counts, and summaries in M7a.
- Raw trace payload storage: forbidden.
- Raw request or response body storage: forbidden.
- Raw path storage: forbidden.

## Telemetry Model

- Trace/export plans are recorded as `telemetry.trace_plan`.
- Span summaries are recorded as `telemetry.span_summary`.
- Export summaries are recorded as `telemetry.export_summary`.
- `evidenceAuditAuthoritative=false` is required for telemetry records.

## Evidence And Audit

- Telemetry output may reference EvidenceRef and AuditEvent ids, but it cannot replace them.
- Audit events must include actor, action, target, reason, policyDecisionId, evidenceRefs, `liveExecution=false`, and `externalProcessStarted=false`.

## M7.5 Hardening

- Production source is audited to reject OpenTelemetry SDK imports and OTLP exporter entrypoints.
- Telemetry run tests cover raw request, response, path, and credential-like attribute redaction by omission.
- `evidenceAuditAuthoritative=false` remains required for telemetry records.

## Rollback

Remove the package, path mapping, integration config entry, scaffold health expectations, M7.5 audit terms, and contracts added for M7a. No persisted runtime data, SDK dependency, exporter, or process boundary exists in this stage.
