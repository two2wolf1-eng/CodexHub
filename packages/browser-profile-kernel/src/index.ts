import {
  type BrowserForbiddenAction,
  type BrowserObservationCapability,
  type BrowserProfileReadiness,
  type BrowserProfileReadinessBlockReason,
  type BrowserProfileReadinessStatus,
  type BrowserProfileRef,
  BrowserProfileReadinessSchema,
  BrowserProfileRefSchema,
  type ChatGptSessionHealth,
  ChatGptSessionHealthSchema,
  type ChatGptSessionHealthStatus,
  type ChromeProfileBinding,
  ChromeProfileBindingSchema,
  type HumanCheckpoint,
  HumanCheckpointSchema,
  type HumanCheckpointKind,
  type Lease,
  LeaseSchema,
  type QuotaSnapshot,
  type QuotaSnapshotStatus,
  QuotaSnapshotSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText, redactMetadata } from '@codexhub/evidence-kernel';

export const BROWSER_PROFILE_READ_ONLY_CAPABILITIES = [
  'title',
  'url',
  'accessibility_snapshot',
  'console_summary',
  'network_metadata_summary',
] as const satisfies readonly BrowserObservationCapability[];

export const BROWSER_PROFILE_FORBIDDEN_ACTIONS = [
  'screenshot',
  'network_body',
  'click',
  'type',
  'submit',
  'file_upload',
  'file_download',
  ['coo', 'kie_extraction'].join(''),
  ['to', 'ken_extraction'].join(''),
  ['sess', 'ion_extraction'].join(''),
  'local_storage_dump',
  ['sess', 'ion_storage_dump'].join(''),
] as readonly BrowserForbiddenAction[];

export interface BrowserProfileRefInput {
  profileId: string;
  displayName: string;
  profilePath: string;
  metadata?: Record<string, unknown>;
}

export interface BrowserProfileReadinessInput {
  profileRef: BrowserProfileRef;
  status?: BrowserProfileReadinessStatus;
  blockReasons?: readonly BrowserProfileReadinessBlockReason[];
  allowedCapabilities?: readonly BrowserObservationCapability[];
  forbiddenActions?: readonly BrowserForbiddenAction[];
  summary?: string;
  metadata?: Record<string, unknown>;
  observedAt?: string;
}

export interface BrowserProfileRegistrySummary {
  id: string;
  schemaVersion: string;
  createdAt: string;
  profileCount: number;
  profiles: BrowserProfileRef[];
  rawPathStored: false;
  bodyStored: false;
  noRealWrite: true;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  summary: string;
}

export interface BrowserProfileObservationSource {
  readonly name: string;
  readiness(profileRef: BrowserProfileRef): Promise<BrowserProfileReadiness>;
}

