import type {
  AuditEvent,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteBlocker,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteChecklistItem,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteFinding,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteGate,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteQuery,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteStatus,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteSummary,
  EvidenceRef,
  RiskLevel,
} from '@codexhub/contracts';
import { SchemaVersionSchema, foundationId, foundationTimestamp } from '@codexhub/contracts';
import { createEvidenceRef, hashText } from '@codexhub/evidence-kernel';

type JsonMetadata = Record<string, unknown>;

export interface CodexExecRealReadOnlyAdapterPilotPrerequisiteInput {
  dryRunId: string;
  authoritative?: boolean;
  supervisorBacked?: boolean;
  persisted?: boolean;
  degraded?: boolean;
  notPersisted?: boolean;
  dryRunRecordPresent?: boolean;
  configExplicitlyEnabled?: boolean;
  validUnusedApprovalPresent?: boolean;
  isolatedCleanWorktreeMetadataPresent?: boolean;
  authoritativePolicySourcePresent?: boolean;
  authoritativeSourcePreparationPresent?: boolean;
  authoritativeAttemptEvidencePresent?: boolean;
  evidenceAuditReady?: boolean;
  fallbackUsedAsAuthority?: boolean;
  handoffContextComplete?: boolean;
  worktreeLabel?: string;
  worktreeStatus?: 'clean' | 'dirty' | 'missing' | 'unknown';
  worktreePathHash?: string;
  evidenceRefs?: EvidenceRef[];
  auditEventIds?: string[];
  metadata?: JsonMetadata;
}

