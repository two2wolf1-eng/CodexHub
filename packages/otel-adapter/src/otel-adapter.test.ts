import { describe, expect, it } from 'vitest';
import {
  CapabilityManifestSchema,
  SchemaVersionSchema,
  type ExecutionAuthority,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import {
  createOtelAdapterManifest,
  executeTelemetryExport,
  planTelemetryExport,
} from './index';

const authority: ExecutionAuthority = {
  id: foundationId('execution_authority'),
  schemaVersion: SchemaVersionSchema.value,
  createdAt: foundationTimestamp(),
  policyDecisionId: 'policy_telemetry_1',
  allowed: true,
  constraints: ['noop-exporter-only'],
};

describe('otel-adapter', () => {
  it('declares a telemetry capability manifest without SDK, process, or network export', () => {
    const manifest = CapabilityManifestSchema.parse(createOtelAdapterManifest());

    expect(manifest.kind).toBe('telemetry');
    expect(manifest.provider).toBe('builtin');
    expect(manifest.defaultActionMode).toBe('read');
    expect(manifest.processBoundary.mayStartExternalProcess).toBe(false);
    expect(manifest.metadata?.openTelemetrySdkLoaded).toBe(false);
    expect(manifest.metadata?.networkExporterEnabled).toBe(false);
  });

  it('plans noop telemetry export as metadata-only span summaries', () => {
    const planResult = planTelemetryExport({
      exporterKind: 'noop',
      spans: [
        {
          spanKind: 'workflow',
          name: 'm7a.workflow',
          attributes: { status: 'planned' },
          eventCount: 1,
        },
      ],
    });

    expect(planResult.plan.networkExportPlanned).toBe(false);
    expect(planResult.plan.processBoundaryPlanned).toBe(false);
    expect(planResult.plan.rawTracePayloadStored).toBe(false);
    expect(planResult.spans[0]?.evidenceAuditAuthoritative).toBe(false);
    expect(JSON.stringify(planResult)).not.toContain('{"token":"secret"}');
    expect(JSON.stringify(planResult)).not.toContain('token');
  });

  it('blocks execution without allowed authority before creating evidence or audit', async () => {
    const planResult = planTelemetryExport({
      spans: [{ spanKind: 'adapter', name: 'blocked.adapter' }],
    });
    const result = await executeTelemetryExport({ planResult });

    expect(result.run.status).toBe('blocked');
    expect(result.run.networkExportAttempted).toBe(false);
    expect(result.capabilityResult.processBoundaryInvoked).toBe(false);
    expect(result.capabilityResult.externalProcessStarted).toBe(false);
    expect(result.run.evidenceRefs).toEqual([]);
  });

  it('executes noop export without replacing Evidence or Audit authority', async () => {
    const planResult = planTelemetryExport({
      exporterKind: 'fixture',
      spans: [
        {
          signalKind: 'trace',
          spanKind: 'verification',
          name: 'nx.verification',
          attributes: { targetCount: 3 },
          eventCount: 2,
          durationMs: 42,
        },
      ],
    });
    const result = await executeTelemetryExport({
      planResult,
      authority,
      exporter: () => ({ status: 'completed', summary: 'Fixture export accepted.' }),
    });

    expect(result.run.status).toBe('completed');
    expect(result.run.exporterKind).toBe('fixture');
    expect(result.run.networkExportAttempted).toBe(false);
    expect(result.run.evidenceAuditAuthoritative).toBe(false);
    expect(result.run.evidenceRefs.map((ref) => ref.kind)).toContain('telemetry.export_summary');
    expect(result.capabilityResult.evidenceRefs.length).toBe(result.run.evidenceRefs.length);
    expect(result.run.rawTracePayloadStored).toBe(false);
    expect(JSON.stringify(result.run)).not.toContain('{"token":"secret"}');
    expect(JSON.stringify(result.run)).not.toContain('Authorization');
  });

  it('hashes sensitive span attributes without storing raw request, response, path, or credential fields', async () => {
    const planResult = planTelemetryExport({
      exporterKind: 'fixture',
      spans: [
        {
          signalKind: 'trace',
          spanKind: 'supervisor',
          name: 'supervisor.request',
          attributes: {
            requestBody: '{"token":"secret"}',
            responseBody: '{"session":"secret"}',
            authorization: 'Bearer secret',
            path: 'C:/Users/Thomas/CodexHub/.codexhub/private.trace',
          },
          eventCount: 1,
        },
      ],
    });
    const result = await executeTelemetryExport({
      planResult,
      authority,
      exporter: () => ({ status: 'completed' }),
    });
    const serialized = JSON.stringify(result);

    expect(result.run.evidenceAuditAuthoritative).toBe(false);
    expect(result.run.rawTracePayloadStored).toBe(false);
    expect(result.run.bodyStored).toBe(false);
    expect(result.run.rawPathStored).toBe(false);
    expect(result.run.spans[0]?.attributeCount).toBe(4);
    expect(serialized).not.toContain('requestBody');
    expect(serialized).not.toContain('responseBody');
    expect(serialized).not.toContain('authorization');
    expect(serialized).not.toContain('Bearer secret');
    expect(serialized).not.toContain('private.trace');
    expect(serialized).not.toContain('session');
    expect(serialized).not.toContain('token');
  });
});
