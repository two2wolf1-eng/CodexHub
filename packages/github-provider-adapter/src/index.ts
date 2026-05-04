import {
  CapabilityManifestSchema,
  GithubMetadataDryRunRecordSchema,
  GithubRemoteRefSummarySchema,
  GithubTokenReadinessSchema,
  PolicyDecisionSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
  type CapabilityManifest,
  type GithubMetadataDryRunRecord,
  type GithubRemoteRefSummary,
  type GithubTokenReadiness,
  type PolicyDecision,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

export const GITHUB_PROVIDER_NAME = 'github-provider';
export const GITHUB_PROVIDER_ALLOWED_HOST = 'api.github.com';
export const GITHUB_PROVIDER_TOKEN_ENV = 'CODEXHUB_GITHUB_TOKEN';

export interface GithubRemoteRefInput {
  owner: string;
  repo: string;
  baseBranch?: string;
  headBranch?: string;
  now?: () => string;
}

export interface GithubMetadataPlanInput extends GithubRemoteRefInput {
  requestedMetadata?: Array<'repo' | 'base_branch' | 'head_branch' | 'existing_pull_request'>;
  runnerMode?: 'planning-only' | 'controlled-github-http';
  now?: () => string;
}

export function createGithubProviderManifest(now: () => string = foundationTimestamp): CapabilityManifest {
  return CapabilityManifestSchema.parse({
    id: 'github_provider_manifest',
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    name: GITHUB_PROVIDER_NAME,
    kind: 'git',
    version: '0.1.0-m15a',
    provider: 'external-network',
    capabilities: [
      'token-readiness',
      'remote-repository-metadata-plan',
      'remote-branch-metadata-plan',
      'existing-pull-request-lookup-plan',
    ],
    defaultRisk: 'high',
    defaultActionMode: 'read',
    requiresApprovalByDefault: true,
    evidencePolicy: {
      collect: true,
      redactMetadata: true,
      bodyStorage: 'hash-only',
    },
    processBoundary: {
      mayStartExternalProcess: false,
      requiresProcessAudit: false,
    },
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      productDefaultEnabled: false,
      networkBoundaryDefaultEnabled: false,
      allowedHostHash: stableHash(GITHUB_PROVIDER_ALLOWED_HOST),
      pushAllowed: false,
      createRefAllowed: false,
      mergeAllowed: false,
    },
  });
}

export const GITHUB_PROVIDER_MANIFEST = createGithubProviderManifest(() =>
  '2026-05-04T00:00:00.000Z',
);

export function readGithubTokenReadiness(
  env: Pick<NodeJS.ProcessEnv, string> = process.env,
  now: () => string = foundationTimestamp,
): GithubTokenReadiness {
  const value = env[GITHUB_PROVIDER_TOKEN_ENV];
  const configured = typeof value === 'string' && value.length > 0;

  return GithubTokenReadinessSchema.parse({
    id: stableId('github_token_readiness', configured ? 'configured' : 'missing'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    providerName: GITHUB_PROVIDER_NAME,
    envVarNameHash: stableHash(GITHUB_PROVIDER_TOKEN_ENV),
    tokenConfigured: configured,
    tokenHash: configured ? stableHash(value) : undefined,
    tokenValueStored: false,
    rawValueStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      configured,
      envVarNameHash: stableHash(GITHUB_PROVIDER_TOKEN_ENV),
    },
    summary: configured
      ? 'GitHub provider credential is configured; only a hash is exposed.'
      : 'GitHub provider credential is missing.',
  });
}

export function createGithubRemoteRefSummary(input: GithubRemoteRefInput): GithubRemoteRefSummary {
  const now = input.now ?? foundationTimestamp;
  const blockReason = validateRemoteRefInput(input);

  if (blockReason) {
    throw new Error(blockReason);
  }

  return GithubRemoteRefSummarySchema.parse({
    id: stableId(
      'github_remote_ref',
      [input.owner, input.repo, input.baseBranch ?? 'none', input.headBranch ?? 'none'].join(':'),
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    hostHash: stableHash(GITHUB_PROVIDER_ALLOWED_HOST),
    ownerHash: stableHash(input.owner),
    repoHash: stableHash(input.repo),
    baseBranchHash: input.baseBranch ? stableHash(input.baseBranch) : undefined,
    headBranchHash: input.headBranch ? stableHash(input.headBranch) : undefined,
    allowedHost: GITHUB_PROVIDER_ALLOWED_HOST,
    rawOwnerStored: false,
    rawRepoStored: false,
    rawRefStored: false,
    rawUrlStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      hostHash: stableHash(GITHUB_PROVIDER_ALLOWED_HOST),
      ownerHash: stableHash(input.owner),
      repoHash: stableHash(input.repo),
      baseBranchPresent: Boolean(input.baseBranch),
      headBranchPresent: Boolean(input.headBranch),
    },
    summary: 'GitHub remote target stores owner/repo/ref hashes only.',
  });
}