const pilotPrerequisiteFlags = {
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

export function buildRealReadOnlyAdapterPilotPrerequisiteRecord(
  input: CodexExecRealReadOnlyAdapterPilotPrerequisiteInput,
): CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord {
  const degraded = input.degraded === true;
  const notPersisted = input.notPersisted === true;
  const authoritative = input.authoritative === true;
  const supervisorBacked = input.supervisorBacked === true;
  const persisted = input.persisted === true;
  const fallbackUsedAsAuthority = input.fallbackUsedAsAuthority === true;
  const dryRunRecordPresent = input.dryRunRecordPresent === true;
  const configExplicitlyEnabled = input.configExplicitlyEnabled === true;
  const validUnusedApprovalPresent = input.validUnusedApprovalPresent === true;
  const isolatedCleanWorktreeMetadataPresent =
    input.isolatedCleanWorktreeMetadataPresent === true;
  const authoritativePolicySourcePresent = input.authoritativePolicySourcePresent === true;
  const authoritativeSourcePreparationPresent =
    input.authoritativeSourcePreparationPresent === true;
  const authoritativeAttemptEvidencePresent =
    input.authoritativeAttemptEvidencePresent === true;
  const evidenceAuditReady = input.evidenceAuditReady === true;
  const handoffContextComplete = input.handoffContextComplete !== false;
  const gates = createPilotPrerequisiteGates({
    dryRunId: input.dryRunId,
    authoritative,
    supervisorBacked,
    persisted,
    degraded,
    notPersisted,
    fallbackUsedAsAuthority,
    dryRunRecordPresent,
    configExplicitlyEnabled,
    validUnusedApprovalPresent,
    isolatedCleanWorktreeMetadataPresent,
    authoritativePolicySourcePresent,
    authoritativeSourcePreparationPresent,
    authoritativeAttemptEvidencePresent,
    evidenceAuditReady,
    handoffContextComplete,
    metadata: input.metadata,
  });
  const hardGates = gates.filter((gate) => gate.required);
  const blockedHardGates = hardGates.filter((gate) => gate.status === 'blocked');
  const requiresReviewGates = gates.filter((gate) => gate.status === 'requires_review');
  const status: CodexExecRealReadOnlyAdapterPilotPrerequisiteStatus =
    blockedHardGates.length > 0
      ? 'blocked'
      : requiresReviewGates.length > 0
        ? 'requires_review'
        : 'ready_for_pilot_retry';
  const blockers = blockedHardGates.map((gate) =>
    createPilotPrerequisiteBlocker({
      dryRunId: input.dryRunId,
      gate,
      severity: gate.code === 'source_persisted_authoritative' ? 'critical' : 'high',
      metadata: input.metadata,
    }),
  );
  const findings = requiresReviewGates.map((gate) =>
    createPilotPrerequisiteFinding({
      dryRunId: input.dryRunId,
      gate,
      metadata: input.metadata,
    }),
  );
  const missingPrerequisites = blockedHardGates.map((gate) => gate.code);
  const evidenceRefs = input.evidenceRefs ?? [];
  const auditEventIds = input.auditEventIds ?? [];

  return {
    id: foundationId('codex_real_read_only_adapter_pilot_prerequisite'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...pilotPrerequisiteFlags,
    dryRunId: input.dryRunId,
    status,
    recommendation:
      status === 'ready_for_pilot_retry'
        ? 'Pilot retry prerequisites are present for a separate 4F.2 decision; this does not run a pilot.'
        : 'Pilot retry remains blocked until missing prerequisite evidence is present.',
    gates,
    blockers,
    findings,
    checklistItems: gates.map((gate) => createPilotPrerequisiteChecklistItem(gate)),
    hardGateCount: hardGates.length,
    passedGateCount: gates.filter((gate) => gate.status === 'passed').length,
    blockedGateCount: blockedHardGates.length,
    requiresReviewFindingCount: findings.length,
    missingPrerequisites,
    degraded,
    notPersisted,
    dryRunRecordPresent,
    configExplicitlyEnabled,
    validUnusedApprovalPresent,
    isolatedCleanWorktreeMetadataPresent,
    authoritativePolicySourcePresent,
    authoritativeSourcePreparationPresent,
    authoritativeAttemptEvidencePresent,
    evidenceAuditReady,
    fallbackUsedAsAuthority: false,
    pilotExecuted: false,
    adapterAttemptInvoked: false,
    authoritative,
    supervisorBacked,
    persisted,
    worktreeLabel: input.worktreeLabel,
    worktreeStatus: input.worktreeStatus,
    worktreePathHash: input.worktreePathHash,
    evidenceRefs,
    auditEventIds,
    summary:
      status === 'ready_for_pilot_retry'
        ? 'Pilot prerequisite readiness is authoritative, persisted, and metadata-only.'
        : 'Pilot prerequisite readiness records missing gates without executing an adapter attempt.',
    metadata: createPilotPrerequisiteMetadata({
      ...(input.metadata ?? {}),
      dryRunId: input.dryRunId,
      status,
      missingPrerequisiteCount: missingPrerequisites.length,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      worktreePathStored: false,
      source: 'codex-kernel.real-read-only-adapter.pilot-prerequisite-record',
    }),
  };
}

export function summarizeRealReadOnlyAdapterPilotPrerequisiteRecord(
  record: CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord,
): CodexExecRealReadOnlyAdapterPilotPrerequisiteSummary {
  return {
    id: foundationId('codex_real_read_only_adapter_pilot_prerequisite_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...pilotPrerequisiteFlags,
    recordId: record.id,
    dryRunId: record.dryRunId,
    status: record.status,
    hardGateCount: record.hardGateCount,
    passedGateCount: record.passedGateCount,
    blockedGateCount: record.blockedGateCount,
    requiresReviewFindingCount: record.requiresReviewFindingCount,
    missingPrerequisites: record.missingPrerequisites,
    degraded: record.degraded,
    notPersisted: record.notPersisted,
    dryRunRecordPresent: record.dryRunRecordPresent,
    configExplicitlyEnabled: record.configExplicitlyEnabled,
    validUnusedApprovalPresent: record.validUnusedApprovalPresent,
    isolatedCleanWorktreeMetadataPresent: record.isolatedCleanWorktreeMetadataPresent,
    authoritativePolicySourcePresent: record.authoritativePolicySourcePresent,
    authoritativeSourcePreparationPresent: record.authoritativeSourcePreparationPresent,
    authoritativeAttemptEvidencePresent: record.authoritativeAttemptEvidencePresent,
    evidenceAuditReady: record.evidenceAuditReady,
    fallbackUsedAsAuthority: false,
    pilotExecuted: false,
    adapterAttemptInvoked: false,
    recommendation: record.recommendation,
    summary: record.summary,
    metadata: createPilotPrerequisiteMetadata({
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      source: 'codex-kernel.real-read-only-adapter.pilot-prerequisite-summary',
    }),
  };
}

export function listRealReadOnlyAdapterPilotPrerequisiteSummaries(
  records: CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord[],
  query: Partial<CodexExecRealReadOnlyAdapterPilotPrerequisiteQuery> = {},
): CodexExecRealReadOnlyAdapterPilotPrerequisiteSummary[] {
  const limit = query.limit ?? 50;
  return records
    .filter((record) => (query.dryRunId === undefined ? true : record.dryRunId === query.dryRunId))
    .filter((record) => (query.status === undefined ? true : record.status === query.status))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit)
    .map((record) => summarizeRealReadOnlyAdapterPilotPrerequisiteRecord(record));
}

export function getLatestRealReadOnlyAdapterPilotPrerequisite(
  records: CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord[],
  dryRunId: string,
): CodexExecRealReadOnlyAdapterPilotPrerequisiteSummary | undefined {
  return listRealReadOnlyAdapterPilotPrerequisiteSummaries(records, { dryRunId, limit: 1 })[0];
}

export function createRealReadOnlyAdapterPilotPrerequisiteEvidenceRefs(
  record: CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord,
): EvidenceRef[] {
  return [
    createEvidenceRef({
      kind: 'hash',
      label: 'codex.real_read_only_adapter.pilot_prerequisite',
      summary: `Pilot prerequisite readiness ${record.status}; metadata, hashes, counts, and refs only.`,
      metadata: createPilotPrerequisiteMetadata({
        recordId: record.id,
        dryRunId: record.dryRunId,
        status: record.status,
        hardGateCount: record.hardGateCount,
        passedGateCount: record.passedGateCount,
        blockedGateCount: record.blockedGateCount,
        source: 'codex-kernel.real-read-only-adapter.pilot-prerequisite-evidence',
      }),
      bodyForHashOnly: stableStringify({
        id: record.id,
        dryRunId: record.dryRunId,
        status: record.status,
        gates: record.gates.map((gate) => `${gate.code}:${gate.status}`),
        missingPrerequisites: record.missingPrerequisites,
        degraded: record.degraded,
        notPersisted: record.notPersisted,
      }),
    }),
  ];
}

export function createRealReadOnlyAdapterPilotPrerequisiteAuditEvents(
  record: CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord,
  evidenceRefs: EvidenceRef[],
): AuditEvent[] {
  return [
    {
      id: foundationId('audit_real_read_only_adapter_pilot_prerequisite'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      actor: 'codex-kernel.real-read-only-adapter',
      action: 'codex.exec.real_read_only_adapter.pilot_prerequisite_recorded',
      outcome: record.status,
      evidenceRefs,
      metadata: createPilotPrerequisiteMetadata({
        recordId: record.id,
        dryRunId: record.dryRunId,
        status: record.status,
        pilotExecuted: false,
        adapterAttemptInvoked: false,
        source: 'codex-kernel.real-read-only-adapter.pilot-prerequisite-audit',
      }),
    },
  ];
}

function createPilotPrerequisiteGates(input: {
  dryRunId: string;
  authoritative: boolean;
  supervisorBacked: boolean;
  persisted: boolean;
  degraded: boolean;
  notPersisted: boolean;
  fallbackUsedAsAuthority: boolean;
  dryRunRecordPresent: boolean;
  configExplicitlyEnabled: boolean;
  validUnusedApprovalPresent: boolean;
  isolatedCleanWorktreeMetadataPresent: boolean;
  authoritativePolicySourcePresent: boolean;
  authoritativeSourcePreparationPresent: boolean;
  authoritativeAttemptEvidencePresent: boolean;
  evidenceAuditReady: boolean;
  handoffContextComplete: boolean;
  metadata?: JsonMetadata;
}): CodexExecRealReadOnlyAdapterPilotPrerequisiteGate[] {
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
    category: CodexExecRealReadOnlyAdapterPilotPrerequisiteGate['category'];
    passed: boolean;
    required: boolean;
    blockedSummary: string;
    passedSummary: string;
    requiresReview?: boolean;
  }> = [
    {
      code: 'source_persisted_authoritative',
      label: 'Persisted authoritative source',
      category: 'authority',
      passed: persistedAuthority,
      required: true,
      blockedSummary:
        'A degraded fallback, local-only summary, or non-persisted object cannot authorize pilot retry.',
      passedSummary: 'Supervisor-backed persisted prerequisite source is authoritative.',
    },
    {
      code: 'dry_run_record_present',
      label: 'Existing dry-run record',
      category: 'authority',
      passed: input.dryRunRecordPresent,
      required: true,
      blockedSummary: 'A persisted dry-run record must exist before pilot retry can be considered.',
      passedSummary: 'Existing dry-run record metadata is present.',
    },
    {
      code: 'config_explicitly_enabled',
      label: 'Config explicitly enabled',
      category: 'config',
      passed: input.configExplicitlyEnabled,
      required: true,
      blockedSummary: '4F.1 may inspect config enablement but must not change it.',
      passedSummary: 'Explicit config enablement metadata is present.',
    },
    {
      code: 'valid_unused_approval',
      label: 'Valid unused approval artifact',
      category: 'approval',
      passed: input.validUnusedApprovalPresent,
      required: true,
      blockedSummary:
        '4F.1 may verify approval metadata but must not create, renew, approve, revoke, or use approval artifacts.',
      passedSummary: 'Valid unused approval artifact metadata is present.',
    },
    {
      code: 'isolated_clean_worktree_metadata',
      label: 'Isolated clean worktree metadata',
      category: 'worktree',
      passed: input.isolatedCleanWorktreeMetadataPresent,
      required: true,
      blockedSummary:
        'Isolated clean worktree metadata must be present without storing a raw absolute path.',
      passedSummary: 'Isolated clean worktree metadata is present as label/hash/status only.',
    },
    {
      code: 'authoritative_policy_source',
      label: 'Authoritative policy source',
      category: 'policy',
      passed: input.authoritativePolicySourcePresent,
      required: true,
      blockedSummary:
        'Latest persisted read-only adapter policy source must be aligned before pilot retry.',
      passedSummary: 'Latest persisted read-only adapter policy source is aligned.',
    },
    {
      code: 'authoritative_pilot_source_evidence',
      label: 'Authoritative pilot source evidence',
      category: 'authority',
      passed:
        input.authoritativeAttemptEvidencePresent || input.authoritativeSourcePreparationPresent,
      required: true,
      blockedSummary:
        'Persisted Supervisor-backed attempt evidence or source-preparation evidence is required.',
      passedSummary: 'Persisted authoritative pilot source evidence is present.',
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
    {
      code: 'fallback_not_authority',
      label: 'Fallback cannot be authority',
      category: 'fallback',
      passed: !input.fallbackUsedAsAuthority,
      required: true,
      blockedSummary: 'Fallback output must never be treated as authoritative pilot readiness.',
      passedSummary: 'Fallback output is not treated as authoritative.',
    },
    {
      code: 'handoff_context_complete',
      label: 'Operator handoff context',
      category: 'handoff',
      passed: input.handoffContextComplete,
      required: false,
      blockedSummary: 'Operator handoff context is incomplete.',
      passedSummary: 'Operator handoff context is complete.',
      requiresReview: !input.handoffContextComplete,
    },
  ];

  return gateInputs.map((gate) =>
    createPilotPrerequisiteGate({
      dryRunId: input.dryRunId,
      code: gate.code,
      label: gate.label,
      category: gate.category,
      status: gate.requiresReview ? 'requires_review' : gate.passed ? 'passed' : 'blocked',
      required: gate.required,
      summary: gate.passed ? gate.passedSummary : gate.blockedSummary,
      metadata: input.metadata,
    }),
  );
}

function createPilotPrerequisiteGate(input: {
  dryRunId: string;
  code: string;
  label: string;
  category: CodexExecRealReadOnlyAdapterPilotPrerequisiteGate['category'];
  status: CodexExecRealReadOnlyAdapterPilotPrerequisiteGate['status'];
  required: boolean;
  summary: string;
  metadata?: JsonMetadata;
}): CodexExecRealReadOnlyAdapterPilotPrerequisiteGate {
  return {
    id: foundationId('codex_real_read_only_adapter_pilot_prerequisite_gate'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...pilotPrerequisiteFlags,
    code: input.code,
    label: input.label,
    category: input.category,
    status: input.status,
    required: input.required,
    summary: input.summary,
    metadata: createPilotPrerequisiteMetadata({
      ...(input.metadata ?? {}),
      dryRunId: input.dryRunId,
      gateCode: input.code,
      source: 'codex-kernel.real-read-only-adapter.pilot-prerequisite-gate',
    }),
  };
}

function createPilotPrerequisiteBlocker(input: {
  dryRunId: string;
  gate: CodexExecRealReadOnlyAdapterPilotPrerequisiteGate;
  severity: RiskLevel;
  metadata?: JsonMetadata;
}): CodexExecRealReadOnlyAdapterPilotPrerequisiteBlocker {
  return {
    id: foundationId('codex_real_read_only_adapter_pilot_prerequisite_blocker'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...pilotPrerequisiteFlags,
    code: `missing_${input.gate.code}`,
    severity: input.severity,
    relatedGateCode: input.gate.code,
    summary: input.gate.summary,
    recommendation: 'Resolve this prerequisite in a separate round before 4F.2 is considered.',
    metadata: createPilotPrerequisiteMetadata({
      ...(input.metadata ?? {}),
      dryRunId: input.dryRunId,
      relatedGateCode: input.gate.code,
      source: 'codex-kernel.real-read-only-adapter.pilot-prerequisite-blocker',
    }),
  };
}

function createPilotPrerequisiteFinding(input: {
  dryRunId: string;
  gate: CodexExecRealReadOnlyAdapterPilotPrerequisiteGate;
  metadata?: JsonMetadata;
}): CodexExecRealReadOnlyAdapterPilotPrerequisiteFinding {
  return {
    id: foundationId('codex_real_read_only_adapter_pilot_prerequisite_finding'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...pilotPrerequisiteFlags,
    code: input.gate.code,
    severity: 'medium',
    status: 'requires_review',
    relatedGateCode: input.gate.code,
    summary: input.gate.summary,
    recommendation: 'Resolve or explicitly acknowledge this finding before pilot retry.',
    metadata: createPilotPrerequisiteMetadata({
      ...(input.metadata ?? {}),
      dryRunId: input.dryRunId,
      relatedGateCode: input.gate.code,
      source: 'codex-kernel.real-read-only-adapter.pilot-prerequisite-finding',
    }),
  };
}

function createPilotPrerequisiteChecklistItem(
  gate: CodexExecRealReadOnlyAdapterPilotPrerequisiteGate,
): CodexExecRealReadOnlyAdapterPilotPrerequisiteChecklistItem {
  return {
    id: foundationId('codex_real_read_only_adapter_pilot_prerequisite_check'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...pilotPrerequisiteFlags,
    code: gate.code,
    label: gate.label,
    status: gate.status,
    required: gate.required,
    summary: gate.summary,
    metadata: createPilotPrerequisiteMetadata({
      gateId: gate.id,
      gateCode: gate.code,
      source: 'codex-kernel.real-read-only-adapter.pilot-prerequisite-checklist',
    }),
  };
}

function createPilotPrerequisiteMetadata(extra: JsonMetadata): JsonMetadata {
  return {
    ...extra,
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
  };
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortJson(value));
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJson);
  }

  if (typeof value !== 'object' || value === null) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nestedValue]) => [key, sortJson(nestedValue)]),
  );
}

export function createRealReadOnlyAdapterPilotPrerequisiteMetadataHash(
  value: unknown,
): string {
  return `sha256:${hashText(stableStringify(value))}`;
}
