import {
  SchemaVersionSchema,
  UiAutomationAuthoritySchema,
  UiAutomationDryRunPlanSchema,
  UiAutomationIntentSchema,
  UiAutomationRunSchema,
  foundationId,
  foundationTimestamp,
  type AutomationActionClass,
  type RiskLevel,
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
