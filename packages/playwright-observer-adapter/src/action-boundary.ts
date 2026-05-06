import type { BrowserActionKind } from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import { isAllowedReadOnlyTargetUrl } from './plan';

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
  locator(selector: string): LocatorLike;
  url(): string;
}

interface LocatorLike {
  click(options?: { timeout: number }): Promise<void>;
  fill(value: string, options?: { timeout: number }): Promise<void>;
}

interface PlaywrightModuleLike {
  chromium: BrowserTypeLike;
}

export interface BrowserActionBoundaryInput {
  actionKind: BrowserActionKind;
  targetUrl: string;
  targetUrlHash: string;
  selector: string;
  selectorHash: string;
  typedText?: string;
  typedTextHash?: string;
  timeoutMs?: number;
  headless?: boolean;
  loadPlaywright?: () => Promise<PlaywrightModuleLike>;
}

export interface BrowserActionBoundaryResult {
  status: 'completed' | 'failed' | 'blocked';
  actionKind: BrowserActionKind;
  targetUrlHash: string;
  selectorHash: string;
  typedTextHash?: string;
  processBoundaryInvoked: boolean;
  externalProcessStarted: boolean;
  browserActionInvoked: boolean;
  rawSelectorStored: false;
  rawTypedTextStored: false;
  rawPathStored: false;
  bodyStored: false;
  summary: string;
}

export async function runControlledBrowserActionBoundary(
  input: BrowserActionBoundaryInput,
): Promise<BrowserActionBoundaryResult> {
  if (`sha256:${hashText(input.targetUrl)}` !== input.targetUrlHash) {
    return createBlockedBrowserActionResult(input, 'Browser action target URL hash mismatch.');
  }

  if (`sha256:${hashText(input.selector)}` !== input.selectorHash) {
    return createBlockedBrowserActionResult(input, 'Browser action selector hash mismatch.');
  }

  if (
    input.actionKind === 'type' &&
    (!input.typedText ||
      !input.typedTextHash ||
      `sha256:${hashText(input.typedText)}` !== input.typedTextHash)
  ) {
    return createBlockedBrowserActionResult(input, 'Browser type action text hash mismatch.');
  }

  if (!isAllowedReadOnlyTargetUrl(input.targetUrl)) {
    return createBlockedBrowserActionResult(input, 'Browser action target URL is outside allowlist.');
  }

  let browser: BrowserLike | undefined;
  let context: BrowserContextLike | undefined;
  let processBoundaryInvoked = false;
  let externalProcessStarted = false;
  let browserActionInvoked = false;

  try {
    const loaded = await (input.loadPlaywright ?? loadPlaywright)();
    processBoundaryInvoked = true;
    browser = await loaded.chromium.launch({ headless: input.headless ?? true });
    externalProcessStarted = true;
    context = await browser.newContext({});
    const page = await context.newPage();
    await page.goto(input.targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: input.timeoutMs ?? 5000,
    });

    if (!isAllowedReadOnlyTargetUrl(page.url())) {
      return createBlockedBrowserActionResult(input, 'Browser action final URL is outside allowlist.', {
        processBoundaryInvoked,
        externalProcessStarted,
        browserActionInvoked,
      });
    }

    const locator = page.locator(input.selector);
    if (input.actionKind === 'click') {
      await locator.click({ timeout: input.timeoutMs ?? 5000 });
    } else {
      await locator.fill(input.typedText ?? '', { timeout: input.timeoutMs ?? 5000 });
    }
    browserActionInvoked = true;

    return {
      status: 'completed',
      actionKind: input.actionKind,
      targetUrlHash: input.targetUrlHash,
      selectorHash: input.selectorHash,
      typedTextHash: input.typedTextHash,
      processBoundaryInvoked,
      externalProcessStarted,
      browserActionInvoked,
      rawSelectorStored: false,
      rawTypedTextStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: 'Controlled browser action completed with metadata-only result.',
    };
  } catch {
    return {
      ...createBlockedBrowserActionResult(input, 'Controlled browser action failed.', {
        processBoundaryInvoked,
        externalProcessStarted,
        browserActionInvoked,
      }),
      status: 'failed',
    };
  } finally {
    await closeQuietly(context);
    await closeQuietly(browser);
  }
}

async function loadPlaywright(): Promise<PlaywrightModuleLike> {
  return (await import('playwright')) as PlaywrightModuleLike;
}

function createBlockedBrowserActionResult(
  input: BrowserActionBoundaryInput,
  summary: string,
  boundary?: {
    processBoundaryInvoked: boolean;
    externalProcessStarted: boolean;
    browserActionInvoked: boolean;
  },
): BrowserActionBoundaryResult {
  return {
    status: 'blocked',
    actionKind: input.actionKind,
    targetUrlHash: input.targetUrlHash,
    selectorHash: input.selectorHash,
    typedTextHash: input.typedTextHash,
    processBoundaryInvoked: boundary?.processBoundaryInvoked ?? false,
    externalProcessStarted: boundary?.externalProcessStarted ?? false,
    browserActionInvoked: boundary?.browserActionInvoked ?? false,
    rawSelectorStored: false,
    rawTypedTextStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary,
  };
}

async function closeQuietly(resource: { close(): Promise<void> } | undefined): Promise<void> {
  try {
    await resource?.close();
  } catch {
    // Best-effort cleanup only; action evidence is generated from guarded metadata.
  }
}
