import {
  type BrowserForbiddenAction,
  type BrowserObservationCapability,
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
  forbiddenActions: BrowserForbiddenAction[];
  blockReasons: BrowserProfileReadinessBlockReason[];
  screenshotPlanned: false;
  networkBodyStorage: 'forbidden';
  processBoundaryPlanned: false;
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
  const requestedCapabilities = normalizeCapabilities(input.requestedCapabilities, blockReasons);
  const forbiddenActions = normalizeForbiddenActions(input, blockReasons);
  const status: PlaywrightObserverAdapterPlanStatus =
    blockReasons.length === 0 ? 'ready' : 'blocked';
  const summary =
    status === 'ready'
      ? 'Plan browser read-only observation with fixture runner only.'
      : `Blocked browser read-only observation plan: ${blockReasons.join(', ')}.`;
  const browserPlan = BrowserPageObservationPlanSchema.parse({
    id: foundationId('browser_page_observation_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: PLAYWRIGHT_OBSERVER_ADAPTER_NAME,
    profileRef: input.profileRef,
    requestedCapabilities,
    forbiddenActions,
    blockReasons,
    screenshotPlanned: false,
    networkBodyStorage: 'forbidden',
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryPlanned: false,
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
      forbiddenActions,
      planHash: `sha256:${hashText(JSON.stringify(browserPlan))}`,
      rawPathStored: false,
      bodyStored: false,
    },
    plannedActions: [
      {
        action: 'browser.observe.read_only',
        actionMode: 'read',
        risk: 'medium',
        target: input.profileRef.profilePathHash,
        requiresApproval: false,
      },
    ],
    requiredEvidence: ['browser-profile-readiness', 'browser-observation-summary'],
    warnings:
      status === 'ready'
        ? ['fixture runner only; no browser connection is opened in M4a']
        : [`blocked: ${blockReasons.join(', ')}`],
    metadata: {
      dryRunId: input.dryRunId,
      status,
      blockReasons,
      fixtureRunnerOnly: true,
      rawPathStored: false,
      bodyStored: false,
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
    forbiddenActions,
    blockReasons,
    screenshotPlanned: false,
    networkBodyStorage: 'forbidden',
    processBoundaryPlanned: false,
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
