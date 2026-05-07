import {
  type Observation,
  ObservationSchema,
  type OsProcessMetadataSummary,
  OsProcessMetadataSummarySchema,
  type SourceHealth,
  SourceHealthSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText, type EvidenceCollector } from '@codexhub/evidence-kernel';

export interface ObservationSourceContext {
  evidenceCollector?: EvidenceCollector;
}

export interface ObservationSource {
  readonly name: string;
  collect(context?: ObservationSourceContext): Promise<Observation[]>;
  health(context?: ObservationSourceContext): Promise<SourceHealth>;
}

export interface OsProcessSnapshot {
  processId: string | number;
  processName: string;
  executablePath?: string;
  commandLine?: string;
  parentProcessId?: string | number;
  cpuPercent?: number;
  memoryBytes?: number;
  durationMs?: number;
}

export interface OsProcessEnumerator {
  listProcesses(): Promise<readonly OsProcessSnapshot[]>;
}

export interface AllowlistedOsProcessObserverInput {
  name?: string;
  allowlistedProcessNames: readonly string[];
  observedKind?: OsProcessMetadataSummary['observedKind'];
  enumerator?: OsProcessEnumerator;
}

export class AllowlistedOsProcessObserver implements ObservationSource {
  readonly name: string;

  constructor(private readonly input: AllowlistedOsProcessObserverInput) {
    this.name = input.name ?? 'os.process.allowlisted';
  }

  async collectProcessSummaries(): Promise<OsProcessMetadataSummary[]> {
    if (!this.input.enumerator) {
      return [];
    }

    const allowlist = new Set(
      this.input.allowlistedProcessNames.map((name) => normalizeProcessName(name)),
    );
    const snapshots = await this.input.enumerator.listProcesses();
    return snapshots
      .filter((snapshot) => allowlist.has(normalizeProcessName(snapshot.processName)))
      .map((snapshot) => createOsProcessMetadataSummary(snapshot, {
        observedKind: this.input.observedKind ?? 'unknown',
        allowlistMatched: true,
      }));
  }

  async collect(_context?: ObservationSourceContext): Promise<Observation[]> {
    const summaries = await this.collectProcessSummaries();

    return summaries.map((summary) =>
      ObservationSchema.parse({
        id: foundationId('observation'),
        schemaVersion: SchemaVersionSchema.value,
        observedAt: summary.observedAt,
        source: this.name,
        kind: 'os.process_summary',
        summary: 'Allowlisted OS process observed as metadata-only summary.',
        severity: 'info',
      }),
    );
  }

  async health(_context?: ObservationSourceContext): Promise<SourceHealth> {
    const observations = await this.collect(_context);

    return SourceHealthSchema.parse({
      id: foundationId('source_health'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt: foundationTimestamp(),
      source: this.name,
      status: this.input.enumerator ? 'ok' : 'unavailable',
      lastObservationAt: observations[0]?.observedAt,
      observationsCount: observations.length,
    });
  }
}

export function createAllowlistedOsProcessObserver(
  input: AllowlistedOsProcessObserverInput,
): AllowlistedOsProcessObserver {
  return new AllowlistedOsProcessObserver(input);
}

export function createOsProcessMetadataSummary(
  snapshot: OsProcessSnapshot,
  input: {
    observedKind?: OsProcessMetadataSummary['observedKind'];
    allowlistMatched?: boolean;
    observedAt?: string;
  } = {},
): OsProcessMetadataSummary {
  return OsProcessMetadataSummarySchema.parse({
    id: foundationId('os_process_summary'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: input.observedAt ?? foundationTimestamp(),
    observedKind: input.observedKind ?? 'unknown',
    processNameHash: hashRef(snapshot.processName),
    processIdHash: hashRef(snapshot.processId),
    parentProcessIdHash:
      snapshot.parentProcessId !== undefined ? hashRef(snapshot.parentProcessId) : undefined,
    executablePathHash: snapshot.executablePath
      ? hashRef(snapshot.executablePath)
      : undefined,
    commandLineHash: snapshot.commandLine ? hashRef(snapshot.commandLine) : undefined,
    allowlistMatched: input.allowlistMatched ?? false,
    status: 'observed',
    cpuSampleCount: snapshot.cpuPercent === undefined ? 0 : 1,
    cpuPercentRounded:
      snapshot.cpuPercent === undefined ? undefined : roundMetric(snapshot.cpuPercent, 1),
    memoryBytesRounded:
      snapshot.memoryBytes === undefined ? undefined : roundMemoryBytes(snapshot.memoryBytes),
    durationMs:
      snapshot.durationMs === undefined
        ? undefined
        : Math.max(0, Math.trunc(snapshot.durationMs)),
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: 'OS process metadata stores hashes and rounded metrics only.',
  });
}

export class MockObservationSource implements ObservationSource {
  readonly name: string;

  constructor(name = 'mock.codexhub.local') {
    this.name = name;
  }

  async collect(_context?: ObservationSourceContext): Promise<Observation[]> {
    return [
      {
        id: foundationId('observation'),
        schemaVersion: SchemaVersionSchema.value,
        observedAt: foundationTimestamp(),
        source: this.name,
        kind: 'mock.health',
        summary: 'Mock observation source is available.',
        severity: 'info',
        metadata: { mock: true },
      },
    ];
  }

  async health(_context?: ObservationSourceContext): Promise<SourceHealth> {
    const observations = await this.collect(_context);

    return {
      id: foundationId('source_health'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt: foundationTimestamp(),
      source: this.name,
      status: 'ok',
      lastObservationAt: observations[0]?.observedAt,
      observationsCount: observations.length,
      metadata: { mock: true },
    };
  }
}

export async function aggregateSourceHealth(
  sources: ObservationSource[],
  context?: ObservationSourceContext,
): Promise<SourceHealth[]> {
  return Promise.all(sources.map((source) => source.health(context)));
}

function normalizeProcessName(value: string): string {
  return value.trim().toLowerCase();
}

function hashRef(value: string | number): string {
  return `sha256:${hashText(String(value))}`;
}

function roundMetric(value: number, digits: number): number | undefined {
  if (!Number.isFinite(value)) {
    return undefined;
  }

  const factor = 10 ** digits;
  return Math.max(0, Math.round(value * factor) / factor);
}

function roundMemoryBytes(value: number): number | undefined {
  if (!Number.isFinite(value)) {
    return undefined;
  }

  return Math.max(0, Math.round(value / 1024) * 1024);
}
