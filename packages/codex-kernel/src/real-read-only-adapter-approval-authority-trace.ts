import type {
  AuditEvent,
  CodexExecRealReadOnlyAdapterApprovalAuthoritySummary,
  CodexExecRealReadOnlyAdapterApprovalAuthorityTraceQuery,
  CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord,
  CodexExecRealReadOnlyAdapterApprovalAuthorityTraceStatus,
  CodexExecRealReadOnlyAdapterApprovalAuthorityTraceSummary,
  EvidenceRef,
} from '@codexhub/contracts';
import { SchemaVersionSchema, foundationId, foundationTimestamp } from '@codexhub/contracts';
import { createEvidenceRef, hashText } from '@codexhub/evidence-kernel';

type JsonMetadata = Record<string, unknown>;

export interface CodexExecRealReadOnlyAdapterApprovalAuthorityTraceInput {
  dryRunId: string;
  approvalAuthority: CodexExecRealReadOnlyAdapterApprovalAuthoritySummary;
  sourcePreparationApprovalArtifactId?: string;
  prerequisiteApprovalArtifactId?: string;
  inputApprovalArtifactId?: string;
  authoritative?: boolean;
  supervisorBacked?: boolean;
  persisted?: boolean;
  degraded?: boolean;
  notPersisted?: boolean;
  fallbackUsedAsAuthority?: boolean;
  evidenceRefs?: EvidenceRef[];
  auditEventIds?: string[];
  metadata?: JsonMetadata;
}

