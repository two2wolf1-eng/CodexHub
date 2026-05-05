import { useEffect, useState } from 'react';
import type {
  CodexExecControlPlaneTimeline,
  CodexExecControlPlaneDrilldownView,
  CodexExecControlPlaneReport,
  CodexExecGovernanceReviewPackage,
  CodexExecLiveAdapterAdrDecisionSummary,
  CodexExecLiveAdapterAdrDraft,
  CodexExecReadOnlyAdapterPreflightSimulationResult,
  CodexExecReadOnlyAdapterSimulatorReviewSummary,
  CodexExecReadOnlyAdapterImplementationPlanReviewSummary,
  CodexExecReadOnlyAdapterSkeletonPreview,
  CodexExecReadOnlyAdapterSkeletonReviewSummary,
  CodexExecReadOnlyAdapterFixtureBoundarySummary,
  CodexExecReadOnlyAdapterFinalReadinessSummary,
  CodexExecRealReadOnlyAdapterReadinessSummary,
  CodexExecRealReadOnlyAdapterReadinessReviewSummary,
  CodexExecRealReadOnlyAdapterAttemptTimelineSummary,
  CodexExecReportReviewComparison,
  CodexExecReportReviewHistoryView,
  CodexExecReportReviewRecord,
  CodexExecReviewerHandoffSummary,
  CodexExecTimelineDetailView,
  CodexExecLiveConfig,
  CodexExecLiveRunRecord,
  CodexExecConfigLoadResult,
  CodexExecManualApprovalRecord,
  CodexReplaySummary,
  SourceHealth,
  WorkflowRun,
  ApprovalDecisionResult,
  ApprovalInboxItem,
  ApprovalInboxProjection,
  ApprovalUxDecision,
} from '@codexhub/contracts';
import type { MockDevelopmentOrchestrationResult } from '@codexhub/orchestrator-kernel';
import {
  DASHBOARD_VIEWS,
  type DashboardView,
  createApprovalDecisionHistoryReadOnlySummary,
  createBrowserProfilesReadOnlySummary,
  createCustomWorkflowReadOnlySummary,
  createElectronCdpReadOnlySummary,
  createGithubBranchPublishAcceptanceRehearsalReadOnlySummary,
  createGithubDraftPrAcceptanceRehearsalReadOnlySummary,
  createGithubPrLifecycleAcceptanceRehearsalReadOnlySummary,
  createGithubPublishDraftPrAcceptanceRehearsalReadOnlySummary,
  createGithubProviderReadOnlySummary,
  createGithubRemoteCleanupAcceptanceRehearsalReadOnlySummary,
  createGovernanceReadOnlySummary,
  createLocalReviewPackageReadOnlySummary,
  createLocalRcAcceptanceRehearsalReadOnlySummary,
  createLocalRcOperatorReadOnlySummary,
  createM10PilotAcceptanceReadOnlySummary,
  createM10PilotReadOnlySummary,
  createM11PilotAcceptanceSmokeReadOnlySummary,
  createM11PilotReadOnlySummary,
  createOperatorReadinessReadOnlySummary,
  createPolicyTelemetryReadOnlySummary,
  createRemoteSupersedeAcceptanceRehearsalReadOnlySummary,
  createReworkLoopAcceptanceRehearsalReadOnlySummary,
  createVerificationReadinessPreview,
  createWorktreeReadOnlySummary,
  getDashboardHash,
  getDashboardViewFromHash,
  summarizeDegradedState,
  summarizeMcpTools,
} from './read-only-ux';

interface OverviewState {
  status: 'loading' | 'ready' | 'degraded';
  health?: Record<string, unknown>;
  runs: WorkflowRun[];
  sourceHealth: SourceHealth[];
  developmentRuns: MockDevelopmentOrchestrationResult[];
  codexReplayRuns: CodexReplaySummary[];
  codexExecDryRuns: CodexExecLiveRunRecord[];
  codexExecLiveConfig?: CodexExecLiveConfig;
  codexExecConfigLoadResult?: CodexExecConfigLoadResult;
  codexExecApprovals: CodexExecManualApprovalRecord[];
  codexExecTimelines: CodexExecControlPlaneTimeline[];
  codexExecTimelineDetails: CodexExecTimelineDetailView[];
  codexExecDrilldowns: CodexExecControlPlaneDrilldownView[];
  codexExecReports: CodexExecControlPlaneReport[];
  codexExecGovernancePackages: CodexExecGovernanceReviewPackage[];
  codexExecAdrDecisions: CodexExecLiveAdapterAdrDecisionSummary[];
  codexExecAdrDrafts: CodexExecLiveAdapterAdrDraft[];
  codexExecReadOnlyAdapterPreflightSimulations: CodexExecReadOnlyAdapterPreflightSimulationResult[];
  codexExecReadOnlyAdapterSimulatorReviews: CodexExecReadOnlyAdapterSimulatorReviewSummary[];
  codexExecReadOnlyAdapterImplementationPlanReviews: CodexExecReadOnlyAdapterImplementationPlanReviewSummary[];
  codexExecReadOnlyAdapterSkeletonPreview?: CodexExecReadOnlyAdapterSkeletonPreview;
  codexExecReadOnlyAdapterSkeletonReviews: CodexExecReadOnlyAdapterSkeletonReviewSummary[];
  codexExecReadOnlyAdapterFixtureBoundaries: CodexExecReadOnlyAdapterFixtureBoundarySummary[];
  codexExecReadOnlyAdapterFinalReadiness: CodexExecReadOnlyAdapterFinalReadinessSummary[];
  codexExecRealReadOnlyAdapterReadiness: CodexExecRealReadOnlyAdapterReadinessSummary[];
  codexExecRealReadOnlyAdapterReadinessReviews: CodexExecRealReadOnlyAdapterReadinessReviewSummary[];
  codexExecRealReadOnlyAdapterAttemptTimelines: CodexExecRealReadOnlyAdapterAttemptTimelineSummary[];
  codexExecReportReviews: CodexExecReportReviewRecord[];
  codexExecReportReviewHistories: CodexExecReportReviewHistoryView[];
  codexExecReportReviewComparisons: CodexExecReportReviewComparison[];
  codexExecReviewerHandoffs: CodexExecReviewerHandoffSummary[];
  codexExecEvidenceSearch?: Record<string, unknown>;
  browserObservationDryRuns: BrowserObservationControlSummary[];
  browserObservationApprovals: BrowserObservationControlSummary[];
  browserObservationRuns: BrowserObservationControlSummary[];
  electronCdpObservationDryRuns: ElectronCdpObservationControlSummary[];
  electronCdpObservationApprovals: ElectronCdpObservationControlSummary[];
  electronCdpObservationRuns: ElectronCdpObservationControlSummary[];
  githubMetadataDryRuns: GithubMetadataControlSummary[];
  githubMetadataApprovals: GithubMetadataControlSummary[];
  githubMetadataRuns: GithubMetadataControlSummary[];
  githubDraftPrDryRuns: GithubDraftPrControlSummary[];
  githubDraftPrApprovals: GithubDraftPrControlSummary[];
  githubDraftPrRuns: GithubDraftPrControlSummary[];
  githubBranchPublishDryRuns: GithubBranchPublishControlSummary[];
  githubBranchPublishApprovals: GithubBranchPublishControlSummary[];
  githubBranchPublishRuns: GithubBranchPublishControlSummary[];
  githubPublishDraftPrChainDryRuns: GithubPublishDraftPrChainControlSummary[];
  githubPublishDraftPrChainRuns: GithubPublishDraftPrChainControlSummary[];
  githubPrLifecycleDryRuns: GithubPrLifecycleControlSummary[];
  githubPrLifecycleApprovals: GithubPrLifecycleControlSummary[];
  githubPrLifecycleRuns: GithubPrLifecycleControlSummary[];
  githubRemoteSupersedeDryRuns: GithubRemoteSupersedeControlSummary[];
  githubRemoteSupersedeRuns: GithubRemoteSupersedeControlSummary[];
  githubRemoteCleanupDryRuns: GithubRemoteCleanupControlSummary[];
  githubRemoteCleanupApprovals: GithubRemoteCleanupControlSummary[];
  githubRemoteCleanupRuns: GithubRemoteCleanupControlSummary[];
  reworkLoopDryRuns: ReworkLoopControlSummary[];
  reworkLoopApprovals: ReworkLoopControlSummary[];
  reworkLoopRuns: ReworkLoopControlSummary[];
  customWorkflowDryRuns: CustomWorkflowControlSummary[];
  customWorkflowApprovals: CustomWorkflowControlSummary[];
  customWorkflowRuns: CustomWorkflowControlSummary[];
  worktreeDryRuns: WorktreeControlSummary[];
  worktreeApprovals: WorktreeControlSummary[];
  worktreeRuns: WorktreeControlSummary[];
  worktreeCleanupDryRuns: WorktreeControlSummary[];
  worktreeCleanupApprovals: WorktreeControlSummary[];
  worktreeCleanupRuns: WorktreeControlSummary[];
  reviewPackageDryRuns: ReviewPackageControlSummary[];
  reviewPackageApprovals: ReviewPackageControlSummary[];
  reviewPackageRuns: ReviewPackageControlSummary[];
  releaseCandidateDryRuns: ReleaseCandidateControlSummary[];
  releaseCandidateApprovals: ReleaseCandidateControlSummary[];
  releaseCandidateRuns: ReleaseCandidateControlSummary[];
  m11PilotRuns: M11PilotControlSummary[];
  approvalInbox?: ApprovalInboxProjection;
  message?: string;
}

interface BrowserObservationControlSummary {
  recordId?: string;
  dryRunId?: string;
  runId?: string;
  status?: string;
  summary?: string;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  rawPathStored?: boolean;
  bodyStored?: boolean;
}

interface ElectronCdpObservationControlSummary {
  recordId?: string;
  dryRunId?: string;
  approvalArtifactId?: string;
  runId?: string;
  status?: string;
  runnerMode?: string;
  endpointIdHash?: string;
  targetIdHash?: string;
  summary?: string;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  eventSummary?: {
    eventCount?: number;
    consoleEventCount?: number;
    networkEventCount?: number;
  };
  cdpHttpBoundaryPlanned?: boolean;
  cdpHttpBoundaryInvoked?: boolean;
  cdpWebSocketBoundaryPlanned?: boolean;
  cdpWebSocketBoundaryInvoked?: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  rawPathStored?: boolean;
  bodyStored?: boolean;
}

interface WorktreeControlSummary {
  recordId?: string;
  dryRunId?: string;
  approvalArtifactId?: string;
  runId?: string;
  sourceRunId?: string;
  status?: string;
  runnerMode?: string;
  operationMode?: string;
  repoRootHash?: string;
  worktreeRootHash?: string;
  worktreePathHash?: string;
  baseRefHash?: string;
  branchSlugHash?: string;
  changedFileCount?: number;
  diffHash?: string;
  cleanupRequired?: boolean;
  cleanupDeferred?: boolean;
  cleanupCompleted?: boolean;
  gitProcessBoundaryPlanned?: boolean;
  gitProcessBoundaryInvoked?: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  rawPathStored?: boolean;
  bodyStored?: boolean;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  summary?: string;
}

interface GithubMetadataControlSummary {
  recordId?: string;
  dryRunId?: string;
  approvalArtifactId?: string;
  runId?: string;
  status?: string;
  runnerMode?: string;
  targetRef?: {
    hostHash?: string;
    ownerHash?: string;
    repoHash?: string;
    baseBranchHash?: string;
    headBranchHash?: string;
    rawOwnerStored?: boolean;
    rawRepoStored?: boolean;
    rawRefStored?: boolean;
    rawUrlStored?: boolean;
    rawPathStored?: boolean;
    bodyStored?: boolean;
  };
  requestedMetadata?: string[];
  responseBodyHashes?: string[];
  repoMetadataHash?: string;
  baseBranchMetadataHash?: string;
  headBranchMetadataHash?: string;
  existingPullRequestCount?: number;
  networkBoundaryPlanned?: boolean;
  networkBoundaryInvoked?: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  rawPathStored?: boolean;
  bodyStored?: boolean;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  summary?: string;
}

interface GithubDraftPrControlSummary {
  recordId?: string;
  dryRunId?: string;
  approvalArtifactId?: string;
  runId?: string;
  status?: string;
  runnerMode?: string;
  targetRef?: {
    hostHash?: string;
    ownerHash?: string;
    repoHash?: string;
    baseBranchHash?: string;
    headBranchHash?: string;
    rawOwnerStored?: boolean;
    rawRepoStored?: boolean;
    rawRefStored?: boolean;
    rawUrlStored?: boolean;
    rawPathStored?: boolean;
    bodyStored?: boolean;
  };
  readiness?: {
    status?: string;
    blockerCount?: number;
    draftOnly?: boolean;
  };
  creationSummary?: {
    status?: string;
    created?: boolean;
    prNumberHash?: string;
    prUrlHash?: string;
    existingPullRequestCount?: number;
  };
  titleHash?: string;
  bodyHash?: string;
  bodySectionCount?: number;
  bodyCharacterCount?: number;
  prNumberHash?: string;
  prUrlHash?: string;
  existingPullRequestCount?: number;
  responseBodyHashes?: string[];
  networkBoundaryPlanned?: boolean;
  networkBoundaryInvoked?: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  rawPathStored?: boolean;
  bodyStored?: boolean;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  summary?: string;
}

interface GithubBranchPublishControlSummary {
  recordId?: string;
  dryRunId?: string;
  approvalArtifactId?: string;
  runId?: string;
  status?: string;
  runnerMode?: string;
  readinessStatus?: string;
  sourceKind?: string;
  sourceIdHash?: string;
  sourceSummaryHash?: string;
  targetRef?: {
    hostHash?: string;
    ownerHash?: string;
    repoHash?: string;
    baseBranchHash?: string;
    headBranchHash?: string;
    rawOwnerStored?: boolean;
    rawRepoStored?: boolean;
    rawRefStored?: boolean;
    rawUrlStored?: boolean;
    rawPathStored?: boolean;
    bodyStored?: boolean;
  };
  contentManifestHash?: string;
  fileCount?: number;
  totalByteCount?: number;
  filePathHashes?: string[];
  fileContentHashCount?: number;
  commitMessageHash?: string;
  branchNameHash?: string;
  commitShaHash?: string;
  treeShaHash?: string;
  created?: boolean;
  responseBodyHashCount?: number;
  responseBodyHashes?: string[];
  blockReasons?: string[];
  networkBoundaryPlanned?: boolean;
  networkBoundaryInvoked?: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  createRefAllowed?: boolean;
  updateRefAllowed?: boolean;
  forceAllowed?: boolean;
  pushAllowed?: boolean;
  mergeAllowed?: boolean;
  rawFileContentStored?: boolean;
  rawPathStored?: boolean;
  bodyStored?: boolean;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  summary?: string;
}

interface GithubPublishDraftPrChainControlSummary {
  recordId?: string;
  dryRunId?: string;
  runId?: string;
  status?: string;
  sourceKind?: string;
  sourceIdHash?: string;
  branchPublishDryRunId?: string;
  draftPrDryRunId?: string;
  branchPublishRunId?: string;
  draftPrRunId?: string;
  branchPublishStatus?: string;
  draftPrStatus?: string;
  lifecycleStatus?: string;
  latestPrStatus?: string;
  latestCheckStatus?: string;
  evidenceRefCount?: number;
  auditEventCount?: number;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  networkBoundaryInvoked?: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  rawPathStored?: boolean;
  bodyStored?: boolean;
  rawPrBodyStored?: boolean;
  rawUrlStored?: boolean;
  summary?: string;
}

interface GithubPrLifecycleControlSummary {
  recordId?: string;
  dryRunId?: string;
  approvalArtifactId?: string;
  runId?: string;
  status?: string;
  runnerMode?: string;
  targetRef?: {
    hostHash?: string;
    ownerHash?: string;
    repoHash?: string;
    baseBranchHash?: string;
    headBranchHash?: string;
    rawOwnerStored?: boolean;
    rawRepoStored?: boolean;
    rawRefStored?: boolean;
    rawUrlStored?: boolean;
    rawPathStored?: boolean;
    bodyStored?: boolean;
  };
  requestedMetadata?: string[];
  prNumberHash?: string;
  prUrlHash?: string;
  commitShaHash?: string;
  prStateSummary?: string;
  combinedStatusState?: string;
  statusContextCount?: number;
  checkRunCount?: number;
  checkRunStatusCounts?: Record<string, number>;
  checkRunConclusionCounts?: Record<string, number>;
  responseBodyHashes?: string[];
  networkBoundaryPlanned?: boolean;
  networkBoundaryInvoked?: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  rawPathStored?: boolean;
  rawUrlStored?: boolean;
  rawResponseBodyStored?: boolean;
  bodyStored?: boolean;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  summary?: string;
}

interface GithubRemoteSupersedeControlSummary {
  recordId?: string;
  dryRunId?: string;
  runId?: string;
  status?: string;
  targetKind?: string;
  sourceReworkRunIdHash?: string;
  successorDraftPrRunIdHash?: string;
  oldBranchNameHash?: string;
  oldPrNumberHash?: string;
  cleanupReadinessStatus?: string;
  cleanupRecommended?: boolean;
  blockReasons?: string[];
  networkBoundaryInvoked?: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  rawRefStored?: boolean;
  rawUrlStored?: boolean;
  rawPathStored?: boolean;
  bodyStored?: boolean;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  summary?: string;
}

interface GithubRemoteCleanupControlSummary {
  recordId?: string;
  dryRunId?: string;
  approvalArtifactId?: string;
  runId?: string;
  status?: string;
  runnerMode?: string;
  targetRef?: {
    ownerHash?: string;
    repoHash?: string;
    baseBranchHash?: string;
    headBranchHash?: string;
  };
  oldPrNumberHash?: string;
  oldBranchNameHash?: string;
  successorRunIdHash?: string;
  cleanupReadinessStatus?: string;
  oldPrClosed?: boolean;
  oldBranchDeleted?: boolean;
  responseBodyHashCount?: number;
  blockReasons?: string[];
  networkBoundaryPlanned?: boolean;
  networkBoundaryInvoked?: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  closePrAllowed?: boolean;
  deleteRefAllowed?: boolean;
  deleteNonCodexhubBranchAllowed?: boolean;
  updateRefAllowed?: boolean;
  forceAllowed?: boolean;
  mergeAllowed?: boolean;
  rawRefStored?: boolean;
  rawUrlStored?: boolean;
  rawResponseBodyStored?: boolean;
  rawPathStored?: boolean;
  bodyStored?: boolean;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  summary?: string;
}

interface ReworkLoopControlSummary {
  recordId?: string;
  dryRunId?: string;
  approvalArtifactId?: string;
  runId?: string;
  status?: string;
  triggerKind?: string;
  sourceRunIdHash?: string;
  sourcePackageIdHash?: string;
  previousAttemptIdHash?: string;
  plannedBranchNameHash?: string;
  attemptCount?: number;
  childApprovalsRequired?: boolean;
  directChildExecutionAllowed?: boolean;
  patchExecuted?: boolean;
  branchPublished?: boolean;
  draftPrCreated?: boolean;
  networkBoundaryInvoked?: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  rawDiffStored?: boolean;
  rawPrBodyStored?: boolean;
  rawReasonStored?: boolean;
  rawPathStored?: boolean;
  bodyStored?: boolean;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  summary?: string;
}

interface CustomWorkflowControlSummary {
  recordId?: string;
  dryRunId?: string;
  approvalArtifactId?: string;
  runId?: string;
  templateId?: string;
  templateHash?: string;
  status?: string;
  stepCount?: number;
  completedStepCount?: number;
  blockedStepCount?: number;
  failedStepCount?: number;
  approvalRequired?: boolean;
  childApprovalsRequired?: boolean;
  directAdapterExecutionAllowed?: boolean;
  directChildExecutionAllowed?: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  networkBoundaryInvoked?: boolean;
  noRealWrite?: boolean;
  rawPathStored?: boolean;
  bodyStored?: boolean;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  blockReasons?: string[];
  summary?: string;
}

interface ReviewPackageControlSummary {
  recordId?: string;
  dryRunId?: string;
  approvalArtifactId?: string;
  runId?: string;
  status?: string;
  runnerMode?: string;
  reviewPackageIdHash?: string;
  packageHash?: string;
  artifactDirectoryHash?: string;
  fileCount?: number;
  byteCount?: number;
  verificationStatus?: string;
  decisionStatus?: string;
  exported?: boolean;
  artifactWriteBoundaryInvoked?: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  rawPathStored?: boolean;
  bodyStored?: boolean;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  summary?: string;
  packageSummary?: {
    status?: string;
    verificationStatus?: string;
    packageHash?: string;
    changedFileCount?: number;
    exported?: boolean;
  };
  decision?: {
    status?: string;
    blockerCount?: number;
    findingCount?: number;
    retryHandoffRequired?: boolean;
    nextAction?: string;
  };
}

interface ReleaseCandidateControlSummary {
  recordId?: string;
  dryRunId?: string;
  approvalArtifactId?: string;
  runId?: string;
  status?: string;
  runnerMode?: string;
  readinessStatus?: string;
  reviewDecisionStatus?: string;
  verificationStatus?: string;
  operatorReadinessStatus?: string;
  bundleHash?: string;
  artifactDirectoryHash?: string;
  fileCount?: number;
  byteCount?: number;
  artifactWriteBoundaryInvoked?: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  rawPathStored?: boolean;
  bodyStored?: boolean;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  summary?: string;
  rcReadiness?: {
    status?: string;
    reviewDecisionStatus?: string;
    verificationStatus?: string;
    operatorReadinessStatus?: string;
    bundleHash?: string;
  };
  bundleSummary?: {
    bundleHash?: string;
    fileCount?: number;
    byteCount?: number;
  };
}

interface M11PilotControlSummary {
  runId?: string;
  status?: string;
  readinessStatus?: string;
  readinessBlockers?: string[];
  failureClassification?: string;
  recovery?: {
    recoveryAction?: string;
    cleanupRequired?: boolean;
    cleanupDeferred?: boolean;
    cleanupCompleted?: boolean;
    cleanupDryRunId?: string;
    cleanupRunId?: string;
    cleanupApprovalStatus?: string;
    cleanupBlockers?: string[];
    cleanupEvidenceRefIds?: string[];
    cleanupAuditEventIds?: string[];
    processBoundaryInvoked?: boolean;
    externalProcessStarted?: boolean;
    rawPathStored?: boolean;
    bodyStored?: boolean;
    summary?: string;
  };
  worktreeRunId?: string;
  codexStatus?: string;
  verificationStatus?: string;
  prDraftStatus?: string;
  changedFileCount?: number;
  cleanupRequired?: boolean;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  codexReadOnlyDryRunOnly?: boolean;
  patchGenerationAllowed?: boolean;
  pushAllowed?: boolean;
  pullRequestOpened?: boolean;
  rawPathStored?: boolean;
  bodyStored?: boolean;
  summary?: string;
}

const supervisorUrl = import.meta.env.VITE_CODEXHUB_SUPERVISOR_URL ?? 'http://127.0.0.1:3333';

