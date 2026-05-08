import {
  type RealClientActionKind,
  RealClientActionRunSchema,
  type RealClientConnectionReadiness,
  RealClientConnectionReadinessSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

interface ChromiumLike {
  connectOverCDP(endpointURL: string): Promise<BrowserLike>;
}

interface BrowserLike {
  contexts(): BrowserContextLike[];
  close(): Promise<void>;
}

interface BrowserContextLike {
  pages(): PageLike[];
  newPage?(): Promise<PageLike>;
}

interface PageLike {
  url(): string;
  title(): Promise<string>;
  goto?(target: string, options: { waitUntil: 'domcontentloaded'; timeout: number }): Promise<unknown>;
  locator(selector: string): LocatorLike;
}

interface LocatorLike {
  click(options?: { timeout: number }): Promise<void>;
  fill(value: string, options?: { timeout: number }): Promise<void>;
  press?(key: string, options?: { timeout: number }): Promise<void>;
}

interface PlaywrightModuleLike {
  chromium: ChromiumLike;
}

export interface ChromeCdpConnectionProbeInput {
  endpointUrl?: string;
  timeoutMs?: number;
  observedAt?: string;
  loadPlaywright?: () => Promise<PlaywrightModuleLike>;
}

export interface ChromeCdpActionStep {
  actionKind: RealClientActionKind;
  targetUrl?: string;
  targetUrlHash?: string;
  selector: string;
  selectorHash: string;
  typedText?: string;
  typedTextHash?: string;
}

export interface ChromeCdpActionBoundaryInput {
  endpointUrl?: string;
  steps: readonly ChromeCdpActionStep[];
  timeoutMs?: number;
  createdAt?: string;
  loadPlaywright?: () => Promise<PlaywrightModuleLike>;
}

export async function probeChromeCdpConnectionReadiness(
  input: ChromeCdpConnectionProbeInput = {},
): Promise<RealClientConnectionReadiness> {
  const endpointUrl = input.endpointUrl?.trim();
  const endpointHash = endpointUrl ? `sha256:${hashText(endpointUrl)}` : undefined;
  const observedAt = input.observedAt ?? foundationTimestamp();

  if (!endpointUrl) {
    return RealClientConnectionReadinessSchema.parse({
      id: foundationId('real_client_connection'),
      schemaVersion: '2026-04-28.foundation',
      observedAt,
      surface: 'chrome-cdp',
      status: 'blocked',
      endpointConfigured: false,
      blockReasons: ['chrome_cdp_endpoint_missing'],
      summary: 'Chrome CDP endpoint is not configured.',
    });
  }

  if (!isLoopbackCdpEndpoint(endpointUrl)) {
    return RealClientConnectionReadinessSchema.parse({
      id: foundationId('real_client_connection'),
      schemaVersion: '2026-04-28.foundation',
      observedAt,
      surface: 'chrome-cdp',
      status: 'blocked',
      endpointConfigured: true,
      endpointHash,
      blockReasons: ['non_loopback_endpoint_forbidden'],
      summary: 'Chrome CDP endpoint must be loopback-only.',
    });
  }

  let cdpHttpBoundaryInvoked = false;
  let browser: BrowserLike | undefined;

  try {
    const loaded = await (input.loadPlaywright ?? loadPlaywright)();
    cdpHttpBoundaryInvoked = true;
    browser = await loaded.chromium.connectOverCDP(endpointUrl);
    const contexts = browser.contexts();
    const pages = contexts.flatMap((context) => context.pages());

    await Promise.all(
      pages.slice(0, 5).map(async (page) => {
        await page.title().catch(() => '');
        return page.url();
      }),
    );

    return RealClientConnectionReadinessSchema.parse({
      id: foundationId('real_client_connection'),
      schemaVersion: '2026-04-28.foundation',
      observedAt,
      surface: 'chrome-cdp',
      status: 'ready',
      endpointConfigured: true,
      endpointHash,
      contextCount: contexts.length,
      pageCount: pages.length,
      targetCount: pages.length,
      cdpHttpBoundaryInvoked,
      realClientConnected: true,
      blockReasons: [],
      summary: 'Chrome CDP connection readiness probe completed with metadata-only output.',
    });
  } catch {
    return RealClientConnectionReadinessSchema.parse({
      id: foundationId('real_client_connection'),
      schemaVersion: '2026-04-28.foundation',
      observedAt,
      surface: 'chrome-cdp',
      status: 'failed',
      endpointConfigured: true,
      endpointHash,
      cdpHttpBoundaryInvoked,
      blockReasons: ['chrome_cdp_connection_failed'],
      summary: 'Chrome CDP connection readiness probe failed.',
    });
  } finally {
    await closeQuietly(browser);
  }
}

export async function runChromeCdpActionBoundary(input: ChromeCdpActionBoundaryInput) {
  const endpointUrl = input.endpointUrl?.trim();
  const endpointHash = endpointUrl ? `sha256:${hashText(endpointUrl)}` : 'sha256:missing';
  const createdAt = input.createdAt ?? foundationTimestamp();

  if (!endpointUrl || !isLoopbackCdpEndpoint(endpointUrl)) {
    return createRealClientActionRun({
      createdAt,
      endpointHash,
      actionKind: input.steps[0]?.actionKind ?? 'click',
      status: 'blocked',
      actionCount: input.steps.length,
      blockedActionCount: input.steps.length,
      summary: endpointUrl
        ? 'Chrome CDP action blocked: endpoint must be loopback-only.'
        : 'Chrome CDP action blocked: endpoint is not configured.',
    });
  }

  const invalidStep = input.steps.find((step) => !validateActionStepHashes(step));
  if (invalidStep) {
    return createRealClientActionRun({
      createdAt,
      endpointHash,
      actionKind: invalidStep.actionKind,
      status: 'blocked',
      actionCount: input.steps.length,
      blockedActionCount: input.steps.length,
      targetUrlHash: invalidStep.targetUrlHash,
      selectorHash: invalidStep.selectorHash,
      typedTextHash: invalidStep.typedTextHash,
      summary: 'Chrome CDP action blocked: action step hash mismatch.',
    });
  }

  let browser: BrowserLike | undefined;
  let cdpHttpBoundaryInvoked = false;
  let browserActionInvoked = false;

  try {
    const loaded = await (input.loadPlaywright ?? loadPlaywright)();
    cdpHttpBoundaryInvoked = true;
    browser = await loaded.chromium.connectOverCDP(endpointUrl);
    const page = await resolveActionPage(browser, input.steps[0], input.timeoutMs ?? 5000);

    for (const step of input.steps) {
      if (step.targetUrl && page.goto) {
        await page.goto(step.targetUrl, {
          waitUntil: 'domcontentloaded',
          timeout: input.timeoutMs ?? 5000,
        });
      }
      const locator = page.locator(step.selector);
      if (step.actionKind === 'click') {
        await locator.click({ timeout: input.timeoutMs ?? 5000 });
      } else if (step.actionKind === 'type') {
        await locator.fill(step.typedText ?? '', { timeout: input.timeoutMs ?? 5000 });
      } else if (locator.press) {
        await locator.press('Enter', { timeout: input.timeoutMs ?? 5000 });
      } else {
        await locator.click({ timeout: input.timeoutMs ?? 5000 });
      }
      browserActionInvoked = true;
    }

    const firstStep = input.steps[0];

    return createRealClientActionRun({
      createdAt,
      endpointHash,
      actionKind: firstStep?.actionKind ?? 'click',
      status: 'completed',
      actionCount: input.steps.length,
      approvedActionCount: input.steps.length,
      cdpHttpBoundaryInvoked,
      browserActionInvoked,
      visibleUiExecution: true,
      targetUrlHash: firstStep?.targetUrlHash,
      selectorHash: firstStep?.selectorHash,
      typedTextHash: firstStep?.typedTextHash,
      summary: 'Chrome CDP fixed visible UI action completed with metadata-only output.',
    });
  } catch {
    const firstStep = input.steps[0];

    return createRealClientActionRun({
      createdAt,
      endpointHash,
      actionKind: firstStep?.actionKind ?? 'click',
      status: 'failed',
      actionCount: input.steps.length,
      blockedActionCount: input.steps.length,
      cdpHttpBoundaryInvoked,
      browserActionInvoked,
      targetUrlHash: firstStep?.targetUrlHash,
      selectorHash: firstStep?.selectorHash,
      typedTextHash: firstStep?.typedTextHash,
      summary: 'Chrome CDP fixed visible UI action failed.',
    });
  } finally {
    await closeQuietly(browser);
  }
}

function createRealClientActionRun(input: {
  createdAt: string;
  endpointHash: string;
  actionKind: RealClientActionKind;
  status: 'authorized' | 'blocked' | 'completed' | 'failed';
  actionCount: number;
  approvedActionCount?: number;
  blockedActionCount?: number;
  cdpHttpBoundaryInvoked?: boolean;
  browserActionInvoked?: boolean;
  visibleUiExecution?: boolean;
  targetUrlHash?: string;
  selectorHash?: string;
  typedTextHash?: string;
  summary: string;
}) {
  return RealClientActionRunSchema.parse({
    id: foundationId('real_client_action_run'),
    schemaVersion: '2026-04-28.foundation',
    createdAt: input.createdAt,
    surface: 'chrome-cdp',
    actionKind: input.actionKind,
    status: input.status,
    endpointHash: input.endpointHash,
    targetUrlHash: input.targetUrlHash,
    selectorHash: input.selectorHash,
    typedTextHash: input.typedTextHash,
    actionCount: input.actionCount,
    approvedActionCount: input.approvedActionCount ?? 0,
    blockedActionCount: input.blockedActionCount ?? 0,
    cdpHttpBoundaryInvoked: input.cdpHttpBoundaryInvoked ?? false,
    browserActionInvoked: input.browserActionInvoked ?? false,
    visibleUiExecution: input.visibleUiExecution ?? false,
    summary: input.summary,
  });
}

async function resolveActionPage(
  browser: BrowserLike,
  step: ChromeCdpActionStep | undefined,
  timeoutMs: number,
): Promise<PageLike> {
  const pages = browser.contexts().flatMap((context) => context.pages());
  const matchingPage = step?.targetUrlHash
    ? pages.find((page) => `sha256:${hashText(page.url())}` === step.targetUrlHash)
    : undefined;

  if (matchingPage) return matchingPage;
  if (pages[0]) return pages[0];

  const context = browser.contexts()[0];
  if (context?.newPage) return context.newPage();

  throw new Error(`Chrome CDP action could not find or create a page within ${timeoutMs}ms.`);
}

function validateActionStepHashes(step: ChromeCdpActionStep): boolean {
  if (step.targetUrl && `sha256:${hashText(step.targetUrl)}` !== step.targetUrlHash) {
    return false;
  }
  if (`sha256:${hashText(step.selector)}` !== step.selectorHash) {
    return false;
  }
  if (
    step.actionKind === 'type' &&
    (!step.typedText ||
      !step.typedTextHash ||
      `sha256:${hashText(step.typedText)}` !== step.typedTextHash)
  ) {
    return false;
  }
  return true;
}

function isLoopbackCdpEndpoint(endpointUrl: string): boolean {
  try {
    const parsed = new URL(endpointUrl);
    const protocolAllowed = parsed.protocol === 'http:' || parsed.protocol === 'ws:';
    const host = parsed.hostname.toLowerCase();
    return (
      protocolAllowed &&
      !parsed.username &&
      !parsed.password &&
      (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]')
    );
  } catch {
    return false;
  }
}

async function loadPlaywright(): Promise<PlaywrightModuleLike> {
  return (await import('playwright')) as PlaywrightModuleLike;
}

async function closeQuietly(resource: { close(): Promise<void> } | undefined): Promise<void> {
  try {
    await resource?.close();
  } catch {
    // Best-effort cleanup only; action evidence is generated from guarded metadata.
  }
}
