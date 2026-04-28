import {
  type Observation,
  type SourceHealth,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import type { EvidenceCollector } from '@codexhub/evidence-kernel';

export interface ObservationSourceContext {
  evidenceCollector?: EvidenceCollector;
}

export interface ObservationSource {
  readonly name: string;
  collect(context?: ObservationSourceContext): Promise<Observation[]>;
  health(context?: ObservationSourceContext): Promise<SourceHealth>;
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

