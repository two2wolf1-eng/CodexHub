import {
  CapabilityManifestSchema,
  ExecutionAuthoritySchema,
  GithubDraftPrApprovalArtifactRecordSchema,
  GithubDraftPrCreationSummarySchema,
  GithubDraftPrPlanSchema,
  GithubDraftPrReadinessSchema,
  GithubDraftPrRunSchema,
  GithubMetadataApprovalArtifactRecordSchema,
  GithubMetadataControlPlaneRunSchema,
  GithubMetadataDryRunRecordSchema,
  GithubRemoteRefSummarySchema,
  GithubTokenReadinessSchema,
  PolicyDecisionSchema,
  RemotePrAuditChainSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
  type CapabilityManifest,
  type ExecutionAuthority,
  type GithubDraftPrApprovalArtifactRecord,
  type GithubDraftPrCreationSummary,
  type GithubDraftPrPlan,
  type GithubDraftPrReadiness,
  type GithubDraftPrReadinessStatus,
  type GithubDraftPrRun,
  type GithubDraftPrRunnerMode,
  type GithubDraftPrSourceKind,
  type GithubMetadataApprovalArtifactRecord,
  type GithubMetadataControlPlaneRun,
  type GithubMetadataDryRunRecord,
  type GithubProviderApprovalStatus,
  type GithubRemoteRefSummary,
  type GithubTokenReadiness,
  type PolicyDecision,
  type RemotePrAuditChain,
} from '@codexhub/contracts';
import { createEvidenceRef, hashText } from '@codexhub/evidence-kernel';
import {
  runGithubDraftPrHttpBoundary,
  runGithubMetadataHttpBoundary,
  type GithubHttpBoundaryRequest,
} from './github-http-boundary';

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

export interface GithubDraftPrPlanInput extends GithubRemoteRefInput {
  sourceKind: GithubDraftPrSourceKind;
  sourceId: string;
  sourceSummary: string;
  titleSummary: string;
  bodySectionSummaries: string[];
  existingPullRequestCount?: number;
  remoteHeadBranchExists?: boolean;
  metadataReady?: boolean;
  runnerMode?: GithubDraftPrRunnerMode;
  now?: () => string;
}

export interface GithubMetadataApprovalInput {
  dryRunRecord: GithubMetadataDryRunRecord;
  baseRecord?: GithubMetadataApprovalArtifactRecord;
  status: GithubProviderApprovalStatus;
  requestedBy?: string;
  decidedBy?: string;
  reason?: string;
  now?: () => string;
}

export interface GithubDraftPrApprovalInput {
  dryRunRecord: GithubDraftPrPlan;
  baseRecord?: GithubDraftPrApprovalArtifactRecord;
  status: GithubProviderApprovalStatus;
  requestedBy?: string;
  decidedBy?: string;
  reason?: string;
  now?: () => string;
}

export interface GithubMetadataExecutionInput {
  dryRunRecord: GithubMetadataDryRunRecord;
  approvalRecord?: GithubMetadataApprovalArtifactRecord;
  authority?: ExecutionAuthority;
  runtime: Omit<GithubHttpBoundaryRequest, 'fetchImpl' | 'token'> & {
    token?: string;
  };
  enabled?: boolean;
  fetchImpl?: typeof fetch;
  now?: () => string;
}

