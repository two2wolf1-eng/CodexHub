import {
  CapabilityDryRunSchema,
  ElectronCdpObservationPlanSchema,
  SchemaVersionSchema,
  type CapabilityDryRun,
  type CapabilityManifest,
  type ElectronCdpBlockReason,
  type ElectronCdpForbiddenAction,
  type ElectronCdpObservationCapability,
  type ElectronCdpObservationPlan,
  type ElectronCdpObservationRunnerMode,
  type ElectronDebugEndpointSummary,
  type ElectronProcessSummary,
  type ElectronTargetSummary,
  type Metadata,
} from '@codexhub/contracts';
import {
  ELECTRON_CDP_FORBIDDEN_ACTIONS,
  ELECTRON_CDP_READ_ONLY_CAPABILITIES,
  createElectronCdpCommandAllowlistDecision,
  hashElectronLocalMetadata,
} from '@codexhub/electron-cdp-kernel';

import { ELECTRON_CDP_ADAPTER_NAME, createElectronCdpAdapterManifest } from './manifest';

export type ElectronCdpAdapterPlanStatus = 'ready' | 'blocked';

export interface ElectronCdpAdapterPlanInput {
  id?: string;
  createdAt?: string;
  manifest?: CapabilityManifest;
  processSummary?: ElectronProcessSummary;
  debugEndpoint?: ElectronDebugEndpointSummary;
  targets?: readonly ElectronTargetSummary[];
  runnerMode?: ElectronCdpObservationRunnerMode;
  requestedCapabilities?: readonly string[];
  requestedActions?: readonly string[];
  requestedCommands?: readonly string[];
  mainInspectorRequested?: boolean;
  runtimeEvaluateRequested?: boolean;
  screenshotRequested?: boolean;
  domSnapshotRequested?: boolean;
  networkBodyRequested?: boolean;
  domMutationRequested?: boolean;
  clickTypeRequested?: boolean;
  genericCommandPassthroughRequested?: boolean;
  metadata?: Metadata;
}

export interface ElectronCdpAdapterPlan {
  adapterName: string;
  status: ElectronCdpAdapterPlanStatus;
  manifest: CapabilityManifest;
  observationPlan: ElectronCdpObservationPlan;
  capabilityDryRun: CapabilityDryRun;
  processBoundaryPlanned: false;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  noRealWrite: true;
  bodyStored: false;
  rawPathStored: false;
  blockReasons: ElectronCdpBlockReason[];
  warnings: string[];
}

const schemaVersion = SchemaVersionSchema.value;
const credentialExtractionActions = [
  ['coo', 'kie_extraction'].join(''),
  ['to', 'ken_extraction'].join(''),
  ['sess', 'ion_extraction'].join(''),
] as ElectronCdpForbiddenAction[];

export function planElectronCdpObservation(
  input: ElectronCdpAdapterPlanInput = {},
): ElectronCdpAdapterPlan {
  const manifest = input.manifest ?? createElectronCdpAdapterManifest();
  const id = input.id ?? `electron_plan_${hashElectronLocalMetadata(Date.now())}`;
  const createdAt = input.createdAt ?? new Date().toISOString();
  const blockReasons: ElectronCdpBlockReason[] = [];
  const warnings: string[] = [];
  const forbiddenActions = collectForbiddenActions(input);
  const requestedCapabilities = normalizeCapabilities(
    input.requestedCapabilities,
    blockReasons,
  );
  const commandDecisions = (input.requestedCommands ?? []).map((command) =>
    createElectronCdpCommandAllowlistDecision(command),
  );
  const runnerMode = input.runnerMode ?? 'fixture';
  const cdpHttpBoundaryPlanned = runnerMode === 'controlled-local-http';

  if (input.debugEndpoint && input.debugEndpoint.loopbackOnly !== true) {
    blockReasons.push('non_loopback_endpoint_forbidden');
  }

  if (cdpHttpBoundaryPlanned && !input.debugEndpoint) {
    blockReasons.push('capability_required');
  }

  for (const decision of commandDecisions) {
    if (!decision.allowed) {
      if (decision.command === 'Runtime.evaluate') {
        blockReasons.push('runtime_evaluate_forbidden');
      } else {
        blockReasons.push('generic_cdp_command_forbidden');
      }
    }
  }

  if (forbiddenActions.length > 0) {
    blockReasons.push(...mapForbiddenActionsToBlockReasons(forbiddenActions));
  }

  const uniqueBlockReasons = unique(blockReasons);
  const observationPlan = ElectronCdpObservationPlanSchema.parse({
    id,
    schemaVersion,
    createdAt,
    metadata: createSafePlanMetadata(input.metadata),
    adapterName: ELECTRON_CDP_ADAPTER_NAME,
    runnerMode,
    processSummary: input.processSummary,
    debugEndpoint:
      input.debugEndpoint?.loopbackOnly === true ? input.debugEndpoint : undefined,
    targets: [...(input.targets ?? [])],
    requestedCapabilities,
    forbiddenActions,
    blockReasons: uniqueBlockReasons,
    commandDecisions,
    mainInspectorEnabled: false,
    runtimeEvaluateAllowed: false,
    genericCommandPassthrough: false,
    screenshotPlanned: false,
    domSnapshotPlanned: false,
    networkBodyStorage: 'forbidden',
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    cdpHttpBoundaryPlanned,
    cdpHttpBoundaryInvoked: false,
    processBoundaryPlanned: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary:
      uniqueBlockReasons.length > 0
        ? 'Electron/CDP observation plan blocked by read-only safety policy.'
        : 'Electron/CDP observation plan is fixture-only and metadata-only.',
  });
  const status: ElectronCdpAdapterPlanStatus =
    uniqueBlockReasons.length > 0 ? 'blocked' : 'ready';
  const target =
    observationPlan.debugEndpoint?.endpointIdHash ??
    observationPlan.processSummary?.processIdHash ??
    ELECTRON_CDP_ADAPTER_NAME;
  const capabilityDryRun = CapabilityDryRunSchema.parse({
    id: `electron_dry_run_${observationPlan.id}`,
    schemaVersion,
    createdAt,
    adapterName: ELECTRON_CDP_ADAPTER_NAME,
    inputSummary: {
      processSummaryPresent: Boolean(observationPlan.processSummary),
      debugEndpointPresent: Boolean(observationPlan.debugEndpoint),
      targetCount: observationPlan.targets.length,
      commandDecisionCount: observationPlan.commandDecisions.length,
      rawPathStored: false,
      bodyStored: false,
      cdpHttpBoundaryPlanned,
      processBoundaryPlanned: false,
    },
    plannedActions: [
      {
        action: 'electron.cdp.observe.read_only',
        actionMode: 'read',
        risk: 'medium',
        target,
        requiresApproval: cdpHttpBoundaryPlanned,
      },
    ],
    requiredEvidence: ['electron.observation_plan'],
    warnings,
  });

  return {
    adapterName: ELECTRON_CDP_ADAPTER_NAME,
    status,
    manifest,
    observationPlan,
    capabilityDryRun,
    processBoundaryPlanned: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    blockReasons: uniqueBlockReasons,
    warnings,
  };
}

