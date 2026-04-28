import { describe, expect, it } from 'vitest';
import { createEvidenceRef } from './index';

describe('evidence-kernel metadata/hash-only evidence', () => {
  it('redacts sensitive metadata and does not store body content', () => {
    const evidence = createEvidenceRef({
      kind: 'hash',
      label: 'agent-run:test',
      summary: 'Mock evidence summary',
      expiresAt: '2026-05-28T00:00:00.000Z',
      metadata: {
        token: 'secret-token',
        status: 'completed',
      },
      bodyForHashOnly: 'do not store this body',
    });

    expect(evidence.summary).toBe('Mock evidence summary');
    expect(evidence.expiresAt).toBe('2026-05-28T00:00:00.000Z');
    expect(evidence.hash).toMatch(/^sha256:/);
    expect(evidence.metadata?.token).toBe('[redacted]');
    expect(JSON.stringify(evidence)).not.toContain('do not store this body');
  });
});
