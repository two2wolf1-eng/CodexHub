import type {
  AuditEvent,
  CodexExecDryRunPlan,
  CodexExecRealReadOnlyAdapterPolicySourceBlocker,
  CodexExecRealReadOnlyAdapterPolicySourceChecklistItem,
  CodexExecRealReadOnlyAdapterPolicySourceFinding,
  CodexExecRealReadOnlyAdapterPolicySourceGate,
  CodexExecRealReadOnlyAdapterPolicySourceQuery,
  CodexExecRealReadOnlyAdapterPolicySourceRecord,
  CodexExecRealReadOnlyAdapterPolicySourceStatus,
  CodexExecRealReadOnlyAdapterPolicySourceSummary,
  EvidenceRef,
  PolicyDecision,
  RiskLevel,
} from '@codexhub/contracts';
import { SchemaVersionSchema, foundationId, foundationTimestamp } from '@codexhub/contracts';
import { createEvidenceRef, hashText } from '@codexhub/evidence-kernel';

type JsonMetadata = Record<string, unknown>;

export interface CodexExecRealReadOnlyAdapterPolicySourceInput {
  dryRunId: string;
  authoritative?: boolean;
  supervisorBacked?: boolean;
  persisted?: boolean;
  degraded?: boolean;
  notPersisted?: boolean;
  dryRunRecordPresent?: boolean;
  configExplicitlyEnabled?: boolean;
  readOnlyOnly?: boolean;
  policyDecision?: PolicyDecision;
  dryRunPlan?: CodexExecDryRunPlan;
  policyDecisionHash?: string;
  dryRunPlanHash?: string;
  evidenceAuditReady?: boolean;
  fallbackUsedAsAuthority?: boolean;
  evidenceRefs?: EvidenceRef[];
  auditEventIds?: string[];
  metadata?: JsonMetadata;
}

