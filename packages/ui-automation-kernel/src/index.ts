import {
  AdminWriteAuthoritySchema,
  AdminWriteDryRunPlanSchema,
  AdminWriteIntentSchema,
  AdminWriteRunSchema,
  SchemaVersionSchema,
  UiTargetFingerprintSchema,
  UiAutomationAuthoritySchema,
  UiAutomationDryRunPlanSchema,
  UiAutomationIntentSchema,
  UiAutomationRunSchema,
  foundationId,
  foundationTimestamp,
  type AutomationActionClass,
  type AdminUiActionKind,
  type AdminWriteAuthority,
  type AdminWriteDryRunPlan,
  type AdminWriteIntent,
  type AdminWriteRun,
  type RiskLevel,
  type UiTargetFingerprint,
  type UiAutomationActionKind,
  type UiAutomationAuthority,
  type UiAutomationDryRunPlan,
  type UiAutomationIntent,
  type UiAutomationRun,
  type UiAutomationStatus,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

export interface UiActionRiskClassification {
  actionKind: UiAutomationActionKind;
  actionClass: AutomationActionClass;
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  authorityRequired: boolean;
  forbidden: boolean;
  blockedReasonSeeds: string[];
  summary: string;
}

export interface AdminUiActionRiskClassification {
  actionKind: AdminUiActionKind;
  actionClass: AutomationActionClass;
  riskLevel: RiskLevel;
  approvalRequired: true;
  authorityRequired: true;
  forbidden: boolean;
  blockedReasonSeeds: string[];
  summary: string;
}

export interface UiAutomationIntentInput {
  actionKind: UiAutomationActionKind;
  targetSeed: string;
  selectorManifestSeed?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  createdAt?: string;
}

export interface UiAutomationAuthorityInput {
  dryRunPlan: UiAutomationDryRunPlan;
  approvalArtifactSeed?: string;
  constraints?: readonly string[];
  expiresAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  createdAt?: string;
}

export interface UiAutomationResultInput {
  intent: UiAutomationIntent;
  dryRunPlan: UiAutomationDryRunPlan;
  authority?: UiAutomationAuthority;
  liveActionRequested?: boolean;
  status?: UiAutomationStatus;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  createdAt?: string;
}

export interface UiTargetFingerprintInput {
  targetSeed: string;
  selectorSeed?: string;
  axRoleSeed?: string;
  axNameSeed?: string;
  pageSeed?: string;
  networkEndpointSeed?: string;
  screenshotSeed?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  observedAt?: string;
}

export interface AdminWriteIntentInput {
  actionKind: AdminUiActionKind;
  targetSeed: string;
  fingerprint?: UiTargetFingerprint;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  createdAt?: string;
}

export interface AdminWriteAuthorityInput {
  dryRunPlan: AdminWriteDryRunPlan;
  approvalArtifactSeed?: string;
  constraints?: readonly string[];
  expiresAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  createdAt?: string;
}

export interface AdminWriteRunInput {
  intent: AdminWriteIntent;
  dryRunPlan: AdminWriteDryRunPlan;
  authority?: AdminWriteAuthority;
  liveActionRequested?: boolean;
  liveExecutorGateEnabled?: boolean;
  selectorFingerprintMatched?: boolean;
  finalConfirmFingerprintSeed?: string;
  finalConfirmFingerprintHash?: string;
  finalConfirmFingerprintMatched?: boolean;
  postWriteVerified?: boolean;
  postWritePageSeed?: string;
  postWritePageHash?: string;
  duplicateSubmitDetected?: boolean;
  ownerSelfAction?: boolean;
  status?: UiAutomationStatus;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  createdAt?: string;
}

const guidedActions = new Set<UiAutomationActionKind>([
  'navigate',
  'reload',
  'scroll',
  'focus',
  'open-known-page',
  'click-allowlisted-control',
  'type-allowlisted-field',
]);

const criticalActions = new Set<UiAutomationActionKind>([
  'restart-desktop',
  'interrupt-turn',
  'resume',
  'fork',
  'transfer',
  'logout',
  'switch-visible-workspace',
]);

const forbiddenActions = new Set<UiAutomationActionKind>([
  'credential-input',
  'mfa-input',
  'session-storage-read',
]);

const readClickAdminActions = new Set<AdminUiActionKind>([
  'owner-admin-open-members',
  'owner-admin-open-billing',
  'owner-admin-open-pending-invites',
  'owner-admin-open-manage-seats',
  'owner-admin-open-add-credits',
  'owner-admin-open-usage-alerts',
]);

const guidedPrepareAdminActions = new Set<AdminUiActionKind>([
  'workspace-switch-visible-click',
]);

const approvedAdminWriteActions = new Set<AdminUiActionKind>([
  'invite-member',
  'cancel-invite',
  'remove-member',
  'change-member-role',
  'assign-seat',
  'unassign-seat',
  'update-usage-alert',
]);

const criticalPaymentAdminActions = new Set<AdminUiActionKind>(['add-credits']);

const forbiddenAdminActions = new Set<AdminUiActionKind>([
  'credential-input',
  'mfa-input',
  'session-storage-read',
]);

const ownerProtectedAdminActions = new Set<AdminUiActionKind>([
  'remove-member',
  'change-member-role',
  'unassign-seat',
]);

export function classifyUiActionRisk(
  actionKind: UiAutomationActionKind,
): UiActionRiskClassification {
  if (forbiddenActions.has(actionKind)) {
    return {
      actionKind,
      actionClass: 'forbidden_credential_action',
      riskLevel: 'critical',
      approvalRequired: true,
      authorityRequired: true,
      forbidden: true,
      blockedReasonSeeds: ['credential_material_forbidden'],
      summary: 'This UI action is permanently forbidden by the compliance baseline.',
    };
  }

  if (criticalActions.has(actionKind)) {
    return {
      actionKind,
      actionClass: 'critical_approved_action',
      riskLevel: 'critical',
      approvalRequired: true,
      authorityRequired: true,
      forbidden: false,
      blockedReasonSeeds: [],
      summary: 'This UI action is critical and requires store-resolved approval authority.',
    };
  }

  if (guidedActions.has(actionKind)) {
    return {
      actionKind,
      actionClass: 'approved_guided_action',
      riskLevel:
        actionKind === 'scroll' || actionKind === 'focus' || actionKind === 'reload'
          ? 'medium'
          : 'high',
      approvalRequired: true,
      authorityRequired: true,
      forbidden: false,
      blockedReasonSeeds: [],
      summary: 'This UI action is allowed only through guided dry-run and approval authority.',
    };
  }

  return {
    actionKind,
    actionClass: 'auto_observe',
    riskLevel: 'low',
    approvalRequired: false,
    authorityRequired: false,
    forbidden: false,
    blockedReasonSeeds: [],
    summary: 'This UI action is treated as metadata-only observation.',
  };
}

export function classifyAdminUiActionRisk(
  actionKind: AdminUiActionKind,
): AdminUiActionRiskClassification {
  if (forbiddenAdminActions.has(actionKind)) {
    return {
      actionKind,
      actionClass: 'forbidden_credential_action',
      riskLevel: 'critical',
      approvalRequired: true,
      authorityRequired: true,
      forbidden: true,
      blockedReasonSeeds: ['credential_material_forbidden'],
      summary: 'This admin UI action is permanently forbidden by the compliance baseline.',
    };
  }

  if (criticalPaymentAdminActions.has(actionKind)) {
    return {
      actionKind,
      actionClass: 'critical_payment_write',
      riskLevel: 'critical',
      approvalRequired: true,
      authorityRequired: true,
      forbidden: false,
      blockedReasonSeeds: [],
      summary: 'This admin UI payment action requires explicit critical approval authority.',
    };
  }

  if (approvedAdminWriteActions.has(actionKind)) {
    return {
      actionKind,
      actionClass: 'approved_admin_write',
      riskLevel: 'critical',
      approvalRequired: true,
      authorityRequired: true,
      forbidden: false,
      blockedReasonSeeds: [],
      summary: 'This admin UI write requires dry-run, approval, evidence, and audit.',
    };
  }

  if (guidedPrepareAdminActions.has(actionKind)) {
    return {
      actionKind,
      actionClass: 'guided_prepare_write',
      riskLevel: 'high',
      approvalRequired: true,
      authorityRequired: true,
      forbidden: false,
      blockedReasonSeeds: [],
      summary: 'This admin UI preparation action requires visible guided approval authority.',
    };
  }

  if (readClickAdminActions.has(actionKind)) {
    return {
      actionKind,
      actionClass: 'read_click',
      riskLevel: 'high',
      approvalRequired: true,
      authorityRequired: true,
      forbidden: false,
      blockedReasonSeeds: [],
      summary: 'This admin UI read-click is allowed only through governed dry-run authority.',
    };
  }

  return {
    actionKind,
    actionClass: 'forbidden_credential_action',
    riskLevel: 'critical',
    approvalRequired: true,
    authorityRequired: true,
    forbidden: true,
    blockedReasonSeeds: ['unknown_admin_ui_action'],
    summary: 'Unknown admin UI actions are blocked before authority can execute.',
  };
}

export function planUiAutomationIntent(input: UiAutomationIntentInput): UiAutomationIntent {
  const classification = classifyUiActionRisk(input.actionKind);
  const targetHash = hashRef(input.targetSeed);
  const selectorManifestHash = input.selectorManifestSeed
    ? hashRef(input.selectorManifestSeed)
    : undefined;

  return UiAutomationIntentSchema.parse({
    id: foundationId('ui_automation_intent'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.createdAt ?? foundationTimestamp(),
    intentHash: hashRef({
      actionKind: input.actionKind,
      targetHash,
      selectorManifestHash,
    }),
    actionKind: input.actionKind,
    actionClass: classification.actionClass,
    targetHash,
    selectorManifestHash,
    riskLevel: classification.riskLevel,
    dryRunRequired: true,
    approvalRequired: classification.approvalRequired,
    credentialInputRequested: false,
    rawIntentStored: false,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: classification.summary,
  });
}

export function createUiTargetFingerprint(input: UiTargetFingerprintInput): UiTargetFingerprint {
  const targetHash = hashRef(input.targetSeed);
  const selectorHash = input.selectorSeed ? hashRef(input.selectorSeed) : undefined;
  const axRoleHash = input.axRoleSeed ? hashRef(input.axRoleSeed) : undefined;
  const axNameHash = input.axNameSeed ? hashRef(input.axNameSeed) : undefined;
  const pageHash = input.pageSeed ? hashRef(input.pageSeed) : undefined;
  const networkEndpointHash = input.networkEndpointSeed
    ? hashRef(input.networkEndpointSeed)
    : undefined;
  const screenshotHash = input.screenshotSeed ? hashRef(input.screenshotSeed) : undefined;

  return UiTargetFingerprintSchema.parse({
    id: foundationId('ui_target_fingerprint'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: input.observedAt ?? foundationTimestamp(),
    targetHash,
    selectorHash,
    axRoleHash,
    axNameHash,
    pageHash,
    networkEndpointHash,
    screenshotHash,
    fingerprintHash: hashRef({
      targetHash,
      selectorHash,
      axRoleHash,
      axNameHash,
      pageHash,
      networkEndpointHash,
      screenshotHash,
    }),
    rawSelectorStored: false,
    rawAxStored: false,
    rawPageStored: false,
    rawNetworkBodyStored: false,
    rawScreenshotStored: false,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    metadataOnly: true,
    liveExecution: false,
    externalProcessStarted: false,
    summary: 'UI target fingerprint records hashes only for governed admin action binding.',
  });
}

export function planAdminWriteIntent(input: AdminWriteIntentInput): AdminWriteIntent {
  const classification = classifyAdminUiActionRisk(input.actionKind);
  const targetHash = hashRef(input.targetSeed);

  return AdminWriteIntentSchema.parse({
    id: foundationId('admin_write_intent'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.createdAt ?? foundationTimestamp(),
    intentHash: hashRef({
      actionKind: input.actionKind,
      targetHash,
      fingerprintHash: input.fingerprint?.fingerprintHash,
    }),
    actionKind: input.actionKind,
    actionClass: classification.actionClass,
    targetHash,
    uiTargetFingerprintId: input.fingerprint?.id,
    selectorFingerprintHash: input.fingerprint?.selectorHash,
    riskLevel: classification.riskLevel,
    dryRunRequired: true,
    approvalRequired: true,
    credentialInputRequested: false,
    businessCleartextAllowed: false,
    rawIntentStored: false,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: classification.summary,
  });
}

export function createAdminWriteDryRun(
  intent: AdminWriteIntent,
  fingerprint?: UiTargetFingerprint,
): AdminWriteDryRunPlan {
  const classification = classifyAdminUiActionRisk(intent.actionKind);
  const blockedReasonHashes = classification.blockedReasonSeeds.map(hashRef);

  return AdminWriteDryRunPlanSchema.parse({
    id: foundationId('admin_write_dry_run_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    intentId: intent.id,
    planHash: hashRef({
      intentHash: intent.intentHash,
      actionClass: intent.actionClass,
      riskLevel: intent.riskLevel,
      fingerprintHash: fingerprint?.fingerprintHash,
      blockedReasonHashes,
    }),
    actionCount: 1,
    actionClass: intent.actionClass,
    riskLevel: intent.riskLevel,
    approvalRequired: true,
    authorityRequired: true,
    blockedReasonHashes,
    targetFingerprintHash: fingerprint?.fingerprintHash,
    beforePageHash: fingerprint?.pageHash,
    credentialActionBlocked: classification.forbidden,
    rawPlanStored: false,
    evidenceRefIds: [...intent.evidenceRefIds],
    auditEventIds: [...intent.auditEventIds],
    summary: classification.forbidden
      ? 'Admin UI dry-run blocks the forbidden action before authority can execute.'
      : 'Admin UI dry-run is ready for policy and approval evaluation.',
  });
}

export function createUiActionDryRun(intent: UiAutomationIntent): UiAutomationDryRunPlan {
  const classification = classifyUiActionRisk(intent.actionKind);
  const blockedReasonHashes = classification.blockedReasonSeeds.map(hashRef);

  return UiAutomationDryRunPlanSchema.parse({
    id: foundationId('ui_automation_dry_run_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    intentId: intent.id,
    planHash: hashRef({
      intentHash: intent.intentHash,
      actionClass: intent.actionClass,
      riskLevel: intent.riskLevel,
      blockedReasonHashes,
    }),
    actionCount: 1,
    actionClass: intent.actionClass,
    riskLevel: intent.riskLevel,
    approvalRequired: classification.approvalRequired,
    authorityRequired: classification.authorityRequired,
    blockedReasonHashes,
    credentialActionBlocked: classification.forbidden,
    rawPlanStored: false,
    evidenceRefIds: [...intent.evidenceRefIds],
    auditEventIds: [...intent.auditEventIds],
    summary: classification.forbidden
      ? 'UI automation dry-run blocks the forbidden action before authority can execute.'
      : 'UI automation dry-run is ready for policy and approval evaluation.',
  });
}

export function resolveAdminWriteAuthority(
  input: AdminWriteAuthorityInput,
): AdminWriteAuthority {
  const plan = input.dryRunPlan;
  const allowed =
    plan.actionClass !== 'forbidden_credential_action' &&
    plan.blockedReasonHashes.length === 0 &&
    input.approvalArtifactSeed !== undefined;

  return AdminWriteAuthoritySchema.parse({
    id: foundationId('admin_write_authority'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.createdAt ?? foundationTimestamp(),
    dryRunPlanId: plan.id,
    authorityHash: hashRef({
      dryRunPlanId: plan.id,
      allowed,
      approvalArtifactSeed: input.approvalArtifactSeed,
      constraints: input.constraints ?? [],
    }),
    approvalArtifactIdHash: input.approvalArtifactSeed
      ? hashRef(input.approvalArtifactSeed)
      : undefined,
    allowed,
    actionClass: plan.actionClass,
    riskLevel: plan.riskLevel,
    constraints: [
      ...(input.constraints ?? [
        'metadata-only',
        'store-resolved-approval-required',
        'no-credential-material',
        'no-generic-cdp-passthrough',
      ]),
    ],
    requestBodyAuthorityAccepted: false,
    credentialMaterialAllowed: false,
    storageAccessAllowed: false,
    networkBodyReadAllowed: false,
    rawAuthorityStored: false,
    expiresAt: input.expiresAt,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: allowed
      ? 'Admin UI authority was resolved from approved governance metadata.'
      : 'Admin UI authority is denied until store-resolved approval and policy gates pass.',
  });
}

export function applyUiActionAuthority(
  input: UiAutomationAuthorityInput,
): UiAutomationAuthority {
  const plan = input.dryRunPlan;
  const allowed =
    plan.actionClass !== 'forbidden_credential_action' &&
    plan.blockedReasonHashes.length === 0 &&
    (!plan.approvalRequired || input.approvalArtifactSeed !== undefined);

  return UiAutomationAuthoritySchema.parse({
    id: foundationId('ui_automation_authority'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.createdAt ?? foundationTimestamp(),
    dryRunPlanId: plan.id,
    authorityHash: hashRef({
      dryRunPlanId: plan.id,
      allowed,
      approvalArtifactSeed: input.approvalArtifactSeed,
      constraints: input.constraints ?? [],
    }),
    approvalArtifactIdHash: input.approvalArtifactSeed
      ? hashRef(input.approvalArtifactSeed)
      : undefined,
    allowed,
    actionClass: plan.actionClass,
    riskLevel: plan.riskLevel,
    constraints: [...(input.constraints ?? ['metadata-only', 'store-resolved-authority'])],
    requestBodyAuthorityAccepted: false,
    credentialMaterialAllowed: false,
    storageAccessAllowed: false,
    networkBodyReadAllowed: false,
    rawAuthorityStored: false,
    expiresAt: input.expiresAt,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: allowed
      ? 'UI automation authority was resolved from approved governance metadata.'
      : 'UI automation authority is denied until approval and policy gates pass.',
  });
}

export function summarizeAdminWriteRun(input: AdminWriteRunInput): AdminWriteRun {
  const authorityAllowed = input.authority?.allowed === true;
  const liveActionRequested = input.liveActionRequested ?? true;
  const liveExecutorGateEnabled = input.liveExecutorGateEnabled ?? false;
  const selectorFingerprintMatched = input.selectorFingerprintMatched ?? false;
  const finalConfirmFingerprintMatched = input.finalConfirmFingerprintMatched ?? false;
  const duplicateSubmitBlocked = input.duplicateSubmitDetected === true;
  const forcedBlocked = input.status === 'blocked';
  const ownerSelfActionBlocked =
    input.ownerSelfAction === true && ownerProtectedAdminActions.has(input.intent.actionKind);
  const fixedFlowSafeguardsPassed =
    !liveExecutorGateEnabled ||
    (selectorFingerprintMatched && finalConfirmFingerprintMatched && !duplicateSubmitBlocked);
  const liveActionAllowed =
    liveActionRequested &&
    authorityAllowed &&
    !forcedBlocked &&
    !ownerSelfActionBlocked &&
    !duplicateSubmitBlocked &&
    fixedFlowSafeguardsPassed;
  const visibleUiExecution = liveExecutorGateEnabled && liveActionAllowed;
  const postWriteVerified = input.postWriteVerified === true && visibleUiExecution;
  const finalConfirmFingerprintHash = input.finalConfirmFingerprintHash ?? (input.finalConfirmFingerprintSeed
    ? hashRef(input.finalConfirmFingerprintSeed)
    : undefined);
  const postWritePageHash = input.postWritePageHash ?? (input.postWritePageSeed
    ? hashRef(input.postWritePageSeed)
    : input.dryRunPlan.afterPageHash);
  const postWriteVerificationHash = postWriteVerified
    ? hashRef({
        intentId: input.intent.id,
        dryRunPlanId: input.dryRunPlan.id,
        authorityId: input.authority?.id,
        targetFingerprintHash: input.dryRunPlan.targetFingerprintHash,
        postWritePageHash,
      })
    : undefined;
  let derivedStatus: UiAutomationStatus;
  if (input.dryRunPlan.credentialActionBlocked || input.dryRunPlan.blockedReasonHashes.length > 0) {
    derivedStatus = 'blocked';
  } else if (ownerSelfActionBlocked || duplicateSubmitBlocked) {
    derivedStatus = 'blocked';
  } else if (liveExecutorGateEnabled && authorityAllowed && !fixedFlowSafeguardsPassed) {
    derivedStatus = 'blocked';
  } else if (liveActionAllowed) {
    derivedStatus = postWriteVerified ? 'completed' : liveExecutorGateEnabled ? 'running' : 'authorized';
  } else {
    derivedStatus = liveActionRequested ? 'approval_waiting' : 'planned';
  }
  const status = input.status ?? derivedStatus;

  return AdminWriteRunSchema.parse({
    id: foundationId('admin_write_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.createdAt ?? foundationTimestamp(),
    intentId: input.intent.id,
    dryRunPlanId: input.dryRunPlan.id,
    authorityId: input.authority?.id,
    status,
    actionClass: input.intent.actionClass,
    actionCount: input.dryRunPlan.actionCount,
    approvedActionCount: liveActionAllowed ? input.dryRunPlan.actionCount : 0,
    blockedActionCount: status === 'blocked' ? input.dryRunPlan.actionCount : 0,
    liveActionRequested,
    liveActionAllowed,
    processBoundaryInvoked: visibleUiExecution,
    externalProcessStarted: false,
    networkBoundaryInvoked: visibleUiExecution,
    executionDisabled: !visibleUiExecution,
    fixedBusinessAdminFlow: true,
    liveExecutorGateEnabled,
    visibleUiExecution,
    preWritePageHash: input.dryRunPlan.beforePageHash,
    postWritePageHash,
    targetFingerprintHash: input.dryRunPlan.targetFingerprintHash,
    selectorFingerprintMatched,
    finalConfirmFingerprintHash,
    finalConfirmFingerprintMatched,
    postWriteVerificationHash,
    postWriteVerified,
    duplicateSubmitBlocked,
    ownerSelfActionBlocked,
    ownerSelfProtectionApplied: true,
    requestBodyAuthorityAccepted: false,
    genericAutomationPassthroughAllowed: false,
    rawSelectorAccepted: false,
    rawScriptAccepted: false,
    rawPayloadAccepted: false,
    rawRunStored: false,
    evidenceRefIds: [...(input.evidenceRefIds ?? input.intent.evidenceRefIds)],
    auditEventIds: [...(input.auditEventIds ?? input.intent.auditEventIds)],
    summary: visibleUiExecution
      ? postWriteVerified
        ? 'Governed admin UI fixed-flow execution completed and post-write verification matched.'
        : 'Governed admin UI fixed-flow execution reached the visible UI boundary and awaits verification.'
      : liveActionAllowed
        ? 'Admin UI action is authorized but execution remains disabled until the live executor gate is enabled.'
        : 'Admin UI action has not executed and remains waiting or blocked by governance safeguards.',
  });
}

export function summarizeUiAutomationResult(input: UiAutomationResultInput): UiAutomationRun {
  const authorityAllowed = input.authority?.allowed === true;
  const liveActionRequested = input.liveActionRequested ?? true;
  const liveActionAllowed = liveActionRequested && authorityAllowed;
  const status =
    input.status ??
    (input.dryRunPlan.credentialActionBlocked || input.dryRunPlan.blockedReasonHashes.length > 0
      ? 'blocked'
      : liveActionAllowed
        ? 'authorized'
        : liveActionRequested
          ? 'approval_waiting'
          : 'planned');

  return UiAutomationRunSchema.parse({
    id: foundationId('ui_automation_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.createdAt ?? foundationTimestamp(),
    intentId: input.intent.id,
    dryRunPlanId: input.dryRunPlan.id,
    authorityId: input.authority?.id,
    status,
    actionClass: input.intent.actionClass,
    actionCount: input.dryRunPlan.actionCount,
    approvedActionCount: liveActionAllowed ? input.dryRunPlan.actionCount : 0,
    blockedActionCount: status === 'blocked' ? input.dryRunPlan.actionCount : 0,
    liveActionRequested,
    liveActionAllowed,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    rawDomStored: false,
    rawTextStored: false,
    networkBodyStored: false,
    evidenceRefIds: [...(input.evidenceRefIds ?? input.intent.evidenceRefIds)],
    auditEventIds: [...(input.auditEventIds ?? input.intent.auditEventIds)],
    summary: liveActionAllowed
      ? 'UI automation is authorized for a governed action boundary.'
      : 'UI automation has not executed and remains waiting or blocked by governance.',
  });
}

function hashRef(value: unknown): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return `sha256:${hashText(text)}`;
}
