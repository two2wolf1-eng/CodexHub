import {
  type BusinessQuotaPermissionProbe,
  BusinessQuotaPermissionProbeSchema,
  type BusinessQuotaPermissionRole,
  type BusinessQuotaProbeStatus,
  type BusinessQuotaSourceKind,
  type BusinessQuotaSourceProbe,
  BusinessQuotaSourceProbeSchema,
  type ForbiddenPathProbe,
  ForbiddenPathProbeSchema,
  type ForbiddenPathProbeKind,
  type ForbiddenPathProbeStatus,
  type LocalCapabilityProbe,
  LocalCapabilityProbeSchema,
  type LocalCapabilityProbeKind,
  type QuotaEvidenceMatrix,
  type QuotaEvidenceMatrixField,
  QuotaEvidenceMatrixSchema,
  type QuotaReadinessDebugDecision,
  type QuotaReadinessDebugReport,
  QuotaReadinessDebugReportSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

export interface BusinessQuotaSourceProbeInput {
  sourceKind: BusinessQuotaSourceKind;
  status?: BusinessQuotaProbeStatus;
  priority?: number;
  stabilityScore?: number;
  fieldCount?: number;
  readableFieldCount?: number;
  sourceRefSeed?: string;
  candidateOnly?: boolean;
  blockReasons?: readonly string[];
  humanCheckpointKind?: BusinessQuotaSourceProbe['humanCheckpointKind'];
  summary?: string;
  now?: () => string;
}

export interface BusinessQuotaPermissionProbeInput {
  role: BusinessQuotaPermissionRole;
  status?: BusinessQuotaProbeStatus;
  workspaceSeed?: string;
  accountSeed?: string;
  roleDeclaredByHuman?: boolean;
  roleObservedByMetadata?: boolean;
  blockReasons?: readonly string[];
  humanCheckpointKind?: BusinessQuotaPermissionProbe['humanCheckpointKind'];
  summary?: string;
  now?: () => string;
}

export interface LocalCapabilityProbeInput {
  capabilityKind: LocalCapabilityProbeKind;
  status?: BusinessQuotaProbeStatus;
  fixtureOnly?: boolean;
  liveReadAvailable?: boolean;
  storeProjectionAvailable?: boolean;
  supervisorProjectionAvailable?: boolean;
  cdpLoopbackOnly?: boolean;
  cdpAllowedCommandCount?: number;
  appServerMethodCount?: number;
  blockReasons?: readonly string[];
  summary?: string;
  now?: () => string;
}

export interface ForbiddenPathProbeInput {
  pathKind: ForbiddenPathProbeKind;
  status?: ForbiddenPathProbeStatus;
  enforcementSeed?: string;
  summary?: string;
  now?: () => string;
}

export interface QuotaEvidenceMatrixInput {
  fields?: readonly QuotaEvidenceMatrixFieldInput[];
  matrixSeed?: string;
  summary?: string;
  now?: () => string;
}

export interface QuotaEvidenceMatrixFieldInput {
  fieldKeySeed: string;
  sourceKind: BusinessQuotaSourceKind;
  sensitivity: QuotaEvidenceMatrixField['sensitivity'];
  hashPolicy: string;
  persistedAs: QuotaEvidenceMatrixField['persistedAs'];
  allowed: boolean;
  summary: string;
}

export interface QuotaReadinessDebugReportInput {
  sourceProbes: readonly BusinessQuotaSourceProbe[];
  permissionProbes: readonly BusinessQuotaPermissionProbe[];
  localCapabilityProbes: readonly LocalCapabilityProbe[];
  forbiddenPathProbes: readonly ForbiddenPathProbe[];
  matrix?: QuotaEvidenceMatrix;
  liveReadReady?: boolean;
  reportSeed?: string;
  summary?: string;
  now?: () => string;
}

export interface BusinessQuotaDebugBundleInput {
  role?: BusinessQuotaPermissionRole;
  roleDeclaredByHuman?: boolean;
  appServerLiveReadAvailable?: boolean;
  includeOfficialApiCandidate?: boolean;
  now?: () => string;
}

export interface BusinessQuotaDebugBundle {
  sourceProbes: BusinessQuotaSourceProbe[];
  permissionProbes: BusinessQuotaPermissionProbe[];
  localCapabilityProbes: LocalCapabilityProbe[];
  forbiddenPathProbes: ForbiddenPathProbe[];
  evidenceMatrix: QuotaEvidenceMatrix;
  report: QuotaReadinessDebugReport;
}

const sourceDefaults: Record<
  BusinessQuotaSourceKind,
  { priority: number; stabilityScore: number; fieldCount: number; readableFieldCount: number }
> = {
  'app-server-rate-limits': {
    priority: 1,
    stabilityScore: 90,
    fieldCount: 4,
    readableFieldCount: 3,
  },
  'official-api': { priority: 2, stabilityScore: 80, fieldCount: 0, readableFieldCount: 0 },
  'enterprise-analytics': { priority: 3, stabilityScore: 75, fieldCount: 0, readableFieldCount: 0 },
  'business-credits': { priority: 4, stabilityScore: 65, fieldCount: 3, readableFieldCount: 2 },
  'business-page-dom': { priority: 5, stabilityScore: 55, fieldCount: 2, readableFieldCount: 1 },
  'browser-cdp-dom': { priority: 6, stabilityScore: 50, fieldCount: 2, readableFieldCount: 1 },
  'electron-renderer-dom': { priority: 7, stabilityScore: 50, fieldCount: 2, readableFieldCount: 1 },
  'codex-desktop-ui': { priority: 8, stabilityScore: 45, fieldCount: 2, readableFieldCount: 1 },
  'redacted-export': { priority: 9, stabilityScore: 45, fieldCount: 2, readableFieldCount: 1 },
  'manual-export': { priority: 10, stabilityScore: 45, fieldCount: 2, readableFieldCount: 1 },
  'manual-observation': { priority: 11, stabilityScore: 30, fieldCount: 1, readableFieldCount: 0 },
  'ui-reference-only': { priority: 12, stabilityScore: 15, fieldCount: 0, readableFieldCount: 0 },
  unknown: { priority: 13, stabilityScore: 0, fieldCount: 0, readableFieldCount: 0 },
};

const defaultForbiddenPathKinds: readonly ForbiddenPathProbeKind[] = [
  'browser_storage',
  'runtime_eval',
  'dom_scrape',
  'click_type',
  'network_body',
  'credential_material',
  'login_automation',
  'account_mutation',
  'raw_identity',
  'raw_path',
  'raw_body',
];

const defaultMatrixFields: readonly QuotaEvidenceMatrixFieldInput[] = [
  {
    fieldKeySeed: 'quota-status',
    sourceKind: 'app-server-rate-limits',
    sensitivity: 'status-only',
    hashPolicy: 'persist status enum only',
    persistedAs: 'status',
    allowed: true,
    summary: 'Quota status can be stored as metadata.',
  },
  {
    fieldKeySeed: 'quota-remaining-count',
    sourceKind: 'app-server-rate-limits',
    sensitivity: 'count-only',
    hashPolicy: 'persist aggregate count only when read-only source provides it',
    persistedAs: 'count',
    allowed: true,
    summary: 'Remaining quota can be stored as a count without identity material.',
  },
  {
    fieldKeySeed: 'quota-reset-marker',
    sourceKind: 'app-server-rate-limits',
    sensitivity: 'hash-only',
    hashPolicy: 'persist reset marker hash only',
    persistedAs: 'hash',
    allowed: true,
    summary: 'Reset markers are hash-only metadata.',
  },
  {
    fieldKeySeed: 'workspace-credit-count',
    sourceKind: 'business-credits',
    sensitivity: 'count-only',
    hashPolicy: 'persist workspace aggregate count only when authorized',
    persistedAs: 'count',
    allowed: true,
    summary: 'Workspace credit totals are count-only when permission allows.',
  },
  {
    fieldKeySeed: 'member-identity-material',
    sourceKind: 'manual-export',
    sensitivity: 'forbidden',
    hashPolicy: 'do not persist',
    persistedAs: 'not_persisted',
    allowed: false,
    summary: 'Member identity material is out of scope for machine storage.',
  },
  {
    fieldKeySeed: 'request-or-response-body',
    sourceKind: 'unknown',
    sensitivity: 'forbidden',
    hashPolicy: 'do not persist',
    persistedAs: 'not_persisted',
    allowed: false,
    summary: 'Transport bodies are never stored by M61 debug records.',
  },
];

export function createBusinessQuotaSourceProbe(
  input: BusinessQuotaSourceProbeInput,
): BusinessQuotaSourceProbe {
  const defaults = sourceDefaults[input.sourceKind];
  const now = input.now ?? foundationTimestamp;
  const status = input.status ?? defaultSourceStatus(input.sourceKind);
  const blockReasons = [...(input.blockReasons ?? defaultSourceBlockReasons(input.sourceKind, status))];

  return BusinessQuotaSourceProbeSchema.parse({
    id: foundationId('business_quota_source_probe'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: now(),
    sourceKind: input.sourceKind,
    status,
    priority: input.priority ?? defaults.priority,
    stabilityScore: input.stabilityScore ?? defaults.stabilityScore,
    fieldCount: input.fieldCount ?? defaults.fieldCount,
    readableFieldCount: input.readableFieldCount ?? defaults.readableFieldCount,
    sourceRefHash: input.sourceRefSeed ? hashText(input.sourceRefSeed) : undefined,
    hashPolicy: 'hash ids, summarize fields, persist counts and status only',
    candidateOnly: input.candidateOnly ?? status !== 'ready',
    blockReasons,
    humanCheckpointKind: input.humanCheckpointKind,
    summary: input.summary ?? defaultSourceSummary(input.sourceKind, status),
  });
}

export function createBusinessQuotaPermissionProbe(
  input: BusinessQuotaPermissionProbeInput,
): BusinessQuotaPermissionProbe {
  const now = input.now ?? foundationTimestamp;
  const access = deriveRoleAccess(input.role);
  const status = input.status ?? derivePermissionStatus(input.role, access);
  const checkpoint =
    input.humanCheckpointKind ??
    (status === 'blocked' || status === 'unknown' ? 'manual_review_required' : undefined);
  const blockReasons = [
    ...(input.blockReasons ?? defaultPermissionBlockReasons(input.role, status)),
  ];

  return BusinessQuotaPermissionProbeSchema.parse({
    id: foundationId('business_quota_permission_probe'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: now(),
    role: input.role,
    status,
    workspaceHash: input.workspaceSeed ? hashText(input.workspaceSeed) : undefined,
    accountHash: input.accountSeed ? hashText(input.accountSeed) : undefined,
    canReadOwnQuota: access.canReadOwnQuota,
    canReadWorkspaceQuota: access.canReadWorkspaceQuota,
    canReadMemberQuota: access.canReadMemberQuota,
    canReadSeatState: access.canReadSeatState,
    roleDeclaredByHuman: input.roleDeclaredByHuman ?? false,
    roleObservedByMetadata: input.roleObservedByMetadata ?? false,
    humanCheckpointKind: checkpoint,
    blockReasons,
    summary:
      input.summary ??
      `Role ${input.role} has ${status} quota permission readiness as metadata-only evidence.`,
  });
}

export function createLocalCapabilityProbe(input: LocalCapabilityProbeInput): LocalCapabilityProbe {
  const now = input.now ?? foundationTimestamp;
  const status = input.status ?? defaultLocalCapabilityStatus(input);
  const blockReasons = [
    ...(input.blockReasons ?? defaultLocalCapabilityBlockReasons(input.capabilityKind, status)),
  ];

  return LocalCapabilityProbeSchema.parse({
    id: foundationId('local_capability_probe'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: now(),
    capabilityKind: input.capabilityKind,
    status,
    fixtureOnly: input.fixtureOnly ?? input.capabilityKind === 'chatgpt-business-adapter',
    liveReadAvailable: input.liveReadAvailable ?? false,
    storeProjectionAvailable: input.storeProjectionAvailable ?? false,
    supervisorProjectionAvailable: input.supervisorProjectionAvailable ?? false,
    cdpLoopbackOnly: input.cdpLoopbackOnly ?? true,
    cdpAllowedCommandCount: input.cdpAllowedCommandCount ?? 0,
    appServerMethodCount: input.appServerMethodCount ?? 0,
    blockReasons,
    summary:
      input.summary ??
      `${input.capabilityKind} contributes read-only metadata readiness with direct adapter authority disabled.`,
  });
}

export function createForbiddenPathProbe(input: ForbiddenPathProbeInput): ForbiddenPathProbe {
  const now = input.now ?? foundationTimestamp;
  const status = input.status ?? 'blocked';

  return ForbiddenPathProbeSchema.parse({
    id: foundationId('forbidden_path_probe'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: now(),
    pathKind: input.pathKind,
    status,
    enforcementHash: hashText(input.enforcementSeed ?? `m61:${input.pathKind}:${status}`),
    summary:
      input.summary ??
      `${input.pathKind} is ${status} for M61 quota readiness debug and never collected.`,
  });
}

export function createQuotaEvidenceMatrix(input: QuotaEvidenceMatrixInput = {}): QuotaEvidenceMatrix {
  const now = input.now ?? foundationTimestamp;
  const fields = (input.fields ?? defaultMatrixFields).map((field) => ({
    fieldKeyHash: hashText(field.fieldKeySeed),
    sourceKind: field.sourceKind,
    sensitivity: field.sensitivity,
    hashPolicy: field.hashPolicy,
    persistedAs: field.persistedAs,
    allowed: field.allowed,
    summary: field.summary,
  }));
  const forbiddenFieldCount = fields.filter((field) => !field.allowed).length;

  return QuotaEvidenceMatrixSchema.parse({
    id: foundationId('quota_evidence_matrix'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    matrixHash: hashText(input.matrixSeed ?? fields.map((field) => field.fieldKeyHash).join('|')),
    fieldCount: fields.length,
    allowedFieldCount: fields.length - forbiddenFieldCount,
    forbiddenFieldCount,
    fields,
    summary:
      input.summary ??
      'M61 quota evidence matrix permits status, count, hash, and summary projections only.',
  });
}

export function createQuotaReadinessDebugReport(
  input: QuotaReadinessDebugReportInput,
): QuotaReadinessDebugReport {
  const now = input.now ?? foundationTimestamp;
  const sortedReadySources = [...input.sourceProbes]
    .filter((probe) => probe.status === 'ready')
    .sort((left, right) => left.priority - right.priority);
  const recommendedSourceKind = sortedReadySources[0]?.sourceKind ?? 'unknown';
  const humanCheckpointCount = [
    ...input.sourceProbes.map((probe) => probe.humanCheckpointKind),
    ...input.permissionProbes.map((probe) => probe.humanCheckpointKind),
  ].filter(Boolean).length;
  const status = deriveReportDecision({
    recommendedSourceKind,
    permissions: input.permissionProbes,
    capabilities: input.localCapabilityProbes,
    forbiddenPathProbes: input.forbiddenPathProbes,
    liveReadReady: input.liveReadReady ?? false,
  });

  return QuotaReadinessDebugReportSchema.parse({
    id: foundationId('quota_readiness_debug_report'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    reportHash: hashText(
      input.reportSeed ??
        [
          recommendedSourceKind,
          status,
          input.sourceProbes.length,
          input.permissionProbes.length,
          input.localCapabilityProbes.length,
          input.forbiddenPathProbes.length,
        ].join('|'),
    ),
    status,
    recommendedSourceKind,
    sourceProbeIds: input.sourceProbes.map((probe) => probe.id),
    permissionProbeIds: input.permissionProbes.map((probe) => probe.id),
    localCapabilityProbeIds: input.localCapabilityProbes.map((probe) => probe.id),
    forbiddenPathProbeIds: input.forbiddenPathProbes.map((probe) => probe.id),
    matrixId: input.matrix?.id,
    sourceProbeCount: input.sourceProbes.length,
    permissionProbeCount: input.permissionProbes.length,
    localCapabilityProbeCount: input.localCapabilityProbes.length,
    forbiddenPathProbeCount: input.forbiddenPathProbes.length,
    humanCheckpointCount,
    goNoGoReasonHash: hashText(deriveReportReason(status, recommendedSourceKind)),
    liveReadReady: input.liveReadReady ?? false,
    adapterActivationRecommended: status === 'needs_adapter',
    summary:
      input.summary ??
      `Business quota readiness debug decision is ${status} with ${recommendedSourceKind} as the recommended source.`,
  });
}

export function createDefaultBusinessQuotaDebugBundle(
  input: BusinessQuotaDebugBundleInput = {},
): BusinessQuotaDebugBundle {
  const now = input.now ?? foundationTimestamp;
  const sourceProbes = [
    createBusinessQuotaSourceProbe({
      sourceKind: 'app-server-rate-limits',
      status: 'ready',
      candidateOnly: false,
      now,
    }),
    createBusinessQuotaSourceProbe({
      sourceKind: 'official-api',
      status: input.includeOfficialApiCandidate ? 'unknown' : 'unavailable',
      blockReasons: ['official source not integrated in this debug round'],
      now,
    }),
    createBusinessQuotaSourceProbe({
      sourceKind: 'enterprise-analytics',
      status: 'unknown',
      humanCheckpointKind: 'manual_review_required',
      blockReasons: ['analytics entitlement must be confirmed by role metadata or human declaration'],
      now,
    }),
    createBusinessQuotaSourceProbe({
      sourceKind: 'business-credits',
      status: 'unknown',
      humanCheckpointKind: 'manual_review_required',
      blockReasons: ['workspace credit page is not a machine data source in M61'],
      now,
    }),
    createBusinessQuotaSourceProbe({
      sourceKind: 'manual-export',
      status: 'blocked',
      blockReasons: ['manual exports require redaction before any future import'],
      now,
    }),
    createBusinessQuotaSourceProbe({
      sourceKind: 'ui-reference-only',
      status: 'blocked',
      blockReasons: ['UI pages are human reference only and not scraped'],
      now,
    }),
  ];
  const permissionProbes = [
    createBusinessQuotaPermissionProbe({
      role: input.role ?? 'unknown',
      roleDeclaredByHuman: input.roleDeclaredByHuman ?? false,
      workspaceSeed: 'business-workspace',
      accountSeed: 'current-account',
      now,
    }),
  ];
  const localCapabilityProbes = [
    createLocalCapabilityProbe({
      capabilityKind: 'codex-app-server',
      status: 'ready',
      liveReadAvailable: input.appServerLiveReadAvailable ?? false,
      storeProjectionAvailable: true,
      supervisorProjectionAvailable: true,
      appServerMethodCount: 2,
      now,
    }),
    createLocalCapabilityProbe({
      capabilityKind: 'codex-desktop-cdp',
      status: 'ready',
      cdpAllowedCommandCount: 2,
      now,
    }),
    createLocalCapabilityProbe({
      capabilityKind: 'store',
      status: 'ready',
      storeProjectionAvailable: true,
      now,
    }),
    createLocalCapabilityProbe({
      capabilityKind: 'supervisor',
      status: 'ready',
      supervisorProjectionAvailable: true,
      now,
    }),
    createLocalCapabilityProbe({
      capabilityKind: 'profile-registry',
      status: 'ready',
      storeProjectionAvailable: true,
      now,
    }),
    createLocalCapabilityProbe({
      capabilityKind: 'chatgpt-business-adapter',
      status: 'blocked',
      fixtureOnly: true,
      blockReasons: ['business adapter remains fixture-only for M61'],
      now,
    }),
  ];
  const forbiddenPathProbes = defaultForbiddenPathKinds.map((pathKind) =>
    createForbiddenPathProbe({ pathKind, now }),
  );
  const evidenceMatrix = createQuotaEvidenceMatrix({ now });
  const report = createQuotaReadinessDebugReport({
    sourceProbes,
    permissionProbes,
    localCapabilityProbes,
    forbiddenPathProbes,
    matrix: evidenceMatrix,
    liveReadReady: false,
    now,
  });

  return {
    sourceProbes,
    permissionProbes,
    localCapabilityProbes,
    forbiddenPathProbes,
    evidenceMatrix,
    report,
  };
}

function defaultSourceStatus(sourceKind: BusinessQuotaSourceKind): BusinessQuotaProbeStatus {
  if (sourceKind === 'app-server-rate-limits') {
    return 'ready';
  }
  if (sourceKind === 'manual-export' || sourceKind === 'ui-reference-only') {
    return 'blocked';
  }
  if (sourceKind === 'unknown') {
    return 'unknown';
  }
  return 'unknown';
}

function defaultSourceSummary(
  sourceKind: BusinessQuotaSourceKind,
  status: BusinessQuotaProbeStatus,
): string {
  return `${sourceKind} quota source probe is ${status} and stores only field counts, hashes, and summaries.`;
}

function defaultSourceBlockReasons(
  sourceKind: BusinessQuotaSourceKind,
  status: BusinessQuotaProbeStatus,
): string[] {
  if (status !== 'blocked') {
    return [];
  }
  if (sourceKind === 'ui-reference-only') {
    return ['UI quota evidence is human reference only'];
  }
  return ['source is not approved for automated ingestion'];
}

function deriveRoleAccess(role: BusinessQuotaPermissionRole) {
  if (role === 'owner' || role === 'admin') {
    return {
      canReadOwnQuota: true,
      canReadWorkspaceQuota: true,
      canReadMemberQuota: true,
      canReadSeatState: true,
    };
  }
  if (role === 'analytics_viewer') {
    return {
      canReadOwnQuota: true,
      canReadWorkspaceQuota: true,
      canReadMemberQuota: false,
      canReadSeatState: false,
    };
  }
  if (role === 'member') {
    return {
      canReadOwnQuota: true,
      canReadWorkspaceQuota: false,
      canReadMemberQuota: false,
      canReadSeatState: false,
    };
  }
  return {
    canReadOwnQuota: false,
    canReadWorkspaceQuota: false,
    canReadMemberQuota: false,
    canReadSeatState: false,
  };
}

function derivePermissionStatus(
  role: BusinessQuotaPermissionRole,
  access: ReturnType<typeof deriveRoleAccess>,
): BusinessQuotaProbeStatus {
  if (role === 'unknown') {
    return 'unknown';
  }
  if (!access.canReadWorkspaceQuota) {
    return 'blocked';
  }
  return 'ready';
}

function defaultPermissionBlockReasons(
  role: BusinessQuotaPermissionRole,
  status: BusinessQuotaProbeStatus,
): string[] {
  if (status === 'ready') {
    return [];
  }
  if (role === 'member') {
    return ['member role can only confirm own quota metadata'];
  }
  return ['workspace role must be confirmed before live quota read'];
}

function defaultLocalCapabilityStatus(input: LocalCapabilityProbeInput): BusinessQuotaProbeStatus {
  if (input.status) {
    return input.status;
  }
  if (input.fixtureOnly) {
    return 'blocked';
  }
  return 'ready';
}

function defaultLocalCapabilityBlockReasons(
  capabilityKind: LocalCapabilityProbeKind,
  status: BusinessQuotaProbeStatus,
): string[] {
  if (status !== 'blocked') {
    return [];
  }
  if (capabilityKind === 'chatgpt-business-adapter') {
    return ['business adapter is fixture-only in M61'];
  }
  return ['capability is not enabled for quota readiness debug'];
}

function deriveReportDecision(input: {
  recommendedSourceKind: BusinessQuotaSourceKind;
  permissions: readonly BusinessQuotaPermissionProbe[];
  capabilities: readonly LocalCapabilityProbe[];
  forbiddenPathProbes: readonly ForbiddenPathProbe[];
  liveReadReady: boolean;
}): QuotaReadinessDebugDecision {
  if (input.recommendedSourceKind === 'unknown') {
    return 'no_go';
  }
  if (input.permissions.some((probe) => probe.status === 'unknown' || probe.status === 'blocked')) {
    return 'manual_checkpoint';
  }
  if (input.capabilities.some((probe) => probe.status === 'blocked' || probe.status === 'unavailable')) {
    return 'needs_adapter';
  }
  if (input.forbiddenPathProbes.some((probe) => probe.status !== 'blocked' && probe.status !== 'verified_absent')) {
    return 'no_go';
  }
  return input.liveReadReady ? 'go' : 'needs_adapter';
}

function deriveReportReason(
  status: QuotaReadinessDebugDecision,
  sourceKind: BusinessQuotaSourceKind,
): string {
  return `m61:${status}:${sourceKind}:read-only-metadata`;
}
