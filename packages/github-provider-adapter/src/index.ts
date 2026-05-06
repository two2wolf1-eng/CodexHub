import {
  CapabilityManifestSchema,
  ExecutionAuthoritySchema,
  GithubBranchPublishAcceptanceRehearsalRunSchema,
  GithubBranchPublishApprovalArtifactRecordSchema,
  GithubBranchPublishPlanSchema,
  GithubBranchPublishReadinessSchema,
  GithubBranchPublishRunSchema,
  GithubCommitContentManifestSchema,
  GithubDraftPrApprovalArtifactRecordSchema,
  GithubDraftPrAcceptanceRehearsalRunSchema,
  GithubDraftPrCreationSummarySchema,
  GithubDraftPrPlanSchema,
  GithubDraftPrReadinessSchema,
  GithubDraftPrRunSchema,
  GithubMetadataApprovalArtifactRecordSchema,
  GithubMetadataControlPlaneRunSchema,
  GithubMetadataDryRunRecordSchema,
  GithubPrLifecycleAcceptanceRehearsalRunSchema,
  GithubPrLifecycleApprovalArtifactRecordSchema,
  GithubPrManagementAcceptanceRehearsalRunSchema,
  GithubPrManagementApprovalArtifactRecordSchema,
  GithubPrManagementPlanSchema,
  GithubPrManagementRunSchema,
  GithubPrManagementSummarySchema,
  GithubPrLifecycleObservationPlanSchema,
  GithubPrLifecycleObservationRunSchema,
  GithubPublishDraftPrAcceptanceRehearsalRunSchema,
  GithubPublishDraftPrChainPlanSchema,
  GithubPublishDraftPrChainRunSchema,
  GithubPublishDraftPrChainStepSchema,
  GithubRemoteCleanupAcceptanceRehearsalRunSchema,
  GithubRemoteCleanupApprovalArtifactRecordSchema,
  GithubRemoteCleanupPlanSchema,
  GithubRemoteCleanupRunSchema,
  GithubRemoteCleanupSummarySchema,
  GithubRemotePrLifecycleSummarySchema,
  GithubRemoteCommitSummarySchema,
  GithubRemoteRefSummarySchema,
  GithubTokenReadinessSchema,
  PolicyDecisionSchema,
  RemotePrAuditChainSchema,
  RemoteCleanupReadinessSchema,
  RemoteSupersedeAcceptanceRehearsalRunSchema,
  RemoteSupersedeChainProjectionSchema,
  RemoteSupersedePlanSchema,
  RemoteSupersedeRunSchema,
  RemoteSupersedeTargetSummarySchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
  type CapabilityManifest,
  type ExecutionAuthority,
  type GithubBranchPublishAcceptanceRehearsalRun,
  type GithubBranchPublishAcceptanceScenario,
  type GithubBranchPublishApprovalArtifactRecord,
  type GithubBranchPublishPlan,
  type GithubBranchPublishReadiness,
  type GithubBranchPublishReadinessStatus,
  type GithubBranchPublishRun,
  type GithubBranchPublishRunnerMode,
  type GithubBranchPublishSourceKind,
  type GithubCommitContentManifest,
  type GithubDraftPrApprovalArtifactRecord,
  type GithubDraftPrAcceptanceRehearsalRun,
  type GithubDraftPrAcceptanceScenario,
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
  type GithubPrLifecycleAcceptanceRehearsalRun,
  type GithubPrLifecycleAcceptanceScenario,
  type GithubPrLifecycleApprovalArtifactRecord,
  type GithubPrManagementAcceptanceRehearsalRun,
  type GithubPrManagementAcceptanceScenario,
  type GithubPrManagementApprovalArtifactRecord,
  type GithubPrManagementKind,
  type GithubPrManagementPlan,
  type GithubPrManagementRun,
  type GithubPrManagementRunnerMode,
  type GithubPrManagementSummary,
  type GithubPrLifecycleObservationPlan,
  type GithubPrLifecycleObservationRun,
  type GithubPrLifecycleRunnerMode,
  type GithubProviderApprovalStatus,
  type GithubPublishDraftPrAcceptanceRehearsalRun,
  type GithubPublishDraftPrAcceptanceScenario,
  type GithubPublishDraftPrChainPlan,
  type GithubPublishDraftPrChainRun,
  type GithubPublishDraftPrChainStep,
  type GithubRemoteCleanupAcceptanceRehearsalRun,
  type GithubRemoteCleanupAcceptanceScenario,
  type GithubRemoteCleanupApprovalArtifactRecord,
  type GithubRemoteCleanupPlan,
  type GithubRemoteCleanupRun,
  type GithubRemoteCleanupRunnerMode,
  type GithubRemotePrLifecycleSummary,
  type GithubRemoteCommitSummary,
  type GithubRemoteRefSummary,
  type GithubTokenReadiness,
  type PolicyDecision,
  type RemoteCleanupReadiness,
  type RemoteCleanupReadinessStatus,
  type RemotePrAuditChain,
  type RemoteSupersedeAcceptanceRehearsalRun,
  type RemoteSupersedeAcceptanceScenario,
  type RemoteSupersedeChainProjection,
  type RemoteSupersedePlan,
  type RemoteSupersedeRun,
  type RemoteSupersedeTargetKind,
  type RemoteSupersedeTargetSummary,
} from '@codexhub/contracts';
import { createEvidenceRef, hashText } from '@codexhub/evidence-kernel';
import {
  runGithubBranchPublishHttpBoundary,
  runGithubDraftPrHttpBoundary,
  runGithubMetadataHttpBoundary,
  runGithubPrLifecycleHttpBoundary,
  runGithubPrManagementHttpBoundary,
  runGithubRemoteCleanupHttpBoundary,
  type GithubBranchPublishHttpBoundaryRequest,
  type GithubHttpBoundaryRequest,
  type GithubPrLifecycleHttpBoundaryRequest,
  type GithubPrManagementHttpBoundaryRequest,
  type GithubRemoteCleanupHttpBoundaryRequest,
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

export interface GithubBranchPublishContentFileInput {
  relativePath: string;
  contentHash: string;
  byteCount: number;
  text: boolean;
  symlink?: boolean;
  deleted?: boolean;
  renamed?: boolean;
}

export interface GithubBranchPublishPlanInput extends GithubRemoteRefInput {
  sourceKind: GithubBranchPublishSourceKind;
  sourceId: string;
  sourceSummary: string;
  worktreePathHash: string;
  branchSlug: string;
  commitMessageSummary: string;
  files: GithubBranchPublishContentFileInput[];
  branchExists?: boolean;
  runnerMode?: GithubBranchPublishRunnerMode;
  now?: () => string;
}

export interface GithubPrLifecyclePlanInput extends GithubRemoteRefInput {
  prNumber?: string;
  prNumberHash?: string;
  commitSha?: string;
  commitShaHash?: string;
  requestedMetadata?: Array<
    'repo' | 'pull_request' | 'branch_ref' | 'combined_status' | 'check_runs'
  >;
  runnerMode?: GithubPrLifecycleRunnerMode;
  now?: () => string;
}

export interface GithubPrManagementPlanInput extends GithubRemoteRefInput {
  managementKind: GithubPrManagementKind;
  prNumber?: string;
  prNumberHash?: string;
  itemSummaries?: string[];
  payloadSummary?: string;
  runnerMode?: GithubPrManagementRunnerMode;
  now?: () => string;
}

export interface RemoteSupersedeProjectionInput {
  sourceRunId: string;
  sourceSummary: string;
  targetKind?: RemoteSupersedeTargetKind;
  sourceReworkRunId?: string;
  sourceBranchPublishRunId?: string;
  sourceDraftPrRunId?: string;
  sourcePrLifecycleRunId?: string;
  successorBranchPublishRunId?: string;
  successorDraftPrRunId?: string;
  oldBranchName?: string;
  oldPrNumber?: string;
  oldPrUrl?: string;
  successorReady?: boolean;
  checksPending?: boolean;
  metadataReady?: boolean;
  now?: () => string;
}

export interface GithubRemoteCleanupPlanInput extends GithubRemoteRefInput {
  oldBranchName: string;
  oldPrNumber?: string;
  sourceBranchPublishRunId: string;
  sourceDraftPrRunId?: string;
  successorRunId: string;
  successorReady?: boolean;
  oldPrDraft?: boolean;
  supersededByNewerDraftPr?: boolean;
  runnerMode?: GithubRemoteCleanupRunnerMode;
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

export interface GithubBranchPublishApprovalInput {
  dryRunRecord: GithubBranchPublishPlan;
  baseRecord?: GithubBranchPublishApprovalArtifactRecord;
  status: GithubProviderApprovalStatus;
  requestedBy?: string;
  decidedBy?: string;
  reason?: string;
  now?: () => string;
}

export interface GithubPrLifecycleApprovalInput {
  dryRunRecord: GithubPrLifecycleObservationPlan;
  baseRecord?: GithubPrLifecycleApprovalArtifactRecord;
  status: GithubProviderApprovalStatus;
  requestedBy?: string;
  decidedBy?: string;
  reason?: string;
  now?: () => string;
}

export interface GithubPrManagementApprovalInput {
  dryRunRecord: GithubPrManagementPlan;
  baseRecord?: GithubPrManagementApprovalArtifactRecord;
  status: GithubProviderApprovalStatus;
  requestedBy?: string;
  decidedBy?: string;
  reason?: string;
  now?: () => string;
}

export interface GithubRemoteCleanupApprovalInput {
  dryRunRecord: GithubRemoteCleanupPlan;
  baseRecord?: GithubRemoteCleanupApprovalArtifactRecord;
  status: GithubProviderApprovalStatus;
  requestedBy?: string;
  decidedBy?: string;
  reason?: string;
  expiresAt?: string;
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

export interface GithubBranchPublishExecutionFile {
  relativePath: string;
  content: string;
}

export interface GithubBranchPublishExecutionInput {
  dryRunRecord: GithubBranchPublishPlan;
  approvalRecord?: GithubBranchPublishApprovalArtifactRecord;
  authority?: ExecutionAuthority;
  runtime: Omit<GithubBranchPublishHttpBoundaryRequest, 'fetchImpl' | 'token'> & {
    commitMessageSummary: string;
    token?: string;
  };
  enabled?: boolean;
  fetchImpl?: typeof fetch;
  now?: () => string;
}

export interface GithubPrLifecycleExecutionInput {
  dryRunRecord: GithubPrLifecycleObservationPlan;
  approvalRecord?: GithubPrLifecycleApprovalArtifactRecord;
  authority?: ExecutionAuthority;
  runtime: Omit<GithubPrLifecycleHttpBoundaryRequest, 'fetchImpl' | 'token'> & {
    token?: string;
  };
  enabled?: boolean;
  fetchImpl?: typeof fetch;
  now?: () => string;
}

export interface GithubPrManagementExecutionInput {
  dryRunRecord: GithubPrManagementPlan;
  approvalRecord?: GithubPrManagementApprovalArtifactRecord;
  authority?: ExecutionAuthority;
  runtime: Omit<GithubPrManagementHttpBoundaryRequest, 'fetchImpl' | 'token'> & {
    token?: string;
  };
  enabled?: boolean;
  fetchImpl?: typeof fetch;
  now?: () => string;
}

export interface GithubRemoteCleanupExecutionInput {
  dryRunRecord: GithubRemoteCleanupPlan;
  approvalRecord?: GithubRemoteCleanupApprovalArtifactRecord;
  authority?: ExecutionAuthority;
  runtime: Omit<GithubRemoteCleanupHttpBoundaryRequest, 'fetchImpl' | 'token'> & {
    token?: string;
  };
  enabled?: boolean;
  fetchImpl?: typeof fetch;
  now?: () => string;
}

export interface GithubDraftPrAcceptanceRehearsalInput {
  scenario?: GithubDraftPrAcceptanceScenario;
  now?: () => string;
}

export interface GithubBranchPublishAcceptanceRehearsalInput {
  scenario?: GithubBranchPublishAcceptanceScenario;
  now?: () => string;
}

export interface GithubPrLifecycleAcceptanceRehearsalInput {
  scenario?: GithubPrLifecycleAcceptanceScenario;
  now?: () => string;
}

export interface GithubPrManagementAcceptanceRehearsalInput {
  managementKind: GithubPrManagementKind;
  scenario?: GithubPrManagementAcceptanceScenario;
  now?: () => string;
}

export interface RemoteSupersedeAcceptanceRehearsalInput {
  scenario?: RemoteSupersedeAcceptanceScenario;
  now?: () => string;
}

export interface GithubRemoteCleanupAcceptanceRehearsalInput {
  scenario?: GithubRemoteCleanupAcceptanceScenario;
  now?: () => string;
}

export interface GithubPublishDraftPrChainPlanInput {
  sourceKind: GithubBranchPublishSourceKind;
  sourceId: string;
  branchPublishDryRunId: string;
  draftPrDryRunId: string;
  networkBoundaryPlanned?: boolean;
  now?: () => string;
}

export interface GithubRemotePrLifecycleSummaryInput {
  targetRef: GithubRemoteRefSummary;
  prNumberHash?: string;
  prUrlHash?: string;
  stateSummary?: string;
  checkRunCount?: number;
  statusContextCount?: number;
  failedCheckCount?: number;
  pendingCheckCount?: number;
  passedCheckCount?: number;
  now?: () => string;
}

export interface GithubPublishDraftPrChainExecutionInput {
  plan: GithubPublishDraftPrChainPlan;
  branchPublishRun?: GithubBranchPublishRun;
  draftPrRun?: GithubDraftPrRun;
  lifecycleSummary?: GithubRemotePrLifecycleSummary;
  now?: () => string;
}

export interface GithubPublishDraftPrAcceptanceRehearsalInput {
  scenario?: GithubPublishDraftPrAcceptanceScenario;
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
      'new-branch-publish-plan',
      'new-branch-publish-create',
      'branch-publish-acceptance-rehearsal',
      'publish-draft-pr-chain-plan',
      'publish-draft-pr-chain-projection',
      'pr-lifecycle-read-only-projection',
      'pr-lifecycle-fixed-get-observation',
      'publish-draft-pr-acceptance-rehearsal',
      'remote-supersede-projection',
      'remote-supersede-acceptance-rehearsal',
      'remote-cleanup-plan',
      'remote-cleanup-close-draft-pr',
      'remote-cleanup-delete-codexhub-ref',
      'remote-cleanup-acceptance-rehearsal',
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
      branchPublishPlanningOnly: true,
      branchPublishCreationEnabled: false,
      publishDraftPrChainPlanningOnly: true,
      prLifecycleObservationPlanningOnly: true,
      remoteSupersedeProjectionOnly: true,
      remoteCleanupEnabled: false,
      localGitPushAllowed: false,
      updateRefAllowed: false,
      forceAllowed: false,
      commentsAllowed: false,
      labelsAllowed: false,
      reviewersAllowed: false,
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

export function createGithubPrLifecycleObservationPlan(
  input: GithubPrLifecyclePlanInput,
): GithubPrLifecycleObservationPlan {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = collectPrLifecyclePlanBlockReasons(input);
  const targetRef =
    blockReasons.includes('invalid_owner') ||
    blockReasons.includes('invalid_repo') ||
    blockReasons.includes('invalid_base_branch') ||
    blockReasons.includes('invalid_head_branch')
      ? createBlockedGithubRemoteRefSummary(input, now)
      : createGithubRemoteRefSummary(input);
  const requestedMetadata = input.requestedMetadata ?? [
    'repo',
    'pull_request',
    'branch_ref',
    'combined_status',
    'check_runs',
  ];
  const status = blockReasons.length === 0 ? 'planned' : 'blocked';
  const dryRunId = stableId(
    'github_pr_lifecycle_dry_run',
    JSON.stringify({
      ownerHash: targetRef.ownerHash,
      repoHash: targetRef.repoHash,
      baseBranchHash: targetRef.baseBranchHash,
      headBranchHash: targetRef.headBranchHash,
      prNumberHash: input.prNumberHash ?? stableHash(input.prNumber ?? 'missing'),
      commitShaHash: input.commitShaHash ?? stableHash(input.commitSha ?? 'missing'),
      requestedMetadata,
    }),
  );
  const policyDecision = createGithubPolicyDecision({
    actionId: dryRunId,
    actionType: 'github.pr_lifecycle.observe',
    actionMode: 'read',
    now,
    allow: false,
    reasons: ['live GitHub PR lifecycle observation requires persisted approval'],
  });

  return GithubPrLifecycleObservationPlanSchema.parse({
    id: stableId('github_pr_lifecycle_plan', dryRunId),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId,
    status,
    runnerMode: input.runnerMode ?? 'planning-only',
    targetRef,
    prNumberHash: input.prNumberHash ?? (input.prNumber ? stableHash(input.prNumber) : undefined),
    commitShaHash:
      input.commitShaHash ?? (input.commitSha ? stableHash(input.commitSha) : undefined),
    requestedMetadata,
    blockReasons,
    policyDecision,
    requiresApproval: true,
    evidenceRefs: [
      createGithubEvidenceRef({
        kind: 'github.pr_lifecycle_plan',
        label: 'github-pr-lifecycle-plan',
        summary: 'GitHub PR lifecycle dry-run stores remote refs and PR ids as hashes only.',
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
    networkBoundaryPlanned:
      status === 'planned' && input.runnerMode === 'controlled-github-pr-lifecycle',
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    rawUrlStored: false,
    rawResponseBodyStored: false,
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
        ? 'GitHub PR lifecycle observation dry-run is planned; live GETs require approval and env enablement.'
        : `GitHub PR lifecycle observation dry-run is blocked: ${blockReasons.join(', ')}.`,
  });
}

export function createGithubPrManagementPlan(
  input: GithubPrManagementPlanInput,
): GithubPrManagementPlan {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = collectPrManagementPlanBlockReasons(input);
  const targetRef =
    blockReasons.includes('invalid_owner') ||
    blockReasons.includes('invalid_repo') ||
    blockReasons.includes('invalid_base_branch') ||
    blockReasons.includes('invalid_head_branch')
      ? createBlockedGithubRemoteRefSummary(input, now)
      : createGithubRemoteRefSummary(input);
  const itemSummaries = input.itemSummaries ?? [];
  const payloadHash = stableHash(
    JSON.stringify({
      managementKind: input.managementKind,
      itemSummaries,
      payloadSummary: input.payloadSummary ?? '',
    }),
  );
  const status = blockReasons.length === 0 ? 'planned' : 'blocked';
  const dryRunId = stableId(
    `github_pr_${input.managementKind}_dry_run`,
    JSON.stringify({
      managementKind: input.managementKind,
      ownerHash: targetRef.ownerHash,
      repoHash: targetRef.repoHash,
      prNumberHash: input.prNumberHash ?? stableHash(input.prNumber ?? 'missing'),
      payloadHash,
    }),
  );
  const policyDecision = createGithubPolicyDecision({
    actionId: dryRunId,
    actionType: `github.pr_${input.managementKind}.manage`,
    actionMode: 'write',
    now,
    allow: false,
    reasons: [`GitHub PR ${input.managementKind} management requires persisted approval`],
  });

  return GithubPrManagementPlanSchema.parse({
    id: stableId(`github_pr_${input.managementKind}_plan`, dryRunId),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId,
    managementKind: input.managementKind,
    status,
    runnerMode: input.runnerMode ?? 'planning-only',
    targetRef,
    prNumberHash: input.prNumberHash ?? (input.prNumber ? stableHash(input.prNumber) : undefined),
    itemCount: itemSummaries.length,
    payloadHash,
    blockReasons,
    policyDecision,
    requiresApproval: true,
    evidenceRefs: [
      createGithubEvidenceRef({
        kind: getGithubPrManagementEvidenceKind(input.managementKind, 'plan'),
        label: `github-pr-${input.managementKind}-plan`,
        summary: `GitHub PR ${input.managementKind} plan stores target and payload hashes only.`,
        metadata: {
          integration: GITHUB_PROVIDER_NAME,
          dryRunIdHash: stableHash(dryRunId),
          managementKind: input.managementKind,
          ownerHash: targetRef.ownerHash,
          repoHash: targetRef.repoHash,
          itemCount: itemSummaries.length,
          payloadHash,
        },
      }),
    ],
    auditEventIds: [foundationId('audit')],
    networkBoundaryPlanned:
      status === 'planned' && input.runnerMode === 'controlled-github-pr-management',
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    fixedEndpointOnly: true,
    addOrSetOnly: true,
    mergeAllowed: false,
    pushAllowed: false,
    updateRefAllowed: false,
    forceAllowed: false,
    arbitraryEndpointAllowed: false,
    rawUrlStored: false,
    rawResponseBodyStored: false,
    rawPrBodyStored: false,
    rawCommentBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      managementKind: input.managementKind,
      ownerHash: targetRef.ownerHash,
      repoHash: targetRef.repoHash,
      prNumberHash: input.prNumberHash ?? (input.prNumber ? stableHash(input.prNumber) : undefined),
      itemCount: itemSummaries.length,
      payloadHash,
      productDefaultEnabled: false,
      fixedEndpointOnly: true,
      addOrSetOnly: true,
    },
    summary:
      status === 'planned'
        ? `GitHub PR ${input.managementKind} management dry-run is planned; live write requires approval and env enablement.`
        : `GitHub PR ${input.managementKind} management dry-run is blocked: ${blockReasons.join(', ')}.`,
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

export function createGithubBranchPublishPlan(
  input: GithubBranchPublishPlanInput,
): GithubBranchPublishPlan {
  const now = input.now ?? foundationTimestamp;
  const branchName = `codexhub/${input.branchSlug}`;
  const blockReasons = collectBranchPublishPlanBlockReasons(input);
  const targetInput = {
    ...input,
    headBranch: branchName,
  };
  const targetRef =
    blockReasons.includes('invalid_owner') ||
    blockReasons.includes('invalid_repo') ||
    blockReasons.includes('invalid_base_branch') ||
    blockReasons.includes('invalid_branch_slug')
      ? createBlockedGithubRemoteRefSummary(targetInput, now)
      : createGithubRemoteRefSummary(targetInput);
  const contentManifest = createGithubCommitContentManifest({
    input,
    blockReasons,
    now,
  });
  const readiness = createGithubBranchPublishReadiness({
    input,
    targetRef,
    contentManifest,
    blockReasons,
    now,
  });
  const status = blockReasons.length === 0 ? 'planned' : 'blocked';
  const commitMessageHash = stableHash(input.commitMessageSummary);
  const dryRunId = stableId(
    'github_branch_publish_dry_run',
    JSON.stringify({
      sourceKind: input.sourceKind,
      sourceIdHash: stableHash(input.sourceId),
      sourceSummaryHash: stableHash(input.sourceSummary),
      targetRefId: targetRef.id,
      contentManifestId: contentManifest.id,
      commitMessageHash,
      runnerMode: input.runnerMode ?? 'planning-only',
    }),
  );
  const policyDecision = createGithubPolicyDecision({
    actionId: dryRunId,
    actionType: 'github.branch_publish.create',
    actionMode: 'write',
    now,
    allow: false,
    reasons: ['remote branch publish requires persisted approval'],
  });

  return GithubBranchPublishPlanSchema.parse({
    id: stableId('github_branch_publish_plan', dryRunId),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId,
    status,
    runnerMode: input.runnerMode ?? 'planning-only',
    readiness,
    commitMessageHash,
    blockReasons,
    policyDecision,
    requiresApproval: true,
    networkBoundaryPlanned:
      status === 'planned' && input.runnerMode === 'controlled-github-branch-publish',
    networkBoundaryInvoked: false,
    createRefAllowed: true,
    updateRefAllowed: false,
    forceAllowed: false,
    pushAllowed: false,
    mergeAllowed: false,
    rawFileContentStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    evidenceRefs: [
      createGithubEvidenceRef({
        kind: 'github.branch_publish_plan',
        label: 'github-branch-publish-plan',
        summary: 'GitHub branch publish plan stores refs and content manifest as hashes only.',
        metadata: {
          integration: GITHUB_PROVIDER_NAME,
          dryRunIdHash: stableHash(dryRunId),
          sourceKind: input.sourceKind,
          sourceIdHash: stableHash(input.sourceId),
          targetRefIdHash: stableHash(targetRef.id),
          contentManifestIdHash: stableHash(contentManifest.id),
          fileCount: contentManifest.fileCount,
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
      contentManifestIdHash: stableHash(contentManifest.id),
      fileCount: contentManifest.fileCount,
      totalByteCount: contentManifest.totalByteCount,
      branchNameHash: stableHash(branchName),
      newBranchOnly: true,
      productDefaultEnabled: false,
    },
    summary:
      status === 'planned'
        ? 'GitHub branch publish plan is ready for approval-gated new branch creation.'
        : `GitHub branch publish plan is blocked: ${blockReasons.join(', ')}.`,
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

export function createGithubPrLifecycleApprovalRecord(
  input: GithubPrLifecycleApprovalInput,
): GithubPrLifecycleApprovalArtifactRecord {
  const now = input.now ?? foundationTimestamp;
  const baseRecord = input.baseRecord;
  const approvalRequestId =
    baseRecord?.approvalRequestId ??
    stableId('github_pr_lifecycle_approval_request', input.dryRunRecord.dryRunId);
  const approvalArtifactId =
    baseRecord?.approvalArtifactId ??
    stableId('github_pr_lifecycle_approval_artifact', input.dryRunRecord.dryRunId);
  const evidenceRefs = [
    createGithubEvidenceRef({
      kind: 'github.pr_lifecycle_plan',
      label: 'github-pr-lifecycle-approval',
      summary: 'GitHub PR lifecycle approval stores approval hashes and ids only.',
      metadata: {
        integration: GITHUB_PROVIDER_NAME,
        dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
        approvalArtifactIdHash: stableHash(approvalArtifactId),
        status: input.status,
      },
    }),
  ];

  return GithubPrLifecycleApprovalArtifactRecordSchema.parse({
    id: stableId(
      'github_pr_lifecycle_approval_record',
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
    rawUrlStored: false,
    rawResponseBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
      approvalArtifactIdHash: stableHash(approvalArtifactId),
      status: input.status,
    },
    summary: `GitHub PR lifecycle approval status is ${input.status}.`,
  });
}

export function createGithubPrManagementApprovalRecord(
  input: GithubPrManagementApprovalInput,
): GithubPrManagementApprovalArtifactRecord {
  const now = input.now ?? foundationTimestamp;
  const baseRecord = input.baseRecord;
  const approvalRequestId =
    baseRecord?.approvalRequestId ??
    stableId(
      `github_pr_${input.dryRunRecord.managementKind}_approval_request`,
      input.dryRunRecord.dryRunId,
    );
  const approvalArtifactId =
    baseRecord?.approvalArtifactId ??
    stableId(
      `github_pr_${input.dryRunRecord.managementKind}_approval_artifact`,
      input.dryRunRecord.dryRunId,
    );
  const evidenceRefs = [
    createGithubEvidenceRef({
      kind: getGithubPrManagementEvidenceKind(input.dryRunRecord.managementKind, 'plan'),
      label: `github-pr-${input.dryRunRecord.managementKind}-approval`,
      summary: `GitHub PR ${input.dryRunRecord.managementKind} approval stores ids and hashes only.`,
      metadata: {
        integration: GITHUB_PROVIDER_NAME,
        managementKind: input.dryRunRecord.managementKind,
        dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
        approvalArtifactIdHash: stableHash(approvalArtifactId),
        status: input.status,
      },
    }),
  ];

  return GithubPrManagementApprovalArtifactRecordSchema.parse({
    id: stableId(
      `github_pr_${input.dryRunRecord.managementKind}_approval_record`,
      `${input.dryRunRecord.dryRunId}:${approvalArtifactId}:${input.status}:${now()}`,
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: input.dryRunRecord.dryRunId,
    dryRunRecordId: input.dryRunRecord.id,
    managementKind: input.dryRunRecord.managementKind,
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
    rawUrlStored: false,
    rawResponseBodyStored: false,
    rawPrBodyStored: false,
    rawCommentBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      managementKind: input.dryRunRecord.managementKind,
      dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
      approvalArtifactIdHash: stableHash(approvalArtifactId),
      status: input.status,
    },
    summary: `GitHub PR ${input.dryRunRecord.managementKind} approval status is ${input.status}.`,
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

export function createGithubBranchPublishApprovalRecord(
  input: GithubBranchPublishApprovalInput,
): GithubBranchPublishApprovalArtifactRecord {
  const now = input.now ?? foundationTimestamp;
  const baseRecord = input.baseRecord;
  const approvalRequestId =
    baseRecord?.approvalRequestId ??
    stableId('github_branch_publish_approval_request', input.dryRunRecord.dryRunId);
  const approvalArtifactId =
    baseRecord?.approvalArtifactId ??
    stableId('github_branch_publish_approval_artifact', input.dryRunRecord.dryRunId);
  const evidenceRefs = [
    createGithubEvidenceRef({
      kind: 'github.branch_publish_plan',
      label: 'github-branch-publish-approval',
      summary: 'GitHub branch publish approval stores approval hashes and ids only.',
      metadata: {
        integration: GITHUB_PROVIDER_NAME,
        dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
        approvalArtifactIdHash: stableHash(approvalArtifactId),
        status: input.status,
      },
    }),
  ];

  return GithubBranchPublishApprovalArtifactRecordSchema.parse({
    id: stableId(
      'github_branch_publish_approval_record',
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
    summary: `GitHub branch publish approval status is ${input.status}.`,
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

export async function executeGithubPrLifecycleObservation(
  input: GithubPrLifecycleExecutionInput,
): Promise<GithubPrLifecycleObservationRun> {
  const now = input.now ?? foundationTimestamp;
  const observedAt = now();
  const blockReasons = collectPrLifecycleExecutionBlockReasons(input, observedAt);
  const boundaryInput = blockReasons.length === 0 ? input.runtime : undefined;
  const boundaryResult = boundaryInput
    ? await runGithubPrLifecycleHttpBoundary({
        owner: boundaryInput.owner,
        repo: boundaryInput.repo,
        baseBranch: boundaryInput.baseBranch,
        headBranch: boundaryInput.headBranch,
        prNumber: boundaryInput.prNumber,
        commitSha: boundaryInput.commitSha,
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
      kind: 'github.pr_lifecycle_run',
      label: 'github-pr-lifecycle-run',
      summary: 'GitHub PR lifecycle run stores response hashes and status/check counts only.',
      metadata: {
        integration: GITHUB_PROVIDER_NAME,
        dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
        status,
        networkBoundaryInvoked: boundaryResult?.networkBoundaryInvoked ?? false,
        responseBodyHashCount: responseBodyHashes.length,
        checkRunCount: boundaryResult?.checkRunCount ?? 0,
        statusContextCount: boundaryResult?.statusContextCount ?? 0,
      },
    }),
  ];
  const lifecycleSummary = createGithubRemotePrLifecycleSummary({
    targetRef: input.dryRunRecord.targetRef,
    prNumberHash: boundaryResult?.prNumberHash ?? input.dryRunRecord.prNumberHash,
    prUrlHash: boundaryResult?.prUrlHash,
    stateSummary: boundaryResult?.stateSummary ?? status,
    checkRunCount: boundaryResult?.checkRunCount ?? 0,
    statusContextCount: boundaryResult?.statusContextCount ?? 0,
    failedCheckCount: boundaryResult?.failedCheckCount ?? 0,
    pendingCheckCount: boundaryResult?.pendingCheckCount ?? 0,
    passedCheckCount: boundaryResult?.passedCheckCount ?? 0,
    now,
  });

  return GithubPrLifecycleObservationRunSchema.parse({
    id: stableId(
      'github_pr_lifecycle_run',
      `${input.dryRunRecord.dryRunId}:${status}:${observedAt}:${responseBodyHashes.join(',')}`,
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: observedAt,
    dryRunId: input.dryRunRecord.dryRunId,
    dryRunRecordId: input.dryRunRecord.id,
    approvalArtifactId: input.approvalRecord?.approvalArtifactId,
    status,
    plan: input.dryRunRecord,
    lifecycleSummary,
    responseBodyHashes,
    blockReasons: finalBlockReasons,
    evidenceRefs,
    auditEventIds: [foundationId('audit')],
    networkBoundaryInvoked: boundaryResult?.networkBoundaryInvoked ?? false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    rawUrlStored: false,
    rawResponseBodyStored: false,
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
        ? 'GitHub PR lifecycle observation completed with hash-only status and check summaries.'
        : `GitHub PR lifecycle observation ${status}: ${finalBlockReasons.join(', ')}.`,
  });
}

export async function executeGithubPrManagement(
  input: GithubPrManagementExecutionInput,
): Promise<GithubPrManagementRun> {
  const now = input.now ?? foundationTimestamp;
  const observedAt = now();
  const blockReasons = collectPrManagementExecutionBlockReasons(input, observedAt);
  const boundaryInput = blockReasons.length === 0 ? input.runtime : undefined;
  const boundaryResult = boundaryInput
    ? await runGithubPrManagementHttpBoundary({
        owner: boundaryInput.owner,
        repo: boundaryInput.repo,
        baseBranch: boundaryInput.baseBranch,
        headBranch: boundaryInput.headBranch,
        managementKind: boundaryInput.managementKind,
        prNumber: boundaryInput.prNumber,
        itemSummaries: boundaryInput.itemSummaries,
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
      kind: getGithubPrManagementEvidenceKind(input.dryRunRecord.managementKind, 'run'),
      label: `github-pr-${input.dryRunRecord.managementKind}-run`,
      summary: `GitHub PR ${input.dryRunRecord.managementKind} run stores response hashes and counts only.`,
      metadata: {
        integration: GITHUB_PROVIDER_NAME,
        managementKind: input.dryRunRecord.managementKind,
        dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
        status,
        networkBoundaryInvoked: boundaryResult?.networkBoundaryInvoked ?? false,
        responseBodyHashCount: responseBodyHashes.length,
      },
    }),
  ];
  const managementSummary = createGithubPrManagementSummary({
    managementKind: input.dryRunRecord.managementKind,
    targetRef: input.dryRunRecord.targetRef,
    prNumberHash: boundaryResult?.prNumberHash ?? input.dryRunRecord.prNumberHash,
    itemCount: boundaryResult?.itemCount ?? input.dryRunRecord.itemCount,
    payloadHash: boundaryResult?.payloadHash ?? input.dryRunRecord.payloadHash,
    responseBodyHashCount: responseBodyHashes.length,
    changed: boundaryResult?.changed ?? false,
    now,
  });

  return GithubPrManagementRunSchema.parse({
    id: stableId(
      `github_pr_${input.dryRunRecord.managementKind}_run`,
      `${input.dryRunRecord.dryRunId}:${status}:${observedAt}:${responseBodyHashes.join(',')}`,
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: observedAt,
    dryRunId: input.dryRunRecord.dryRunId,
    dryRunRecordId: input.dryRunRecord.id,
    approvalArtifactId: input.approvalRecord?.approvalArtifactId,
    managementKind: input.dryRunRecord.managementKind,
    status,
    plan: input.dryRunRecord,
    managementSummary,
    responseBodyHashes,
    blockReasons: finalBlockReasons,
    evidenceRefs,
    auditEventIds: [foundationId('audit')],
    networkBoundaryInvoked: boundaryResult?.networkBoundaryInvoked ?? false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: !(boundaryResult?.changed ?? false),
    fixedEndpointOnly: true,
    addOrSetOnly: true,
    mergeAllowed: false,
    pushAllowed: false,
    updateRefAllowed: false,
    forceAllowed: false,
    arbitraryEndpointAllowed: false,
    rawUrlStored: false,
    rawResponseBodyStored: false,
    rawPrBodyStored: false,
    rawCommentBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      managementKind: input.dryRunRecord.managementKind,
      dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
      status,
      networkBoundaryInvoked: boundaryResult?.networkBoundaryInvoked ?? false,
      responseBodyHashCount: responseBodyHashes.length,
    },
    summary:
      status === 'completed'
        ? `GitHub PR ${input.dryRunRecord.managementKind} management completed with hash-only summaries.`
        : `GitHub PR ${input.dryRunRecord.managementKind} management ${status}: ${finalBlockReasons.join(', ')}.`,
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

export async function executeGithubBranchPublish(
  input: GithubBranchPublishExecutionInput,
): Promise<GithubBranchPublishRun> {
  const now = input.now ?? foundationTimestamp;
  const observedAt = now();
  const blockReasons = collectBranchPublishExecutionBlockReasons(input, observedAt);
  const boundaryInput = blockReasons.length === 0 ? input.runtime : undefined;
  const boundaryResult = boundaryInput
    ? await runGithubBranchPublishHttpBoundary({
        ...boundaryInput,
        token: boundaryInput.token ?? '',
        fetchImpl: input.fetchImpl,
      })
    : undefined;
  const finalBlockReasons = [...blockReasons, ...(boundaryResult?.blockReasons ?? [])];
  const status: GithubBranchPublishRun['status'] =
    blockReasons.length > 0
      ? 'blocked'
      : boundaryResult?.status === 'completed'
        ? 'completed'
        : boundaryResult?.status ?? 'failed';
  const responseBodyHashes = boundaryResult?.responseBodyHashes ?? [];
  const runId = stableId(
    'github_branch_publish_run',
    JSON.stringify({
      dryRunId: input.dryRunRecord.dryRunId,
      status,
      responseBodyHashes,
      blockReasons: finalBlockReasons,
      networkBoundaryInvoked: boundaryResult?.networkBoundaryInvoked ?? false,
    }),
  );
  const evidenceRefs = [
    createGithubEvidenceRef({
      kind: 'github.branch_publish_summary',
      label: 'github-branch-publish-summary',
      summary: 'GitHub branch publish run stores remote commit and response metadata as hashes only.',
      metadata: {
        integration: GITHUB_PROVIDER_NAME,
        dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
        runIdHash: stableHash(runId),
        status,
        networkBoundaryInvoked: boundaryResult?.networkBoundaryInvoked ?? false,
        responseBodyHashCount: responseBodyHashes.length,
        created: boundaryResult?.created ?? false,
      },
    }),
  ];
  const auditEventIds = [foundationId('audit')];
  const commitSummary = createGithubRemoteCommitSummary({
    targetRef: input.dryRunRecord.readiness.targetRef,
    commitShaHash: boundaryResult?.commitShaHash,
    treeShaHash: boundaryResult?.treeShaHash,
    branchNameHash: input.dryRunRecord.readiness.targetRef.headBranchHash ?? stableHash('missing'),
    contentManifestHash: stableHash(input.dryRunRecord.readiness.contentManifest.id),
    fileCount: input.dryRunRecord.readiness.contentManifest.fileCount,
    created: boundaryResult?.created ?? false,
    now,
  });

  return GithubBranchPublishRunSchema.parse({
    id: runId,
    schemaVersion: SchemaVersionSchema.value,
    createdAt: observedAt,
    dryRunId: input.dryRunRecord.dryRunId,
    dryRunRecordId: input.dryRunRecord.id,
    approvalArtifactId: input.approvalRecord?.approvalArtifactId,
    status,
    plan: input.dryRunRecord,
    commitSummary,
    responseBodyHashes,
    blockReasons: finalBlockReasons,
    evidenceRefs,
    auditEventIds,
    networkBoundaryInvoked: boundaryResult?.networkBoundaryInvoked ?? false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: status !== 'completed',
    createRefAllowed: true,
    updateRefAllowed: false,
    forceAllowed: false,
    pushAllowed: false,
    mergeAllowed: false,
    rawFileContentStored: false,
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
        ? 'GitHub branch publish completed with hash-only remote commit summaries.'
        : `GitHub branch publish ${status}: ${finalBlockReasons.join(', ')}.`,
  });
}

export function runGithubDraftPrAcceptanceRehearsal(
  input: GithubDraftPrAcceptanceRehearsalInput = {},
): GithubDraftPrAcceptanceRehearsalRun {
  const now = input.now ?? foundationTimestamp;
  const scenario = input.scenario ?? 'all-pass';
  const state = getGithubDraftPrAcceptanceScenarioState(scenario);

  return GithubDraftPrAcceptanceRehearsalRunSchema.parse({
    id: stableId('github_draft_pr_rehearsal', scenario),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    scenario,
    status: state.status,
    stepCount: 6,
    readinessStatus: state.readinessStatus,
    prCreationStatus: state.prCreationStatus,
    evidenceRefCount: state.evidenceRefCount,
    auditEventCount: state.auditEventCount,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    draft: true,
    pushAllowed: false,
    createRefAllowed: false,
    mergeAllowed: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      scenario,
      fixtureOnly: true,
      blockerCount: state.blockerCount,
      networkBoundaryInvoked: false,
      draftOnly: true,
    },
    summary: `GitHub draft PR acceptance rehearsal ${state.status}; fixture metadata only.`,
  });
}

export function runGithubBranchPublishAcceptanceRehearsal(
  input: GithubBranchPublishAcceptanceRehearsalInput = {},
): GithubBranchPublishAcceptanceRehearsalRun {
  const now = input.now ?? foundationTimestamp;
  const scenario = input.scenario ?? 'all-pass';
  const state = getGithubBranchPublishAcceptanceScenarioState(scenario);

  return GithubBranchPublishAcceptanceRehearsalRunSchema.parse({
    id: stableId('github_branch_publish_rehearsal', scenario),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    scenario,
    status: state.status,
    readinessStatus: state.readinessStatus,
    branchPublishStatus: state.branchPublishStatus,
    stepCount: 7,
    evidenceRefCount: state.evidenceRefCount,
    auditEventCount: state.auditEventCount,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    createRefAllowed: true,
    updateRefAllowed: false,
    forceAllowed: false,
    pushAllowed: false,
    mergeAllowed: false,
    rawFileContentStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      scenario,
      fixtureOnly: true,
      blockerCount: state.blockerCount,
      networkBoundaryInvoked: false,
      newBranchOnly: true,
    },
    summary: `GitHub branch publish acceptance rehearsal ${state.status}; fixture metadata only.`,
  });
}

export function runGithubPrLifecycleAcceptanceRehearsal(
  input: GithubPrLifecycleAcceptanceRehearsalInput = {},
): GithubPrLifecycleAcceptanceRehearsalRun {
  const now = input.now ?? foundationTimestamp;
  const scenario = input.scenario ?? 'all-pass';
  const state = getGithubPrLifecycleAcceptanceScenarioState(scenario);

  return GithubPrLifecycleAcceptanceRehearsalRunSchema.parse({
    id: stableId('github_pr_lifecycle_rehearsal', scenario),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    scenario,
    status: state.status,
    lifecycleStatus: state.lifecycleStatus,
    stepCount: 5,
    evidenceRefCount: state.evidenceRefCount,
    auditEventCount: state.auditEventCount,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    rawUrlStored: false,
    rawResponseBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    blockerCount: state.blockerCount,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      scenario,
      fixtureOnly: true,
      lifecycleStatus: state.lifecycleStatus,
      networkBoundaryInvoked: false,
    },
    summary: `GitHub PR lifecycle acceptance rehearsal ${state.status}; fixture metadata only.`,
  });
}

export function runGithubPrManagementAcceptanceRehearsal(
  input: GithubPrManagementAcceptanceRehearsalInput,
): GithubPrManagementAcceptanceRehearsalRun {
  const now = input.now ?? foundationTimestamp;
  const scenario = input.scenario ?? 'all-pass';
  const status: GithubPrManagementAcceptanceRehearsalRun['status'] =
    scenario === 'all-pass'
      ? 'passed'
      : scenario === 'github-write-failed'
        ? 'failed'
        : scenario === 'network-timeout'
          ? 'aborted'
          : 'blocked';
  const blockerCount = scenario === 'all-pass' ? 0 : 1;

  return GithubPrManagementAcceptanceRehearsalRunSchema.parse({
    id: stableId(`github_pr_${input.managementKind}_management_rehearsal`, scenario),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    managementKind: input.managementKind,
    scenario,
    status,
    stepCount: 4,
    blockerCount,
    evidenceRefCount: scenario === 'all-pass' ? 3 : 1,
    auditEventCount: scenario === 'all-pass' ? 3 : 1,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    fixedEndpointOnly: true,
    addOrSetOnly: true,
    mergeAllowed: false,
    pushAllowed: false,
    updateRefAllowed: false,
    forceAllowed: false,
    rawUrlStored: false,
    rawResponseBodyStored: false,
    rawPrBodyStored: false,
    rawCommentBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      managementKind: input.managementKind,
      scenario,
      fixtureOnly: true,
      blockerCount,
      networkBoundaryInvoked: false,
      fixedEndpointOnly: true,
      addOrSetOnly: true,
    },
    summary: `GitHub PR ${input.managementKind} management rehearsal ${status}; fixture metadata only.`,
  });
}

export function createGithubPublishDraftPrChainPlan(
  input: GithubPublishDraftPrChainPlanInput,
): GithubPublishDraftPrChainPlan {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = [
    isSafeSourceSummary(input.sourceId) ? undefined : 'missing_source_id',
    isSafeSourceSummary(input.branchPublishDryRunId)
      ? undefined
      : 'missing_branch_publish_dry_run',
    isSafeSourceSummary(input.draftPrDryRunId) ? undefined : 'missing_draft_pr_dry_run',
  ].filter((reason): reason is string => Boolean(reason));
  const chainId = stableId(
    'github_publish_draft_pr_chain',
    JSON.stringify({
      sourceKind: input.sourceKind,
      sourceIdHash: stableHash(input.sourceId),
      branchPublishDryRunId: input.branchPublishDryRunId,
      draftPrDryRunId: input.draftPrDryRunId,
    }),
  );
  return GithubPublishDraftPrChainPlanSchema.parse({
    id: stableId('github_publish_draft_pr_chain_plan', chainId),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    chainId,
    sourceKind: input.sourceKind,
    sourceIdHash: stableHash(input.sourceId),
    branchPublishDryRunId: input.branchPublishDryRunId,
    draftPrDryRunId: input.draftPrDryRunId,
    separateApprovalsRequired: true,
    branchPublishApprovalRequired: true,
    draftPrApprovalRequired: true,
    networkBoundaryPlanned: input.networkBoundaryPlanned ?? blockReasons.length === 0,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      chainIdHash: stableHash(chainId),
      sourceKind: input.sourceKind,
      sourceIdHash: stableHash(input.sourceId),
      branchPublishDryRunIdHash: stableHash(input.branchPublishDryRunId),
      draftPrDryRunIdHash: stableHash(input.draftPrDryRunId),
      blockReasonCount: blockReasons.length,
      blocked: blockReasons.length > 0,
      pushAllowed: false,
      updateRefAllowed: false,
      forceAllowed: false,
      mergeAllowed: false,
      rawPathStored: false,
      bodyStored: false,
    },
    summary:
      blockReasons.length === 0
        ? 'GitHub publish to draft PR chain plan is ready to link approved child runs.'
        : `GitHub publish to draft PR chain plan is blocked by ${blockReasons.length} metadata issue(s).`,
  });
}

export function createGithubRemotePrLifecycleSummary(
  input: GithubRemotePrLifecycleSummaryInput,
): GithubRemotePrLifecycleSummary {
  const now = input.now ?? foundationTimestamp;
  const checkRunCount = input.checkRunCount ?? 0;
  const statusContextCount = input.statusContextCount ?? 0;
  const failedCheckCount = input.failedCheckCount ?? 0;
  const pendingCheckCount = input.pendingCheckCount ?? 0;
  const passedCheckCount = input.passedCheckCount ?? 0;

  return GithubRemotePrLifecycleSummarySchema.parse({
    id: stableId(
      'github_remote_pr_lifecycle_summary',
      JSON.stringify({
        targetRefId: input.targetRef.id,
        prNumberHash: input.prNumberHash,
        stateSummary: input.stateSummary,
        checkRunCount,
        statusContextCount,
      }),
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    targetRef: input.targetRef,
    prNumberHash: input.prNumberHash,
    prUrlHash: input.prUrlHash,
    stateHash: input.stateSummary ? stableHash(input.stateSummary) : undefined,
    checkRunCount,
    statusContextCount,
    failedCheckCount,
    pendingCheckCount,
    passedCheckCount,
    rawUrlStored: false,
    rawResponseBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      targetRefIdHash: stableHash(input.targetRef.id),
      prNumberHash: input.prNumberHash,
      prUrlHash: input.prUrlHash,
      stateHash: input.stateSummary ? stableHash(input.stateSummary) : undefined,
      checkRunCount,
      statusContextCount,
      rawUrlStored: false,
      rawResponseBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
    },
    summary:
      failedCheckCount > 0
        ? 'GitHub PR lifecycle projection reports failed checks using counts and hashes only.'
        : pendingCheckCount > 0
          ? 'GitHub PR lifecycle projection reports pending checks using counts and hashes only.'
          : 'GitHub PR lifecycle projection stores PR status metadata as hashes and counts only.',
  });
}

export function createGithubPrManagementSummary(input: {
  managementKind: GithubPrManagementKind;
  targetRef: GithubRemoteRefSummary;
  prNumberHash?: string;
  itemCount: number;
  payloadHash?: string;
  responseBodyHashCount: number;
  changed: boolean;
  now?: () => string;
}): GithubPrManagementSummary {
  const now = input.now ?? foundationTimestamp;

  return GithubPrManagementSummarySchema.parse({
    id: stableId(
      `github_pr_${input.managementKind}_summary`,
      JSON.stringify({
        targetRefId: input.targetRef.id,
        prNumberHash: input.prNumberHash,
        itemCount: input.itemCount,
        payloadHash: input.payloadHash,
        changed: input.changed,
      }),
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    managementKind: input.managementKind,
    targetRef: input.targetRef,
    prNumberHash: input.prNumberHash,
    itemCount: input.itemCount,
    payloadHash: input.payloadHash,
    responseBodyHashCount: input.responseBodyHashCount,
    changed: input.changed,
    fixedEndpointOnly: true,
    addOrSetOnly: true,
    rawUrlStored: false,
    rawResponseBodyStored: false,
    rawPrBodyStored: false,
    rawCommentBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      managementKind: input.managementKind,
      targetRefIdHash: stableHash(input.targetRef.id),
      prNumberHash: input.prNumberHash,
      itemCount: input.itemCount,
      payloadHash: input.payloadHash,
      responseBodyHashCount: input.responseBodyHashCount,
      changed: input.changed,
      fixedEndpointOnly: true,
      addOrSetOnly: true,
    },
    summary: `GitHub PR ${input.managementKind} summary stores action metadata as hashes and counts only.`,
  });
}

export function createGithubPublishDraftPrChainRun(
  input: GithubPublishDraftPrChainExecutionInput,
): GithubPublishDraftPrChainRun {
  const now = input.now ?? foundationTimestamp;
  const observedAt = now();
  const blockReasons: string[] = [];
  const branchRun = input.branchPublishRun;
  const draftRun = input.draftPrRun;

  if (!branchRun) {
    blockReasons.push('missing_branch_publish_run');
  } else if (branchRun.status !== 'completed' || !branchRun.commitSummary.created) {
    blockReasons.push(`branch_publish_${branchRun.status}`);
  }

  if (branchRun?.status === 'completed' && branchRun.commitSummary.created) {
    if (!draftRun) {
      blockReasons.push('missing_draft_pr_run');
    } else if (draftRun.status !== 'completed' || !draftRun.creationSummary.created) {
      blockReasons.push(`draft_pr_${draftRun.status}`);
    }
  }

  const lifecycleSummary =
    input.lifecycleSummary ??
    (draftRun
      ? createGithubRemotePrLifecycleSummary({
          targetRef: draftRun.creationSummary.targetRef,
          prNumberHash: draftRun.creationSummary.prNumberHash,
          prUrlHash: draftRun.creationSummary.prUrlHash,
          stateSummary: draftRun.creationSummary.created ? 'draft_open' : 'not_created',
          pendingCheckCount: draftRun.creationSummary.created ? 1 : 0,
          checkRunCount: draftRun.creationSummary.created ? 1 : 0,
          now,
        })
      : undefined);

  const branchStep = createGithubPublishDraftPrChainStep({
    phase: 'branch-publish',
    order: 0,
    status: branchRun
      ? branchRun.status === 'completed'
        ? 'completed'
        : branchRun.status
      : 'blocked',
    evidenceRefIds: branchRun?.evidenceRefs.map((ref) => ref.id) ?? [],
    auditEventIds: branchRun?.auditEventIds ?? [],
    networkBoundaryInvoked: branchRun?.networkBoundaryInvoked ?? false,
    summary: branchRun
      ? `Branch publish child run ${branchRun.status}; output remains metadata-only.`
      : 'Branch publish child run is missing; draft PR creation is skipped.',
    now,
  });
  const draftStep = createGithubPublishDraftPrChainStep({
    phase: 'draft-pr-create',
    order: 1,
    status:
      branchStep.status === 'completed'
        ? draftRun
          ? draftRun.status === 'completed'
            ? 'completed'
            : draftRun.status
          : 'blocked'
        : 'skipped',
    evidenceRefIds: draftRun?.evidenceRefs.map((ref) => ref.id) ?? [],
    auditEventIds: draftRun?.auditEventIds ?? [],
    networkBoundaryInvoked: draftRun?.networkBoundaryInvoked ?? false,
    summary:
      branchStep.status === 'completed'
        ? draftRun
          ? `Draft PR child run ${draftRun.status}; PR identifiers are hashes only.`
          : 'Draft PR child run is missing after branch publish.'
        : 'Draft PR creation skipped because branch publish did not complete.',
    now,
  });
  const lifecycleStep = createGithubPublishDraftPrChainStep({
    phase: 'pr-lifecycle-observe',
    order: 2,
    status:
      draftStep.status === 'completed'
        ? lifecycleSummary
          ? lifecycleSummary.failedCheckCount > 0
            ? 'failed'
            : 'completed'
          : 'blocked'
        : 'skipped',
    evidenceRefIds: [],
    auditEventIds: [],
    networkBoundaryInvoked: false,
    summary:
      draftStep.status === 'completed'
        ? 'PR lifecycle projection completed from metadata-only child run summaries.'
        : 'PR lifecycle projection skipped because draft PR creation did not complete.',
    now,
  });
  const steps = [branchStep, draftStep, lifecycleStep];
  const evidenceRefs = [
    ...(branchRun?.evidenceRefs ?? []),
    ...(draftRun?.evidenceRefs ?? []),
    ...(lifecycleSummary
      ? [
          createGithubEvidenceRef({
            kind: 'github.pr_lifecycle_summary',
            label: 'GitHub PR lifecycle summary',
            summary: lifecycleSummary.summary,
            metadata: {
              lifecycleSummaryIdHash: stableHash(lifecycleSummary.id),
              checkRunCount: lifecycleSummary.checkRunCount,
              statusContextCount: lifecycleSummary.statusContextCount,
              rawPathStored: false,
              bodyStored: false,
            },
          }),
        ]
      : []),
    createGithubEvidenceRef({
      kind: 'github.publish_draft_pr_chain_summary',
      label: 'GitHub publish to draft PR chain summary',
      summary: 'Metadata-only chain summary for branch publish, draft PR, and lifecycle steps.',
      metadata: {
        chainIdHash: stableHash(input.plan.chainId),
        stepCount: steps.length,
        blockReasonCount: blockReasons.length,
        rawPathStored: false,
        bodyStored: false,
      },
    }),
  ];
  const auditEventIds = [
    ...(branchRun?.auditEventIds ?? []),
    ...(draftRun?.auditEventIds ?? []),
    stableId('audit_github_publish_draft_pr_chain', input.plan.chainId),
  ];
  const networkBoundaryInvoked =
    (branchRun?.networkBoundaryInvoked ?? false) || (draftRun?.networkBoundaryInvoked ?? false);
  const status: GithubPublishDraftPrChainRun['status'] =
    branchStep.status === 'completed' && draftStep.status === 'completed'
      ? lifecycleStep.status === 'failed'
        ? 'failed'
        : 'completed'
      : blockReasons.some((reason) => reason.includes('failed'))
        ? 'failed'
        : blockReasons.length > 0
          ? 'blocked'
          : 'completed';

  return GithubPublishDraftPrChainRunSchema.parse({
    id: stableId('github_publish_draft_pr_chain_run', `${input.plan.chainId}:${observedAt}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: observedAt,
    chainId: input.plan.chainId,
    status,
    plan: input.plan,
    steps,
    stepCount: steps.length,
    branchPublishRunId: branchRun?.id,
    draftPrRunId: draftRun?.id,
    lifecycleSummary,
    blockReasons,
    evidenceRefs,
    auditEventIds,
    networkBoundaryInvoked,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: !networkBoundaryInvoked,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      chainIdHash: stableHash(input.plan.chainId),
      branchPublishRunIdHash: branchRun ? stableHash(branchRun.id) : undefined,
      draftPrRunIdHash: draftRun ? stableHash(draftRun.id) : undefined,
      lifecycleSummaryIdHash: lifecycleSummary ? stableHash(lifecycleSummary.id) : undefined,
      blockReasonCount: blockReasons.length,
      networkBoundaryInvoked,
      pushAllowed: false,
      updateRefAllowed: false,
      forceAllowed: false,
      mergeAllowed: false,
      rawPathStored: false,
      bodyStored: false,
    },
    summary:
      status === 'completed'
        ? 'GitHub publish to draft PR chain completed using governed child run records.'
        : `GitHub publish to draft PR chain ${status}; recovery metadata is available without remote cleanup.`,
  });
}

export function createRemoteSupersedePlan(
  input: RemoteSupersedeProjectionInput,
): RemoteSupersedePlan {
  const now = input.now ?? foundationTimestamp;
  const target = createRemoteSupersedeTargetSummary(input, now);
  const cleanupReadiness = createRemoteCleanupReadiness({
    target,
    successorRunId: input.successorDraftPrRunId ?? input.successorBranchPublishRunId,
    blockReasons: collectRemoteSupersedeBlockReasons(input),
    now,
  });
  const blockReasons = collectRemoteSupersedeBlockReasons(input);
  const dryRunId = stableId(
    'remote_supersede_dry_run',
    JSON.stringify({
      sourceRunIdHash: stableHash(input.sourceRunId),
      successorBranchPublishRunIdHash: input.successorBranchPublishRunId
        ? stableHash(input.successorBranchPublishRunId)
        : undefined,
      successorDraftPrRunIdHash: input.successorDraftPrRunId
        ? stableHash(input.successorDraftPrRunId)
        : undefined,
      oldBranchNameHash: input.oldBranchName ? stableHash(input.oldBranchName) : undefined,
      oldPrNumberHash: input.oldPrNumber ? stableHash(input.oldPrNumber) : undefined,
    }),
  );
  const policyDecision = createGithubPolicyDecision({
    actionId: dryRunId,
    actionType: 'github.remote_supersede.project',
    actionMode: 'read',
    now,
    allow: true,
    reasons: ['remote supersede projection is metadata-only and does not invoke GitHub writes'],
  });
  const evidenceRefs = [
    createGithubEvidenceRef({
      kind: 'github.remote_supersede_plan',
      label: 'github-remote-supersede-plan',
      summary: 'Remote supersede projection stores source and successor ids as hashes only.',
      metadata: {
        integration: GITHUB_PROVIDER_NAME,
        dryRunIdHash: stableHash(dryRunId),
        sourceRunIdHash: stableHash(input.sourceRunId),
        successorPresent: Boolean(input.successorBranchPublishRunId || input.successorDraftPrRunId),
        blockerCount: blockReasons.length,
      },
    }),
  ];

  return RemoteSupersedePlanSchema.parse({
    id: stableId('remote_supersede_plan', dryRunId),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId,
    status: blockReasons.length === 0 ? 'planned' : 'blocked',
    target,
    cleanupReadiness,
    sourceRunIdHash: stableHash(input.sourceRunId),
    successorRunIdHash:
      input.successorDraftPrRunId || input.successorBranchPublishRunId
        ? stableHash(input.successorDraftPrRunId ?? input.successorBranchPublishRunId ?? '')
        : undefined,
    blockReasons,
    policyDecision,
    evidenceRefs,
    auditEventIds: [foundationId('audit')],
    remoteCleanupRequiresApproval: true,
    cleanupExecutionAllowed: false,
    closePrAllowed: false,
    deleteBranchAllowed: false,
    mergeAllowed: false,
    updateRefAllowed: false,
    forceAllowed: false,
    commentAllowed: false,
    labelAllowed: false,
    reviewerAllowed: false,
    rawRefStored: false,
    rawUrlStored: false,
    rawReasonStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      dryRunIdHash: stableHash(dryRunId),
      sourceRunIdHash: stableHash(input.sourceRunId),
      cleanupReadinessStatus: cleanupReadiness.status,
      blockerCount: blockReasons.length,
      projectionOnly: true,
    },
    summary:
      blockReasons.length === 0
        ? 'Remote supersede projection is ready; cleanup remains a separate approval-gated operation.'
        : `Remote supersede projection is blocked: ${blockReasons.join(', ')}.`,
  });
}

export function createRemoteSupersedeRun(input: {
  plan: RemoteSupersedePlan;
  now?: () => string;
}): RemoteSupersedeRun {
  const now = input.now ?? foundationTimestamp;
  const status: RemoteSupersedeRun['status'] =
    input.plan.status === 'planned' ? 'completed' : 'blocked';
  const evidenceRefs = [
    ...input.plan.evidenceRefs,
    createGithubEvidenceRef({
      kind: 'github.remote_supersede_summary',
      label: 'github-remote-supersede-summary',
      summary: 'Remote supersede run stores cleanup readiness and target hashes only.',
      metadata: {
        integration: GITHUB_PROVIDER_NAME,
        dryRunIdHash: stableHash(input.plan.dryRunId),
        status,
        cleanupReadinessStatus: input.plan.cleanupReadiness.status,
      },
    }),
  ];

  return RemoteSupersedeRunSchema.parse({
    id: stableId('remote_supersede_run', `${input.plan.dryRunId}:${status}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: input.plan.dryRunId,
    dryRunRecordId: input.plan.id,
    status,
    plan: input.plan,
    target: input.plan.target,
    cleanupReadiness: input.plan.cleanupReadiness,
    blockReasons: input.plan.blockReasons,
    evidenceRefs,
    evidenceRefIds: evidenceRefs.map((ref) => ref.id),
    auditEventIds: [...input.plan.auditEventIds, foundationId('audit')],
    remoteCleanupRequiresApproval: true,
    cleanupExecutionAllowed: false,
    closePrAllowed: false,
    deleteBranchAllowed: false,
    mergeAllowed: false,
    updateRefAllowed: false,
    forceAllowed: false,
    commentAllowed: false,
    labelAllowed: false,
    reviewerAllowed: false,
    rawRefStored: false,
    rawUrlStored: false,
    rawReasonStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      dryRunIdHash: stableHash(input.plan.dryRunId),
      status,
      projectionOnly: true,
    },
    summary:
      status === 'completed'
        ? 'Remote supersede projection completed without invoking GitHub writes.'
        : `Remote supersede projection blocked: ${input.plan.blockReasons.join(', ')}.`,
  });
}

export function createRemoteSupersedeChainProjection(input: {
  plan: RemoteSupersedePlan;
  runs?: RemoteSupersedeRun[];
  now?: () => string;
}): RemoteSupersedeChainProjection {
  const now = input.now ?? foundationTimestamp;
  const runs = input.runs ?? [];
  const evidenceRefIds = [
    ...input.plan.evidenceRefs.map((ref) => ref.id),
    ...runs.flatMap((run) => run.evidenceRefIds),
  ];
  const auditEventIds = [...input.plan.auditEventIds, ...runs.flatMap((run) => run.auditEventIds)];
  const chainHash = stableHash(
    JSON.stringify({
      planId: input.plan.id,
      runIds: runs.map((run) => run.id),
      cleanupReadinessStatus: input.plan.cleanupReadiness.status,
    }),
  );

  return RemoteSupersedeChainProjectionSchema.parse({
    id: stableId('remote_supersede_chain_projection', chainHash),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    plan: input.plan,
    runs,
    runCount: runs.length,
    cleanupReadiness: input.plan.cleanupReadiness,
    evidenceRefIds,
    auditEventIds,
    chainHash,
    rawRefStored: false,
    rawUrlStored: false,
    rawReasonStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      planIdHash: stableHash(input.plan.id),
      runCount: runs.length,
      cleanupReadinessStatus: input.plan.cleanupReadiness.status,
    },
    summary: 'Remote supersede chain projection links old and successor remote metadata only.',
  });
}

export function createGithubRemoteCleanupPlan(
  input: GithubRemoteCleanupPlanInput,
): GithubRemoteCleanupPlan {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = collectRemoteCleanupPlanBlockReasons(input);
  const targetInput = { ...input, headBranch: input.oldBranchName };
  const targetRef =
    blockReasons.includes('invalid_owner') ||
    blockReasons.includes('invalid_repo') ||
    blockReasons.includes('invalid_old_branch')
      ? createBlockedGithubRemoteRefSummary(targetInput, now)
      : createGithubRemoteRefSummary(targetInput);
  const target = createRemoteSupersedeTargetSummary(
    {
      sourceRunId: input.sourceBranchPublishRunId,
      sourceSummary: input.successorRunId,
      targetKind: input.oldPrNumber ? 'draft_pr_and_branch' : 'branch',
      sourceBranchPublishRunId: input.sourceBranchPublishRunId,
      sourceDraftPrRunId: input.sourceDraftPrRunId,
      successorDraftPrRunId: input.successorRunId,
      oldBranchName: input.oldBranchName,
      oldPrNumber: input.oldPrNumber,
      successorReady: input.successorReady,
      metadataReady: true,
      now,
    },
    now,
  );
  const cleanupReadiness = createRemoteCleanupReadiness({
    target,
    successorRunId: input.successorRunId,
    blockReasons,
    now,
  });
  const dryRunId = stableId(
    'github_remote_cleanup_dry_run',
    JSON.stringify({
      ownerHash: targetRef.ownerHash,
      repoHash: targetRef.repoHash,
      oldBranchNameHash: stableHash(input.oldBranchName),
      oldPrNumberHash: input.oldPrNumber ? stableHash(input.oldPrNumber) : undefined,
      successorRunIdHash: stableHash(input.successorRunId),
    }),
  );
  const policyDecision = createGithubPolicyDecision({
    actionId: dryRunId,
    actionType: 'github.remote_cleanup.execute',
    actionMode: 'write',
    now,
    allow: false,
    reasons: ['remote cleanup closes old draft PRs and deletes old codexhub refs only after approval'],
  });
  const evidenceRefs = [
    createGithubEvidenceRef({
      kind: 'github.remote_cleanup_plan',
      label: 'github-remote-cleanup-plan',
      summary: 'GitHub remote cleanup plan stores old PR/branch identifiers as hashes only.',
      metadata: {
        integration: GITHUB_PROVIDER_NAME,
        dryRunIdHash: stableHash(dryRunId),
        oldBranchNameHash: stableHash(input.oldBranchName),
        oldPrNumberHash: input.oldPrNumber ? stableHash(input.oldPrNumber) : undefined,
        blockerCount: blockReasons.length,
      },
    }),
  ];

  return GithubRemoteCleanupPlanSchema.parse({
    id: stableId('github_remote_cleanup_plan', dryRunId),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId,
    status: blockReasons.length === 0 ? 'planned' : 'blocked',
    runnerMode: input.runnerMode ?? 'planning-only',
    targetRef,
    target,
    cleanupReadiness,
    oldPrNumberHash: input.oldPrNumber ? stableHash(input.oldPrNumber) : undefined,
    oldBranchNameHash: stableHash(input.oldBranchName),
    successorRunIdHash: stableHash(input.successorRunId),
    sourceBranchPublishRunIdHash: stableHash(input.sourceBranchPublishRunId),
    sourceDraftPrRunIdHash: input.sourceDraftPrRunId
      ? stableHash(input.sourceDraftPrRunId)
      : undefined,
    blockReasons,
    policyDecision,
    requiresApproval: true,
    evidenceRefs,
    auditEventIds: [foundationId('audit')],
    networkBoundaryPlanned:
      blockReasons.length === 0 && input.runnerMode === 'controlled-github-remote-cleanup',
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    closePrAllowed: true,
    deleteRefAllowed: true,
    deleteNonCodexhubBranchAllowed: false,
    updateRefAllowed: false,
    forceAllowed: false,
    mergeAllowed: false,
    commentAllowed: false,
    labelAllowed: false,
    reviewerAllowed: false,
    releaseAllowed: false,
    deploymentAllowed: false,
    pushAllowed: false,
    rawRefStored: false,
    rawUrlStored: false,
    rawResponseBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      dryRunIdHash: stableHash(dryRunId),
      oldBranchNameHash: stableHash(input.oldBranchName),
      cleanupReadinessStatus: cleanupReadiness.status,
      blockerCount: blockReasons.length,
      productDefaultEnabled: false,
    },
    summary:
      blockReasons.length === 0
        ? 'GitHub remote cleanup dry-run is ready for approval-gated close/delete execution.'
        : `GitHub remote cleanup dry-run is blocked: ${blockReasons.join(', ')}.`,
  });
}

export function createGithubRemoteCleanupApprovalRecord(
  input: GithubRemoteCleanupApprovalInput,
): GithubRemoteCleanupApprovalArtifactRecord {
  const now = input.now ?? foundationTimestamp;
  const baseRecord = input.baseRecord;
  const approvalRequestId =
    baseRecord?.approvalRequestId ??
    stableId('github_remote_cleanup_approval_request', input.dryRunRecord.dryRunId);
  const approvalArtifactId =
    baseRecord?.approvalArtifactId ??
    stableId('github_remote_cleanup_approval_artifact', input.dryRunRecord.dryRunId);
  const evidenceRefs = [
    createGithubEvidenceRef({
      kind: 'github.remote_cleanup_plan',
      label: 'github-remote-cleanup-approval',
      summary: 'GitHub remote cleanup approval stores approval ids and hashes only.',
      metadata: {
        integration: GITHUB_PROVIDER_NAME,
        dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
        approvalArtifactIdHash: stableHash(approvalArtifactId),
        status: input.status,
      },
    }),
  ];

  return GithubRemoteCleanupApprovalArtifactRecordSchema.parse({
    id: stableId(
      'github_remote_cleanup_approval_record',
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
    expiresAt:
      input.expiresAt ??
      baseRecord?.expiresAt ??
      (input.status === 'approved'
        ? new Date(Date.parse(now()) + 60 * 60 * 1000).toISOString()
        : undefined),
    evidenceRefs,
    auditEventIds: [foundationId('audit')],
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    rawReasonStored: false,
    rawRefStored: false,
    rawUrlStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
      approvalArtifactIdHash: stableHash(approvalArtifactId),
      status: input.status,
    },
    summary: `GitHub remote cleanup approval status is ${input.status}.`,
  });
}

export async function executeGithubRemoteCleanup(
  input: GithubRemoteCleanupExecutionInput,
): Promise<GithubRemoteCleanupRun> {
  const now = input.now ?? foundationTimestamp;
  const observedAt = now();
  const blockReasons = collectRemoteCleanupExecutionBlockReasons(input, observedAt);
  const boundaryInput = blockReasons.length === 0 ? input.runtime : undefined;
  const boundaryResult = boundaryInput
    ? await runGithubRemoteCleanupHttpBoundary({
        owner: boundaryInput.owner,
        repo: boundaryInput.repo,
        baseBranch: boundaryInput.baseBranch,
        oldBranchName: boundaryInput.oldBranchName,
        oldPrNumber: boundaryInput.oldPrNumber,
        token: boundaryInput.token ?? '',
        fetchImpl: input.fetchImpl,
      })
    : undefined;
  const finalBlockReasons = [...blockReasons, ...(boundaryResult?.blockReasons ?? [])];
  const status: GithubRemoteCleanupRun['status'] =
    blockReasons.length > 0
      ? 'blocked'
      : boundaryResult?.status === 'completed'
        ? 'completed'
        : boundaryResult?.status ?? 'failed';
  const responseBodyHashes = boundaryResult?.responseBodyHashes ?? [];
  const cleanupSummary = GithubRemoteCleanupSummarySchema.parse({
    id: stableId(
      'github_remote_cleanup_summary',
      `${input.dryRunRecord.dryRunId}:${status}:${responseBodyHashes.join(',')}`,
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: observedAt,
    targetRef: input.dryRunRecord.targetRef,
    oldPrNumberHash: boundaryResult?.oldPrNumberHash ?? input.dryRunRecord.oldPrNumberHash,
    oldBranchNameHash: boundaryResult?.oldBranchNameHash ?? input.dryRunRecord.oldBranchNameHash,
    oldPrClosed: boundaryResult?.oldPrClosed ?? false,
    oldBranchDeleted: boundaryResult?.oldBranchDeleted ?? false,
    responseBodyHashes,
    responseBodyHashCount: responseBodyHashes.length,
    closePrAllowed: true,
    deleteRefAllowed: true,
    deleteNonCodexhubBranchAllowed: false,
    updateRefAllowed: false,
    forceAllowed: false,
    mergeAllowed: false,
    commentAllowed: false,
    labelAllowed: false,
    reviewerAllowed: false,
    releaseAllowed: false,
    deploymentAllowed: false,
    pushAllowed: false,
    rawRefStored: false,
    rawUrlStored: false,
    rawResponseBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
      status,
      responseBodyHashCount: responseBodyHashes.length,
      oldPrClosed: boundaryResult?.oldPrClosed ?? false,
      oldBranchDeleted: boundaryResult?.oldBranchDeleted ?? false,
    },
    summary:
      status === 'completed'
        ? 'GitHub remote cleanup completed with hash-only close/delete response summaries.'
        : `GitHub remote cleanup ${status}: ${finalBlockReasons.join(', ')}.`,
  });
  const evidenceRefs = [
    createGithubEvidenceRef({
      kind: 'github.remote_cleanup_run',
      label: 'github-remote-cleanup-run',
      summary: 'GitHub remote cleanup run stores response hashes and cleanup booleans only.',
      metadata: {
        integration: GITHUB_PROVIDER_NAME,
        dryRunIdHash: stableHash(input.dryRunRecord.dryRunId),
        status,
        networkBoundaryInvoked: boundaryResult?.networkBoundaryInvoked ?? false,
        responseBodyHashCount: responseBodyHashes.length,
      },
    }),
  ];

  return GithubRemoteCleanupRunSchema.parse({
    id: stableId(
      'github_remote_cleanup_run',
      `${input.dryRunRecord.dryRunId}:${status}:${observedAt}:${responseBodyHashes.join(',')}`,
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: observedAt,
    dryRunId: input.dryRunRecord.dryRunId,
    dryRunRecordId: input.dryRunRecord.id,
    approvalArtifactId: input.approvalRecord?.approvalArtifactId,
    status,
    plan: input.dryRunRecord,
    cleanupSummary,
    responseBodyHashes,
    blockReasons: finalBlockReasons,
    evidenceRefs,
    auditEventIds: [foundationId('audit')],
    networkBoundaryInvoked: boundaryResult?.networkBoundaryInvoked ?? false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: !(boundaryResult?.networkBoundaryInvoked ?? false),
    closePrAllowed: true,
    deleteRefAllowed: true,
    deleteNonCodexhubBranchAllowed: false,
    updateRefAllowed: false,
    forceAllowed: false,
    mergeAllowed: false,
    commentAllowed: false,
    labelAllowed: false,
    reviewerAllowed: false,
    releaseAllowed: false,
    deploymentAllowed: false,
    pushAllowed: false,
    rawRefStored: false,
    rawUrlStored: false,
    rawResponseBodyStored: false,
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
        ? 'GitHub remote cleanup completed using the fixed close PR and delete codexhub ref sequence.'
        : `GitHub remote cleanup ${status}: ${finalBlockReasons.join(', ')}.`,
  });
}

export function runRemoteSupersedeAcceptanceRehearsal(
  input: RemoteSupersedeAcceptanceRehearsalInput = {},
): RemoteSupersedeAcceptanceRehearsalRun {
  const now = input.now ?? foundationTimestamp;
  const scenario = input.scenario ?? 'all-pass';
  const state = getRemoteSupersedeAcceptanceScenarioState(scenario);

  return RemoteSupersedeAcceptanceRehearsalRunSchema.parse({
    id: stableId('remote_supersede_rehearsal', scenario),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    scenario,
    status: state.status,
    cleanupReadinessStatus: state.cleanupReadinessStatus,
    targetKind: state.targetKind,
    stepCount: 4,
    evidenceRefCount: state.evidenceRefCount,
    auditEventCount: state.auditEventCount,
    blockerCount: state.blockerCount,
    cleanupRecommended: state.cleanupRecommended,
    remoteWriteInvoked: false,
    rawRefStored: false,
    rawUrlStored: false,
    rawReasonStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      scenarioHash: stableHash(scenario),
      fixtureOnly: true,
      cleanupReadinessStatus: state.cleanupReadinessStatus,
      blockerCount: state.blockerCount,
    },
    summary: `Remote supersede acceptance rehearsal ${state.status}; fixture metadata only.`,
  });
}

export function runGithubRemoteCleanupAcceptanceRehearsal(
  input: GithubRemoteCleanupAcceptanceRehearsalInput = {},
): GithubRemoteCleanupAcceptanceRehearsalRun {
  const now = input.now ?? foundationTimestamp;
  const scenario = input.scenario ?? 'all-pass';
  const state = getGithubRemoteCleanupAcceptanceScenarioState(scenario);

  return GithubRemoteCleanupAcceptanceRehearsalRunSchema.parse({
    id: stableId('github_remote_cleanup_rehearsal', scenario),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    scenario,
    status: state.status,
    cleanupReadinessStatus: state.cleanupReadinessStatus,
    closePrStatus: state.closePrStatus,
    deleteRefStatus: state.deleteRefStatus,
    stepCount: 6,
    evidenceRefCount: state.evidenceRefCount,
    auditEventCount: state.auditEventCount,
    blockerCount: state.blockerCount,
    closePrAllowed: true,
    deleteRefAllowed: true,
    deleteNonCodexhubBranchAllowed: false,
    updateRefAllowed: false,
    forceAllowed: false,
    mergeAllowed: false,
    commentAllowed: false,
    labelAllowed: false,
    reviewerAllowed: false,
    releaseAllowed: false,
    deploymentAllowed: false,
    pushAllowed: false,
    rawRefStored: false,
    rawUrlStored: false,
    rawResponseBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      scenarioHash: stableHash(scenario),
      fixtureOnly: true,
      cleanupReadinessStatus: state.cleanupReadinessStatus,
      blockerCount: state.blockerCount,
    },
    summary: `GitHub remote cleanup acceptance rehearsal ${state.status}; fixture metadata only.`,
  });
}

export function runGithubPublishDraftPrAcceptanceRehearsal(
  input: GithubPublishDraftPrAcceptanceRehearsalInput = {},
): GithubPublishDraftPrAcceptanceRehearsalRun {
  const now = input.now ?? foundationTimestamp;
  const scenario = input.scenario ?? 'all-pass';
  const state = getGithubPublishDraftPrAcceptanceScenarioState(scenario);

  return GithubPublishDraftPrAcceptanceRehearsalRunSchema.parse({
    id: stableId('github_publish_draft_pr_rehearsal', scenario),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    scenario,
    status: state.status,
    branchPublishStatus: state.branchPublishStatus,
    draftPrStatus: state.draftPrStatus,
    lifecycleStatus: state.lifecycleStatus,
    stepCount: 3,
    evidenceRefCount: state.evidenceRefCount,
    auditEventCount: state.auditEventCount,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    updateRefAllowed: false,
    forceAllowed: false,
    pushAllowed: false,
    mergeAllowed: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      scenarioHash: stableHash(scenario),
      blockerCount: state.blockerCount,
      fixtureOnly: true,
      rawPathStored: false,
      bodyStored: false,
    },
    summary: `GitHub publish to draft PR acceptance rehearsal ${state.status}; fixture metadata only.`,
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

function createGithubCommitContentManifest(input: {
  input: GithubBranchPublishPlanInput;
  blockReasons: string[];
  now: () => string;
}): GithubCommitContentManifest {
  const filePathHashes = input.input.files.map((file) => stableHash(file.relativePath));
  const fileContentHashes = input.input.files.map((file) => file.contentHash);
  const totalByteCount = input.input.files.reduce((total, file) => total + file.byteCount, 0);
  const maxFileByteCount = input.input.files.reduce(
    (max, file) => Math.max(max, file.byteCount),
    0,
  );

  return GithubCommitContentManifestSchema.parse({
    id: stableId(
      'github_commit_content_manifest',
      JSON.stringify({
        sourceKind: input.input.sourceKind,
        sourceIdHash: stableHash(input.input.sourceId),
        worktreePathHash: input.input.worktreePathHash,
        filePathHashes,
        fileContentHashes,
      }),
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    sourceKind: input.input.sourceKind,
    sourceIdHash: stableHash(input.input.sourceId),
    worktreePathHash: input.input.worktreePathHash,
    fileCount: input.input.files.length,
    totalByteCount,
    filePathHashes,
    fileContentHashes,
    maxFileByteCount,
    textOnly: true,
    deletionsAllowed: false,
    renamesAllowed: false,
    binaryAllowed: false,
    symlinkAllowed: false,
    rawFileContentStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      sourceKind: input.input.sourceKind,
      sourceIdHash: stableHash(input.input.sourceId),
      fileCount: input.input.files.length,
      totalByteCount,
      blockerCount: input.blockReasons.length,
    },
    summary: 'GitHub commit content manifest stores file path and content hashes only.',
  });
}

function createGithubBranchPublishReadiness(input: {
  input: GithubBranchPublishPlanInput;
  targetRef: GithubRemoteRefSummary;
  contentManifest: GithubCommitContentManifest;
  blockReasons: string[];
  now: () => string;
}): GithubBranchPublishReadiness {
  const status = resolveBranchPublishReadinessStatus(input.blockReasons);

  return GithubBranchPublishReadinessSchema.parse({
    id: stableId(
      'github_branch_publish_readiness',
      JSON.stringify({
        sourceKind: input.input.sourceKind,
        sourceIdHash: stableHash(input.input.sourceId),
        sourceSummaryHash: stableHash(input.input.sourceSummary),
        targetRefId: input.targetRef.id,
        contentManifestId: input.contentManifest.id,
        status,
      }),
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    sourceKind: input.input.sourceKind,
    sourceIdHash: stableHash(input.input.sourceId),
    sourceSummaryHash: stableHash(input.input.sourceSummary),
    targetRef: input.targetRef,
    contentManifest: input.contentManifest,
    status,
    blockerCount: input.blockReasons.length,
    newBranchRequired: true,
    branchPrefix: 'codexhub/',
    existingBranchUpdateAllowed: false,
    forceAllowed: false,
    pushAllowed: false,
    mergeAllowed: false,
    labelsAllowed: false,
    reviewersAllowed: false,
    commentsAllowed: false,
    rawFileContentStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      sourceKind: input.input.sourceKind,
      sourceIdHash: stableHash(input.input.sourceId),
      targetRefIdHash: stableHash(input.targetRef.id),
      contentManifestIdHash: stableHash(input.contentManifest.id),
      blockerCount: input.blockReasons.length,
      branchExists: input.input.branchExists ?? false,
    },
    summary:
      status === 'ready_for_branch_publish'
        ? 'New codexhub branch and content manifest are ready for publish approval.'
        : `Branch publish readiness is blocked: ${input.blockReasons.join(', ')}.`,
  });
}

function createGithubRemoteCommitSummary(input: {
  targetRef: GithubRemoteRefSummary;
  commitShaHash?: string;
  treeShaHash?: string;
  branchNameHash: string;
  contentManifestHash: string;
  fileCount: number;
  created: boolean;
  now: () => string;
}): GithubRemoteCommitSummary {
  return GithubRemoteCommitSummarySchema.parse({
    id: stableId(
      'github_remote_commit_summary',
      `${input.targetRef.id}:${input.commitShaHash ?? 'none'}:${input.treeShaHash ?? 'none'}`,
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    targetRef: input.targetRef,
    commitShaHash: input.commitShaHash,
    treeShaHash: input.treeShaHash,
    branchNameHash: input.branchNameHash,
    contentManifestHash: input.contentManifestHash,
    fileCount: input.fileCount,
    created: input.created,
    createRefAllowed: true,
    updateRefAllowed: false,
    forceAllowed: false,
    pushAllowed: false,
    mergeAllowed: false,
    rawFileContentStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      targetRefIdHash: stableHash(input.targetRef.id),
      commitShaHash: input.commitShaHash,
      treeShaHash: input.treeShaHash,
      fileCount: input.fileCount,
      created: input.created,
    },
    summary: input.created
      ? 'GitHub remote commit summary stores commit and tree identifiers as hashes only.'
      : 'GitHub remote commit was not created.',
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

function collectPrLifecycleExecutionBlockReasons(
  input: GithubPrLifecycleExecutionInput,
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
  const prNumberMatches =
    !input.dryRunRecord.prNumberHash ||
    (input.runtime.prNumber && stableHash(input.runtime.prNumber) === input.dryRunRecord.prNumberHash);
  const commitShaMatches =
    !input.dryRunRecord.commitShaHash ||
    (input.runtime.commitSha && stableHash(input.runtime.commitSha) === input.dryRunRecord.commitShaHash);
  const reasons = [
    input.enabled ? undefined : 'github_pr_lifecycle_disabled',
    input.dryRunRecord.status === 'planned' ? undefined : 'dry_run_not_planned',
    input.dryRunRecord.runnerMode === 'controlled-github-pr-lifecycle'
      ? undefined
      : 'pr_lifecycle_runner_mode_not_controlled',
    input.approvalRecord?.status === 'approved' && input.approvalRecord.approved
      ? undefined
      : 'missing_persisted_approval',
    approvalExpired ? 'approval_artifact_expired' : undefined,
    authority?.success && authority.data.allowed ? undefined : 'execution_authority_denied',
    authorityExpired ? 'execution_authority_expired' : undefined,
    input.runtime.token ? undefined : 'github_token_missing',
    runtimeValidation,
    matchesRemoteRefSummary(input.dryRunRecord.targetRef, input.runtime)
      ? undefined
      : 'github_remote_ref_hash_mismatch',
    input.runtime.prNumber || input.runtime.commitSha ? undefined : 'missing_pr_or_commit_identifier',
    prNumberMatches ? undefined : 'github_pr_number_hash_mismatch',
    commitShaMatches ? undefined : 'github_commit_sha_hash_mismatch',
  ].filter((reason): reason is string => Boolean(reason));

  return [...new Set(reasons)];
}

function collectPrManagementExecutionBlockReasons(
  input: GithubPrManagementExecutionInput,
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
  const prNumberMatches =
    !input.dryRunRecord.prNumberHash ||
    (input.runtime.prNumber && stableHash(input.runtime.prNumber) === input.dryRunRecord.prNumberHash);
  const payloadHash = stableHash(
    JSON.stringify({
      managementKind: input.runtime.managementKind,
      itemSummaries: input.runtime.itemSummaries ?? [],
      payloadSummary: input.runtime.payloadSummary ?? '',
    }),
  );
  const reasons = [
    input.enabled ? undefined : `github_pr_${input.dryRunRecord.managementKind}_disabled`,
    input.dryRunRecord.status === 'planned' ? undefined : 'dry_run_not_planned',
    input.dryRunRecord.runnerMode === 'controlled-github-pr-management'
      ? undefined
      : 'pr_management_runner_mode_not_controlled',
    input.runtime.managementKind === input.dryRunRecord.managementKind
      ? undefined
      : 'pr_management_kind_mismatch',
    input.approvalRecord?.status === 'approved' && input.approvalRecord.approved
      ? undefined
      : 'missing_persisted_approval',
    approvalExpired ? 'approval_artifact_expired' : undefined,
    authority?.success && authority.data.allowed ? undefined : 'execution_authority_denied',
    authorityExpired ? 'execution_authority_expired' : undefined,
    input.runtime.token ? undefined : 'github_token_missing',
    runtimeValidation,
    matchesRemoteRefSummary(input.dryRunRecord.targetRef, input.runtime)
      ? undefined
      : 'github_remote_ref_hash_mismatch',
    input.runtime.prNumber ? undefined : 'missing_pr_number',
    prNumberMatches ? undefined : 'github_pr_number_hash_mismatch',
    input.dryRunRecord.payloadHash === payloadHash ? undefined : 'github_pr_management_payload_hash_mismatch',
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

function collectBranchPublishExecutionBlockReasons(
  input: GithubBranchPublishExecutionInput,
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
  const branchSlug = input.runtime.branchName.replace(/^codexhub\//, '');
  const manifestMatches = matchesBranchPublishRuntimeManifest(input.dryRunRecord, input.runtime);
  const reasons = [
    input.enabled ? undefined : 'github_branch_publish_disabled',
    input.dryRunRecord.status === 'planned' ? undefined : 'dry_run_not_planned',
    input.dryRunRecord.runnerMode === 'controlled-github-branch-publish'
      ? undefined
      : 'branch_publish_runner_mode_not_controlled',
    input.dryRunRecord.readiness.status === 'ready_for_branch_publish'
      ? undefined
      : 'branch_publish_readiness_not_ready',
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
    input.runtime.branchName.startsWith('codexhub/') ? undefined : 'branch_prefix_required',
    isSafeBranchSlug(branchSlug) ? undefined : 'branch_slug_unsafe',
    stableHash(input.runtime.commitMessageSummary) === input.dryRunRecord.commitMessageHash
      ? undefined
      : 'commit_message_hash_mismatch',
    manifestMatches ? undefined : 'content_manifest_hash_mismatch',
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

function matchesBranchPublishRuntimeManifest(
  plan: GithubBranchPublishPlan,
  runtime: GithubBranchPublishExecutionInput['runtime'],
): boolean {
  const files = runtime.files.map((file) => ({
    pathHash: stableHash(file.relativePath),
    contentHash: stableHash(file.content),
    byteCount: Buffer.byteLength(file.content, 'utf8'),
  }));
  const manifest = plan.readiness.contentManifest;
  const totalByteCount = files.reduce((total, file) => total + file.byteCount, 0);
  const maxFileByteCount = files.reduce((max, file) => Math.max(max, file.byteCount), 0);

  return (
    manifest.fileCount === files.length &&
    manifest.totalByteCount === totalByteCount &&
    manifest.maxFileByteCount === maxFileByteCount &&
    manifest.filePathHashes.every((hash, index) => hash === files[index]?.pathHash) &&
    manifest.fileContentHashes.every((hash, index) => hash === files[index]?.contentHash)
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

function createGithubPublishDraftPrChainStep(input: {
  phase: GithubPublishDraftPrChainStep['phase'];
  status: GithubPublishDraftPrChainStep['status'];
  order: number;
  evidenceRefIds: string[];
  auditEventIds: string[];
  networkBoundaryInvoked: boolean;
  summary: string;
  now: () => string;
}): GithubPublishDraftPrChainStep {
  return GithubPublishDraftPrChainStepSchema.parse({
    id: stableId(
      'github_publish_draft_pr_chain_step',
      `${input.phase}:${input.order}:${input.status}:${input.summary}`,
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    phase: input.phase,
    status: input.status,
    order: input.order,
    evidenceRefIds: input.evidenceRefIds,
    auditEventIds: input.auditEventIds,
    networkBoundaryInvoked: input.networkBoundaryInvoked,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      phase: input.phase,
      order: input.order,
      status: input.status,
      evidenceRefCount: input.evidenceRefIds.length,
      auditEventCount: input.auditEventIds.length,
      networkBoundaryInvoked: input.networkBoundaryInvoked,
      rawPathStored: false,
      bodyStored: false,
    },
    summary: input.summary,
  });
}

function createRemoteSupersedeTargetSummary(
  input: RemoteSupersedeProjectionInput,
  now: () => string,
): RemoteSupersedeTargetSummary {
  const cleanupRecommended = Boolean(input.oldBranchName || input.oldPrNumber);
  const targetKind: RemoteSupersedeTargetKind =
    input.targetKind ?? (input.oldPrNumber && input.oldBranchName ? 'draft_pr_and_branch' : input.oldPrNumber ? 'draft_pr' : 'branch');

  return RemoteSupersedeTargetSummarySchema.parse({
    id: stableId(
      'remote_supersede_target',
      JSON.stringify({
        sourceRunIdHash: stableHash(input.sourceRunId),
        oldBranchNameHash: input.oldBranchName ? stableHash(input.oldBranchName) : undefined,
        oldPrNumberHash: input.oldPrNumber ? stableHash(input.oldPrNumber) : undefined,
        successorBranchPublishRunIdHash: input.successorBranchPublishRunId
          ? stableHash(input.successorBranchPublishRunId)
          : undefined,
        successorDraftPrRunIdHash: input.successorDraftPrRunId
          ? stableHash(input.successorDraftPrRunId)
          : undefined,
      }),
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    targetKind,
    sourceReworkRunIdHash: input.sourceReworkRunId
      ? stableHash(input.sourceReworkRunId)
      : undefined,
    sourceBranchPublishRunIdHash: input.sourceBranchPublishRunId
      ? stableHash(input.sourceBranchPublishRunId)
      : undefined,
    sourceDraftPrRunIdHash: input.sourceDraftPrRunId ? stableHash(input.sourceDraftPrRunId) : undefined,
    sourcePrLifecycleRunIdHash: input.sourcePrLifecycleRunId
      ? stableHash(input.sourcePrLifecycleRunId)
      : undefined,
    successorBranchPublishRunIdHash: input.successorBranchPublishRunId
      ? stableHash(input.successorBranchPublishRunId)
      : undefined,
    successorDraftPrRunIdHash: input.successorDraftPrRunId
      ? stableHash(input.successorDraftPrRunId)
      : undefined,
    oldBranchNameHash: input.oldBranchName ? stableHash(input.oldBranchName) : undefined,
    oldPrNumberHash: input.oldPrNumber ? stableHash(input.oldPrNumber) : undefined,
    oldPrUrlHash: input.oldPrUrl ? stableHash(input.oldPrUrl) : undefined,
    oldBranchPreserved: true,
    oldDraftPrClosed: false,
    successorRequired: true,
    closePrRecommended: Boolean(input.oldPrNumber),
    deleteBranchRecommended: Boolean(input.oldBranchName),
    cleanupRecommended,
    branchPrefix: 'codexhub/',
    rawRefStored: false,
    rawUrlStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      sourceRunIdHash: stableHash(input.sourceRunId),
      cleanupRecommended,
      targetKind,
    },
    summary: cleanupRecommended
      ? 'Remote supersede target points at old CodexHub remote artifacts by hash.'
      : 'Remote supersede target has no old remote artifact to clean up.',
  });
}

function createRemoteCleanupReadiness(input: {
  target: RemoteSupersedeTargetSummary;
  successorRunId?: string;
  blockReasons: string[];
  now: () => string;
}): RemoteCleanupReadiness {
  const status = resolveRemoteCleanupReadinessStatus(input.blockReasons);

  return RemoteCleanupReadinessSchema.parse({
    id: stableId(
      'remote_cleanup_readiness',
      JSON.stringify({
        targetId: input.target.id,
        successorRunIdHash: input.successorRunId ? stableHash(input.successorRunId) : undefined,
        status,
      }),
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    status,
    target: input.target,
    blockerCount: input.blockReasons.length,
    successorRunIdHash: input.successorRunId ? stableHash(input.successorRunId) : undefined,
    requiresApproval: true,
    closePrAllowed: status === 'ready_for_cleanup' && Boolean(input.target.oldPrNumberHash),
    deleteBranchAllowed: status === 'ready_for_cleanup' && Boolean(input.target.oldBranchNameHash),
    deleteNonCodexhubBranchAllowed: false,
    updateRefAllowed: false,
    forceAllowed: false,
    mergeAllowed: false,
    commentAllowed: false,
    labelAllowed: false,
    reviewerAllowed: false,
    rawRefStored: false,
    rawUrlStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    metadata: {
      integration: GITHUB_PROVIDER_NAME,
      targetIdHash: stableHash(input.target.id),
      successorRunIdHash: input.successorRunId ? stableHash(input.successorRunId) : undefined,
      blockerCount: input.blockReasons.length,
      status,
    },
    summary:
      status === 'ready_for_cleanup'
        ? 'Remote cleanup readiness is ready; execution still requires persisted approval.'
        : `Remote cleanup readiness is blocked: ${input.blockReasons.join(', ')}.`,
  });
}

function collectRemoteSupersedeBlockReasons(input: RemoteSupersedeProjectionInput): string[] {
  const hasSuccessor = Boolean(input.successorBranchPublishRunId || input.successorDraftPrRunId);
  const hasOldTarget = Boolean(input.oldBranchName || input.oldPrNumber);
  const reasons = [
    isSafeSourceSummary(input.sourceRunId) ? undefined : 'missing_source_run',
    isSafeSourceSummary(input.sourceSummary) ? undefined : 'missing_source_summary',
    input.metadataReady === false ? 'metadata_not_ready' : undefined,
    hasSuccessor && input.successorReady !== false ? undefined : 'missing_successor',
    hasOldTarget ? undefined : 'missing_old_remote_target',
    input.checksPending ? 'checks_pending' : undefined,
    input.oldBranchName && !input.oldBranchName.startsWith('codexhub/')
      ? 'branch_not_codexhub'
      : undefined,
  ].filter((reason): reason is string => Boolean(reason));

  return [...new Set(reasons)];
}

function collectRemoteCleanupPlanBlockReasons(input: GithubRemoteCleanupPlanInput): string[] {
  const reasons = [
    validateRemoteRefInput({ ...input, headBranch: input.oldBranchName }),
    input.baseBranch ? undefined : 'missing_base_branch',
    input.oldBranchName ? undefined : 'missing_old_branch',
    input.oldBranchName.startsWith('codexhub/') ? undefined : 'branch_not_codexhub',
    isSafeSourceSummary(input.sourceBranchPublishRunId)
      ? undefined
      : 'missing_source_branch_publish_run',
    isSafeSourceSummary(input.successorRunId) ? undefined : 'missing_successor_run',
    input.successorReady === false ? 'successor_missing' : undefined,
    input.oldPrNumber || input.oldBranchName ? undefined : 'missing_cleanup_target',
    input.oldPrNumber && !(input.oldPrDraft || input.supersededByNewerDraftPr)
      ? 'old_pr_not_eligible'
      : undefined,
  ].filter((reason): reason is string => Boolean(reason));

  return [...new Set(reasons)];
}

function collectRemoteCleanupExecutionBlockReasons(
  input: GithubRemoteCleanupExecutionInput,
  nowIso: string,
): string[] {
  const authority = input.authority ? ExecutionAuthoritySchema.safeParse(input.authority) : undefined;
  const approvalExpired =
    input.approvalRecord?.expiresAt !== undefined &&
    Date.parse(input.approvalRecord.expiresAt) <= Date.parse(nowIso);
  const authorityExpired =
    authority?.success &&
    authority.data.expiresAt !== undefined &&
    Date.parse(authority.data.expiresAt) <= Date.parse(nowIso);
  const oldPrNumberMatches =
    !input.dryRunRecord.oldPrNumberHash ||
    (input.runtime.oldPrNumber &&
      stableHash(input.runtime.oldPrNumber) === input.dryRunRecord.oldPrNumberHash);
  const reasons = [
    input.enabled ? undefined : 'github_remote_cleanup_disabled',
    input.dryRunRecord.status === 'planned' ? undefined : 'dry_run_not_planned',
    input.dryRunRecord.runnerMode === 'controlled-github-remote-cleanup'
      ? undefined
      : 'remote_cleanup_runner_mode_not_controlled',
    input.dryRunRecord.cleanupReadiness.status === 'ready_for_cleanup'
      ? undefined
      : 'remote_cleanup_readiness_not_ready',
    input.approvalRecord?.status === 'approved' && input.approvalRecord.approved
      ? undefined
      : 'missing_persisted_approval',
    approvalExpired ? 'approval_artifact_expired' : undefined,
    authority?.success && authority.data.allowed ? undefined : 'execution_authority_denied',
    authorityExpired ? 'execution_authority_expired' : undefined,
    input.runtime.token ? undefined : 'github_token_missing',
    validateRemoteRefInput({
      owner: input.runtime.owner,
      repo: input.runtime.repo,
      baseBranch: input.runtime.baseBranch,
      headBranch: input.runtime.oldBranchName,
    }),
    matchesRemoteCleanupRuntime(input.dryRunRecord, input.runtime)
      ? undefined
      : 'github_remote_cleanup_hash_mismatch',
    input.runtime.oldBranchName.startsWith('codexhub/') ? undefined : 'branch_not_codexhub',
    oldPrNumberMatches ? undefined : 'github_old_pr_number_hash_mismatch',
  ].filter((reason): reason is string => Boolean(reason));

  return [...new Set(reasons)];
}

function matchesRemoteCleanupRuntime(
  plan: GithubRemoteCleanupPlan,
  runtime: GithubRemoteCleanupExecutionInput['runtime'],
): boolean {
  const ownerRepoBaseMatch = matchesRemoteRefSummary(plan.targetRef, {
    owner: runtime.owner,
    repo: runtime.repo,
    baseBranch: runtime.baseBranch,
    headBranch: runtime.oldBranchName,
  });

  return ownerRepoBaseMatch && plan.oldBranchNameHash === stableHash(runtime.oldBranchName);
}

function resolveRemoteCleanupReadinessStatus(
  blockReasons: readonly string[],
): RemoteCleanupReadinessStatus {
  if (blockReasons.length === 0) {
    return 'ready_for_cleanup';
  }

  if (blockReasons.includes('missing_successor') || blockReasons.includes('successor_missing')) {
    return 'blocked_no_successor';
  }

  if (blockReasons.includes('checks_pending')) {
    return 'blocked_checks_pending';
  }

  if (blockReasons.includes('branch_not_codexhub')) {
    return 'blocked_non_codexhub_branch';
  }

  if (
    blockReasons.includes('missing_old_remote_target') ||
    blockReasons.includes('missing_cleanup_target') ||
    blockReasons.includes('missing_old_branch')
  ) {
    return 'blocked_missing_target';
  }

  return 'blocked_policy';
}

function createGithubEvidenceRef(input: {
  kind:
    | 'github.provider_plan'
    | 'github.metadata_summary'
    | 'github.token_readiness'
    | 'github.draft_pr_plan'
    | 'github.draft_pr_summary'
    | 'github.branch_publish_plan'
    | 'github.branch_publish_content_manifest'
    | 'github.branch_publish_summary'
    | 'github.branch_publish_rehearsal'
    | 'github.publish_draft_pr_chain_plan'
    | 'github.publish_draft_pr_chain_summary'
    | 'github.pr_lifecycle_plan'
    | 'github.pr_lifecycle_summary'
    | 'github.pr_lifecycle_run'
    | 'github.pr_labels_plan'
    | 'github.pr_labels_run_summary'
    | 'github.pr_assignees_plan'
    | 'github.pr_assignees_run_summary'
    | 'github.pr_reviewers_plan'
    | 'github.pr_reviewers_run_summary'
    | 'github.pr_milestones_plan'
    | 'github.pr_milestones_run_summary'
    | 'github.pr_comments_plan'
    | 'github.pr_comments_run_summary'
    | 'github.publish_draft_pr_rehearsal'
    | 'github.remote_supersede_plan'
    | 'github.remote_supersede_summary'
    | 'github.remote_supersede_rehearsal'
    | 'github.remote_cleanup_plan'
    | 'github.remote_cleanup_summary'
    | 'github.remote_cleanup_run'
    | 'github.remote_cleanup_rehearsal';
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

function getGithubPrManagementEvidenceKind(
  managementKind: GithubPrManagementKind,
  phase: 'plan' | 'run',
):
  | 'github.pr_labels_plan'
  | 'github.pr_labels_run_summary'
  | 'github.pr_assignees_plan'
  | 'github.pr_assignees_run_summary'
  | 'github.pr_reviewers_plan'
  | 'github.pr_reviewers_run_summary'
  | 'github.pr_milestones_plan'
  | 'github.pr_milestones_run_summary'
  | 'github.pr_comments_plan'
  | 'github.pr_comments_run_summary' {
  const suffix = phase === 'plan' ? 'plan' : 'run_summary';

  switch (managementKind) {
    case 'labels':
      return `github.pr_labels_${suffix}` as const;
    case 'assignees':
      return `github.pr_assignees_${suffix}` as const;
    case 'reviewers':
      return `github.pr_reviewers_${suffix}` as const;
    case 'milestones':
      return `github.pr_milestones_${suffix}` as const;
    case 'comments':
      return `github.pr_comments_${suffix}` as const;
  }
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

function collectPrLifecyclePlanBlockReasons(input: GithubPrLifecyclePlanInput): string[] {
  return [
    validateRemoteRefInput(input),
    validatePrLifecycleRequestedMetadata(input.requestedMetadata ?? []),
    input.baseBranch ? undefined : 'missing_base_branch',
    input.headBranch ? undefined : 'missing_head_branch',
    input.prNumber || input.prNumberHash || input.commitSha || input.commitShaHash
      ? undefined
      : 'missing_pr_or_commit_identifier',
  ].filter((reason): reason is string => Boolean(reason));
}

function collectPrManagementPlanBlockReasons(input: GithubPrManagementPlanInput): string[] {
  const itemCount = input.itemSummaries?.length ?? 0;
  const reasons = [
    validateRemoteRefInput(input),
    input.baseBranch ? undefined : 'missing_base_branch',
    input.headBranch ? undefined : 'missing_head_branch',
    input.prNumber || input.prNumberHash ? undefined : 'missing_pr_number',
    itemCount > 0 ? undefined : 'missing_pr_management_items',
    input.managementKind === 'comments' && !input.payloadSummary
      ? 'missing_comment_template_summary'
      : undefined,
  ].filter((reason): reason is string => Boolean(reason));

  return [...new Set(reasons)];
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

function collectBranchPublishPlanBlockReasons(input: GithubBranchPublishPlanInput): string[] {
  const branchName = `codexhub/${input.branchSlug}`;
  const fileCount = input.files.length;
  const totalByteCount = input.files.reduce((total, file) => total + file.byteCount, 0);
  const maxFileByteCount = input.files.reduce((max, file) => Math.max(max, file.byteCount), 0);
  const reasons = [
    validateRemoteRefInput({ ...input, headBranch: branchName }),
    input.baseBranch ? undefined : 'missing_base_branch',
    isSafeSourceSummary(input.sourceId) ? undefined : 'missing_source_id',
    isSafeSourceSummary(input.sourceSummary) ? undefined : 'missing_source_summary',
    isSafeSourceSummary(input.worktreePathHash) ? undefined : 'missing_worktree_path_hash',
    isSafeSourceSummary(input.commitMessageSummary) ? undefined : 'missing_commit_message_summary',
    isSafeBranchSlug(input.branchSlug) ? undefined : 'invalid_branch_slug',
    branchName.startsWith('codexhub/') ? undefined : 'branch_prefix_required',
    input.branchExists ? 'remote_branch_exists' : undefined,
    fileCount > 0 ? undefined : 'content_manifest_empty',
    fileCount <= 100 ? undefined : 'content_manifest_too_many_files',
    totalByteCount <= 5 * 1024 * 1024 ? undefined : 'content_manifest_too_large',
    maxFileByteCount <= 512 * 1024 ? undefined : 'content_manifest_file_too_large',
    input.files.every(isSafeContentManifestFile) ? undefined : 'content_manifest_unsafe',
  ].filter((reason): reason is string => Boolean(reason));

  return [...new Set(reasons)];
}

function resolveBranchPublishReadinessStatus(
  blockReasons: readonly string[],
): GithubBranchPublishReadinessStatus {
  if (blockReasons.length === 0) {
    return 'ready_for_branch_publish';
  }

  if (
    blockReasons.includes('missing_source_id') ||
    blockReasons.includes('missing_source_summary')
  ) {
    return 'blocked_source';
  }

  if (blockReasons.includes('remote_branch_exists')) {
    return 'blocked_existing_branch';
  }

  if (
    blockReasons.includes('invalid_branch_slug') ||
    blockReasons.includes('branch_prefix_required')
  ) {
    return 'blocked_branch_policy';
  }

  if (blockReasons.some((reason) => reason.startsWith('content_manifest'))) {
    return 'blocked_content_manifest';
  }

  return 'not_ready';
}

function getRemoteSupersedeAcceptanceScenarioState(
  scenario: RemoteSupersedeAcceptanceScenario,
): {
  status: RemoteSupersedeAcceptanceRehearsalRun['status'];
  cleanupReadinessStatus: RemoteCleanupReadinessStatus;
  targetKind: RemoteSupersedeTargetKind;
  cleanupRecommended: boolean;
  evidenceRefCount: number;
  auditEventCount: number;
  blockerCount: number;
} {
  switch (scenario) {
    case 'all-pass':
      return {
        status: 'passed',
        cleanupReadinessStatus: 'ready_for_cleanup',
        targetKind: 'draft_pr_and_branch',
        cleanupRecommended: true,
        evidenceRefCount: 3,
        auditEventCount: 3,
        blockerCount: 0,
      };
    case 'old-pr-open':
    case 'old-branch-live':
      return {
        status: 'passed',
        cleanupReadinessStatus: 'ready_for_cleanup',
        targetKind: scenario === 'old-pr-open' ? 'draft_pr' : 'branch',
        cleanupRecommended: true,
        evidenceRefCount: 2,
        auditEventCount: 2,
        blockerCount: 0,
      };
    case 'checks-pending':
      return {
        status: 'blocked',
        cleanupReadinessStatus: 'blocked_checks_pending',
        targetKind: 'draft_pr_and_branch',
        cleanupRecommended: true,
        evidenceRefCount: 1,
        auditEventCount: 1,
        blockerCount: 1,
      };
    case 'no-successor':
    case 'superseded-source-missing':
      return {
        status: 'blocked',
        cleanupReadinessStatus:
          scenario === 'no-successor' ? 'blocked_no_successor' : 'blocked_missing_target',
        targetKind: 'draft_pr_and_branch',
        cleanupRecommended: scenario === 'no-successor',
        evidenceRefCount: 1,
        auditEventCount: 1,
        blockerCount: 1,
      };
  }
}

function getGithubRemoteCleanupAcceptanceScenarioState(
  scenario: GithubRemoteCleanupAcceptanceScenario,
): {
  status: GithubRemoteCleanupAcceptanceRehearsalRun['status'];
  cleanupReadinessStatus: RemoteCleanupReadinessStatus;
  closePrStatus: GithubRemoteCleanupAcceptanceRehearsalRun['closePrStatus'];
  deleteRefStatus: GithubRemoteCleanupAcceptanceRehearsalRun['deleteRefStatus'];
  evidenceRefCount: number;
  auditEventCount: number;
  blockerCount: number;
} {
  switch (scenario) {
    case 'all-pass':
      return {
        status: 'passed',
        cleanupReadinessStatus: 'ready_for_cleanup',
        closePrStatus: 'fixture_completed',
        deleteRefStatus: 'fixture_completed',
        evidenceRefCount: 4,
        auditEventCount: 4,
        blockerCount: 0,
      };
    case 'close-pr-failed':
    case 'delete-ref-failed':
      return {
        status: 'failed',
        cleanupReadinessStatus: 'ready_for_cleanup',
        closePrStatus: scenario === 'close-pr-failed' ? 'failed' : 'fixture_completed',
        deleteRefStatus: scenario === 'delete-ref-failed' ? 'failed' : 'skipped',
        evidenceRefCount: 2,
        auditEventCount: 2,
        blockerCount: 1,
      };
    case 'network-timeout':
      return {
        status: 'aborted',
        cleanupReadinessStatus: 'ready_for_cleanup',
        closePrStatus: 'failed',
        deleteRefStatus: 'skipped',
        evidenceRefCount: 1,
        auditEventCount: 1,
        blockerCount: 1,
      };
    case 'branch-not-codexhub':
      return {
        status: 'blocked',
        cleanupReadinessStatus: 'blocked_non_codexhub_branch',
        closePrStatus: 'skipped',
        deleteRefStatus: 'skipped',
        evidenceRefCount: 1,
        auditEventCount: 1,
        blockerCount: 1,
      };
    case 'successor-missing':
      return {
        status: 'blocked',
        cleanupReadinessStatus: 'blocked_no_successor',
        closePrStatus: 'skipped',
        deleteRefStatus: 'skipped',
        evidenceRefCount: 1,
        auditEventCount: 1,
        blockerCount: 1,
      };
    case 'old-pr-not-found':
      return {
        status: 'blocked',
        cleanupReadinessStatus: 'blocked_missing_target',
        closePrStatus: 'blocked',
        deleteRefStatus: 'skipped',
        evidenceRefCount: 1,
        auditEventCount: 1,
        blockerCount: 1,
      };
    case 'token-missing':
    case 'approval-blocked':
      return {
        status: 'blocked',
        cleanupReadinessStatus: 'ready_for_cleanup',
        closePrStatus: 'blocked',
        deleteRefStatus: 'skipped',
        evidenceRefCount: 1,
        auditEventCount: 1,
        blockerCount: 1,
      };
  }
}

function getGithubBranchPublishAcceptanceScenarioState(
  scenario: GithubBranchPublishAcceptanceScenario,
): {
  status: GithubBranchPublishAcceptanceRehearsalRun['status'];
  readinessStatus: GithubBranchPublishReadinessStatus;
  branchPublishStatus: GithubBranchPublishAcceptanceRehearsalRun['branchPublishStatus'];
  evidenceRefCount: number;
  auditEventCount: number;
  blockerCount: number;
} {
  switch (scenario) {
    case 'all-pass':
      return {
        status: 'passed',
        readinessStatus: 'ready_for_branch_publish',
        branchPublishStatus: 'fixture_completed',
        evidenceRefCount: 4,
        auditEventCount: 4,
        blockerCount: 0,
      };
    case 'network-timeout':
      return {
        status: 'aborted',
        readinessStatus: 'ready_for_branch_publish',
        branchPublishStatus: 'failed',
        evidenceRefCount: 2,
        auditEventCount: 2,
        blockerCount: 1,
      };
    case 'blob-create-failed':
    case 'tree-create-failed':
    case 'commit-create-failed':
    case 'ref-create-failed':
      return {
        status: 'failed',
        readinessStatus: 'ready_for_branch_publish',
        branchPublishStatus: 'failed',
        evidenceRefCount: 2,
        auditEventCount: 2,
        blockerCount: 1,
      };
    case 'branch-exists':
      return {
        status: 'blocked',
        readinessStatus: 'blocked_existing_branch',
        branchPublishStatus: 'skipped',
        evidenceRefCount: 1,
        auditEventCount: 1,
        blockerCount: 1,
      };
    case 'content-manifest-blocked':
      return {
        status: 'blocked',
        readinessStatus: 'blocked_content_manifest',
        branchPublishStatus: 'skipped',
        evidenceRefCount: 1,
        auditEventCount: 1,
        blockerCount: 1,
      };
    case 'token-missing':
    case 'provider-disabled':
    case 'approval-blocked':
      return {
        status: 'blocked',
        readinessStatus: 'ready_for_branch_publish',
        branchPublishStatus: 'blocked',
        evidenceRefCount: 1,
        auditEventCount: 1,
        blockerCount: 1,
      };
  }
}

function getGithubPrLifecycleAcceptanceScenarioState(
  scenario: GithubPrLifecycleAcceptanceScenario,
): {
  status: GithubPrLifecycleAcceptanceRehearsalRun['status'];
  lifecycleStatus: GithubPrLifecycleAcceptanceRehearsalRun['lifecycleStatus'];
  evidenceRefCount: number;
  auditEventCount: number;
  blockerCount: number;
} {
  switch (scenario) {
    case 'all-pass':
    case 'checks-passed':
      return {
        status: 'passed',
        lifecycleStatus: 'checks_passed',
        evidenceRefCount: 3,
        auditEventCount: 3,
        blockerCount: 0,
      };
    case 'checks-failed':
      return {
        status: 'failed',
        lifecycleStatus: 'checks_failed',
        evidenceRefCount: 3,
        auditEventCount: 3,
        blockerCount: 1,
      };
    case 'checks-pending':
      return {
        status: 'blocked',
        lifecycleStatus: 'checks_pending',
        evidenceRefCount: 3,
        auditEventCount: 3,
        blockerCount: 1,
      };
    case 'pr-not-found':
      return {
        status: 'blocked',
        lifecycleStatus: 'not_found',
        evidenceRefCount: 1,
        auditEventCount: 1,
        blockerCount: 1,
      };
    case 'network-timeout':
      return {
        status: 'aborted',
        lifecycleStatus: 'blocked',
        evidenceRefCount: 1,
        auditEventCount: 1,
        blockerCount: 1,
      };
    case 'token-missing':
    case 'provider-disabled':
    case 'approval-blocked':
    case 'stale-branch':
      return {
        status: 'blocked',
        lifecycleStatus: 'blocked',
        evidenceRefCount: 1,
        auditEventCount: 1,
        blockerCount: 1,
      };
  }
}

function getGithubDraftPrAcceptanceScenarioState(scenario: GithubDraftPrAcceptanceScenario): {
  status: GithubDraftPrAcceptanceRehearsalRun['status'];
  readinessStatus: GithubDraftPrReadinessStatus;
  prCreationStatus: GithubDraftPrAcceptanceRehearsalRun['prCreationStatus'];
  evidenceRefCount: number;
  auditEventCount: number;
  blockerCount: number;
} {
  switch (scenario) {
    case 'all-pass':
      return {
        status: 'passed',
        readinessStatus: 'ready_for_draft_pr',
        prCreationStatus: 'fixture_completed',
        evidenceRefCount: 3,
        auditEventCount: 3,
        blockerCount: 0,
      };
    case 'github-post-failed':
      return {
        status: 'failed',
        readinessStatus: 'ready_for_draft_pr',
        prCreationStatus: 'failed',
        evidenceRefCount: 2,
        auditEventCount: 2,
        blockerCount: 1,
      };
    case 'network-timeout':
      return {
        status: 'aborted',
        readinessStatus: 'ready_for_draft_pr',
        prCreationStatus: 'failed',
        evidenceRefCount: 2,
        auditEventCount: 2,
        blockerCount: 1,
      };
    case 'head-branch-missing':
      return {
        status: 'blocked',
        readinessStatus: 'blocked_head_branch',
        prCreationStatus: 'skipped',
        evidenceRefCount: 1,
        auditEventCount: 1,
        blockerCount: 1,
      };
    case 'existing-pr-found':
      return {
        status: 'blocked',
        readinessStatus: 'blocked_existing_pr',
        prCreationStatus: 'skipped',
        evidenceRefCount: 1,
        auditEventCount: 1,
        blockerCount: 1,
      };
    case 'token-missing':
    case 'provider-disabled':
    case 'approval-blocked':
      return {
        status: 'blocked',
        readinessStatus: 'ready_for_draft_pr',
        prCreationStatus: 'blocked',
        evidenceRefCount: 1,
        auditEventCount: 1,
        blockerCount: 1,
      };
  }
}

function getGithubPublishDraftPrAcceptanceScenarioState(
  scenario: GithubPublishDraftPrAcceptanceScenario,
): {
  status: GithubPublishDraftPrAcceptanceRehearsalRun['status'];
  branchPublishStatus: GithubPublishDraftPrAcceptanceRehearsalRun['branchPublishStatus'];
  draftPrStatus: GithubPublishDraftPrAcceptanceRehearsalRun['draftPrStatus'];
  lifecycleStatus: GithubPublishDraftPrAcceptanceRehearsalRun['lifecycleStatus'];
  evidenceRefCount: number;
  auditEventCount: number;
  blockerCount: number;
} {
  switch (scenario) {
    case 'all-pass':
      return {
        status: 'passed',
        branchPublishStatus: 'fixture_completed',
        draftPrStatus: 'fixture_completed',
        lifecycleStatus: 'checks_passed',
        evidenceRefCount: 6,
        auditEventCount: 6,
        blockerCount: 0,
      };
    case 'draft-pr-created-checks-pending':
      return {
        status: 'blocked',
        branchPublishStatus: 'fixture_completed',
        draftPrStatus: 'fixture_completed',
        lifecycleStatus: 'checks_pending',
        evidenceRefCount: 6,
        auditEventCount: 6,
        blockerCount: 1,
      };
    case 'checks-passed':
      return {
        status: 'passed',
        branchPublishStatus: 'fixture_completed',
        draftPrStatus: 'fixture_completed',
        lifecycleStatus: 'checks_passed',
        evidenceRefCount: 6,
        auditEventCount: 6,
        blockerCount: 0,
      };
    case 'checks-failed':
      return {
        status: 'failed',
        branchPublishStatus: 'fixture_completed',
        draftPrStatus: 'fixture_completed',
        lifecycleStatus: 'checks_failed',
        evidenceRefCount: 6,
        auditEventCount: 6,
        blockerCount: 1,
      };
    case 'branch-published-pr-blocked':
      return {
        status: 'blocked',
        branchPublishStatus: 'fixture_completed',
        draftPrStatus: 'blocked',
        lifecycleStatus: 'blocked',
        evidenceRefCount: 4,
        auditEventCount: 4,
        blockerCount: 1,
      };
    case 'publish-blocked':
      return {
        status: 'blocked',
        branchPublishStatus: 'blocked',
        draftPrStatus: 'skipped',
        lifecycleStatus: 'blocked',
        evidenceRefCount: 2,
        auditEventCount: 2,
        blockerCount: 1,
      };
    case 'stale-branch':
    case 'network-timeout':
      return {
        status: scenario === 'network-timeout' ? 'aborted' : 'blocked',
        branchPublishStatus: scenario === 'network-timeout' ? 'failed' : 'fixture_completed',
        draftPrStatus: scenario === 'network-timeout' ? 'skipped' : 'blocked',
        lifecycleStatus: 'blocked',
        evidenceRefCount: 3,
        auditEventCount: 3,
        blockerCount: 1,
      };
  }
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

function validatePrLifecycleRequestedMetadata(
  requestedMetadata: readonly string[],
): string | undefined {
  const allowed = new Set([
    'repo',
    'pull_request',
    'branch_ref',
    'combined_status',
    'check_runs',
  ]);

  return requestedMetadata.every((item) => allowed.has(item))
    ? undefined
    : 'unsupported_pr_lifecycle_metadata_request';
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

function isSafeBranchSlug(value: string | undefined): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 120 &&
    !value.startsWith('/') &&
    !value.endsWith('/') &&
    !value.includes('..') &&
    !value.includes('codexhub/') &&
    /^[A-Za-z0-9._/-]+$/.test(value)
  );
}

function isSafeContentManifestFile(file: GithubBranchPublishContentFileInput): boolean {
  return (
    typeof file.relativePath === 'string' &&
    file.relativePath.length > 0 &&
    file.relativePath.length <= 240 &&
    !file.relativePath.startsWith('/') &&
    !file.relativePath.includes('..') &&
    /^[A-Za-z0-9._/@-]+$/.test(file.relativePath.replace(/\\/g, '/')) &&
    /^sha256:[a-fA-F0-9]{64}$/.test(file.contentHash) &&
    Number.isInteger(file.byteCount) &&
    file.byteCount >= 0 &&
    file.byteCount <= 512 * 1024 &&
    file.text === true &&
    file.symlink !== true &&
    file.deleted !== true &&
    file.renamed !== true
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
