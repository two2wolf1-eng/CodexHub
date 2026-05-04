import {
  ConfigHashSummarySchema,
  IntegrationReadinessSummarySchema,
  OperatorReadinessCheckSchema,
  OperatorReadinessReportSchema,
  SchemaVersionSchema,
  foundationTimestamp,
  type ConfigHashSummary,
  type IntegrationReadinessSummary,
  type OperatorReadinessCheck,
  type OperatorReadinessReport,
  type OperatorReadinessStatus,
  type RiskLevel,
} from '@codexhub/contracts';

export type {
  ConfigHashSummary,
  IntegrationReadinessSummary,
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