export function createGithubMetadataDryRunRecord(
  input: GithubMetadataPlanInput,
): GithubMetadataDryRunRecord {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = collectPlanBlockReasons(input);
  const targetRef =
    blockReasons.length === 0
      ? createGithubRemoteRefSummary(input)
      : createBlockedGithubRemoteRefSummary(input, now);
  const requestedMetadata = input.requestedMetadata ?? [
    'repo',
    'base_branch',
    'head_branch',
    'existing_pull_request',
  ];
  const status = blockReasons.length === 0 ? 'planned' : 'blocked';
  const dryRunId = stableId(
    'github_metadata_dry_run',
    JSON.stringify({
      ownerHash: targetRef.ownerHash,
      repoHash: targetRef.repoHash,
      baseBranchHash: targetRef.baseBranchHash,
      headBranchHash: targetRef.headBranchHash,
      requestedMetadata,
    }),
  );
  const policyDecision = createGithubPolicyDecision({
    actionId: dryRunId,
    actionType: 'github.metadata.read',
    actionMode: 'read',
    now,
    allow: false,
    reasons: ['remote GitHub metadata observation requires persisted approval'],
  });

  return GithubMetadataDryRunRecordSchema.parse({
    id: stableId('github_metadata_dry_run_record', dryRunId),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId,
    status,
    runnerMode: input.runnerMode ?? 'planning-only',
    targetRef,
    requestedMetadata,
    blockReasons,
    policyDecision,
    requiresApproval: true,
    evidenceRefs: [],
    auditEventIds: [foundationId('audit')],
    networkBoundaryPlanned: status === 'planned' && input.runnerMode === 'controlled-github-http',
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      ownerHash: targetRef.ownerHash,
      repoHash: targetRef.repoHash,
      requestedMetadataCount: requestedMetadata.length,
      productDefaultEnabled: false,
    },
    summary:
      status === 'planned'
        ? 'GitHub metadata dry-run is planned; execution remains disabled until approval and env enablement.'
        : `GitHub metadata dry-run is blocked: ${blockReasons.join(', ')}.`,
  });
}

function createGithubPolicyDecision(input: {
  actionId: string;
  actionType: string;
  actionMode: 'read' | 'write';
  allow: boolean;
  reasons: string[];
  now: () => string;
}): PolicyDecision {
  return PolicyDecisionSchema.parse({
    id: stableId('policy_github_provider', `${input.actionType}:${input.actionId}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    actionId: input.actionId,
    actionType: input.actionType,
    actionMode: input.actionMode,
    riskLevel: 'high',
    outcome: input.allow ? 'allow' : 'approval_required',
    reasons: input.reasons,
    requiresDryRun: true,
    requiresApproval: true,
    allow: input.allow,
  });
}

function createBlockedGithubRemoteRefSummary(
  input: GithubRemoteRefInput,
  now: () => string,
): GithubRemoteRefSummary {
  return GithubRemoteRefSummarySchema.parse({
    id: stableId('github_remote_ref_blocked', JSON.stringify(input)),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    hostHash: stableHash(GITHUB_PROVIDER_ALLOWED_HOST),
    ownerHash: input.owner ? stableHash(input.owner) : stableHash('missing-owner'),
    repoHash: input.repo ? stableHash(input.repo) : stableHash('missing-repo'),
    baseBranchHash: input.baseBranch ? stableHash(input.baseBranch) : undefined,
    headBranchHash: input.headBranch ? stableHash(input.headBranch) : undefined,
    allowedHost: GITHUB_PROVIDER_ALLOWED_HOST,
    rawOwnerStored: false,
    rawRepoStored: false,
    rawRefStored: false,
    rawUrlStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      blocked: true,
    },
    summary: 'Blocked GitHub remote target stores only placeholder hashes.',
  });
}

function collectPlanBlockReasons(input: GithubMetadataPlanInput): string[] {
  return [
    validateRemoteRefInput(input),
    validateRequestedMetadata(input.requestedMetadata ?? []),
  ].filter((reason): reason is string => Boolean(reason));
}

function validateRemoteRefInput(input: GithubRemoteRefInput): string | undefined {
  if (!isSafeGithubName(input.owner)) {
    return 'invalid_owner';
  }

  if (!isSafeGithubName(input.repo)) {
    return 'invalid_repo';
  }

  if (input.baseBranch && !isSafeGithubRef(input.baseBranch)) {
    return 'invalid_base_branch';
  }

  if (input.headBranch && !isSafeGithubRef(input.headBranch)) {
    return 'invalid_head_branch';
  }

  return undefined;
}

function validateRequestedMetadata(
  requestedMetadata: readonly string[],
): string | undefined {
  const allowed = new Set(['repo', 'base_branch', 'head_branch', 'existing_pull_request']);

  return requestedMetadata.every((item) => allowed.has(item))
    ? undefined
    : 'unsupported_metadata_request';
}

function isSafeGithubName(value: string | undefined): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_.-]{1,100}$/.test(value);
}

function isSafeGithubRef(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= 160 &&
    !value.startsWith('/') &&
    !value.endsWith('/') &&
    !value.includes('..') &&
    /^[A-Za-z0-9._/-]+$/.test(value)
  );
}

function stableId(prefix: string, seed: string): string {
  return `${prefix}_${hashText(seed).slice(0, 16)}`;
}

function stableHash(value: string): string {
  return `sha256:${hashText(value)}`;
}
