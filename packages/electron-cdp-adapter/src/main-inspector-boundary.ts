import { hashText } from '@codexhub/evidence-kernel';
import { isLoopbackElectronEndpointHost } from '@codexhub/electron-cdp-kernel';

interface InspectorRuntimeRunnerInput {
  endpointUrl: string;
  targetIdHash: string;
  snippetId: string;
  snippetSource: string;
  timeoutMs: number;
}

export type InspectorRuntimeRunner = (
  input: InspectorRuntimeRunnerInput,
) => Promise<{ status: 'completed' | 'failed' | 'blocked'; resultHash?: string; summary?: string }>;

export interface ElectronMainInspectorBoundaryInput {
  endpointUrl: string;
  endpointHash: string;
  targetIdHash: string;
  snippetId: string;
  snippetSource: string;
  snippetSourceHash: string;
  allowedSnippetHashes: ReadonlyMap<string, string> | Record<string, string>;
  timeoutMs?: number;
  runtimeRunner?: InspectorRuntimeRunner;
}

export interface ElectronMainInspectorBoundaryResult {
  status: 'completed' | 'failed' | 'blocked';
  resultHash?: string;
  cdpHttpBoundaryInvoked: boolean;
  cdpWebSocketBoundaryInvoked: boolean;
  mainInspectorInvoked: boolean;
  rawJavascriptStored: false;
  rawOutputStored: false;
  rawPathStored: false;
  bodyStored: false;
  summary: string;
}

export async function runElectronMainInspectorBoundary(
  input: ElectronMainInspectorBoundaryInput,
): Promise<ElectronMainInspectorBoundaryResult> {
  if (`sha256:${hashText(input.endpointUrl)}` !== input.endpointHash) {
    return createBlockedInspectorResult('Electron main inspector endpoint hash mismatch.');
  }

  const endpoint = new URL(input.endpointUrl);
  if (!isLoopbackElectronEndpointHost(endpoint.hostname)) {
    return createBlockedInspectorResult('Electron main inspector endpoint must be loopback.');
  }

  if (`sha256:${hashText(input.snippetSource)}` !== input.snippetSourceHash) {
    return createBlockedInspectorResult('Electron main inspector snippet source hash mismatch.');
  }

  if (lookupSnippetHash(input.allowedSnippetHashes, input.snippetId) !== input.snippetSourceHash) {
    return createBlockedInspectorResult('Electron main inspector snippet is not allowlisted.');
  }

  const runner = input.runtimeRunner ?? createUnavailableRuntimeRunner();
  const result = await runner({
    endpointUrl: input.endpointUrl,
    targetIdHash: input.targetIdHash,
    snippetId: input.snippetId,
    snippetSource: input.snippetSource,
    timeoutMs: input.timeoutMs ?? 5000,
  });

  return {
    status: result.status,
    resultHash: result.resultHash ?? `sha256:${hashText(result.summary ?? result.status)}`,
    cdpHttpBoundaryInvoked: true,
    cdpWebSocketBoundaryInvoked: true,
    mainInspectorInvoked: true,
    rawJavascriptStored: false,
    rawOutputStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary:
      result.summary ??
      (result.status === 'completed'
        ? 'Electron main inspector fixed snippet completed with metadata-only result.'
        : 'Electron main inspector fixed snippet failed with metadata-only result.'),
  };
}

function createUnavailableRuntimeRunner(): InspectorRuntimeRunner {
  return async () => ({
    status: 'blocked',
    summary: 'Electron main inspector runtime runner is unavailable.',
  });
}

function createBlockedInspectorResult(summary: string): ElectronMainInspectorBoundaryResult {
  return {
    status: 'blocked',
    cdpHttpBoundaryInvoked: false,
    cdpWebSocketBoundaryInvoked: false,
    mainInspectorInvoked: false,
    rawJavascriptStored: false,
    rawOutputStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary,
  };
}

function lookupSnippetHash(
  hashes: ReadonlyMap<string, string> | Record<string, string>,
  snippetId: string,
): string | undefined {
  if ('get' in hashes && typeof hashes.get === 'function') {
    return hashes.get(snippetId);
  }

  const records = hashes as Record<string, string>;
  return records[snippetId];
}