const approvalAuthorityTraceFlags = {
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

export function buildRealReadOnlyAdapterApprovalAuthorityTraceRecord(
  input: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceInput,
): CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord {
  const authoritative = input.authoritative === true;
  const supervisorBacked = input.supervisorBacked === true;
  const persisted = input.persisted === true;
  const degraded = input.degraded === true;
  const notPersisted = input.notPersisted === true;
  const fallbackUsedAsAuthority = input.fallbackUsedAsAuthority === true;
  const inputApprovalArtifactId =
    input.inputApprovalArtifactId ?? input.approvalAuthority.approvalArtifactId;
  const resolvedApprovalArtifactId = input.approvalAuthority.approvalArtifactId;
  const exactLookupMatched =
    inputApprovalArtifactId !== undefined &&
    resolvedApprovalArtifactId !== undefined &&
    inputApprovalArtifactId === resolvedApprovalArtifactId;
  const sourcePreparationMatched =
    input.sourcePreparationApprovalArtifactId === undefined ||
    input.sourcePreparationApprovalArtifactId === resolvedApprovalArtifactId;
  const prerequisiteMatched =
    input.prerequisiteApprovalArtifactId === undefined ||
    input.prerequisiteApprovalArtifactId === resolvedApprovalArtifactId;
  const approvalApproved = input.approvalAuthority.status === 'resolved';
  const approvalUnused = !input.approvalAuthority.reasonCodes.includes('approval_used');
  const approvalNotRevoked = !input.approvalAuthority.reasonCodes.includes('approval_revoked');
  const approvalNotExpired = !input.approvalAuthority.reasonCodes.includes('approval_expired');
  const dryRunHashMatched = input.approvalAuthority.dryRunHashMatched;
  const policyHashMatched = input.approvalAuthority.policyHashMatched;
  const persistedAuthority =
    authoritative && supervisorBacked && persisted && !degraded && !notPersisted && !fallbackUsedAsAuthority;
  const reasonCodes = [
    ...input.approvalAuthority.reasonCodes,
    ...(persistedAuthority ? [] : ['approval_trace_persisted_authority']),
    ...(exactLookupMatched ? [] : ['approval_trace_exact_lookup_mismatch']),
    ...(sourcePreparationMatched ? [] : ['approval_trace_source_preparation_mismatch']),
    ...(prerequisiteMatched ? [] : ['approval_trace_prerequisite_mismatch']),
    ...(approvalApproved ? [] : ['approval_trace_not_approved']),
    ...(approvalUnused ? [] : ['approval_used']),
    ...(approvalNotRevoked ? [] : ['approval_revoked']),
    ...(approvalNotExpired ? [] : ['approval_expired']),
    ...(dryRunHashMatched ? [] : ['dry_run_hash_mismatch']),
    ...(policyHashMatched ? [] : ['policy_hash_mismatch']),
  ].filter((code, index, codes) => codes.indexOf(code) === index);
  const attemptPreflightWouldAccept =
    persistedAuthority &&
    exactLookupMatched &&
    sourcePreparationMatched &&
    prerequisiteMatched &&
    approvalApproved &&
    approvalUnused &&
    approvalNotRevoked &&
    approvalNotExpired &&
    dryRunHashMatched &&
    policyHashMatched;
  const status: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceStatus =
    attemptPreflightWouldAccept ? 'aligned' : 'blocked';
  const evidenceRefs = input.evidenceRefs ?? [];
  const auditEventIds = input.auditEventIds ?? [];

  return {
    id: foundationId('codex_real_read_only_adapter_approval_authority_trace'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...approvalAuthorityTraceFlags,
    dryRunId: input.dryRunId,
    status,
    sourcePreparationApprovalArtifactId: input.sourcePreparationApprovalArtifactId,
    prerequisiteApprovalArtifactId: input.prerequisiteApprovalArtifactId,
    inputApprovalArtifactId,
    resolvedApprovalRecordId: input.approvalAuthority.approvalRecordId,
    resolvedApprovalArtifactId,
    approvalArtifactHash: input.approvalAuthority.approvalArtifactHash,
    dryRunPlanHash: input.approvalAuthority.dryRunPlanHash,
    policyDecisionHash: input.approvalAuthority.policyDecisionHash,
    expectedDryRunPlanHash: input.approvalAuthority.expectedDryRunPlanHash,
    expectedPolicyDecisionHash: input.approvalAuthority.expectedPolicyDecisionHash,
    exactLookupMatched,
    sourcePreparationMatched,
    prerequisiteMatched,
    approvalApproved,
    approvalUnused,
    approvalNotRevoked,
    approvalNotExpired,
    dryRunHashMatched,
    policyHashMatched,
    attemptPreflightWouldAccept,
    checkedAt: input.approvalAuthority.checkedAt,
    expiresAt: input.approvalAuthority.expiresAt,
    reasonCodes,
    degraded,
    notPersisted,
    fallbackUsedAsAuthority: false,
    pilotExecuted: false,
    adapterAttemptInvoked: false,
    authoritative,
    supervisorBacked,
    persisted,
    evidenceRefs,
    auditEventIds,
    summary:
      status === 'aligned'
        ? 'Approval authority trace aligns source-prep, prerequisite, and attempt preflight metadata.'
        : 'Approval authority trace is blocked; source-prep, prerequisite, and attempt preflight are not aligned.',
    metadata: createApprovalAuthorityTraceMetadata({
      ...(input.metadata ?? {}),
      dryRunId: input.dryRunId,
      status,
      reasonCodes,
      sourcePreparationApprovalArtifactId: input.sourcePreparationApprovalArtifactId,
      prerequisiteApprovalArtifactId: input.prerequisiteApprovalArtifactId,
      inputApprovalArtifactId,
      resolvedApprovalRecordId: input.approvalAuthority.approvalRecordId,
      resolvedApprovalArtifactId,
      exactLookupMatched,
      sourcePreparationMatched,
      prerequisiteMatched,
      dryRunHashMatched,
      policyHashMatched,
      attemptPreflightWouldAccept,
      source: 'codex-kernel.real-read-only-adapter.approval-authority-trace',
    }),
  };
}

export function summarizeRealReadOnlyAdapterApprovalAuthorityTraceRecord(
  record: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord,
): CodexExecRealReadOnlyAdapterApprovalAuthorityTraceSummary {
  return {
    id: foundationId('codex_real_read_only_adapter_approval_authority_trace_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...approvalAuthorityTraceFlags,
    recordId: record.id,
    dryRunId: record.dryRunId,
    status: record.status,
    inputApprovalArtifactId: record.inputApprovalArtifactId,
    resolvedApprovalRecordId: record.resolvedApprovalRecordId,
    resolvedApprovalArtifactId: record.resolvedApprovalArtifactId,
    sourcePreparationMatched: record.sourcePreparationMatched,
    prerequisiteMatched: record.prerequisiteMatched,
    exactLookupMatched: record.exactLookupMatched,
    dryRunHashMatched: record.dryRunHashMatched,
    policyHashMatched: record.policyHashMatched,
    attemptPreflightWouldAccept: record.attemptPreflightWouldAccept,
    checkedAt: record.checkedAt,
    expiresAt: record.expiresAt,
    reasonCodes: record.reasonCodes,
    degraded: record.degraded,
    notPersisted: record.notPersisted,
    fallbackUsedAsAuthority: false,
    pilotExecuted: false,
    adapterAttemptInvoked: false,
    summary: record.summary,
    metadata: createApprovalAuthorityTraceMetadata({
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      source: 'codex-kernel.real-read-only-adapter.approval-authority-trace-summary',
    }),
  };
}

export function listRealReadOnlyAdapterApprovalAuthorityTraceSummaries(
  records: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord[],
  query: Partial<CodexExecRealReadOnlyAdapterApprovalAuthorityTraceQuery> = {},
): CodexExecRealReadOnlyAdapterApprovalAuthorityTraceSummary[] {
  const limit = query.limit ?? 50;
  return records
    .filter((record) => (query.dryRunId === undefined ? true : record.dryRunId === query.dryRunId))
    .filter((record) => (query.status === undefined ? true : record.status === query.status))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit)
    .map((record) => summarizeRealReadOnlyAdapterApprovalAuthorityTraceRecord(record));
}

export function getLatestRealReadOnlyAdapterApprovalAuthorityTrace(
  records: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord[],
  dryRunId: string,
): CodexExecRealReadOnlyAdapterApprovalAuthorityTraceSummary | undefined {
  return listRealReadOnlyAdapterApprovalAuthorityTraceSummaries(records, { dryRunId, limit: 1 })[0];
}

export function createRealReadOnlyAdapterApprovalAuthorityTraceEvidenceRefs(
  record: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord,
): EvidenceRef[] {
  return [
    createEvidenceRef({
      kind: 'hash',
      label: 'codex.real_read_only_adapter.approval_authority_trace',
      summary: `Read-only adapter approval authority trace ${record.status}; ids, hashes, flags, and counts only.`,
      metadata: createApprovalAuthorityTraceMetadata({
        recordId: record.id,
        dryRunId: record.dryRunId,
        status: record.status,
        reasonCodeCount: record.reasonCodes.length,
        source: 'codex-kernel.real-read-only-adapter.approval-authority-trace-evidence',
      }),
      bodyForHashOnly: stableStringify({
        id: record.id,
        dryRunId: record.dryRunId,
        status: record.status,
        inputApprovalArtifactId: record.inputApprovalArtifactId,
        resolvedApprovalArtifactId: record.resolvedApprovalArtifactId,
        dryRunPlanHash: record.dryRunPlanHash,
        policyDecisionHash: record.policyDecisionHash,
        reasonCodes: record.reasonCodes,
      }),
    }),
  ];
}

export function createRealReadOnlyAdapterApprovalAuthorityTraceAuditEvents(
  record: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord,
  evidenceRefs: EvidenceRef[] = record.evidenceRefs,
): AuditEvent[] {
  return [
    {
      id: foundationId('audit_codex_real_read_only_adapter_approval_authority_trace'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      actor: 'codex-kernel.real-read-only-adapter',
      action: 'codex.exec.real_read_only_adapter.approval_authority_trace_recorded',
      outcome: record.status,
      evidenceRefs,
      metadata: createApprovalAuthorityTraceMetadata({
        recordId: record.id,
        dryRunId: record.dryRunId,
        status: record.status,
        riskLevel: record.status === 'aligned' ? 'medium' : 'high',
        liveExecution: false,
        externalProcessStarted: false,
        pilotExecuted: false,
        adapterAttemptInvoked: false,
        source: 'codex-kernel.real-read-only-adapter.approval-authority-trace-audit',
      }),
    },
  ];
}

function createApprovalAuthorityTraceMetadata(extra: JsonMetadata): JsonMetadata {
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

export function createRealReadOnlyAdapterApprovalAuthorityTraceMetadataHash(value: unknown): string {
  return `sha256:${hashText(stableStringify(value))}`;
}
