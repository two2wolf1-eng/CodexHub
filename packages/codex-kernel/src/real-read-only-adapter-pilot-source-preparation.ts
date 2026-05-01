import type {
  AuditEvent,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationBlocker,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationChecklistItem,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationFinding,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationGate,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationQuery,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationStatus,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationSummary,
  EvidenceRef,
  RiskLevel,
} from '@codexhub/contracts';
import { SchemaVersionSchema, foundationId, foundationTimestamp } from '@codexhub/contracts';
import { createEvidenceRef, hashText } from '@codexhub/evidence-kernel';

type JsonMetadata = Record<string, unknown>;

export interface CodexExecRealReadOnlyAdapterPilotSourcePreparationInput {
  dryRunId: string;
  authoritative?: boolean;
  supervisorBacked?: boolean;
  persisted?: boolean;
  degraded?: boolean;
  notPersisted?: boolean;
  dryRunRecordPresent?: boolean;
  configExplicitlyEnabled?: boolean;
  authoritativePolicySourcePresent?: boolean;
  validUnusedApprovalPresent?: boolean;
  approvalArtifactId?: string;
  approvalArtifactHash?: string;
  dryRunPlanHash?: string;
  policyDecisionHash?: string;
  isolatedCleanWorktreeMetadataPresent?: boolean;
  worktreeLabel?: string;
  worktreeStatus?: 'clean' | 'dirty' | 'missing' | 'unknown';
  worktreePathHash?: string;
  evidenceAuditReady?: boolean;
  fallbackUsedAsAuthority?: boolean;
  evidenceRefs?: EvidenceRef[];
  auditEventIds?: string[];
  metadata?: JsonMetadata;
}

const pilotSourcePreparationFlags = {
  liveExecution: false,
  externalProcessStarted: false,
  executionDisabled: true,
  processAdapterStarted: false,
  processAdapterApproved: false,
  implementationApproved: false,
  recommendationGrantsExecution: false,
  workspaceWriteAllowed: false,
  dangerFullAccessAllowed: false,
  dashboardTriggerAllowed: false,
  metadataOnly: true,
  bodyStored: false,
  promptBodyStored: false,
  commandBodyStored: false,
  stdoutBodyStored: false,
  stderrBodyStored: false,
  agentMessageBodyStored: false,
  reasoningBodyStored: false,
} as const;

