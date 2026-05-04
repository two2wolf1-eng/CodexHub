import {
  ConfigHashSummarySchema,
  IntegrationReadinessSummarySchema,
  M10PilotChecklistSchema,
  M10PilotOperatorStepSchema,
  M10PilotRunbookSummarySchema,
  OperatorReadinessCheckSchema,
  OperatorReadinessReportSchema,
  SchemaVersionSchema,
  foundationTimestamp,
  type ConfigHashSummary,
  type IntegrationReadinessSummary,
  type M10PilotChecklist,
  type M10PilotChecklistStatus,
  type M10PilotOperatorStep,
  type M10PilotOperatorStepPhase,
  type M10PilotOperatorStepStatus,
  type M10PilotRunbookSummary,
  type OperatorReadinessCheck,
  type OperatorReadinessReport,
  type OperatorReadinessStatus,
  type RiskLevel,
} from '@codexhub/contracts';

export type {
  ConfigHashSummary,
  IntegrationReadinessSummary,
  M10PilotChecklist,
  M10PilotOperatorStep,
  M10PilotRunbookSummary,
  OperatorReadinessCheck,
  OperatorReadinessReport,
} from '@codexhub/contracts';

export interface OperatorConfigInput {
  name: string;
  kind: ConfigHashSummary['kind'];
  text?: string;
  configured?: boolean;
  itemCount?: number;
}

export interface OperatorIntegrationInput {
  name: string;
  enabled?: boolean;
  defaultEnabled?: boolean;
  riskLevel?: RiskLevel;
  approvalRequired?: boolean;
  evidenceRequired?: boolean;
  auditRequired?: boolean;
  processBoundary?: boolean;
  networkBoundary?: boolean;
  envFlagConfigured?: boolean;
  localControlKeyConfigured?: boolean;
  blockers?: readonly string[];
  safeEnableNotes?: readonly string[];
  configHash?: string;
}

export interface OperatorReadinessInput {
  configs?: readonly OperatorConfigInput[];
  integrations?: readonly OperatorIntegrationInput[];
  localControlKeys?: readonly { name: string; configured: boolean; value?: string }[];
  storeAvailable?: boolean;
  processBoundaryAllowlistPassed?: boolean;
  boundaryAuditPassed?: boolean;
  noLiveAuditPassed?: boolean;
}

export interface M10PilotChecklistInput {
  readinessReport?: OperatorReadinessReport;
  approvalInboxItemCount?: number;
  governanceRunCount?: number;
}