export interface GithubDraftPrExecutionInput {
  dryRunRecord: GithubDraftPrPlan;
  approvalRecord?: GithubDraftPrApprovalArtifactRecord;
  authority?: ExecutionAuthority;
  runtime: Omit<GithubHttpBoundaryRequest, 'fetchImpl' | 'token'> & {
    baseBranch: string;
    headBranch: string;
    titleSummary: string;
    bodySectionSummaries: string[];
    token?: string;
  };
  enabled?: boolean;
  fetchImpl?: typeof fetch;
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
      'existing-branch-draft-pr-plan',
      'draft-pr-readiness-projection',
      'existing-branch-draft-pr-create',
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
      draftPullRequestPlanningOnly: true,
      draftPullRequestCreationEnabled: false,
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
    evidenceRefs: [
      createGithubEvidenceRef({
        kind: 'github.provider_plan',
        label: 'github-provider-plan',
        summary: 'GitHub metadata dry-run stores remote owner/repo/ref hashes only.',
        metadata: {
          integration: GITHUB_PROVIDER_NAME,
          dryRunIdHash: stableHash(dryRunId),
          ownerHash: targetRef.ownerHash,
          repoHash: targetRef.repoHash,
          requestedMetadataCount: requestedMetadata.length,
        },
      }),
    ],
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

export function createGithubDraftPrPlan(input: GithubDraftPrPlanInput): GithubDraftPrPlan {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = collectDraftPrPlanBlockReasons(input);
  const targetRef =
    blockReasons.includes('invalid_owner') ||
    blockReasons.includes('invalid_repo') ||
    blockReasons.includes('invalid_base_branch') ||
    blockReasons.includes('invalid_head_branch')
      ? createBlockedGithubRemoteRefSummary(input, now)
      : createGithubRemoteRefSummary(input);
  const status = blockReasons.length === 0 ? 'planned' : 'blocked';
  const titleHash = stableHash(input.titleSummary);
  const bodyHash = stableHash(JSON.stringify(input.bodySectionSummaries));
  const bodyCharacterCount = input.bodySectionSummaries.reduce(
    (total, section) => total + section.length,
    0,
  );
  const readiness = createGithubDraftPrReadiness({
    input,
    targetRef,
    blockReasons,
    now,
  });
  const dryRunId = stableId(
    'github_draft_pr_dry_run',
    JSON.stringify({
      sourceKind: input.sourceKind,
      sourceIdHash: stableHash(input.sourceId),
      sourceSummaryHash: stableHash(input.sourceSummary),
      targetRefId: targetRef.id,
      titleHash,
      bodyHash,
      runnerMode: input.runnerMode ?? 'planning-only',
    }),
  );
  const policyDecision = createGithubPolicyDecision({
    actionId: dryRunId,
    actionType: 'github.draft_pr.create',
    actionMode: 'write',
    now,
    allow: false,
    reasons: ['remote draft PR creation requires persisted approval'],
  });

  return GithubDraftPrPlanSchema.parse({
    id: stableId('github_draft_pr_plan', dryRunId),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId,
    status,
    runnerMode: input.runnerMode ?? 'planning-only',
    readiness,
    titleHash,
    bodyHash,
    bodySectionCount: input.bodySectionSummaries.length,
    bodyCharacterCount,
    blockReasons,
    policyDecision,
    requiresApproval: true,
    networkBoundaryPlanned:
      status === 'planned' && input.runnerMode === 'controlled-github-draft-pr',
    networkBoundaryInvoked: false,
    draft: true,
    pushAllowed: false,
    createRefAllowed: false,
    mergeAllowed: false,
    rawPrBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    evidenceRefs: [
      createGithubEvidenceRef({
        kind: 'github.draft_pr_plan',
        label: 'github-draft-pr-plan',
        summary: 'GitHub draft PR plan stores remote refs and generated body as hashes only.',
        metadata: {
          integration: GITHUB_PROVIDER_NAME,
          dryRunIdHash: stableHash(dryRunId),
          sourceKind: input.sourceKind,
          sourceIdHash: stableHash(input.sourceId),
          targetRefIdHash: stableHash(targetRef.id),
          titleHash,
          bodyHash,
          bodySectionCount: input.bodySectionSummaries.length,
          blockerCount: blockReasons.length,
        },
      }),
    ],
    auditEventIds: [foundationId('audit')],
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      sourceKind: input.sourceKind,
      sourceIdHash: stableHash(input.sourceId),
      targetRefIdHash: stableHash(targetRef.id),
      titleHash,
      bodyHash,
      bodySectionCount: input.bodySectionSummaries.length,
      bodyCharacterCount,
      blockerCount: blockReasons.length,
      existingPullRequestCount: input.existingPullRequestCount ?? 0,
      remoteHeadBranchExists: input.remoteHeadBranchExists ?? false,
      draftOnly: true,
      productDefaultEnabled: false,
    },
    summary:
      status === 'planned'
        ? 'GitHub draft PR plan is ready for a future approval-gated existing-branch draft PR attempt.'
        : `GitHub draft PR plan is blocked: ${blockReasons.join(', ')}.`,
  });
}

