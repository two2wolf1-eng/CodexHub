import type {
  RealTelemetryExportPlan,
  RealTelemetryExporterKind,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

type RealTelemetryBoundaryStatus = 'completed' | 'failed' | 'blocked';

interface FetchResponseLike {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

type FetchLike = (
  url: string,
  init: { method: 'POST'; headers: Record<string, string>; body: string },
) => Promise<FetchResponseLike>;

export interface RealTelemetryBoundaryInput {
  plan: RealTelemetryExportPlan;
  exporterKind: RealTelemetryExporterKind;
  transientSpanBatch?: readonly unknown[];
  endpointUrl?: string;
  endpointHash?: string;
  fetch?: FetchLike;
}

export interface RealTelemetryBoundaryResult {
  status: RealTelemetryBoundaryStatus;
  exporterKind: RealTelemetryExporterKind;
  exportedSpanCount: number;
  exportSummaryHash: string;
  endpointHash?: string;
  networkBoundaryInvoked: boolean;
  rawTracePayloadStored: false;
  rawLogStored: false;
  rawPathStored: false;
  bodyStored: false;
  evidenceAuditAuthoritative: false;
  summary: string;
}

export async function runRealTelemetryExportBoundary(
  input: RealTelemetryBoundaryInput,
): Promise<RealTelemetryBoundaryResult> {
  const spanBatch = input.transientSpanBatch ?? [];
  const spanCount = spanBatch.length || input.plan.spanCount;
  const batchHash = `sha256:${hashText(JSON.stringify(spanBatch))}`;

  if (input.plan.tracePlanHash !== batchHash && spanBatch.length > 0) {
    return createBlockedTelemetryResult(input, 'Telemetry export transient span batch hash mismatch.');
  }

  if (input.exporterKind === 'in-memory') {
    return {
      status: 'completed',
      exporterKind: input.exporterKind,
      exportedSpanCount: spanCount,
      exportSummaryHash: `sha256:${hashText(JSON.stringify({ batchHash, spanCount }))}`,
      networkBoundaryInvoked: false,
      rawTracePayloadStored: false,
      rawLogStored: false,
      rawPathStored: false,
      bodyStored: false,
      evidenceAuditAuthoritative: false,
      summary: 'Real telemetry in-memory export completed as non-authoritative metadata.',
    };
  }

  if (!input.endpointUrl || !input.endpointHash) {
    return createBlockedTelemetryResult(input, 'Telemetry network export requires hash-bound endpoint.');
  }

  if (`sha256:${hashText(input.endpointUrl)}` !== input.endpointHash) {
    return createBlockedTelemetryResult(input, 'Telemetry network export endpoint hash mismatch.');
  }

  const endpoint = new URL(input.endpointUrl);
  if (!isLoopbackHost(endpoint.hostname)) {
    return createBlockedTelemetryResult(input, 'Telemetry network export endpoint must be loopback in v1.');
  }

  const fetchImpl = input.fetch ?? globalThis.fetch;
  if (!fetchImpl) {
    return createBlockedTelemetryResult(input, 'Telemetry network export runner is unavailable.');
  }

  const body = JSON.stringify({
    tracePlanHash: input.plan.tracePlanHash,
    spanBatch,
  });

  try {
    const response = await fetchImpl(endpoint.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
    const text = await response.text();
    const responseHash = `sha256:${hashText(text)}`;

    return {
      status: response.ok ? 'completed' : 'failed',
      exporterKind: input.exporterKind,
      exportedSpanCount: response.ok ? spanCount : 0,
      endpointHash: input.endpointHash,
      exportSummaryHash: `sha256:${hashText(
        JSON.stringify({ responseHash, statusCode: response.status, spanCount }),
      )}`,
      networkBoundaryInvoked: true,
      rawTracePayloadStored: false,
      rawLogStored: false,
      rawPathStored: false,
      bodyStored: false,
      evidenceAuditAuthoritative: false,
      summary: response.ok
        ? 'Real telemetry network export completed as non-authoritative metadata.'
        : 'Real telemetry network export failed as non-authoritative metadata.',
    };
  } catch {
    return {
      ...createBlockedTelemetryResult(input, 'Telemetry network export failed.'),
      status: 'failed',
      networkBoundaryInvoked: true,
    };
  }
}

function createBlockedTelemetryResult(
  input: RealTelemetryBoundaryInput,
  summary: string,
): RealTelemetryBoundaryResult {
  return {
    status: 'blocked',
    exporterKind: input.exporterKind,
    exportedSpanCount: 0,
    endpointHash: input.endpointHash,
    exportSummaryHash: `sha256:${hashText(summary)}`,
    networkBoundaryInvoked: false,
    rawTracePayloadStored: false,
    rawLogStored: false,
    rawPathStored: false,
    bodyStored: false,
    evidenceAuditAuthoritative: false,
    summary,
  };
}

function isLoopbackHost(host: string): boolean {
  return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(host);
}