export function createOperatorReadinessReport(
  input: OperatorReadinessInput = {},
): OperatorReadinessReport {
  const createdAt = foundationTimestamp();
  const configHashes = (input.configs ?? createDefaultConfigInputs()).map((config) =>
    createConfigHashSummary(config, createdAt),
  );
  const integrations = (input.integrations ?? createDefaultIntegrationInputs()).map(
    (integration) => createIntegrationReadinessSummary(integration, createdAt),
  );
  const localControlKeyChecks = (input.localControlKeys ?? []).map((entry) =>
    createOperatorReadinessCheck(
      {
        code: `local_control_key_${entry.name}`,
        label: `${entry.name} local-control key`,
        category: 'security',
        status: entry.configured ? 'pass' : 'warn',
        required: false,
        configured: entry.configured,
        hash: entry.configured ? readinessHash(entry.value ?? entry.name) : undefined,
        blockers: entry.configured ? [] : ['local_control_key_missing'],
        safeEnableNotes: entry.configured
          ? ['Configured value is summarized by hash only.']
          : ['Set the local-control key before enabling mutating local routes.'],
        summary: entry.configured
          ? `${entry.name} local-control key is configured.`
          : `${entry.name} local-control key is missing.`,
      },
      createdAt,
    ),
  );
  const checks = [
    createOperatorReadinessCheck(
      {
        code: 'store_available',
        label: 'Store availability',
        category: 'store',
        status: input.storeAvailable === false ? 'fail' : 'pass',
        required: true,
        configured: input.storeAvailable !== false,
        blockers: input.storeAvailable === false ? ['store_unavailable'] : [],
        summary:
          input.storeAvailable === false
            ? 'Store is unavailable; governed execution must remain blocked.'
            : 'Store availability is ready or not required for read-only preview.',
      },
      createdAt,
    ),
    createOperatorReadinessCheck(
      {
        code: 'process_boundary_allowlist',
        label: 'Process boundary allowlist',
        category: 'audit',
        status: input.processBoundaryAllowlistPassed === false ? 'fail' : 'pass',
        required: true,
        configured: input.processBoundaryAllowlistPassed !== false,
        blockers:
          input.processBoundaryAllowlistPassed === false
            ? ['process_boundary_allowlist_failed']
            : [],
        summary:
          input.processBoundaryAllowlistPassed === false
            ? 'Process boundary allowlist failed.'
            : 'Process boundary allowlist is passing.',
      },
      createdAt,
    ),
    createOperatorReadinessCheck(
      {
        code: 'no_live_automation_audit',
        label: 'No-live automation audit',
        category: 'audit',
        status: input.noLiveAuditPassed === false ? 'fail' : 'pass',
        required: true,
        configured: input.noLiveAuditPassed !== false,
        blockers: input.noLiveAuditPassed === false ? ['no_live_automation_audit_failed'] : [],
        summary:
          input.noLiveAuditPassed === false
            ? 'No-live automation audit failed.'
            : 'No-live automation audit is passing.',
      },
      createdAt,
    ),
    ...configHashes.map((config) =>
      createOperatorReadinessCheck(
        {
          code: `config_${config.name}`,
          label: `${config.name} config`,
          category: 'config',
          status: config.configured ? 'pass' : 'warn',
          required: false,
          configured: config.configured,
          hash: config.hash,
          blockers: config.configured ? [] : ['config_missing'],
          summary: config.summary,
        },
        createdAt,
      ),
    ),
    ...integrations.map((integration) =>
      createOperatorReadinessCheck(
        {
          code: `integration_${integration.name}`,
          label: `${integration.name} readiness`,
          category: 'integration',
          status: integration.safeToEnable ? 'pass' : 'warn',
          required: false,
          configured: integration.enabled,
          hash: integration.configHash,
          blockers: integration.blockers,
          safeEnableNotes: integration.safeEnableNotes,
          summary: integration.summary,
        },
        createdAt,
      ),
    ),
    ...localControlKeyChecks,
  ];
  const counts = countChecks(checks);
  const configuredLocalControlKeyCount = (input.localControlKeys ?? []).filter(
    (entry) => entry.configured,
  ).length;
  const policyConfigHash = configHashes.find((config) => config.kind === 'policy')?.hash;
  const riskConfigHash = configHashes.find((config) => config.kind === 'risk')?.hash;
  const integrationConfigHash = configHashes.find(
    (config) => config.kind === 'integration',
  )?.hash;

  return OperatorReadinessReportSchema.parse({
    id: stableId('operator_readiness_report', JSON.stringify([checks, integrations])),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    status: deriveReportStatus(counts),
    checks,
    integrations,
    configHashes,
    passedCheckCount: counts.pass,
    warningCheckCount: counts.warn,
    failedCheckCount: counts.fail,
    unknownCheckCount: counts.unknown,
    configuredLocalControlKeyCount,
    storeAvailable: input.storeAvailable !== false,
    processBoundaryAllowlistPassed: input.processBoundaryAllowlistPassed !== false,
    policyConfigHash,
    riskConfigHash,
    integrationConfigHash,
    rawValueStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: `Operator readiness report: ${counts.pass} pass, ${counts.warn} warn, ${counts.fail} fail.`,
  });
}