export function buildRealReadOnlyAdapterPilotSourcePreparationRecord(
  input: CodexExecRealReadOnlyAdapterPilotSourcePreparationInput,
): CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord {
  const degraded = input.degraded === true;
  const notPersisted = input.notPersisted === true;
  const authoritative = input.authoritative === true;
  const supervisorBacked = input.supervisorBacked === true;
  const persisted = input.persisted === true;
  const fallbackUsedAsAuthority = input.fallbackUsedAsAuthority === true;
  const dryRunRecordPresent = input.dryRunRecordPresent === true;
  const configExplicitlyEnabled = input.configExplicitlyEnabled === true;
  const authoritativePolicySourcePresent = input.authoritativePolicySourcePresent === true;
  const validUnusedApprovalPresent = input.validUnusedApprovalPresent === true;
  const isolatedCleanWorktreeMetadataPresent =
    input.isolatedCleanWorktreeMetadataPresent === true;
  const evidenceAuditReady = input.evidenceAuditReady === true;
  const gates = createPilotSourcePreparationGates({
    dryRunId: input.dryRunId,
    authoritative,
    supervisorBacked,
    persisted,
    degraded,
    notPersisted,
    fallbackUsedAsAuthority,
    dryRunRecordPresent,
    configExplicitlyEnabled,
    authoritativePolicySourcePresent,
    validUnusedApprovalPresent,
    isolatedCleanWorktreeMetadataPresent,
    evidenceAuditReady,
    metadata: input.metadata,
  });
  const hardGates = gates.filter((gate) => gate.required);
  const blockedHardGates = hardGates.filter((gate) => gate.status === 'blocked');
  const requiresReviewGates = gates.filter((gate) => gate.status === 'requires_review');
  const status: CodexExecRealReadOnlyAdapterPilotSourcePreparationStatus =
    blockedHardGates.length > 0
      ? 'blocked'
      : requiresReviewGates.length > 0
        ? 'requires_review'
        : 'prepared';
  const blockers = blockedHardGates.map((gate) =>
    createPilotSourcePreparationBlocker({
      dryRunId: input.dryRunId,
      gate,
      severity: gate.code === 'source_persisted_authoritative' ? 'critical' : 'high',
      metadata: input.metadata,
    }),
  );
  const findings = requiresReviewGates.map((gate) =>
    createPilotSourcePreparationFinding({
      dryRunId: input.dryRunId,
      gate,
      metadata: input.metadata,
    }),
  );
  const missingSources = blockedHardGates.map((gate) => gate.code);
  const evidenceRefs = input.evidenceRefs ?? [];
  const auditEventIds = input.auditEventIds ?? [];

  return {
    id: foundationId('codex_real_read_only_adapter_pilot_source_preparation'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...pilotSourcePreparationFlags,
    dryRunId: input.dryRunId,
    status,
    recommendation:
      status === 'prepared'
        ? 'Pilot retry source inputs are prepared for a separate prerequisite check; this does not run a pilot.'
        : 'Pilot retry source preparation remains blocked until missing source evidence is present.',
    gates,
    blockers,
    findings,
    checklistItems: gates.map((gate) => createPilotSourcePreparationChecklistItem(gate)),
    hardGateCount: hardGates.length,
    passedGateCount: gates.filter((gate) => gate.status === 'passed').length,
    blockedGateCount: blockedHardGates.length,
    requiresReviewFindingCount: findings.length,
    missingSources,
    degraded,
    notPersisted,
    dryRunRecordPresent,
    configExplicitlyEnabled,
    authoritativePolicySourcePresent,
    validUnusedApprovalPresent,
    approvalArtifactId: input.approvalArtifactId,
    approvalArtifactHash: input.approvalArtifactHash,
    dryRunPlanHash: input.dryRunPlanHash,
    policyDecisionHash: input.policyDecisionHash,
    isolatedCleanWorktreeMetadataPresent,
    worktreeLabel: input.worktreeLabel,
    worktreeStatus: input.worktreeStatus,
    worktreePathHash: input.worktreePathHash,
    evidenceAuditReady,
    fallbackUsedAsAuthority: false,
    pilotExecuted: false,
    adapterAttemptInvoked: false,
    authoritative,
    supervisorBacked,
    persisted,
    evidenceRefs,
    auditEventIds,
    summary:
      status === 'prepared'
        ? 'Pilot prerequisite source preparation is authoritative, persisted, and metadata-only.'
        : 'Pilot prerequisite source preparation records missing source gates without executing an adapter attempt.',
    metadata: createPilotSourcePreparationMetadata({
      ...(input.metadata ?? {}),
      dryRunId: input.dryRunId,
      status,
      missingSourceCount: missingSources.length,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      worktreePathStored: false,
      source: 'codex-kernel.real-read-only-adapter.pilot-source-preparation-record',
    }),
  };
}

export function summarizeRealReadOnlyAdapterPilotSourcePreparationRecord(
  record: CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord,
): CodexExecRealReadOnlyAdapterPilotSourcePreparationSummary {
  return {
    id: foundationId('codex_real_read_only_adapter_pilot_source_preparation_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...pilotSourcePreparationFlags,
    recordId: record.id,
    dryRunId: record.dryRunId,
    status: record.status,
    hardGateCount: record.hardGateCount,
    passedGateCount: record.passedGateCount,
    blockedGateCount: record.blockedGateCount,
    requiresReviewFindingCount: record.requiresReviewFindingCount,
    missingSources: record.missingSources,
    degraded: record.degraded,
    notPersisted: record.notPersisted,
    dryRunRecordPresent: record.dryRunRecordPresent,
    configExplicitlyEnabled: record.configExplicitlyEnabled,
    authoritativePolicySourcePresent: record.authoritativePolicySourcePresent,
    validUnusedApprovalPresent: record.validUnusedApprovalPresent,
    isolatedCleanWorktreeMetadataPresent: record.isolatedCleanWorktreeMetadataPresent,
    evidenceAuditReady: record.evidenceAuditReady,
    fallbackUsedAsAuthority: false,
    pilotExecuted: false,
    adapterAttemptInvoked: false,
    recommendation: record.recommendation,
    summary: record.summary,
    metadata: createPilotSourcePreparationMetadata({
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      source: 'codex-kernel.real-read-only-adapter.pilot-source-preparation-summary',
    }),
  };
}

export function listRealReadOnlyAdapterPilotSourcePreparationSummaries(
  records: CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord[],
  query: Partial<CodexExecRealReadOnlyAdapterPilotSourcePreparationQuery> = {},
): CodexExecRealReadOnlyAdapterPilotSourcePreparationSummary[] {
  const limit = query.limit ?? 50;
  return records
    .filter((record) => (query.dryRunId === undefined ? true : record.dryRunId === query.dryRunId))
    .filter((record) => (query.status === undefined ? true : record.status === query.status))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit)
    .map((record) => summarizeRealReadOnlyAdapterPilotSourcePreparationRecord(record));
}

export function getLatestRealReadOnlyAdapterPilotSourcePreparation(
  records: CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord[],
  dryRunId: string,
): CodexExecRealReadOnlyAdapterPilotSourcePreparationSummary | undefined {
  return listRealReadOnlyAdapterPilotSourcePreparationSummaries(records, { dryRunId, limit: 1 })[0];
}

export function createRealReadOnlyAdapterPilotSourcePreparationEvidenceRefs(
  record: CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord,
): EvidenceRef[] {
  return [
    createEvidenceRef({
      kind: 'hash',
      label: 'codex.real_read_only_adapter.pilot_source_preparation',
      summary: `Pilot prerequisite source preparation ${record.status}; metadata, hashes, counts, and refs only.`,
      metadata: createPilotSourcePreparationMetadata({
        recordId: record.id,
        dryRunId: record.dryRunId,
        status: record.status,
        hardGateCount: record.hardGateCount,
        passedGateCount: record.passedGateCount,
        blockedGateCount: record.blockedGateCount,
        source: 'codex-kernel.real-read-only-adapter.pilot-source-preparation-evidence',
      }),
      bodyForHashOnly: stableStringify({
        id: record.id,
        dryRunId: record.dryRunId,
        status: record.status,
        missingSources: record.missingSources,
        worktreeLabel: record.worktreeLabel,
        worktreeStatus: record.worktreeStatus,
        worktreePathHash: record.worktreePathHash,
      }),
    }),
  ];
}

export function createRealReadOnlyAdapterPilotSourcePreparationAuditEvents(
  record: CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord,
  evidenceRefs: EvidenceRef[] = record.evidenceRefs,
): AuditEvent[] {
  return [
    {
      id: foundationId('audit_codex_real_read_only_adapter_pilot_source_preparation'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      actor: 'codex-kernel.real-read-only-adapter',
      action: 'codex.exec.real_read_only_adapter.pilot_source_preparation_recorded',
      outcome: record.status,
      evidenceRefs,
      metadata: createPilotSourcePreparationMetadata({
        recordId: record.id,
        dryRunId: record.dryRunId,
        status: record.status,
        riskLevel: record.status === 'prepared' ? 'medium' : 'high',
        liveExecution: false,
        externalProcessStarted: false,
        pilotExecuted: false,
        adapterAttemptInvoked: false,
        source: 'codex-kernel.real-read-only-adapter.pilot-source-preparation-audit',
      }),
    },
  ];
}

function createPilotSourcePreparationGates(input: {
  dryRunId: string;
  authoritative: boolean;
  supervisorBacked: boolean;
  persisted: boolean;
  degraded: boolean;
  notPersisted: boolean;
  fallbackUsedAsAuthority: boolean;
  dryRunRecordPresent: boolean;
  configExplicitlyEnabled: boolean;
  authoritativePolicySourcePresent: boolean;
  validUnusedApprovalPresent: boolean;
  isolatedCleanWorktreeMetadataPresent: boolean;
  evidenceAuditReady: boolean;
  metadata?: JsonMetadata;
}): CodexExecRealReadOnlyAdapterPilotSourcePreparationGate[] {
  const persistedAuthority =
    input.authoritative &&
    input.supervisorBacked &&
    input.persisted &&
    !input.degraded &&
    !input.notPersisted &&
    !input.fallbackUsedAsAuthority;
  const gateInputs: Array<{
    code: string;
    label: string;
    category: CodexExecRealReadOnlyAdapterPilotSourcePreparationGate['category'];
    passed: boolean;
    required: boolean;
    blockedSummary: string;
    passedSummary: string;
  }> = [
    {
      code: 'source_persisted_authoritative',
      label: 'Persisted authoritative source',
      category: 'authority',
      passed: persistedAuthority,
      required: true,
      blockedSummary:
        'A degraded fallback, local-only summary, or non-persisted object cannot prepare pilot retry sources.',
      passedSummary: 'Supervisor-backed persisted source preparation is authoritative.',
    },
    {
      code: 'dry_run_record_present',
      label: 'Existing dry-run record',
      category: 'dry_run',
      passed: input.dryRunRecordPresent,
      required: true,
      blockedSummary: 'A persisted dry-run record must exist before pilot source preparation.',
      passedSummary: 'Existing dry-run record metadata is present.',
    },
    {
      code: 'config_explicitly_enabled',
      label: 'Config explicitly enabled',
      category: 'config',
      passed: input.configExplicitlyEnabled,
      required: true,
      blockedSummary: 'Explicit read-only adapter config enablement is not present.',
      passedSummary: 'Explicit config enablement metadata is present.',
    },
    {
      code: 'authoritative_policy_source',
      label: 'Authoritative policy source',
      category: 'policy',
      passed: input.authoritativePolicySourcePresent,
      required: true,
      blockedSummary:
        'Latest persisted read-only adapter policy source must be aligned before source preparation.',
      passedSummary: 'Latest persisted read-only adapter policy source is aligned.',
    },
    {
      code: 'valid_unused_approval',
      label: 'Valid unused approval artifact',
      category: 'approval',
      passed: input.validUnusedApprovalPresent,
      required: true,
      blockedSummary: 'A valid unused approval artifact is not present.',
      passedSummary: 'Valid unused approval artifact metadata is present.',
    },
    {
      code: 'isolated_clean_worktree_metadata',
      label: 'Isolated clean worktree metadata',
      category: 'worktree',
      passed: input.isolatedCleanWorktreeMetadataPresent,
      required: true,
      blockedSummary:
        'Existing isolated clean worktree metadata must be present without storing a raw absolute path.',
      passedSummary: 'Isolated clean worktree metadata is present as label/hash/status only.',
    },
    {
      code: 'evidence_audit_ready',
      label: 'Evidence and audit stores ready',
      category: 'evidence_audit',
      passed: input.evidenceAuditReady,
      required: true,
      blockedSummary: 'Evidence and audit readiness must be non-degraded.',
      passedSummary: 'Evidence and audit readiness metadata is non-degraded.',
    },
  ];

  return gateInputs.map((gate) =>
    createPilotSourcePreparationGate({
      dryRunId: input.dryRunId,
      code: gate.code,
      label: gate.label,
      category: gate.category,
      status: gate.passed ? 'passed' : 'blocked',
      required: gate.required,
      summary: gate.passed ? gate.passedSummary : gate.blockedSummary,
      metadata: input.metadata,
    }),
  );
}

function createPilotSourcePreparationGate(input: {
  dryRunId: string;
  code: string;
  label: string;
  category: CodexExecRealReadOnlyAdapterPilotSourcePreparationGate['category'];
  status: CodexExecRealReadOnlyAdapterPilotSourcePreparationGate['status'];
  required: boolean;
  summary: string;
  metadata?: JsonMetadata;
}): CodexExecRealReadOnlyAdapterPilotSourcePreparationGate {
  return {
    id: foundationId('codex_real_read_only_adapter_pilot_source_preparation_gate'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...pilotSourcePreparationFlags,
    code: input.code,
    label: input.label,
    category: input.category,
    status: input.status,
    required: input.required,
    summary: input.summary,
    metadata: createPilotSourcePreparationMetadata({
      ...(input.metadata ?? {}),
      dryRunId: input.dryRunId,
      gateCode: input.code,
      source: 'codex-kernel.real-read-only-adapter.pilot-source-preparation-gate',
    }),
  };
}

function createPilotSourcePreparationBlocker(input: {
  dryRunId: string;
  gate: CodexExecRealReadOnlyAdapterPilotSourcePreparationGate;
  severity: RiskLevel;
  metadata?: JsonMetadata;
}): CodexExecRealReadOnlyAdapterPilotSourcePreparationBlocker {
  return {
    id: foundationId('codex_real_read_only_adapter_pilot_source_preparation_blocker'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...pilotSourcePreparationFlags,
    code: input.gate.code,
    severity: input.severity,
    relatedGateCode: input.gate.code,
    summary: input.gate.summary,
    recommendation: 'Prepare the missing authoritative source before considering 4F.2.',
    metadata: createPilotSourcePreparationMetadata({
      ...(input.metadata ?? {}),
      dryRunId: input.dryRunId,
      gateCode: input.gate.code,
      source: 'codex-kernel.real-read-only-adapter.pilot-source-preparation-blocker',
    }),
  };
}

function createPilotSourcePreparationFinding(input: {
  dryRunId: string;
  gate: CodexExecRealReadOnlyAdapterPilotSourcePreparationGate;
  metadata?: JsonMetadata;
}): CodexExecRealReadOnlyAdapterPilotSourcePreparationFinding {
  return {
    id: foundationId('codex_real_read_only_adapter_pilot_source_preparation_finding'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...pilotSourcePreparationFlags,
    code: input.gate.code,
    severity: 'medium',
    status: 'requires_review',
    relatedGateCode: input.gate.code,
    summary: input.gate.summary,
    recommendation: 'Review source-preparation metadata before considering 4F.2.',
    metadata: createPilotSourcePreparationMetadata({
      ...(input.metadata ?? {}),
      dryRunId: input.dryRunId,
      gateCode: input.gate.code,
      source: 'codex-kernel.real-read-only-adapter.pilot-source-preparation-finding',
    }),
  };
}

function createPilotSourcePreparationChecklistItem(
  gate: CodexExecRealReadOnlyAdapterPilotSourcePreparationGate,
): CodexExecRealReadOnlyAdapterPilotSourcePreparationChecklistItem {
  return {
    id: foundationId('codex_real_read_only_adapter_pilot_source_preparation_checklist'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...pilotSourcePreparationFlags,
    code: gate.code,
    label: gate.label,
    status: gate.status,
    required: gate.required,
    summary: gate.summary,
    metadata: createPilotSourcePreparationMetadata({
      gateCode: gate.code,
      source: 'codex-kernel.real-read-only-adapter.pilot-source-preparation-checklist',
    }),
  };
}

function createPilotSourcePreparationMetadata(extra: JsonMetadata): JsonMetadata {
  return {
    ...extra,
    metadataOnly: true,
    bodyStored: false,
    promptBodyStored: false,
    commandBodyStored: false,
    stdoutBodyStored: false,
    stderrBodyStored: false,
    agentMessageBodyStored: false,
    reasoningBodyStored: false,
    worktreePathStored: false,
    fallbackUsedAsAuthority: false,
    pilotExecuted: false,
    adapterAttemptInvoked: false,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
    dashboardTriggerAllowed: false,
  };
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const objectValue = value as Record<string, unknown>;
  return `{${Object.keys(objectValue)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key])}`)
    .join(',')}}`;
}

export function createRealReadOnlyAdapterPilotSourcePreparationMetadataHash(value: unknown): string {
  return hashText(stableStringify(value));
}
