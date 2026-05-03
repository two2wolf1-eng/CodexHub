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
        nested: {
          authorization: 'Bearer secret',
          safe: 'ok',
        },
        entries: [
          {
            apiKey: 'secret-key',
            path: ['C:\\Users\\Thomas\\CodexHub\\.worktrees\\entry-private'],
            value: 'kept',
          },
        ],
        profilePath: ['C:\\Users\\Thomas\\AppData\\Local\\Chrome\\Profile 1'],
        worktreePath: 'C:\\Users\\Thomas\\CodexHub\\.worktrees\\private',
        workspaceRoot: 'C:\\Users\\Thomas\\CodexHub',
        dbPath: 'C:\\Users\\Thomas\\CodexHub\\.codexhub\\data\\codexhub.sqlite',
        logDirectory: 'C:\\Users\\Thomas\\CodexHub\\.codexhub\\logs',
        sourcePaths: ['C:\\Users\\Thomas\\CodexHub\\packages\\contracts\\src\\index.ts'],
        configPathHash: 'sha256:already-redacted',
      },
      bodyForHashOnly: 'do not store this body',
    });
    const metadata = evidence.metadata as Record<string, unknown>;
    const nested = metadata.nested as Record<string, unknown>;
    const entries = metadata.entries as Record<string, unknown>[];
    const entryPath = entries[0]?.path as string[];
    const profilePath = metadata.profilePath as string[];

    expect(evidence.summary).toBe('Mock evidence summary');
    expect(evidence.expiresAt).toBe('2026-05-28T00:00:00.000Z');
    expect(evidence.hash).toMatch(/^sha256:/);
    expect(metadata.token).toBe('[redacted]');
    expect(metadata.status).toBe('completed');
    expect(nested.authorization).toBe('[redacted]');
    expect(nested.safe).toBe('ok');
    expect(entries[0]?.apiKey).toBe('[redacted]');
    expect(entryPath[0]).toMatch(/^sha256:/);
    expect(profilePath[0]).toMatch(/^sha256:/);
    expect(entries[0]?.value).toBe('kept');
    expect(metadata.worktreePath).toMatch(/^sha256:/);
    expect(metadata.workspaceRoot).toMatch(/^sha256:/);
    expect(metadata.dbPath).toMatch(/^sha256:/);
    expect(metadata.logDirectory).toMatch(/^sha256:/);
    expect((metadata.sourcePaths as string[])[0]).toMatch(/^sha256:/);
    expect(metadata.configPathHash).toBe('sha256:already-redacted');
    expect(JSON.stringify(evidence)).not.toContain('do not store this body');
    expect(JSON.stringify(evidence)).not.toContain('secret-token');
    expect(JSON.stringify(evidence)).not.toContain('Bearer secret');
    expect(JSON.stringify(evidence)).not.toContain('C:\\Users\\Thomas');
    expect(JSON.stringify(evidence)).not.toContain('entry-private');
    expect(JSON.stringify(evidence)).not.toContain('Profile 1');
  });
});