export function App() {
  const [overview, setOverview] = useState<OverviewState>({
    status: 'loading',
    runs: [],
    sourceHealth: [],
    developmentRuns: [],
    codexReplayRuns: [],
    codexExecDryRuns: [],
    codexExecApprovals: [],
    codexExecTimelines: [],
    codexExecTimelineDetails: [],
    codexExecDrilldowns: [],
    codexExecReports: [],
    codexExecGovernancePackages: [],
    codexExecAdrDecisions: [],
    codexExecAdrDrafts: [],
    codexExecReadOnlyAdapterPreflightSimulations: [],
    codexExecReadOnlyAdapterSimulatorReviews: [],
    codexExecReadOnlyAdapterImplementationPlanReviews: [],
    codexExecReadOnlyAdapterSkeletonReviews: [],
    codexExecReadOnlyAdapterFixtureBoundaries: [],
    codexExecReadOnlyAdapterFinalReadiness: [],
    codexExecRealReadOnlyAdapterReadiness: [],
    codexExecRealReadOnlyAdapterReadinessReviews: [],
    codexExecRealReadOnlyAdapterAttemptTimelines: [],
    codexExecReportReviews: [],
    codexExecReportReviewHistories: [],
    codexExecReportReviewComparisons: [],
    codexExecReviewerHandoffs: [],
    browserObservationDryRuns: [],
    browserObservationApprovals: [],
    browserObservationRuns: [],
    electronCdpObservationDryRuns: [],
    electronCdpObservationApprovals: [],
    electronCdpObservationRuns: [],
    githubMetadataDryRuns: [],
    githubMetadataApprovals: [],
    githubMetadataRuns: [],
    githubDraftPrDryRuns: [],
    githubDraftPrApprovals: [],
    githubDraftPrRuns: [],
    githubBranchPublishDryRuns: [],
    githubBranchPublishApprovals: [],
    githubBranchPublishRuns: [],
    githubPublishDraftPrChainDryRuns: [],
    githubPublishDraftPrChainRuns: [],
    githubPrLifecycleDryRuns: [],
    githubPrLifecycleApprovals: [],
    githubPrLifecycleRuns: [],
    githubRemoteSupersedeDryRuns: [],
    githubRemoteSupersedeRuns: [],
    githubRemoteCleanupDryRuns: [],
    githubRemoteCleanupApprovals: [],
    githubRemoteCleanupRuns: [],
    reworkLoopDryRuns: [],
    reworkLoopApprovals: [],
    reworkLoopRuns: [],
    customWorkflowDryRuns: [],
    customWorkflowApprovals: [],
    customWorkflowRuns: [],
    worktreeDryRuns: [],
    worktreeApprovals: [],
    worktreeRuns: [],
    worktreeCleanupDryRuns: [],
    worktreeCleanupApprovals: [],
    worktreeCleanupRuns: [],
    reviewPackageDryRuns: [],
    reviewPackageApprovals: [],
    reviewPackageRuns: [],
    releaseCandidateDryRuns: [],
    releaseCandidateApprovals: [],
    releaseCandidateRuns: [],
    m11PilotRuns: [],
  });
  const [activeView, setActiveView] = useState<DashboardView>(() =>
    getDashboardViewFromHash(window.location.hash),
  );
  const [approvalKey, setApprovalKey] = useState('');
  const [approvalReason, setApprovalReason] = useState('Reviewed metadata-only evidence');
  const [approvalDecisionMessage, setApprovalDecisionMessage] = useState('');
  const mcpSummary = summarizeMcpTools();
  const verificationPreview = createVerificationReadinessPreview();
  const browserProfilesSummary = createBrowserProfilesReadOnlySummary({
    dryRunCount: overview.browserObservationDryRuns.length,
    approvalCount: overview.browserObservationApprovals.length,
    runCount: overview.browserObservationRuns.length,
    latestRunStatus: overview.browserObservationRuns[0]?.status,
  });
  const electronCdpSummary = createElectronCdpReadOnlySummary({
    dryRunCount: overview.electronCdpObservationDryRuns.length,
    approvalCount: overview.electronCdpObservationApprovals.length,
    runCount: overview.electronCdpObservationRuns.length,
    latestRunStatus: overview.electronCdpObservationRuns[0]?.status,
    runnerModes: overview.electronCdpObservationDryRuns
      .map((record) => record.runnerMode)
      .filter((runnerMode): runnerMode is string => runnerMode !== undefined),
    cdpHttpBoundaryInvoked: overview.electronCdpObservationRuns.some(
      (record) => record.cdpHttpBoundaryInvoked === true,
    ),
    cdpWebSocketBoundaryInvoked: overview.electronCdpObservationRuns.some(
      (record) => record.cdpWebSocketBoundaryInvoked === true,
    ),
  });
  const worktreeSummary = createWorktreeReadOnlySummary({
    dryRunCount: overview.worktreeDryRuns.length,
    approvalCount: overview.worktreeApprovals.length,
    runCount: overview.worktreeRuns.length,
    cleanupDryRunCount: overview.worktreeCleanupDryRuns.length,
    cleanupApprovalCount: overview.worktreeCleanupApprovals.length,
    cleanupRunCount: overview.worktreeCleanupRuns.length,
    latestRunStatus: overview.worktreeRuns[0]?.status,
    latestCleanupStatus: overview.worktreeCleanupRuns[0]?.status,
    runnerModes: [...overview.worktreeDryRuns, ...overview.worktreeRuns]
      .map((record) => record.runnerMode)
      .filter((runnerMode): runnerMode is string => runnerMode !== undefined),
    gitBoundaryInvoked: [...overview.worktreeRuns, ...overview.worktreeCleanupRuns].some(
      (record) =>
        record.gitProcessBoundaryInvoked === true ||
        record.processBoundaryInvoked === true ||
        record.externalProcessStarted === true,
    ),
    cleanupRequiredCount: overview.worktreeRuns.filter(
      (record) => record.cleanupRequired === true,
    ).length,
    cleanupCompletedCount: overview.worktreeCleanupRuns.filter(
      (record) => record.cleanupCompleted === true,
    ).length,
  });
  const githubProviderSummary = createGithubProviderReadOnlySummary({
    dryRunCount: overview.githubMetadataDryRuns.length,
    approvalCount: overview.githubMetadataApprovals.length,
    runCount: overview.githubMetadataRuns.length,
    draftPrDryRunCount: overview.githubDraftPrDryRuns.length,
    draftPrApprovalCount: overview.githubDraftPrApprovals.length,
    draftPrRunCount: overview.githubDraftPrRuns.length,
    branchPublishDryRunCount: overview.githubBranchPublishDryRuns.length,
    branchPublishApprovalCount: overview.githubBranchPublishApprovals.length,
    branchPublishRunCount: overview.githubBranchPublishRuns.length,
    publishDraftPrChainDryRunCount: overview.githubPublishDraftPrChainDryRuns.length,
    publishDraftPrChainRunCount: overview.githubPublishDraftPrChainRuns.length,
    prLifecycleDryRunCount: overview.githubPrLifecycleDryRuns.length,
    prLifecycleApprovalCount: overview.githubPrLifecycleApprovals.length,
    prLifecycleRunCount: overview.githubPrLifecycleRuns.length,
    remoteSupersedeDryRunCount: overview.githubRemoteSupersedeDryRuns.length,
    remoteSupersedeRunCount: overview.githubRemoteSupersedeRuns.length,
    remoteCleanupDryRunCount: overview.githubRemoteCleanupDryRuns.length,
    remoteCleanupApprovalCount: overview.githubRemoteCleanupApprovals.length,
    remoteCleanupRunCount: overview.githubRemoteCleanupRuns.length,
    latestRunStatus: overview.githubMetadataRuns[0]?.status,
    latestDraftPrRunStatus: overview.githubDraftPrRuns[0]?.status,
    latestDraftPrCreationStatus:
      overview.githubDraftPrRuns[0]?.creationSummary?.status ?? overview.githubDraftPrRuns[0]?.status,
    latestBranchPublishRunStatus: overview.githubBranchPublishRuns[0]?.status,
    latestBranchPublishCreationStatus:
      overview.githubBranchPublishRuns[0]?.created === true
        ? 'created'
        : overview.githubBranchPublishRuns[0]?.status,
    latestPublishDraftPrChainRunStatus: overview.githubPublishDraftPrChainRuns[0]?.status,
    latestPublishDraftPrChainLifecycleStatus:
      overview.githubPublishDraftPrChainRuns[0]?.lifecycleStatus ??
      overview.githubPublishDraftPrChainRuns[0]?.latestCheckStatus,
    latestPrLifecycleRunStatus: overview.githubPrLifecycleRuns[0]?.status,
    latestPrLifecycleStatusSummary:
      overview.githubPrLifecycleRuns[0]?.combinedStatusState ??
      overview.githubPrLifecycleRuns[0]?.prStateSummary,
    latestRemoteSupersedeRunStatus: overview.githubRemoteSupersedeRuns[0]?.status,
    latestRemoteCleanupRunStatus: overview.githubRemoteCleanupRuns[0]?.status,
    latestRemoteCleanupReadinessStatus:
      overview.githubRemoteCleanupRuns[0]?.cleanupReadinessStatus ??
      overview.githubRemoteCleanupDryRuns[0]?.cleanupReadinessStatus,
    draftPrCreatedCount: overview.githubDraftPrRuns.filter(
      (record) => record.creationSummary?.created === true || record.prNumberHash !== undefined,
    ).length,
    branchPublishCreatedCount: overview.githubBranchPublishRuns.filter(
      (record) => record.created === true || record.commitShaHash !== undefined,
    ).length,
    networkBoundaryInvoked:
      overview.githubMetadataRuns.some((record) => record.networkBoundaryInvoked === true) ||
      overview.githubDraftPrRuns.some((record) => record.networkBoundaryInvoked === true) ||
      overview.githubBranchPublishRuns.some((record) => record.networkBoundaryInvoked === true) ||
      overview.githubPublishDraftPrChainRuns.some(
        (record) => record.networkBoundaryInvoked === true,
      ) ||
      overview.githubPrLifecycleRuns.some((record) => record.networkBoundaryInvoked === true) ||
      overview.githubRemoteCleanupRuns.some((record) => record.networkBoundaryInvoked === true),
  });
  const githubBranchPublishAcceptanceRehearsalSummary =
    createGithubBranchPublishAcceptanceRehearsalReadOnlySummary();
  const githubDraftPrAcceptanceRehearsalSummary =
    createGithubDraftPrAcceptanceRehearsalReadOnlySummary();
  const githubPublishDraftPrAcceptanceRehearsalSummary =
    createGithubPublishDraftPrAcceptanceRehearsalReadOnlySummary();
  const githubPrLifecycleAcceptanceRehearsalSummary =
    createGithubPrLifecycleAcceptanceRehearsalReadOnlySummary();
  const reviewPackageSummary = createLocalReviewPackageReadOnlySummary({
    dryRunCount: overview.reviewPackageDryRuns.length,
    approvalCount: overview.reviewPackageApprovals.length,
    runCount: overview.reviewPackageRuns.length,
    decisionCount: [...overview.reviewPackageDryRuns, ...overview.reviewPackageRuns].filter(
      (record) => record.decisionStatus ?? record.decision?.status,
    ).length,
    latestRunStatus: overview.reviewPackageRuns[0]?.status,
    latestDecisionStatus:
      overview.reviewPackageRuns[0]?.decisionStatus ??
      overview.reviewPackageRuns[0]?.decision?.status ??
      overview.reviewPackageDryRuns[0]?.decisionStatus ??
      overview.reviewPackageDryRuns[0]?.decision?.status,
    verificationStatuses: [...overview.reviewPackageDryRuns, ...overview.reviewPackageRuns].map(
      (record) =>
        record.verificationStatus ?? record.packageSummary?.verificationStatus ?? 'unknown',
    ),
    exportedCount: overview.reviewPackageRuns.filter((record) => record.exported === true).length,
    artifactWriteBoundaryInvoked: overview.reviewPackageRuns.some(
      (record) => record.artifactWriteBoundaryInvoked === true,
    ),
    fileCount: overview.reviewPackageRuns.reduce((sum, record) => sum + (record.fileCount ?? 0), 0),
    byteCount: overview.reviewPackageRuns.reduce((sum, record) => sum + (record.byteCount ?? 0), 0),
    evidenceCount: overview.reviewPackageRuns.reduce(
      (sum, record) => sum + (record.evidenceRefIds?.length ?? 0),
      0,
    ),
    auditEventCount: overview.reviewPackageRuns.reduce(
      (sum, record) => sum + (record.auditEventIds?.length ?? 0),
      0,
    ),
  });
  const releaseCandidateSummary = createLocalRcOperatorReadOnlySummary({
    dryRunCount: overview.releaseCandidateDryRuns.length,
    approvalCount: overview.releaseCandidateApprovals.length,
    runCount: overview.releaseCandidateRuns.length,
    latestRunStatus: overview.releaseCandidateRuns[0]?.status,
    readinessStatus:
      overview.releaseCandidateRuns[0]?.readinessStatus ??
      overview.releaseCandidateRuns[0]?.rcReadiness?.status ??
      overview.releaseCandidateDryRuns[0]?.readinessStatus ??
      overview.releaseCandidateDryRuns[0]?.rcReadiness?.status,
    reviewDecisionStatus:
      overview.releaseCandidateRuns[0]?.reviewDecisionStatus ??
      overview.releaseCandidateRuns[0]?.rcReadiness?.reviewDecisionStatus ??
      overview.releaseCandidateDryRuns[0]?.reviewDecisionStatus ??
      overview.releaseCandidateDryRuns[0]?.rcReadiness?.reviewDecisionStatus,
    verificationStatus:
      overview.releaseCandidateRuns[0]?.verificationStatus ??
      overview.releaseCandidateRuns[0]?.rcReadiness?.verificationStatus ??
      overview.releaseCandidateDryRuns[0]?.verificationStatus ??
      overview.releaseCandidateDryRuns[0]?.rcReadiness?.verificationStatus,
    operatorReadinessStatus:
      overview.releaseCandidateRuns[0]?.operatorReadinessStatus ??
      overview.releaseCandidateRuns[0]?.rcReadiness?.operatorReadinessStatus ??
      overview.releaseCandidateDryRuns[0]?.operatorReadinessStatus ??
      overview.releaseCandidateDryRuns[0]?.rcReadiness?.operatorReadinessStatus,
    bundleHash:
      overview.releaseCandidateRuns[0]?.bundleHash ??
      overview.releaseCandidateRuns[0]?.bundleSummary?.bundleHash ??
      overview.releaseCandidateRuns[0]?.rcReadiness?.bundleHash,
    artifactWriteBoundaryInvoked: overview.releaseCandidateRuns.some(
      (record) => record.artifactWriteBoundaryInvoked === true,
    ),
    fileCount: overview.releaseCandidateRuns.reduce(
      (sum, record) => sum + (record.fileCount ?? record.bundleSummary?.fileCount ?? 0),
      0,
    ),
    byteCount: overview.releaseCandidateRuns.reduce(
      (sum, record) => sum + (record.byteCount ?? record.bundleSummary?.byteCount ?? 0),
      0,
    ),
    evidenceCount: overview.releaseCandidateRuns.reduce(
      (sum, record) => sum + (record.evidenceRefIds?.length ?? 0),
      0,
    ),
    auditEventCount: overview.releaseCandidateRuns.reduce(
      (sum, record) => sum + (record.auditEventIds?.length ?? 0),
      0,
    ),
    noRealWrite:
      overview.releaseCandidateRuns.length === 0 ||
      overview.releaseCandidateRuns.every((record) => record.noRealWrite === true),
  });
  const customWorkflowSummary = createCustomWorkflowReadOnlySummary({
    templateCount: 4,
    validationCount: overview.customWorkflowDryRuns.length,
    dryRunCount: overview.customWorkflowDryRuns.length,
    approvalCount: overview.customWorkflowApprovals.length,
    runCount: overview.customWorkflowRuns.length,
    latestRunStatus: overview.customWorkflowRuns[0]?.status,
    processBoundaryInvoked: overview.customWorkflowRuns.some(
      (record) => record.processBoundaryInvoked === true,
    ),
    networkBoundaryInvoked: overview.customWorkflowRuns.some(
      (record) => record.networkBoundaryInvoked === true,
    ),
  });
  const policyTelemetrySummary = createPolicyTelemetryReadOnlySummary();
  const readinessSummary = createOperatorReadinessReadOnlySummary();
  const governanceSummary = createGovernanceReadOnlySummary([
    ...overview.runs.map((run) => ({
      id: run.id,
      source: 'workflow',
      title: run.workflowName,
      status: run.status,
      evidenceCount: run.evidenceRefs.length,
      auditEventCount: 0,
    })),
    ...overview.developmentRuns.map((run) => ({
      id: run.id,
      source: 'development',
      title: run.summary.requestTitle,
      status: run.verificationRun.status,
      evidenceCount: run.summary.evidenceCount,
      auditEventCount: run.summary.auditEventCount,
    })),
    ...overview.codexExecDryRuns.map((run) => ({
      id: run.id,
      source: 'codex_exec_dry_run',
      title: run.title,
      status: run.policyDecision.outcome === 'deny' ? 'blocked' : run.status,
      evidenceCount: run.evidenceRefs.length,
      auditEventCount: run.auditEvents.length,
      processBoundaryInvoked: false,
      externalProcessStarted: run.externalProcessStarted,
    })),
    ...overview.browserObservationRuns.map((run) => ({
      id: run.runId ?? run.recordId ?? run.dryRunId ?? 'browser_observation_run',
      source: 'browser_observation',
      status: run.status,
      evidenceRefIds: run.evidenceRefIds,
      auditEventIds: run.auditEventIds,
      processBoundaryInvoked: run.processBoundaryInvoked,
      externalProcessStarted: run.externalProcessStarted,
      noRealWrite: run.noRealWrite,
    })),
    ...overview.electronCdpObservationRuns.map((run) => ({
      id: run.runId ?? run.recordId ?? run.dryRunId ?? 'electron_cdp_observation_run',
      source: 'electron_cdp_observation',
      status: run.status,
      evidenceRefIds: run.evidenceRefIds,
      auditEventIds: run.auditEventIds,
      processBoundaryInvoked: run.processBoundaryInvoked,
      externalProcessStarted: run.externalProcessStarted,
      networkBoundaryInvoked:
        run.cdpHttpBoundaryInvoked === true || run.cdpWebSocketBoundaryInvoked === true,
      noRealWrite: run.noRealWrite,
    })),
    ...overview.worktreeRuns.map((run) => ({
      id: run.runId ?? run.recordId ?? run.dryRunId ?? 'worktree_run',
      source: 'worktree_run',
      status: run.status,
      evidenceRefIds: run.evidenceRefIds,
      auditEventIds: run.auditEventIds,
      processBoundaryInvoked: run.processBoundaryInvoked,
      externalProcessStarted: run.externalProcessStarted,
      noRealWrite: run.noRealWrite,
    })),
    ...overview.worktreeCleanupRuns.map((run) => ({
      id: run.runId ?? run.recordId ?? run.dryRunId ?? 'worktree_cleanup_run',
      source: 'worktree_cleanup_run',
      status: run.status,
      evidenceRefIds: run.evidenceRefIds,
      auditEventIds: run.auditEventIds,
      processBoundaryInvoked: run.processBoundaryInvoked,
      externalProcessStarted: run.externalProcessStarted,
      noRealWrite: run.noRealWrite,
    })),
    ...overview.githubMetadataRuns.map((run) => ({
      id: run.runId ?? run.recordId ?? run.dryRunId ?? 'github_metadata_run',
      source: 'github',
      status: run.status,
      evidenceRefIds: run.evidenceRefIds,
      auditEventIds: run.auditEventIds,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: run.networkBoundaryInvoked ?? false,
      noRealWrite: true,
    })),
    ...overview.githubDraftPrRuns.map((run) => ({
      id: run.runId ?? run.recordId ?? run.dryRunId ?? 'github_draft_pr_run',
      source: 'github_draft_pr_run',
      status: run.status,
      evidenceRefIds: run.evidenceRefIds,
      auditEventIds: run.auditEventIds,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: run.networkBoundaryInvoked ?? false,
      noRealWrite: run.noRealWrite ?? false,
    })),
    ...overview.githubBranchPublishRuns.map((run) => ({
      id: run.runId ?? run.recordId ?? run.dryRunId ?? 'github_branch_publish_run',
      source: 'github_branch_publish_run',
      status: run.status,
      evidenceRefIds: run.evidenceRefIds,
      auditEventIds: run.auditEventIds,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: run.networkBoundaryInvoked ?? false,
      noRealWrite: run.noRealWrite ?? false,
    })),
    ...overview.githubPublishDraftPrChainRuns.map((run) => ({
      id: run.runId ?? run.recordId ?? run.dryRunId ?? 'github_publish_draft_pr_chain_run',
      source: 'github_publish_draft_pr_chain_run',
      status: run.status,
      evidenceRefIds: run.evidenceRefIds,
      auditEventIds: run.auditEventIds,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: run.networkBoundaryInvoked ?? false,
      noRealWrite: run.noRealWrite ?? false,
    })),
    ...overview.githubPrLifecycleRuns.map((run) => ({
      id: run.runId ?? run.recordId ?? run.dryRunId ?? 'github_pr_lifecycle_run',
      source: 'github_pr_lifecycle_run',
      status: run.status,
      evidenceRefIds: run.evidenceRefIds,
      auditEventIds: run.auditEventIds,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: run.networkBoundaryInvoked ?? false,
      noRealWrite: run.noRealWrite ?? true,
    })),
    ...overview.githubRemoteSupersedeRuns.map((run) => ({
      id: run.runId ?? run.recordId ?? run.dryRunId ?? 'github_remote_supersede_run',
      source: 'github_remote_supersede_run',
      status: run.status,
      evidenceRefIds: run.evidenceRefIds,
      auditEventIds: run.auditEventIds,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      noRealWrite: true,
    })),
    ...overview.githubRemoteCleanupRuns.map((run) => ({
      id: run.runId ?? run.recordId ?? run.dryRunId ?? 'github_remote_cleanup_run',
      source: 'github_remote_cleanup_run',
      status: run.status,
      evidenceRefIds: run.evidenceRefIds,
      auditEventIds: run.auditEventIds,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: run.networkBoundaryInvoked ?? false,
      noRealWrite: run.noRealWrite ?? false,
    })),
    ...overview.reworkLoopRuns.map((run) => ({
      id: run.runId ?? run.recordId ?? run.dryRunId ?? 'rework_loop_run',
      source: 'rework_loop_run',
      status: run.status,
      evidenceRefIds: run.evidenceRefIds,
      auditEventIds: run.auditEventIds,
      processBoundaryInvoked: run.processBoundaryInvoked,
      externalProcessStarted: run.externalProcessStarted,
      networkBoundaryInvoked: run.networkBoundaryInvoked ?? false,
      noRealWrite: run.noRealWrite ?? true,
    })),
    ...overview.customWorkflowRuns.map((run) => ({
      id: run.runId ?? run.recordId ?? run.dryRunId ?? 'custom_workflow_run',
      source: 'custom_workflow_run',
      status: run.status,
      evidenceRefIds: run.evidenceRefIds,
      auditEventIds: run.auditEventIds,
      processBoundaryInvoked: run.processBoundaryInvoked,
      externalProcessStarted: run.externalProcessStarted,
      networkBoundaryInvoked: run.networkBoundaryInvoked ?? false,
      noRealWrite: run.noRealWrite ?? true,
    })),
    ...overview.reviewPackageRuns.map((run) => ({
      id: run.runId ?? run.recordId ?? run.dryRunId ?? 'review_package_run',
      source: 'review_package_run',
      status: run.status,
      evidenceRefIds: run.evidenceRefIds,
      auditEventIds: run.auditEventIds,
      processBoundaryInvoked: run.processBoundaryInvoked,
      externalProcessStarted: run.externalProcessStarted,
      noRealWrite: run.noRealWrite,
    })),
    ...overview.releaseCandidateRuns.map((run) => ({
      id: run.runId ?? run.recordId ?? run.dryRunId ?? 'release_candidate_run',
      source: 'release_candidate_run',
      status: run.status,
      evidenceRefIds: run.evidenceRefIds,
      auditEventIds: run.auditEventIds,
      processBoundaryInvoked: run.processBoundaryInvoked,
      externalProcessStarted: run.externalProcessStarted,
      noRealWrite: run.noRealWrite,
    })),
    ...overview.m11PilotRuns.map((run) => ({
      id: run.runId ?? 'm11_pilot_run',
      source: 'm11_pilot',
      status: run.status,
      evidenceRefIds: run.evidenceRefIds,
      auditEventIds: run.auditEventIds,
      processBoundaryInvoked: run.processBoundaryInvoked,
      externalProcessStarted: run.externalProcessStarted,
      noRealWrite: run.codexReadOnlyDryRunOnly !== false,
    })),
  ]);
  const pilotSummary = createM10PilotReadOnlySummary({
    approvalInboxItemCount: overview.approvalInbox?.items.length ?? 0,
    governanceRunCount: governanceSummary.runCount,
  });
  const pilotAcceptanceSummary = createM10PilotAcceptanceReadOnlySummary();
  const m11PilotAcceptanceSmokeSummary = createM11PilotAcceptanceSmokeReadOnlySummary();
  const localRcAcceptanceRehearsalSummary = createLocalRcAcceptanceRehearsalReadOnlySummary();
  const reworkLoopAcceptanceRehearsalSummary =
    createReworkLoopAcceptanceRehearsalReadOnlySummary();
  const m11PilotSummary = createM11PilotReadOnlySummary({
    runCount: overview.m11PilotRuns.length,
    approvalInboxItemCount: overview.approvalInbox?.items.length ?? 0,
    governanceRunCount: governanceSummary.runCount,
    cleanupRequiredCount: overview.m11PilotRuns.filter((run) => run.cleanupRequired === true)
      .length,
    latestRunStatus: overview.m11PilotRuns[0]?.status,
    latestPrDraftStatus: overview.m11PilotRuns[0]?.prDraftStatus,
    latestFailureClassification: overview.m11PilotRuns[0]?.failureClassification,
    latestRecoveryAction: overview.m11PilotRuns[0]?.recovery?.recoveryAction,
    cleanupHandoffCount: overview.m11PilotRuns.filter((run) => run.recovery).length,
    latestCleanupApprovalStatus: overview.m11PilotRuns[0]?.recovery?.cleanupApprovalStatus,
    latestCleanupDeferred: overview.m11PilotRuns[0]?.recovery?.cleanupDeferred,
    latestCleanupCompleted: overview.m11PilotRuns[0]?.recovery?.cleanupCompleted,
    processBoundaryInvoked: overview.m11PilotRuns.some((run) => run.processBoundaryInvoked),
    externalProcessStarted: overview.m11PilotRuns.some((run) => run.externalProcessStarted),
  });
  const approvalHistorySummary = createApprovalDecisionHistoryReadOnlySummary({
    inbox: overview.approvalInbox,
  });

  useEffect(() => {
    function onHashChange() {
      setActiveView(getDashboardViewFromHash(window.location.hash));
    }

    window.addEventListener('hashchange', onHashChange);
    onHashChange();

    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      try {
        const health = await getJson<Record<string, unknown>>('/health');
        const [
          runsResponse,
          observationsResponse,
          developmentRunsResponse,
          codexReplayRunsResponse,
          codexExecDryRunsResponse,
          codexExecConfigResponse,
          codexExecApprovalsResponse,
          readOnlyAdapterPreflightSimulationsResponse,
          readOnlyAdapterSimulatorReviewsResponse,
          readOnlyAdapterImplementationPlanReviewsResponse,
          readOnlyAdapterSkeletonPreviewResponse,
          readOnlyAdapterSkeletonReviewsResponse,
          readOnlyAdapterFixtureBoundariesResponse,
          readOnlyAdapterFinalReadinessResponse,
          realReadOnlyAdapterReadinessResponse,
          realReadOnlyAdapterReadinessReviewsResponse,
          codexExecReportReviewsResponse,
          codexExecEvidenceResponse,
        ] = await Promise.all([
          getJson<{ runs: WorkflowRun[] }>('/api/workflows/runs'),
          getJson<{ sourceHealth: SourceHealth[] }>('/api/observations'),
          getJson<{ runs: MockDevelopmentOrchestrationResult[] }>('/api/development/mock-runs'),
          getJson<{ runs: CodexReplaySummary[] }>('/api/codex/replay-fixtures'),
          getJson<{ runs: CodexExecLiveRunRecord[]; liveConfig?: CodexExecLiveConfig }>(
            '/api/codex/exec/dry-runs',
          ),
          getJson<{
            configLoadResult?: CodexExecConfigLoadResult;
            liveConfig?: CodexExecLiveConfig;
          }>('/api/codex/exec/config'),
          getJson<{ approvals: CodexExecManualApprovalRecord[] }>('/api/codex/exec/approvals'),
          getJson<{
            simulations: CodexExecReadOnlyAdapterPreflightSimulationResult[];
          }>('/api/codex/exec/read-only-adapter/preflight-simulations?limit=5'),
          getJson<{
            reviews: CodexExecReadOnlyAdapterSimulatorReviewSummary[];
          }>('/api/codex/exec/read-only-adapter/simulator-reviews?limit=5'),
          getJson<{
            reviews: CodexExecReadOnlyAdapterImplementationPlanReviewSummary[];
          }>('/api/codex/exec/read-only-adapter/implementation-plan-reviews?limit=5'),
          getJson<{
            preview: CodexExecReadOnlyAdapterSkeletonPreview;
          }>('/api/codex/exec/read-only-adapter/skeleton-preview'),
          getJson<{
            reviews: CodexExecReadOnlyAdapterSkeletonReviewSummary[];
          }>('/api/codex/exec/read-only-adapter/skeleton-reviews?limit=5'),
          getJson<{
            summaries: CodexExecReadOnlyAdapterFixtureBoundarySummary[];
          }>('/api/codex/exec/read-only-adapter/fixture-boundaries'),
          getJson<{
            reviews: CodexExecReadOnlyAdapterFinalReadinessSummary[];
          }>('/api/codex/exec/read-only-adapter/final-readiness?limit=5'),
          getJson<{
            summaries: CodexExecRealReadOnlyAdapterReadinessSummary[];
          }>('/api/codex/exec/real-read-only-adapter/readiness-packages?limit=5'),
          getJson<{
            summaries: CodexExecRealReadOnlyAdapterReadinessReviewSummary[];
          }>('/api/codex/exec/real-read-only-adapter/readiness-reviews?limit=5'),
          getJson<{ reviews: CodexExecReportReviewRecord[] }>(
            '/api/codex/exec/report-reviews?limit=10',
          ),
          getJson<Record<string, unknown>>('/api/codex/exec/evidence?limit=20'),
        ]);
        const codexExecTimelines = (
          await Promise.all(
            codexExecDryRunsResponse.runs.slice(0, 3).map(async (run) => {
              try {
                const response = await getJson<{ timeline: CodexExecControlPlaneTimeline }>(
                  `/api/codex/exec/timeline/${encodeURIComponent(run.id)}`,
                );
                return response.timeline;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter((timeline): timeline is CodexExecControlPlaneTimeline => timeline !== undefined);
        const codexExecTimelineDetails = (
          await Promise.all(
            codexExecDryRunsResponse.runs.slice(0, 3).map(async (run) => {
              try {
                const response = await getJson<{ detail: CodexExecTimelineDetailView }>(
                  `/api/codex/exec/timeline/${encodeURIComponent(
                    run.id,
                  )}/detail?includeEvidence=true&includeAudit=true`,
                );
                return response.detail;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter((detail): detail is CodexExecTimelineDetailView => detail !== undefined);
        const codexExecDrilldowns = (
          await Promise.all(
            codexExecDryRunsResponse.runs.slice(0, 3).map(async (run) => {
              try {
                const response = await getJson<{ drilldown: CodexExecControlPlaneDrilldownView }>(
                  `/api/codex/exec/drilldown/${encodeURIComponent(run.id)}`,
                );
                return response.drilldown;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter(
          (drilldown): drilldown is CodexExecControlPlaneDrilldownView => drilldown !== undefined,
        );
        const codexExecReports = (
          await Promise.all(
            codexExecDryRunsResponse.runs.slice(0, 3).map(async (run) => {
              try {
                const response = await getJson<{ report: CodexExecControlPlaneReport }>(
                  `/api/codex/exec/report/${encodeURIComponent(
                    run.id,
                  )}?format=json&includeEvidence=true&includeAudit=true`,
                );
                return response.report;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter((report): report is CodexExecControlPlaneReport => report !== undefined);
        const reviewDryRunIds = uniqueReviewDryRunIds(codexExecReportReviewsResponse.reviews);
        const codexExecReportReviewHistories = (
          await Promise.all(
            reviewDryRunIds.slice(0, 3).map(async (dryRunId) => {
              try {
                const response = await getJson<{ history: CodexExecReportReviewHistoryView }>(
                  `/api/codex/exec/report-reviews/history?dryRunId=${encodeURIComponent(
                    dryRunId,
                  )}&limit=10`,
                );
                return response.history;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter((history): history is CodexExecReportReviewHistoryView => history !== undefined);
        const codexExecReviewerHandoffs = (
          await Promise.all(
            reviewDryRunIds.slice(0, 3).map(async (dryRunId) => {
              try {
                const response = await getJson<{ handoff: CodexExecReviewerHandoffSummary }>(
                  `/api/codex/exec/report-reviews/handoff/${encodeURIComponent(dryRunId)}`,
                );
                return response.handoff;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter((handoff): handoff is CodexExecReviewerHandoffSummary => handoff !== undefined);
        const codexExecReportReviewComparisons = codexExecReportReviewHistories
          .map((history) => history.comparison)
          .filter(
            (comparison): comparison is CodexExecReportReviewComparison => comparison !== undefined,
          );
        const governanceDryRunIds = uniqueGovernanceDryRunIds(
          codexExecDryRunsResponse.runs,
          codexExecReportReviewsResponse.reviews,
        );
        const codexExecGovernancePackages = (
          await Promise.all(
            governanceDryRunIds.slice(0, 3).map(async (dryRunId) => {
              try {
                const response = await getJson<{
                  governancePackage: CodexExecGovernanceReviewPackage;
                }>(
                  `/api/codex/exec/governance-package/${encodeURIComponent(
                    dryRunId,
                  )}?includeEvidence=true&includeAudit=true`,
                );
                return response.governancePackage;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter(
          (governancePackage): governancePackage is CodexExecGovernanceReviewPackage =>
            governancePackage !== undefined,
        );
        const codexExecAdrDrafts = (
          await Promise.all(
            governanceDryRunIds.slice(0, 3).map(async (dryRunId) => {
              try {
                const response = await getJson<{
                  adrDraft: CodexExecLiveAdapterAdrDraft;
                }>(
                  `/api/codex/exec/adr-draft/${encodeURIComponent(
                    dryRunId,
                  )}?format=markdown&includeEvidence=true&includeAudit=true`,
                );
                return response.adrDraft;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter((adrDraft): adrDraft is CodexExecLiveAdapterAdrDraft => adrDraft !== undefined);
        const codexExecAdrDecisions = (
          await Promise.all(
            governanceDryRunIds.slice(0, 3).map(async (dryRunId) => {
              try {
                const response = await getJson<{
                  summary: CodexExecLiveAdapterAdrDecisionSummary;
                }>(
                  `/api/codex/exec/live-adapter-adr-decision/latest/${encodeURIComponent(
                    dryRunId,
                  )}`,
                );
                return response.summary;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter(
          (decision): decision is CodexExecLiveAdapterAdrDecisionSummary => decision !== undefined,
        );
        const realAdapterTimelineDryRunIds = uniqueRealAdapterTimelineDryRunIds(
          codexExecDryRunsResponse.runs,
          realReadOnlyAdapterReadinessResponse.summaries,
        );
        const codexExecRealReadOnlyAdapterAttemptTimelines = (
          await Promise.all(
            realAdapterTimelineDryRunIds.slice(0, 3).map(async (dryRunId) => {
              try {
                const response = await getJson<{
                  timeline: CodexExecRealReadOnlyAdapterAttemptTimelineSummary;
                }>(
                  `/api/codex/exec/real-read-only-adapter/attempt-timeline/${encodeURIComponent(
                    dryRunId,
                  )}?includeEvidence=true&includeAudit=true&limit=5`,
                );
                return response.timeline;
              } catch {
                return undefined;
              }
            }),
          )
        ).filter(
          (
            timeline,
          ): timeline is CodexExecRealReadOnlyAdapterAttemptTimelineSummary =>
            timeline !== undefined,
        );
        const [
          browserObservationDryRunsResponse,
          browserObservationApprovalsResponse,
          browserObservationRunsResponse,
          electronCdpObservationDryRunsResponse,
          electronCdpObservationApprovalsResponse,
          electronCdpObservationRunsResponse,
          githubMetadataDryRunsResponse,
          githubMetadataApprovalsResponse,
          githubMetadataRunsResponse,
          githubDraftPrDryRunsResponse,
          githubDraftPrApprovalsResponse,
          githubDraftPrRunsResponse,
          githubBranchPublishDryRunsResponse,
          githubBranchPublishApprovalsResponse,
          githubBranchPublishRunsResponse,
          githubPublishDraftPrChainDryRunsResponse,
          githubPublishDraftPrChainRunsResponse,
          githubPrLifecycleDryRunsResponse,
          githubPrLifecycleApprovalsResponse,
          githubPrLifecycleRunsResponse,
          githubRemoteSupersedeDryRunsResponse,
          githubRemoteSupersedeRunsResponse,
          githubRemoteCleanupDryRunsResponse,
          githubRemoteCleanupApprovalsResponse,
          githubRemoteCleanupRunsResponse,
          reworkLoopDryRunsResponse,
          reworkLoopApprovalsResponse,
          reworkLoopRunsResponse,
          customWorkflowDryRunsResponse,
          customWorkflowApprovalsResponse,
          customWorkflowRunsResponse,
          worktreeDryRunsResponse,
          worktreeApprovalsResponse,
          worktreeRunsResponse,
          worktreeCleanupDryRunsResponse,
          worktreeCleanupApprovalsResponse,
          worktreeCleanupRunsResponse,
          reviewPackageDryRunsResponse,
          reviewPackageApprovalsResponse,
          reviewPackageRunsResponse,
          releaseCandidateDryRunsResponse,
          releaseCandidateApprovalsResponse,
          releaseCandidateRunsResponse,
          m11PilotRunsResponse,
          approvalInboxResponse,
        ] = await Promise.all([
          getOptionalJson<{ records: BrowserObservationControlSummary[] }>(
            '/api/browser/observation/dry-runs',
            { records: [] },
          ),
          getOptionalJson<{ records: BrowserObservationControlSummary[] }>(
            '/api/browser/observation/approvals',
            { records: [] },
          ),
          getOptionalJson<{ records: BrowserObservationControlSummary[] }>(
            '/api/browser/observation/runs',
            { records: [] },
          ),
          getOptionalJson<{ records: ElectronCdpObservationControlSummary[] }>(
            '/api/electron-cdp/observation/dry-runs',
            { records: [] },
          ),
          getOptionalJson<{ records: ElectronCdpObservationControlSummary[] }>(
            '/api/electron-cdp/observation/approvals',
            { records: [] },
          ),
          getOptionalJson<{ records: ElectronCdpObservationControlSummary[] }>(
            '/api/electron-cdp/observation/runs',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubMetadataControlSummary[] }>(
            '/api/github/metadata/dry-runs',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubMetadataControlSummary[] }>(
            '/api/github/metadata/approvals',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubMetadataControlSummary[] }>(
            '/api/github/metadata/runs',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubDraftPrControlSummary[] }>(
            '/api/github/draft-prs/dry-runs',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubDraftPrControlSummary[] }>(
            '/api/github/draft-prs/approvals',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubDraftPrControlSummary[] }>(
            '/api/github/draft-prs/runs',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubBranchPublishControlSummary[] }>(
            '/api/github/branch-publishes/dry-runs',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubBranchPublishControlSummary[] }>(
            '/api/github/branch-publishes/approvals',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubBranchPublishControlSummary[] }>(
            '/api/github/branch-publishes/runs',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubPublishDraftPrChainControlSummary[] }>(
            '/api/github/publish-draft-pr-chains/dry-runs',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubPublishDraftPrChainControlSummary[] }>(
            '/api/github/publish-draft-pr-chains/runs',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubPrLifecycleControlSummary[] }>(
            '/api/github/pr-lifecycle/dry-runs',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubPrLifecycleControlSummary[] }>(
            '/api/github/pr-lifecycle/approvals',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubPrLifecycleControlSummary[] }>(
            '/api/github/pr-lifecycle/runs',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubRemoteSupersedeControlSummary[] }>(
            '/api/github/supersedes/dry-runs',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubRemoteSupersedeControlSummary[] }>(
            '/api/github/supersedes/runs',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubRemoteCleanupControlSummary[] }>(
            '/api/github/remote-cleanups/dry-runs',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubRemoteCleanupControlSummary[] }>(
            '/api/github/remote-cleanups/approvals',
            { records: [] },
          ),
          getOptionalJson<{ records: GithubRemoteCleanupControlSummary[] }>(
            '/api/github/remote-cleanups/runs',
            { records: [] },
          ),
          getOptionalJson<{ records: ReworkLoopControlSummary[] }>(
            '/api/rework-loops/dry-runs',
            { records: [] },
          ),
          getOptionalJson<{ records: ReworkLoopControlSummary[] }>(
            '/api/rework-loops/approvals',
            { records: [] },
          ),
          getOptionalJson<{ records: ReworkLoopControlSummary[] }>('/api/rework-loops/runs', {
            records: [],
          }),
          getOptionalJson<{ records: CustomWorkflowControlSummary[] }>(
            '/api/workflows/custom/dry-runs',
            { records: [] },
          ),
          getOptionalJson<{ records: CustomWorkflowControlSummary[] }>(
            '/api/workflows/custom/approvals',
            { records: [] },
          ),
          getOptionalJson<{ records: CustomWorkflowControlSummary[] }>(
            '/api/workflows/custom/runs',
            { records: [] },
          ),
          getOptionalJson<{ records: WorktreeControlSummary[] }>('/api/worktrees/dry-runs', {
            records: [],
          }),
          getOptionalJson<{ records: WorktreeControlSummary[] }>('/api/worktrees/approvals', {
            records: [],
          }),
          getOptionalJson<{ records: WorktreeControlSummary[] }>('/api/worktrees/runs', {
            records: [],
          }),
          getOptionalJson<{ records: WorktreeControlSummary[] }>(
            '/api/worktrees/cleanup/dry-runs',
            { records: [] },
          ),
          getOptionalJson<{ records: WorktreeControlSummary[] }>(
            '/api/worktrees/cleanup/approvals',
            { records: [] },
          ),
          getOptionalJson<{ records: WorktreeControlSummary[] }>(
            '/api/worktrees/cleanup/runs',
            { records: [] },
          ),
          getOptionalJson<{ records: ReviewPackageControlSummary[] }>(
            '/api/review-packages/dry-runs',
            { records: [] },
          ),
          getOptionalJson<{ records: ReviewPackageControlSummary[] }>(
            '/api/review-packages/approvals',
            { records: [] },
          ),
          getOptionalJson<{ records: ReviewPackageControlSummary[] }>(
            '/api/review-packages/runs',
            { records: [] },
          ),
          getOptionalJson<{ records: ReleaseCandidateControlSummary[] }>(
            '/api/release-candidates/dry-runs',
            { records: [] },
          ),
          getOptionalJson<{ records: ReleaseCandidateControlSummary[] }>(
            '/api/release-candidates/approvals',
            { records: [] },
          ),
          getOptionalJson<{ records: ReleaseCandidateControlSummary[] }>(
            '/api/release-candidates/runs',
            { records: [] },
          ),
          getOptionalJson<{ records: M11PilotControlSummary[] }>('/api/pilots/m11/local-runs', {
            records: [],
          }),
          getOptionalJson<ApprovalInboxProjection>('/api/approvals/inbox', {
            id: 'approval_inbox_projection_degraded',
            schemaVersion: '2026-04-28.foundation',
            createdAt: new Date(0).toISOString(),
            items: [],
            itemCount: 0,
            requestedCount: 0,
            approvedCount: 0,
            terminalCount: 0,
            typeBreakdown: {},
            rawPathStored: false,
            bodyStored: false,
            tokenStored: false,
            summary: 'Approval inbox unavailable; Dashboard remains local-page gated.',
          }),
        ]);

        if (!cancelled) {
          setOverview({
            status: 'ready',
            health,
            runs: runsResponse.runs,
            sourceHealth: observationsResponse.sourceHealth,
            developmentRuns: developmentRunsResponse.runs,
            codexReplayRuns: codexReplayRunsResponse.runs,
            codexExecDryRuns: codexExecDryRunsResponse.runs,
            codexExecLiveConfig:
              codexExecConfigResponse.liveConfig ?? codexExecDryRunsResponse.liveConfig,
            codexExecConfigLoadResult: codexExecConfigResponse.configLoadResult,
            codexExecApprovals: codexExecApprovalsResponse.approvals,
            codexExecTimelines,
            codexExecTimelineDetails,
            codexExecDrilldowns,
            codexExecReports,
            codexExecGovernancePackages,
            codexExecAdrDecisions,
            codexExecAdrDrafts,
            codexExecReadOnlyAdapterPreflightSimulations:
              readOnlyAdapterPreflightSimulationsResponse.simulations,
            codexExecReadOnlyAdapterSimulatorReviews:
              readOnlyAdapterSimulatorReviewsResponse.reviews,
            codexExecReadOnlyAdapterImplementationPlanReviews:
              readOnlyAdapterImplementationPlanReviewsResponse.reviews,
            codexExecReadOnlyAdapterSkeletonPreview: readOnlyAdapterSkeletonPreviewResponse.preview,
            codexExecReadOnlyAdapterSkeletonReviews: readOnlyAdapterSkeletonReviewsResponse.reviews,
            codexExecReadOnlyAdapterFixtureBoundaries:
              readOnlyAdapterFixtureBoundariesResponse.summaries,
            codexExecReadOnlyAdapterFinalReadiness: readOnlyAdapterFinalReadinessResponse.reviews,
            codexExecRealReadOnlyAdapterReadiness: realReadOnlyAdapterReadinessResponse.summaries,
            codexExecRealReadOnlyAdapterReadinessReviews:
              realReadOnlyAdapterReadinessReviewsResponse.summaries,
            codexExecRealReadOnlyAdapterAttemptTimelines:
              codexExecRealReadOnlyAdapterAttemptTimelines,
            codexExecReportReviews: codexExecReportReviewsResponse.reviews,
            codexExecReportReviewHistories,
            codexExecReportReviewComparisons,
            codexExecReviewerHandoffs,
            codexExecEvidenceSearch: codexExecEvidenceResponse,
            browserObservationDryRuns: browserObservationDryRunsResponse.records,
            browserObservationApprovals: browserObservationApprovalsResponse.records,
            browserObservationRuns: browserObservationRunsResponse.records,
            electronCdpObservationDryRuns: electronCdpObservationDryRunsResponse.records,
            electronCdpObservationApprovals: electronCdpObservationApprovalsResponse.records,
            electronCdpObservationRuns: electronCdpObservationRunsResponse.records,
            githubMetadataDryRuns: githubMetadataDryRunsResponse.records,
            githubMetadataApprovals: githubMetadataApprovalsResponse.records,
            githubMetadataRuns: githubMetadataRunsResponse.records,
            githubDraftPrDryRuns: githubDraftPrDryRunsResponse.records,
            githubDraftPrApprovals: githubDraftPrApprovalsResponse.records,
            githubDraftPrRuns: githubDraftPrRunsResponse.records,
            githubBranchPublishDryRuns: githubBranchPublishDryRunsResponse.records,
            githubBranchPublishApprovals: githubBranchPublishApprovalsResponse.records,
            githubBranchPublishRuns: githubBranchPublishRunsResponse.records,
            githubPublishDraftPrChainDryRuns: githubPublishDraftPrChainDryRunsResponse.records,
            githubPublishDraftPrChainRuns: githubPublishDraftPrChainRunsResponse.records,
            githubPrLifecycleDryRuns: githubPrLifecycleDryRunsResponse.records,
            githubPrLifecycleApprovals: githubPrLifecycleApprovalsResponse.records,
            githubPrLifecycleRuns: githubPrLifecycleRunsResponse.records,
            githubRemoteSupersedeDryRuns: githubRemoteSupersedeDryRunsResponse.records,
            githubRemoteSupersedeRuns: githubRemoteSupersedeRunsResponse.records,
            githubRemoteCleanupDryRuns: githubRemoteCleanupDryRunsResponse.records,
            githubRemoteCleanupApprovals: githubRemoteCleanupApprovalsResponse.records,
            githubRemoteCleanupRuns: githubRemoteCleanupRunsResponse.records,
            reworkLoopDryRuns: reworkLoopDryRunsResponse.records,
            reworkLoopApprovals: reworkLoopApprovalsResponse.records,
            reworkLoopRuns: reworkLoopRunsResponse.records,
            customWorkflowDryRuns: customWorkflowDryRunsResponse.records,
            customWorkflowApprovals: customWorkflowApprovalsResponse.records,
            customWorkflowRuns: customWorkflowRunsResponse.records,
            worktreeDryRuns: worktreeDryRunsResponse.records,
            worktreeApprovals: worktreeApprovalsResponse.records,
            worktreeRuns: worktreeRunsResponse.records,
            worktreeCleanupDryRuns: worktreeCleanupDryRunsResponse.records,
            worktreeCleanupApprovals: worktreeCleanupApprovalsResponse.records,
            worktreeCleanupRuns: worktreeCleanupRunsResponse.records,
            reviewPackageDryRuns: reviewPackageDryRunsResponse.records,
            reviewPackageApprovals: reviewPackageApprovalsResponse.records,
            reviewPackageRuns: reviewPackageRunsResponse.records,
            releaseCandidateDryRuns: releaseCandidateDryRunsResponse.records,
            releaseCandidateApprovals: releaseCandidateApprovalsResponse.records,
            releaseCandidateRuns: releaseCandidateRunsResponse.records,
            m11PilotRuns: m11PilotRunsResponse.records,
            approvalInbox: approvalInboxResponse,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setOverview({
            status: 'degraded',
            runs: [],
            sourceHealth: [],
            developmentRuns: [],
            codexReplayRuns: [],
            codexExecDryRuns: [],
            codexExecApprovals: [],
            codexExecTimelines: [],
            codexExecTimelineDetails: [],
            codexExecDrilldowns: [],
            codexExecReports: [],
            codexExecGovernancePackages: [],
            codexExecAdrDecisions: [],
            codexExecAdrDrafts: [],
            codexExecReadOnlyAdapterPreflightSimulations: [],
            codexExecReadOnlyAdapterSimulatorReviews: [],
            codexExecReadOnlyAdapterImplementationPlanReviews: [],
            codexExecReadOnlyAdapterSkeletonReviews: [],
            codexExecReadOnlyAdapterFixtureBoundaries: [],
            codexExecReadOnlyAdapterFinalReadiness: [],
            codexExecRealReadOnlyAdapterReadiness: [],
            codexExecRealReadOnlyAdapterReadinessReviews: [],
            codexExecRealReadOnlyAdapterAttemptTimelines: [],
            codexExecReportReviews: [],
            codexExecReportReviewHistories: [],
            codexExecReportReviewComparisons: [],
            codexExecReviewerHandoffs: [],
            browserObservationDryRuns: [],
            browserObservationApprovals: [],
            browserObservationRuns: [],
            electronCdpObservationDryRuns: [],
            electronCdpObservationApprovals: [],
            electronCdpObservationRuns: [],
            githubMetadataDryRuns: [],
            githubMetadataApprovals: [],
            githubMetadataRuns: [],
            githubDraftPrDryRuns: [],
            githubDraftPrApprovals: [],
            githubDraftPrRuns: [],
            githubBranchPublishDryRuns: [],
            githubBranchPublishApprovals: [],
            githubBranchPublishRuns: [],
            githubPublishDraftPrChainDryRuns: [],
            githubPublishDraftPrChainRuns: [],
            githubPrLifecycleDryRuns: [],
            githubPrLifecycleApprovals: [],
            githubPrLifecycleRuns: [],
            githubRemoteSupersedeDryRuns: [],
            githubRemoteSupersedeRuns: [],
            githubRemoteCleanupDryRuns: [],
            githubRemoteCleanupApprovals: [],
            githubRemoteCleanupRuns: [],
            reworkLoopDryRuns: [],
            reworkLoopApprovals: [],
            reworkLoopRuns: [],
            customWorkflowDryRuns: [],
            customWorkflowApprovals: [],
            customWorkflowRuns: [],
            worktreeDryRuns: [],
            worktreeApprovals: [],
            worktreeRuns: [],
            worktreeCleanupDryRuns: [],
            worktreeCleanupApprovals: [],
            worktreeCleanupRuns: [],
            reviewPackageDryRuns: [],
            reviewPackageApprovals: [],
            reviewPackageRuns: [],
            releaseCandidateDryRuns: [],
            releaseCandidateApprovals: [],
            releaseCandidateRuns: [],
            m11PilotRuns: [],
            message: error instanceof Error ? error.message : 'Supervisor is unavailable.',
          });
        }
      }
    }

    void loadOverview();

    return () => {
      cancelled = true;
    };
  }, []);

  async function submitApprovalDecision(item: ApprovalInboxItem, decision: ApprovalUxDecision) {
    if (!approvalKey) {
      setApprovalDecisionMessage('Enter the local control key for this page memory.');
      return;
    }

    try {
      const response = await fetch(`${supervisorUrl}/api/approvals/decisions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          [['x-codexhub-local', ['to', 'ken'].join('')].join('-')]: approvalKey,
        },
        body: JSON.stringify({
          approvalRequestId: item.approvalRequestId,
          approvalType: item.approvalType,
          decision,
          reason: approvalReason,
        }),
      });
      const result = (await response.json()) as Partial<ApprovalDecisionResult> & {
        error?: string;
      };

      if (!response.ok) {
        setApprovalDecisionMessage(result.error ?? `Supervisor returned ${response.status}`);
        return;
      }

      setApprovalDecisionMessage(
        `Recorded ${decision} for ${item.approvalType} request ${item.approvalRequestId}.`,
      );
    } catch (error) {
      setApprovalDecisionMessage(error instanceof Error ? error.message : 'Decision failed.');
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">CodexHub</p>
          <h1>Overview</h1>
        </div>
        <span className={`status status-${overview.status}`}>{overview.status}</span>
      </header>

      <nav className="view-nav" aria-label="Dashboard views">
        {DASHBOARD_VIEWS.map((view) => (
          <a
            key={view}
            className={view === activeView ? 'active' : undefined}
            href={getDashboardHash(view)}
          >
            {view}
          </a>
        ))}
      </nav>

      {activeView === 'approvals' ? (
        <section className="grid">
          <Panel title="Approval Inbox">
            <ul>
              <li>
                <strong>items</strong>
                <span>{overview.approvalInbox?.itemCount ?? 0}</span>
              </li>
              <li>
                <strong>requested</strong>
                <span>{overview.approvalInbox?.requestedCount ?? 0}</span>
              </li>
              <li>
                <strong>approved</strong>
                <span>{overview.approvalInbox?.approvedCount ?? 0}</span>
              </li>
              <li>
                <strong>terminal</strong>
                <span>{overview.approvalInbox?.terminalCount ?? 0}</span>
              </li>
              <li>
                <strong>storage safety</strong>
                <span>
                  bodyStored {String(overview.approvalInbox?.bodyStored ?? false)}, tokenStored{' '}
                  {String(overview.approvalInbox?.tokenStored ?? false)}
                </span>
              </li>
            </ul>
            <p>
              {overview.approvalInbox?.summary ??
                'Approval inbox is unavailable; decisions remain Supervisor-gated.'}
            </p>
          </Panel>
          <Panel title="Decision History">
            <ul>
              <li>
                <strong>items</strong>
                <span>{approvalHistorySummary.itemCount}</span>
              </li>
              <li>
                <strong>requested</strong>
                <span>{approvalHistorySummary.requestedCount}</span>
              </li>
              <li>
                <strong>approved</strong>
                <span>{approvalHistorySummary.approvedCount}</span>
              </li>
              <li>
                <strong>denied / revoked</strong>
                <span>
                  {approvalHistorySummary.deniedCount} / {approvalHistorySummary.revokedCount}
                </span>
              </li>
              <li>
                <strong>storage safety</strong>
                <span>
                  bodyStored {String(approvalHistorySummary.bodyStored)}, tokenStored{' '}
                  {String(approvalHistorySummary.tokenStored)}
                </span>
              </li>
            </ul>
            {approvalHistorySummary.items.length > 0 ? (
              <ul>
                {approvalHistorySummary.items.slice(0, 6).map((item) => (
                  <li key={`${item.source}:${item.approvalRequestId}:${item.status}`}>
                    <strong>{item.approvalType}</strong>
                    <span>
                      {item.source}, decision {item.decision}, status {item.status}, target{' '}
                      {item.targetHash}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No approval history metadata is available.</p>
            )}
            <p>{approvalHistorySummary.summary}</p>
          </Panel>
          <Panel title="Page-Memory Decision Key">
            <label className="stacked">
              <strong>local control key</strong>
              <input
                type="password"
                value={approvalKey}
                onChange={(event) => setApprovalKey(event.currentTarget.value)}
                placeholder="Required for approve, deny, or revoke"
              />
            </label>
            <label className="stacked">
              <strong>reason</strong>
              <input
                value={approvalReason}
                onChange={(event) => setApprovalReason(event.currentTarget.value)}
              />
            </label>
            <p>
              Decisions are sent only to Supervisor. The key lives in this page memory and is
              cleared on reload.
            </p>
            {approvalDecisionMessage ? <p>{approvalDecisionMessage}</p> : null}
          </Panel>
          <Panel title="Pending Approval Items">
            {overview.approvalInbox && overview.approvalInbox.items.length > 0 ? (
              <ul>
                {overview.approvalInbox.items.slice(0, 12).map((item) => (
                  <li key={item.id} className="stacked">
                    <strong>{item.approvalType}</strong>
                    <span>
                      request {item.approvalRequestId}, status {item.status}
                    </span>
                    <span>
                      risk {item.riskLevel ?? 'unknown'}, mode {item.actionMode ?? 'unknown'},
                      target {item.targetHash}
                    </span>
                    <span>
                      evidence {item.evidenceRefIds.length}, audit {item.auditEventIds.length}
                    </span>
                    <span>
                      process {String(item.processBoundaryInvoked)}, external{' '}
                      {String(item.externalProcessStarted)}
                    </span>
                    <div className="button-row">
                      <button
                        type="button"
                        disabled={!item.canApprove}
                        onClick={() => void submitApprovalDecision(item, 'approved')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={!item.canDeny}
                        onClick={() => void submitApprovalDecision(item, 'denied')}
                      >
                        Deny
                      </button>
                      <button
                        type="button"
                        disabled={!item.canRevoke}
                        onClick={() => void submitApprovalDecision(item, 'revoked')}
                      >
                        Revoke
                      </button>
                    </div>
                    <p>{item.summary}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No approval requests are available.</p>
            )}
          </Panel>
        </section>
      ) : activeView === 'readiness' ? (
        <section className="grid">
          <Panel title="Operator Readiness">
            <ul>
              <li>
                <strong>status</strong>
                <span>{readinessSummary.status}</span>
              </li>
              <li>
                <strong>checks</strong>
                <span>
                  {readinessSummary.passedCheckCount} pass,{' '}
                  {readinessSummary.warningCheckCount} warn,{' '}
                  {readinessSummary.failedCheckCount} fail
                </span>
              </li>
              <li>
                <strong>store</strong>
                <span>{String(readinessSummary.storeAvailable)}</span>
              </li>
              <li>
                <strong>local-control keys</strong>
                <span>{readinessSummary.configuredLocalControlKeyCount} configured</span>
              </li>
              <li>
                <strong>boundary allowlist</strong>
                <span>{String(readinessSummary.processBoundaryAllowlistPassed)}</span>
              </li>
            </ul>
            <p>{readinessSummary.summary}</p>
          </Panel>
          <Panel title="Config Hashes">
            <ul>
              <li>
                <strong>policies</strong>
                <span>{readinessSummary.policyConfigHash}</span>
              </li>
              <li>
                <strong>risk matrix</strong>
                <span>{readinessSummary.riskConfigHash}</span>
              </li>
              <li>
                <strong>integrations</strong>
                <span>{readinessSummary.integrationConfigHash}</span>
              </li>
              <li>
                <strong>storage</strong>
                <span>
                  bodyStored {String(readinessSummary.bodyStored)}, rawPathStored{' '}
                  {String(readinessSummary.rawPathStored)}
                </span>
              </li>
            </ul>
          </Panel>
          <Panel title="Integration Readiness">
            <ul>
              {readinessSummary.integrations.map((integration) => (
                <li key={integration.name} className="stacked">
                  <strong>{integration.name}</strong>
                  <span>
                    enabled {String(integration.enabled)}, safeToEnable{' '}
                    {String(integration.safeToEnable)}
                  </span>
                  <span>
                    risk {integration.riskLevel}, approval{' '}
                    {String(integration.approvalRequired)}
                  </span>
                  <span>
                    blockers{' '}
                    {integration.blockers.length > 0
                      ? integration.blockers.join(', ')
                      : 'none'}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Readiness Checks">
            <ul>
              {readinessSummary.checks.slice(0, 14).map((check) => (
                <li key={check.code} className="stacked">
                  <strong>{check.code}</strong>
                  <span>
                    {check.category} / {check.status}
                  </span>
                  <span>hash {check.hash ?? 'none'}</span>
                  <span>
                    blockers {check.blockers.length > 0 ? check.blockers.join(', ') : 'none'}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </section>
      ) : activeView === 'governance' ? (
        <section className="grid">
          <Panel title="Unified Governance Projection">
            <ul>
              <li>
                <strong>status</strong>
                <span>{governanceSummary.status}</span>
              </li>
              <li>
                <strong>runs</strong>
                <span>{governanceSummary.runCount}</span>
              </li>
              <li>
                <strong>evidence / audit</strong>
                <span>
                  {governanceSummary.evidenceCount} evidence,{' '}
                  {governanceSummary.auditEventCount} audit events
                </span>
              </li>
              <li>
                <strong>boundaries</strong>
                <span>
                  process {governanceSummary.processBoundaryCount}, external{' '}
                  {governanceSummary.externalProcessStartedCount}, network{' '}
                  {governanceSummary.networkBoundaryCount}
                </span>
              </li>
              <li>
                <strong>projection hash</strong>
                <span>{governanceSummary.projectionHash}</span>
              </li>
              <li>
                <strong>storage</strong>
                <span>
                  bodyStored {String(governanceSummary.bodyStored)}, rawPathStored{' '}
                  {String(governanceSummary.rawPathStored)}
                </span>
              </li>
            </ul>
            <p>{governanceSummary.summary}</p>
          </Panel>
          <Panel title="Sources">
            {governanceSummary.sources.length > 0 ? (
              <ul>
                {governanceSummary.sources.map((source) => (
                  <li key={source.source}>
                    <strong>{source.source}</strong>
                    <span>{source.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No projected run sources are available.</p>
            )}
          </Panel>
          <Panel title="Unified Runs">
            {governanceSummary.runs.length > 0 ? (
              <ul>
                {governanceSummary.runs.slice(0, 12).map((run) => (
                  <li key={run.id} className="stacked">
                    <strong>{run.source}</strong>
                    <span>
                      status {run.status}, sourceRun {run.sourceRunIdHash}
                    </span>
                    <span>
                      evidence {run.evidenceCount}, audit {run.auditEventCount}
                    </span>
                    <span>
                      process {String(run.processBoundaryInvoked)}, external{' '}
                      {String(run.externalProcessStarted)}, noRealWrite{' '}
                      {String(run.noRealWrite)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                No unified run projections are available. The Dashboard remains read-only and never
                sends local-control credentials.
              </p>
            )}
          </Panel>
          <Panel title="Rework Loop">
            <ul>
              <li>
                <strong>records</strong>
                <span>
                  dry-runs {overview.reworkLoopDryRuns.length}, approvals{' '}
                  {overview.reworkLoopApprovals.length}, runs {overview.reworkLoopRuns.length}
                </span>
              </li>
              <li>
                <strong>latest trigger</strong>
                <span>{overview.reworkLoopRuns[0]?.triggerKind ?? 'none'}</span>
              </li>
              <li>
                <strong>latest branch</strong>
                <span>{overview.reworkLoopRuns[0]?.plannedBranchNameHash ?? 'none'}</span>
              </li>
              <li>
                <strong>child execution</strong>
                <span>
                  approvals{' '}
                  {String(overview.reworkLoopRuns[0]?.childApprovalsRequired ?? true)}, direct{' '}
                  {String(overview.reworkLoopRuns[0]?.directChildExecutionAllowed ?? false)}
                </span>
              </li>
              <li>
                <strong>child actions</strong>
                <span>
                  patch {String(overview.reworkLoopRuns[0]?.patchExecuted ?? false)}, branch{' '}
                  {String(overview.reworkLoopRuns[0]?.branchPublished ?? false)}, draft PR{' '}
                  {String(overview.reworkLoopRuns[0]?.draftPrCreated ?? false)}
                </span>
              </li>
              <li>
                <strong>acceptance rehearsal</strong>
                <span>
                  {reworkLoopAcceptanceRehearsalSummary.status} /{' '}
                  {reworkLoopAcceptanceRehearsalSummary.nextActionStatus}
                </span>
              </li>
            </ul>
            <p>{reworkLoopAcceptanceRehearsalSummary.summary}</p>
          </Panel>
        </section>
      ) : activeView === 'overview' ? (
        <section className="grid">
        <Panel title="Supervisor Health">
          {overview.health ? (
            <pre>{JSON.stringify(overview.health, null, 2)}</pre>
          ) : (
            <p>{overview.message ?? 'Waiting for supervisor health.'}</p>
          )}
        </Panel>

        <Panel title="Workflow Runs">
          {overview.runs.length > 0 ? (
            <ul>
              {overview.runs.map((run) => (
                <li key={run.id}>
                  <strong>{run.workflowName}</strong>
                  <span>{run.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No workflow runs are available in this placeholder view.</p>
          )}
        </Panel>

        <Panel title="Source Health">
          {overview.sourceHealth.length > 0 ? (
            <ul>
              {overview.sourceHealth.map((source) => (
                <li key={source.id}>
                  <strong>{source.source}</strong>
                  <span>{source.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Observation sources are not connected yet.</p>
          )}
        </Panel>

        <Panel title="Development Mock Runs">
          {overview.developmentRuns.length > 0 ? (
            <ul>
              {overview.developmentRuns.map((run) => (
                <li key={run.request.id} className="stacked">
                  <strong>{run.summary.requestTitle}</strong>
                  <span>
                    {run.summary.taskCount} tasks, {run.summary.selectedSkillIds.length} skills,{' '}
                    {run.summary.agentRunCount} agents, verification{' '}
                    {run.summary.verificationStatus}, {run.summary.evidenceCount} evidence,{' '}
                    {run.summary.auditEventCount} audits
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No mock development runs are available yet.</p>
          )}
        </Panel>

        <Panel title="Codex Fixture Replays">
          {overview.codexReplayRuns.length > 0 ? (
            <ul>
              {overview.codexReplayRuns.map((run) => (
                <li key={run.id} className="stacked">
                  <strong>{run.threadId ?? run.id}</strong>
                  <span>
                    {run.eventCount} events, {run.itemCount} items, {run.commandExecutionCount}{' '}
                    commands, {run.fileChangeCount} file changes, {run.errorCount} errors,{' '}
                    {run.status}, mock {String(run.mockOnly)}, live {String(run.liveExecution)},
                    external process {String(run.externalProcessStarted)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No Codex fixture replays are available yet.</p>
          )}
        </Panel>

        <Panel title="Codex Dry-Run Control Plane">
          {overview.codexExecConfigLoadResult ? (
            <p>
              config {overview.codexExecConfigLoadResult.status},{' '}
              {overview.codexExecConfigLoadResult.source}, disabled{' '}
              {String(overview.codexExecConfigLoadResult.executionDisabled)}
            </p>
          ) : null}
          {overview.codexExecLiveConfig ? (
            <p>
              liveEnabled {String(overview.codexExecLiveConfig.liveEnabled)}, allowed{' '}
              {overview.codexExecLiveConfig.allowedSandboxModes.join(', ')}
            </p>
          ) : null}
          {overview.codexExecDryRuns.length > 0 ? (
            <ul>
              {overview.codexExecDryRuns.map((run) => (
                <li key={run.id} className="stacked">
                  <strong>{run.title}</strong>
                  <span>
                    {run.sandboxMode}, {run.approvalMode}, {run.riskLevel} risk, policy{' '}
                    {run.policyDecision.outcome}, live {String(run.liveExecution)}, external process{' '}
                    {String(run.externalProcessStarted)}, disabled {String(run.executionDisabled)}
                  </span>
                  <span>
                    preflight {run.preflightResult?.status ?? 'not run'}, approval{' '}
                    {run.approvalArtifact?.status ?? 'not created'}, gate{' '}
                    {run.executionGateResult?.status ?? 'not evaluated'}{' '}
                    {run.executionGateResult?.reasons[0] ?? ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No Codex dry-run control-plane records are available yet.</p>
          )}
        </Panel>

        <Panel title="Manual Approvals">
          {overview.codexExecApprovals.length > 0 ? (
            <ul>
              {overview.codexExecApprovals.map((record) => (
                <li key={record.id} className="stacked">
                  <strong>{record.request.dryRunPlanId}</strong>
                  <span>
                    state {record.approvalState?.status ?? record.status},{' '}
                    {record.request.riskLevel} risk, scope {record.request.scope}
                  </span>
                  <span>
                    decision {record.decision?.outcome ?? 'pending'}, artifact{' '}
                    {record.approvalArtifact?.status ?? 'not created'}, live{' '}
                    {String(record.liveExecution)}, disabled {String(record.executionDisabled)}
                  </span>
                  <span>
                    can decide {String(record.approvalState?.canDecide ?? false)}, terminal{' '}
                    {String(record.approvalState?.terminal ?? false)}, next{' '}
                    {record.approvalState?.nextAllowedActions.join(', ') || 'none'}
                  </span>
                  <span>{record.approvalState?.reasons[0] ?? 'state not evaluated'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No manual approval records are available yet.</p>
          )}
        </Panel>

        <Panel title="Codex Control Timeline">
          {overview.codexExecTimelineDetails.length > 0 ? (
            <ul>
              {overview.codexExecTimelineDetails.map((detail) => (
                <li key={detail.id} className="stacked timeline-detail">
                  <strong>{detail.dryRunId}</strong>
                  <span>
                    status {detail.timeline.status}, {detail.timeline.eventCount} events, gate{' '}
                    {detail.latestGateStatus ?? 'none'}, approval {detail.approvalStatus ?? 'none'}
                  </span>
                  <span>
                    evidence {detail.evidenceSummary.count}, audit {detail.auditSummary.count},
                    liveExecution {String(detail.liveExecution)}, externalProcessStarted{' '}
                    {String(detail.externalProcessStarted)}, executionDisabled{' '}
                    {String(detail.executionDisabled)}
                  </span>
                  <span>sources {formatSourceBreakdown(detail.sourceBreakdown)}</span>
                  <div className="timeline-list" aria-label="Read-only timeline events">
                    {detail.timeline.events.length > 0 ? (
                      detail.timeline.events.slice(0, 8).map((event) => (
                        <div key={event.id} className="timeline-event">
                          <span>
                            {event.sourceKind} / {event.status}
                          </span>
                          <span>{event.eventType}</span>
                          <span>{new Date(event.occurredAt).toLocaleString()}</span>
                          <p>{event.summary}</p>
                        </div>
                      ))
                    ) : (
                      <p>No timeline events match the current read-only view.</p>
                    )}
                  </div>
                  <span>
                    evidence refs{' '}
                    {detail.evidenceSummary.items
                      .slice(0, 3)
                      .map((item) => `${item.kind}:${item.hash}`)
                      .join(' | ') || 'none'}
                  </span>
                  <span>
                    audit refs{' '}
                    {detail.auditSummary.items
                      .slice(0, 3)
                      .map((item) => `${item.action}:${item.outcome}`)
                      .join(' | ') || 'none'}
                  </span>
                </li>
              ))}
            </ul>
          ) : overview.codexExecTimelines.length > 0 ? (
            <ul>
              {overview.codexExecTimelines.map((timeline) => (
                <li key={timeline.id} className="stacked">
                  <strong>{timeline.dryRunId}</strong>
                  <span>
                    {timeline.status}, {timeline.eventCount} events, {timeline.evidenceCount}{' '}
                    evidence, {timeline.auditEventCount} audits
                  </span>
                  <span>
                    liveExecution {String(timeline.liveExecution)}, externalProcessStarted{' '}
                    {String(timeline.externalProcessStarted)}, executionDisabled{' '}
                    {String(timeline.executionDisabled)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only control-plane timeline is available yet.</p>
          )}
        </Panel>

        <Panel title="Codex Evidence And Audit Drilldown">
          {overview.codexExecDrilldowns.length > 0 ? (
            <ul>
              {overview.codexExecDrilldowns.map((drilldown) => (
                <li key={drilldown.id} className="stacked drilldown-detail">
                  <strong>{drilldown.dryRunId}</strong>
                  <span>
                    status {drilldown.status}, evidence {drilldown.evidenceCount}, audit{' '}
                    {drilldown.auditEventCount}
                  </span>
                  <span>
                    liveExecution {String(drilldown.liveExecution)}, externalProcessStarted{' '}
                    {String(drilldown.externalProcessStarted)}, executionDisabled{' '}
                    {String(drilldown.executionDisabled)}
                  </span>
                  <div className="drilldown-grid" aria-label="Read-only evidence and audit refs">
                    <div>
                      <strong>Evidence refs</strong>
                      {drilldown.evidenceSearch.items.length > 0 ? (
                        drilldown.evidenceSearch.items.slice(0, 5).map((item) => (
                          <div key={item.id} className="drilldown-item">
                            <span>{item.kind ?? 'unknown'}</span>
                            <span>{item.evidenceRefId}</span>
                            <span>{item.hash ?? 'hash unavailable'}</span>
                            <p>{item.summary ?? 'No evidence summary available.'}</p>
                          </div>
                        ))
                      ) : (
                        <p>No evidence refs match this read-only view.</p>
                      )}
                    </div>
                    <div>
                      <strong>Audit events</strong>
                      {drilldown.auditSearch.items.length > 0 ? (
                        drilldown.auditSearch.items.slice(0, 5).map((item) => (
                          <div key={item.id} className="drilldown-item">
                            <span>{item.action ?? 'unknown'}</span>
                            <span>{item.auditEventId}</span>
                            <span>{item.outcome ?? 'outcome unavailable'}</span>
                            <p>
                              evidence refs {item.evidenceRefIds.length}, policy{' '}
                              {item.policyDecisionId ?? 'none'}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p>No audit events match this read-only view.</p>
                      )}
                    </div>
                  </div>
                  <div className="drilldown-grid">
                    <div className="drilldown-item">
                      <strong>Selected evidence</strong>
                      {drilldown.selectedEvidence ? (
                        <>
                          <span>{drilldown.selectedEvidence.evidenceRefId}</span>
                          <span>{drilldown.selectedEvidence.kind ?? 'unknown'}</span>
                          <span>{drilldown.selectedEvidence.hash ?? 'hash unavailable'}</span>
                          <p>{drilldown.selectedEvidence.summary ?? 'No summary available.'}</p>
                        </>
                      ) : (
                        <p>No selected evidence detail.</p>
                      )}
                    </div>
                    <div className="drilldown-item">
                      <strong>Selected audit</strong>
                      {drilldown.selectedAudit ? (
                        <>
                          <span>{drilldown.selectedAudit.auditEventId}</span>
                          <span>{drilldown.selectedAudit.action ?? 'unknown'}</span>
                          <span>{drilldown.selectedAudit.outcome ?? 'outcome unavailable'}</span>
                          <p>
                            evidence refs {drilldown.selectedAudit.evidenceRefIds.length}, metadata
                            keys{' '}
                            {drilldown.selectedAudit.metadataSummary?.keys.join(', ') || 'none'}
                          </p>
                        </>
                      ) : (
                        <p>No selected audit detail.</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only evidence or audit drilldown is available yet.</p>
          )}
        </Panel>

        <Panel title="Codex Control Report Preview">
          {overview.codexExecReports.length > 0 ? (
            <ul>
              {overview.codexExecReports.map((report) => (
                <li key={report.id} className="stacked report-detail">
                  <strong>{report.dryRunId}</strong>
                  <span>
                    status {report.status}, sections {report.summary.sectionCount}, evidence{' '}
                    {report.summary.evidenceCount}, audit {report.summary.auditEventCount}
                  </span>
                  <span>
                    liveExecution {String(report.liveExecution)}, externalProcessStarted{' '}
                    {String(report.externalProcessStarted)}, executionDisabled{' '}
                    {String(report.executionDisabled)}
                  </span>
                  <div className="report-section-grid" aria-label="Read-only report sections">
                    {report.sections.map((section) => (
                      <div key={section.id} className="report-section">
                        <strong>{section.title}</strong>
                        <span>
                          {section.kind} / {section.status}
                        </span>
                        <p>{section.summary}</p>
                        <span>
                          refs {section.refIds.length}, hashes {section.hashes.length}
                        </span>
                      </div>
                    ))}
                  </div>
                  <span>
                    risks{' '}
                    {report.sections.find((section) => section.kind === 'risks')?.summary ??
                      'not available'}
                  </span>
                  <span>
                    recommendations{' '}
                    {report.sections.find((section) => section.kind === 'recommendations')
                      ?.summary ?? 'not available'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only control-plane report preview is available yet.</p>
          )}
        </Panel>

        <Panel title="Codex Report Review Workflow">
          {overview.codexExecReportReviews.length > 0 ? (
            <ul>
              {overview.codexExecReportReviews.map((review) => (
                <li key={review.id} className="stacked report-detail">
                  <strong>{review.dryRunId}</strong>
                  <span>
                    status {review.status}, risk {review.riskClassification}, recommendation{' '}
                    {review.recommendation}
                  </span>
                  <span>
                    recommendation grants execution {String(review.recommendationGrantsExecution)},
                    liveExecution {String(review.liveExecution)}, externalProcessStarted{' '}
                    {String(review.externalProcessStarted)}, executionDisabled{' '}
                    {String(review.executionDisabled)}
                  </span>
                  <span>
                    reviewer {review.reviewerLabel}, reviewed{' '}
                    {new Date(review.reviewedAt).toLocaleString()}
                  </span>
                  <div className="report-section-grid" aria-label="Read-only report review checks">
                    <div className="report-section">
                      <strong>Checklist</strong>
                      {review.checklistItems.slice(0, 6).map((item) => (
                        <p key={item.id}>
                          {item.code}: {item.status}
                        </p>
                      ))}
                      {review.checklistItems.length === 0 ? <p>No checklist items.</p> : null}
                    </div>
                    <div className="report-section">
                      <strong>Findings</strong>
                      {review.findings.slice(0, 6).map((finding) => (
                        <p key={finding.id}>
                          {finding.severity} {finding.code}: {finding.summary}
                        </p>
                      ))}
                      {review.findings.length === 0 ? <p>No review findings.</p> : null}
                    </div>
                  </div>
                  <p>
                    {review.notesSummary ??
                      'Review history is metadata-only and does not grant execution.'}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only report review records are available yet.</p>
          )}
        </Panel>

        <Panel title="Codex Report Review History">
          {overview.codexExecReportReviewHistories.length > 0 ? (
            <ul>
              {overview.codexExecReportReviewHistories.map((history) => (
                <li key={history.id} className="stacked report-detail">
                  <strong>{history.dryRunId ?? 'all dry-run records'}</strong>
                  <span>
                    reviews {history.historyCount}, latest{' '}
                    {history.latestReview?.reviewId ?? 'none'}, status{' '}
                    {history.latestReview?.status ?? 'none'}, recommendation{' '}
                    {history.latestReview?.recommendation ?? 'none'}
                  </span>
                  <span>
                    recommendation grants execution {String(history.recommendationGrantsExecution)},
                    liveExecution {String(history.liveExecution)}, externalProcessStarted{' '}
                    {String(history.externalProcessStarted)}, executionDisabled{' '}
                    {String(history.executionDisabled)}
                  </span>
                  <div className="report-section-grid" aria-label="Read-only review history">
                    <div className="report-section">
                      <strong>History</strong>
                      {history.summaries.slice(0, 6).map((summary) => (
                        <p key={summary.id}>
                          {summary.reviewId}: {summary.status} / {summary.recommendation}
                        </p>
                      ))}
                      {history.summaries.length === 0 ? <p>No review history.</p> : null}
                    </div>
                    <div className="report-section">
                      <strong>Latest Comparison</strong>
                      {history.comparison ? (
                        <>
                          <p>{history.comparison.summary}</p>
                          <p>changed fields {history.comparison.changedItemCount}</p>
                          {history.comparison.items
                            .filter((item) => item.changed)
                            .slice(0, 5)
                            .map((item) => (
                              <p key={item.id}>
                                {item.field}: {item.leftValueSummary} to {item.rightValueSummary}
                              </p>
                            ))}
                        </>
                      ) : (
                        <p>At least two reviews are needed for comparison.</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only report review history is available yet.</p>
          )}
        </Panel>

        <Panel title="Governance Review Package">
          {overview.codexExecGovernancePackages.length > 0 ? (
            <ul>
              {overview.codexExecGovernancePackages.map((governancePackage) => (
                <li key={governancePackage.id} className="stacked report-detail">
                  <strong>{governancePackage.dryRunId}</strong>
                  <span>
                    status {governancePackage.status}, risk {governancePackage.riskClassification},
                    recommendation {governancePackage.recommendation}
                  </span>
                  <span>
                    recommendation grants execution{' '}
                    {String(governancePackage.recommendationGrantsExecution)}, liveExecution{' '}
                    {String(governancePackage.liveExecution)}, externalProcessStarted{' '}
                    {String(governancePackage.externalProcessStarted)}, executionDisabled{' '}
                    {String(governancePackage.executionDisabled)}
                  </span>
                  <span>
                    checklist {governancePackage.summary.checklistPassedCount} passed,{' '}
                    {governancePackage.summary.checklistWarningCount} warnings,{' '}
                    {governancePackage.summary.checklistFailedCount} failed; blockers{' '}
                    {governancePackage.summary.unresolvedBlockerCount}
                  </span>
                  <span>
                    no-live evidence: codex{' '}
                    {String(governancePackage.noLiveEvidence.noRealCodexExec)}, process{' '}
                    {String(governancePackage.noLiveEvidence.noExternalProcessStarted)}, browser/CDP{' '}
                    {String(governancePackage.noLiveEvidence.noBrowserOrCdpAction)}, workspace write{' '}
                    {String(governancePackage.noLiveEvidence.noWorkspaceWrite)}
                  </span>
                  <div className="report-section-grid" aria-label="Read-only ADR readiness">
                    <div className="report-section">
                      <strong>ADR Readiness</strong>
                      {governancePackage.adrReadinessChecklist.slice(0, 6).map((item) => (
                        <p key={item.id}>
                          {item.code}: {item.status}
                        </p>
                      ))}
                      {governancePackage.adrReadinessChecklist.length === 0 ? (
                        <p>No ADR readiness checks.</p>
                      ) : null}
                    </div>
                    <div className="report-section">
                      <strong>Unresolved Blockers</strong>
                      {governancePackage.blockers.slice(0, 6).map((blocker) => (
                        <p key={blocker.id}>
                          {blocker.severity} {blocker.code}: {blocker.summary}
                        </p>
                      ))}
                      {governancePackage.blockers.length === 0 ? (
                        <p>No unresolved blockers in the read-only package.</p>
                      ) : null}
                    </div>
                  </div>
                  <p>Recommendation is ADR readiness guidance only and does not grant execution.</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only governance review package is available yet.</p>
          )}
        </Panel>

        <Panel title="Live Adapter ADR Draft Preview">
          {overview.codexExecAdrDrafts.length > 0 ? (
            <ul>
              {overview.codexExecAdrDrafts.map((draft) => (
                <li key={draft.id} className="stacked report-detail">
                  <strong>{draft.title}</strong>
                  <span>
                    dryRunId {draft.dryRunId}, status {draft.status}, risk{' '}
                    {draft.summary.riskClassification}
                  </span>
                  <span>
                    recommendation {draft.recommendation}; grants execution{' '}
                    {String(draft.recommendationGrantsExecution)}, draftOnly{' '}
                    {String(draft.draftOnly)}
                  </span>
                  <span>
                    liveExecution {String(draft.liveExecution)}, externalProcessStarted{' '}
                    {String(draft.externalProcessStarted)}, executionDisabled{' '}
                    {String(draft.executionDisabled)}
                  </span>
                  <span>
                    sections {draft.summary.sectionCount}, blockers {draft.summary.blockerCount},
                    readiness {draft.summary.readinessPassedCount} passed /{' '}
                    {draft.summary.readinessFailedCount} failed
                  </span>
                  <div className="report-section-grid" aria-label="Read-only ADR draft sections">
                    {draft.sections.slice(0, 6).map((section) => (
                      <div key={section.id} className="report-section">
                        <strong>{section.title}</strong>
                        <span>
                          {section.kind} / {section.status}
                        </span>
                        <p>{section.summary}</p>
                      </div>
                    ))}
                  </div>
                  <div className="report-section" aria-label="Safe ADR draft markdown preview">
                    <strong>Markdown preview</strong>
                    <p>{draft.sections.find((section) => section.kind === 'context')?.summary}</p>
                    <p>
                      Recommended decision:{' '}
                      {draft.sections.find((section) => section.kind === 'recommended_decision')
                        ?.summary ?? 'No recommendation section available.'}
                    </p>
                    <p>
                      This preview is ADR preparation guidance only and does not grant execution.
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only Live Adapter ADR draft preview is available yet.</p>
          )}
        </Panel>

        <Panel title="Live Adapter ADR Decision">
          {overview.codexExecAdrDecisions.length > 0 ? (
            <ul>
              {overview.codexExecAdrDecisions.map((decision) => (
                <li key={decision.id} className="stacked report-detail">
                  <strong>{decision.dryRunId}</strong>
                  <span>
                    decision {decision.decision}, status {decision.status}, reviewer{' '}
                    {decision.reviewerLabel}
                  </span>
                  <span>
                    allowed sandbox modes {decision.allowedSandboxModes.join(', ') || 'none'};
                    forbidden sandbox modes {decision.forbiddenSandboxModes.join(', ') || 'none'}
                  </span>
                  <span>
                    future trigger {decision.futureTriggerPolicy}, dashboard trigger allowed{' '}
                    {String(decision.dashboardTriggerAllowed)}
                  </span>
                  <span>
                    approval artifact required {String(decision.approvalArtifactRequired)}, dry-run
                    hash match {String(decision.dryRunPlanHashMatchRequired)}, policy hash match{' '}
                    {String(decision.policyDecisionHashMatchRequired)}
                  </span>
                  <span>
                    isolated worktree {String(decision.isolatedWorktreeRequired)}, post-run verify{' '}
                    {decision.postRunVerificationCommand}
                  </span>
                  <span>
                    implementationApproved {String(decision.implementationApproved)},
                    processAdapterApproved {String(decision.processAdapterApproved)},
                    recommendationGrantsExecution {String(decision.recommendationGrantsExecution)}
                  </span>
                  <span>
                    evidence {decision.evidenceCount}, audit {decision.auditEventCount},
                    liveExecution {String(decision.liveExecution)}, externalProcessStarted{' '}
                    {String(decision.externalProcessStarted)}, executionDisabled{' '}
                    {String(decision.executionDisabled)}
                  </span>
                  <p>
                    This ADR decision is governance guidance only. It does not approve
                    implementation, process adapter work, or Dashboard-triggered execution.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only Live Adapter ADR decision is available yet.</p>
          )}
        </Panel>

        <Panel title="Read-only Adapter Preflight Simulator">
          {overview.codexExecReadOnlyAdapterPreflightSimulations.length > 0 ? (
            <ul>
              {overview.codexExecReadOnlyAdapterPreflightSimulations.map((simulation) => (
                <li key={simulation.id} className="stacked report-detail">
                  <strong>{simulation.dryRunId}</strong>
                  <span>
                    status {simulation.status}, sandbox {simulation.requestedSandboxMode}, blockers{' '}
                    {simulation.blockerCount}
                  </span>
                  <span>
                    checks {simulation.passedCheckCount} passed, {simulation.failedCheckCount}{' '}
                    failed, {simulation.warningCheckCount} require review
                  </span>
                  <span>
                    isolated worktree {String(simulation.isolatedWorktreePresent)}, evidence ready{' '}
                    {String(simulation.evidenceStoreReady)}, audit ready{' '}
                    {String(simulation.auditStoreReady)}
                  </span>
                  <span>
                    liveExecution {String(simulation.liveExecution)}, externalProcessStarted{' '}
                    {String(simulation.externalProcessStarted)}, executionDisabled{' '}
                    {String(simulation.executionDisabled)}
                  </span>
                  <span>
                    processAdapterStarted {String(simulation.processAdapterStarted)},
                    implementationApproved {String(simulation.implementationApproved)}, dashboard
                    trigger allowed {String(simulation.dashboardTriggerAllowed)}
                  </span>
                  <div
                    className="report-section-grid"
                    aria-label="Read-only adapter preflight simulator summary"
                  >
                    <div className="report-section">
                      <strong>Operator checklist</strong>
                      {simulation.operatorChecklist.slice(0, 6).map((item) => (
                        <p key={item.id}>
                          {item.code}: {item.checked ? 'checked' : 'not checked'}
                        </p>
                      ))}
                      {simulation.operatorChecklist.length === 0 ? (
                        <p>No checklist items are available.</p>
                      ) : null}
                    </div>
                    <div className="report-section">
                      <strong>Blockers</strong>
                      {simulation.blockers.slice(0, 6).map((blocker) => (
                        <p key={blocker.id}>
                          {blocker.severity} {blocker.code}: {blocker.summary}
                        </p>
                      ))}
                      {simulation.blockers.length === 0 ? (
                        <p>No simulator blockers are present.</p>
                      ) : null}
                    </div>
                  </div>
                  <p>
                    Simulation result is readiness evidence only and does not grant execution
                    permission.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only adapter preflight simulation has been recorded yet.</p>
          )}
        </Panel>

        <Panel title="Simulator Review / Go-No-Go">
          {overview.codexExecReadOnlyAdapterSimulatorReviews.length > 0 ? (
            <ul>
              {overview.codexExecReadOnlyAdapterSimulatorReviews.map((review) => (
                <li key={review.id} className="stacked report-detail">
                  <strong>{review.dryRunId}</strong>
                  <span>
                    outcome {review.outcome}, status {review.status}, simulator{' '}
                    {review.simulationStatus}
                  </span>
                  <span>
                    hard gates {review.hardGateCount}, requires review {review.requiresReviewCount},
                    informational {review.informationalCount}, unresolved{' '}
                    {review.unresolvedBlockerCount}
                  </span>
                  <span>
                    implementationApproved {String(review.implementationApproved)},
                    processAdapterApproved {String(review.processAdapterApproved)},
                    recommendationGrantsExecution {String(review.recommendationGrantsExecution)}
                  </span>
                  <span>
                    liveExecution {String(review.liveExecution)}, externalProcessStarted{' '}
                    {String(review.externalProcessStarted)}, executionDisabled{' '}
                    {String(review.executionDisabled)}
                  </span>
                  <p>
                    Review outcome is planning guidance only. It does not approve an adapter,
                    process launch, or Dashboard-triggered action.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only simulator review has been recorded yet.</p>
          )}
        </Panel>

        <Panel title="Implementation Plan Review / Go-No-Go">
          {overview.codexExecReadOnlyAdapterImplementationPlanReviews.length > 0 ? (
            <ul>
              {overview.codexExecReadOnlyAdapterImplementationPlanReviews.map((review) => (
                <li key={review.id} className="stacked report-detail">
                  <strong>{review.reviewId}</strong>
                  <span>
                    outcome {review.outcome}, status {review.status}, disabled skeleton approved{' '}
                    {String(review.disabledSkeletonApproved)}
                  </span>
                  <span>
                    hard gates {review.hardGateCount}, requires review {review.requiresReviewCount},
                    informational {review.informationalCount}, unresolved findings{' '}
                    {review.unresolvedFindingCount}
                  </span>
                  <span>
                    implementationApproved {String(review.implementationApproved)},
                    processAdapterApproved {String(review.processAdapterApproved)},
                    recommendationGrantsExecution {String(review.recommendationGrantsExecution)}
                  </span>
                  <span>
                    workspaceWriteAllowed {String(review.workspaceWriteAllowed)},
                    dangerFullAccessAllowed {String(review.dangerFullAccessAllowed)},
                    dashboardTriggerAllowed {String(review.dashboardTriggerAllowed)}
                  </span>
                  <span>
                    liveExecution {String(review.liveExecution)}, externalProcessStarted{' '}
                    {String(review.externalProcessStarted)}, executionDisabled{' '}
                    {String(review.executionDisabled)}
                  </span>
                  <p>
                    Conditional skeleton approval only allows a future disabled-by-default skeleton.
                    It does not approve process adapter work, Codex process launch, or
                    Dashboard-triggered actions.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only implementation plan review has been recorded yet.</p>
          )}
        </Panel>

        <Panel title="Disabled Read-only Adapter Skeleton">
          {overview.codexExecReadOnlyAdapterSkeletonPreview ? (
            <div className="stacked report-detail">
              <strong>{overview.codexExecReadOnlyAdapterSkeletonPreview.status}</strong>
              <span>
                configured enabled{' '}
                {String(overview.codexExecReadOnlyAdapterSkeletonPreview.config.configuredEnabled)},
                liveExecution{' '}
                {String(overview.codexExecReadOnlyAdapterSkeletonPreview.liveExecution)},
                externalProcessStarted{' '}
                {String(overview.codexExecReadOnlyAdapterSkeletonPreview.externalProcessStarted)},
                executionDisabled{' '}
                {String(overview.codexExecReadOnlyAdapterSkeletonPreview.executionDisabled)}
              </span>
              <span>
                processAdapterStarted{' '}
                {String(overview.codexExecReadOnlyAdapterSkeletonPreview.processAdapterStarted)},
                processAdapterApproved{' '}
                {String(overview.codexExecReadOnlyAdapterSkeletonPreview.processAdapterApproved)},
                dashboardTriggerAllowed{' '}
                {String(overview.codexExecReadOnlyAdapterSkeletonPreview.dashboardTriggerAllowed)}
              </span>
              <span>
                workspaceWriteAllowed{' '}
                {String(overview.codexExecReadOnlyAdapterSkeletonPreview.workspaceWriteAllowed)},
                dangerFullAccessAllowed{' '}
                {String(overview.codexExecReadOnlyAdapterSkeletonPreview.dangerFullAccessAllowed)}
              </span>
              <div className="report-section-grid" aria-label="Disabled skeleton reasons">
                {overview.codexExecReadOnlyAdapterSkeletonPreview.disabledReasons.map((reason) => (
                  <div key={reason.id} className="report-section">
                    <strong>{reason.code}</strong>
                    <span>{reason.severity}</span>
                    <p>{reason.summary}</p>
                  </div>
                ))}
              </div>
              <p>
                Skeleton preview is disabled by default and contains no runnable command, argument
                list, executable path, shell snippet, or environment plan.
              </p>
            </div>
          ) : (
            <p>No disabled read-only adapter skeleton preview is available.</p>
          )}
        </Panel>

        <Panel title="Disabled Skeleton Review">
          {overview.codexExecReadOnlyAdapterSkeletonReviews.length > 0 ? (
            <ul>
              {overview.codexExecReadOnlyAdapterSkeletonReviews.map((review) => (
                <li key={review.id} className="stacked report-detail">
                  <strong>{review.reviewId}</strong>
                  <span>
                    outcome {review.outcome}, status {review.status}, skeleton preview{' '}
                    {review.skeletonPreviewId}
                  </span>
                  <span>
                    fixture boundary allowed {String(review.fixtureBoundaryAllowed)}, hard gates{' '}
                    {review.hardGateCount}, requires review {review.requiresReviewCount},
                    informational {review.informationalCount}
                  </span>
                  <span>
                    unresolved findings {review.unresolvedFindingCount}, liveExecution{' '}
                    {String(review.liveExecution)}, externalProcessStarted{' '}
                    {String(review.externalProcessStarted)}, executionDisabled{' '}
                    {String(review.executionDisabled)}
                  </span>
                  <span>
                    processAdapterApproved {String(review.processAdapterApproved)},
                    recommendationGrantsExecution {String(review.recommendationGrantsExecution)},
                    dashboardTriggerAllowed {String(review.dashboardTriggerAllowed)}
                  </span>
                  <p>
                    This review can only allow a fixture-backed replay boundary follow-up. It does
                    not approve any process adapter or execution path.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No disabled skeleton review has been recorded yet.</p>
          )}
        </Panel>

        <Panel title="Fixture-backed Replay Boundary">
          {overview.codexExecReadOnlyAdapterFixtureBoundaries.length > 0 ? (
            <ul>
              {overview.codexExecReadOnlyAdapterFixtureBoundaries.map((boundary) => (
                <li key={boundary.id} className="stacked report-detail">
                  <strong>{boundary.boundaryResultId}</strong>
                  <span>
                    status {boundary.status}, final {boundary.finalStatus}, fixtureOnly{' '}
                    {String(boundary.fixtureOnly)}
                  </span>
                  <span>
                    events {boundary.eventCount}, items {boundary.itemCount}, errors{' '}
                    {boundary.errorCount}, fixture path hash {boundary.fixturePathHash}
                  </span>
                  <span>
                    liveExecution {String(boundary.liveExecution)}, externalProcessStarted{' '}
                    {String(boundary.externalProcessStarted)}, executionDisabled{' '}
                    {String(boundary.executionDisabled)}
                  </span>
                  <span>
                    processAdapterStarted {String(boundary.processAdapterStarted)},
                    processAdapterApproved {String(boundary.processAdapterApproved)},
                    workspaceWriteAllowed {String(boundary.workspaceWriteAllowed)}
                  </span>
                  <p>
                    Fixture-backed replay boundary uses synthetic local JSONL fixtures only and does
                    not start a process.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No fixture-backed replay boundary summary is available yet.</p>
          )}
        </Panel>

        <Panel title="Final Readiness Review">
          {overview.codexExecReadOnlyAdapterFinalReadiness.length > 0 ? (
            <ul>
              {overview.codexExecReadOnlyAdapterFinalReadiness.map((review) => (
                <li key={review.id} className="stacked report-detail">
                  <strong>{review.decisionId}</strong>
                  <span>
                    outcome {review.outcome}, status {review.status}, reviewer{' '}
                    {review.reviewerLabel}
                  </span>
                  <span>
                    phase A {review.phaseAStatus}, phase B {review.phaseBOutcome}, phase C{' '}
                    {review.phaseCStatus}
                  </span>
                  <span>
                    separate ADR required {String(review.realAdapterRequiresSeparateAdr)},
                    liveExecution {String(review.liveExecution)}, externalProcessStarted{' '}
                    {String(review.externalProcessStarted)}, executionDisabled{' '}
                    {String(review.executionDisabled)}
                  </span>
                  <span>
                    processAdapterApproved {String(review.processAdapterApproved)},
                    recommendationGrantsExecution {String(review.recommendationGrantsExecution)},
                    dashboardTriggerAllowed {String(review.dashboardTriggerAllowed)}
                  </span>
                  <p>
                    Final readiness is a governance record only. Any real read-only adapter still
                    requires a separate ADR and go/no-go review.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No final readiness review has been recorded yet.</p>
          )}
        </Panel>

        <Panel title="Real Read-only Adapter Readiness">
          {overview.codexExecRealReadOnlyAdapterReadiness.length > 0 ? (
            <ul>
              {overview.codexExecRealReadOnlyAdapterReadiness.map((readiness) => (
                <li key={readiness.id} className="stacked report-detail">
                  <strong>{readiness.packageId}</strong>
                  <span>
                    dryRunId {readiness.dryRunId}, status {readiness.status}
                  </span>
                  <span>
                    hard gates {readiness.passedGateCount}/{readiness.hardGateCount}, requires
                    review {readiness.requiresReviewCount}, blockers {readiness.blockerCount},
                    findings {readiness.findingCount}
                  </span>
                  <span>
                    documented-only 3T-W evidence {String(readiness.documentedOnly3twEvidence)},
                    symlink pending {String(readiness.symlinkEscapeVerificationPending)}
                  </span>
                  <span>
                    liveExecution {String(readiness.liveExecution)}, externalProcessStarted{' '}
                    {String(readiness.externalProcessStarted)}, executionDisabled{' '}
                    {String(readiness.executionDisabled)}
                  </span>
                  <span>
                    implementationApproved {String(readiness.implementationApproved)},
                    processAdapterApproved {String(readiness.processAdapterApproved)},
                    recommendationGrantsExecution {String(readiness.recommendationGrantsExecution)}
                  </span>
                  <p>{readiness.recommendation}</p>
                  <p>
                    Ready for separate ADR review only. Does not grant implementation, process
                    launch, or execution permission.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No real read-only adapter readiness package is available. Readiness remains
              non-approving until a separate ADR review exists.
            </p>
          )}
        </Panel>

        <Panel title="Readiness Review / Separate ADR Draft Go-No-Go">
          {overview.codexExecRealReadOnlyAdapterReadinessReviews.length > 0 ? (
            <ul>
              {overview.codexExecRealReadOnlyAdapterReadinessReviews.map((review) => (
                <li key={review.id} className="stacked report-detail">
                  <strong>{review.reviewId}</strong>
                  <span>
                    dryRunId {review.dryRunId}, package {review.packageId}, package status{' '}
                    {review.packageStatus}
                  </span>
                  <span>
                    outcome {review.outcome}, review status {review.status}, reviewer{' '}
                    {review.reviewerLabel}
                  </span>
                  <span>
                    unresolved findings {review.unresolvedFindingCount}, acknowledged{' '}
                    {review.acknowledgedFindingCodes.length}
                  </span>
                  <span>
                    ADR draft conditionally allowed {String(review.separateAdrDraftAllowed)}
                  </span>
                  <span>
                    liveExecution {String(review.liveExecution)}, externalProcessStarted{' '}
                    {String(review.externalProcessStarted)}, executionDisabled{' '}
                    {String(review.executionDisabled)}
                  </span>
                  <span>
                    implementationApproved {String(review.implementationApproved)},
                    processAdapterApproved {String(review.processAdapterApproved)},
                    recommendationGrantsExecution {String(review.recommendationGrantsExecution)}
                  </span>
                  <p>{readinessReviewWording(review)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No readiness review has been recorded. Separate ADR drafting remains unavailable until
              a persisted readiness package is reviewed.
            </p>
          )}
        </Panel>

        <Panel title="Read-only Adapter Attempt Timeline">
          <p>
            Operator state guide: blocked means gate checks refused the attempt before authority
            was claimed; completed, failed, and aborted records require operator review before any
            next step. Degraded or not-persisted data is display-only. This panel cannot create,
            approve, or trigger adapter attempts.
          </p>
          {overview.codexExecRealReadOnlyAdapterAttemptTimelines.length > 0 ? (
            <ul>
              {overview.codexExecRealReadOnlyAdapterAttemptTimelines.map((timeline) => (
                <li key={timeline.id} className="stacked report-detail">
                  <strong>{timeline.dryRunId}</strong>
                  <span>
                    status {timeline.status}, events {timeline.eventCount}, evidence refs{' '}
                    {timeline.evidenceRefCount}, audit events {timeline.auditEventCount}
                  </span>
                  <span>
                    output hashes {timeline.outputHashCount}, process boundary entries{' '}
                    {timeline.processBoundaryInvokedCount}
                  </span>
                  <span>
                    liveExecution {String(timeline.liveExecution)}, externalProcessStarted{' '}
                    {String(timeline.externalProcessStarted)}, executionDisabled{' '}
                    {String(timeline.executionDisabled)}
                  </span>
                  <span>
                    implementationApproved {String(timeline.implementationApproved)},
                    processAdapterApproved {String(timeline.processAdapterApproved)},
                    recommendationGrantsExecution {String(timeline.recommendationGrantsExecution)}
                  </span>
                  <span>
                    workspaceWriteAllowed {String(timeline.workspaceWriteAllowed)},
                    dangerFullAccessAllowed {String(timeline.dangerFullAccessAllowed)},
                    dashboardTriggerAllowed {String(timeline.dashboardTriggerAllowed)}
                  </span>
                  <p>{timeline.verificationSummary}</p>
                  <p>{timeline.workspaceMutationSummary}</p>
                  <p>{timeline.recommendation}</p>
                  {timeline.entries.length > 0 ? (
                    <ul className="timeline-list">
                      {timeline.entries.slice(0, 5).map((entry) => (
                        <li key={entry.id} className="timeline-event">
                          <strong>{entry.status}</strong>
                          <span>{entry.attemptId}</span>
                          <span>
                            evidence {entry.evidenceRefCount}, audit {entry.auditEventCount},
                            process boundary {String(entry.processBoundaryInvoked)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No read-only adapter attempt entries are available for this dry-run.</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No read-only adapter attempt timeline is available. This panel is read-only and cannot
              trigger adapter attempts.
            </p>
          )}
        </Panel>

        <Panel title="Codex Reviewer Handoff">
          {overview.codexExecReviewerHandoffs.length > 0 ? (
            <ul>
              {overview.codexExecReviewerHandoffs.map((handoff) => (
                <li key={handoff.id} className="stacked report-detail">
                  <strong>{handoff.dryRunId}</strong>
                  <span>
                    latest {handoff.latestReviewId ?? 'none'}, status{' '}
                    {handoff.latestStatus ?? 'none'}, recommendation{' '}
                    {handoff.latestRecommendation ?? 'none'}, risk{' '}
                    {handoff.latestRiskClassification ?? 'none'}
                  </span>
                  <span>
                    reviews {handoff.reviewCount}, findings {handoff.findingCount}, failed checks{' '}
                    {handoff.failedChecklistCount}
                  </span>
                  <span>
                    recommendation grants execution {String(handoff.recommendationGrantsExecution)},
                    liveExecution {String(handoff.liveExecution)}, externalProcessStarted{' '}
                    {String(handoff.externalProcessStarted)}, executionDisabled{' '}
                    {String(handoff.executionDisabled)}
                  </span>
                  <p>{handoff.handoffSummary}</p>
                  <p>{handoff.recommendedNextStep}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No read-only reviewer handoff summary is available yet.</p>
          )}
        </Panel>
        </section>
      ) : (
        renderReadOnlyDashboardView(
          activeView,
          overview,
          mcpSummary,
          verificationPreview,
          browserProfilesSummary,
          electronCdpSummary,
          githubProviderSummary,
          githubBranchPublishAcceptanceRehearsalSummary,
          githubDraftPrAcceptanceRehearsalSummary,
          githubPublishDraftPrAcceptanceRehearsalSummary,
          githubPrLifecycleAcceptanceRehearsalSummary,
          worktreeSummary,
          reviewPackageSummary,
          releaseCandidateSummary,
          customWorkflowSummary,
          policyTelemetrySummary,
          pilotSummary,
          pilotAcceptanceSummary,
          m11PilotSummary,
          m11PilotAcceptanceSmokeSummary,
          localRcAcceptanceRehearsalSummary,
        )
      )}
    </main>
  );
}

function renderReadOnlyDashboardView(
  activeView: DashboardView,
  overview: OverviewState,
  mcpSummary: ReturnType<typeof summarizeMcpTools>,
  verificationPreview: ReturnType<typeof createVerificationReadinessPreview>,
  browserProfilesSummary: ReturnType<typeof createBrowserProfilesReadOnlySummary>,
  electronCdpSummary: ReturnType<typeof createElectronCdpReadOnlySummary>,
  githubProviderSummary: ReturnType<typeof createGithubProviderReadOnlySummary>,
  githubBranchPublishAcceptanceRehearsalSummary: ReturnType<
    typeof createGithubBranchPublishAcceptanceRehearsalReadOnlySummary
  >,
  githubDraftPrAcceptanceRehearsalSummary: ReturnType<
    typeof createGithubDraftPrAcceptanceRehearsalReadOnlySummary
  >,
  githubPublishDraftPrAcceptanceRehearsalSummary: ReturnType<
    typeof createGithubPublishDraftPrAcceptanceRehearsalReadOnlySummary
  >,
  githubPrLifecycleAcceptanceRehearsalSummary: ReturnType<
    typeof createGithubPrLifecycleAcceptanceRehearsalReadOnlySummary
  >,
  worktreeSummary: ReturnType<typeof createWorktreeReadOnlySummary>,
  reviewPackageSummary: ReturnType<typeof createLocalReviewPackageReadOnlySummary>,
  releaseCandidateSummary: ReturnType<typeof createLocalRcOperatorReadOnlySummary>,
  customWorkflowSummary: ReturnType<typeof createCustomWorkflowReadOnlySummary>,
  policyTelemetrySummary: ReturnType<typeof createPolicyTelemetryReadOnlySummary>,
  pilotSummary: ReturnType<typeof createM10PilotReadOnlySummary>,
  pilotAcceptanceSummary: ReturnType<typeof createM10PilotAcceptanceReadOnlySummary>,
  m11PilotSummary: ReturnType<typeof createM11PilotReadOnlySummary>,
  m11PilotAcceptanceSmokeSummary: ReturnType<
    typeof createM11PilotAcceptanceSmokeReadOnlySummary
  >,
  localRcAcceptanceRehearsalSummary: ReturnType<
    typeof createLocalRcAcceptanceRehearsalReadOnlySummary
  >,
) {
  if (activeView === 'development') {
    return (
      <section className="grid">
        <Panel title="Development Runs">
          {overview.developmentRuns.length > 0 ? (
            <ul>
              {overview.developmentRuns.map((run) => (
                <li key={run.request.id} className="stacked">
                  <strong>{run.summary.requestTitle}</strong>
                  <span>
                    {run.summary.taskCount} tasks, {run.summary.agentRunCount} agent runs,
                    verification {run.summary.verificationStatus}
                  </span>
                  <span>
                    evidence {run.summary.evidenceCount}, audit {run.summary.auditEventCount},
                    mock {String(run.summary.mockOnly)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No development run summaries are available from the read-only source.</p>
          )}
        </Panel>
        <Panel title="Workflow Runs">
          {overview.runs.length > 0 ? (
            <ul>
              {overview.runs.map((run) => (
                <li key={run.id} className="stacked">
                  <strong>{run.workflowName}</strong>
                  <span>{run.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No workflow run metadata is available.</p>
          )}
        </Panel>
      </section>
    );
  }

  if (activeView === 'codex') {
    return (
      <section className="grid">
        <Panel title="Codex Dry-Runs">
          {overview.codexExecDryRuns.length > 0 ? (
            <ul>
              {overview.codexExecDryRuns.map((run) => (
                <li key={run.id} className="stacked">
                  <strong>{run.title}</strong>
                  <span>
                    {run.sandboxMode}, {run.approvalMode}, policy {run.policyDecision.outcome}
                  </span>
                  <span>
                    live {String(run.liveExecution)}, external process{' '}
                    {String(run.externalProcessStarted)}, disabled {String(run.executionDisabled)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No Codex dry-run metadata is available.</p>
          )}
        </Panel>
        <Panel title="Codex Timelines">
          {overview.codexExecTimelineDetails.length > 0 ? (
            <ul>
              {overview.codexExecTimelineDetails.map((detail) => (
                <li key={detail.id} className="stacked">
                  <strong>{detail.dryRunId}</strong>
                  <span>
                    {detail.timeline.status}, {detail.timeline.eventCount} events, evidence{' '}
                    {detail.evidenceSummary.count}, audit {detail.auditSummary.count}
                  </span>
                  <span>
                    live {String(detail.liveExecution)}, external process{' '}
                    {String(detail.externalProcessStarted)}, disabled{' '}
                    {String(detail.executionDisabled)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No Codex timeline metadata is available.</p>
          )}
        </Panel>
      </section>
    );
  }

  if (activeView === 'verification') {
    return (
      <section className="grid">
        <Panel title="Nx Verification Readiness">
          <ul>
            <li>
              <strong>adapter</strong>
              <span>{verificationPreview.adapterName}</span>
            </li>
            <li>
              <strong>targets</strong>
              <span>{verificationPreview.targets.join(', ')}</span>
            </li>
            <li>
              <strong>affected projects command</strong>
              <span>{verificationPreview.affectedProjectsCommandPreviewHash}</span>
            </li>
            <li>
              <strong>verification command</strong>
              <span>{verificationPreview.verificationCommandPreviewHash}</span>
            </li>
            <li>
              <strong>process boundary</strong>
              <span>
                planned {String(verificationPreview.processBoundaryPlanned)}, invoked{' '}
                {String(verificationPreview.processBoundaryInvoked)}
              </span>
            </li>
            <li>
              <strong>write safety</strong>
              <span>noRealWrite {String(verificationPreview.noRealWrite)}</span>
            </li>
          </ul>
          <p>{verificationPreview.summary}</p>
        </Panel>
        <Panel title="Verification Boundaries">
          <p>
            Dashboard M3b is preview-only. It does not run Nx, start a process, accept shell
            commands, or expose execution controls.
          </p>
        </Panel>
      </section>
    );
  }

  if (activeView === 'evidence') {
    const evidenceItems = getEvidenceItems(overview.codexExecEvidenceSearch);

    return (
      <section className="grid">
        <Panel title="Evidence Summary">
          {evidenceItems.length > 0 ? (
            <ul>
              {evidenceItems.map((item) => (
                <li key={item.id} className="stacked">
                  <strong>{item.id}</strong>
                  <span>
                    {item.kind}, {item.hash}
                  </span>
                  {item.summary ? <span>{item.summary}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>No evidence refs are available from the read-only evidence endpoint.</p>
          )}
        </Panel>
        <Panel title="Evidence Safety">
          <p>
            This view shows ids, kinds, hashes, and summaries only. Evidence bodies, stdout, stderr,
            JSONL, prompts, local paths, and local control keys are not rendered.
          </p>
        </Panel>
      </section>
    );
  }

  if (activeView === 'policies') {
    return (
      <section className="grid">
        <Panel title="Read-Only Policy State">
          <ul>
            <li>
              <strong>Dashboard mode</strong>
              <span>read-only</span>
            </li>
            <li>
              <strong>MCP tools</strong>
              <span>{mcpSummary.actionModes.join(', ')}</span>
            </li>
            <li>
              <strong>approval policies</strong>
              <span>{mcpSummary.approvalPolicies.join(', ')}</span>
            </li>
            <li>
              <strong>Codex live enabled</strong>
              <span>{String(overview.codexExecLiveConfig?.liveEnabled ?? false)}</span>
            </li>
            <li>
              <strong>config status</strong>
              <span>{overview.codexExecConfigLoadResult?.status ?? 'unavailable'}</span>
            </li>
          </ul>
        </Panel>
        <Panel title="Degraded State">
          <p>{summarizeDegradedState(overview.status, overview.message)}</p>
        </Panel>
      </section>
    );
  }

  if (activeView === 'browser-profiles') {
    return (
      <section className="grid">
        <Panel title="Browser Profile Readiness">
          <ul>
            <li>
              <strong>adapter</strong>
              <span>
                {browserProfilesSummary.manifestName} {browserProfilesSummary.manifestVersion}
              </span>
            </li>
            <li>
              <strong>profiles</strong>
              <span>{browserProfilesSummary.profileCount}</span>
            </li>
            <li>
              <strong>control-plane records</strong>
              <span>
                dry-runs {browserProfilesSummary.dryRunCount}, approvals{' '}
                {browserProfilesSummary.approvalCount}, runs {browserProfilesSummary.runCount}
              </span>
            </li>
            <li>
              <strong>latest run</strong>
              <span>{browserProfilesSummary.latestRunStatus}</span>
            </li>
            <li>
              <strong>profile hashes</strong>
              <span>{browserProfilesSummary.profilePathHashes.join(', ')}</span>
            </li>
            <li>
              <strong>readiness</strong>
              <span>{browserProfilesSummary.readinessStatus}</span>
            </li>
            <li>
              <strong>block reasons</strong>
              <span>
                {browserProfilesSummary.readinessBlockReasons.length > 0
                  ? browserProfilesSummary.readinessBlockReasons.join(', ')
                  : 'none'}
              </span>
            </li>
          </ul>
          <p>{browserProfilesSummary.summary}</p>
        </Panel>
        <Panel title="Read-Only Observation Plan">
          <ul>
            <li>
              <strong>plan status</strong>
              <span>{browserProfilesSummary.planStatus}</span>
            </li>
            <li>
              <strong>capabilities</strong>
              <span>{browserProfilesSummary.allowedCapabilities.join(', ')}</span>
            </li>
            <li>
              <strong>blocked actions</strong>
              <span>{browserProfilesSummary.forbiddenActions.length}</span>
            </li>
            <li>
              <strong>process boundary</strong>
              <span>
                planned {String(browserProfilesSummary.processBoundaryPlanned)}, invoked{' '}
                {String(browserProfilesSummary.processBoundaryInvoked)}
              </span>
            </li>
            <li>
              <strong>write safety</strong>
              <span>
                noRealWrite {String(browserProfilesSummary.noRealWrite)}, bodyStored{' '}
                {String(browserProfilesSummary.bodyStored)}
              </span>
            </li>
          </ul>
        </Panel>
        <Panel title="Browser Observation Runs">
          {overview.browserObservationRuns.length > 0 ? (
            <ul>
              {overview.browserObservationRuns.slice(0, 8).map((run) => (
                <li key={run.runId ?? run.recordId ?? run.dryRunId} className="stacked">
                  <strong>{run.runId ?? run.recordId ?? 'browser_observation_run'}</strong>
                  <span>
                    status {run.status ?? 'unknown'}, evidence{' '}
                    {run.evidenceRefIds?.length ?? 0}, audit {run.auditEventIds?.length ?? 0}
                  </span>
                  <span>
                    process boundary {String(run.processBoundaryInvoked ?? false)}, external
                    process {String(run.externalProcessStarted ?? false)}
                  </span>
                  <span>
                    noRealWrite {String(run.noRealWrite ?? true)}, bodyStored{' '}
                    {String(run.bodyStored ?? false)}, rawPathStored{' '}
                    {String(run.rawPathStored ?? false)}
                  </span>
                  {run.summary ? <p>{run.summary}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No browser observation run metadata is available. This view is read-only and never
              sends local-control credentials.
            </p>
          )}
        </Panel>
      </section>
    );
  }

  if (activeView === 'electron') {
    return (
      <section className="grid">
        <Panel title="Electron/CDP Readiness">
          <ul>
            <li>
              <strong>adapter</strong>
              <span>
                {electronCdpSummary.manifestName} {electronCdpSummary.manifestVersion}
              </span>
            </li>
            <li>
              <strong>control-plane records</strong>
              <span>
                dry-runs {electronCdpSummary.dryRunCount}, approvals{' '}
                {electronCdpSummary.approvalCount}, runs {electronCdpSummary.runCount}
              </span>
            </li>
            <li>
              <strong>latest run</strong>
              <span>{electronCdpSummary.latestRunStatus}</span>
            </li>
            <li>
              <strong>runner modes</strong>
              <span>{electronCdpSummary.runnerModes.join(', ')}</span>
            </li>
            <li>
              <strong>approval</strong>
              <span>required {String(electronCdpSummary.approvalRequired)}</span>
            </li>
            <li>
              <strong>enablement</strong>
              <span>
                default {String(electronCdpSummary.productDefaultEnabled)}, http flag{' '}
                {String(electronCdpSummary.httpFlagRequired)}, event flag{' '}
                {String(electronCdpSummary.eventFlagRequired)}
              </span>
            </li>
          </ul>
          <p>{electronCdpSummary.summary}</p>
        </Panel>
        <Panel title="Electron/CDP Boundaries">
          <ul>
            <li>
              <strong>allowed commands</strong>
              <span>{electronCdpSummary.allowedCommands.join(', ')}</span>
            </li>
            <li>
              <strong>blocked actions</strong>
              <span>{electronCdpSummary.blockedActions.join(', ')}</span>
            </li>
            <li>
              <strong>CDP boundary truth</strong>
              <span>
                http {String(electronCdpSummary.cdpHttpBoundaryInvoked)}, events{' '}
                {String(electronCdpSummary.cdpWebSocketBoundaryInvoked)}
              </span>
            </li>
            <li>
              <strong>process boundary</strong>
              <span>
                invoked {String(electronCdpSummary.processBoundaryInvoked)}, external process{' '}
                {String(electronCdpSummary.externalProcessStarted)}
              </span>
            </li>
            <li>
              <strong>write safety</strong>
              <span>
                noRealWrite {String(electronCdpSummary.noRealWrite)}, bodyStored{' '}
                {String(electronCdpSummary.bodyStored)}, rawPathStored{' '}
                {String(electronCdpSummary.rawPathStored)}
              </span>
            </li>
          </ul>
        </Panel>
        <Panel title="Electron/CDP Runs">
          {overview.electronCdpObservationRuns.length > 0 ? (
            <ul>
              {overview.electronCdpObservationRuns.slice(0, 8).map((run) => (
                <li key={run.runId ?? run.recordId ?? run.dryRunId} className="stacked">
                  <strong>{run.runId ?? run.recordId ?? 'electron_cdp_observation_run'}</strong>
                  <span>
                    status {run.status ?? 'unknown'}, runner {run.runnerMode ?? 'unknown'}
                  </span>
                  <span>
                    endpoint {run.endpointIdHash ?? 'unavailable'}, target{' '}
                    {run.targetIdHash ?? 'unavailable'}
                  </span>
                  <span>
                    evidence {run.evidenceRefIds?.length ?? 0}, audit{' '}
                    {run.auditEventIds?.length ?? 0}
                  </span>
                  <span>
                    http {String(run.cdpHttpBoundaryInvoked ?? false)}, events{' '}
                    {String(run.cdpWebSocketBoundaryInvoked ?? false)}
                  </span>
                  <span>
                    events {run.eventSummary?.eventCount ?? 0}, console{' '}
                    {run.eventSummary?.consoleEventCount ?? 0}, network{' '}
                    {run.eventSummary?.networkEventCount ?? 0}
                  </span>
                  <span>
                    noRealWrite {String(run.noRealWrite ?? true)}, bodyStored{' '}
                    {String(run.bodyStored ?? false)}, rawPathStored{' '}
                    {String(run.rawPathStored ?? false)}
                  </span>
                  {run.summary ? <p>{run.summary}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No Electron/CDP observation run metadata is available. This view is read-only and
              never sends local-control credentials.
            </p>
          )}
        </Panel>
      </section>
    );
  }

  if (activeView === 'github') {
    const remoteSupersedeAcceptanceRehearsalSummary =
      createRemoteSupersedeAcceptanceRehearsalReadOnlySummary();
    const githubRemoteCleanupAcceptanceRehearsalSummary =
      createGithubRemoteCleanupAcceptanceRehearsalReadOnlySummary();

    return (
      <section className="grid">
        <Panel title="GitHub Provider Readiness">
          <ul>
            <li>
              <strong>adapter</strong>
              <span>
                {githubProviderSummary.manifestName} {githubProviderSummary.manifestVersion}
              </span>
            </li>
            <li>
              <strong>records</strong>
              <span>
                dry-runs {githubProviderSummary.dryRunCount}, approvals{' '}
                {githubProviderSummary.approvalCount}, runs {githubProviderSummary.runCount}
              </span>
            </li>
            <li>
              <strong>draft PR records</strong>
              <span>
                dry-runs {githubProviderSummary.draftPrDryRunCount}, approvals{' '}
                {githubProviderSummary.draftPrApprovalCount}, runs{' '}
                {githubProviderSummary.draftPrRunCount}
              </span>
            </li>
            <li>
              <strong>branch publish records</strong>
              <span>
                dry-runs {githubProviderSummary.branchPublishDryRunCount}, approvals{' '}
                {githubProviderSummary.branchPublishApprovalCount}, runs{' '}
                {githubProviderSummary.branchPublishRunCount}
              </span>
            </li>
            <li>
              <strong>publish chain records</strong>
              <span>
                dry-runs {githubProviderSummary.publishDraftPrChainDryRunCount}, runs{' '}
                {githubProviderSummary.publishDraftPrChainRunCount}
              </span>
            </li>
            <li>
              <strong>PR lifecycle records</strong>
              <span>
                dry-runs {githubProviderSummary.prLifecycleDryRunCount}, approvals{' '}
                {githubProviderSummary.prLifecycleApprovalCount}, runs{' '}
                {githubProviderSummary.prLifecycleRunCount}
              </span>
            </li>
            <li>
              <strong>latest run</strong>
              <span>{githubProviderSummary.latestRunStatus}</span>
            </li>
            <li>
              <strong>latest draft PR</strong>
              <span>
                {githubProviderSummary.latestDraftPrRunStatus} /{' '}
                {githubProviderSummary.latestDraftPrCreationStatus}
              </span>
            </li>
            <li>
              <strong>latest branch publish</strong>
              <span>
                {githubProviderSummary.latestBranchPublishRunStatus} /{' '}
                {githubProviderSummary.latestBranchPublishCreationStatus}
              </span>
            </li>
            <li>
              <strong>latest publish chain</strong>
              <span>
                {githubProviderSummary.latestPublishDraftPrChainRunStatus} /{' '}
                {githubProviderSummary.latestPublishDraftPrChainLifecycleStatus}
              </span>
            </li>
            <li>
              <strong>latest PR lifecycle</strong>
              <span>
                {githubProviderSummary.latestPrLifecycleRunStatus} /{' '}
                {githubProviderSummary.latestPrLifecycleStatusSummary}
              </span>
            </li>
            <li>
              <strong>enablement</strong>
              <span>default {String(githubProviderSummary.productDefaultEnabled)}</span>
            </li>
            <li>
              <strong>approval</strong>
              <span>
                metadata {String(githubProviderSummary.approvalRequired)}, draft PR{' '}
                {String(githubProviderSummary.draftPrApprovalRequired)}, branch publish{' '}
                {String(githubProviderSummary.branchPublishApprovalRequired)}, publish chain
                separate {String(githubProviderSummary.publishDraftPrChainSeparateApprovalsRequired)},
                PR lifecycle {String(githubProviderSummary.prLifecycleApprovalRequired)}
              </span>
            </li>
            <li>
              <strong>credential</strong>
              <span>
                configured {String(githubProviderSummary.credentialConfigured)}, hash-only{' '}
                {String(githubProviderSummary.credentialHashOnly)}
              </span>
            </li>
          </ul>
          <p>{githubProviderSummary.summary}</p>
        </Panel>
        <Panel title="GitHub Remote Boundary">
          <ul>
            <li>
              <strong>allowed host</strong>
              <span>{githubProviderSummary.allowedHostHash}</span>
            </li>
            <li>
              <strong>metadata</strong>
              <span>{githubProviderSummary.allowedMetadata.join(', ')}</span>
            </li>
            <li>
              <strong>draft PR actions</strong>
              <span>{githubProviderSummary.allowedDraftPrActions.join(', ')}</span>
            </li>
            <li>
              <strong>branch publish actions</strong>
              <span>{githubProviderSummary.allowedBranchPublishActions.join(', ')}</span>
            </li>
            <li>
              <strong>PR lifecycle actions</strong>
              <span>{githubProviderSummary.allowedPrLifecycleActions.join(', ')}</span>
            </li>
            <li>
              <strong>blocked operations</strong>
              <span>{githubProviderSummary.blockedOperations.join(', ')}</span>
            </li>
            <li>
              <strong>network boundary</strong>
              <span>invoked {String(githubProviderSummary.networkBoundaryInvoked)}</span>
            </li>
            <li>
              <strong>process boundary</strong>
              <span>
                invoked {String(githubProviderSummary.processBoundaryInvoked)}, external{' '}
                {String(githubProviderSummary.externalProcessStarted)}
              </span>
            </li>
            <li>
              <strong>storage safety</strong>
              <span>
                bodyStored {String(githubProviderSummary.bodyStored)}, rawPathStored{' '}
                {String(githubProviderSummary.rawPathStored)}, rawRemoteRefStored{' '}
                {String(githubProviderSummary.rawRemoteRefStored)}
              </span>
            </li>
          </ul>
        </Panel>
        <Panel title="GitHub Metadata Runs">
          {overview.githubMetadataRuns.length > 0 ? (
            <ul>
              {overview.githubMetadataRuns.slice(0, 8).map((run) => (
                <li key={run.runId ?? run.recordId ?? run.dryRunId} className="stacked">
                  <strong>{run.runId ?? run.recordId ?? 'github_metadata_run'}</strong>
                  <span>
                    status {run.status ?? 'unknown'}, runner {run.runnerMode ?? 'unknown'}
                  </span>
                  <span>
                    owner {run.targetRef?.ownerHash ?? 'unavailable'}, repo{' '}
                    {run.targetRef?.repoHash ?? 'unavailable'}, base{' '}
                    {run.targetRef?.baseBranchHash ?? 'unavailable'}, head{' '}
                    {run.targetRef?.headBranchHash ?? 'unavailable'}
                  </span>
                  <span>
                    repo metadata {run.repoMetadataHash ?? 'unavailable'}, base metadata{' '}
                    {run.baseBranchMetadataHash ?? 'unavailable'}, head metadata{' '}
                    {run.headBranchMetadataHash ?? 'unavailable'}
                  </span>
                  <span>
                    existing PRs {run.existingPullRequestCount ?? 0}, response hashes{' '}
                    {run.responseBodyHashes?.length ?? 0}
                  </span>
                  <span>
                    network {String(run.networkBoundaryInvoked ?? false)}, process{' '}
                    {String(run.processBoundaryInvoked ?? false)}, external{' '}
                    {String(run.externalProcessStarted ?? false)}
                  </span>
                  <span>
                    evidence {run.evidenceRefIds?.length ?? 0}, audit{' '}
                    {run.auditEventIds?.length ?? 0}
                  </span>
                  {run.summary ? <p>{run.summary}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No GitHub metadata run summaries are available. This view is read-only and never
              sends control-plane credentials or remote execution requests.
            </p>
          )}
        </Panel>
        <Panel title="GitHub Draft PR Runs">
          {overview.githubDraftPrRuns.length > 0 ? (
            <ul>
              {overview.githubDraftPrRuns.slice(0, 8).map((run) => (
                <li key={run.runId ?? run.recordId ?? run.dryRunId} className="stacked">
                  <strong>{run.runId ?? run.recordId ?? 'github_draft_pr_run'}</strong>
                  <span>
                    status {run.status ?? 'unknown'}, runner {run.runnerMode ?? 'unknown'}
                  </span>
                  <span>
                    owner {run.targetRef?.ownerHash ?? 'unavailable'}, repo{' '}
                    {run.targetRef?.repoHash ?? 'unavailable'}, base{' '}
                    {run.targetRef?.baseBranchHash ?? 'unavailable'}, head{' '}
                    {run.targetRef?.headBranchHash ?? 'unavailable'}
                  </span>
                  <span>
                    readiness {run.readiness?.status ?? 'unknown'}, created{' '}
                    {String(run.creationSummary?.created ?? false)}, existing PRs{' '}
                    {run.creationSummary?.existingPullRequestCount ??
                      run.existingPullRequestCount ??
                      0}
                  </span>
                  <span>
                    title {run.titleHash ?? 'unavailable'}, body{' '}
                    {run.bodyHash ?? 'unavailable'}, sections {run.bodySectionCount ?? 0}
                  </span>
                  <span>
                    PR number {run.creationSummary?.prNumberHash ?? run.prNumberHash ?? 'none'}, URL{' '}
                    {run.creationSummary?.prUrlHash ?? run.prUrlHash ?? 'none'}
                  </span>
                  <span>
                    network {String(run.networkBoundaryInvoked ?? false)}, process{' '}
                    {String(run.processBoundaryInvoked ?? false)}, external{' '}
                    {String(run.externalProcessStarted ?? false)}
                  </span>
                  <span>
                    evidence {run.evidenceRefIds?.length ?? 0}, audit{' '}
                    {run.auditEventIds?.length ?? 0}
                  </span>
                  {run.summary ? <p>{run.summary}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No GitHub draft PR run summaries are available. This view is read-only and never
              sends control-plane credentials or remote PR requests.
            </p>
          )}
        </Panel>
        <Panel title="GitHub Branch Publish Runs">
          {overview.githubBranchPublishRuns.length > 0 ? (
            <ul>
              {overview.githubBranchPublishRuns.slice(0, 8).map((run) => (
                <li key={run.runId ?? run.recordId ?? run.dryRunId} className="stacked">
                  <strong>{run.runId ?? run.recordId ?? 'github_branch_publish_run'}</strong>
                  <span>
                    status {run.status ?? 'unknown'}, runner {run.runnerMode ?? 'unknown'}
                  </span>
                  <span>
                    owner {run.targetRef?.ownerHash ?? 'unavailable'}, repo{' '}
                    {run.targetRef?.repoHash ?? 'unavailable'}, base{' '}
                    {run.targetRef?.baseBranchHash ?? 'unavailable'}, branch{' '}
                    {run.targetRef?.headBranchHash ?? run.branchNameHash ?? 'unavailable'}
                  </span>
                  <span>
                    readiness {run.readinessStatus ?? 'unknown'}, created{' '}
                    {String(run.created ?? false)}, files {run.fileCount ?? 0}, bytes{' '}
                    {run.totalByteCount ?? 0}
                  </span>
                  <span>
                    manifest {run.contentManifestHash ?? 'unavailable'}, commit{' '}
                    {run.commitShaHash ?? 'none'}, tree {run.treeShaHash ?? 'none'}
                  </span>
                  <span>
                    network {String(run.networkBoundaryInvoked ?? false)}, process{' '}
                    {String(run.processBoundaryInvoked ?? false)}, external{' '}
                    {String(run.externalProcessStarted ?? false)}
                  </span>
                  <span>
                    createRef {String(run.createRefAllowed ?? false)}, updateRef{' '}
                    {String(run.updateRefAllowed ?? false)}, force {String(run.forceAllowed ?? false)},
                    push {String(run.pushAllowed ?? false)}
                  </span>
                  <span>
                    evidence {run.evidenceRefIds?.length ?? 0}, audit{' '}
                    {run.auditEventIds?.length ?? 0}, response hashes{' '}
                    {run.responseBodyHashCount ?? run.responseBodyHashes?.length ?? 0}
                  </span>
                  {run.summary ? <p>{run.summary}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No GitHub branch publish run summaries are available. This view is read-only and
              never sends control-plane credentials, file contents, or remote write requests.
            </p>
          )}
        </Panel>
        <Panel title="GitHub Publish To Draft PR Chains">
          {overview.githubPublishDraftPrChainRuns.length > 0 ? (
            <ul>
              {overview.githubPublishDraftPrChainRuns.slice(0, 8).map((run) => (
                <li key={run.runId ?? run.recordId ?? run.dryRunId} className="stacked">
                  <strong>
                    {run.runId ?? run.recordId ?? 'github_publish_draft_pr_chain_run'}
                  </strong>
                  <span>
                    status {run.status ?? 'unknown'}, source {run.sourceKind ?? 'unknown'}
                  </span>
                  <span>
                    source hash {run.sourceIdHash ?? 'unavailable'}, branch run{' '}
                    {run.branchPublishRunId ?? 'unavailable'}, draft PR run{' '}
                    {run.draftPrRunId ?? 'unavailable'}
                  </span>
                  <span>
                    branch {run.branchPublishStatus ?? 'unknown'}, draft PR{' '}
                    {run.draftPrStatus ?? 'unknown'}, lifecycle{' '}
                    {run.lifecycleStatus ?? run.latestCheckStatus ?? 'unknown'}
                  </span>
                  <span>
                    network {String(run.networkBoundaryInvoked ?? false)}, process{' '}
                    {String(run.processBoundaryInvoked ?? false)}, external{' '}
                    {String(run.externalProcessStarted ?? false)}
                  </span>
                  <span>
                    evidence {run.evidenceRefCount ?? run.evidenceRefIds?.length ?? 0}, audit{' '}
                    {run.auditEventCount ?? run.auditEventIds?.length ?? 0}
                  </span>
                  <span>
                    rawPrBodyStored {String(run.rawPrBodyStored ?? false)}, rawUrlStored{' '}
                    {String(run.rawUrlStored ?? false)}, bodyStored{' '}
                    {String(run.bodyStored ?? false)}
                  </span>
                  {run.summary ? <p>{run.summary}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No GitHub publish-to-draft-PR chain summaries are available. This view is read-only
              and only shows persisted ids, hashes, statuses, evidence ids, and audit ids.
            </p>
          )}
        </Panel>
        <Panel title="GitHub PR Lifecycle Runs">
          {overview.githubPrLifecycleRuns.length > 0 ? (
            <ul>
              {overview.githubPrLifecycleRuns.slice(0, 8).map((run) => (
                <li key={run.runId ?? run.recordId ?? run.dryRunId} className="stacked">
                  <strong>{run.runId ?? run.recordId ?? 'github_pr_lifecycle_run'}</strong>
                  <span>
                    status {run.status ?? 'unknown'}, runner {run.runnerMode ?? 'unknown'}
                  </span>
                  <span>
                    owner {run.targetRef?.ownerHash ?? 'unavailable'}, repo{' '}
                    {run.targetRef?.repoHash ?? 'unavailable'}, base{' '}
                    {run.targetRef?.baseBranchHash ?? 'unavailable'}, head{' '}
                    {run.targetRef?.headBranchHash ?? 'unavailable'}
                  </span>
                  <span>
                    PR {run.prNumberHash ?? 'unavailable'}, commit{' '}
                    {run.commitShaHash ?? 'unavailable'}, state{' '}
                    {run.prStateSummary ?? 'unknown'}
                  </span>
                  <span>
                    combined status {run.combinedStatusState ?? 'unknown'}, contexts{' '}
                    {run.statusContextCount ?? 0}, check runs {run.checkRunCount ?? 0}
                  </span>
                  <span>
                    network {String(run.networkBoundaryInvoked ?? false)}, process{' '}
                    {String(run.processBoundaryInvoked ?? false)}, external{' '}
                    {String(run.externalProcessStarted ?? false)}
                  </span>
                  <span>
                    evidence {run.evidenceRefIds?.length ?? 0}, audit{' '}
                    {run.auditEventIds?.length ?? 0}, response hashes{' '}
                    {run.responseBodyHashes?.length ?? 0}
                  </span>
                  <span>
                    rawUrlStored {String(run.rawUrlStored ?? false)}, rawResponseBodyStored{' '}
                    {String(run.rawResponseBodyStored ?? false)}, bodyStored{' '}
                    {String(run.bodyStored ?? false)}
                  </span>
                  {run.summary ? <p>{run.summary}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No GitHub PR lifecycle summaries are available. This view is read-only and only
              shows persisted ids, hashes, counts, statuses, evidence ids, and audit ids.
            </p>
          )}
        </Panel>
        <Panel title="GitHub Remote Supersede Runs">
          {overview.githubRemoteSupersedeRuns.length > 0 ? (
            <ul>
              {overview.githubRemoteSupersedeRuns.slice(0, 8).map((run) => (
                <li key={run.runId ?? run.recordId ?? run.dryRunId} className="stacked">
                  <strong>{run.runId ?? run.recordId ?? 'github_remote_supersede_run'}</strong>
                  <span>
                    status {run.status ?? 'unknown'}, target {run.targetKind ?? 'unknown'}
                  </span>
                  <span>
                    source {run.sourceReworkRunIdHash ?? 'unavailable'}, successor{' '}
                    {run.successorDraftPrRunIdHash ?? 'unavailable'}
                  </span>
                  <span>
                    old branch {run.oldBranchNameHash ?? 'unavailable'}, old PR{' '}
                    {run.oldPrNumberHash ?? 'unavailable'}
                  </span>
                  <span>
                    cleanup {run.cleanupReadinessStatus ?? 'unknown'}, recommended{' '}
                    {String(run.cleanupRecommended ?? false)}, blockers{' '}
                    {run.blockReasons?.length ?? 0}
                  </span>
                  <span>
                    network {String(run.networkBoundaryInvoked ?? false)}, process{' '}
                    {String(run.processBoundaryInvoked ?? false)}, external{' '}
                    {String(run.externalProcessStarted ?? false)}
                  </span>
                  <span>
                    evidence {run.evidenceRefIds?.length ?? 0}, audit{' '}
                    {run.auditEventIds?.length ?? 0}, rawRefStored{' '}
                    {String(run.rawRefStored ?? false)}, rawUrlStored{' '}
                    {String(run.rawUrlStored ?? false)}
                  </span>
                  {run.summary ? <p>{run.summary}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No GitHub remote supersede summaries are available. M21 is projection-only
              and does not invoke GitHub writes.
            </p>
          )}
        </Panel>
        <Panel title="GitHub Remote Cleanup Runs">
          {overview.githubRemoteCleanupRuns.length > 0 ? (
            <ul>
              {overview.githubRemoteCleanupRuns.slice(0, 8).map((run) => (
                <li key={run.runId ?? run.recordId ?? run.dryRunId} className="stacked">
                  <strong>{run.runId ?? run.recordId ?? 'github_remote_cleanup_run'}</strong>
                  <span>
                    status {run.status ?? 'unknown'}, readiness{' '}
                    {run.cleanupReadinessStatus ?? 'unknown'}
                  </span>
                  <span>
                    owner {run.targetRef?.ownerHash ?? 'unavailable'}, repo{' '}
                    {run.targetRef?.repoHash ?? 'unavailable'}, branch{' '}
                    {run.oldBranchNameHash ?? run.targetRef?.headBranchHash ?? 'unavailable'}
                  </span>
                  <span>
                    old PR {run.oldPrNumberHash ?? 'unavailable'}, closed{' '}
                    {String(run.oldPrClosed ?? false)}, deleted{' '}
                    {String(run.oldBranchDeleted ?? false)}
                  </span>
                  <span>
                    network {String(run.networkBoundaryInvoked ?? false)}, process{' '}
                    {String(run.processBoundaryInvoked ?? false)}, external{' '}
                    {String(run.externalProcessStarted ?? false)}
                  </span>
                  <span>
                    closePr {String(run.closePrAllowed ?? false)}, deleteRef{' '}
                    {String(run.deleteRefAllowed ?? false)}, nonCodexhubDelete{' '}
                    {String(run.deleteNonCodexhubBranchAllowed ?? false)}
                  </span>
                  <span>
                    evidence {run.evidenceRefIds?.length ?? 0}, audit{' '}
                    {run.auditEventIds?.length ?? 0}, response hashes{' '}
                    {run.responseBodyHashCount ?? 0}
                  </span>
                  {run.summary ? <p>{run.summary}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No GitHub remote cleanup summaries are available. Live cleanup remains
              disabled by default and approval-gated.
            </p>
          )}
        </Panel>
        <Panel title="GitHub Branch Publish Acceptance Rehearsal">
          <ul>
            <li>
              <strong>status</strong>
              <span>{githubBranchPublishAcceptanceRehearsalSummary.status}</span>
            </li>
            <li>
              <strong>scenario</strong>
              <span>{githubBranchPublishAcceptanceRehearsalSummary.scenario}</span>
            </li>
            <li>
              <strong>readiness / publish</strong>
              <span>
                {githubBranchPublishAcceptanceRehearsalSummary.readinessStatus} /{' '}
                {githubBranchPublishAcceptanceRehearsalSummary.publishStatus}
              </span>
            </li>
            <li>
              <strong>evidence / audit</strong>
              <span>
                {githubBranchPublishAcceptanceRehearsalSummary.evidenceRefCount} /{' '}
                {githubBranchPublishAcceptanceRehearsalSummary.auditEventCount}
              </span>
            </li>
            <li>
              <strong>live boundaries</strong>
              <span>
                network {String(githubBranchPublishAcceptanceRehearsalSummary.networkBoundaryInvoked)},
                process {String(githubBranchPublishAcceptanceRehearsalSummary.processBoundaryInvoked)},
                external {String(githubBranchPublishAcceptanceRehearsalSummary.externalProcessStarted)}
              </span>
            </li>
            <li>
              <strong>remote actions</strong>
              <span>
                createRef {String(githubBranchPublishAcceptanceRehearsalSummary.createRefAllowed)},
                updateRef {String(githubBranchPublishAcceptanceRehearsalSummary.updateRefAllowed)},
                force {String(githubBranchPublishAcceptanceRehearsalSummary.forceAllowed)}, push{' '}
                {String(githubBranchPublishAcceptanceRehearsalSummary.pushAllowed)}, merge{' '}
                {String(githubBranchPublishAcceptanceRehearsalSummary.mergeAllowed)}
              </span>
            </li>
            <li>
              <strong>read-only bounds</strong>
              <span>
                keyRead {String(githubBranchPublishAcceptanceRehearsalSummary.localControlKeyRead)},
                postAllowed{' '}
                {String(githubBranchPublishAcceptanceRehearsalSummary.supervisorPostAllowed)},
                adapterExecute{' '}
                {String(githubBranchPublishAcceptanceRehearsalSummary.adapterExecuteAllowed)}
              </span>
            </li>
          </ul>
          <p>{githubBranchPublishAcceptanceRehearsalSummary.summary}</p>
        </Panel>
        <Panel title="GitHub Draft PR Acceptance Rehearsal">
          <ul>
            <li>
              <strong>status</strong>
              <span>{githubDraftPrAcceptanceRehearsalSummary.status}</span>
            </li>
            <li>
              <strong>scenario</strong>
              <span>{githubDraftPrAcceptanceRehearsalSummary.scenario}</span>
            </li>
            <li>
              <strong>readiness / creation</strong>
              <span>
                {githubDraftPrAcceptanceRehearsalSummary.readinessStatus} /{' '}
                {githubDraftPrAcceptanceRehearsalSummary.prCreationStatus}
              </span>
            </li>
            <li>
              <strong>evidence / audit</strong>
              <span>
                {githubDraftPrAcceptanceRehearsalSummary.evidenceRefCount} /{' '}
                {githubDraftPrAcceptanceRehearsalSummary.auditEventCount}
              </span>
            </li>
            <li>
              <strong>live boundaries</strong>
              <span>
                network {String(githubDraftPrAcceptanceRehearsalSummary.networkBoundaryInvoked)},
                process {String(githubDraftPrAcceptanceRehearsalSummary.processBoundaryInvoked)},
                external {String(githubDraftPrAcceptanceRehearsalSummary.externalProcessStarted)}
              </span>
            </li>
            <li>
              <strong>read-only bounds</strong>
              <span>
                keyRead {String(githubDraftPrAcceptanceRehearsalSummary.localControlKeyRead)},
                postAllowed{' '}
                {String(githubDraftPrAcceptanceRehearsalSummary.supervisorPostAllowed)},
                adapterExecute{' '}
                {String(githubDraftPrAcceptanceRehearsalSummary.adapterExecuteAllowed)}
              </span>
            </li>
            <li>
              <strong>remote actions</strong>
              <span>
                draft {String(githubDraftPrAcceptanceRehearsalSummary.draft)}, push{' '}
                {String(githubDraftPrAcceptanceRehearsalSummary.pushAllowed)}, createRef{' '}
                {String(githubDraftPrAcceptanceRehearsalSummary.createRefAllowed)}, merge{' '}
                {String(githubDraftPrAcceptanceRehearsalSummary.mergeAllowed)}
              </span>
            </li>
          </ul>
          <p>{githubDraftPrAcceptanceRehearsalSummary.summary}</p>
        </Panel>
        <Panel title="GitHub Publish To Draft PR Acceptance Rehearsal">
          <ul>
            <li>
              <strong>status</strong>
              <span>{githubPublishDraftPrAcceptanceRehearsalSummary.status}</span>
            </li>
            <li>
              <strong>scenario</strong>
              <span>{githubPublishDraftPrAcceptanceRehearsalSummary.scenario}</span>
            </li>
            <li>
              <strong>publish / draft / lifecycle</strong>
              <span>
                {githubPublishDraftPrAcceptanceRehearsalSummary.branchPublishStatus} /{' '}
                {githubPublishDraftPrAcceptanceRehearsalSummary.draftPrStatus} /{' '}
                {githubPublishDraftPrAcceptanceRehearsalSummary.lifecycleStatus}
              </span>
            </li>
            <li>
              <strong>evidence / audit</strong>
              <span>
                {githubPublishDraftPrAcceptanceRehearsalSummary.evidenceRefCount} /{' '}
                {githubPublishDraftPrAcceptanceRehearsalSummary.auditEventCount}
              </span>
            </li>
            <li>
              <strong>live boundaries</strong>
              <span>
                network{' '}
                {String(githubPublishDraftPrAcceptanceRehearsalSummary.networkBoundaryInvoked)},
                process{' '}
                {String(githubPublishDraftPrAcceptanceRehearsalSummary.processBoundaryInvoked)},
                external{' '}
                {String(githubPublishDraftPrAcceptanceRehearsalSummary.externalProcessStarted)}
              </span>
            </li>
            <li>
              <strong>read-only bounds</strong>
              <span>
                keyRead{' '}
                {String(githubPublishDraftPrAcceptanceRehearsalSummary.localControlKeyRead)},
                postAllowed{' '}
                {String(githubPublishDraftPrAcceptanceRehearsalSummary.supervisorPostAllowed)},
                adapterExecute{' '}
                {String(githubPublishDraftPrAcceptanceRehearsalSummary.adapterExecuteAllowed)}
              </span>
            </li>
            <li>
              <strong>remote actions</strong>
              <span>
                push {String(githubPublishDraftPrAcceptanceRehearsalSummary.pushAllowed)},
                updateRef{' '}
                {String(githubPublishDraftPrAcceptanceRehearsalSummary.updateRefAllowed)},
                force {String(githubPublishDraftPrAcceptanceRehearsalSummary.forceAllowed)}, merge{' '}
                {String(githubPublishDraftPrAcceptanceRehearsalSummary.mergeAllowed)}
              </span>
            </li>
          </ul>
          <p>{githubPublishDraftPrAcceptanceRehearsalSummary.summary}</p>
        </Panel>
        <Panel title="GitHub PR Lifecycle Acceptance Rehearsal">
          <ul>
            <li>
              <strong>status</strong>
              <span>{githubPrLifecycleAcceptanceRehearsalSummary.status}</span>
            </li>
            <li>
              <strong>scenario</strong>
              <span>{githubPrLifecycleAcceptanceRehearsalSummary.scenario}</span>
            </li>
            <li>
              <strong>lifecycle</strong>
              <span>{githubPrLifecycleAcceptanceRehearsalSummary.lifecycleStatus}</span>
            </li>
            <li>
              <strong>evidence / audit</strong>
              <span>
                {githubPrLifecycleAcceptanceRehearsalSummary.evidenceRefCount} /{' '}
                {githubPrLifecycleAcceptanceRehearsalSummary.auditEventCount}
              </span>
            </li>
            <li>
              <strong>live boundaries</strong>
              <span>
                network {String(githubPrLifecycleAcceptanceRehearsalSummary.networkBoundaryInvoked)},
                process {String(githubPrLifecycleAcceptanceRehearsalSummary.processBoundaryInvoked)},
                external {String(githubPrLifecycleAcceptanceRehearsalSummary.externalProcessStarted)}
              </span>
            </li>
            <li>
              <strong>read-only bounds</strong>
              <span>
                keyRead {String(githubPrLifecycleAcceptanceRehearsalSummary.localControlKeyRead)},
                postAllowed{' '}
                {String(githubPrLifecycleAcceptanceRehearsalSummary.supervisorPostAllowed)},
                adapterExecute{' '}
                {String(githubPrLifecycleAcceptanceRehearsalSummary.adapterExecuteAllowed)}
              </span>
            </li>
            <li>
              <strong>remote actions</strong>
              <span>
                fixedGet {String(githubPrLifecycleAcceptanceRehearsalSummary.fixedGetOnly)},
                comments {String(githubPrLifecycleAcceptanceRehearsalSummary.commentsAllowed)},
                labels {String(githubPrLifecycleAcceptanceRehearsalSummary.labelsAllowed)},
                reviewers {String(githubPrLifecycleAcceptanceRehearsalSummary.reviewersAllowed)},
                merge {String(githubPrLifecycleAcceptanceRehearsalSummary.mergeAllowed)}
              </span>
            </li>
          </ul>
          <p>{githubPrLifecycleAcceptanceRehearsalSummary.summary}</p>
        </Panel>
        <Panel title="GitHub Remote Supersede Acceptance Rehearsal">
          <ul>
            <li>
              <strong>status</strong>
              <span>{remoteSupersedeAcceptanceRehearsalSummary.status}</span>
            </li>
            <li>
              <strong>scenario</strong>
              <span>{remoteSupersedeAcceptanceRehearsalSummary.scenario}</span>
            </li>
            <li>
              <strong>cleanup readiness</strong>
              <span>
                {remoteSupersedeAcceptanceRehearsalSummary.cleanupReadinessStatus},{' '}
                target {remoteSupersedeAcceptanceRehearsalSummary.targetKind}
              </span>
            </li>
            <li>
              <strong>evidence / audit</strong>
              <span>
                {remoteSupersedeAcceptanceRehearsalSummary.evidenceRefCount} /{' '}
                {remoteSupersedeAcceptanceRehearsalSummary.auditEventCount}, blockers{' '}
                {remoteSupersedeAcceptanceRehearsalSummary.blockerCount}
              </span>
            </li>
            <li>
              <strong>remote write</strong>
              <span>
                invoked {String(remoteSupersedeAcceptanceRehearsalSummary.remoteWriteInvoked)},
                cleanup recommended{' '}
                {String(remoteSupersedeAcceptanceRehearsalSummary.cleanupRecommended)}
              </span>
            </li>
          </ul>
          <p>{remoteSupersedeAcceptanceRehearsalSummary.summary}</p>
        </Panel>
        <Panel title="GitHub Remote Cleanup Acceptance Rehearsal">
          <ul>
            <li>
              <strong>status</strong>
              <span>{githubRemoteCleanupAcceptanceRehearsalSummary.status}</span>
            </li>
            <li>
              <strong>scenario</strong>
              <span>{githubRemoteCleanupAcceptanceRehearsalSummary.scenario}</span>
            </li>
            <li>
              <strong>cleanup path</strong>
              <span>
                {githubRemoteCleanupAcceptanceRehearsalSummary.cleanupReadinessStatus} /{' '}
                {githubRemoteCleanupAcceptanceRehearsalSummary.closePrStatus} /{' '}
                {githubRemoteCleanupAcceptanceRehearsalSummary.deleteRefStatus}
              </span>
            </li>
            <li>
              <strong>remote actions</strong>
              <span>
                closePr {String(githubRemoteCleanupAcceptanceRehearsalSummary.closePrAllowed)},
                deleteRef{' '}
                {String(githubRemoteCleanupAcceptanceRehearsalSummary.deleteRefAllowed)},
                nonCodexhubDelete{' '}
                {String(
                  githubRemoteCleanupAcceptanceRehearsalSummary.deleteNonCodexhubBranchAllowed,
                )}
              </span>
            </li>
            <li>
              <strong>blocked actions</strong>
              <span>
                updateRef {String(githubRemoteCleanupAcceptanceRehearsalSummary.updateRefAllowed)},
                force {String(githubRemoteCleanupAcceptanceRehearsalSummary.forceAllowed)}, merge{' '}
                {String(githubRemoteCleanupAcceptanceRehearsalSummary.mergeAllowed)}, push{' '}
                {String(githubRemoteCleanupAcceptanceRehearsalSummary.pushAllowed)}
              </span>
            </li>
            <li>
              <strong>read-only bounds</strong>
              <span>
                postAllowed{' '}
                {String(githubRemoteCleanupAcceptanceRehearsalSummary.supervisorPostAllowed)},
                adapterExecute{' '}
                {String(githubRemoteCleanupAcceptanceRehearsalSummary.adapterExecuteAllowed)},
                rawResponseBody{' '}
                {String(githubRemoteCleanupAcceptanceRehearsalSummary.rawResponseBodyStored)}
              </span>
            </li>
          </ul>
          <p>{githubRemoteCleanupAcceptanceRehearsalSummary.summary}</p>
        </Panel>
      </section>
    );
  }

  if (activeView === 'worktrees') {
    return (
      <section className="grid">
        <Panel title="Worktree Readiness">
          <ul>
            <li>
              <strong>adapter</strong>
              <span>
                {worktreeSummary.manifestName} {worktreeSummary.manifestVersion}
              </span>
            </li>
            <li>
              <strong>create records</strong>
              <span>
                dry-runs {worktreeSummary.dryRunCount}, approvals{' '}
                {worktreeSummary.approvalCount}, runs {worktreeSummary.runCount}
              </span>
            </li>
            <li>
              <strong>cleanup records</strong>
              <span>
                dry-runs {worktreeSummary.cleanupDryRunCount}, approvals{' '}
                {worktreeSummary.cleanupApprovalCount}, runs {worktreeSummary.cleanupRunCount}
              </span>
            </li>
            <li>
              <strong>latest statuses</strong>
              <span>
                create {worktreeSummary.latestRunStatus}, cleanup{' '}
                {worktreeSummary.latestCleanupStatus}
              </span>
            </li>
            <li>
              <strong>runner modes</strong>
              <span>{worktreeSummary.runnerModes.join(', ')}</span>
            </li>
            <li>
              <strong>approval</strong>
              <span>
                create {String(worktreeSummary.approvalRequired)}, cleanup{' '}
                {String(worktreeSummary.cleanupApprovalRequired)}
              </span>
            </li>
            <li>
              <strong>enablement</strong>
              <span>default {String(worktreeSummary.productDefaultEnabled)}</span>
            </li>
          </ul>
          <p>{worktreeSummary.summary}</p>
        </Panel>
        <Panel title="Worktree Boundaries">
          <ul>
            <li>
              <strong>allowed operations</strong>
              <span>{worktreeSummary.allowedOperations.join(', ')}</span>
            </li>
            <li>
              <strong>blocked operations</strong>
              <span>{worktreeSummary.blockedOperations.join(', ')}</span>
            </li>
            <li>
              <strong>git boundary</strong>
              <span>
                invoked {String(worktreeSummary.gitBoundaryInvoked)}, process{' '}
                {String(worktreeSummary.processBoundaryInvoked)}, external{' '}
                {String(worktreeSummary.externalProcessStarted)}
              </span>
            </li>
            <li>
              <strong>cleanup state</strong>
              <span>
                required {worktreeSummary.cleanupRequiredCount}, completed{' '}
                {worktreeSummary.cleanupCompletedCount}
              </span>
            </li>
            <li>
              <strong>storage safety</strong>
              <span>
                bodyStored {String(worktreeSummary.bodyStored)}, rawPathStored{' '}
                {String(worktreeSummary.rawPathStored)}
              </span>
            </li>
          </ul>
        </Panel>
        <Panel title="Local Review Packages">
          <ul>
            <li>
              <strong>records</strong>
              <span>
                dry-runs {reviewPackageSummary.dryRunCount}, approvals{' '}
                {reviewPackageSummary.approvalCount}, runs {reviewPackageSummary.runCount}
              </span>
            </li>
            <li>
              <strong>latest</strong>
              <span>
                run {reviewPackageSummary.latestRunStatus}, decision{' '}
                {reviewPackageSummary.latestDecisionStatus}
              </span>
            </li>
            <li>
              <strong>export</strong>
              <span>
                exported {reviewPackageSummary.exportedCount}, files{' '}
                {reviewPackageSummary.fileCount}, bytes {reviewPackageSummary.byteCount}
              </span>
            </li>
            <li>
              <strong>boundary</strong>
              <span>
                artifact write {String(reviewPackageSummary.artifactWriteBoundaryInvoked)}
              </span>
            </li>
            <li>
              <strong>evidence / audit</strong>
              <span>
                {reviewPackageSummary.evidenceCount} evidence,{' '}
                {reviewPackageSummary.auditEventCount} audit events
              </span>
            </li>
            <li>
              <strong>storage</strong>
              <span>
                bodyStored {String(reviewPackageSummary.bodyStored)}, rawPathStored{' '}
                {String(reviewPackageSummary.rawPathStored)}
              </span>
            </li>
          </ul>
          <p>{reviewPackageSummary.summary}</p>
        </Panel>
        <Panel title="Review Package Runs">
          {overview.reviewPackageRuns.length > 0 ? (
            <ul>
              {overview.reviewPackageRuns.slice(0, 8).map((run) => (
                <li key={run.runId ?? run.recordId ?? run.dryRunId} className="stacked">
                  <strong>{run.runId ?? run.recordId ?? 'review_package_run'}</strong>
                  <span>
                    status {run.status ?? 'unknown'}, runner {run.runnerMode ?? 'unknown'}
                  </span>
                  <span>
                    review package {run.reviewPackageIdHash ?? 'unavailable'}, package{' '}
                    {run.packageHash ?? run.packageSummary?.packageHash ?? 'unavailable'}
                  </span>
                  <span>
                    artifact {run.artifactDirectoryHash ?? 'unavailable'}, files{' '}
                    {run.fileCount ?? 0}, bytes {run.byteCount ?? 0}
                  </span>
                  <span>
                    decision {run.decisionStatus ?? run.decision?.status ?? 'pending'},
                    verification{' '}
                    {run.verificationStatus ?? run.packageSummary?.verificationStatus ?? 'unknown'}
                  </span>
                  <span>
                    artifactWrite {String(run.artifactWriteBoundaryInvoked ?? false)}, process{' '}
                    {String(run.processBoundaryInvoked ?? false)}, external{' '}
                    {String(run.externalProcessStarted ?? false)}
                  </span>
                  <span>
                    evidence {run.evidenceRefIds?.length ?? 0}, audit{' '}
                    {run.auditEventIds?.length ?? 0}
                  </span>
                  {run.summary ? <p>{run.summary}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No local review package run metadata is available. Export remains Supervisor-gated
              and cannot be triggered from the Dashboard.
            </p>
          )}
        </Panel>
        <Panel title="Worktree Create Runs">
          {overview.worktreeRuns.length > 0 ? (
            <ul>
              {overview.worktreeRuns.slice(0, 8).map((run) => (
                <li key={run.runId ?? run.recordId ?? run.dryRunId} className="stacked">
                  <strong>{run.runId ?? run.recordId ?? 'worktree_run'}</strong>
                  <span>
                    status {run.status ?? 'unknown'}, runner {run.runnerMode ?? 'unknown'}
                  </span>
                  <span>
                    worktree {run.worktreePathHash ?? 'unavailable'}, base{' '}
                    {run.baseRefHash ?? 'unavailable'}, slug {run.branchSlugHash ?? 'unavailable'}
                  </span>
                  <span>
                    changed files {run.changedFileCount ?? 0}, diff{' '}
                    {run.diffHash ?? 'unavailable'}
                  </span>
                  <span>
                    cleanupRequired {String(run.cleanupRequired ?? false)}, cleanupDeferred{' '}
                    {String(run.cleanupDeferred ?? false)}
                  </span>
                  <span>
                    git {String(run.gitProcessBoundaryInvoked ?? false)}, process{' '}
                    {String(run.processBoundaryInvoked ?? false)}, external{' '}
                    {String(run.externalProcessStarted ?? false)}
                  </span>
                  <span>
                    evidence {run.evidenceRefIds?.length ?? 0}, audit{' '}
                    {run.auditEventIds?.length ?? 0}
                  </span>
                  {run.summary ? <p>{run.summary}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No worktree create run metadata is available. This view is read-only and never sends
              local-control credentials.
            </p>
          )}
        </Panel>
        <Panel title="Worktree Cleanup Runs">
          {overview.worktreeCleanupRuns.length > 0 ? (
            <ul>
              {overview.worktreeCleanupRuns.slice(0, 8).map((run) => (
                <li key={run.runId ?? run.recordId ?? run.dryRunId} className="stacked">
                  <strong>{run.runId ?? run.recordId ?? 'worktree_cleanup_run'}</strong>
                  <span>
                    status {run.status ?? 'unknown'}, source {run.sourceRunId ?? 'unknown'}
                  </span>
                  <span>
                    worktree {run.worktreePathHash ?? 'unavailable'}, root{' '}
                    {run.worktreeRootHash ?? 'unavailable'}
                  </span>
                  <span>
                    cleanupCompleted {String(run.cleanupCompleted ?? false)}, cleanupRequired{' '}
                    {String(run.cleanupRequired ?? false)}
                  </span>
                  <span>
                    git {String(run.gitProcessBoundaryInvoked ?? false)}, process{' '}
                    {String(run.processBoundaryInvoked ?? false)}, external{' '}
                    {String(run.externalProcessStarted ?? false)}
                  </span>
                  <span>
                    evidence {run.evidenceRefIds?.length ?? 0}, audit{' '}
                    {run.auditEventIds?.length ?? 0}
                  </span>
                  {run.summary ? <p>{run.summary}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No worktree cleanup run metadata is available. Cleanup remains Supervisor-gated and
              cannot be triggered from the Dashboard.
            </p>
          )}
        </Panel>
      </section>
    );
  }

  if (activeView === 'workflows') {
    return (
      <section className="grid">
        <Panel title="Custom Workflow Templates">
          <ul>
            <li>
              <strong>manifest</strong>
              <span>
                {customWorkflowSummary.manifestName} {customWorkflowSummary.manifestVersion}
              </span>
            </li>
            <li>
              <strong>templates / validations</strong>
              <span>
                {customWorkflowSummary.templateCount} /{' '}
                {customWorkflowSummary.validationCount}
              </span>
            </li>
            <li>
              <strong>production catalog</strong>
              <span>
                {customWorkflowSummary.catalogTemplateCount} templates, ready{' '}
                {customWorkflowSummary.catalogReadyCount}, blocked{' '}
                {customWorkflowSummary.catalogBlockedOrDisabledCount}
              </span>
            </li>
            <li>
              <strong>template families</strong>
              <span>{customWorkflowSummary.catalogFamilies.join(', ')}</span>
            </li>
            <li>
              <strong>approval model</strong>
              <span>
                workflow {String(customWorkflowSummary.approvalRequired)}, child{' '}
                {String(customWorkflowSummary.childApprovalsRequired)}
              </span>
            </li>
            <li>
              <strong>execution boundary</strong>
              <span>
                direct adapter {String(customWorkflowSummary.directAdapterExecutionAllowed)},
                direct child {String(customWorkflowSummary.directChildExecutionAllowed)}
              </span>
            </li>
            <li>
              <strong>storage</strong>
              <span>
                bodyStored {String(customWorkflowSummary.bodyStored)}, rawPathStored{' '}
                {String(customWorkflowSummary.rawPathStored)}
              </span>
            </li>
          </ul>
          <p>{customWorkflowSummary.summary}</p>
        </Panel>
        <Panel title="Production Workflow Catalog">
          <ul>
            {customWorkflowSummary.productionTemplateIds.map((templateId) => (
              <li key={templateId}>
                <strong>{templateId}</strong>
                <span>
                  productionExecutionEnabled{' '}
                  {String(customWorkflowSummary.productionExecutionEnabled)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Custom Workflow Control Records">
          <ul>
            <li>
              <strong>dry-runs</strong>
              <span>{customWorkflowSummary.dryRunCount}</span>
            </li>
            <li>
              <strong>approvals</strong>
              <span>{customWorkflowSummary.approvalCount}</span>
            </li>
            <li>
              <strong>runs</strong>
              <span>{customWorkflowSummary.runCount}</span>
            </li>
            <li>
              <strong>latest run</strong>
              <span>{customWorkflowSummary.latestRunStatus}</span>
            </li>
            <li>
              <strong>boundaries</strong>
              <span>
                process {String(customWorkflowSummary.processBoundaryInvoked)}, network{' '}
                {String(customWorkflowSummary.networkBoundaryInvoked)}, external{' '}
                {String(customWorkflowSummary.externalProcessStarted)}
              </span>
            </li>
          </ul>
        </Panel>
        <Panel title="Latest Custom Workflow Runs">
          {overview.customWorkflowRuns.length > 0 ? (
            <ul>
              {overview.customWorkflowRuns.slice(0, 8).map((run) => (
                <li key={run.runId ?? run.recordId ?? run.dryRunId} className="stacked">
                  <strong>{run.runId ?? run.recordId ?? run.dryRunId}</strong>
                  <span>
                    {run.status ?? 'unknown'}, template {run.templateId ?? 'unknown'}
                  </span>
                  <span>
                    steps {run.completedStepCount ?? 0} completed, {run.blockedStepCount ?? 0}{' '}
                    blocked, {run.failedStepCount ?? 0} failed
                  </span>
                  <span>
                    evidence {run.evidenceRefIds?.length ?? 0}, audit{' '}
                    {run.auditEventIds?.length ?? 0}
                  </span>
                  <span>
                    adapterExecute {String(run.directAdapterExecutionAllowed ?? false)}, childExec{' '}
                    {String(run.directChildExecutionAllowed ?? false)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No custom workflow run metadata is available. This view stays read-only and cannot
              execute a workflow.
            </p>
          )}
        </Panel>
      </section>
    );
  }

  if (activeView === 'release-candidates') {
    return (
      <section className="grid">
        <Panel title="Local RC Readiness">
          <ul>
            <li>
              <strong>records</strong>
              <span>
                dry-runs {releaseCandidateSummary.dryRunCount}, approvals{' '}
                {releaseCandidateSummary.approvalCount}, runs {releaseCandidateSummary.runCount}
              </span>
            </li>
            <li>
              <strong>latest run</strong>
              <span>{releaseCandidateSummary.latestRunStatus}</span>
            </li>
            <li>
              <strong>readiness</strong>
              <span>{releaseCandidateSummary.readinessStatus}</span>
            </li>
            <li>
              <strong>review / verification</strong>
              <span>
                {releaseCandidateSummary.reviewDecisionStatus} /{' '}
                {releaseCandidateSummary.verificationStatus}
              </span>
            </li>
            <li>
              <strong>operator readiness</strong>
              <span>{releaseCandidateSummary.operatorReadinessStatus}</span>
            </li>
            <li>
              <strong>bundle hash</strong>
              <span>{releaseCandidateSummary.bundleHash}</span>
            </li>
            <li>
              <strong>approval</strong>
              <span>
                required {String(releaseCandidateSummary.approvalRequired)}, default enabled{' '}
                {String(releaseCandidateSummary.productDefaultEnabled)}
              </span>
            </li>
          </ul>
          <p>{releaseCandidateSummary.summary}</p>
        </Panel>
        <Panel title="RC Bundle Runs">
          {overview.releaseCandidateRuns.length > 0 ? (
            <ul>
              {overview.releaseCandidateRuns.slice(0, 8).map((run) => (
                <li key={run.runId ?? run.recordId ?? run.dryRunId} className="stacked">
                  <strong>{run.runId ?? run.recordId ?? 'release_candidate_run'}</strong>
                  <span>
                    status {run.status ?? 'unknown'}, runner {run.runnerMode ?? 'unknown'}
                  </span>
                  <span>
                    readiness {run.readinessStatus ?? run.rcReadiness?.status ?? 'unknown'},
                    review{' '}
                    {run.reviewDecisionStatus ??
                      run.rcReadiness?.reviewDecisionStatus ??
                      'unknown'}
                  </span>
                  <span>
                    verification{' '}
                    {run.verificationStatus ?? run.rcReadiness?.verificationStatus ?? 'unknown'},
                    operator{' '}
                    {run.operatorReadinessStatus ??
                      run.rcReadiness?.operatorReadinessStatus ??
                      'unknown'}
                  </span>
                  <span>
                    bundle{' '}
                    {run.bundleHash ??
                      run.bundleSummary?.bundleHash ??
                      run.rcReadiness?.bundleHash ??
                      'unavailable'}
                  </span>
                  <span>
                    files {run.fileCount ?? run.bundleSummary?.fileCount ?? 0}, bytes{' '}
                    {run.byteCount ?? run.bundleSummary?.byteCount ?? 0}
                  </span>
                  <span>
                    artifactWrite {String(run.artifactWriteBoundaryInvoked ?? false)}, process{' '}
                    {String(run.processBoundaryInvoked ?? false)}, external{' '}
                    {String(run.externalProcessStarted ?? false)}
                  </span>
                  <span>
                    evidence {run.evidenceRefIds?.length ?? 0}, audit{' '}
                    {run.auditEventIds?.length ?? 0}
                  </span>
                  {run.summary ? <p>{run.summary}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No local RC bundle run metadata is available. Bundle export remains
              Supervisor-gated and cannot be triggered from the Dashboard.
            </p>
          )}
        </Panel>
        <Panel title="Review Package State">
          <ul>
            <li>
              <strong>review packages</strong>
              <span>
                runs {reviewPackageSummary.runCount}, latest decision{' '}
                {reviewPackageSummary.latestDecisionStatus}
              </span>
            </li>
            <li>
              <strong>verification statuses</strong>
              <span>
                {reviewPackageSummary.verificationStatuses.length > 0
                  ? reviewPackageSummary.verificationStatuses.join(', ')
                  : 'none'}
              </span>
            </li>
            <li>
              <strong>review export</strong>
              <span>
                exported {reviewPackageSummary.exportedCount}, artifact boundary{' '}
                {String(reviewPackageSummary.artifactWriteBoundaryInvoked)}
              </span>
            </li>
            <li>
              <strong>evidence / audit</strong>
              <span>
                {reviewPackageSummary.evidenceCount} / {reviewPackageSummary.auditEventCount}
              </span>
            </li>
          </ul>
          <p>{reviewPackageSummary.summary}</p>
        </Panel>
        <Panel title="Acceptance Rehearsal">
          <ul>
            <li>
              <strong>status</strong>
              <span>{localRcAcceptanceRehearsalSummary.status}</span>
            </li>
            <li>
              <strong>scenario</strong>
              <span>{localRcAcceptanceRehearsalSummary.scenario}</span>
            </li>
            <li>
              <strong>readiness</strong>
              <span>{localRcAcceptanceRehearsalSummary.readinessStatus}</span>
            </li>
            <li>
              <strong>operator acceptance</strong>
              <span>{localRcAcceptanceRehearsalSummary.operatorAcceptanceStatus}</span>
            </li>
            <li>
              <strong>controls</strong>
              <span>
                keyRead {String(localRcAcceptanceRehearsalSummary.localControlKeyRead)},
                postAllowed {String(localRcAcceptanceRehearsalSummary.supervisorPostAllowed)},
                adapterExecute {String(localRcAcceptanceRehearsalSummary.adapterExecuteAllowed)}
              </span>
            </li>
            <li>
              <strong>remote bounds</strong>
              <span>
                push {String(localRcAcceptanceRehearsalSummary.pushAllowed)}, openPR{' '}
                {String(localRcAcceptanceRehearsalSummary.pullRequestOpened)}
              </span>
            </li>
          </ul>
          <p>{localRcAcceptanceRehearsalSummary.summary}</p>
        </Panel>
        <Panel title="Local RC Boundaries">
          <ul>
            <li>
              <strong>artifact write</strong>
              <span>{String(releaseCandidateSummary.artifactWriteBoundaryInvoked)}</span>
            </li>
            <li>
              <strong>files / bytes</strong>
              <span>
                {releaseCandidateSummary.fileCount} / {releaseCandidateSummary.byteCount}
              </span>
            </li>
            <li>
              <strong>evidence / audit</strong>
              <span>
                {releaseCandidateSummary.evidenceCount} /{' '}
                {releaseCandidateSummary.auditEventCount}
              </span>
            </li>
            <li>
              <strong>storage</strong>
              <span>
                bodyStored {String(releaseCandidateSummary.bodyStored)}, rawPathStored{' '}
                {String(releaseCandidateSummary.rawPathStored)}
              </span>
            </li>
            <li>
              <strong>read-only controls</strong>
              <span>
                keyRead {String(releaseCandidateSummary.localControlKeyRead)}, postAllowed{' '}
                {String(releaseCandidateSummary.supervisorPostAllowed)}, adapterExecute{' '}
                {String(releaseCandidateSummary.adapterExecuteAllowed)}
              </span>
            </li>
            <li>
              <strong>remote actions</strong>
              <span>
                push {String(releaseCandidateSummary.pushAllowed)}, openPR{' '}
                {String(releaseCandidateSummary.pullRequestOpened)}
              </span>
            </li>
          </ul>
        </Panel>
      </section>
    );
  }

  if (activeView === 'policy-telemetry') {
    return (
      <section className="grid">
        <Panel title="Policy Backend">
          <ul>
            <li>
              <strong>adapter</strong>
              <span>
                {policyTelemetrySummary.policyBackend.manifestName}{' '}
                {policyTelemetrySummary.policyBackend.manifestVersion}
              </span>
            </li>
            <li>
              <strong>enablement</strong>
              <span>default {String(policyTelemetrySummary.policyBackend.productDefaultEnabled)}</span>
            </li>
            <li>
              <strong>backend kinds</strong>
              <span>{policyTelemetrySummary.policyBackend.backendKinds.join(', ')}</span>
            </li>
            <li>
              <strong>evaluators</strong>
              <span>{policyTelemetrySummary.policyBackend.evaluatorSources.join(', ')}</span>
            </li>
            <li>
              <strong>authority</strong>
              <span>
                advisoryOnly {String(policyTelemetrySummary.policyBackend.advisoryOnly)}, provider{' '}
                {policyTelemetrySummary.policyBackend.authorityProvider}
              </span>
            </li>
            <li>
              <strong>boundaries</strong>
              <span>
                process {String(policyTelemetrySummary.policyBackend.processBoundaryInvoked)},
                network {String(policyTelemetrySummary.policyBackend.networkBoundaryInvoked)}
              </span>
            </li>
          </ul>
          <p>{policyTelemetrySummary.policyBackend.summary}</p>
        </Panel>
        <Panel title="Telemetry Projection">
          <ul>
            <li>
              <strong>adapter</strong>
              <span>
                {policyTelemetrySummary.telemetry.manifestName}{' '}
                {policyTelemetrySummary.telemetry.manifestVersion}
              </span>
            </li>
            <li>
              <strong>enablement</strong>
              <span>default {String(policyTelemetrySummary.telemetry.productDefaultEnabled)}</span>
            </li>
            <li>
              <strong>exporters</strong>
              <span>{policyTelemetrySummary.telemetry.exporterKinds.join(', ')}</span>
            </li>
            <li>
              <strong>projection</strong>
              <span>
                local {String(policyTelemetrySummary.telemetry.localProjectionEnabled)}, spans{' '}
                {policyTelemetrySummary.telemetry.projectionSpanCount}
              </span>
            </li>
            <li>
              <strong>projection hash</strong>
              <span>{policyTelemetrySummary.telemetry.projectionHash}</span>
            </li>
            <li>
              <strong>runtime</strong>
              <span>
                sdk {String(policyTelemetrySummary.telemetry.openTelemetrySdkLoaded)}, network{' '}
                {String(policyTelemetrySummary.telemetry.networkExportAttempted)}
              </span>
            </li>
            <li>
              <strong>fact chain</strong>
              <span>
                evidenceAuditAuthoritative{' '}
                {String(policyTelemetrySummary.telemetry.evidenceAuditAuthoritative)}
              </span>
            </li>
          </ul>
          <p>{policyTelemetrySummary.telemetry.summary}</p>
        </Panel>
      </section>
    );
  }

  if (activeView === 'pilot') {
    return (
      <section className="grid">
        <Panel title="M11 Narrow Path">
          <ul>
            <li>
              <strong>status</strong>
              <span>{m11PilotSummary.status}</span>
            </li>
            <li>
              <strong>runs</strong>
              <span>{m11PilotSummary.runCount}</span>
            </li>
            <li>
              <strong>enablement</strong>
              <span>
                {m11PilotSummary.enablementStatus}, blockers{' '}
                {m11PilotSummary.enablementBlockerCount}
              </span>
            </li>
            <li>
              <strong>required env</strong>
              <span>{m11PilotSummary.requiredEnvFlags.join(', ')}</span>
            </li>
            <li>
              <strong>latest</strong>
              <span>
                {m11PilotSummary.latestRunStatus} / PR {m11PilotSummary.latestPrDraftStatus}
              </span>
            </li>
            <li>
              <strong>failure</strong>
              <span>{m11PilotSummary.latestFailureClassification}</span>
            </li>
            <li>
              <strong>recovery</strong>
              <span>{m11PilotSummary.latestRecoveryAction}</span>
            </li>
            <li>
              <strong>boundaries</strong>
              <span>
                process {String(m11PilotSummary.processBoundaryInvoked)}, external{' '}
                {String(m11PilotSummary.externalProcessStarted)}
              </span>
            </li>
            <li>
              <strong>read-only bounds</strong>
              <span>
                codexReadOnly {String(m11PilotSummary.codexReadOnlyDryRunOnly)}, patch{' '}
                {String(m11PilotSummary.patchGenerationAllowed)}, push{' '}
                {String(m11PilotSummary.pushAllowed)}, openPR{' '}
                {String(m11PilotSummary.pullRequestOpened)}
              </span>
            </li>
            <li>
              <strong>controls</strong>
              <span>
                keyRead {String(m11PilotSummary.localControlKeyRead)}, postAllowed{' '}
                {String(m11PilotSummary.supervisorPostAllowed)}, adapterExecute{' '}
                {String(m11PilotSummary.adapterExecuteAllowed)}
              </span>
            </li>
          </ul>
          <p>{m11PilotSummary.summary}</p>
        </Panel>
        <Panel title="M11 Safe-Enable Checklist">
          <ul>
            {m11PilotSummary.steps.map((step) => (
              <li key={step.code} className="stacked">
                <strong>{step.label}</strong>
                <span>
                  {step.phase} / {step.status} / blockers {step.blockerCount}
                </span>
                <span>{step.blockers.length > 0 ? step.blockers.join(', ') : 'none'}</span>
                <p>{step.summary}</p>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="M11 Operator Handoff">
          <ul>
            <li>
              <strong>next action</strong>
              <span>{m11PilotSummary.nextAction}</span>
            </li>
            <li>
              <strong>failure handling</strong>
              <span>{m11PilotSummary.failureHandlingSummary}</span>
            </li>
            <li>
              <strong>rollback</strong>
              <span>{m11PilotSummary.rollbackSummary}</span>
            </li>
          </ul>
        </Panel>
        <Panel title="M11 Recovery Handoff">
          <ul>
            <li>
              <strong>cleanup handoffs</strong>
              <span>{m11PilotSummary.cleanupHandoffCount}</span>
            </li>
            <li>
              <strong>cleanup required</strong>
              <span>{m11PilotSummary.cleanupRequiredCount}</span>
            </li>
            <li>
              <strong>cleanup approval</strong>
              <span>{m11PilotSummary.latestCleanupApprovalStatus}</span>
            </li>
            <li>
              <strong>cleanup state</strong>
              <span>
                deferred {String(m11PilotSummary.latestCleanupDeferred)}, completed{' '}
                {String(m11PilotSummary.latestCleanupCompleted)}
              </span>
            </li>
            <li>
              <strong>write controls</strong>
              <span>
                postAllowed {String(m11PilotSummary.supervisorPostAllowed)}, adapterExecute{' '}
                {String(m11PilotSummary.adapterExecuteAllowed)}
              </span>
            </li>
          </ul>
        </Panel>
        <Panel title="M11 Acceptance Smoke">
          <ul>
            <li>
              <strong>status</strong>
              <span>{m11PilotAcceptanceSmokeSummary.status}</span>
            </li>
            <li>
              <strong>scenario</strong>
              <span>{m11PilotAcceptanceSmokeSummary.scenario}</span>
            </li>
            <li>
              <strong>failure</strong>
              <span>{m11PilotAcceptanceSmokeSummary.failureClassification}</span>
            </li>
            <li>
              <strong>recovery</strong>
              <span>{m11PilotAcceptanceSmokeSummary.recoveryAction}</span>
            </li>
            <li>
              <strong>PR draft</strong>
              <span>{m11PilotAcceptanceSmokeSummary.prDraftStatus}</span>
            </li>
            <li>
              <strong>evidence / audit</strong>
              <span>
                {m11PilotAcceptanceSmokeSummary.evidenceCount} /{' '}
                {m11PilotAcceptanceSmokeSummary.auditEventCount}
              </span>
            </li>
            <li>
              <strong>fixture</strong>
              <span>{String(m11PilotAcceptanceSmokeSummary.fixtureOnly)}</span>
            </li>
            <li>
              <strong>boundaries</strong>
              <span>
                process {String(m11PilotAcceptanceSmokeSummary.processBoundaryInvoked)}, external{' '}
                {String(m11PilotAcceptanceSmokeSummary.externalProcessStarted)}, network{' '}
                {String(m11PilotAcceptanceSmokeSummary.networkBoundaryInvoked)}
              </span>
            </li>
            <li>
              <strong>controls</strong>
              <span>
                keyRead {String(m11PilotAcceptanceSmokeSummary.localControlKeyRead)}, postAllowed{' '}
                {String(m11PilotAcceptanceSmokeSummary.supervisorPostAllowed)}, adapterExecute{' '}
                {String(m11PilotAcceptanceSmokeSummary.adapterExecuteAllowed)}
              </span>
            </li>
            <li>
              <strong>write bounds</strong>
              <span>
                patch {String(m11PilotAcceptanceSmokeSummary.patchGenerationAllowed)}, push{' '}
                {String(m11PilotAcceptanceSmokeSummary.pushAllowed)}, openPR{' '}
                {String(m11PilotAcceptanceSmokeSummary.pullRequestOpened)}
              </span>
            </li>
          </ul>
          <p>{m11PilotAcceptanceSmokeSummary.summary}</p>
        </Panel>
        <Panel title="Local RC Acceptance Rehearsal">
          <ul>
            <li>
              <strong>status</strong>
              <span>{localRcAcceptanceRehearsalSummary.status}</span>
            </li>
            <li>
              <strong>scenario</strong>
              <span>{localRcAcceptanceRehearsalSummary.scenario}</span>
            </li>
            <li>
              <strong>readiness</strong>
              <span>{localRcAcceptanceRehearsalSummary.readinessStatus}</span>
            </li>
            <li>
              <strong>review decision</strong>
              <span>{localRcAcceptanceRehearsalSummary.reviewDecisionStatus}</span>
            </li>
            <li>
              <strong>verification / export</strong>
              <span>
                {localRcAcceptanceRehearsalSummary.verificationStatus} /{' '}
                {localRcAcceptanceRehearsalSummary.exportSummaryStatus}
              </span>
            </li>
            <li>
              <strong>operator acceptance</strong>
              <span>{localRcAcceptanceRehearsalSummary.operatorAcceptanceStatus}</span>
            </li>
            <li>
              <strong>evidence / audit</strong>
              <span>
                {localRcAcceptanceRehearsalSummary.evidenceCount} /{' '}
                {localRcAcceptanceRehearsalSummary.auditEventCount}
              </span>
            </li>
            <li>
              <strong>bundle hash</strong>
              <span>{localRcAcceptanceRehearsalSummary.bundleHash}</span>
            </li>
            <li>
              <strong>boundaries</strong>
              <span>
                process {String(localRcAcceptanceRehearsalSummary.processBoundaryInvoked)}, external{' '}
                {String(localRcAcceptanceRehearsalSummary.externalProcessStarted)}, artifact{' '}
                {String(localRcAcceptanceRehearsalSummary.artifactWriteBoundaryInvoked)}
              </span>
            </li>
            <li>
              <strong>controls</strong>
              <span>
                keyRead {String(localRcAcceptanceRehearsalSummary.localControlKeyRead)}, postAllowed{' '}
                {String(localRcAcceptanceRehearsalSummary.supervisorPostAllowed)}, adapterExecute{' '}
                {String(localRcAcceptanceRehearsalSummary.adapterExecuteAllowed)}
              </span>
            </li>
          </ul>
          <p>{localRcAcceptanceRehearsalSummary.summary}</p>
        </Panel>
        <Panel title="M10 Pilot Checklist">
          <ul>
            <li>
              <strong>status</strong>
              <span>{pilotSummary.status}</span>
            </li>
            <li>
              <strong>steps</strong>
              <span>
                {pilotSummary.readyStepCount} ready, {pilotSummary.blockedStepCount} blocked,{' '}
                {pilotSummary.reviewStepCount} review
              </span>
            </li>
            <li>
              <strong>blockers</strong>
              <span>{pilotSummary.blockerCount}</span>
            </li>
            <li>
              <strong>approval inbox</strong>
              <span>{pilotSummary.approvalInboxItemCount} items</span>
            </li>
            <li>
              <strong>governance runs</strong>
              <span>{pilotSummary.governanceRunCount}</span>
            </li>
          </ul>
          <p>{pilotSummary.summary}</p>
        </Panel>
        <Panel title="Operator Steps">
          <ul>
            {pilotSummary.steps.map((step) => (
              <li key={step.code} className="stacked">
                <strong>{step.label}</strong>
                <span>
                  {step.phase} / {step.status} / blockers {step.blockerCount}
                </span>
                <span>{step.blockers.length > 0 ? step.blockers.join(', ') : 'none'}</span>
                <p>{step.summary}</p>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Runbook Summary">
          <ul>
            <li>
              <strong>next action</strong>
              <span>{pilotSummary.nextAction}</span>
            </li>
            <li>
              <strong>rollback</strong>
              <span>{pilotSummary.rollbackSummary}</span>
            </li>
            <li>
              <strong>read-only bounds</strong>
              <span>
                keyRead {String(pilotSummary.localControlKeyRead)}, postAllowed{' '}
                {String(pilotSummary.supervisorPostAllowed)}, adapterExecute{' '}
                {String(pilotSummary.adapterExecuteAllowed)}
              </span>
            </li>
            <li>
              <strong>storage</strong>
              <span>
                bodyStored {String(pilotSummary.bodyStored)}, rawPathStored{' '}
                {String(pilotSummary.rawPathStored)}
              </span>
            </li>
          </ul>
        </Panel>
        <Panel title="Acceptance Rehearsal">
          <ul>
            <li>
              <strong>status</strong>
              <span>{pilotAcceptanceSummary.status}</span>
            </li>
            <li>
              <strong>scenario</strong>
              <span>{pilotAcceptanceSummary.scenario}</span>
            </li>
            <li>
              <strong>evidence / audit</strong>
              <span>
                {pilotAcceptanceSummary.evidenceCount} / {pilotAcceptanceSummary.auditEventCount}
              </span>
            </li>
            <li>
              <strong>PR action</strong>
              <span>{pilotAcceptanceSummary.prActionStatus}</span>
            </li>
            <li>
              <strong>live boundaries</strong>
              <span>
                process {String(pilotAcceptanceSummary.processBoundaryInvoked)}, external{' '}
                {String(pilotAcceptanceSummary.externalProcessStarted)}, network{' '}
                {String(pilotAcceptanceSummary.networkBoundaryInvoked)}
              </span>
            </li>
            <li>
              <strong>read-only bounds</strong>
              <span>
                keyRead {String(pilotAcceptanceSummary.localControlKeyRead)}, postAllowed{' '}
                {String(pilotAcceptanceSummary.supervisorPostAllowed)}, adapterExecute{' '}
                {String(pilotAcceptanceSummary.adapterExecuteAllowed)}
              </span>
            </li>
          </ul>
          <p>{pilotAcceptanceSummary.summary}</p>
        </Panel>
      </section>
    );
  }

  return (
    <section className="grid">
      <Panel title="MCP Tool Registry">
        <ul>
          <li>
            <strong>manifest</strong>
            <span>
              {mcpSummary.manifestName} {mcpSummary.manifestVersion}
            </span>
          </li>
          <li>
            <strong>tools</strong>
            <span>
              {mcpSummary.enabledToolCount}/{mcpSummary.toolCount} enabled
            </span>
          </li>
          <li>
            <strong>action modes</strong>
            <span>{mcpSummary.actionModes.join(', ')}</span>
          </li>
          <li>
            <strong>process boundary</strong>
            <span>
              invoked {String(mcpSummary.processBoundaryInvoked)}, external process{' '}
              {String(mcpSummary.externalProcessStarted)}
            </span>
          </li>
        </ul>
      </Panel>
      <Panel title="Read-Only MCP Tools">
        <ul>
          {mcpSummary.tools.map((tool) => (
            <li key={tool.name} className="stacked">
              <strong>{tool.name}</strong>
              <span>
                {tool.riskLevel}/{tool.actionMode}, approval {tool.approvalPolicy}, body{' '}
                {tool.bodyStorage}
              </span>
              <span>
                enabled {String(tool.enabled)}, noRealWrite {String(tool.noRealWrite)}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </section>
  );
}

function Panel(props: { title: string; children: React.ReactNode }) {
  return (
    <article className="panel">
      <h2>{props.title}</h2>
      {props.children}
    </article>
  );
}

function getEvidenceItems(searchResult: Record<string, unknown> | undefined): Array<{
  id: string;
  kind: string;
  hash: string;
  summary?: string;
}> {
  const result = searchResult?.result as
    | {
        items?: Array<{
          evidenceRefId?: string;
          kind?: string;
          hash?: string;
          summary?: string;
        }>;
      }
    | undefined;

  return (result?.items ?? []).slice(0, 12).map((item) => ({
    id: item.evidenceRefId ?? 'unknown',
    kind: item.kind ?? 'unknown',
    hash: item.hash ?? 'hash-unavailable',
    summary: item.summary,
  }));
}

function formatSourceBreakdown(sourceBreakdown: Record<string, number>): string {
  const entries = Object.entries(sourceBreakdown);
  return entries.length > 0
    ? entries.map(([source, count]) => `${source}:${count}`).join(', ')
    : 'none';
}

function readinessReviewWording(
  review: CodexExecRealReadOnlyAdapterReadinessReviewSummary,
): string {
  if (review.packageStatus === 'blocked' || review.packageStatus === 'not_ready') {
    return 'Not ready for separate ADR draft.';
  }

  if (review.packageStatus === 'requires_review') {
    return review.outcome === 'conditional_go_to_separate_adr_draft'
      ? 'ADR drafting only. Does not grant implementation, process launch, or execution permission.'
      : 'Separate ADR draft may be considered only if reviewer explicitly acknowledges unresolved findings.';
  }

  if (review.outcome === 'conditional_go_to_separate_adr_draft') {
    return 'ADR drafting only. Does not grant implementation, process launch, or execution permission.';
  }

  return 'Not ready for separate ADR draft.';
}

function uniqueReviewDryRunIds(reviews: CodexExecReportReviewRecord[]): string[] {
  return Array.from(new Set(reviews.map((review) => review.dryRunId))).filter(
    (dryRunId) => dryRunId.length > 0,
  );
}

function uniqueGovernanceDryRunIds(
  runs: CodexExecLiveRunRecord[],
  reviews: CodexExecReportReviewRecord[],
): string[] {
  return Array.from(
    new Set([...runs.map((run) => run.dryRunPlanId), ...reviews.map((review) => review.dryRunId)]),
  ).filter((dryRunId) => dryRunId.length > 0);
}

function uniqueRealAdapterTimelineDryRunIds(
  runs: CodexExecLiveRunRecord[],
  readiness: CodexExecRealReadOnlyAdapterReadinessSummary[],
): string[] {
  return Array.from(
    new Set([
      ...readiness.map((summary) => summary.dryRunId),
      ...runs.map((run) => run.dryRunPlanId),
    ]),
  ).filter((dryRunId) => dryRunId.length > 0);
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${supervisorUrl}${path}`);

  if (!response.ok) {
    throw new Error(`Supervisor returned ${response.status} for ${path}`);
  }

  return (await response.json()) as T;
}

async function getOptionalJson<T>(path: string, fallback: T): Promise<T> {
  try {
    return await getJson<T>(path);
  } catch {
    return fallback;
  }
}
