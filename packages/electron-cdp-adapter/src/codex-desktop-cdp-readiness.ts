import {
  RealClientConnectionReadinessSchema,
  type RealClientConnectionReadiness,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

interface FetchResponseLike {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

type FetchLike = (url: string, init?: { method: 'GET' }) => Promise<FetchResponseLike>;

export interface CodexDesktopCdpConnectionProbeInput {
  endpointUrl?: string;
  observedAt?: string;
  fetch?: FetchLike;
}

export async function probeCodexDesktopCdpConnectionReadiness(
  input: CodexDesktopCdpConnectionProbeInput = {},
): Promise<RealClientConnectionReadiness> {
  const endpointUrl = input.endpointUrl?.trim();
  const endpointHash = endpointUrl ? `sha256:${hashText(endpointUrl)}` : undefined;
  const observedAt = input.observedAt ?? foundationTimestamp();

  if (!endpointUrl) {
    return RealClientConnectionReadinessSchema.parse({
      id: foundationId('real_client_connection'),
      schemaVersion: '2026-04-28.foundation',
      observedAt,
      surface: 'codex-desktop-cdp',
      status: 'blocked',
      endpointConfigured: false,
      blockReasons: ['codex_desktop_cdp_endpoint_missing'],
      summary: 'Codex Desktop CDP endpoint is not configured.',
    });
  }

  const baseUrl = normalizeLoopbackHttpEndpoint(endpointUrl);
  if (!baseUrl) {
    return RealClientConnectionReadinessSchema.parse({
      id: foundationId('real_client_connection'),
      schemaVersion: '2026-04-28.foundation',
      observedAt,
      surface: 'codex-desktop-cdp',
      status: 'blocked',
      endpointConfigured: true,
      endpointHash,
      blockReasons: ['non_loopback_endpoint_forbidden'],
      summary: 'Codex Desktop CDP endpoint must be loopback-only.',
    });
  }

  const fetchImpl = input.fetch ?? globalThis.fetch;
  if (!fetchImpl) {
    return RealClientConnectionReadinessSchema.parse({
      id: foundationId('real_client_connection'),
      schemaVersion: '2026-04-28.foundation',
      observedAt,
      surface: 'codex-desktop-cdp',
      status: 'blocked',
      endpointConfigured: true,
      endpointHash,
      blockReasons: ['fetch_unavailable'],
      summary: 'Codex Desktop CDP readiness probe cannot run without fetch.',
    });
  }

  try {
    const versionBody = await readEndpointText(fetchImpl, `${baseUrl}/json/version`);
    const listBody = await readEndpointText(fetchImpl, `${baseUrl}/json/list`);
    const targets = parseTargetCount(listBody);

    return RealClientConnectionReadinessSchema.parse({
      id: foundationId('real_client_connection'),
      schemaVersion: '2026-04-28.foundation',
      observedAt,
      surface: 'codex-desktop-cdp',
      status: 'ready',
      endpointConfigured: true,
      endpointHash,
      targetCount: targets,
      cdpHttpBoundaryInvoked: true,
      realClientConnected: true,
      evidenceRefIds: [
        `sha256:${hashText(versionBody)}`,
        `sha256:${hashText(listBody)}`,
      ],
      blockReasons: [],
      summary: 'Codex Desktop CDP readiness probe completed with metadata-only output.',
    });
  } catch {
    return RealClientConnectionReadinessSchema.parse({
      id: foundationId('real_client_connection'),
      schemaVersion: '2026-04-28.foundation',
      observedAt,
      surface: 'codex-desktop-cdp',
      status: 'failed',
      endpointConfigured: true,
      endpointHash,
      cdpHttpBoundaryInvoked: true,
      blockReasons: ['codex_desktop_cdp_connection_failed'],
      summary: 'Codex Desktop CDP readiness probe failed.',
    });
  }
}

async function readEndpointText(fetchImpl: FetchLike, url: string): Promise<string> {
  const response = await fetchImpl(url, { method: 'GET' });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Codex Desktop CDP endpoint returned ${response.status}.`);
  }
  return text;
}

function parseTargetCount(listBody: string): number {
  const parsed = JSON.parse(listBody) as unknown;
  if (!Array.isArray(parsed)) {
    throw new SyntaxError('Codex Desktop CDP target list must be an array.');
  }
  return parsed.length;
}

function normalizeLoopbackHttpEndpoint(endpointUrl: string): string | undefined {
  try {
    const parsed = new URL(endpointUrl);
    const host = parsed.hostname.toLowerCase();
    if (
      parsed.protocol !== 'http:' ||
      parsed.username ||
      parsed.password ||
      (host !== 'localhost' && host !== '127.0.0.1' && host !== '::1' && host !== '[::1]')
    ) {
      return undefined;
    }
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return undefined;
  }
}
