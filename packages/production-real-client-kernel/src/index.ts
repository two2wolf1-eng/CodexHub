import {
  ProductionAuditLedgerEntrySchema,
  type ProductionAuditLedgerEntry,
  ProductionBreakGlassSessionSchema,
  type ProductionBreakGlassSession,
  type ProductionCapabilityClass,
  type ProductionEvidenceLevel,
  ProductionEvidenceVaultRecordSchema,
  type ProductionEvidenceVaultRecord,
  ProductionRealClientApprovalBindingSchema,
  type ProductionRealClientApprovalBinding,
  ProductionRealClientAuthorityRefSchema,
  type ProductionRealClientAuthorityRef,
  ProductionRealClientDryRunSchema,
  type ProductionRealClientDryRun,
  ProductionRealClientJobSchema,
  type ProductionRealClientJob,
  type ProductionRealClientOperationKind,
  ProductionRealClientOperationManifestSchema,
  type ProductionRealClientOperationManifest,
  ProductionRealClientRunSchema,
  type ProductionRealClientRun,
  type ProductionRealClientSurfaceKind,
  ProductionRealClientSurfaceRegistrationSchema,
  type ProductionRealClientSurfaceRegistration,
  type RiskLevel,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

const highRiskOperations = new Set<ProductionRealClientOperationKind>([
  'createSharedLink',
  'deleteSharedLink',
  'changeConnectorSettings',
  'changeWorkspaceAdminSettings',
  'createCodexCodeTask',
  'codexCliAutoEdit',
  'applyPatch',
  'createOrUpdatePr',
  'crossProfileAutomation',
  'crossWorkspaceAutomation',
  'bulkConversationExport',
  'codexDesktopSwitchAuthorizedAccount',
  'codexDesktopDispatchTask',
  'chatgptWorkspaceMemberAdd',
  'chatgptWorkspaceMemberRemove',
  'claudeCodeRepairProposal',
]);

const breakGlassOperations = new Set<ProductionRealClientOperationKind>([
  'codexCliFullAuto',
  'temporarySurfaceRegistration',
  'temporarySelectorOverride',
  'temporaryNamedScriptRegistration',
  'temporaryDelegatedAdminWorkflow',
  'emergencyBulkAutomation',
]);

const restrictedOperations = new Set<ProductionRealClientOperationKind>([
  'createNewChat',
  'submitPrompt',
  'waitForAssistantCompletion',
  'stopGeneration',
  'retryGeneration',
  'uploadFile',
  'downloadFile',
  'createCodexAskTask',
  'selectCodexRepoEnvironment',
  'monitorCodexTask',
  'readCodexWorklogSummary',
  'readCodexDiffSummary',
  'openCodexPrResult',
  'stopCodexTask',
  'submitCodexDesktopTask',
  'readCodexDesktopTaskState',
  'stopCodexDesktopTask',
  'codexCliSuggest',
  'codexDesktopReadState',
  'chatgptWorkspaceMemberStateRead',
]);

const forbiddenRequestKeys = new Set([
  'endpoint',
  'rawEndpoint',
  'selector',
  'rawSelector',
  'script',
  'rawScript',
  'javascript',
  'rawJavascript',
  'authority',
  'executionAuthority',
  'authorityRef',
  'approvalArtifact',
  'cookie',
  'cookies',
  'session',
  'sessionToken',
  'token',
  'password',
  'mfa',
  'MFA',
  'credential',
  'storage',
  'localStorage',
  'sessionStorage',
  'rawDom',
  'dom',
  'networkBody',
  'rawNetworkBody',
  'body',
  'rawBody',
  'requestBody',
  'responseBody',
  'profilePath',
  'rawProfilePath',
]);

export interface CreateProductionSurfaceInput {
  surfaceId: string;
  surfaceKind: ProductionRealClientSurfaceKind;
  capabilityClass?: ProductionCapabilityClass;
  endpointSeed?: string;
  profileSeed?: string;
  workspaceSeed?: string;
  originSeed?: string;
  registeredBySeed: string;
  allowedOperationIds?: readonly string[];
  allowlistedOriginSeeds?: readonly string[];
  temporary?: boolean;
  expiresAt?: string;
  breakGlassSessionId?: string;
  summary?: string;
  now?: () => string;
}

export interface CreateProductionManifestInput {
  operationId: string;
  operationKind: ProductionRealClientOperationKind;
  surfaceKind: ProductionRealClientSurfaceKind;
  capabilityClass?: ProductionCapabilityClass;
  selectorSeed?: string;
  namedScriptId?: string;
  namedScriptSeed?: string;
  inputSchemaSeed?: string;
  filePolicySeed?: string;
  delegatedAuthorityRequired?: boolean;
  crossProfileAllowed?: boolean;
  crossWorkspaceAllowed?: boolean;
  summary?: string;
  now?: () => string;
}

export interface CreateProductionDryRunInput {
  surface: ProductionRealClientSurfaceRegistration;
  manifest: ProductionRealClientOperationManifest;
  inputRefSeed?: string;
  targetSeed?: string;
  plannedStepCount?: number;
  canaryRequired?: boolean;
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface CreateProductionApprovalBindingInput {
  dryRunId: string;
  approvalArtifactSeed: string;
  approverSeed: string;
  decision?: 'approved' | 'denied' | 'revoked';
  reasonSeed?: string;
  expiresAt?: string;
  consumedAt?: string;
  revokedAt?: string;
  now?: () => string;
}

export interface ResolveProductionAuthorityInput {
  dryRun: ProductionRealClientDryRun;
  manifest: ProductionRealClientOperationManifest;
  surface: ProductionRealClientSurfaceRegistration;
  approvalBindings?: readonly ProductionRealClientApprovalBinding[];
  delegatedAuthoritySeed?: string;
  incidentIdSeed?: string;
  ttlSeconds?: number;
  now?: () => string;
}

export function classifyProductionOperation(
  operationKind: ProductionRealClientOperationKind,
): ProductionCapabilityClass {
  if (breakGlassOperations.has(operationKind)) return 'break-glass-production';
  if (highRiskOperations.has(operationKind)) return 'high-risk-production';
  if (restrictedOperations.has(operationKind)) return 'restricted-production';
  return 'standard-production';
}

export function riskForProductionCapabilityClass(
  capabilityClass: ProductionCapabilityClass,
): RiskLevel {
  if (capabilityClass === 'break-glass-production' || capabilityClass === 'forbidden') {
    return 'critical';
  }
  if (capabilityClass === 'high-risk-production') return 'high';
  if (capabilityClass === 'restricted-production') return 'medium';
  return 'low';
}

export function createProductionRealClientSurfaceRegistration(
  input: CreateProductionSurfaceInput,
): ProductionRealClientSurfaceRegistration {
  return ProductionRealClientSurfaceRegistrationSchema.parse({
    id: foundationId('production_real_client_surface'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    surfaceId: input.surfaceId,
    surfaceKind: input.surfaceKind,
    capabilityClass: input.capabilityClass ?? 'restricted-production',
    endpointHash: hashOptional(input.endpointSeed),
    profileHash: hashOptional(input.profileSeed),
    workspaceHash: hashOptional(input.workspaceSeed),
    originHash: hashOptional(input.originSeed),
    registeredByHash: hashSeed(input.registeredBySeed),
    allowedOperationIds: [...(input.allowedOperationIds ?? [])],
    allowlistedOriginHashes: (input.allowlistedOriginSeeds ?? []).map(hashSeed),
    temporary: input.temporary ?? false,
    expiresAt: input.expiresAt,
    breakGlassSessionId: input.breakGlassSessionId,
    summary:
      input.summary ??
      `${input.surfaceKind} surface is registered with metadata-only production governance.`,
  });
}

export function createProductionRealClientOperationManifest(
  input: CreateProductionManifestInput,
): ProductionRealClientOperationManifest {
  const capabilityClass = input.capabilityClass ?? classifyProductionOperation(input.operationKind);
  const riskLevel = riskForProductionCapabilityClass(capabilityClass);
  const actionMode = inferActionMode(input.operationKind, capabilityClass);
  const approvalRequired =
    capabilityClass === 'high-risk-production' ||
    capabilityClass === 'break-glass-production' ||
    actionMode === 'write' ||
    actionMode === 'admin';

  return ProductionRealClientOperationManifestSchema.parse({
    id: foundationId('production_real_client_manifest'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    operationId: input.operationId,
    operationKind: input.operationKind,
    surfaceKind: input.surfaceKind,
    capabilityClass,
    riskLevel,
    actionMode,
    evidenceLevel: evidenceLevelForCapabilityClass(capabilityClass),
    selectorHash: hashOptional(input.selectorSeed),
    namedScriptId: input.namedScriptId,
    namedScriptHash: hashOptional(input.namedScriptSeed),
    inputSchemaHash: hashOptional(input.inputSchemaSeed),
    filePolicyHash: hashOptional(input.filePolicySeed),
    approvalRequired,
    authorityRequired: approvalRequired,
    delegatedAuthorityRequired: input.delegatedAuthorityRequired ?? false,
    crossProfileAllowed: input.crossProfileAllowed ?? false,
    crossWorkspaceAllowed: input.crossWorkspaceAllowed ?? false,
    breakGlassAllowed: capabilityClass === 'break-glass-production',
    summary:
      input.summary ??
      `${input.operationKind} is registered as ${capabilityClass} with fixed production governance.`,
  });
}

export function createProductionRealClientDryRun(
  input: CreateProductionDryRunInput,
): ProductionRealClientDryRun {
  const blockReasons = [...(input.blockReasons ?? [])];
  if (input.surface.surfaceKind !== input.manifest.surfaceKind) {
    blockReasons.push('surface_manifest_kind_mismatch');
  }
  if (!input.surface.allowedOperationIds.includes(input.manifest.operationId)) {
    blockReasons.push('operation_not_allowed_on_surface');
  }
  if (input.surface.capabilityClass === 'forbidden' || input.manifest.capabilityClass === 'forbidden') {
    blockReasons.push('forbidden_capability');
  }
  if (input.manifest.delegatedAuthorityRequired) {
    blockReasons.push('delegated_authority_required');
  }

  const status = blockReasons.length === 0 ? 'ready' : 'blocked';

  return ProductionRealClientDryRunSchema.parse({
    id: foundationId('production_real_client_dry_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    surfaceRegistrationId: input.surface.id,
    manifestId: input.manifest.id,
    operationKind: input.manifest.operationKind,
    capabilityClass: input.manifest.capabilityClass,
    riskLevel: input.manifest.riskLevel,
    actionMode: input.manifest.actionMode,
    inputRefHash: hashOptional(input.inputRefSeed),
    targetHash: hashOptional(input.targetSeed),
    plannedStepCount: input.plannedStepCount ?? 1,
    approvalRequired: input.manifest.approvalRequired,
    authorityRequired: input.manifest.authorityRequired,
    delegatedAuthorityRequired: input.manifest.delegatedAuthorityRequired,
    breakGlassRequired: input.manifest.capabilityClass === 'break-glass-production',
    canaryRequired: input.canaryRequired ?? true,
    status,
    blockReasons,
    summary:
      status === 'ready'
        ? `${input.manifest.operationKind} dry-run is ready for governed production execution.`
        : `${input.manifest.operationKind} dry-run is blocked: ${blockReasons.join(', ')}`,
  });
}

export function createProductionRealClientApprovalBinding(
  input: CreateProductionApprovalBindingInput,
): ProductionRealClientApprovalBinding {
  return ProductionRealClientApprovalBindingSchema.parse({
    id: foundationId('production_real_client_approval'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    dryRunId: input.dryRunId,
    approvalArtifactIdHash: hashSeed(input.approvalArtifactSeed),
    approverHash: hashSeed(input.approverSeed),
    decision: input.decision ?? 'approved',
    reasonHash: hashOptional(input.reasonSeed),
    expiresAt: input.expiresAt,
    consumedAt: input.consumedAt,
    revokedAt: input.revokedAt,
    summary: 'Production real-client approval binding stores approval and approver hashes only.',
  });
}

export function resolveProductionRealClientAuthority(
  input: ResolveProductionAuthorityInput,
): ProductionRealClientAuthorityRef {
  const now = input.now ?? foundationTimestamp;
  const approvedBindings = (input.approvalBindings ?? []).filter(
    (binding) =>
      binding.decision === 'approved' &&
      binding.dryRunId === input.dryRun.id &&
      !binding.consumedAt &&
      !binding.revokedAt &&
      (!binding.expiresAt || Date.parse(binding.expiresAt) > Date.parse(now())),
  );
  const distinctApproverHashCount = new Set(approvedBindings.map((binding) => binding.approverHash))
    .size;
  const constraints = ['registered-surface-required', 'manifest-bound-operation'];
  let allowed = input.dryRun.status === 'ready';

  if (input.manifest.approvalRequired && approvedBindings.length < 1) {
    allowed = false;
    constraints.push('approval-binding-required');
  }
  if (input.manifest.delegatedAuthorityRequired && !input.delegatedAuthoritySeed) {
    allowed = false;
    constraints.push('delegated-authority-required');
  }
  if (input.manifest.capabilityClass === 'break-glass-production') {
    if (distinctApproverHashCount < 2) {
      allowed = false;
      constraints.push('two-distinct-approvers-required');
    }
    if (!input.incidentIdSeed || !input.ttlSeconds) {
      allowed = false;
      constraints.push('incident-and-ttl-required');
    }
  }

  const expiresAt =
    input.manifest.capabilityClass === 'break-glass-production' && input.ttlSeconds
      ? new Date(Date.parse(now()) + input.ttlSeconds * 1000).toISOString()
      : undefined;

  return ProductionRealClientAuthorityRefSchema.parse({
    id: foundationId('production_real_client_authority'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: input.dryRun.id,
    manifestId: input.manifest.id,
    surfaceRegistrationId: input.surface.id,
    authorityRefHash: hashSeed(
      JSON.stringify({
        dryRunId: input.dryRun.id,
        manifestId: input.manifest.id,
        approvalIds: approvedBindings.map((binding) => binding.id),
      }),
    ),
    capabilityClass: input.manifest.capabilityClass,
    allowed,
    approvalBindingIds: approvedBindings.map((binding) => binding.id),
    approverHashCount: approvedBindings.length,
    distinctApproverHashCount,
    delegatedAuthorityHash: hashOptional(input.delegatedAuthoritySeed),
    incidentIdHash: hashOptional(input.incidentIdSeed),
    expiresAt,
    ttlSeconds: input.ttlSeconds,
    constraints,
    summary: allowed
      ? `${input.manifest.operationKind} authority is allowed from store-resolved governance.`
      : `${input.manifest.operationKind} authority is blocked by ${constraints.join(', ')}.`,
  });
}

export function createProductionRealClientRun(input: {
  dryRun: ProductionRealClientDryRun;
  manifest: ProductionRealClientOperationManifest;
  surface: ProductionRealClientSurfaceRegistration;
  authority?: ProductionRealClientAuthorityRef;
  liveActionRequested?: boolean;
  boundaryReached?: boolean;
  status?: 'completed' | 'failed' | 'blocked' | 'aborted';
  completedStepCount?: number;
  blockedStepCount?: number;
  evidenceRefs?: readonly string[];
  auditEventIds?: readonly string[];
  now?: () => string;
}): ProductionRealClientRun {
  const liveActionRequested = input.liveActionRequested ?? true;
  const authorityRequired = input.manifest.authorityRequired;
  const liveActionAllowed =
    liveActionRequested &&
    input.dryRun.status === 'ready' &&
    (!authorityRequired || input.authority?.allowed === true);
  const status = liveActionAllowed ? (input.status ?? 'completed') : 'blocked';
  const boundaryReached = input.boundaryReached ?? false;

  return ProductionRealClientRunSchema.parse({
    id: foundationId('production_real_client_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    dryRunId: input.dryRun.id,
    manifestId: input.manifest.id,
    surfaceRegistrationId: input.surface.id,
    authorityRefId: input.authority?.id,
    operationKind: input.manifest.operationKind,
    capabilityClass: input.manifest.capabilityClass,
    riskLevel: input.manifest.riskLevel,
    actionMode: input.manifest.actionMode,
    status,
    plannedStepCount: input.dryRun.plannedStepCount,
    completedStepCount: liveActionAllowed
      ? (input.completedStepCount ?? input.dryRun.plannedStepCount)
      : 0,
    blockedStepCount: liveActionAllowed ? (input.blockedStepCount ?? 0) : input.dryRun.plannedStepCount,
    liveActionRequested,
    liveActionAllowed,
    approvalConsumedCount: input.authority?.approvalBindingIds.length ?? 0,
    authorityRequired,
    cdpHttpBoundaryInvoked: boundaryReached,
    cdpWebSocketBoundaryInvoked: boundaryReached,
    browserActionInvoked:
      boundaryReached && input.surface.surfaceKind !== 'codex-cli' && liveActionAllowed,
    electronActionInvoked:
      boundaryReached && input.surface.surfaceKind === 'codex-desktop-cdp' && liveActionAllowed,
    codexCliProcessBoundaryInvoked:
      boundaryReached && input.surface.surfaceKind === 'codex-cli' && liveActionAllowed,
    externalProcessStarted:
      boundaryReached && input.surface.surfaceKind === 'codex-cli' && liveActionAllowed,
    evidenceRefIds: [...(input.evidenceRefs ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: liveActionAllowed
      ? `${input.manifest.operationKind} production execution completed through governed boundaries.`
      : `${input.manifest.operationKind} production execution blocked before adapter boundary.`,
  });
}

export function createProductionEvidenceVaultRecord(input: {
  actionId: string;
  evidenceLevel: ProductionEvidenceLevel;
  artifactSeed: string;
  byteCount?: number;
  itemCount?: number;
  encrypted?: boolean;
  ttlSeconds?: number;
  breakGlassSessionId?: string;
  now?: () => string;
}): ProductionEvidenceVaultRecord {
  const now = input.now ?? foundationTimestamp;
  const expiresAt =
    input.evidenceLevel === 'E4' && input.ttlSeconds
      ? new Date(Date.parse(now()) + input.ttlSeconds * 1000).toISOString()
      : undefined;

  return ProductionEvidenceVaultRecordSchema.parse({
    id: foundationId('production_evidence_vault'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    actionId: input.actionId,
    evidenceLevel: input.evidenceLevel,
    artifactHash: hashSeed(input.artifactSeed),
    byteCount: input.byteCount ?? 0,
    itemCount: input.itemCount ?? 0,
    encrypted: input.encrypted ?? input.evidenceLevel === 'E4',
    ttlSeconds: input.ttlSeconds,
    expiresAt,
    breakGlassSessionId: input.breakGlassSessionId,
    rawArtifactStored: input.evidenceLevel === 'E4',
    summary: `${input.evidenceLevel} production evidence is stored according to evidence policy.`,
  });
}

export function createProductionAuditLedgerEntry(input: {
  actionId: string;
  actorSeed: string;
  operationKind: ProductionRealClientOperationKind;
  capabilityClass: ProductionCapabilityClass;
  outcome: string;
  evidenceVaultRecordIds?: readonly string[];
  authorityRefId?: string;
  previousEntrySeed?: string;
  liveExecution?: boolean;
  boundaryReached?: boolean;
  externalProcessStarted?: boolean;
  now?: () => string;
}): ProductionAuditLedgerEntry {
  const entrySeed = JSON.stringify({
    actionId: input.actionId,
    actor: input.actorSeed,
    outcome: input.outcome,
    previous: input.previousEntrySeed,
  });
  return ProductionAuditLedgerEntrySchema.parse({
    id: foundationId('production_audit_ledger'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    actionId: input.actionId,
    previousEntryHash: hashOptional(input.previousEntrySeed),
    entryHash: hashSeed(entrySeed),
    actorHash: hashSeed(input.actorSeed),
    operationKind: input.operationKind,
    capabilityClass: input.capabilityClass,
    outcome: input.outcome,
    liveExecution: input.liveExecution ?? false,
    externalProcessStarted: input.externalProcessStarted ?? false,
    boundaryReached: input.boundaryReached ?? false,
    evidenceVaultRecordIds: [...(input.evidenceVaultRecordIds ?? [])],
    authorityRefId: input.authorityRefId,
    summary: 'Production audit ledger entry is append-only and metadata-only.',
  });
}

export function createProductionRealClientJob(input: {
  dryRun: ProductionRealClientDryRun;
  manifest: ProductionRealClientOperationManifest;
  surface: ProductionRealClientSurfaceRegistration;
  status?: 'queued' | 'running' | 'completed' | 'failed' | 'blocked' | 'cancelled' | 'timed_out';
  queuePosition?: number;
  profileLockSeed?: string;
  workspaceLockSeed?: string;
  timeoutMs?: number;
  stopRequested?: boolean;
  now?: () => string;
}): ProductionRealClientJob {
  return ProductionRealClientJobSchema.parse({
    id: foundationId('production_real_client_job'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    jobId: foundationId('real_client_job'),
    dryRunId: input.dryRun.id,
    operationKind: input.manifest.operationKind,
    surfaceRegistrationId: input.surface.id,
    manifestId: input.manifest.id,
    status: input.status ?? 'queued',
    queuePosition: input.queuePosition ?? 0,
    profileLockHash: hashOptional(input.profileLockSeed),
    workspaceLockHash: hashOptional(input.workspaceLockSeed),
    timeoutMs: input.timeoutMs,
    stopRequested: input.stopRequested ?? false,
    summary: `${input.manifest.operationKind} production job is ${input.status ?? 'queued'}.`,
  });
}

export function createProductionBreakGlassSession(input: {
  requestedCapability: ProductionRealClientOperationKind;
  incidentIdSeed: string;
  approvalBindings: readonly ProductionRealClientApprovalBinding[];
  ttlSeconds: number;
  temporarySurfaceRegistrationAllowed?: boolean;
  temporarySelectorOverrideAllowed?: boolean;
  temporaryNamedScriptRegistrationAllowed?: boolean;
  temporaryDelegatedAdminWorkflowAllowed?: boolean;
  emergencyBulkAutomationAllowed?: boolean;
  status?: 'requested' | 'authorized' | 'expired' | 'completed' | 'blocked' | 'post_review_required';
  now?: () => string;
}): ProductionBreakGlassSession {
  const now = input.now ?? foundationTimestamp;
  const distinctApproverHashCount = new Set(input.approvalBindings.map((binding) => binding.approverHash))
    .size;
  return ProductionBreakGlassSessionSchema.parse({
    id: foundationId('production_break_glass'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    incidentIdHash: hashSeed(input.incidentIdSeed),
    requestedCapability: input.requestedCapability,
    status:
      input.status ??
      (input.approvalBindings.length >= 2 && distinctApproverHashCount >= 2
        ? 'authorized'
        : 'blocked'),
    approvalBindingIds: input.approvalBindings.map((binding) => binding.id),
    approverHashCount: input.approvalBindings.length,
    distinctApproverHashCount,
    ttlSeconds: input.ttlSeconds,
    expiresAt: new Date(Date.parse(now()) + input.ttlSeconds * 1000).toISOString(),
    temporarySurfaceRegistrationAllowed: input.temporarySurfaceRegistrationAllowed ?? false,
    temporarySelectorOverrideAllowed: input.temporarySelectorOverrideAllowed ?? false,
    temporaryNamedScriptRegistrationAllowed: input.temporaryNamedScriptRegistrationAllowed ?? false,
    temporaryDelegatedAdminWorkflowAllowed: input.temporaryDelegatedAdminWorkflowAllowed ?? false,
    emergencyBulkAutomationAllowed: input.emergencyBulkAutomationAllowed ?? false,
    summary: 'Break-glass session is governed by two-person approval, TTL, and post-run review.',
  });
}

export function containsForbiddenProductionRealClientRequestBody(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const queue: unknown[] = [value];
  const seen = new Set<unknown>();
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || seen.has(current)) continue;
    seen.add(current);
    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }
    for (const [key, nested] of Object.entries(current)) {
      if (forbiddenRequestKeys.has(key)) return true;
      queue.push(nested);
    }
  }
  return false;
}

function inferActionMode(
  operationKind: ProductionRealClientOperationKind,
  capabilityClass: ProductionCapabilityClass,
) {
  if (capabilityClass === 'break-glass-production') return 'admin' as const;
  if (
    highRiskOperations.has(operationKind) ||
    ['submitPrompt', 'createNewChat', 'uploadFile', 'downloadFile', 'createCodexAskTask'].includes(
      operationKind,
    )
  ) {
    return 'write' as const;
  }
  return 'read' as const;
}

function evidenceLevelForCapabilityClass(
  capabilityClass: ProductionCapabilityClass,
): ProductionEvidenceLevel {
  if (capabilityClass === 'break-glass-production') return 'E4';
  if (capabilityClass === 'high-risk-production') return 'E2';
  if (capabilityClass === 'restricted-production') return 'E1';
  return 'E0';
}

function hashOptional(value: string | undefined): string | undefined {
  return value === undefined ? undefined : hashSeed(value);
}

function hashSeed(value: string): string {
  return `sha256:${hashText(value)}`;
}