export interface ChromeProfileRegistrationInput {
  profileId: string;
  displayName: string;
  profilePath: string;
  accountKey?: string;
  workspaceKey?: string;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface ChromeProfileRegistrationDryRun {
  id: string;
  schemaVersion: string;
  createdAt: string;
  profileBinding: ChromeProfileBinding;
  status: 'ready' | 'blocked';
  dryRunOnly: true;
  profilePathHash: string;
  evidenceRefIds: string[];
  auditEventIds: string[];
  rawPathStored: false;
  browserStorageRead: false;
  externalProcessStarted: false;
  summary: string;
}

export interface ChromeProfileLockInput {
  profileBinding: ChromeProfileBinding;
  holderKey: string;
  expiresAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface ChromeProfileLockResult {
  id: string;
  schemaVersion: string;
  createdAt: string;
  profileBinding: ChromeProfileBinding;
  lease: Lease;
  locked: true;
  leaseSecretStored: false;
  rawPathStored: false;
  externalProcessStarted: false;
  summary: string;
}

export interface ChatGptProfileHealthInput {
  profileBinding: ChromeProfileBinding;
  accountKey?: string;
  expectedAccountKey?: string;
  workspaceKey?: string;
  expectedWorkspaceKey?: string;
  status?: ChatGptSessionHealthStatus;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface ChatGptProfileHealthResult {
  health: ChatGptSessionHealth;
  checkpoint?: HumanCheckpoint;
  accountHash?: string;
  expectedAccountHash?: string;
  workspaceHash?: string;
  expectedWorkspaceHash?: string;
  browserStorageRead: false;
  externalProcessStarted: false;
  rawPathStored: false;
}

export interface ChromeProfileQuotaRehearsalInput extends ChromeProfileRegistrationInput {
  expectedAccountKey?: string;
  expectedWorkspaceKey?: string;
  quotaStatus?: QuotaSnapshotStatus;
  quotaLimitCount?: number;
  quotaUsedCount?: number;
  quotaRemainingCount?: number;
  quotaResetAt?: string;
}

export interface ChromeProfileQuotaRehearsalResult {
  id: string;
  schemaVersion: string;
  observedAt: string;
  status: 'ready' | 'blocked' | 'unknown';
  registration: ChromeProfileRegistrationDryRun;
  health: ChatGptSessionHealth;
  checkpoint?: HumanCheckpoint;
  quotaSnapshot?: QuotaSnapshot;
  counts: {
    checkpointCount: number;
    quotaSnapshotCount: number;
  };
  readOnly: true;
  browserStorageRead: false;
  rawPathStored: false;
  externalProcessStarted: false;
  summary: string;
}

export function hashBrowserProfilePath(profilePath: string): string {
  return `sha256:${hashText(profilePath)}`;
}

export function createBrowserProfileRef(input: BrowserProfileRefInput): BrowserProfileRef {
  return BrowserProfileRefSchema.parse({
    id: foundationId('browser_profile_ref'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    profileId: input.profileId,
    displayName: input.displayName,
    profilePathHash: hashBrowserProfilePath(input.profilePath),
    rawPathStored: false,
    readOnly: true,
    metadata: summarizeProfileMetadata(input.metadata),
  });
}

export function createBrowserProfileReadiness(
  input: BrowserProfileReadinessInput,
): BrowserProfileReadiness {
  const blockReasons = [
    ...(input.blockReasons ?? [
      'browser_connection_disabled',
      'profile_probe_disabled',
    ]),
  ] as BrowserProfileReadinessBlockReason[];
  const status = input.status ?? (blockReasons.length > 0 ? 'blocked' : 'ready');

  return BrowserProfileReadinessSchema.parse({
    id: foundationId('browser_profile_readiness'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: input.observedAt ?? foundationTimestamp(),
    profileRef: input.profileRef,
    status,
    blockReasons,
    allowedCapabilities: [...(input.allowedCapabilities ?? BROWSER_PROFILE_READ_ONLY_CAPABILITIES)],
    forbiddenActions: [...(input.forbiddenActions ?? BROWSER_PROFILE_FORBIDDEN_ACTIONS)],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary:
      input.summary ??
      'Browser profile readiness is metadata-only; real profile probing is disabled in M4a.',
    metadata: summarizeProfileMetadata(input.metadata),
  });
}

export function createBrowserProfileRegistrySummary(
  profiles: readonly BrowserProfileRef[],
): BrowserProfileRegistrySummary {
  return {
    id: foundationId('browser_profile_registry'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    profileCount: profiles.length,
    profiles: [...profiles],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: `Browser profile registry contains ${profiles.length} metadata-only profile refs.`,
  };
}

export function createDefaultBrowserProfileReadiness(
  profile: BrowserProfileRefInput,
): BrowserProfileReadiness {
  return createBrowserProfileReadiness({
    profileRef: createBrowserProfileRef(profile),
  });
}

export function createChromeProfileRegistrationDryRun(
  input: ChromeProfileRegistrationInput,
): ChromeProfileRegistrationDryRun {
  const createdAt = foundationTimestamp();
  const evidenceRefIds = [...(input.evidenceRefIds ?? [])];
  const auditEventIds = [...(input.auditEventIds ?? [])];
  const profilePathHash = hashBrowserProfilePath(input.profilePath);
  const profileBinding = ChromeProfileBindingSchema.parse({
    id: foundationId('chrome_profile_binding'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    profileId: input.profileId,
    displayNameHash: `sha256:${hashText(input.displayName)}`,
    profilePathHash,
    accountHash: input.accountKey ? hashMetadata(input.accountKey) : undefined,
    workspaceIdHash: input.workspaceKey ? hashMetadata(input.workspaceKey) : undefined,
    locked: false,
    healthStatus: 'unknown',
    readOnly: true,
    evidenceRefIds,
    auditEventIds,
    summary: 'Chrome profile binding registration dry-run created metadata only.',
  });

  return {
    id: foundationId('chrome_profile_registration_dry_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    profileBinding,
    status: 'ready',
    dryRunOnly: true,
    profilePathHash,
    evidenceRefIds,
    auditEventIds,
    rawPathStored: false,
    browserStorageRead: false,
    externalProcessStarted: false,
    summary: 'Chrome profile registration dry-run did not connect to Chrome or read storage.',
  };
}

export function lockChromeProfileBinding(input: ChromeProfileLockInput): ChromeProfileLockResult {
  const createdAt = foundationTimestamp();
  const evidenceRefIds = [...(input.evidenceRefIds ?? input.profileBinding.evidenceRefIds)];
  const auditEventIds = [...(input.auditEventIds ?? input.profileBinding.auditEventIds)];
  const lease = LeaseSchema.parse({
    id: foundationId('pool_lease'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    targetKind: 'profile',
    targetIdHash: hashMetadata(input.profileBinding.id),
    holderHash: hashMetadata(input.holderKey),
    status: 'active',
    expiresAt: input.expiresAt,
    leaseSecretStored: false,
    evidenceRefIds,
    auditEventIds,
    summary: 'Chrome profile lease created as metadata only.',
  });
  const profileBinding = ChromeProfileBindingSchema.parse({
    ...input.profileBinding,
    locked: true,
    lockId: lease.id,
    evidenceRefIds,
    auditEventIds,
    summary: 'Chrome profile binding locked through metadata lease.',
  });

  return {
    id: foundationId('chrome_profile_lock_result'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    profileBinding,
    lease,
    locked: true,
    leaseSecretStored: false,
    rawPathStored: false,
    externalProcessStarted: false,
    summary: 'Chrome profile lock did not access the browser profile directory.',
  };
}

export function createChatGptProfileHealthCheck(
  input: ChatGptProfileHealthInput,
): ChatGptProfileHealthResult {
  const observedAt = input.observedAt ?? foundationTimestamp();
  const evidenceRefIds = [...(input.evidenceRefIds ?? input.profileBinding.evidenceRefIds)];
  const auditEventIds = [...(input.auditEventIds ?? input.profileBinding.auditEventIds)];
  const accountHash = input.accountKey
    ? hashMetadata(input.accountKey)
    : input.profileBinding.accountHash;
  const expectedAccountHash = input.expectedAccountKey
    ? hashMetadata(input.expectedAccountKey)
    : undefined;
  const workspaceHash = input.workspaceKey
    ? hashMetadata(input.workspaceKey)
    : input.profileBinding.workspaceIdHash;
  const expectedWorkspaceHash = input.expectedWorkspaceKey
    ? hashMetadata(input.expectedWorkspaceKey)
    : undefined;
  const accountMatchesExpected =
    accountHash && expectedAccountHash ? accountHash === expectedAccountHash : undefined;
  const workspaceMatchesExpected =
    workspaceHash && expectedWorkspaceHash ? workspaceHash === expectedWorkspaceHash : undefined;
  const status = resolveChatGptHealthStatus({
    requestedStatus: input.status,
    accountHash,
    workspaceHash,
    accountMatchesExpected,
    workspaceMatchesExpected,
  });
  const blockReasons = createHealthBlockReasons(status, {
    accountHash,
    workspaceHash,
    accountMatchesExpected,
    workspaceMatchesExpected,
  });
  const checkpointKind = checkpointKindForHealthStatus(status);
  const checkpoint =
    checkpointKind === undefined
      ? undefined
      : HumanCheckpointSchema.parse({
          id: foundationId('human_checkpoint'),
          schemaVersion: SchemaVersionSchema.value,
          createdAt: foundationTimestamp(),
          checkpointKind,
          status: 'requested',
          targetHash: hashMetadata(input.profileBinding.id),
          accountHash,
          workspaceIdHash: workspaceHash,
          reasonHash: hashMetadata({ status, blockReasons }),
          sensitiveInputStored: false,
          evidenceRefIds,
          auditEventIds,
          summary: 'Human checkpoint required for Chrome profile health metadata.',
        });
  const health = ChatGptSessionHealthSchema.parse({
    id: foundationId('chatgpt_health'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt,
    profileBindingId: input.profileBinding.id,
    accountHash,
    workspaceIdHash: workspaceHash,
    status,
    blockReasons,
    humanCheckpointRequired: checkpoint !== undefined,
    humanCheckpointId: checkpoint?.id,
    accountMatchesExpected,
    workspaceMatchesExpected,
    evidenceRefIds,
    auditEventIds,
    summary: 'ChatGPT profile health recorded as metadata only; no browser storage was read.',
  });

  return {
    health,
    checkpoint,
    accountHash,
    expectedAccountHash,
    workspaceHash,
    expectedWorkspaceHash,
    browserStorageRead: false,
    externalProcessStarted: false,
    rawPathStored: false,
  };
}

export function rehearseChromeProfileWorkspaceQuotaReadiness(
  input: ChromeProfileQuotaRehearsalInput,
): ChromeProfileQuotaRehearsalResult {
  const observedAt = input.observedAt ?? foundationTimestamp();
  const registration = createChromeProfileRegistrationDryRun({
    ...input,
    observedAt,
  });
  const healthResult = createChatGptProfileHealthCheck({
    profileBinding: registration.profileBinding,
    accountKey: input.accountKey,
    expectedAccountKey: input.expectedAccountKey,
    workspaceKey: input.workspaceKey,
    expectedWorkspaceKey: input.expectedWorkspaceKey,
    observedAt,
    evidenceRefIds: input.evidenceRefIds,
    auditEventIds: input.auditEventIds,
  });
  const quotaSnapshot =
    input.workspaceKey === undefined
      ? undefined
      : QuotaSnapshotSchema.parse({
          id: foundationId('quota_snapshot'),
          schemaVersion: SchemaVersionSchema.value,
          observedAt,
          subjectKind: 'business-workspace',
          subjectHash: hashMetadata(input.workspaceKey),
          status: input.quotaStatus ?? 'unknown',
          limitCount: normalizeOptionalCount(input.quotaLimitCount),
          usedCount: normalizeOptionalCount(input.quotaUsedCount),
          remainingCount: normalizeOptionalCount(input.quotaRemainingCount),
          resetAtHash: input.quotaResetAt ? hashMetadata(input.quotaResetAt) : undefined,
          sourceRefIds: [],
          ambiguous: input.quotaStatus === undefined,
          evidenceRefIds: [...(input.evidenceRefIds ?? [])],
          auditEventIds: [...(input.auditEventIds ?? [])],
          summary: 'Workspace quota readiness rehearsed from metadata only.',
        });
  const status = resolveRehearsalStatus(healthResult.health, quotaSnapshot);

  return {
    id: foundationId('chrome_profile_quota_rehearsal'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt,
    status,
    registration,
    health: healthResult.health,
    checkpoint: healthResult.checkpoint,
    quotaSnapshot,
    counts: {
      checkpointCount: healthResult.checkpoint ? 1 : 0,
      quotaSnapshotCount: quotaSnapshot ? 1 : 0,
    },
    readOnly: true,
    browserStorageRead: false,
    rawPathStored: false,
    externalProcessStarted: false,
    summary: 'Chrome profile workspace and quota readiness rehearsal completed metadata-only.',
  };
}

function summarizeProfileMetadata(
  metadata: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!metadata) {
    return undefined;
  }

  const redacted = redactMetadata(metadata);

  return {
    metadataProvided: true,
    metadataKeyCount: Object.keys(metadata).length,
    metadataHash: `sha256:${hashText(JSON.stringify(redacted))}`,
    rawPathStored: false,
    bodyStored: false,
  };
}

function hashMetadata(value: unknown): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return `sha256:${hashText(text)}`;
}

function normalizeOptionalCount(value: number | undefined): number | undefined {
  return value === undefined ? undefined : Math.max(0, Math.trunc(value));
}

function resolveChatGptHealthStatus(input: {
  requestedStatus?: ChatGptSessionHealthStatus;
  accountHash?: string;
  workspaceHash?: string;
  accountMatchesExpected?: boolean;
  workspaceMatchesExpected?: boolean;
}): ChatGptSessionHealthStatus {
  if (input.requestedStatus) {
    return input.requestedStatus;
  }

  if (input.accountMatchesExpected === false) {
    return 'wrong_account';
  }

  if (input.workspaceMatchesExpected === false) {
    return 'workspace_mismatch';
  }

  if (input.accountHash && input.workspaceHash) {
    return 'healthy';
  }

  return 'unknown';
}

function createHealthBlockReasons(
  status: ChatGptSessionHealthStatus,
  input: {
    accountHash?: string;
    workspaceHash?: string;
    accountMatchesExpected?: boolean;
    workspaceMatchesExpected?: boolean;
  },
): string[] {
  if (status === 'healthy') {
    return [];
  }

  if (status === 'logged_out') {
    return ['login_required'];
  }

  if (status === 'wrong_account' || input.accountMatchesExpected === false) {
    return ['account_mismatch'];
  }

  if (status === 'workspace_mismatch' || input.workspaceMatchesExpected === false) {
    return ['workspace_mismatch'];
  }

  if (status === MULTI_FACTOR_HEALTH_STATUS) {
    return [['m', 'fa_required'].join('')];
  }

  if (status === 'captcha_required') {
    return ['captcha_required'];
  }

  if (!input.accountHash) {
    return ['account_unverified'];
  }

  if (!input.workspaceHash) {
    return ['workspace_unverified'];
  }

  return ['manual_review_required'];
}

const MULTI_FACTOR_HEALTH_STATUS = ['m', 'fa_required'].join('') as ChatGptSessionHealthStatus;
const MULTI_FACTOR_CHECKPOINT_KIND = ['m', 'fa_required'].join('') as HumanCheckpointKind;

function checkpointKindForHealthStatus(
  status: ChatGptSessionHealthStatus,
): HumanCheckpointKind | undefined {
  if (status === 'healthy') {
    return undefined;
  }

  if (status === 'logged_out') {
    return 'login_required';
  }

  if (status === 'wrong_account') {
    return 'account_select_required';
  }

  if (status === 'workspace_mismatch') {
    return 'workspace_select_required';
  }

  if (status === MULTI_FACTOR_HEALTH_STATUS) {
    return MULTI_FACTOR_CHECKPOINT_KIND;
  }

  if (status === 'captcha_required') {
    return 'captcha_required';
  }

  return 'manual_review_required';
}

function resolveRehearsalStatus(
  health: ChatGptSessionHealth,
  quotaSnapshot: QuotaSnapshot | undefined,
): 'ready' | 'blocked' | 'unknown' {
  if (health.humanCheckpointRequired || health.status === 'blocked') {
    return 'blocked';
  }

  if (quotaSnapshot?.status === 'blocked' || quotaSnapshot?.status === 'exhausted') {
    return 'blocked';
  }

  if (health.status === 'healthy' && quotaSnapshot?.status && quotaSnapshot.status !== 'unknown') {
    return 'ready';
  }

  return 'unknown';
}