export function createGithubMetadataApprovalRecord(
  input: GithubMetadataApprovalInput,
): GithubMetadataApprovalArtifactRecord {
  const now = input.now ?? foundationTimestamp;
  const baseRecord = input.baseRecord;
  const approvalRequestId =
    baseRecord?.approvalRequestId ??
    stableId('github_metadata_approval_request', input.dryRunRecord.dryRunId);
  const approvalArtifactId =
    baseRecord?.approvalArtifactId ??
    stableId('github_metadata_approval_artifact', input.dryRunRecord.dryRunId);
  const evidenceRefs = [
    createGithubEvidenceRef({
      kind: 'github.provider_plan',
      label: 'github-metadata-approval',
      summary: 'GitHub metadata approval stores approval hashes and ids only.',
      metadata: {
        integration: GITHUB_PROVIDER_NAME,
        dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
        approvalArtifactIdHash: stableHash(approvalArtifactId),
        status: input.status,
      },
    }),
  ];

  return GithubMetadataApprovalArtifactRecordSchema.parse({
    id: stableId(
      'github_metadata_approval_record',
      `${input.dryRunRecord.dryRunId}:${approvalArtifactId}:${input.status}:${now()}`,
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: input.dryRunRecord.dryRunId,
    dryRunRecordId: input.dryRunRecord.id,
    approvalRequestId,
    approvalArtifactId,
    status: input.status,
    approved: input.status === 'approved',
    policyDecisionId: input.dryRunRecord.policyDecision.id,
    requestedByHash: input.requestedBy ? stableHash(input.requestedBy) : baseRecord?.requestedByHash,
    decidedByHash: input.decidedBy ? stableHash(input.decidedBy) : baseRecord?.decidedByHash,
    reasonHash: input.reason ? stableHash(input.reason) : baseRecord?.reasonHash,
    expiresAt: baseRecord?.expiresAt,
    evidenceRefs,
    auditEventIds: [foundationId('audit')],
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
      approvalArtifactIdHash: stableHash(approvalArtifactId),
      status: input.status,
    },
    summary: `GitHub metadata approval status is ${input.status}.`,
  });
}

export function createGithubDraftPrApprovalRecord(
  input: GithubDraftPrApprovalInput,
): GithubDraftPrApprovalArtifactRecord {
  const now = input.now ?? foundationTimestamp;
  const baseRecord = input.baseRecord;
  const approvalRequestId =
    baseRecord?.approvalRequestId ??
    stableId('github_draft_pr_approval_request', input.dryRunRecord.dryRunId);
  const approvalArtifactId =
    baseRecord?.approvalArtifactId ??
    stableId('github_draft_pr_approval_artifact', input.dryRunRecord.dryRunId);
  const evidenceRefs = [
    createGithubEvidenceRef({
      kind: 'github.draft_pr_plan',
      label: 'github-draft-pr-approval',
      summary: 'GitHub draft PR approval stores approval hashes and ids only.',
      metadata: {
        integration: GITHUB_PROVIDER_NAME,
        dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
        approvalArtifactIdHash: stableHash(approvalArtifactId),
        status: input.status,
      },
    }),
  ];

  return GithubDraftPrApprovalArtifactRecordSchema.parse({
    id: stableId(
      'github_draft_pr_approval_record',
      `${input.dryRunRecord.dryRunId}:${approvalArtifactId}:${input.status}:${now()}`,
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: input.dryRunRecord.dryRunId,
    dryRunRecordId: input.dryRunRecord.id,
    approvalRequestId,
    approvalArtifactId,
    status: input.status,
    approved: input.status === 'approved',
    policyDecisionId: input.dryRunRecord.policyDecision.id,
    requestedByHash: input.requestedBy ? stableHash(input.requestedBy) : baseRecord?.requestedByHash,
    decidedByHash: input.decidedBy ? stableHash(input.decidedBy) : baseRecord?.decidedByHash,
    reasonHash: input.reason ? stableHash(input.reason) : baseRecord?.reasonHash,
    expiresAt: baseRecord?.expiresAt,
    evidenceRefs,
    auditEventIds: [foundationId('audit')],
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
      approvalArtifactIdHash: stableHash(approvalArtifactId),
      status: input.status,
    },
    summary: `GitHub draft PR approval status is ${input.status}.`,
  });
}

