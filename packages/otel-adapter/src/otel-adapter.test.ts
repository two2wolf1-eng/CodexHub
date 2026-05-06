import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  CapabilityManifestSchema,
  type RealTelemetryExportPlan,
  SchemaVersionSchema,
  type ExecutionAuthority,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import {
  createOtelAdapterManifest,
  executeLocalTelemetryProjection,
  executeTelemetryExport,
  planLocalTelemetryProjection,
  planTelemetryExport,
  runRealTelemetryExportBoundary,
} from './index';

const authority: ExecutionAuthority = {
  id: foundationId('execution_authority'),
  schemaVersion: SchemaVersionSchema.value,
  createdAt: foundationTimestamp(),
  policyDecisionId: 'policy_telemetry_1',
  allowed: true,
  constraints: ['noop-exporter-only'],
};
const sourceDir = new URL('.', import.meta.url);

describe('otel-adapter', () => {
  it('keeps real telemetry network export isolated to the reviewed boundary file', () => {
    const productionSources = [
      'audit.ts',
      'evidence.ts',
      'execute.ts',
      'index.ts',
      'manifest.ts',
      'plan.ts',
      'projection.ts',
    ].map((fileName) => readFileSync(new URL(`./${fileName}`, sourceDir), 'utf8'));
    const boundarySource = readFileSync(new URL('./real-exporter-boundary.ts', sourceDir), 'utf8');
    const nonBoundaryForbiddenTerms = [
      'fetch(',
      'globalThis.fetch',
      'http://',
      'https://',
      '@opentelemetry/exporter',
      'OTLP',
      'process.env',
      'child_process',
      'rawTracePayloadStored: true',
      'evidenceAuditAuthoritative: true',
    ];
    const boundaryForbiddenTerms = [
      'rawTracePayloadStored: true',
      'rawLogStored: true',
      'rawPathStored: true',
      'evidenceAuditAuthoritative: true',
      'node:child_process',
      'spawn(',
      'execFile(',
      'shell: true',
    ];

    for (const source of productionSources) {
      expect(nonBoundaryForbiddenTerms.filter((term) => source.includes(term))).toEqual([]);
    }

    expect(boundaryForbiddenTerms.filter((term) => boundarySource.includes(term))).toEqual([]);
    expect(boundarySource).toContain("if (input.exporterKind === 'in-memory')");
    expect(boundarySource).toContain('isLoopbackHost(endpoint.hostname)');
    expect(boundarySource).toContain('networkBoundaryInvoked: true');
    expect(boundarySource).toContain('evidenceAuditAuthoritative: false');
  });

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

  it('projects local workflow metadata into span summaries without network or raw payload storage', async () => {
    const projectionPlan = planLocalTelemetryProjection([
      {
        sourceKind: 'workflow',
        sourceId: 'workflow-run-123',
        status: 'completed',
        evidenceRefIds: ['evidence-local-1'],
        auditEventIds: ['audit-local-1'],
        summary: 'Completed request with token=secret at C:/Users/Thomas/CodexHub/private.trace',
        count: 2,
      },
      {
        sourceKind: 'policy',
        sourceId: 'policy-decision-123',
        status: 'approval_required',
        evidenceRefIds: ['evidence-policy-1', 'evidence-policy-2'],
        auditEventIds: ['audit-policy-1'],
      },
    ]);

    expect(projectionPlan.projectionSummary.sourceCount).toBe(2);
    expect(projectionPlan.projectionSummary.spanCount).toBe(2);
    expect(projectionPlan.projectionSummary.networkExportAttempted).toBe(false);
    expect(projectionPlan.projectionSummary.evidenceAuditAuthoritative).toBe(false);
    expect(projectionPlan.planResult.plan.networkExportPlanned).toBe(false);
    expect(projectionPlan.planResult.spans[0]?.rawTracePayloadStored).toBe(false);

    const result = await executeLocalTelemetryProjection({
      projectionPlan,
      authority,
    });
    const serialized = JSON.stringify(result);

    expect(result.run.status).toBe('completed');
    expect(result.run.exporterKind).toBe('noop');
    expect(result.run.networkExportAttempted).toBe(false);
    expect(result.run.processBoundaryInvoked).toBe(false);
    expect(result.run.externalProcessStarted).toBe(false);
    expect(result.run.evidenceAuditAuthoritative).toBe(false);
    expect(result.projectionSummary.projectionHash).toMatch(/^sha256:/);
    expect(serialized).not.toContain('workflow-run-123');
    expect(serialized).not.toContain('policy-decision-123');
    expect(serialized).not.toContain('token=secret');
    expect(serialized).not.toContain('private.trace');
  });

  it('exports real telemetry through in-memory metadata without replacing evidence or audit', async () => {
    const spanBatch = [{ name: 'workflow.completed', token: 'hidden' }];
    const result = await runRealTelemetryExportBoundary({
      exporterKind: 'in-memory',
      transientSpanBatch: spanBatch,
      plan: {
        id: foundationId('real_telemetry_plan'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: foundationTimestamp(),
        dryRunId: 'dry_real_telemetry',
        status: 'planned',
        exporterKind: 'in-memory',
        signalKinds: ['trace'],
        spanCount: 1,
        tracePlanHash: `sha256:${hashText(JSON.stringify(spanBatch))}`,
        networkExportPlanned: false,
        processBoundaryPlanned: false,
        blockReasons: [],
        evidenceAuditAuthoritative: false,
        rawTracePayloadStored: false,
        rawLogStored: false,
        rawPathStored: false,
        bodyStored: false,
        summary: 'Synthetic real telemetry plan.',
      },
    });
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('completed');
    expect(result.networkBoundaryInvoked).toBe(false);
    expect(result.evidenceAuditAuthoritative).toBe(false);
    expect(result.rawTracePayloadStored).toBe(false);
    expect(serialized).not.toContain('workflow.completed');
    expect(serialized).not.toContain('hidden');
  });

  it('blocks telemetry network exporter before fetch on endpoint hash or loopback mismatch', async () => {
    const spanBatch = [{ name: 'workflow.completed', token: 'hidden' }];
    const plan = {
      id: foundationId('real_telemetry_plan'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      dryRunId: 'dry_real_telemetry_network',
      status: 'planned' as const,
      exporterKind: 'otlp-http' as const,
      signalKinds: ['trace'] as const,
      spanCount: 1,
      tracePlanHash: `sha256:${hashText(JSON.stringify(spanBatch))}`,
      networkExportPlanned: true,
      processBoundaryPlanned: false,
      blockReasons: [],
      evidenceAuditAuthoritative: false,
      rawTracePayloadStored: false,
      rawLogStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: 'Synthetic network telemetry plan.',
    } satisfies RealTelemetryExportPlan;
    let fetchCallCount = 0;
    const hashMismatch = await runRealTelemetryExportBoundary({
      exporterKind: 'otlp-http',
      transientSpanBatch: spanBatch,
      endpointUrl: 'http://127.0.0.1:4318/v1/traces',
      endpointHash: `sha256:${hashText('http://127.0.0.1:4318/wrong')}`,
      plan,
      fetch: async () => {
        fetchCallCount += 1;
        throw new Error('fetch must not run on hash mismatch');
      },
    });
    const nonLoopback = await runRealTelemetryExportBoundary({
      exporterKind: 'otlp-http',
      transientSpanBatch: spanBatch,
      endpointUrl: 'https://otel.example.test/v1/traces',
      endpointHash: `sha256:${hashText('https://otel.example.test/v1/traces')}`,
      plan,
      fetch: async () => {
        fetchCallCount += 1;
        throw new Error('fetch must not run for non-loopback endpoint');
      },
    });
    const serialized = JSON.stringify({ hashMismatch, nonLoopback });

    expect(hashMismatch.status).toBe('blocked');
    expect(nonLoopback.status).toBe('blocked');
    expect(fetchCallCount).toBe(0);
    expect(hashMismatch.networkBoundaryInvoked).toBe(false);
    expect(nonLoopback.networkBoundaryInvoked).toBe(false);
    expect(serialized).not.toContain('workflow.completed');
    expect(serialized).not.toContain('hidden');
    expect(serialized).not.toContain('otel.example.test');
  });

  it('runs telemetry network exporter only on hash-bound loopback with non-authoritative output', async () => {
    const spanBatch = [{ name: 'workflow.completed', token: 'hidden' }];
    const endpointUrl = 'http://127.0.0.1:4318/v1/traces';
    const plan = {
      id: foundationId('real_telemetry_plan'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      dryRunId: 'dry_real_telemetry_network_completed',
      status: 'planned' as const,
      exporterKind: 'otlp-http' as const,
      signalKinds: ['trace'] as const,
      spanCount: 1,
      tracePlanHash: `sha256:${hashText(JSON.stringify(spanBatch))}`,
      networkExportPlanned: true,
      processBoundaryPlanned: false,
      blockReasons: [],
      evidenceAuditAuthoritative: false,
      rawTracePayloadStored: false,
      rawLogStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: 'Synthetic network telemetry plan.',
    } satisfies RealTelemetryExportPlan;
    const requestedUrls: string[] = [];
    const result = await runRealTelemetryExportBoundary({
      exporterKind: 'otlp-http',
      transientSpanBatch: spanBatch,
      endpointUrl,
      endpointHash: `sha256:${hashText(endpointUrl)}`,
      plan,
      fetch: async (url, init) => {
        requestedUrls.push(url);
        expect(init.method).toBe('POST');
        expect(init.headers['content-type']).toBe('application/json');
        return {
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify({ accepted: true, token: 'hidden' });
          },
        };
      },
    });
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('completed');
    expect(result.networkBoundaryInvoked).toBe(true);
    expect(result.evidenceAuditAuthoritative).toBe(false);
    expect(result.rawTracePayloadStored).toBe(false);
    expect(result.rawLogStored).toBe(false);
    expect(requestedUrls).toEqual([endpointUrl]);
    expect(serialized).not.toContain('workflow.completed');
    expect(serialized).not.toContain('hidden');
    expect(serialized).not.toContain(endpointUrl);
  });
});
