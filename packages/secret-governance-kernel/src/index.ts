import {
  type ConfiguredSecretReferenceSummary,
  ConfiguredSecretReferenceSummarySchema,
  type DeploymentEnvironment,
  type EvidenceRef,
  type PolicyDecision,
  PolicyDecisionSchema,
  SchemaVersionSchema,
  type SecretGovernanceAcceptanceRehearsalRun,
  SecretGovernanceAcceptanceRehearsalRunSchema,
  type SecretGovernanceAcceptanceScenario,
  type SecretLeakAuditSummary,
  SecretLeakAuditSummarySchema,
  type SecretProvider,
  type SecretProviderManifest,
  SecretProviderManifestSchema,
  type SecretProviderReadiness,
  SecretProviderReadinessSchema,
  type SecretReadinessApprovalArtifact,
  SecretReadinessApprovalArtifactSchema,
  type SecretReadinessPlan,
  SecretReadinessPlanSchema,
  type SecretReadinessRun,
  SecretReadinessRunSchema,
  type SecretEnvironmentReadiness,
  SecretEnvironmentReadinessSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

export interface SecretProviderManifestInput {
  provider: SecretProvider;
  implemented?: boolean;
  now?: () => string;
}

export interface ConfiguredSecretReferenceInput {
  provider: SecretProvider;
  environment: DeploymentEnvironment;
  reference?: string;
  purpose?: string;
  configured?: boolean;
  now?: () => string;
}

export interface SecretProviderReadinessInput {
  provider: SecretProvider;
  governanceEnabled?: boolean;
  providerEnabled?: boolean;
  configured?: boolean;
  config?: string;
  referenceSummaries?: readonly ConfiguredSecretReferenceSummary[];
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface SecretEnvironmentReadinessInput {
  environment: DeploymentEnvironment;
  governanceEnabled?: boolean;
  providerReadiness: readonly SecretProviderReadiness[];
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface SecretLeakAuditSummaryInput {
  scannedSurfaceCount?: number;
  findingHashes?: readonly string[];
  now?: () => string;
}

export interface SecretReadinessPlanInput {
  provider: SecretProvider;
  environment: DeploymentEnvironment;
  config?: string;
  expectedReferenceCount?: number;
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface SecretReadinessApprovalInput {
  dryRunRecord: SecretReadinessPlan;
  baseRecord?: SecretReadinessApprovalArtifact;
  status: 'requested' | 'approved' | 'denied' | 'expired' | 'used' | 'revoked';
  requestedBy?: string;
  decidedBy?: string;
  reason?: string;
  now?: () => string;
}

export interface SecretReadinessRunInput {
  plan: SecretReadinessPlan;
  providerReadiness?: SecretProviderReadiness;
  environmentReadiness?: SecretEnvironmentReadiness;
  referenceSummaries?: readonly ConfiguredSecretReferenceSummary[];
  leakAuditSummary?: SecretLeakAuditSummary;
  status?: 'completed' | 'failed' | 'blocked' | 'aborted';
  blockReasons?: readonly string[];
  now?: () => string;
}

export function createSecretProviderManifest(
  input: SecretProviderManifestInput,
): SecretProviderManifest {
  const now = input.now ?? foundationTimestamp;
  return SecretProviderManifestSchema.parse({
    id: foundationId('secret_provider_manifest'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    name: 'secret-governance-kernel',
    provider: input.provider,
    version: '0.1.0',
    implemented: input.implemented ?? true,
    defaultEnabled: false,
    actionMode: 'read',
    riskLevel: 'high',
    readinessOnly: true,
    secretValueReadAllowed: false,
    secretValueStored: false,
    tokenValueStored: false,
    rawConfigStored: false,
    bodyStored: false,
    summary: `${input.provider} readiness is configured/hash-only and disabled by default.`,
  });
}

export function createConfiguredSecretReferenceSummary(
  input: ConfiguredSecretReferenceInput,
): ConfiguredSecretReferenceSummary {
  const now = input.now ?? foundationTimestamp;
  return ConfiguredSecretReferenceSummarySchema.parse({
    id: foundationId('secret_reference_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    provider: input.provider,
    environment: input.environment,
    referenceHash: hashText(input.reference ?? `${input.provider}:${input.environment}:reference`),
    purposeHash: input.purpose ? hashText(input.purpose) : undefined,
    configured: input.configured ?? false,
    secretValueStored: false,
    tokenValueStored: false,
    rawReferenceStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: `${input.provider} secret reference is represented by hash only.`,
  });
}

export function createSecretProviderReadiness(
  input: SecretProviderReadinessInput,
): SecretProviderReadiness {
  const now = input.now ?? foundationTimestamp;
  const referenceSummaries = [...(input.referenceSummaries ?? [])];
  const configuredRefs = referenceSummaries
    .filter((reference) => reference.configured)
    .map((reference) => reference.referenceHash);
  const blockReasons = [
    ...(input.blockReasons ?? []),
    ...(input.governanceEnabled ? [] : ['secrets_governance_disabled']),
    ...(input.providerEnabled ? [] : [`secrets_${input.provider}_readiness_disabled`]),
    ...(input.configured ? [] : ['secret_provider_config_missing']),
  ];

  return SecretProviderReadinessSchema.parse({
    id: foundationId('secret_provider_readiness'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    provider: input.provider,
    governanceEnabled: input.governanceEnabled ?? false,
    providerEnabled: input.providerEnabled ?? false,
    configured: input.configured ?? false,
    configHash: input.configured ? hashText(input.config ?? `${input.provider}:config`) : undefined,
    secretRefCount: referenceSummaries.length,
    configuredRefHashes: configuredRefs,
    blockerCount: blockReasons.length,
    blockReasons,
    secretValueReadAllowed: false,
    secretValueStored: false,
    tokenValueStored: false,
    envValueStored: false,
    rawConfigStored: false,
    rawPathStored: false,
    rawUrlStored: false,
    bodyStored: false,
    summary:
      blockReasons.length > 0
        ? `${input.provider} secret readiness is blocked.`
        : `${input.provider} secret readiness is configured/hash-only.`,
  });
}

export function createSecretEnvironmentReadiness(
  input: SecretEnvironmentReadinessInput,
): SecretEnvironmentReadiness {
  const now = input.now ?? foundationTimestamp;
  const providerReadiness = [...input.providerReadiness];
  const configuredProviderCount = providerReadiness.filter((provider) => provider.configured).length;
  const configuredReferenceCount = providerReadiness.reduce(
    (total, provider) => total + provider.configuredRefHashes.length,
    0,
  );
  const blockReasons = [...(input.blockReasons ?? [])];

  return SecretEnvironmentReadinessSchema.parse({
    id: foundationId('secret_environment_readiness'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    environment: input.environment,
    governanceEnabled: input.governanceEnabled ?? false,
    providerCount: providerReadiness.length,
    configuredProviderCount,
    missingProviderCount: providerReadiness.length - configuredProviderCount,
    configuredReferenceCount,
    blockerCount: blockReasons.length,
    blockReasons,
    secretValueStored: false,
    tokenValueStored: false,
    envValueStored: false,
    rawConfigStored: false,
    bodyStored: false,
    summary: `${input.environment} secret environment readiness stores counts only.`,
  });
}

export function createSecretLeakAuditSummary(
  input: SecretLeakAuditSummaryInput = {},
): SecretLeakAuditSummary {
  const now = input.now ?? foundationTimestamp;
  const findingHashes = [...(input.findingHashes ?? [])];
  return SecretLeakAuditSummarySchema.parse({
    id: foundationId('secret_leak_audit_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    scannedSurfaceCount: input.scannedSurfaceCount ?? 0,
    findingCount: findingHashes.length,
    leakDetected: findingHashes.length > 0,
    findingHashes,
    secretValueStored: false,
    tokenValueStored: false,
    envValueStored: false,
    rawConfigStored: false,
    rawPathStored: false,
    rawUrlStored: false,
    bodyStored: false,
    summary:
      findingHashes.length > 0
        ? 'Secret leak audit detected hashed findings.'
        : 'Secret leak audit found no metadata leaks.',
  });
}

export function createSecretReadinessPlan(input: SecretReadinessPlanInput): SecretReadinessPlan {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = [...(input.blockReasons ?? [])];
  return SecretReadinessPlanSchema.parse({
    id: foundationId('secret_readiness_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: foundationId('secret_readiness_dry_run'),
    status: blockReasons.length > 0 ? 'blocked' : 'planned',
    provider: input.provider,
    environment: input.environment,
    configHash: input.config ? hashText(input.config) : undefined,
    expectedReferenceCount: input.expectedReferenceCount ?? 0,
    blockReasons,
    policyDecision: createSecretReadinessPolicyDecision(input.provider, input.environment, now),
    requiresApproval: true,
    evidenceRefs: [
      createSecretEvidenceRef(
        'secrets.readiness_plan',
        hashText(`${input.provider}:${input.environment}:readiness-plan`),
        'Secret readiness plan stores hashes only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_secret_readiness_plan')],
    processBoundaryPlanned: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    secretValueReadAllowed: false,
    secretValueStored: false,
    tokenValueStored: false,
    envValueStored: false,
    rawConfigStored: false,
    rawPathStored: false,
    rawUrlStored: false,
    bodyStored: false,
    summary:
      blockReasons.length > 0
        ? `${input.provider} secret readiness is blocked before value access.`
        : `${input.provider} secret readiness is planned without value access.`,
  });
}

export function createSecretReadinessApprovalRecord(
  input: SecretReadinessApprovalInput,
): SecretReadinessApprovalArtifact {
  const now = input.now ?? foundationTimestamp;
  const status = input.status;
  const requestedIdentity = input.requestedBy ?? input.baseRecord?.approverHash ?? 'operator';
  const decidedIdentity = input.decidedBy ?? input.baseRecord?.approverHash ?? requestedIdentity;
  const reason = input.reason ?? input.baseRecord?.reasonSummary ?? `${status} secret readiness`;

  return SecretReadinessApprovalArtifactSchema.parse({
    id: foundationId('secret_readiness_approval'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: input.dryRunRecord.dryRunId,
    dryRunRecordId: input.dryRunRecord.id,
    approvalRequestId: input.baseRecord?.approvalRequestId ?? foundationId('secret_readiness_approval_request'),
    approvalArtifactId:
      input.baseRecord?.approvalArtifactId ?? foundationId('secret_readiness_approval_artifact'),
    status,
    approved: status === 'approved',
    policyDecisionId: input.dryRunRecord.policyDecision.id,
    provider: input.dryRunRecord.provider,
    environment: input.dryRunRecord.environment,
    expectedPlanHash: hashText(JSON.stringify(input.dryRunRecord)),
    approvedAt: status === 'approved' ? now() : input.baseRecord?.approvedAt,
    usedAt: status === 'used' ? now() : undefined,
    deniedAt: status === 'denied' ? now() : undefined,
    revokedAt: status === 'revoked' ? now() : undefined,
    reasonHash: hashText(reason),
    reasonSummary: `${status} secret readiness approval metadata.`,
    approverHash: hashText(status === 'requested' ? requestedIdentity : decidedIdentity),
    evidenceRefs: [
      createSecretEvidenceRef(
        'secrets.readiness_summary',
        hashText(`${input.dryRunRecord.provider}:${status}:secret-approval`),
        'Secret readiness approval stores hashes only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_secret_readiness_approval')],
    secretValueStored: false,
    tokenValueStored: false,
    envValueStored: false,
    rawConfigStored: false,
    rawPathStored: false,
    rawUrlStored: false,
    bodyStored: false,
    summary: `${status} secret readiness approval for ${input.dryRunRecord.provider}.`,
  });
}

export function createSecretReadinessRun(input: SecretReadinessRunInput): SecretReadinessRun {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = [...(input.blockReasons ?? [])];
  const referenceSummaries = [
    ...(input.referenceSummaries ??
      [
        createConfiguredSecretReferenceSummary({
          provider: input.plan.provider,
          environment: input.plan.environment,
          configured: input.plan.status === 'planned',
          now,
        }),
      ]),
  ];
  const providerReadiness =
    input.providerReadiness ??
    createSecretProviderReadiness({
      provider: input.plan.provider,
      governanceEnabled: true,
      providerEnabled: input.plan.status === 'planned',
      configured: input.plan.status === 'planned',
      referenceSummaries,
      now,
    });
  const environmentReadiness =
    input.environmentReadiness ??
    createSecretEnvironmentReadiness({
      environment: input.plan.environment,
      governanceEnabled: true,
      providerReadiness: [providerReadiness],
      now,
    });
  const status = input.status ?? (blockReasons.length > 0 ? 'blocked' : 'completed');

  return SecretReadinessRunSchema.parse({
    id: foundationId('secret_readiness_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    status,
    plan: input.plan,
    providerReadiness,
    environmentReadiness,
    referenceSummaries,
    leakAuditSummary: input.leakAuditSummary ?? createSecretLeakAuditSummary({ scannedSurfaceCount: 4, now }),
    blockReasons,
    evidenceRefs: [
      createSecretEvidenceRef(
        'secrets.readiness_summary',
        hashText(`${input.plan.provider}:${input.plan.environment}:${status}:readiness-run`),
        'Secret readiness run stores hashes only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_secret_readiness_run')],
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    secretValueReadAllowed: false,
    secretValueStored: false,
    tokenValueStored: false,
    envValueStored: false,
    rawConfigStored: false,
    rawPathStored: false,
    rawUrlStored: false,
    bodyStored: false,
    summary: `${input.plan.provider} secret readiness finished with ${status}.`,
  });
}

export function runSecretGovernanceAcceptanceRehearsal(input: {
  provider: SecretProvider;
  environment?: DeploymentEnvironment;
  scenario: SecretGovernanceAcceptanceScenario;
  now?: () => string;
}): SecretGovernanceAcceptanceRehearsalRun {
  const now = input.now ?? foundationTimestamp;
  const passed = input.scenario === 'all-pass';

  return SecretGovernanceAcceptanceRehearsalRunSchema.parse({
    id: foundationId('secret_governance_rehearsal'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    scenario: input.scenario,
    provider: input.provider,
    environment: input.environment ?? 'staging',
    status: passed ? 'passed' : input.scenario === 'leak-audit-failed' ? 'failed' : 'blocked',
    readinessStatus:
      input.scenario === 'provider-disabled' || input.scenario === 'config-missing'
        ? 'blocked'
        : 'fixture_completed',
    leakAuditStatus: input.scenario === 'leak-audit-failed' ? 'failed' : 'fixture_completed',
    stepCount: 3,
    blockerCount: passed ? 0 : 1,
    evidenceRefCount: 2,
    auditEventCount: 2,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    secretValueReadAllowed: false,
    secretValueStored: false,
    tokenValueStored: false,
    envValueStored: false,
    rawConfigStored: false,
    rawPathStored: false,
    rawUrlStored: false,
    bodyStored: false,
    summary: passed
      ? `${input.provider} secret governance rehearsal passed with fixture metadata.`
      : `${input.provider} secret governance rehearsal blocked for ${input.scenario}.`,
  });
}

function createSecretReadinessPolicyDecision(
  provider: SecretProvider,
  environment: DeploymentEnvironment,
  now: () => string,
): PolicyDecision {
  return PolicyDecisionSchema.parse({
    id: foundationId('policy_secret_readiness'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    actionId: foundationId('secret_readiness'),
    actionType: `secrets.${provider}.${environment}.readiness`,
    actionMode: 'read',
    riskLevel: 'high',
    outcome: 'approval_required',
    reasons: ['secret readiness is metadata-only but still approval-gated'],
    requiresDryRun: true,
    requiresApproval: true,
  });
}

function createSecretEvidenceRef(
  kind: EvidenceRef['kind'],
  hash: string,
  summary: string,
  now: () => string,
): EvidenceRef {
  return {
    id: foundationId('evidence_secret_governance'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    kind,
    hash,
    summary,
    redacted: true,
    labels: ['metadata-only'],
  };
}
