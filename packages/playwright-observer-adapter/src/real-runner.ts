import {
  type BrowserConsoleSummary,
  type BrowserNetworkMetadataSummary,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import { type PlaywrightObserverRunner, type PlaywrightObserverFixtureRunnerResult } from './execute';
import { PLAYWRIGHT_OBSERVER_ADAPTER_NAME } from './manifest';
import { type PlaywrightObserverAdapterPlan, isAllowedReadOnlyTargetUrl } from './plan';

interface BrowserTypeLike {
  launch(options: { headless: boolean }): Promise<BrowserLike>;
}

interface BrowserLike {
  newContext(options?: Record<string, unknown>): Promise<BrowserContextLike>;
  close(): Promise<void>;
}

interface BrowserContextLike {
  newPage(): Promise<PageLike>;
  close(): Promise<void>;
}

interface PageLike {
  goto(target: string, options: { waitUntil: 'domcontentloaded'; timeout: number }): Promise<unknown>;
  title(): Promise<string>;
  url(): string;
  locator?(selector: string): LocatorLike;
  on(event: string, listener: (...args: unknown[]) => void): void;
}

interface LocatorLike {
  ariaSnapshot?: () => Promise<string>;
}

interface PlaywrightModuleLike {
  chromium: BrowserTypeLike;
}

export interface PlaywrightReadOnlyRealRunnerInput {
  targetUrl: string;
  timeoutMs?: number;
  headless?: boolean;
  loadPlaywright?: () => Promise<PlaywrightModuleLike>;
}

export function createPlaywrightReadOnlyRealRunner(
  input: PlaywrightReadOnlyRealRunnerInput,
): PlaywrightObserverRunner {
  return {
    async observe(plan: PlaywrightObserverAdapterPlan): Promise<PlaywrightObserverFixtureRunnerResult> {
      return observeWithControlledLocalBrowser(input, plan);
    },
  };
}

async function observeWithControlledLocalBrowser(
  input: PlaywrightReadOnlyRealRunnerInput,
  plan: PlaywrightObserverAdapterPlan,
): Promise<PlaywrightObserverFixtureRunnerResult> {
  const targetUrlHash = `sha256:${hashText(input.targetUrl)}`;

  if (plan.runnerMode !== 'controlled-local-browser' || !isAllowedReadOnlyTargetUrl(input.targetUrl)) {
    return {
      status: 'failed',
      targetUrlHash,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      sourceLabel: `${PLAYWRIGHT_OBSERVER_ADAPTER_NAME}.controlled-local-browser`,
      summary: 'Controlled browser observation blocked by target policy.',
    };
  }

  const consoleSummary = createEmptyConsoleSummary();
  const networkSummary = createEmptyNetworkSummary();
  let browser: BrowserLike | undefined;
  let context: BrowserContextLike | undefined;
  let boundaryInvoked = false;
  let processStarted = false;

  try {
    const loaded = await (input.loadPlaywright ?? loadPlaywright)();
    const browserType = loaded.chromium;
    boundaryInvoked = true;
    browser = await browserType.launch({ headless: input.headless ?? true });
    processStarted = true;
    context = await browser.newContext({});
    const page = await context.newPage();
    attachMetadataListeners(page, consoleSummary, networkSummary);
    await page.goto(input.targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: input.timeoutMs ?? 5000,
    });
    const pageTitle = await page.title();
    const pageUrl = page.url();
    const accessibilitySnapshot = await readAccessibilitySnapshot(page);

    return {
      status: 'completed',
      targetUrlHash,
      pageTitle,
      pageUrl,
      accessibilitySnapshot,
      accessibilityNodeCount: countAccessibilityNodes(accessibilitySnapshot),
      consoleSummary,
      networkSummary,
      processBoundaryInvoked: boundaryInvoked,
      externalProcessStarted: processStarted,
      sourceLabel: `${PLAYWRIGHT_OBSERVER_ADAPTER_NAME}.controlled-local-browser`,
      summary: 'Controlled local browser observation completed.',
    };
  } catch (error) {
    return {
      status: 'failed',
      targetUrlHash,
      consoleSummary,
      networkSummary,
      processBoundaryInvoked: boundaryInvoked,
      externalProcessStarted: processStarted,
      sourceLabel: `${PLAYWRIGHT_OBSERVER_ADAPTER_NAME}.controlled-local-browser`,
      summary:
        error instanceof Error
          ? `Controlled local browser observation failed with ${error.name}.`
          : 'Controlled local browser observation failed.',
    };
  } finally {
    await closeQuietly(context);
    await closeQuietly(browser);
  }
}

async function loadPlaywright(): Promise<PlaywrightModuleLike> {
  return (await import('playwright')) as PlaywrightModuleLike;
}

function attachMetadataListeners(
  page: PageLike,
  consoleSummary: BrowserConsoleSummary,
  networkSummary: BrowserNetworkMetadataSummary,
): void {
  page.on('console', (message) => {
    consoleSummary.messageCount += 1;

    if (isConsoleType(message, 'warning')) {
      consoleSummary.warningCount += 1;
    }

    if (isConsoleType(message, 'error')) {
      consoleSummary.errorCount += 1;
    }
  });
  page.on('pageerror', () => {
    consoleSummary.errorCount += 1;
  });
  page.on('request', () => {
    networkSummary.requestCount += 1;
  });
  page.on('response', () => {
    networkSummary.responseCount += 1;
  });
  page.on('requestfailed', () => {
    networkSummary.failedRequestCount += 1;
  });
}

function isConsoleType(message: unknown, expected: string): boolean {
  if (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    typeof message.type === 'function'
  ) {
    return (message.type as () => string)() === expected;
  }

  return false;
}

async function readAccessibilitySnapshot(page: PageLike): Promise<string | undefined> {
  const locator = page.locator?.('body');

  if (!locator?.ariaSnapshot) {
    return undefined;
  }

  return locator.ariaSnapshot();
}

function countAccessibilityNodes(snapshot: string | undefined): number | undefined {
  if (!snapshot) {
    return undefined;
  }

  return snapshot.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
}

function createEmptyConsoleSummary(): BrowserConsoleSummary {
  return {
    messageCount: 0,
    warningCount: 0,
    errorCount: 0,
    bodyStored: false,
  };
}

function createEmptyNetworkSummary(): BrowserNetworkMetadataSummary {
  return {
    requestCount: 0,
    responseCount: 0,
    failedRequestCount: 0,
    bodyStored: false,
  };
}

async function closeQuietly(resource: { close(): Promise<void> } | undefined): Promise<void> {
  try {
    await resource?.close();
  } catch {
    // Best-effort cleanup only; observation evidence is generated from guarded metadata.
  }
}