export function createConfigHashSummary(
  input: OperatorConfigInput,
  createdAt = foundationTimestamp(),
): ConfigHashSummary {
  const configured = input.configured ?? Boolean(input.text);
  const hash = configured ? readinessHash(input.text ?? input.name) : undefined;

  return ConfigHashSummarySchema.parse({
    id: stableId('config_hash_summary', `${input.kind}:${input.name}:${hash ?? 'missing'}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    name: input.name,
    kind: input.kind,
    configured,
    hash,
    itemCount: input.itemCount ?? (configured ? 1 : 0),
    rawValueStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: configured
      ? `${input.name} config is present and summarized by hash.`
      : `${input.name} config is missing.`,
  });
}

export function createIntegrationReadinessSummary(
  input: OperatorIntegrationInput,
  createdAt = foundationTimestamp(),
): IntegrationReadinessSummary {
  const blockers = [...(input.blockers ?? [])];
  const enabled = input.enabled ?? false;
  const envFlagConfigured = input.envFlagConfigured ?? enabled;
  const approvalRequired = input.approvalRequired ?? true;
  const safeToEnable = blockers.length === 0 && (!approvalRequired || envFlagConfigured);

  return IntegrationReadinessSummarySchema.parse({
    id: stableId('integration_readiness', input.name),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    name: input.name,
    enabled,
    defaultEnabled: input.defaultEnabled ?? false,
    riskLevel: input.riskLevel ?? 'medium',
    approvalRequired,
    evidenceRequired: input.evidenceRequired ?? true,
    auditRequired: input.auditRequired ?? true,
    processBoundary: input.processBoundary ?? false,
    networkBoundary: input.networkBoundary ?? false,
    safeToEnable,
    envFlagConfigured,
    localControlKeyConfigured: input.localControlKeyConfigured,
    configHash: input.configHash,
    blockers,
    safeEnableNotes: [...(input.safeEnableNotes ?? [])],
    rawValueStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: `${input.name} enabled=${enabled} approvalRequired=${approvalRequired} blockers=${blockers.length}.`,
  });
}

export function createOperatorReadinessCheck(
  input: {
    code: string;
    label: string;
    category: OperatorReadinessCheck['category'];
    status: OperatorReadinessStatus;
    required: boolean;
    configured?: boolean;
    hash?: string;
    blockers?: readonly string[];
    safeEnableNotes?: readonly string[];
    summary: string;
  },
  createdAt = foundationTimestamp(),
): OperatorReadinessCheck {
  return OperatorReadinessCheckSchema.parse({
    id: stableId('operator_readiness_check', input.code),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    code: input.code,
    label: input.label,
    category: input.category,
    status: input.status,
    required: input.required,
    configured: input.configured,
    hash: input.hash,
    blockers: [...(input.blockers ?? [])],
    safeEnableNotes: [...(input.safeEnableNotes ?? [])],
    rawValueStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: input.summary,
  });
}

export function createDefaultOperatorReadinessPreview(): OperatorReadinessReport {
  return createOperatorReadinessReport({
    storeAvailable: true,
    processBoundaryAllowlistPassed: true,
    noLiveAuditPassed: true,
    configs: createDefaultConfigInputs(),
    integrations: createDefaultIntegrationInputs(),
  });
}

export function createM10PilotChecklist(input: M10PilotChecklistInput = {}): M10PilotChecklist {
  const createdAt = foundationTimestamp();
  const readinessReport = input.readinessReport ?? createDefaultOperatorReadinessPreview();
  const approvalInboxItemCount = input.approvalInboxItemCount ?? 0;
  const governanceRunCount = input.governanceRunCount ?? 0;
  const integrations = new Map(
    readinessReport.integrations.map((integration) => [integration.name, integration]),
  );
  const worktree = integrations.get('worktree-manager');
  const codex = integrations.get('codex-cli');
  const nx = integrations.get('nx-affected');
  const storeBlockers = readinessReport.storeAvailable ? [] : ['store_unavailable'];
  const boundaryBlockers = readinessReport.processBoundaryAllowlistPassed
    ? []
    : ['process_boundary_allowlist_failed'];
  const worktreeBlockers = [
    ...(worktree?.safeToEnable ? [] : ['worktree_manager_not_safe_to_enable']),
    ...(worktree?.envFlagConfigured ? [] : ['worktree_manager_env_flag_missing']),
    ...(worktree?.blockers ?? []),
  ];
  const approvalBlockers =
    approvalInboxItemCount > 0 ? [] : ['approval_inbox_empty_for_pilot_rehearsal'];
  const governanceBlockers =
    governanceRunCount > 0 ? [] : ['governance_projection_has_no_recent_pilot_run'];
  const steps = [
    createM10PilotOperatorStep(
      {
        code: 'doctor_preflight',
        label: 'Doctor preflight',
        phase: 'preflight',
        required: true,
        blockers: [...storeBlockers, ...boundaryBlockers],
        safeEnableNotes: ['Run codexhub doctor before enabling the local pilot.'],
        readySummary: 'Doctor preflight is ready for the local pilot.',
        blockedSummary: 'Doctor preflight has blockers that must be resolved first.',
      },
      createdAt,
    ),
    createM10PilotOperatorStep(
      {
        code: 'worktree_enablement',
        label: 'Worktree manager enablement',
        phase: 'preflight',
        required: true,
        blockers: uniqueSorted(worktreeBlockers),
        safeEnableNotes: [
          'Enable worktree execution only with explicit env flags and persisted approval.',
        ],
        readySummary: 'Worktree manager enablement is ready for a governed pilot.',
        blockedSummary: 'Worktree manager remains disabled or unsafe to enable.',
      },
      createdAt,
    ),
    createM10PilotOperatorStep(
      {
        code: 'approval_inbox_review',
        label: 'Approval inbox review',
        phase: 'approval',
        required: true,
        blockers: approvalBlockers,
        safeEnableNotes: ['Approvals must be reviewed through the governed inbox.'],
        readySummary: 'Approval inbox has pilot-relevant records to review.',
        blockedSummary: 'Approval inbox has no pilot-relevant records yet.',
      },
      createdAt,
    ),
    createM10PilotOperatorStep(
      {
        code: 'codex_dry_run_only',
        label: 'Codex dry-run only',
        phase: 'pilot',
        required: true,
        blockers: codex ? [] : ['codex_cli_integration_missing'],
        safeEnableNotes: ['M10a does not run Codex; M9 pilot stays dry-run/read-only.'],
        readySummary: 'Codex pilot step is constrained to governed dry-run/read-only mode.',
        blockedSummary: 'Codex integration metadata is missing.',
      },
      createdAt,
    ),
    createM10PilotOperatorStep(
      {
        code: 'nx_verification_ready',
        label: 'Nx verification ready',
        phase: 'verification',
        required: true,
        blockers: nx ? [] : ['nx_verification_integration_missing'],
        safeEnableNotes: ['Nx verification remains limited to allowlisted targets.'],
        readySummary: 'Nx verification is ready for allowlisted affected checks.',
        blockedSummary: 'Nx verification integration metadata is missing.',
      },
      createdAt,
    ),
    createM10PilotOperatorStep(
      {
        code: 'governance_projection_review',
        label: 'Governance projection review',
        phase: 'review',
        required: true,
        blockers: governanceBlockers,
        safeEnableNotes: ['Review unified run, evidence, and audit summaries after rehearsal.'],
        readySummary: 'Governance projection has pilot metadata to inspect.',
        blockedSummary: 'Governance projection has no pilot metadata yet.',
      },
      createdAt,
    ),
    createM10PilotOperatorStep(
      {
        code: 'rollback_ready',
        label: 'Rollback readiness',
        phase: 'rollback',
        required: true,
        blockers: [],
        safeEnableNotes: ['Disable env flags and use governed cleanup if a worktree was created.'],
        readySummary: 'Rollback path is documented for the local pilot.',
        blockedSummary: 'Rollback path is missing.',
      },
      createdAt,
    ),
  ];
  const counts = countM10PilotSteps(steps);
  const status = deriveM10PilotChecklistStatus(counts);

  return M10PilotChecklistSchema.parse({
    id: stableId('m10_pilot_checklist', JSON.stringify([steps, governanceRunCount])),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    status,
    steps,
    readyStepCount: counts.ready + counts.done,
    blockedStepCount: counts.blocked,
    reviewStepCount: counts.review,
    requiredStepCount: steps.filter((step) => step.required).length,
    blockerCount: steps.reduce((total, step) => total + step.blockerCount, 0),
    integrationCount: readinessReport.integrations.length,
    configuredLocalControlKeyCount: readinessReport.configuredLocalControlKeyCount,
    governanceRunCount,
    approvalInboxItemCount,
    rawValueStored: false,
    rawPathStored: false,
    bodyStored: false,
    localControlKeyRead: false,
    supervisorPostAllowed: false,
    adapterExecuteAllowed: false,
    summary:
      status === 'ready'
        ? 'M10 pilot operator checklist is ready for a governed rehearsal.'
        : `M10 pilot operator checklist is ${status} with ${counts.blocked} blocked steps.`,
  });
}

export function createM10PilotRunbookSummary(input: {
  checklist?: M10PilotChecklist;
} = {}): M10PilotRunbookSummary {
  const createdAt = foundationTimestamp();
  const checklist = input.checklist ?? createM10PilotChecklist();
  const phaseCount = new Set(checklist.steps.map((step) => step.phase)).size;
  const nextAction =
    checklist.status === 'ready'
      ? 'Run the governed local pilot only after approvals and hash-bound runtime inputs are prepared.'
      : 'Resolve checklist blockers before enabling or rehearsing the local pilot.';

  return M10PilotRunbookSummarySchema.parse({
    id: stableId('m10_pilot_runbook_summary', checklist.id),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    checklistId: checklist.id,
    status: checklist.status,
    phaseCount,
    requiredStepCount: checklist.requiredStepCount,
    blockerCount: checklist.blockerCount,
    nextAction,
    rollbackSummary:
      'Disable pilot env flags, keep PR creation disabled, and use governed worktree cleanup metadata if a worktree was created.',
    rawValueStored: false,
    rawPathStored: false,
    bodyStored: false,
    localControlKeyRead: false,
    supervisorPostAllowed: false,
    adapterExecuteAllowed: false,
    summary: `M10 pilot runbook summary references checklist ${checklist.id} and remains read-only.`,
  });
}

function createDefaultConfigInputs(): OperatorConfigInput[] {
  return [
    { name: 'policies', kind: 'policy', text: 'policy-config-present', itemCount: 1 },
    { name: 'risk-matrix', kind: 'risk', text: 'risk-config-present', itemCount: 1 },
    { name: 'integrations', kind: 'integration', text: 'integrations-config-present', itemCount: 8 },
  ];
}

function createDefaultIntegrationInputs(): OperatorIntegrationInput[] {
  return [
    {
      name: 'codex-cli',
      enabled: true,
      defaultEnabled: true,
      riskLevel: 'medium',
      approvalRequired: true,
      processBoundary: true,
      safeEnableNotes: ['Codex runs still require policy, approval, evidence, and audit.'],
    },
    {
      name: 'nx-affected',
      enabled: true,
      defaultEnabled: true,
      riskLevel: 'low',
      approvalRequired: false,
      processBoundary: true,
      safeEnableNotes: ['Verification remains allowlisted to lint, test, and build targets.'],
    },
    {
      name: 'playwright-observer',
      enabled: false,
      riskLevel: 'high',
      approvalRequired: true,
      processBoundary: true,
      blockers: ['disabled_by_default'],
    },
    {
      name: 'electron-cdp',
      enabled: false,
      riskLevel: 'high',
      approvalRequired: true,
      networkBoundary: true,
      blockers: ['disabled_by_default'],
    },
    {
      name: 'worktree-manager',
      enabled: false,
      riskLevel: 'high',
      approvalRequired: true,
      processBoundary: true,
      blockers: ['disabled_by_default'],
    },
    {
      name: 'policy-backend',
      enabled: false,
      riskLevel: 'medium',
      approvalRequired: false,
      blockers: ['advisory_only'],
    },
    {
      name: 'otel-adapter',
      enabled: false,
      riskLevel: 'low',
      approvalRequired: false,
      blockers: ['local_projection_only'],
    },
  ];
}

function createM10PilotOperatorStep(
  input: {
    code: string;
    label: string;
    phase: M10PilotOperatorStepPhase;
    required: boolean;
    blockers: readonly string[];
    safeEnableNotes: readonly string[];
    readySummary: string;
    blockedSummary: string;
  },
  createdAt: string,
): M10PilotOperatorStep {
  const blockers = uniqueSorted(input.blockers);
  const status = deriveM10PilotStepStatus(blockers);

  return M10PilotOperatorStepSchema.parse({
    id: stableId('m10_pilot_operator_step', input.code),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    code: input.code,
    label: input.label,
    phase: input.phase,
    status,
    required: input.required,
    blockerCount: blockers.length,
    blockers,
    safeEnableNotes: [...input.safeEnableNotes],
    evidenceRefIds: [],
    auditEventIds: [],
    rawValueStored: false,
    rawPathStored: false,
    bodyStored: false,
    localControlKeyRead: false,
    supervisorPostAllowed: false,
    adapterExecuteAllowed: false,
    summary: blockers.length > 0 ? input.blockedSummary : input.readySummary,
  });
}

function deriveM10PilotStepStatus(
  blockers: readonly string[],
): M10PilotOperatorStepStatus {
  return blockers.length > 0 ? 'blocked' : 'ready';
}

function countM10PilotSteps(
  steps: readonly M10PilotOperatorStep[],
): Record<M10PilotOperatorStepStatus, number> {
  return steps.reduce<Record<M10PilotOperatorStepStatus, number>>(
    (counts, step) => ({
      ...counts,
      [step.status]: counts[step.status] + 1,
    }),
    { ready: 0, blocked: 0, review: 0, done: 0 },
  );
}

function deriveM10PilotChecklistStatus(
  counts: Record<M10PilotOperatorStepStatus, number>,
): M10PilotChecklistStatus {
  if (counts.blocked > 0) {
    return 'blocked';
  }

  if (counts.review > 0) {
    return 'review';
  }

  return 'ready';
}

function countChecks(checks: readonly OperatorReadinessCheck[]): Record<OperatorReadinessStatus, number> {
  return checks.reduce<Record<OperatorReadinessStatus, number>>(
    (counts, check) => ({
      ...counts,
      [check.status]: counts[check.status] + 1,
    }),
    { pass: 0, warn: 0, fail: 0, unknown: 0 },
  );
}

function deriveReportStatus(
  counts: Record<OperatorReadinessStatus, number>,
): OperatorReadinessStatus {
  if (counts.fail > 0) {
    return 'fail';
  }

  if (counts.warn > 0) {
    return 'warn';
  }

  if (counts.unknown > 0) {
    return 'unknown';
  }

  return 'pass';
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function readinessHash(value: string): string {
  return `readiness:${stableDigest(value)}`;
}

function stableId(prefix: string, value: string): string {
  return `${prefix}_${stableDigest(value).slice(0, 16)}`;
}

function stableDigest(value: string): string {
  let hashA = 0x811c9dc5;
  let hashB = 0x01000193;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    hashA = Math.imul(hashA ^ code, 0x01000193);
    hashB = Math.imul(hashB ^ code, 0x811c9dc5);
  }

  return `${(hashA >>> 0).toString(16).padStart(8, '0')}${(hashB >>> 0)
    .toString(16)
    .padStart(8, '0')}`;
}