export async function executeGithubMetadataObservation(
  input: GithubMetadataExecutionInput,
): Promise<GithubMetadataControlPlaneRun> {
  const now = input.now ?? foundationTimestamp;
  const observedAt = now();
  const blockReasons = collectExecutionBlockReasons(input, observedAt);
  const boundaryInput = blockReasons.length === 0 ? input.runtime : undefined;
  const boundaryResult = boundaryInput
    ? await runGithubMetadataHttpBoundary({
        owner: boundaryInput.owner,
        repo: boundaryInput.repo,
        baseBranch: boundaryInput.baseBranch,
        headBranch: boundaryInput.headBranch,
        token: boundaryInput.token ?? '',
        fetchImpl: input.fetchImpl,
      })
    : undefined;
  const finalBlockReasons = [...blockReasons, ...(boundaryResult?.blockReasons ?? [])];
  const status =
    blockReasons.length > 0
      ? 'blocked'
      : boundaryResult?.status === 'completed'
        ? 'completed'
        : boundaryResult?.status ?? 'failed';
  const responseBodyHashes = boundaryResult?.responseBodyHashes ?? [];
  const evidenceRefs = [
    createGithubEvidenceRef({
      kind: 'github.metadata_summary',
      label: 'github-metadata-summary',
      summary: 'GitHub metadata run stores response hashes and counts only.',
      metadata: {
        integration: GITHUB_PROVIDER_NAME,
        dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
        status,
        networkBoundaryInvoked: boundaryResult?.networkBoundaryInvoked ?? false,
        responseBodyHashCount: responseBodyHashes.length,
        existingPullRequestCount: boundaryResult?.existingPullRequestCount ?? 0,
      },
    }),
  ];

  return GithubMetadataControlPlaneRunSchema.parse({
    id: stableId(
      'github_metadata_run',
      `${input.dryRunRecord.dryRunId}:${status}:${observedAt}:${responseBodyHashes.join(',')}`,
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: observedAt,
    dryRunId: input.dryRunRecord.dryRunId,
    dryRunRecordId: input.dryRunRecord.id,
    approvalArtifactId: input.approvalRecord?.approvalArtifactId,
    status,
    targetRef: input.dryRunRecord.targetRef,
    repoMetadataHash: boundaryResult?.repoMetadataHash,
    baseBranchMetadataHash: boundaryResult?.baseBranchMetadataHash,
    headBranchMetadataHash: boundaryResult?.headBranchMetadataHash,
    existingPullRequestCount: boundaryResult?.existingPullRequestCount ?? 0,
    responseBodyHashes,
    blockReasons: finalBlockReasons,
    evidenceRefs,
    auditEventIds: [foundationId('audit')],
    networkBoundaryInvoked: boundaryResult?.networkBoundaryInvoked ?? false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
      status,
      networkBoundaryInvoked: boundaryResult?.networkBoundaryInvoked ?? false,
      responseBodyHashCount: responseBodyHashes.length,
    },
    summary:
      status === 'completed'
        ? 'GitHub metadata observation completed with hash-only response summaries.'
        : `GitHub metadata observation ${status}: ${finalBlockReasons.join(', ')}.`,
  });
}

