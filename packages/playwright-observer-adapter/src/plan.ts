import {
  type BrowserForbiddenAction,
  type BrowserObservationCapability,
  type BrowserObservationRunnerMode,
  type BrowserPageObservationPlan,
  type BrowserProfileReadinessBlockReason,
  type BrowserProfileRef,
  type CapabilityDryRun,
  type CapabilityManifest,
  BrowserPageObservationPlanSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import {
  BROWSER_PROFILE_FORBIDDEN_ACTIONS,
  BROWSER_PROFILE_READ_ONLY_CAPABILITIES,
} from '@codexhub/browser-profile-kernel';
import { hashText, redactMetadata } from '@codexhub/evidence-kernel';
import {
  PLAYWRIGHT_OBSERVER_ADAPTER_NAME,
  createPlaywrightObserverAdapterManifest,
} from './manifest';

export type PlaywrightObserverAdapterPlanStatus = 'ready' | 'blocked';

export interface PlaywrightObserverAdapterPlanInput {
  dryRunId: string;
  profileRef: BrowserProfileRef;
  requestedCapabilities?: readonly string[];
  requestedActions?: readonly string[];
  runnerMode?: BrowserObservationRunnerMode;
  targetUrl?: string;
  rawProfilePath?: string;
  screenshotRequested?: boolean;
  networkBodyRequested?: boolean;
  bodyStorageRequested?: boolean;
  metadata?: Record<string, unknown>;
  manifest?: CapabilityManifest;
}

export interface PlaywrightObserverAdapterPlan {
  id: string;
  schemaVersion: string;
  createdAt: string;
  adapterName: string;
  status: PlaywrightObserverAdapterPlanStatus;
  dryRunId: string;
  profileRef: BrowserProfileRef;
  requestedCapabilities: BrowserObservationCapability[];
  runnerMode: BrowserObservationRunnerMode;
  targetUrlHash?: string;
  forbiddenActions: BrowserForbiddenAction[];
  blockReasons: BrowserProfileReadinessBlockReason[];
  screenshotPlanned: false;
  networkBodyStorage: 'forbidden';
  processBoundaryPlanned: boolean;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  noRealWrite: true;
  rawPathStored: false;
  bodyStored: false;
  manifest: CapabilityManifest;
  browserPlan: BrowserPageObservationPlan;
  capabilityDryRun: CapabilityDryRun;
  metadata?: Record<string, unknown>;
}

export function createPlaywrightObserverAdapterPlan(
  input: PlaywrightObserverAdapterPlanInput,
): PlaywrightObserverAdapterPlan {
  const manifest = input.manifest ?? createPlaywrightObserverAdapterManifest();
  const blockReasons: BrowserProfileReadinessBlockReason[] = [];
  const runnerMode = input.runnerMode ?? 'fixture';
  const targetUrlHash = input.targetUrl ? `sha256:${hashText(input.targetUrl)}` : undefined;
  const requestedCapabilities = normalizeCapabilities(input.requestedCapabilities, blockReasons);
  const forbiddenActions = normalizeForbiddenActions(input, blockReasons);
  normalizeRunnerMode(input, blockReasons);
  const status: PlaywrightObserverAdapterPlanStatus =
    blockReasons.length === 0 ? 'ready' : 'blocked';
  const processBoundaryPlanned = status === 'ready' && runnerMode === 'controlled-local-browser';
  const summary =
    status === 'ready'
      ? `Plan browser read-only observation with ${runnerMode} runner.`
      : `Blocked browser read-only observation plan: ${blockReasons.join(', ')}.`;
  const browserPlan = BrowserPageObservationPlanSchema.parse({
    id: foundationId('browser_page_observation_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: PLAYWRIGHT_OBSERVER_ADAPTER_NAME,
    profileRef: input.profileRef,
    requestedCapabilities,
    runnerMode,
    targetUrlHash,
    forbiddenActions,
    blockReasons,
    screenshotPlanned: false,
    networkBodyStorage: 'forbidden',
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryPlanned,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary,
  });
  const capabilityDryRun: CapabilityDryRun = {
    id: foundationId('capability_dry_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: PLAYWRIGHT_OBSERVER_ADAPTER_NAME,
    inputSummary: {
      profilePathHash: input.profileRef.profilePathHash,
      requestedCapabilities,
      runnerMode,
      targetUrlHash,
      forbiddenActions,
      planHash: `sha256:${hashText(JSON.stringify(browserPlan))}`,
      rawPathStored: false,
      bodyStored: false,
    },
    plannedActions: [
      {
        action: 'browser.observe.read_only',
        actionMode: 'read',
        risk: processBoundaryPlanned ? 'high' : 'medium',
        target: input.profileRef.profilePathHash,
        requiresApproval: processBoundaryPlanned,
      },
    ],
    requiredEvidence: ['browser-profile-readiness', 'browser-observation-summary'],
    warnings:
      status === 'ready'
        ? [
            processBoundaryPlanned
              ? 'controlled local browser runner requires persisted approval before execution'
              : 'fixture runner only; no browser boundary is opened',
          ]
        : [`blocked: ${blockReasons.join(', ')}`],
    metadata: {
      dryRunId: input.dryRunId,
      status,
      blockReasons,
      runnerMode,
      fixtureRunnerOnly: runnerMode === 'fixture',
      controlledLocalBrowserRunner: runnerMode === 'controlled-local-browser',
      targetUrlHash,
      rawPathStored: false,
      bodyStored: false,
      processBoundaryPlanned,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    },
  };

  return {
    id: foundationId('playwright_observer_adapter_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: PLAYWRIGHT_OBSERVER_ADAPTER_NAME,
    status,
    dryRunId: input.dryRunId,
    profileRef: input.profileRef,
    requestedCapabilities,
    runnerMode,
    targetUrlHash,
    forbiddenActions,
    blockReasons,
    screenshotPlanned: false,
    networkBodyStorage: 'forbidden',
    processBoundaryPlanned,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    rawPathStored: false,
    bodyStored: false,
    manifest,
    browserPlan,
    capabilityDryRun,
    metadata: summarizePlanMetadata(input.metadata),
  };
}

function normalizeCapabilities(
  requestedCapabilities: readonly string[] | undefined,
  blockReasons: BrowserProfileReadinessBlockReason[],
): BrowserObservationCapability[] {
  const capabilities = requestedCapabilities ?? BROWSER_PROFILE_READ_ONLY_CAPABILITIES;

  if (capabilities.length === 0) {
    blockReasons.push('capability_required');
    return [];
  }

  const normalized: BrowserObservationCapability[] = [];

  for (const capability of capabilities) {
    if (isBrowserObservationCapability(capability)) {
      if (!normalized.includes(capability)) {
        normalized.push(capability);
      }
    } else {
      blockReasons.push('capability_forbidden');
    }
  }

  return normalized;
}

function normalizeForbiddenActions(
  input: PlaywrightObserverAdapterPlanInput,
  blockReasons: BrowserProfileReadinessBlockReason[],
): BrowserForbiddenAction[] {
  const forbiddenActions = [...BROWSER_PROFILE_FORBIDDEN_ACTIONS];

  if (input.rawProfilePath !== undefined) {
    blockReasons.push('raw_profile_path_forbidden');
  }

  if (input.screenshotRequested === true) {
    blockReasons.push('screenshot_requires_approval');
  }

  if (input.networkBodyRequested === true || input.bodyStorageRequested === true) {
    blockReasons.push('network_body_forbidden');
  }

  if ((input.requestedActions ?? []).length > 0) {
    blockReasons.push('forbidden_action_requested');
  }

  return forbiddenActions;
}

function normalizeRunnerMode(
  input: PlaywrightObserverAdapterPlanInput,
  blockReasons: BrowserProfileReadinessBlockReason[],
): void {
  const runnerMode = input.runnerMode ?? 'fixture';

  if (runnerMode !== 'controlled-local-browser') {
    return;
  }

  if (!input.targetUrl) {
    blockReasons.push('target_url_required');
    return;
  }

  if (!isAllowedReadOnlyTargetUrl(input.targetUrl)) {
    blockReasons.push('target_url_forbidden');
  }
}

export function isAllowedReadOnlyTargetUrl(value: string): boolean {
  if (value === 'about:blank') {
    return true;
  }

  if (value.startsWith('data:text/html,') || value.startsWith('data:text/html;')) {
    return true;
  }

  try {
    const parsed = new URL(value);

    if (parsed.protocol !== 'http:' || parsed.username || parsed.password) {
      return false;
    }

    return ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function isBrowserObservationCapability(value: string): value is BrowserObservationCapability {
  return BROWSER_PROFILE_READ_ONLY_CAPABILITIES.some((capability) => capability === value);
}

function summarizePlanMetadata(
  metadata: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!metadata) {
    return undefined;
  }

  return {
    metadataProvided: true,
    metadataKeyCount: Object.keys(metadata).length,
    metadataHash: `sha256:${hashText(JSON.stringify(redactMetadata(metadata)))}`,
    rawPathStored: false,
    bodyStored: false,
  };
}
