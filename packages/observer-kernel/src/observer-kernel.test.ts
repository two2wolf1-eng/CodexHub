import { describe, expect, it } from 'vitest';
import { MockObservationSource, aggregateSourceHealth } from './index';

describe('observer-kernel mock source health', () => {
  it('aggregates mock source health', async () => {
    const health = await aggregateSourceHealth([new MockObservationSource('mock.supervisor')]);

    expect(health).toHaveLength(1);
    expect(health[0]?.source).toBe('mock.supervisor');
    expect(health[0]?.status).toBe('ok');
  });
});