export async function executeGithubDraftPrCreation(
  input: GithubDraftPrExecutionInput,
): Promise<GithubDraftPrRun> {
  const now = input.now ?? foundationTimestamp;
  const observedAt = now();
  const blockReasons = collectDraftPrExecutionBlockReasons(input, observedAt);
  const boundaryInput = blockReasons.length === 0 ? input.runtime : undefined;
  const boundaryResult = boundaryInput
    ? await runGithubDraftPrHttpBoundary({
        owner: boundaryInput.owner,
        repo: boundaryInput.repo,
        baseBranch: boundaryInput.baseBranch,
        headBranch: boundaryInput.headBranch,
        title: boundaryInput.titleSummary,
        body: createDraftPrBody(boundaryInput.bodySectionSummaries),
        token: boundaryInput.token ?? '',
        fetchImpl: input.fetchImpl,
      })
    : undefined;
  const finalBlockReasons = [...blockReasons, ...(boundaryResult?.blockReasons ?? [])];
  const status =
    blockReasons.length > 0
      ? 'blocked'
      : boundaryResult?.status === 'completed'
        ? 'completed'
        : boundaryResult?.status ?? 'failed';
  const responseBodyHashes = boundaryResult?.responseBodyHashes ?? [];
  const auditEventIds = [foundationId('audit')];
  const evidenceRefs = [
    createGithubEvidenceRef({
      kind: 'github.draft_pr_summary',
      label: 'github-draft-pr-summary',
      summary: 'GitHub draft PR run stores response hashes and PR identifiers as hashes only.',
      metadata: {
        integration: GITHUB_PROVIDER_NAME,
        dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
        status,
        networkBoundaryInvoked: boundaryResult?.networkBoundaryInvoked ?? false,
        responseBodyHashCount: responseBodyHashes.length,
        created: boundaryResult?.created ?? false,
      },
    }),
  ];
  const runId = stableId(
    'github_draft_pr_run',
    `${input.dryRunRecord.dryRunId}:${status}:${observedAt}:${responseBodyHashes.join(',')}`,
  );
  const creationSummary = createGithubDraftPrCreationSummary({
    targetRef: input.dryRunRecord.readiness.targetRef,
    titleHash: input.dryRunRecord.titleHash,
    bodyHash: input.dryRunRecord.bodyHash,
    prNumberHash: boundaryResult?.prNumberHash,
    prUrlHash: boundaryResult?.prUrlHash,
    created: boundaryResult?.created ?? false,
    now,
  });
  const auditChain = createRemotePrAuditChain({
    runId,
    auditEventIds,
    policyDecisionIds: [input.dryRunRecord.policyDecision.id],
    evidenceRefIds: evidenceRefs.map((ref) => ref.id),
    networkBoundaryInvoked: boundaryResult?.networkBoundaryInvoked ?? false,
    now,
  });

  return GithubDraftPrRunSchema.parse({
    id: runId,
    schemaVersion: SchemaVersionSchema.value,
    createdAt: observedAt,
    dryRunId: input.dryRunRecord.dryRunId,
    dryRunRecordId: input.dryRunRecord.id,
    approvalArtifactId: input.approvalRecord?.approvalArtifactId,
    status,
    plan: input.dryRunRecord,
    creationSummary,
    auditChain,
    responseBodyHashes,
    blockReasons: finalBlockReasons,
    evidenceRefs,
    auditEventIds,
    networkBoundaryInvoked: boundaryResult?.networkBoundaryInvoked ?? false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: status !== 'completed',
    draft: true,
    pushAllowed: false,
    createRefAllowed: false,
    mergeAllowed: false,
    rawPrBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
      status,
      networkBoundaryInvoked: boundaryResult?.networkBoundaryInvoked ?? false,
      responseBodyHashCount: responseBodyHashes.length,
      created: boundaryResult?.created ?? false,
    },
    summary:
      status === 'completed'
        ? 'GitHub draft PR creation completed with hash-only remote response summaries.'
        : `GitHub draft PR creation ${status}: ${finalBlockReasons.join(', ')}.`,
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

function createGithubDraftPrReadiness(input: {
  input: GithubDraftPrPlanInput;
  targetRef: GithubRemoteRefSummary;
  blockReasons: string[];
  now: () => string;
}): GithubDraftPrReadiness {
  const status = resolveDraftPrReadinessStatus(input.blockReasons);

  return GithubDraftPrReadinessSchema.parse({
    id: stableId(
      'github_draft_pr_readiness',
      JSON.stringify({
        sourceKind: input.input.sourceKind,
        sourceIdHash: stableHash(input.input.sourceId),
        sourceSummaryHash: stableHash(input.input.sourceSummary),
        targetRefId: input.targetRef.id,
        status,
      }),
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    sourceKind: input.input.sourceKind,
    sourceIdHash: stableHash(input.input.sourceId),
    sourceSummaryHash: stableHash(input.input.sourceSummary),
    targetRef: input.targetRef,
    status,
    blockerCount: input.blockReasons.length,
    draftOnly: true,
    remoteHeadBranchExistsRequired: true,
    pushAllowed: false,
    createRefAllowed: false,
    mergeAllowed: false,
    labelsAllowed: false,
    reviewersAllowed: false,
    commentsAllowed: false,
    rawPrBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      sourceKind: input.input.sourceKind,
      sourceIdHash: stableHash(input.input.sourceId),
      targetRefIdHash: stableHash(input.targetRef.id),
      blockerCount: input.blockReasons.length,
      remoteHeadBranchExists: input.input.remoteHeadBranchExists ?? false,
      existingPullRequestCount: input.input.existingPullRequestCount ?? 0,
    },
    summary:
      status === 'ready_for_draft_pr'
        ? 'Existing remote head branch and source metadata are ready for draft PR approval.'
        : `Draft PR readiness is blocked: ${input.blockReasons.join(', ')}.`,
  });
}

function collectExecutionBlockReasons(input: GithubMetadataExecutionInput, nowIso: string): string[] {
  const authority = input.authority ? ExecutionAuthoritySchema.safeParse(input.authority) : undefined;
  const runtimeValidation = validateRemoteRefInput(input.runtime);
  const approvalExpired =
    input.approvalRecord?.expiresAt !== undefined &&
    Date.parse(input.approvalRecord.expiresAt) <= Date.parse(nowIso);
  const reasons = [
    input.enabled ? undefined : 'github_provider_disabled',
    input.dryRunRecord.status === 'planned' ? undefined : 'dry_run_not_planned',
    input.approvalRecord?.status === 'approved' && input.approvalRecord.approved
      ? undefined
      : 'missing_persisted_approval',
    approvalExpired ? 'approval_artifact_expired' : undefined,
    authority?.success && authority.data.allowed ? undefined : 'execution_authority_denied',
    input.runtime.token ? undefined : 'github_token_missing',
    runtimeValidation,
    matchesRemoteRefSummary(input.dryRunRecord.targetRef, input.runtime)
      ? undefined
      : 'github_remote_ref_hash_mismatch',
  ].filter((reason): reason is string => Boolean(reason));

  return [...new Set(reasons)];
}

function collectDraftPrExecutionBlockReasons(
  input: GithubDraftPrExecutionInput,
  nowIso: string,
): string[] {
  const authority = input.authority ? ExecutionAuthoritySchema.safeParse(input.authority) : undefined;
  const runtimeValidation = validateRemoteRefInput(input.runtime);
  const approvalExpired =
    input.approvalRecord?.expiresAt !== undefined &&
    Date.parse(input.approvalRecord.expiresAt) <= Date.parse(nowIso);
  const authorityExpired =
    authority?.success &&
    authority.data.expiresAt !== undefined &&
    Date.parse(authority.data.expiresAt) <= Date.parse(nowIso);
  const bodyHash = stableHash(JSON.stringify(input.runtime.bodySectionSummaries));
  const reasons = [
    input.enabled ? undefined : 'github_draft_pr_disabled',
    input.dryRunRecord.status === 'planned' ? undefined : 'dry_run_not_planned',
    input.dryRunRecord.runnerMode === 'controlled-github-draft-pr'
      ? undefined
      : 'draft_pr_runner_mode_not_controlled',
    input.dryRunRecord.readiness.status === 'ready_for_draft_pr'
      ? undefined
      : 'draft_pr_readiness_not_ready',
    input.approvalRecord?.status === 'approved' && input.approvalRecord.approved
      ? undefined
      : 'missing_persisted_approval',
    approvalExpired ? 'approval_artifact_expired' : undefined,
    authority?.success && authority.data.allowed ? undefined : 'execution_authority_denied',
    authorityExpired ? 'execution_authority_expired' : undefined,
    input.runtime.token ? undefined : 'github_token_missing',
    runtimeValidation,
    matchesRemoteRefSummary(input.dryRunRecord.readiness.targetRef, input.runtime)
      ? undefined
      : 'github_remote_ref_hash_mismatch',
    stableHash(input.runtime.titleSummary) === input.dryRunRecord.titleHash
      ? undefined
      : 'github_draft_pr_title_hash_mismatch',
    bodyHash === input.dryRunRecord.bodyHash ? undefined : 'github_draft_pr_body_hash_mismatch',
  ].filter((reason): reason is string => Boolean(reason));

  return [...new Set(reasons)];
}

function matchesRemoteRefSummary(
  targetRef: GithubRemoteRefSummary,
  runtime: GithubMetadataExecutionInput['runtime'],
): boolean {
  const baseBranchMatches = targetRef.baseBranchHash
    ? typeof runtime.baseBranch === 'string' &&
      targetRef.baseBranchHash === stableHash(runtime.baseBranch)
    : !runtime.baseBranch;
  const headBranchMatches = targetRef.headBranchHash
    ? typeof runtime.headBranch === 'string' &&
      targetRef.headBranchHash === stableHash(runtime.headBranch)
    : !runtime.headBranch;

  return (
    targetRef.ownerHash === stableHash(runtime.owner) &&
    targetRef.repoHash === stableHash(runtime.repo) &&
    baseBranchMatches &&
    headBranchMatches
  );
}

function createGithubDraftPrCreationSummary(input: {
  targetRef: GithubRemoteRefSummary;
  titleHash: string;
  bodyHash: string;
  prNumberHash?: string;
  prUrlHash?: string;
  created: boolean;
  now: () => string;
}): GithubDraftPrCreationSummary {
  return GithubDraftPrCreationSummarySchema.parse({
    id: stableId(
      'github_draft_pr_creation_summary',
      `${input.targetRef.id}:${input.titleHash}:${input.bodyHash}:${input.prNumberHash ?? 'none'}`,
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    targetRef: input.targetRef,
    prNumberHash: input.prNumberHash,
    prUrlHash: input.prUrlHash,
    titleHash: input.titleHash,
    bodyHash: input.bodyHash,
    draft: true,
    created: input.created,
    rawUrlStored: false,
    rawPrBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      targetRefIdHash: stableHash(input.targetRef.id),
      titleHash: input.titleHash,
      bodyHash: input.bodyHash,
      created: input.created,
    },
    summary: input.created
      ? 'GitHub draft PR creation summary stores PR identifiers as hashes only.'
      : 'GitHub draft PR creation did not create a remote PR.',
  });
}

function createRemotePrAuditChain(input: {
  runId: string;
  auditEventIds: string[];
  policyDecisionIds: string[];
  evidenceRefIds: string[];
  networkBoundaryInvoked: boolean;
  now: () => string;
}): RemotePrAuditChain {
  return RemotePrAuditChainSchema.parse({
    id: stableId('github_draft_pr_audit_chain', input.runId),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    draftPrRunIdHash: stableHash(input.runId),
    auditEventIds: input.auditEventIds,
    auditEventCount: input.auditEventIds.length,
    policyDecisionIds: input.policyDecisionIds,
    evidenceRefIds: input.evidenceRefIds,
    evidenceRefCount: input.evidenceRefIds.length,
    networkBoundaryCount: input.networkBoundaryInvoked ? 1 : 0,
    chainHash: stableHash(
      JSON.stringify({
        runIdHash: stableHash(input.runId),
        auditEventIds: input.auditEventIds,
        policyDecisionIds: input.policyDecisionIds,
        evidenceRefIds: input.evidenceRefIds,
        networkBoundaryInvoked: input.networkBoundaryInvoked,
      }),
    ),
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      runIdHash: stableHash(input.runId),
      auditEventCount: input.auditEventIds.length,
      evidenceRefCount: input.evidenceRefIds.length,
      networkBoundaryCount: input.networkBoundaryInvoked ? 1 : 0,
    },
    summary: 'Remote PR audit chain stores ids, hashes, counts, and boundary truth only.',
  });
}

function createGithubEvidenceRef(input: {
  kind:
    | 'github.provider_plan'
    | 'github.metadata_summary'
    | 'github.token_readiness'
    | 'github.draft_pr_plan'
    | 'github.draft_pr_summary';
  label: string;
  summary: string;
  metadata: Record<string, unknown>;
}) {
  return createEvidenceRef({
    kind: input.kind,
    label: input.label,
    summary: input.summary,
    metadata: input.metadata,
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

function collectDraftPrPlanBlockReasons(input: GithubDraftPrPlanInput): string[] {
  const reasons = [
    validateRemoteRefInput(input),
    input.baseBranch ? undefined : 'missing_base_branch',
    input.headBranch ? undefined : 'missing_head_branch',
    isSafeSourceSummary(input.sourceId) ? undefined : 'missing_source_id',
    isSafeSourceSummary(input.sourceSummary) ? undefined : 'missing_source_summary',
    isSafeSourceSummary(input.titleSummary) ? undefined : 'missing_title_summary',
    input.bodySectionSummaries.length > 0 ? undefined : 'missing_body_sections',
    input.metadataReady === false ? 'metadata_not_ready' : undefined,
    input.remoteHeadBranchExists === false ? 'remote_head_branch_missing' : undefined,
    (input.existingPullRequestCount ?? 0) > 0 ? 'existing_pull_request_found' : undefined,
  ].filter((reason): reason is string => Boolean(reason));

  return [...new Set(reasons)];
}

function resolveDraftPrReadinessStatus(
  blockReasons: readonly string[],
): GithubDraftPrReadinessStatus {
  if (blockReasons.length === 0) {
    return 'ready_for_draft_pr';
  }

  if (
    blockReasons.includes('missing_source_id') ||
    blockReasons.includes('missing_source_summary')
  ) {
    return 'blocked_source';
  }

  if (blockReasons.includes('existing_pull_request_found')) {
    return 'blocked_existing_pr';
  }

  if (blockReasons.includes('remote_head_branch_missing') || blockReasons.includes('missing_head_branch')) {
    return 'blocked_head_branch';
  }

  if (blockReasons.includes('metadata_not_ready')) {
    return 'blocked_metadata';
  }

  return 'not_ready';
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

function isSafeSourceSummary(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function createDraftPrBody(bodySectionSummaries: string[]): string {
  return bodySectionSummaries
    .map((section, index) => `## Section ${index + 1}\n\n${section}`)
    .join('\n\n');
}

function stableId(prefix: string, seed: string): string {
  return `${prefix}_${hashText(seed).slice(0, 16)}`;
}

function stableHash(value: string): string {
  return `sha256:${hashText(value)}`;
}
