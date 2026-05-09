import {
  CalibrationAuthorityGrantSchema,
  CalibrationDriftSignatureSchema,
  CalibrationManifestCorrectionProposalSchema,
  CalibrationObservationSchema,
  CalibrationRetentionPolicySchema,
  CalibrationRunSchema,
  CalibrationSelectorSampleSchema,
  M75RealRehearsalAcceptancePlanSchema,
  M75RealRehearsalAcceptanceRunSchema,
  M75RealRehearsalEvidenceSummarySchema,
  type CalibrationAuthorityGrant,
  type CalibrationDriftSignature,
  type CalibrationDriftStatus,
  type CalibrationManifestCorrectionProposal,
  type CalibrationObservation,
  type CalibrationRetentionPolicy,
  type CalibrationRun,
  type CalibrationSelectorSample,
  type M75RealRehearsalAcceptancePlan,
  type M75RealRehearsalAcceptanceRun,
  type M75RealRehearsalAcceptanceStatus,
  type M75RealRehearsalEvidenceSummary,
  type ProductionRealClientOperationKind,
  RealClientCalibrationSessionSchema,
  type RealClientCalibrationRunStatus,
  type RealClientCalibrationSession,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

const forbiddenRequestKeys = new Set([
  'endpoint',
  'rawEndpoint',
  'url',
  'rawUrl',
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
  'browserCredential',
  'storage',
  'localStorage',
  'sessionStorage',
  'profilePath',
  'rawProfile',
  'rawPrompt',
  'prompt',
  'dom',
  'rawDom',
  'body',
  'rawBody',
  'requestBody',
  'responseBody',
]);

export interface CreateM75RealRehearsalAcceptancePlanInput {
  rehearsalRunId: string;
  expectedOperationKinds?: readonly ProductionRealClientOperationKind[];
  expectedSurfaceRegistrationIds?: readonly string[];
  expectedManifestIds?: readonly string[];
  conditionalLiveAllowed?: boolean;
  adminWriteExpected?: boolean;
  codexDesktopExpected?: boolean;
  postWriteVerificationRequired?: boolean;
  summary?: string;
  now?: () => string;
}

export interface CreateM75RealRehearsalEvidenceSummaryInput {
  acceptancePlanId: string;
  rehearsalRunId: string;
  evidenceVaultRecordIds?: readonly string[];
  auditLedgerEntryIds?: readonly string[];
  boundaryEventCount?: number;
  liveClientTouched?: boolean;
  adminWriteTouched?: boolean;
  codexDesktopTouched?: boolean;
  postWriteVerified?: boolean;
  summary?: string;
  now?: () => string;
}

export interface CreateM75RealRehearsalAcceptanceRunInput {
  acceptancePlan: M75RealRehearsalAcceptancePlan;
  evidenceSummary?: M75RealRehearsalEvidenceSummary;
  status?: M75RealRehearsalAcceptanceStatus;
  fixtureOnly?: boolean;
  conditionalLive?: boolean;
  blockedReasons?: readonly string[];
  summary?: string;
  now?: () => string;
}

export interface CreateCalibrationSessionInput {
  sessionKind: RealClientCalibrationSession['sessionKind'];
  status?: RealClientCalibrationSession['status'];
  surfaceRegistrationIds?: readonly string[];
  manifestIds?: readonly string[];
  targetSeed?: string;
  calibrationTargetSeed?: string;
  calibrationSafe?: boolean;
  restoreAllowed?: boolean;
  delegatedAdminAuthorityRequired?: boolean;
  ttlSeconds?: number;
  liveWritesAllowed?: boolean;
  adminWriteAllowed?: boolean;
  summary?: string;
  now?: () => string;
}

export interface CreateCalibrationAuthorityGrantInput {
  session: RealClientCalibrationSession;
  authorityRefSeed: string;
  approvalBindingIds?: readonly string[];
  approverSeeds?: readonly string[];
  status?: CalibrationAuthorityGrant['status'];
  liveWritesAllowed?: boolean;
  adminWriteAllowed?: boolean;
  delegatedAdminAuthorityVerified?: boolean;
  summary?: string;
  now?: () => string;
}

export interface CreateCalibrationObservationInput {
  session: RealClientCalibrationSession;
  operationKind: ProductionRealClientOperationKind;
  surfaceRegistrationId?: string;
  manifestId?: string;
  runId?: string;
  observationKind: CalibrationObservation['observationKind'];
  beforeStateSeed?: string;
  afterStateSeed?: string;
  pageStateSeed?: string;
  selectorFingerprintSeed?: string;
  cdpHttpBoundaryInvoked?: boolean;
  cdpWebSocketBoundaryInvoked?: boolean;
  browserActionInvoked?: boolean;
  electronActionInvoked?: boolean;
  summary?: string;
  now?: () => string;
}

export interface CreateCalibrationDriftSignatureInput {
  session: RealClientCalibrationSession;
  surfaceRegistrationId?: string;
  manifestId?: string;
  status?: CalibrationDriftStatus;
  selectorDriftCount?: number;
  axRoleDriftCount?: number;
  pageStateDriftCount?: number;
  timingDriftCount?: number;
  correctionProposalId?: string;
  summary?: string;
  now?: () => string;
}

export interface CreateCalibrationSelectorSampleInput {
  session: RealClientCalibrationSession;
  manifestId?: string;
  selectorSeed: string;
  axRoleSeed?: string;
  pageStateSeed?: string;
  sampleCount?: number;
  compatible?: boolean;
  summary?: string;
  now?: () => string;
}

export interface CreateCalibrationManifestCorrectionProposalInput {
  session: RealClientCalibrationSession;
  manifestId?: string;
  driftSignatureId?: string;
  proposedManifestSeed: string;
  confidence?: CalibrationManifestCorrectionProposal['confidence'];
  status?: CalibrationManifestCorrectionProposal['status'];
  evidenceComplete?: boolean;
  summary?: string;
  now?: () => string;
}

export interface CreateCalibrationRunInput {
  session: RealClientCalibrationSession;
  operationKind: ProductionRealClientOperationKind;
  authorityGrant?: CalibrationAuthorityGrant;
  status?: RealClientCalibrationRunStatus;
  targetMemberSeed?: string;
  preflightStatus?: string;
  removeStatus?: string;
  restoreStatus?: string;
  codexDesktopStatus?: string;
  restorationOutcome?: CalibrationRun['restorationOutcome'];
  calibrationSafeTargetVerified?: boolean;
  delegatedAdminAuthorityVerified?: boolean;
  realBoundaryReached?: boolean;
  liveClientTouched?: boolean;
  adminWriteTouched?: boolean;
  codexDesktopTouched?: boolean;
  postWriteVerified?: boolean;
  driftSignatureIds?: readonly string[];
  correctionProposalIds?: readonly string[];
  blockedReasons?: readonly string[];
  summary?: string;
  now?: () => string;
}

export interface CreateCalibrationRetentionPolicyInput {
  sessionId: string;
  observationTtlSeconds?: number;
  selectorSampleTtlSeconds?: number;
  rawArtifactTtlSeconds?: number;
  summary?: string;
  now?: () => string;
}

export function createM75RealRehearsalAcceptancePlan(
  input: CreateM75RealRehearsalAcceptancePlanInput,
): M75RealRehearsalAcceptancePlan {
  return M75RealRehearsalAcceptancePlanSchema.parse({
    id: foundationId('m75_real_acceptance_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    evidenceRefIds: [],
    auditEventIds: [],
    rehearsalRunId: input.rehearsalRunId,
    expectedOperationKinds: [...(input.expectedOperationKinds ?? [])],
    expectedSurfaceRegistrationIds: [...(input.expectedSurfaceRegistrationIds ?? [])],
    expectedManifestIds: [...(input.expectedManifestIds ?? [])],
    conditionalLiveAllowed: input.conditionalLiveAllowed ?? false,
    adminWriteExpected: input.adminWriteExpected ?? false,
    codexDesktopExpected: input.codexDesktopExpected ?? false,
    postWriteVerificationRequired: input.postWriteVerificationRequired ?? false,
    summary:
      input.summary ??
      'M75 real rehearsal acceptance plan records expected live boundaries as metadata only.',
  });
}

export function createM75RealRehearsalEvidenceSummary(
  input: CreateM75RealRehearsalEvidenceSummaryInput,
): M75RealRehearsalEvidenceSummary {
  return M75RealRehearsalEvidenceSummarySchema.parse({
    id: foundationId('m75_real_acceptance_evidence'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    evidenceRefIds: [],
    auditEventIds: [],
    acceptancePlanId: input.acceptancePlanId,
    rehearsalRunId: input.rehearsalRunId,
    evidenceVaultRecordIds: [...(input.evidenceVaultRecordIds ?? [])],
    auditLedgerEntryIds: [...(input.auditLedgerEntryIds ?? [])],
    boundaryEventCount: input.boundaryEventCount ?? 0,
    liveClientTouched: input.liveClientTouched ?? false,
    adminWriteTouched: input.adminWriteTouched ?? false,
    codexDesktopTouched: input.codexDesktopTouched ?? false,
    postWriteVerified: input.postWriteVerified ?? false,
    summary:
      input.summary ??
      'M75 real rehearsal evidence summary stores live acceptance flags and ids only.',
  });
}

export function createM75RealRehearsalAcceptanceRun(
  input: CreateM75RealRehearsalAcceptanceRunInput,
): M75RealRehearsalAcceptanceRun {
  const evidence = input.evidenceSummary;
  const realBoundaryReached = (evidence?.boundaryEventCount ?? 0) > 0;
  const status =
    input.status ??
    (realBoundaryReached
      ? 'real_live_accepted'
      : input.acceptancePlan.conditionalLiveAllowed
        ? 'readiness_blocked'
        : 'metadata_only');
  return M75RealRehearsalAcceptanceRunSchema.parse({
    id: foundationId('m75_real_acceptance_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    evidenceRefIds: [],
    auditEventIds: [],
    acceptancePlanId: input.acceptancePlan.id,
    evidenceSummaryId: evidence?.id,
    status,
    fixtureOnly: input.fixtureOnly ?? !realBoundaryReached,
    conditionalLive: input.conditionalLive ?? input.acceptancePlan.conditionalLiveAllowed,
    realBoundaryReached,
    liveClientTouched: evidence?.liveClientTouched ?? false,
    adminWriteTouched: evidence?.adminWriteTouched ?? false,
    codexDesktopTouched: evidence?.codexDesktopTouched ?? false,
    postWriteVerified: evidence?.postWriteVerified ?? false,
    blockedReasons: [...(input.blockedReasons ?? [])],
    summary:
      input.summary ??
      'M75 real rehearsal acceptance run classifies metadata-only, blocked, or live-accepted state.',
  });
}

export function createRealClientCalibrationSession(
  input: CreateCalibrationSessionInput,
): RealClientCalibrationSession {
  const now = input.now ?? foundationTimestamp;
  const ttlSeconds = input.ttlSeconds ?? 900;
  return RealClientCalibrationSessionSchema.parse({
    id: foundationId('real_client_calibration_session'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    evidenceRefIds: [],
    auditEventIds: [],
    sessionKind: input.sessionKind,
    status: input.status ?? 'planned',
    surfaceRegistrationIds: [...(input.surfaceRegistrationIds ?? [])],
    manifestIds: [...(input.manifestIds ?? [])],
    targetHash: hashOptional(input.targetSeed),
    calibrationTargetHash: hashOptional(input.calibrationTargetSeed),
    calibrationSafe: input.calibrationSafe ?? false,
    restoreAllowed: input.restoreAllowed ?? false,
    delegatedAdminAuthorityRequired: input.delegatedAdminAuthorityRequired ?? false,
    ttlSeconds,
    expiresAt: expiresAt(ttlSeconds, now),
    liveWritesAllowed: input.liveWritesAllowed ?? false,
    adminWriteAllowed: input.adminWriteAllowed ?? false,
    summary:
      input.summary ??
      'Real client calibration session is TTL-bound and registered-surface only.',
  });
}

export function createCalibrationAuthorityGrant(
  input: CreateCalibrationAuthorityGrantInput,
): CalibrationAuthorityGrant {
  const now = input.now ?? foundationTimestamp;
  const approverHashes = [...(input.approverSeeds ?? [])].map(hashSeed);
  return CalibrationAuthorityGrantSchema.parse({
    id: foundationId('calibration_authority_grant'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    evidenceRefIds: [],
    auditEventIds: [],
    sessionId: input.session.id,
    authorityRefId: foundationId(`calibration_authority_${hashSeed(input.authorityRefSeed).slice(0, 12)}`),
    approvalBindingIds: [...(input.approvalBindingIds ?? [])],
    approverHashCount: approverHashes.length,
    distinctApproverHashCount: new Set(approverHashes).size,
    status: input.status ?? 'granted',
    expiresAt: input.session.expiresAt,
    liveWritesAllowed: input.liveWritesAllowed ?? input.session.liveWritesAllowed,
    adminWriteAllowed: input.adminWriteAllowed ?? input.session.adminWriteAllowed,
    delegatedAdminAuthorityVerified:
      input.delegatedAdminAuthorityVerified ?? input.session.delegatedAdminAuthorityRequired,
    summary:
      input.summary ??
      'Calibration authority grant is store-resolved and never accepted from request body.',
  });
}

export function createCalibrationObservation(
  input: CreateCalibrationObservationInput,
): CalibrationObservation {
  return CalibrationObservationSchema.parse({
    id: foundationId('calibration_observation'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: (input.now ?? foundationTimestamp)(),
    evidenceRefIds: [],
    auditEventIds: [],
    sessionId: input.session.id,
    runId: input.runId,
    operationKind: input.operationKind,
    surfaceRegistrationId: input.surfaceRegistrationId ?? input.session.surfaceRegistrationIds[0],
    manifestId: input.manifestId ?? input.session.manifestIds[0],
    observationKind: input.observationKind,
    beforeStateHash: hashOptional(input.beforeStateSeed),
    afterStateHash: hashOptional(input.afterStateSeed),
    pageStateHash: hashOptional(input.pageStateSeed),
    selectorFingerprintHash: hashOptional(input.selectorFingerprintSeed),
    cdpHttpBoundaryInvoked: input.cdpHttpBoundaryInvoked ?? false,
    cdpWebSocketBoundaryInvoked: input.cdpWebSocketBoundaryInvoked ?? false,
    browserActionInvoked: input.browserActionInvoked ?? false,
    electronActionInvoked: input.electronActionInvoked ?? false,
    summary:
      input.summary ?? 'Calibration observation stores hashed state transitions and boundary flags.',
  });
}

export function createCalibrationDriftSignature(
  input: CreateCalibrationDriftSignatureInput,
): CalibrationDriftSignature {
  const status =
    input.status ??
    inferDriftStatus(
      input.selectorDriftCount ?? 0,
      input.axRoleDriftCount ?? 0,
      input.pageStateDriftCount ?? 0,
      input.timingDriftCount ?? 0,
    );
  return CalibrationDriftSignatureSchema.parse({
    id: foundationId('calibration_drift_signature'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: (input.now ?? foundationTimestamp)(),
    evidenceRefIds: [],
    auditEventIds: [],
    sessionId: input.session.id,
    surfaceRegistrationId: input.surfaceRegistrationId ?? input.session.surfaceRegistrationIds[0],
    manifestId: input.manifestId ?? input.session.manifestIds[0],
    status,
    selectorDriftCount: input.selectorDriftCount ?? 0,
    axRoleDriftCount: input.axRoleDriftCount ?? 0,
    pageStateDriftCount: input.pageStateDriftCount ?? 0,
    timingDriftCount: input.timingDriftCount ?? 0,
    highRiskExecutionBlocked: status !== 'compatible',
    correctionProposalId: input.correctionProposalId,
    summary:
      input.summary ??
      'Calibration drift signature blocks high-risk execution when drift is detected.',
  });
}

export function createCalibrationSelectorSample(
  input: CreateCalibrationSelectorSampleInput,
): CalibrationSelectorSample {
  return CalibrationSelectorSampleSchema.parse({
    id: foundationId('calibration_selector_sample'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    evidenceRefIds: [],
    auditEventIds: [],
    sessionId: input.session.id,
    manifestId: input.manifestId ?? input.session.manifestIds[0],
    selectorHash: hashSeed(input.selectorSeed),
    axRoleHash: hashOptional(input.axRoleSeed),
    pageStateHash: hashOptional(input.pageStateSeed),
    sampleCount: input.sampleCount ?? 1,
    compatible: input.compatible ?? false,
    summary: input.summary ?? 'Calibration selector sample is hashed and metadata-only.',
  });
}

export function createCalibrationManifestCorrectionProposal(
  input: CreateCalibrationManifestCorrectionProposalInput,
): CalibrationManifestCorrectionProposal {
  return CalibrationManifestCorrectionProposalSchema.parse({
    id: foundationId('calibration_manifest_correction'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    evidenceRefIds: [],
    auditEventIds: [],
    sessionId: input.session.id,
    driftSignatureId: input.driftSignatureId,
    manifestId: input.manifestId ?? input.session.manifestIds[0],
    proposedManifestHash: hashSeed(input.proposedManifestSeed),
    confidence: input.confidence ?? 'medium',
    status: input.status ?? (input.evidenceComplete ? 'proposed' : 'blocked'),
    evidenceComplete: input.evidenceComplete ?? false,
    summary:
      input.summary ??
      'Manifest correction proposal records a reviewed hash and requires human review.',
  });
}

export function createCalibrationRun(input: CreateCalibrationRunInput): CalibrationRun {
  const adminWriteTouched = input.adminWriteTouched ?? false;
  const blockedReasons = [...(input.blockedReasons ?? [])];
  if (adminWriteTouched && !input.session.calibrationSafe) blockedReasons.push('target_not_calibration_safe');
  if (adminWriteTouched && !input.session.restoreAllowed) blockedReasons.push('restore_not_allowed');
  if (adminWriteTouched && !input.delegatedAdminAuthorityVerified) {
    blockedReasons.push('delegated_admin_authority_required');
  }
  const status =
    input.status ??
    (blockedReasons.length > 0
      ? 'blocked'
      : adminWriteTouched
        ? 'restored_with_pending_invite'
        : 'passed');
  return CalibrationRunSchema.parse({
    id: foundationId('calibration_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    evidenceRefIds: [],
    auditEventIds: [],
    sessionId: input.session.id,
    authorityGrantId: input.authorityGrant?.id,
    operationKind: input.operationKind,
    status,
    targetMemberHash: hashOptional(input.targetMemberSeed),
    preflightStatus: input.preflightStatus ?? (blockedReasons.length > 0 ? 'blocked' : 'ready'),
    removeStatus: input.removeStatus,
    restoreStatus: input.restoreStatus,
    codexDesktopStatus: input.codexDesktopStatus,
    restorationOutcome: input.restorationOutcome ?? (adminWriteTouched ? 'pending_invite' : 'not_required'),
    calibrationSafeTargetVerified: input.calibrationSafeTargetVerified ?? input.session.calibrationSafe,
    delegatedAdminAuthorityVerified: input.delegatedAdminAuthorityVerified ?? false,
    realBoundaryReached: input.realBoundaryReached ?? false,
    liveClientTouched: input.liveClientTouched ?? false,
    adminWriteTouched,
    codexDesktopTouched: input.codexDesktopTouched ?? false,
    postWriteVerified: input.postWriteVerified ?? false,
    driftSignatureIds: [...(input.driftSignatureIds ?? [])],
    correctionProposalIds: [...(input.correctionProposalIds ?? [])],
    blockedReasons,
    summary:
      input.summary ??
      'Calibration run records live boundary and restore verification as metadata-only evidence.',
  });
}

export function createCalibrationRetentionPolicy(
  input: CreateCalibrationRetentionPolicyInput,
): CalibrationRetentionPolicy {
  return CalibrationRetentionPolicySchema.parse({
    id: foundationId('calibration_retention_policy'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    evidenceRefIds: [],
    auditEventIds: [],
    sessionId: input.sessionId,
    observationTtlSeconds: input.observationTtlSeconds ?? 604800,
    selectorSampleTtlSeconds: input.selectorSampleTtlSeconds ?? 2592000,
    rawArtifactTtlSeconds: input.rawArtifactTtlSeconds,
    summary:
      input.summary ??
      'Calibration retention policy keeps raw artifacts disabled and metadata TTL explicit.',
  });
}

export function containsForbiddenCalibrationRequestBody(value: unknown): boolean {
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

function inferDriftStatus(
  selectorDriftCount: number,
  axRoleDriftCount: number,
  pageStateDriftCount: number,
  timingDriftCount: number,
): CalibrationDriftStatus {
  if (selectorDriftCount > 0) return 'selector_drift';
  if (axRoleDriftCount > 0) return 'ax_role_drift';
  if (pageStateDriftCount > 0) return 'page_state_drift';
  if (timingDriftCount > 0) return 'timing_drift';
  return 'compatible';
}

function hashSeed(value: string): string {
  return hashText(value);
}

function hashOptional(value: string | undefined): string | undefined {
  return value ? hashSeed(value) : undefined;
}

function expiresAt(ttlSeconds: number, now: () => string): string {
  return new Date(Date.parse(now()) + ttlSeconds * 1000).toISOString();
}
