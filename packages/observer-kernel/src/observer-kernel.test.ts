import { describe, expect, it } from 'vitest';
import {
  MockObservationSource,
  aggregateSourceHealth,
  createAllowlistedOsProcessObserver,
  createOsProcessMetadataSummary,
} from './index';

describe('observer-kernel mock source health', () => {
  it('aggregates mock source health', async () => {
    const health = await aggregateSourceHealth([new MockObservationSource('mock.supervisor')]);

    expect(health).toHaveLength(1);
    expect(health[0]?.source).toBe('mock.supervisor');
    expect(health[0]?.status).toBe('ok');
  });
});

describe('observer-kernel OS process observer', () => {
  it('summarizes allowlisted process snapshots without raw paths or arguments', async () => {
    const observer = createAllowlistedOsProcessObserver({
      allowlistedProcessNames: ['Codex.exe'],
      observedKind: 'codex-desktop',
      enumerator: {
        async listProcesses() {
          return [
            {
              processId: 43325,
              processName: 'Codex.exe',
              executablePath: 'C:\\Users\\Thomas\\AppData\\Local\\Codex\\Codex.exe',
              commandLine: '--remote-debugging-port=43325 --private-flag',
              parentProcessId: 1000,
              cpuPercent: 2.345,
              memoryBytes: 123_456_789,
              durationMs: 9876,
            },
            {
              processId: 100,
              processName: 'notepad.exe',
              executablePath: 'C:\\Windows\\notepad.exe',
            },
          ];
        },
      },
    });

    const summaries = await observer.collectProcessSummaries();
    const observations = await observer.collect();
    const health = await observer.health();
    const serialized = JSON.stringify({ summaries, observations, health });

    expect(summaries).toHaveLength(1);
    expect(summaries[0]?.observedKind).toBe('codex-desktop');
    expect(summaries[0]?.allowlistMatched).toBe(true);
    expect(summaries[0]?.processIdHash).toMatch(/^sha256:/);
    expect(summaries[0]?.executablePathHash).toMatch(/^sha256:/);
    expect(summaries[0]?.commandLineHash).toMatch(/^sha256:/);
    expect(summaries[0]?.cpuPercentRounded).toBe(2.3);
    expect(summaries[0]?.memoryBytesRounded).toBeGreaterThan(0);
    expect(summaries[0]?.processBoundaryInvoked).toBe(false);
    expect(observations).toHaveLength(1);
    expect(observations[0]?.kind).toBe('os.process_summary');
    expect(health.status).toBe('ok');
    expect(serialized).not.toContain('Codex.exe');
    expect(serialized).not.toContain('notepad.exe');
    expect(serialized).not.toContain('C:\\Users\\Thomas');
    expect(serialized).not.toContain('--private-flag');
    expect(serialized).not.toContain('43325');
  });

  it('does not enumerate OS processes without an injected enumerator', async () => {
    const observer = createAllowlistedOsProcessObserver({
      allowlistedProcessNames: ['Codex.exe'],
      observedKind: 'codex-desktop',
    });

    await expect(observer.collectProcessSummaries()).resolves.toEqual([]);
    await expect(observer.health()).resolves.toMatchObject({
      status: 'unavailable',
      observationsCount: 0,
    });
  });

  it('rejects raw process fields outside the metadata summary schema', () => {
    const summary = createOsProcessMetadataSummary(
      {
        processId: 1,
        processName: 'Codex.exe',
        executablePath: 'C:\\Users\\Thomas\\Codex.exe',
      },
      { observedKind: 'codex-desktop', allowlistMatched: true },
    );

    expect(summary.rawPathStored).toBe(false);
    expect(JSON.stringify(summary)).not.toContain('C:\\Users\\Thomas');
  });
});