const policySourceFlags = {
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

export function buildRealReadOnlyAdapterPolicySourceRecord(
  input: CodexExecRealReadOnlyAdapterPolicySourceInput,
): CodexExecRealReadOnlyAdapterPolicySourceRecord {
  const degraded = input.degraded === true;
  const notPersisted = input.notPersisted === true;
  const authoritative = input.authoritative === true;
  const supervisorBacked = input.supervisorBacked === true;
  const persisted = input.persisted === true;
  const fallbackUsedAsAuthority = input.fallbackUsedAsAuthority === true;
  const dryRunRecordPresent = input.dryRunRecordPresent === true;
  const configExplicitlyEnabled = input.configExplicitlyEnabled === true;
  const readOnlyOnly = input.readOnlyOnly === true;
  const policyDecisionPresent = input.policyDecision !== undefined;
  const policyDecisionOutcome = input.policyDecision?.outcome;
  const policyDecisionAllowsPilot =
    input.policyDecision !== undefined && input.policyDecision.outcome !== 'deny';
  const policyDecisionHash =
    input.policyDecisionHash ??
    (input.policyDecision ? createRealReadOnlyAdapterPolicyDecisionHash(input.policyDecision) : undefined);
  const dryRunPlanHash =
    input.dryRunPlanHash ??
    (input.dryRunPlan ? createRealReadOnlyAdapterPolicySourceDryRunPlanHash(input.dryRunPlan) : undefined);
  const evidenceAuditReady = input.evidenceAuditReady === true;
  const gates = createPolicySourceGates({
    dryRunId: input.dryRunId,
    authoritative,
    supervisorBacked,
    persisted,
    degraded,
    notPersisted,
    fallbackUsedAsAuthority,
    dryRunRecordPresent,
    configExplicitlyEnabled,
    readOnlyOnly,
    policyDecisionPresent,
    policyDecisionAllowsPilot,
    policyDecisionHashPresent: policyDecisionHash !== undefined,
    dryRunPlanHashPresent: dryRunPlanHash !== undefined,
    evidenceAuditReady,
    metadata: input.metadata,
  });
  const hardGates = gates.filter((gate) => gate.required);
  const blockedHardGates = hardGates.filter((gate) => gate.status === 'blocked');
  const requiresReviewGates = gates.filter((gate) => gate.status === 'requires_review');
  const status: CodexExecRealReadOnlyAdapterPolicySourceStatus =
    blockedHardGates.length > 0
      ? 'blocked'
      : requiresReviewGates.length > 0
        ? 'requires_review'
        : 'aligned';
  const blockers = blockedHardGates.map((gate) =>
    createPolicySourceBlocker({
      dryRunId: input.dryRunId,
      gate,
      severity:
        gate.code === 'policy_source_persisted_authoritative' || gate.code === 'policy_decision_allows_pilot'
          ? 'critical'
          : 'high',
      metadata: input.metadata,
    }),
  );
  const findings = requiresReviewGates.map((gate) =>
    createPolicySourceFinding({
      dryRunId: input.dryRunId,
      gate,
      metadata: input.metadata,
    }),
  );
  const missingSources = blockedHardGates.map((gate) => gate.code);
  const evidenceRefs = input.evidenceRefs ?? [];
  const auditEventIds = input.auditEventIds ?? [];

  return {
    id: foundationId('codex_real_read_only_adapter_policy_source'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...policySourceFlags,
    dryRunId: input.dryRunId,
    status,
    recommendation:
      status === 'aligned'
        ? 'Read-only adapter pilot policy source is aligned for future approval binding; this does not run a pilot.'
        : 'Read-only adapter pilot policy source remains blocked until current policy authority is aligned.',
    gates,
    blockers,
    findings,
    checklistItems: gates.map((gate) => createPolicySourceChecklistItem(gate)),
    hardGateCount: hardGates.length,
    passedGateCount: gates.filter((gate) => gate.status === 'passed').length,
    blockedGateCount: blockedHardGates.length,
    requiresReviewFindingCount: findings.length,
    missingSources,
    degraded,
    notPersisted,
    dryRunRecordPresent,
    configExplicitlyEnabled,
    readOnlyOnly,
    policyDecisionPresent,
    policyDecisionAllowsPilot,
    policyDecisionId: input.policyDecision?.id,
    policyDecisionHash,
    policyDecisionOutcome,
    policyDecisionReasonCount: input.policyDecision?.reasons.length ?? 0,
    dryRunPlanHash,
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
      status === 'aligned'
        ? 'Policy source is persisted, Supervisor-backed, non-degraded, and non-deny for the read-only pilot route.'
        : 'Policy source records missing alignment gates without mutating historical dry-run policy decisions.',
    metadata: createPolicySourceMetadata({
      ...(input.metadata ?? {}),
      dryRunId: input.dryRunId,
      status,
      missingSourceCount: missingSources.length,
      policyDecisionOutcome,
      policyDecisionReasonCount: input.policyDecision?.reasons.length ?? 0,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      worktreePathStored: false,
      source: 'codex-kernel.real-read-only-adapter.policy-source-record',
    }),
  };
}

export function summarizeRealReadOnlyAdapterPolicySourceRecord(
  record: CodexExecRealReadOnlyAdapterPolicySourceRecord,
): CodexExecRealReadOnlyAdapterPolicySourceSummary {
  return {
    id: foundationId('codex_real_read_only_adapter_policy_source_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...policySourceFlags,
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
    readOnlyOnly: record.readOnlyOnly,
    policyDecisionPresent: record.policyDecisionPresent,
    policyDecisionAllowsPilot: record.policyDecisionAllowsPilot,
    policyDecisionId: record.policyDecisionId,
    policyDecisionHash: record.policyDecisionHash,
    policyDecisionOutcome: record.policyDecisionOutcome,
    dryRunPlanHash: record.dryRunPlanHash,
    evidenceAuditReady: record.evidenceAuditReady,
    fallbackUsedAsAuthority: false,
    pilotExecuted: false,
    adapterAttemptInvoked: false,
    recommendation: record.recommendation,
    summary: record.summary,
    metadata: createPolicySourceMetadata({
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      source: 'codex-kernel.real-read-only-adapter.policy-source-summary',
    }),
  };
}

export function listRealReadOnlyAdapterPolicySourceSummaries(
  records: CodexExecRealReadOnlyAdapterPolicySourceRecord[],
  query: Partial<CodexExecRealReadOnlyAdapterPolicySourceQuery> = {},
): CodexExecRealReadOnlyAdapterPolicySourceSummary[] {
  const limit = query.limit ?? 50;
  return records
    .filter((record) => (query.dryRunId === undefined ? true : record.dryRunId === query.dryRunId))
    .filter((record) => (query.status === undefined ? true : record.status === query.status))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit)
    .map((record) => summarizeRealReadOnlyAdapterPolicySourceRecord(record));
}

export function getLatestRealReadOnlyAdapterPolicySource(
  records: CodexExecRealReadOnlyAdapterPolicySourceRecord[],
  dryRunId: string,
): CodexExecRealReadOnlyAdapterPolicySourceSummary | undefined {
  return listRealReadOnlyAdapterPolicySourceSummaries(records, { dryRunId, limit: 1 })[0];
}

export function createPolicyDecisionFromRealReadOnlyAdapterPolicySource(
  record: CodexExecRealReadOnlyAdapterPolicySourceRecord,
): PolicyDecision {
  return {
    id: record.policyDecisionId ?? foundationId('policy_decision'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    actionId: record.dryRunId,
    actionType: 'codex.exec.real_read_only_adapter.pilot_policy_source',
    actionMode: 'read',
    riskLevel: 'medium',
    outcome: record.policyDecisionOutcome ?? 'deny',
    reasons: [
      record.summary,
      `policySourceRecordId=${record.id}`,
      `policyDecisionHash=${record.policyDecisionHash ?? 'missing'}`,
    ],
    requiresDryRun: true,
    requiresApproval: true,
    metadata: createPolicySourceMetadata({
      recordId: record.id,
      dryRunId: record.dryRunId,
      source: 'codex-kernel.real-read-only-adapter.policy-source-decision-view',
    }),
  };
}

export function createRealReadOnlyAdapterPolicySourceEvidenceRefs(
  record: CodexExecRealReadOnlyAdapterPolicySourceRecord,
): EvidenceRef[] {
  return [
    createEvidenceRef({
      kind: 'hash',
      label: 'codex.real_read_only_adapter.policy_source',
      summary: `Read-only adapter policy source ${record.status}; ids, hashes, counts, and refs only.`,
      metadata: createPolicySourceMetadata({
        recordId: record.id,
        dryRunId: record.dryRunId,
        status: record.status,
        hardGateCount: record.hardGateCount,
        passedGateCount: record.passedGateCount,
        blockedGateCount: record.blockedGateCount,
        source: 'codex-kernel.real-read-only-adapter.policy-source-evidence',
      }),
      bodyForHashOnly: stableStringify({
        id: record.id,
        dryRunId: record.dryRunId,
        status: record.status,
        policyDecisionId: record.policyDecisionId,
        policyDecisionHash: record.policyDecisionHash,
        policyDecisionOutcome: record.policyDecisionOutcome,
        dryRunPlanHash: record.dryRunPlanHash,
        missingSources: record.missingSources,
      }),
    }),
  ];
}

export function createRealReadOnlyAdapterPolicySourceAuditEvents(
  record: CodexExecRealReadOnlyAdapterPolicySourceRecord,
  evidenceRefs: EvidenceRef[] = record.evidenceRefs,
): AuditEvent[] {
  return [
    {
      id: foundationId('audit_codex_real_read_only_adapter_policy_source'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      actor: 'codex-kernel.real-read-only-adapter',
      action: 'codex.exec.real_read_only_adapter.policy_source_recorded',
      outcome: record.status,
      evidenceRefs,
      metadata: createPolicySourceMetadata({
        recordId: record.id,
        dryRunId: record.dryRunId,
        status: record.status,
        riskLevel: record.status === 'aligned' ? 'medium' : 'high',
        liveExecution: false,
        externalProcessStarted: false,
        pilotExecuted: false,
        adapterAttemptInvoked: false,
        source: 'codex-kernel.real-read-only-adapter.policy-source-audit',
      }),
    },
  ];
}

export function createRealReadOnlyAdapterPolicySourceDryRunPlanHash(
  plan: CodexExecDryRunPlan,
): string {
  return `sha256:${hashText(
    stableStringify({
      id: plan.id,
      intentId: plan.intentId,
      promptHash: plan.promptHash,
      promptLength: plan.promptLength,
      cwd: plan.cwd,
      sandboxMode: plan.sandboxMode,
      approvalMode: plan.approvalMode,
      riskLevel: plan.riskLevel,
    }),
  )}`;
}

export function createRealReadOnlyAdapterPolicyDecisionHash(
  policyDecision: PolicyDecision,
): string {
  return `sha256:${hashText(
    stableStringify({
      id: policyDecision.id,
      actionId: policyDecision.actionId,
      actionType: policyDecision.actionType,
      actionMode: policyDecision.actionMode,
      riskLevel: policyDecision.riskLevel,
      outcome: policyDecision.outcome,
      requiresDryRun: policyDecision.requiresDryRun,
      requiresApproval: policyDecision.requiresApproval,
      reasons: policyDecision.reasons,
    }),
  )}`;
}

function createPolicySourceGates(input: {
  dryRunId: string;
  authoritative: boolean;
  supervisorBacked: boolean;
  persisted: boolean;
  degraded: boolean;
  notPersisted: boolean;
  fallbackUsedAsAuthority: boolean;
  dryRunRecordPresent: boolean;
  configExplicitlyEnabled: boolean;
  readOnlyOnly: boolean;
  policyDecisionPresent: boolean;
  policyDecisionAllowsPilot: boolean;
  policyDecisionHashPresent: boolean;
  dryRunPlanHashPresent: boolean;
  evidenceAuditReady: boolean;
  metadata?: JsonMetadata;
}): CodexExecRealReadOnlyAdapterPolicySourceGate[] {
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
    category: CodexExecRealReadOnlyAdapterPolicySourceGate['category'];
    passed: boolean;
    required: boolean;
    blockedSummary: string;
    passedSummary: string;
  }> = [
    {
      code: 'policy_source_persisted_authoritative',
      label: 'Persisted authoritative policy source',
      category: 'authority',
      passed: persistedAuthority,
      required: true,
      blockedSummary:
        'A degraded fallback, local-only policy summary, or non-persisted object cannot align pilot policy authority.',
      passedSummary: 'Supervisor-backed persisted policy source is authoritative.',
    },
    {
      code: 'dry_run_record_present',
      label: 'Existing dry-run record',
      category: 'dry_run',
      passed: input.dryRunRecordPresent,
      required: true,
      blockedSummary: 'A persisted dry-run record must exist before policy source alignment.',
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
      code: 'read_only_only',
      label: 'Read-only-only config',
      category: 'config',
      passed: input.readOnlyOnly,
      required: true,
      blockedSummary: 'Policy source alignment requires the config to allow read_only only.',
      passedSummary: 'Config is restricted to read_only only.',
    },
    {
      code: 'policy_decision_present',
      label: 'Current policy decision',
      category: 'policy',
      passed: input.policyDecisionPresent,
      required: true,
      blockedSummary: 'A current read-only pilot policy decision must be evaluated.',
      passedSummary: 'Current policy decision metadata is present.',
    },
    {
      code: 'policy_decision_allows_pilot',
      label: 'Policy decision allows guarded pilot route',
      category: 'policy',
      passed: input.policyDecisionAllowsPilot,
      required: true,
      blockedSummary: 'A deny policy decision cannot be treated as aligned policy authority.',
      passedSummary: 'Current policy decision is non-deny and still requires approval gates.',
    },
    {
      code: 'dry_run_plan_hash_present',
      label: 'Dry-run plan hash',
      category: 'policy',
      passed: input.dryRunPlanHashPresent,
      required: true,
      blockedSummary: 'Policy source must bind to a dryRunPlanHash.',
      passedSummary: 'Policy source carries a dryRunPlanHash.',
    },
    {
      code: 'policy_decision_hash_present',
      label: 'Policy decision hash',
      category: 'policy',
      passed: input.policyDecisionHashPresent,
      required: true,
      blockedSummary: 'Policy source must bind to a policyDecisionHash.',
      passedSummary: 'Policy source carries a policyDecisionHash.',
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
      blockedSummary: 'Fallback policy output must never be treated as authoritative.',
      passedSummary: 'Fallback policy output is not treated as authoritative.',
    },
  ];

  return gateInputs.map((gate) =>
    createPolicySourceGate({
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

function createPolicySourceGate(input: {
  dryRunId: string;
  code: string;
  label: string;
  category: CodexExecRealReadOnlyAdapterPolicySourceGate['category'];
  status: CodexExecRealReadOnlyAdapterPolicySourceGate['status'];
  required: boolean;
  summary: string;
  metadata?: JsonMetadata;
}): CodexExecRealReadOnlyAdapterPolicySourceGate {
  return {
    id: foundationId('codex_real_read_only_adapter_policy_source_gate'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...policySourceFlags,
    code: input.code,
    label: input.label,
    category: input.category,
    status: input.status,
    required: input.required,
    summary: input.summary,
    metadata: createPolicySourceMetadata({
      ...(input.metadata ?? {}),
      dryRunId: input.dryRunId,
      gateCode: input.code,
      source: 'codex-kernel.real-read-only-adapter.policy-source-gate',
    }),
  };
}

function createPolicySourceBlocker(input: {
  dryRunId: string;
  gate: CodexExecRealReadOnlyAdapterPolicySourceGate;
  severity: RiskLevel;
  metadata?: JsonMetadata;
}): CodexExecRealReadOnlyAdapterPolicySourceBlocker {
  return {
    id: foundationId('codex_real_read_only_adapter_policy_source_blocker'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...policySourceFlags,
    code: input.gate.code,
    severity: input.severity,
    relatedGateCode: input.gate.code,
    summary: input.gate.summary,
    recommendation: 'Align this policy source in a separate remediation round before pilot retry.',
    metadata: createPolicySourceMetadata({
      ...(input.metadata ?? {}),
      dryRunId: input.dryRunId,
      gateCode: input.gate.code,
      source: 'codex-kernel.real-read-only-adapter.policy-source-blocker',
    }),
  };
}

function createPolicySourceFinding(input: {
  dryRunId: string;
  gate: CodexExecRealReadOnlyAdapterPolicySourceGate;
  metadata?: JsonMetadata;
}): CodexExecRealReadOnlyAdapterPolicySourceFinding {
  return {
    id: foundationId('codex_real_read_only_adapter_policy_source_finding'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...policySourceFlags,
    code: input.gate.code,
    severity: 'medium',
    status: 'requires_review',
    relatedGateCode: input.gate.code,
    summary: input.gate.summary,
    recommendation: 'Review policy source metadata before considering pilot retry.',
    metadata: createPolicySourceMetadata({
      ...(input.metadata ?? {}),
      dryRunId: input.dryRunId,
      gateCode: input.gate.code,
      source: 'codex-kernel.real-read-only-adapter.policy-source-finding',
    }),
  };
}

function createPolicySourceChecklistItem(
  gate: CodexExecRealReadOnlyAdapterPolicySourceGate,
): CodexExecRealReadOnlyAdapterPolicySourceChecklistItem {
  return {
    id: foundationId('codex_real_read_only_adapter_policy_source_checklist'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...policySourceFlags,
    code: gate.code,
    label: gate.label,
    status: gate.status,
    required: gate.required,
    summary: gate.summary,
    metadata: createPolicySourceMetadata({
      gateCode: gate.code,
      source: 'codex-kernel.real-read-only-adapter.policy-source-checklist',
    }),
  };
}

function createPolicySourceMetadata(extra: JsonMetadata): JsonMetadata {
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

export function createRealReadOnlyAdapterPolicySourceMetadataHash(value: unknown): string {
  return `sha256:${hashText(stableStringify(value))}`;
}