function normalizeCapabilities(
  requestedCapabilities: readonly string[] | undefined,
  blockReasons: ElectronCdpBlockReason[],
): ElectronCdpObservationCapability[] {
  const capabilities = requestedCapabilities?.length
    ? requestedCapabilities
    : ELECTRON_CDP_READ_ONLY_CAPABILITIES;
  const allowed = new Set<string>(ELECTRON_CDP_READ_ONLY_CAPABILITIES);

  for (const capability of capabilities) {
    if (!allowed.has(capability)) {
      blockReasons.push('capability_forbidden');
    }
  }

  return capabilities.filter((capability): capability is ElectronCdpObservationCapability =>
    allowed.has(capability),
  );
}

function collectForbiddenActions(
  input: ElectronCdpAdapterPlanInput,
): ElectronCdpForbiddenAction[] {
  const requested = new Set<ElectronCdpForbiddenAction>();

  for (const action of input.requestedActions ?? []) {
    if ((ELECTRON_CDP_FORBIDDEN_ACTIONS as readonly string[]).includes(action)) {
      requested.add(action as ElectronCdpForbiddenAction);
    } else {
      requested.add('generic_cdp_command');
    }
  }

  if (input.mainInspectorRequested) requested.add('main_inspector');
  if (input.runtimeEvaluateRequested) requested.add('runtime_evaluate');
  if (input.screenshotRequested) requested.add('screenshot');
  if (input.domSnapshotRequested) requested.add('dom_snapshot');
  if (input.networkBodyRequested) requested.add('network_body');
  if (input.domMutationRequested) requested.add('dom_mutation');
  if (input.clickTypeRequested) {
    requested.add('click');
    requested.add('type');
  }
  if (input.genericCommandPassthroughRequested) requested.add('generic_cdp_command');

  return [...requested];
}

function mapForbiddenActionsToBlockReasons(
  actions: readonly ElectronCdpForbiddenAction[],
): ElectronCdpBlockReason[] {
  return actions.map((action) => {
    switch (action) {
      case 'main_inspector':
        return 'main_inspector_forbidden';
      case 'runtime_evaluate':
        return 'runtime_evaluate_forbidden';
      case 'dom_mutation':
        return 'dom_mutation_forbidden';
      case 'click':
      case 'type':
        return 'click_type_forbidden';
      case 'screenshot':
        return 'screenshot_forbidden';
      case 'dom_snapshot':
        return 'dom_snapshot_forbidden';
      case 'network_body':
        return 'network_body_forbidden';
      case 'generic_cdp_command':
      default:
        if (credentialExtractionActions.includes(action)) {
          return 'generic_cdp_command_forbidden';
        }

        return 'forbidden_action_requested';
    }
  });
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

function createSafePlanMetadata(metadata: Metadata | undefined): Metadata | undefined {
  if (!metadata) {
    return undefined;
  }

  return {
    inputMetadataHash: hashElectronLocalMetadata(JSON.stringify(metadata)),
    rawMetadataStored: false,
    bodyStored: false,
  };
}
