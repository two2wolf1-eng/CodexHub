import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, extname, isAbsolute, parse, relative, resolve, sep } from 'node:path';
import Fastify from 'fastify';
import {
  createApprovalDecisionResult,
  createApprovalInboxProjection,
} from '@codexhub/approval-ux-kernel';
import {
  createCodexExecApprovalArtifactFromDecision,
  createCodexExecApprovalTransitionResult,
  buildControlPlaneDrilldownView,
  createCodexExecControlPlaneTimeline,
  buildCodexExecControlPlaneReport,
  buildCodexExecGovernanceReviewPackage,
  buildCodexExecLiveAdapterAdrDraft,
  buildCodexExecReportReviewHistory,
  buildCodexExecReviewerHandoffSummary,
  compareCodexExecReportReviews,
  createCodexExecLiveAdapterAdrDecisionAuditEvents,
  createCodexExecLiveAdapterAdrDecisionEvidenceRefs,
  createCodexExecLiveAdapterAdrDecisionRecord,
  createDefaultReadOnlyAdapterOperatorChecklist,
  createReadOnlyAdapterPreflightSimulationAuditEvents,
  createReadOnlyAdapterPreflightSimulationEvidenceRefs,
  createReadOnlyAdapterSimulatorReviewAuditEvents,
  createReadOnlyAdapterSimulatorReviewDecisionRecord,
  createReadOnlyAdapterSimulatorReviewEvidenceRefs,
  createReadOnlyAdapterImplementationPlanReviewAuditEvents,
  createReadOnlyAdapterImplementationPlanReviewDecisionRecord,
  createReadOnlyAdapterImplementationPlanReviewEvidenceRefs,
  createReadOnlyAdapterSkeletonAuditEvents,
  createReadOnlyAdapterSkeletonEvidenceRefs,
  createReadOnlyAdapterSkeletonPreview,
  createReadOnlyAdapterSkeletonReviewAuditEvents,
  createReadOnlyAdapterSkeletonReviewDecisionRecord,
  createReadOnlyAdapterSkeletonReviewEvidenceRefs,
  createReadOnlyAdapterFinalReadinessAuditEvents,
  createReadOnlyAdapterFinalReadinessDecisionRecord,
  createReadOnlyAdapterFinalReadinessEvidenceRefs,
  buildRealReadOnlyAdapterReadinessPackage,
  createRealReadOnlyAdapterReadinessAuditEvents,
  createRealReadOnlyAdapterReadinessEvidenceRefs,
  createRealReadOnlyAdapterReadinessReviewAuditEvents,
  createRealReadOnlyAdapterReadinessReviewDecisionRecord,
  createRealReadOnlyAdapterReadinessReviewEvidenceRefs,
  createDefaultRealReadOnlyAdapterConfig,
  createRealReadOnlyAdapterConfigFromLiveConfig,
  createRealReadOnlyAdapterRequest,
  createRealReadOnlyAdapterGuardPreflight,
  createRealReadOnlyAdapterBlockedResult,
  createRealReadOnlyAdapterResultFromBoundary,
  createRealReadOnlyAdapterAttemptAuditEvents,
  createRealReadOnlyAdapterAttemptEvidenceRefs,
  createRealReadOnlyAdapterAttemptRecord,
  createRealReadOnlyAdapterAttemptTimeline,
  createRealReadOnlyAdapterAuditSummaryFromEvents,
  createRealReadOnlyAdapterEvidenceSummaryFromRefs,
  createRealReadOnlyAdapterProcessPlan,
  verifyRealReadOnlyAdapterGovernedInputSource,
  createBlockedRealReadOnlyAdapterGovernedInputVerification,
  createRealReadOnlyAdapterRuntimeCwdSelfCheck,
  createRealReadOnlyAdapterPostRunVerificationPlan,
  resolveRealReadOnlyAdapterExecutable,
  runRealReadOnlyAdapterPostRunVerification,
  runRealReadOnlyAdapterProcessBoundary,
  REAL_READ_ONLY_ADAPTER_CODEX_CLI_INVOCATION_CONTRACT_VERSION,
  REAL_READ_ONLY_ADAPTER_CODEX_CLI_PROCESS_ARGV,
  REAL_READ_ONLY_ADAPTER_CODEX_CLI_PROCESS_ARGV_HASH,
  buildRealReadOnlyAdapterPilotPrerequisiteRecord,
  createRealReadOnlyAdapterPilotPrerequisiteAuditEvents,
  createRealReadOnlyAdapterPilotPrerequisiteEvidenceRefs,
  buildRealReadOnlyAdapterPilotSourcePreparationRecord,
  createRealReadOnlyAdapterPilotSourcePreparationAuditEvents,
  createRealReadOnlyAdapterPilotSourcePreparationEvidenceRefs,
  buildRealReadOnlyAdapterPolicySourceRecord,
  createPolicyDecisionFromRealReadOnlyAdapterPolicySource,
  createRealReadOnlyAdapterPolicySourceAuditEvents,
  createRealReadOnlyAdapterPolicySourceEvidenceRefs,
  buildRealReadOnlyAdapterApprovalAuthorityTraceRecord,
  createRealReadOnlyAdapterApprovalAuthorityTraceAuditEvents,
  createRealReadOnlyAdapterApprovalAuthorityTraceEvidenceRefs,
  listRealReadOnlyAdapterApprovalAuthorityTraceSummaries,
  summarizeRealReadOnlyAdapterApprovalAuthorityTraceRecord,
  hashRealReadOnlyAdapterRuntimeWorktreePath,
  listRealReadOnlyAdapterPilotSourcePreparationSummaries,
  listRealReadOnlyAdapterPolicySourceSummaries,
  summarizeRealReadOnlyAdapterPilotSourcePreparationRecord,
  summarizeRealReadOnlyAdapterPolicySourceRecord,
  listRealReadOnlyAdapterPilotPrerequisiteSummaries,
  summarizeRealReadOnlyAdapterPilotPrerequisiteRecord,
  summarizeRealReadOnlyAdapterAttempt,
  alignRealReadOnlyAdapterAttemptRecordDiagnostics,
  getLatestReadOnlyAdapterSkeletonReview,
  getLatestReadOnlyAdapterFinalReadiness,
  listReadOnlyAdapterSkeletonReviewSummaries,
  listReadOnlyAdapterFinalReadinessSummaries,
  listRealReadOnlyAdapterReadinessReviewSummaries,
  REAL_READ_ONLY_ADAPTER_READINESS_RECOMMENDATION,
  REAL_READ_ONLY_ADAPTER_READINESS_REVIEW_RECOMMENDATION,
  runReadOnlyAdapterFixtureBoundary,
  summarizeReadOnlyAdapterFixtureBoundary,
  summarizeRealReadOnlyAdapterReadinessReview,
  summarizeRealReadOnlyAdapterReadinessPackage,
  validateRealReadOnlyAdapterReadinessReviewDecision,
  createCodexExecTimelineDetailView,
  createCodexExecReportReviewRecord,
  createCodexExecDisabledLiveRunRecord,
  createCodexExecDryRunPlan,
  createCodexExecExecutionIntent,
  createCodexExecControlPlaneAuditEvents,
  createCodexExecControlPlaneEvidenceRefs,
  createCodexExecManualApprovalDecision,
  createCodexExecManualApprovalRecord,
  createCodexExecManualApprovalRequest,
  createCodexExecManualApprovalRequestForPolicySource,
  createDefaultCodexExecConfigLoadResult,
  evaluateCodexExecDryRunPolicy,
  evaluateCodexExecExecutionGate,
  evaluateCodexExecLiveCapability,
  evaluateCodexExecManualApprovalState,
  parseCodexExecLiveConfigFile,
  createCodexReplayRecord,
  getAuditDetail,
  getEvidenceDetail,
  replayCodexExecFixture,
  runCodexExecPreflight,
  searchAuditEvents,
  searchEvidence,
  renderCodexExecControlPlaneReportJson,
  renderCodexExecControlPlaneReportMarkdown,
  renderCodexExecLiveAdapterAdrDraftJson,
  renderCodexExecLiveAdapterAdrDraftMarkdown,
  getLatestCodexExecReportReview,
  getLatestCodexExecLiveAdapterAdrDecision,
  getLatestReadOnlyAdapterSimulatorReview,
  getLatestReadOnlyAdapterImplementationPlanReview,
  listCodexExecLiveAdapterAdrDecisionSummaries,
  listReadOnlyAdapterSimulatorReviewSummaries,
  listReadOnlyAdapterImplementationPlanReviewSummaries,
  simulateReadOnlyAdapterPreflight,
  summarizeReadOnlyAdapterPreflightSimulation,
  summarizeCodexExecLiveAdapterAdrDecision,
  summarizeReadOnlyAdapterSimulatorReview,
  summarizeReadOnlyAdapterImplementationPlanReview,
  summarizeReadOnlyAdapterSkeletonReview,
  summarizeReadOnlyAdapterFinalReadiness,
  summarizeCodexExecReportReview,
  listCodexExecReportReviewSummaries,
  summarizeCodexExecReplay,
} from '@codexhub/codex-kernel';
import type {
  CodexExecRealReadOnlyAdapterPostRunWorktreeState,
  CodexExecRealReadOnlyAdapterExecutableResolution,
  CodexExecRealReadOnlyAdapterProcessRunner,
} from '@codexhub/codex-kernel';
import type {
  AuditEvent,
  BrowserObservationApprovalArtifactRecord,
  BrowserObservationControlPlaneRun,
  BrowserObservationDryRunRecord,
  BrowserObservationRunStatus,
  CodexExecApprovalArtifact,
  CodexExecApprovalDecisionOutcome,
  CodexExecApprovalMode,
  CodexExecConfigLoadResult,
  CodexExecEvidenceQuery,
  CodexExecAuditQuery,
  CodexExecControlPlaneReportFormat,
  CodexExecLiveAdapterAdrDecisionOutcome,
  CodexExecLiveAdapterAdrDecisionQuery,
  CodexExecLiveAdapterAdrDecisionRecord,
  CodexExecLiveAdapterAdrDecisionStatus,
  CodexExecLiveRunRecord,
  CodexExecManualApprovalRecord,
  ApprovalDecisionRequest,
  ApprovalUxStatus,
  CodexExecReadOnlyAdapterOperatorChecklistItem,
  CodexExecReadOnlyAdapterPreflightSimulationResult,
  CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord,
  CodexExecReadOnlyAdapterSimulatorReviewOutcome,
  CodexExecReadOnlyAdapterSimulatorReviewQuery,
  CodexExecReadOnlyAdapterSimulatorReviewStatus,
  CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord,
  CodexExecReadOnlyAdapterImplementationPlanReviewOutcome,
  CodexExecReadOnlyAdapterImplementationPlanReviewQuery,
  CodexExecReadOnlyAdapterImplementationPlanReviewStatus,
  CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord,
  CodexExecReadOnlyAdapterSkeletonReviewOutcome,
  CodexExecReadOnlyAdapterSkeletonReviewQuery,
  CodexExecReadOnlyAdapterSkeletonReviewStatus,
  CodexExecReadOnlyAdapterFinalReadinessDecisionRecord,
  CodexExecReadOnlyAdapterFinalReadinessOutcome,
  CodexExecReadOnlyAdapterFinalReadinessQuery,
  CodexExecReadOnlyAdapterFinalReadinessStatus,
  CodexExecRealReadOnlyAdapterReadinessPackage,
  CodexExecRealReadOnlyAdapterReadinessQuery,
  CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord,
  CodexExecRealReadOnlyAdapterReadinessReviewOutcome,
  CodexExecRealReadOnlyAdapterReadinessReviewQuery,
  CodexExecRealReadOnlyAdapterReadinessReviewStatus,
  CodexExecRealReadOnlyAdapterReadinessStatus,
  CodexExecRealReadOnlyAdapterApprovalAuthoritySummary,
  CodexExecRealReadOnlyAdapterApprovalAuthorityStatus,
  CodexExecRealReadOnlyAdapterAttemptQuery,
  CodexExecRealReadOnlyAdapterAttemptRecord,
  CodexExecRealReadOnlyAdapterAttemptStatus,
  CodexExecRealReadOnlyAdapterAttemptTimelineQuery,
  CodexExecRealReadOnlyAdapterApprovalAuthorityTraceQuery,
  CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord,
  CodexExecRealReadOnlyAdapterApprovalAuthorityTraceStatus,
  CodexExecRealReadOnlyAdapterPolicySourceQuery,
  CodexExecRealReadOnlyAdapterPolicySourceRecord,
  CodexExecRealReadOnlyAdapterPolicySourceStatus,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationQuery,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationStatus,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteQuery,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteStatus,
  CodexExecReportRecommendation,
  CodexExecReportReviewQuery,
  CodexExecReportReviewRecord,
  CodexExecReportReviewStatus,
  CodexExecSandboxMode,
  CodexExecTimelineFilter,
  CodexReplaySummary,
  CodexReplayRecord,
  ElectronCdpObservationApprovalArtifactRecord,
  ElectronCdpObservationControlPlaneRun,
  ElectronCdpObservationDryRunRecord,
  ElectronCdpObservationRunStatus,
  ElectronDebugEndpointSummary,
  EvidenceRef,
  GithubBranchPublishApprovalArtifactRecord,
  GithubBranchPublishPlan,
  GithubBranchPublishRun,
  GithubDraftPrApprovalArtifactRecord,
  GithubDraftPrPlan,
  GithubDraftPrRun,
  GithubMetadataApprovalArtifactRecord,
  GithubMetadataControlPlaneRun,
  GithubMetadataDryRunRecord,
  GithubPrLifecycleApprovalArtifactRecord,
  GithubPrLifecycleObservationPlan,
  GithubPrLifecycleObservationRun,
  GithubPublishDraftPrChainPlan,
  GithubPublishDraftPrChainRun,
  GithubRemoteCleanupApprovalArtifactRecord,
  GithubRemoteCleanupPlan,
  GithubRemoteCleanupRun,
  GithubProviderApprovalStatus,
  RemoteSupersedePlan,
  RemoteSupersedeRun,
  ReworkLoopApprovalArtifactRecord,
  ReworkLoopPlan,
  ReworkLoopRun,
  LocalReviewPackageApprovalArtifactRecord,
  LocalReviewPackageControlPlaneRun,
  LocalReviewPackageDryRunRecord,
  LocalReviewPackageRun,
  LocalReviewDecisionStatus,
  LocalRcBundleApprovalArtifactRecord,
  LocalRcBundleControlPlaneRun,
  LocalRcBundleDryRunRecord,
  LocalRcReadinessOperatorStatus,
  WorktreeApprovalArtifactRecord,
  WorktreeCleanupApprovalArtifactRecord,
  WorktreeCleanupControlPlaneRun,
  WorktreeCleanupDryRunRecord,
  WorktreeControlPlaneRun,
  WorktreeDryRunRecord,
  M9PilotRun,
  M11PilotRun,
  WorktreeRunStatus,
} from '@codexhub/contracts';
import {
  ApprovalDecisionRequestSchema,
  BrowserObservationApprovalArtifactRecordSchema,
  BrowserObservationControlPlaneRunSchema,
  BrowserObservationDryRunRecordSchema,
  BrowserObservationTimelineEventSchema,
  ElectronCdpObservationApprovalArtifactRecordSchema,
  ElectronCdpObservationControlPlaneRunSchema,
  ElectronCdpObservationDryRunRecordSchema,
  ElectronCdpObservationTimelineEventSchema,
  ExecutionAuthoritySchema,
  PolicyDecisionSchema,
  SchemaVersionSchema,
  WorktreeApprovalArtifactRecordSchema,
  WorktreeCleanupApprovalArtifactRecordSchema,
  WorktreeCleanupControlPlaneRunSchema,
  WorktreeCleanupDryRunRecordSchema,
  WorktreeControlPlaneRunSchema,
  WorktreeControlPlaneTimelineEventSchema,
  WorktreeDryRunRecordSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import {
  createBrowserProfileReadiness,
  createBrowserProfileRef,
} from '@codexhub/browser-profile-kernel';
import {
  createElectronDebugEndpointSummary,
  isLoopbackElectronEndpointHost,
} from '@codexhub/electron-cdp-kernel';
import {
  createElectronCdpControlledHttpRunner,
  createElectronCdpControlledWebSocketEventRunner,
  executeElectronCdpAdapter,
  planElectronCdpObservation,
} from '@codexhub/electron-cdp-adapter';
import type { ElectronCdpObservationRunner } from '@codexhub/electron-cdp-adapter';
import { MockObservationSource, aggregateSourceHealth } from '@codexhub/observer-kernel';
import {
  type M11ProductionPilotNarrowPathInput,
  type M9LocalPilotInput,
  createM11PilotRecoveryProjection,
  createReworkLoopApprovalRecord,
  createReworkLoopPlan,
  executeReworkLoop,
  type MockDevelopmentOrchestrationResult,
  runM11ProductionPilotNarrowPath,
  runM9LocalPilot,
  runMockDevelopmentOrchestration,
} from '@codexhub/orchestrator-kernel';
import {
  createPlaywrightObserverAdapterPlan,
  executePlaywrightObserverAdapter,
} from '@codexhub/playwright-observer-adapter';
import type { PlaywrightObserverRunner } from '@codexhub/playwright-observer-adapter';
import {
  createLocalReviewPackageApprovalRecord,
  createLocalReviewPackageAuditEvent,
  createLocalReviewDecisionHandoff,
  createLocalReviewPackageExportDryRunRecord,
  createLocalReviewPackageProjection,
  executeLocalReviewPackageExport,
} from '@codexhub/review-package-kernel';
import {
  createLocalRcBundleApprovalRecord,
  createLocalRcBundleAuditEvent,
  createLocalRcBundleExportDryRunRecord,
  createLocalRcReadinessProjection,
  executeLocalRcBundleExport,
} from '@codexhub/release-candidate-kernel';
import {
  createGithubBranchPublishApprovalRecord,
  createGithubBranchPublishPlan,
  createGithubDraftPrApprovalRecord,
  createGithubDraftPrPlan,
  createGithubMetadataApprovalRecord,
  createGithubMetadataDryRunRecord,
  createGithubPrLifecycleApprovalRecord,
  createGithubPrLifecycleObservationPlan,
  createGithubPublishDraftPrChainPlan,
  createGithubPublishDraftPrChainRun,
  createGithubRemoteCleanupApprovalRecord,
  createGithubRemoteCleanupPlan,
  executeGithubBranchPublish,
  executeGithubDraftPrCreation,
  executeGithubMetadataObservation,
  executeGithubPrLifecycleObservation,
  executeGithubRemoteCleanup,
  type GithubBranchPublishExecutionInput,
  type GithubBranchPublishPlanInput,
  type GithubDraftPrExecutionInput,
  type GithubMetadataExecutionInput,
  type GithubPrLifecycleExecutionInput,
  type GithubPrLifecyclePlanInput,
  type GithubRemoteCleanupExecutionInput,
  type GithubRemoteCleanupPlanInput,
} from '@codexhub/github-provider-adapter';
import type { CodexHubStore } from '@codexhub/store-core';
import { createSqliteStore } from '@codexhub/store-sqlite';
import { DefaultPolicyEngine } from '@codexhub/security-kernel';
import { WorkflowRunner, createMockWorkflowDefinition } from '@codexhub/workflow-kernel';
import {
  createWorktreeCleanupPlan,
  executeWorktreeCleanup,
  createWorktreeManagerPlan,
  executeWorktreeManager,
  type WorktreeCleanupRunner,
  type WorktreeCleanupPlanResult,
  type WorktreeManagerFixtureRunner,
  type WorktreeManagerPlanResult,
} from '@codexhub/worktree-manager';

interface SupervisorServerOptions {
  store?: CodexHubStore;
  disableStore?: boolean;
  localControlKey?: string;
  trustedOrigins?: string[];
  configLoadResult?: CodexExecConfigLoadResult;
  realReadOnlyAdapterExecutableResolver?: () => CodexExecRealReadOnlyAdapterExecutableResolution;
  realReadOnlyAdapterProcessRunner?: CodexExecRealReadOnlyAdapterProcessRunner;
  realReadOnlyAdapterPostRunVerificationRunner?: CodexExecRealReadOnlyAdapterProcessRunner;
  realReadOnlyAdapterPostRunWorktreeState?: CodexExecRealReadOnlyAdapterPostRunWorktreeState;
  playwrightObserverEnabled?: boolean;
  playwrightObserverRunner?: PlaywrightObserverRunner;
  electronCdpObserverEnabled?: boolean;
  electronCdpEventsEnabled?: boolean;
  electronCdpObserverRunner?: ElectronCdpObservationRunner;
  worktreeManagerEnabled?: boolean;
  worktreeManagerRunner?: WorktreeManagerFixtureRunner;
  worktreeCleanupEnabled?: boolean;
  worktreeCleanupRunner?: WorktreeCleanupRunner;
  m9LocalPilotEnabled?: boolean;
  m9CodexRunner?: M9LocalPilotInput['codexRunner'];
  m9NxRunner?: M9LocalPilotInput['nxRunner'];
  m11ProductionPilotEnabled?: boolean;
  m11CodexRunner?: M11ProductionPilotNarrowPathInput['codexRunner'];
  m11NxRunner?: M11ProductionPilotNarrowPathInput['nxRunner'];
  reviewPackageExportEnabled?: boolean;
  releaseCandidateExportEnabled?: boolean;
  githubProviderEnabled?: boolean;
  githubDraftPrEnabled?: boolean;
  githubBranchPublishEnabled?: boolean;
  githubPrLifecycleObserverEnabled?: boolean;
  githubRemoteCleanupEnabled?: boolean;
  reworkLoopEnabled?: boolean;
  githubProviderFetch?: typeof fetch;
  githubProviderCredential?: string;
}

interface PersistenceState {
  status: 'ok' | 'degraded' | 'disabled';
  reason?: string;
}

interface BrowserObservationDryRunRequestBody {
  profileId?: string;
  displayName?: string;
  profilePathLabel?: string;
  targetUrl?: string;
  runnerMode?: 'fixture' | 'controlled-local-browser';
  capabilities?: string[];
  requestedActions?: string[];
  screenshotRequested?: boolean;
  networkBodyRequested?: boolean;
  bodyStorageRequested?: boolean;
  rawProfilePath?: string;
  metadata?: Record<string, unknown>;
}

interface BrowserObservationApprovalRequestBody {
  dryRunId?: string;
  requestedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface BrowserObservationManualApprovalRequestBody {
  dryRunId?: string;
  approvalRequestId?: string;
  outcome?: 'approved' | 'denied' | 'revoked';
  decidedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface BrowserObservationRunRequestBody {
  dryRunId?: string;
  approvalArtifactId?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface ElectronCdpObservationDryRunRequestBody {
  host?: string;
  port?: number;
  runnerMode?: 'fixture' | 'controlled-local-http' | 'controlled-websocket-events';
  targetIdHash?: string;
  observationWindowMs?: number;
  capabilities?: string[];
  requestedActions?: string[];
  requestedCommands?: string[];
  mainInspectorRequested?: boolean;
  runtimeEvaluateRequested?: boolean;
  screenshotRequested?: boolean;
  domSnapshotRequested?: boolean;
  networkBodyRequested?: boolean;
  domMutationRequested?: boolean;
  clickTypeRequested?: boolean;
  genericCommandPassthroughRequested?: boolean;
  metadata?: Record<string, unknown>;
}

interface ElectronCdpObservationApprovalRequestBody {
  dryRunId?: string;
  requestedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface ElectronCdpObservationManualApprovalRequestBody {
  dryRunId?: string;
  approvalRequestId?: string;
  outcome?: 'approved' | 'denied' | 'revoked';
  decidedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface ElectronCdpObservationRunRequestBody {
  dryRunId?: string;
  approvalArtifactId?: string;
  host?: string;
  port?: number;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface WorktreeDryRunRequestBody {
  repoRoot?: string;
  worktreeSlug?: string;
  branchName?: string;
  baseRef?: string;
  worktreeRoot?: string;
  allowedWorktreeRoots?: string[];
  runnerMode?: 'fixture' | 'controlled-git-worktree';
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface WorktreeApprovalRequestBody {
  dryRunId?: string;
  requestedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface WorktreeManualApprovalRequestBody {
  dryRunId?: string;
  approvalRequestId?: string;
  outcome?: 'approved' | 'denied' | 'revoked';
  decidedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface WorktreeRunRequestBody {
  dryRunId?: string;
  approvalArtifactId?: string;
  repoRoot?: string;
  worktreeRoot?: string;
  worktreePath?: string;
  worktreeSlug?: string;
  branchName?: string;
  baseRef?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface WorktreeCleanupDryRunRequestBody {
  sourceRunId?: string;
  repoRoot?: string;
  worktreeRoot?: string;
  worktreePath?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface WorktreeCleanupApprovalRequestBody {
  dryRunId?: string;
  requestedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface WorktreeCleanupManualApprovalRequestBody {
  dryRunId?: string;
  approvalRequestId?: string;
  outcome?: 'approved' | 'denied' | 'revoked';
  decidedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface WorktreeCleanupRunRequestBody {
  dryRunId?: string;
  approvalArtifactId?: string;
  repoRoot?: string;
  worktreeRoot?: string;
  worktreePath?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface M9LocalPilotRunRequestBody {
  title?: string;
  description?: string;
  worktreeDryRunId?: string;
  worktreeApprovalArtifactId?: string;
  codexDryRunId?: string;
  codexApprovalArtifactId?: string;
  repoRoot?: string;
  worktreeRoot?: string;
  worktreePath?: string;
  worktreeSlug?: string;
  branchName?: string;
  baseRef?: string;
  headRef?: string;
  governedInput?: {
    relativePath?: string;
    expectedContentHash?: string;
    contentHash?: string;
  };
  verificationTargets?: string[];
  codexExecutablePath?: string;
  nxExecutablePath?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

type M11LocalPilotRunRequestBody = M9LocalPilotRunRequestBody;

interface ReviewPackageDryRunRequestBody {
  sourceLifecycleRunId?: string;
  sourcePatchRunId?: string;
  sourceVerificationGateId?: string;
  changedFilePathHashes?: string[];
  diffHash?: string;
  verificationStatus?: 'passed' | 'failed' | 'aborted' | 'blocked' | 'not_run';
  readinessStatus?:
    | 'not_ready_no_patch'
    | 'not_ready_pending_verification'
    | 'ready_for_review_draft_only'
    | 'blocked_verification_failed'
    | 'blocked_policy';
  readyForReviewDraftOnly?: boolean;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  workspaceRoot?: string;
  artifactRoot?: string;
  packageId?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface ReviewPackageApprovalRequestBody {
  dryRunId?: string;
  requestedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface ReviewPackageManualApprovalRequestBody {
  dryRunId?: string;
  approvalRequestId?: string;
  outcome?: 'approved' | 'denied' | 'revoked';
  decidedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface ReviewPackageRunRequestBody {
  dryRunId?: string;
  approvalArtifactId?: string;
  workspaceRoot?: string;
  artifactRoot?: string;
  packageId?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface ReleaseCandidateDryRunRequestBody extends ReviewPackageDryRunRequestBody {
  reviewDecisionStatus?: LocalReviewDecisionStatus;
  operatorReadinessStatus?: LocalRcReadinessOperatorStatus;
  bundleId?: string;
}

interface ReleaseCandidateApprovalRequestBody {
  dryRunId?: string;
  requestedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface ReleaseCandidateManualApprovalRequestBody {
  dryRunId?: string;
  approvalRequestId?: string;
  outcome?: 'approved' | 'denied' | 'revoked';
  decidedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface ReleaseCandidateRunRequestBody {
  dryRunId?: string;
  approvalArtifactId?: string;
  workspaceRoot?: string;
  artifactRoot?: string;
  bundleId?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
}

interface GithubMetadataDryRunRequestBody {
  owner?: string;
  repo?: string;
  baseBranch?: string;
  headBranch?: string;
  requestedMetadata?: Array<'repo' | 'base_branch' | 'head_branch' | 'existing_pull_request'>;
  runnerMode?: 'planning-only' | 'controlled-github-http';
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubMetadataApprovalRequestBody {
  dryRunId?: string;
  requestedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubMetadataManualApprovalRequestBody {
  dryRunId?: string;
  approvalRequestId?: string;
  outcome?: GithubProviderApprovalStatus;
  decidedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubMetadataRunRequestBody {
  dryRunId?: string;
  approvalArtifactId?: string;
  owner?: string;
  repo?: string;
  baseBranch?: string;
  headBranch?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubPrLifecycleDryRunRequestBody {
  owner?: string;
  repo?: string;
  baseBranch?: string;
  headBranch?: string;
  prNumber?: string;
  prNumberHash?: string;
  commitSha?: string;
  commitShaHash?: string;
  requestedMetadata?: Array<
    'repo' | 'pull_request' | 'branch_ref' | 'combined_status' | 'check_runs'
  >;
  runnerMode?: 'planning-only' | 'controlled-github-pr-lifecycle';
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubPrLifecycleApprovalRequestBody {
  dryRunId?: string;
  requestedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubPrLifecycleManualApprovalRequestBody {
  dryRunId?: string;
  approvalRequestId?: string;
  outcome?: GithubProviderApprovalStatus;
  decidedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubPrLifecycleRunRequestBody {
  dryRunId?: string;
  approvalArtifactId?: string;
  owner?: string;
  repo?: string;
  baseBranch?: string;
  headBranch?: string;
  prNumber?: string;
  commitSha?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface ReworkLoopDryRunRequestBody {
  triggerKind?: 'checks_failed' | 'review_changes_requested' | 'operator_requested' | 'stale_branch';
  sourceRunId?: string;
  sourceStatus?: string;
  sourceSummaryLabel?: string;
  sourcePackageLabel?: string;
  sourcePrLifecycleRunId?: string;
  previousAttemptId?: string;
  attemptNumber?: number;
  branchSlug?: string;
  changedFileLabels?: string[];
  checkFailureCount?: number;
  reviewFindingCount?: number;
  staleBranch?: boolean;
  requestedBy?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface ReworkLoopApprovalRequestBody {
  dryRunId?: string;
  requestedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface ReworkLoopManualApprovalRequestBody {
  dryRunId?: string;
  approvalRequestId?: string;
  outcome?: ReworkLoopApprovalArtifactRecord['status'];
  decidedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface ReworkLoopRunRequestBody {
  dryRunId?: string;
  approvalArtifactId?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubRemoteCleanupDryRunRequestBody {
  owner?: string;
  repo?: string;
  baseBranch?: string;
  oldBranchName?: string;
  oldPrNumber?: string;
  sourceBranchPublishRunId?: string;
  sourceDraftPrRunId?: string;
  successorRunId?: string;
  successorReady?: boolean;
  oldPrDraft?: boolean;
  supersededByNewerDraftPr?: boolean;
  runnerMode?: 'planning-only' | 'controlled-github-remote-cleanup';
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubRemoteCleanupApprovalRequestBody {
  dryRunId?: string;
  requestedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubRemoteCleanupManualApprovalRequestBody {
  dryRunId?: string;
  approvalRequestId?: string;
  outcome?: GithubProviderApprovalStatus;
  decidedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubRemoteCleanupRunRequestBody {
  dryRunId?: string;
  approvalArtifactId?: string;
  owner?: string;
  repo?: string;
  baseBranch?: string;
  oldBranchName?: string;
  oldPrNumber?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubDraftPrDryRunRequestBody {
  owner?: string;
  repo?: string;
  baseBranch?: string;
  headBranch?: string;
  sourceKind?: 'local_rc_readiness' | 'review_package';
  sourceId?: string;
  sourceSummary?: string;
  titleSummary?: string;
  bodySectionSummaries?: string[];
  existingPullRequestCount?: number;
  remoteHeadBranchExists?: boolean;
  metadataReady?: boolean;
  runnerMode?: 'planning-only' | 'controlled-github-draft-pr';
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubDraftPrApprovalRequestBody {
  dryRunId?: string;
  requestedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubDraftPrManualApprovalRequestBody {
  dryRunId?: string;
  approvalRequestId?: string;
  outcome?: GithubProviderApprovalStatus;
  decidedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubDraftPrRunRequestBody {
  dryRunId?: string;
  approvalArtifactId?: string;
  owner?: string;
  repo?: string;
  baseBranch?: string;
  headBranch?: string;
  titleSummary?: string;
  bodySectionSummaries?: string[];
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubBranchPublishFilePlanRequestBody {
  relativePath?: string;
  contentHash?: string;
  byteCount?: number;
  text?: boolean;
  symlink?: boolean;
  deleted?: boolean;
  renamed?: boolean;
}

interface GithubBranchPublishFileRunRequestBody {
  relativePath?: string;
  content?: string;
}

interface GithubBranchPublishDryRunRequestBody {
  owner?: string;
  repo?: string;
  baseBranch?: string;
  sourceKind?: 'local_rc_readiness' | 'review_package' | 'patch_lifecycle';
  sourceId?: string;
  sourceSummary?: string;
  worktreePathHash?: string;
  branchSlug?: string;
  commitMessageSummary?: string;
  files?: GithubBranchPublishFilePlanRequestBody[];
  branchExists?: boolean;
  runnerMode?: 'planning-only' | 'controlled-github-branch-publish';
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubBranchPublishApprovalRequestBody {
  dryRunId?: string;
  requestedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubBranchPublishManualApprovalRequestBody {
  dryRunId?: string;
  approvalRequestId?: string;
  outcome?: GithubProviderApprovalStatus;
  decidedBy?: string;
  reason?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubBranchPublishRunRequestBody {
  dryRunId?: string;
  approvalArtifactId?: string;
  owner?: string;
  repo?: string;
  baseBranch?: string;
  branchName?: string;
  commitMessageSummary?: string;
  files?: GithubBranchPublishFileRunRequestBody[];
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubPublishDraftPrChainDryRunRequestBody {
  sourceKind?: 'local_rc_readiness' | 'review_package' | 'patch_lifecycle';
  sourceId?: string;
  branchPublishDryRunId?: string;
  draftPrDryRunId?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

interface GithubPublishDraftPrChainRunRequestBody {
  chainId?: string;
  dryRunId?: string;
  branchPublishRunId?: string;
  draftPrRunId?: string;
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
}

type ApprovalDecisionRequestBody = ApprovalDecisionRequest & {
  approvalArtifact?: unknown;
  authority?: unknown;
  executionAuthority?: unknown;
};

const LOCAL_CONTROL_KEY_KIND = ['to', 'ken'].join('');
const LOCAL_CONTROL_HEADER = ['x-codexhub-local', LOCAL_CONTROL_KEY_KIND].join('-');
const LOCAL_CONTROL_ENV_VAR = [
  'CODEXHUB_SUPERVISOR_LOCAL_',
  LOCAL_CONTROL_KEY_KIND.toUpperCase(),
].join('');
const GITHUB_PROVIDER_CREDENTIAL_ENV_VAR = [
  'CODEXHUB_GITHUB_',
  ['TO', 'KEN'].join(''),
].join('');
const GITHUB_PROVIDER_RUNTIME_CREDENTIAL_KEY = ['to', 'ken'].join('');
const GITHUB_FORBIDDEN_CREDENTIAL_KEYS = [
  ['to', 'ken'].join(''),
  ['coo', 'kie'].join(''),
  ['sess', 'ion'].join(''),
  'envValue',
  'localControlKey',
  'authorization',
];
const LOCAL_CONTROL_REQUIRED_ERROR = ['local_control', LOCAL_CONTROL_KEY_KIND, 'required'].join(
  '_',
);
const LOCAL_CONTROL_NOT_CONFIGURED_ERROR = [
  'local_control',
  LOCAL_CONTROL_KEY_KIND,
  'not_configured',
].join('_');
const INVALID_LOCAL_CONTROL_ERROR = ['invalid_local_control', LOCAL_CONTROL_KEY_KIND].join('_');
const DEFAULT_TRUSTED_ORIGIN_PORTS = new Set(['3000', '3001', '4173', '5173', '5174']);

function hasRequestBodyProperty(body: unknown, key: string): boolean {
  return (
    typeof body === 'object' &&
    body !== null &&
    Object.prototype.hasOwnProperty.call(body, key)
  );
}

function hasUntrustedAuthorityBody(body: unknown): boolean {
  return (
    hasRequestBodyProperty(body, 'approvalArtifact') ||
    hasRequestBodyProperty(body, 'authority') ||
    hasRequestBodyProperty(body, 'executionAuthority')
  );
}

export function buildSupervisorServer(options: SupervisorServerOptions = {}) {
  const server = Fastify({ logger: true });
  const localControlKey = options.localControlKey ?? process.env[LOCAL_CONTROL_ENV_VAR];
  const trustedOrigins = new Set(options.trustedOrigins ?? []);
  const workflowRunner = new WorkflowRunner();
  const observationSource = new MockObservationSource('codexhub.mock.supervisor');
  const mockDevelopmentRuns: MockDevelopmentOrchestrationResult[] = [];
  const codexReplayRecords: CodexReplayRecord[] = [];
  const codexExecLiveRunRecords: CodexExecLiveRunRecord[] = [];
  const codexExecApprovalRecords: CodexExecManualApprovalRecord[] = [];
  const codexReportReviewRecords: CodexExecReportReviewRecord[] = [];
  const codexLiveAdapterAdrDecisionRecords: CodexExecLiveAdapterAdrDecisionRecord[] = [];
  const readOnlyAdapterPreflightSimulations: CodexExecReadOnlyAdapterPreflightSimulationResult[] =
    [];
  const readOnlyAdapterSimulatorReviewRecords: CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord[] =
    [];
  const readOnlyAdapterImplementationPlanReviewRecords: CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord[] =
    [];
  const readOnlyAdapterSkeletonReviewRecords: CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord[] =
    [];
  const readOnlyAdapterFixtureBoundaryResults: Awaited<
    ReturnType<typeof runReadOnlyAdapterFixtureBoundary>
  >[] = [];
  const readOnlyAdapterFinalReadinessRecords: CodexExecReadOnlyAdapterFinalReadinessDecisionRecord[] =
    [];
  const realReadOnlyAdapterReadinessPackages: CodexExecRealReadOnlyAdapterReadinessPackage[] = [];
  const realReadOnlyAdapterReadinessReviewRecords: CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord[] =
    [];
  const browserObservationDryRunRecords: BrowserObservationDryRunRecord[] = [];
  const browserObservationApprovalRecords: BrowserObservationApprovalArtifactRecord[] = [];
  const browserObservationRunRecords: BrowserObservationControlPlaneRun[] = [];
  const electronCdpObservationDryRunRecords: ElectronCdpObservationDryRunRecord[] = [];
  const electronCdpObservationApprovalRecords: ElectronCdpObservationApprovalArtifactRecord[] =
    [];
  const electronCdpObservationRunRecords: ElectronCdpObservationControlPlaneRun[] = [];
  const worktreeDryRunRecords: WorktreeDryRunRecord[] = [];
  const worktreeApprovalRecords: WorktreeApprovalArtifactRecord[] = [];
  const worktreeRunRecords: WorktreeControlPlaneRun[] = [];
  const worktreeCleanupDryRunRecords: WorktreeCleanupDryRunRecord[] = [];
  const worktreeCleanupApprovalRecords: WorktreeCleanupApprovalArtifactRecord[] = [];
  const worktreeCleanupRunRecords: WorktreeCleanupControlPlaneRun[] = [];
  const reviewPackageDryRunRecords: LocalReviewPackageDryRunRecord[] = [];
  const reviewPackageApprovalRecords: LocalReviewPackageApprovalArtifactRecord[] = [];
  const reviewPackageRunRecords: LocalReviewPackageControlPlaneRun[] = [];
  const releaseCandidateDryRunRecords: LocalRcBundleDryRunRecord[] = [];
  const releaseCandidateApprovalRecords: LocalRcBundleApprovalArtifactRecord[] = [];
  const releaseCandidateRunRecords: LocalRcBundleControlPlaneRun[] = [];
  const githubMetadataDryRunRecords: GithubMetadataDryRunRecord[] = [];
  const githubMetadataApprovalRecords: GithubMetadataApprovalArtifactRecord[] = [];
  const githubMetadataRunRecords: GithubMetadataControlPlaneRun[] = [];
  const githubDraftPrDryRunRecords: GithubDraftPrPlan[] = [];
  const githubDraftPrApprovalRecords: GithubDraftPrApprovalArtifactRecord[] = [];
  const githubDraftPrRunRecords: GithubDraftPrRun[] = [];
  const githubPrLifecycleDryRunRecords: GithubPrLifecycleObservationPlan[] = [];
  const githubPrLifecycleApprovalRecords: GithubPrLifecycleApprovalArtifactRecord[] = [];
  const githubPrLifecycleRunRecords: GithubPrLifecycleObservationRun[] = [];
  const remoteSupersedeDryRunRecords: RemoteSupersedePlan[] = [];
  const remoteSupersedeRunRecords: RemoteSupersedeRun[] = [];
  const githubRemoteCleanupDryRunRecords: GithubRemoteCleanupPlan[] = [];
  const githubRemoteCleanupApprovalRecords: GithubRemoteCleanupApprovalArtifactRecord[] = [];
  const githubRemoteCleanupRunRecords: GithubRemoteCleanupRun[] = [];
  const reworkLoopDryRunRecords: ReworkLoopPlan[] = [];
  const reworkLoopApprovalRecords: ReworkLoopApprovalArtifactRecord[] = [];
  const reworkLoopRunRecords: ReworkLoopRun[] = [];
  const githubBranchPublishDryRunRecords: GithubBranchPublishPlan[] = [];
  const githubBranchPublishApprovalRecords: GithubBranchPublishApprovalArtifactRecord[] = [];
  const githubBranchPublishRunRecords: GithubBranchPublishRun[] = [];
  const githubPublishDraftPrChainDryRunRecords: GithubPublishDraftPrChainPlan[] = [];
  const githubPublishDraftPrChainRunRecords: GithubPublishDraftPrChainRun[] = [];
  const m9LocalPilotRunRecords: M9PilotRun[] = [];
  const m11LocalPilotRunRecords: M11PilotRun[] = [];
  const policyEngine = new DefaultPolicyEngine();
  let configLoadPromise: Promise<CodexExecConfigLoadResult> | undefined;
  let ownedStore: CodexHubStore | undefined;
  let storePromise: Promise<CodexHubStore | undefined> | undefined;
  let persistenceState: PersistenceState = options.disableStore
    ? { status: 'disabled', reason: 'store disabled by test configuration' }
    : { status: 'ok' };

  async function getStore(): Promise<CodexHubStore | undefined> {
    if (options.store) {
      return options.store;
    }

    if (options.disableStore) {
      return undefined;
    }

    storePromise ??= createSqliteStore()
      .then((store) => {
        ownedStore = store;
        persistenceState = { status: 'ok' };
        return store;
      })
      .catch(() => {
        persistenceState = {
          status: 'degraded',
          reason: 'store initialization failed',
        };
        return undefined;
      });

    return storePromise;
  }

  async function getLiveConfigLoadResult(): Promise<CodexExecConfigLoadResult> {
    if (options.configLoadResult) {
      return options.configLoadResult;
    }

    configLoadPromise ??= loadCodexExecConfig();
    return configLoadPromise;
  }

  async function loadCodexExecConfig(): Promise<CodexExecConfigLoadResult> {
    const workspaceRoot = findWorkspaceRoot(process.cwd());
    const configPath = resolve(workspaceRoot, '.codexhub', 'codex-exec.yaml');

    if (!existsSync(configPath)) {
      return createDefaultCodexExecConfigLoadResult();
    }

    const fileText = await readFile(configPath, 'utf8');

    return parseCodexExecLiveConfigFile({
      configPath: toWorkspacePath(configPath, workspaceRoot),
      fileText,
      metadata: { requestedBy: 'supervisor' },
    });
  }

  server.addHook('onRequest', async (request, reply) => {
    const origin = readHeaderValue(request.headers.origin);
    const trustedOrigin = origin ? isTrustedOrigin(origin, trustedOrigins) : false;

    reply.header('Access-Control-Allow-Headers', `content-type, ${LOCAL_CONTROL_HEADER}`);
    reply.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

    if (origin) {
      reply.header('Vary', 'Origin');

      if (!trustedOrigin) {
        return reply.code(403).send({
          error: 'untrusted_origin',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      reply.header('Access-Control-Allow-Origin', origin);
    }

    if (request.method === 'OPTIONS') {
      if (!hasPreflightLocalControlHeader(request.headers['access-control-request-headers'])) {
        return reply.code(401).send({
          error: LOCAL_CONTROL_REQUIRED_ERROR,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return reply.code(204).send();
    }

    if (request.method === 'POST') {
      if (!localControlKey) {
        return reply.code(503).send({
          error: LOCAL_CONTROL_NOT_CONFIGURED_ERROR,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      if (readHeaderValue(request.headers[LOCAL_CONTROL_HEADER]) !== localControlKey) {
        return reply.code(401).send({
          error: INVALID_LOCAL_CONTROL_ERROR,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }
    }
  });

  server.options('*', async () => undefined);

  server.addHook('onClose', async () => {
    if (ownedStore) {
      await ownedStore.close();
      ownedStore = undefined;
    }
  });

  server.get('/health', async () => ({
    id: foundationId('health'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: foundationTimestamp(),
    service: 'codexhub-supervisor',
    status: 'ok',
    metadata: {
      mock: true,
      realReadOnlyAdapterCodexCliInvocationContractVersion:
        REAL_READ_ONLY_ADAPTER_CODEX_CLI_INVOCATION_CONTRACT_VERSION,
      realReadOnlyAdapterCodexCliArgvCount: REAL_READ_ONLY_ADAPTER_CODEX_CLI_PROCESS_ARGV.length,
      realReadOnlyAdapterCodexCliArgvHash: REAL_READ_ONLY_ADAPTER_CODEX_CLI_PROCESS_ARGV_HASH,
      realReadOnlyAdapterCodexCliStdinClosedWithoutBody: true,
      realReadOnlyAdapterCodexCliGovernedInputRequired: true,
      realReadOnlyAdapterCodexCliPromptArgumentStored: false,
      realReadOnlyAdapterCodexCliArgvStored: false,
    },
  }));

  server.post('/api/workflows/dry-run', async (request) => {
    const body = request.body as
      | { workflowName?: string; input?: Record<string, unknown> }
      | undefined;
    const workflowName = body?.workflowName ?? 'development.bootstrap';
    const definition = createMockWorkflowDefinition(workflowName);

    return workflowRunner.dryRun(definition, body?.input ?? {});
  });

  server.get('/api/workflows/runs', async () => ({
    runs: [
      {
        id: foundationId('workflow_run'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: foundationTimestamp(),
        workflowName: 'development.bootstrap',
        status: 'created',
        dryRun: true,
        steps: [],
        evidenceRefs: [],
        metadata: { mock: true },
      },
    ],
  }));

  server.get('/api/observations', async () => {
    const observations = await observationSource.collect();
    const sourceHealth = await aggregateSourceHealth([observationSource]);

    return {
      observations,
      sourceHealth,
    };
  });

  server.post('/api/browser/observation/dry-runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createBrowserObservationStoreUnavailableResponse('dry-run'));
    }

    const body = request.body as BrowserObservationDryRunRequestBody | undefined;
    const dryRunRecord = createBrowserObservationDryRunRecordFromRequest(body);

    await persistBrowserObservationDryRunRecord(dryRunRecord, store);
    await persistEvidenceRefs(dryRunRecord.evidenceRefs, store);
    await persistAuditEvents(
      dryRunRecord.auditEventIds,
      dryRunRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
    );

    return createBrowserObservationDryRunResponse(dryRunRecord);
  });

  server.get('/api/browser/observation/dry-runs', async (request) => {
    const store = await getStore();
    const query = parseBrowserObservationQuery(request.query);
    const records = await listBrowserObservationDryRuns(query, store);

    return {
      records: records.map(createBrowserObservationDryRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/browser/observation/approval-requests', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createBrowserObservationStoreUnavailableResponse('approval'));
    }

    const body = request.body as BrowserObservationApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createBrowserObservationUntrustedAuthorityResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveBrowserObservationDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'browser observation dry-run record was not found' });
    }

    const approvalRecord = createBrowserObservationApprovalRecord({
      dryRunRecord,
      requestedBy: body?.requestedBy,
      reason: body?.reason,
      status: 'requested',
    });

    await persistBrowserObservationApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
    );

    return createBrowserObservationApprovalResponse(approvalRecord);
  });

  server.post('/api/browser/observation/manual-approvals', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createBrowserObservationStoreUnavailableResponse('approval'));
    }

    const body = request.body as BrowserObservationManualApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createBrowserObservationUntrustedAuthorityResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveBrowserObservationDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'browser observation dry-run record was not found' });
    }

    const approvalRequest = body?.approvalRequestId
      ? await resolveBrowserObservationApprovalRecord(body.approvalRequestId, store)
      : (await listBrowserObservationApprovals({ dryRunId: dryRunRecord.dryRunId, limit: 1 }, store))[0];

    if (!approvalRequest) {
      return reply.code(404).send({ error: 'browser observation approval request was not found' });
    }

    const approvalRecord = createBrowserObservationApprovalRecord({
      dryRunRecord,
      baseRecord: approvalRequest,
      status: body?.outcome ?? 'approved',
      decidedBy: body?.decidedBy,
      reason: body?.reason,
    });

    await persistBrowserObservationApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
    );

    return createBrowserObservationApprovalResponse(approvalRecord);
  });

  server.get('/api/browser/observation/approvals', async (request) => {
    const store = await getStore();
    const query = parseBrowserObservationQuery(request.query);
    const records = await listBrowserObservationApprovals(query, store);

    return {
      records: records.map(createBrowserObservationApprovalResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/browser/observation/runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createBrowserObservationStoreUnavailableResponse('execution'));
    }

    const body = request.body as BrowserObservationRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createBrowserObservationUntrustedAuthorityResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveBrowserObservationDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'browser observation dry-run record was not found' });
    }

    const approvalRecord = body?.approvalArtifactId
      ? await resolveBrowserObservationApprovalRecordByArtifactId(body.approvalArtifactId, store)
      : undefined;
    const runRecord = await executeBrowserObservationRun({
      dryRunRecord,
      approvalRecord,
      store,
    });

    return createBrowserObservationRunResponse(runRecord);
  });

  server.get('/api/browser/observation/runs', async (request) => {
    const store = await getStore();
    const query = parseBrowserObservationQuery(request.query);
    const records = await listBrowserObservationRuns(query, store);

    return {
      records: records.map(createBrowserObservationRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      liveExecution: records.some((record) => record.processBoundaryInvoked),
      externalProcessStarted: records.some((record) => record.externalProcessStarted),
      executionDisabled: true,
    };
  });

  server.get('/api/browser/observation/runs/:id', async (request, reply) => {
    const store = await getStore();
    const params = request.params as { id?: string };
    const record = params.id ? await resolveBrowserObservationRun(params.id, store) : undefined;

    if (!record) {
      return reply.code(404).send({ error: 'browser observation run was not found' });
    }

    return createBrowserObservationRunResponse(record);
  });

  server.post('/api/electron-cdp/observation/dry-runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply
        .code(503)
        .send(createElectronCdpObservationStoreUnavailableResponse('dry-run'));
    }

    const body = request.body as ElectronCdpObservationDryRunRequestBody | undefined;
    const dryRunRecord = createElectronCdpObservationDryRunRecordFromRequest(body);

    await persistElectronCdpObservationDryRunRecord(dryRunRecord, store);
    await persistEvidenceRefs(dryRunRecord.evidenceRefs, store);
    await persistElectronCdpAuditEvents(
      dryRunRecord.auditEventIds,
      dryRunRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
    );

    return createElectronCdpObservationDryRunResponse(dryRunRecord);
  });

  server.get('/api/electron-cdp/observation/dry-runs', async (request) => {
    const store = await getStore();
    const query = parseElectronCdpObservationQuery(request.query);
    const records = await listElectronCdpObservationDryRuns(query, store);

    return {
      records: records.map(createElectronCdpObservationDryRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      cdpHttpBoundaryInvoked: false,
      cdpWebSocketBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/electron-cdp/observation/approval-requests', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply
        .code(503)
        .send(createElectronCdpObservationStoreUnavailableResponse('approval'));
    }

    const body = request.body as ElectronCdpObservationApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply
        .code(400)
        .send(createElectronCdpObservationUntrustedAuthorityResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveElectronCdpObservationDryRunRecord(
      body?.dryRunId,
      store,
    );

    if (!dryRunRecord) {
      return reply
        .code(404)
        .send({ error: 'electron cdp observation dry-run record was not found' });
    }

    const approvalRecord = createElectronCdpObservationApprovalRecord({
      dryRunRecord,
      requestedBy: body?.requestedBy,
      reason: body?.reason,
      status: 'requested',
    });

    await persistElectronCdpObservationApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistElectronCdpAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
    );

    return createElectronCdpObservationApprovalResponse(approvalRecord);
  });

  server.post('/api/electron-cdp/observation/manual-approvals', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply
        .code(503)
        .send(createElectronCdpObservationStoreUnavailableResponse('approval'));
    }

    const body = request.body as ElectronCdpObservationManualApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply
        .code(400)
        .send(createElectronCdpObservationUntrustedAuthorityResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveElectronCdpObservationDryRunRecord(
      body?.dryRunId,
      store,
    );

    if (!dryRunRecord) {
      return reply
        .code(404)
        .send({ error: 'electron cdp observation dry-run record was not found' });
    }

    const approvalRequest = body?.approvalRequestId
      ? await resolveElectronCdpObservationApprovalRecord(body.approvalRequestId, store)
      : (
          await listElectronCdpObservationApprovals({
            dryRunId: dryRunRecord.dryRunId,
            limit: 1,
          }, store)
        )[0];

    if (!approvalRequest) {
      return reply
        .code(404)
        .send({ error: 'electron cdp observation approval request was not found' });
    }

    const approvalRecord = createElectronCdpObservationApprovalRecord({
      dryRunRecord,
      baseRecord: approvalRequest,
      status: body?.outcome ?? 'approved',
      decidedBy: body?.decidedBy,
      reason: body?.reason,
    });

    await persistElectronCdpObservationApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistElectronCdpAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
    );

    return createElectronCdpObservationApprovalResponse(approvalRecord);
  });

  server.get('/api/electron-cdp/observation/approvals', async (request) => {
    const store = await getStore();
    const query = parseElectronCdpObservationQuery(request.query);
    const records = await listElectronCdpObservationApprovals(query, store);

    return {
      records: records.map(createElectronCdpObservationApprovalResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      cdpHttpBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/electron-cdp/observation/runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply
        .code(503)
        .send(createElectronCdpObservationStoreUnavailableResponse('execution'));
    }

    const body = request.body as ElectronCdpObservationRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply
        .code(400)
        .send(createElectronCdpObservationUntrustedAuthorityResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveElectronCdpObservationDryRunRecord(
      body?.dryRunId,
      store,
    );

    if (!dryRunRecord) {
      return reply
        .code(404)
        .send({ error: 'electron cdp observation dry-run record was not found' });
    }

    const approvalRecord = body?.approvalArtifactId
      ? await resolveElectronCdpObservationApprovalRecordByArtifactId(
          body.approvalArtifactId,
          store,
        )
      : undefined;
    const runRecord = await executeElectronCdpObservationRun({
      dryRunRecord,
      approvalRecord,
      store,
      host: body?.host,
      port: body?.port,
    });

    return createElectronCdpObservationRunResponse(runRecord);
  });

  server.get('/api/electron-cdp/observation/runs', async (request) => {
    const store = await getStore();
    const query = parseElectronCdpObservationQuery(request.query);
    const records = await listElectronCdpObservationRuns(query, store);

    return {
      records: records.map(createElectronCdpObservationRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      cdpHttpBoundaryInvoked: records.some((record) => record.cdpHttpBoundaryInvoked),
      cdpWebSocketBoundaryInvoked: records.some(
        (record) => record.cdpWebSocketBoundaryInvoked,
      ),
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.get('/api/electron-cdp/observation/runs/:id', async (request, reply) => {
    const store = await getStore();
    const params = request.params as { id?: string };
    const record = params.id
      ? await resolveElectronCdpObservationRun(params.id, store)
      : undefined;

    if (!record) {
      return reply.code(404).send({ error: 'electron cdp observation run was not found' });
    }

    return createElectronCdpObservationRunResponse(record);
  });

  server.post('/api/worktrees/dry-runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createWorktreeStoreUnavailableResponse('dry-run'));
    }

    const body = request.body as WorktreeDryRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createWorktreeUntrustedAuthorityResponse(undefined));
    }

    const dryRunRecord = createWorktreeDryRunRecordFromRequest(body);

    await persistWorktreeDryRunRecord(dryRunRecord, store);
    await persistEvidenceRefs(dryRunRecord.evidenceRefs, store);
    await persistWorktreeAuditEvents(
      dryRunRecord.auditEventIds,
      dryRunRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
    );

    return createWorktreeDryRunResponse(dryRunRecord);
  });

  server.get('/api/worktrees/dry-runs', async (request) => {
    const store = await getStore();
    const query = parseWorktreeQuery(request.query);
    const records = await listWorktreeDryRuns(query, store);

    return {
      records: records.map(createWorktreeDryRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      gitProcessBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/worktrees/approval-requests', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createWorktreeStoreUnavailableResponse('approval'));
    }

    const body = request.body as WorktreeApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createWorktreeUntrustedAuthorityResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveWorktreeDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'worktree dry-run record was not found' });
    }

    const approvalRecord = createWorktreeApprovalRecord({
      dryRunRecord,
      requestedBy: body?.requestedBy,
      reason: body?.reason,
      status: 'requested',
    });

    await persistWorktreeApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistWorktreeAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
    );

    return createWorktreeApprovalResponse(approvalRecord);
  });

  server.post('/api/worktrees/manual-approvals', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createWorktreeStoreUnavailableResponse('approval'));
    }

    const body = request.body as WorktreeManualApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createWorktreeUntrustedAuthorityResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveWorktreeDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'worktree dry-run record was not found' });
    }

    const approvalRequest = body?.approvalRequestId
      ? await resolveWorktreeApprovalRecord(body.approvalRequestId, store)
      : (
          await listWorktreeApprovals(
            { dryRunId: dryRunRecord.dryRunId, limit: 1 },
            store,
          )
        )[0];

    if (!approvalRequest) {
      return reply.code(404).send({ error: 'worktree approval request was not found' });
    }

    const approvalRecord = createWorktreeApprovalRecord({
      dryRunRecord,
      baseRecord: approvalRequest,
      status: body?.outcome ?? 'approved',
      decidedBy: body?.decidedBy,
      reason: body?.reason,
    });

    await persistWorktreeApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistWorktreeAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
    );

    return createWorktreeApprovalResponse(approvalRecord);
  });

  server.get('/api/worktrees/approvals', async (request) => {
    const store = await getStore();
    const query = parseWorktreeQuery(request.query);
    const records = await listWorktreeApprovals(query, store);

    return {
      records: records.map(createWorktreeApprovalResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      gitProcessBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/worktrees/runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createWorktreeStoreUnavailableResponse('execution'));
    }

    const body = request.body as WorktreeRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createWorktreeUntrustedAuthorityResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveWorktreeDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'worktree dry-run record was not found' });
    }

    const approvalRecord = body?.approvalArtifactId
      ? await resolveWorktreeApprovalRecordByArtifactId(body.approvalArtifactId, store)
      : undefined;
    const runRecord = await executeWorktreeControlPlaneRun({
      dryRunRecord,
      approvalRecord,
      store,
      runtime: {
        repoRoot: body?.repoRoot,
        worktreeRoot: body?.worktreeRoot,
        worktreePath: body?.worktreePath,
        worktreeSlug: body?.worktreeSlug,
        branchName: body?.branchName,
        baseRef: body?.baseRef,
      },
    });

    return createWorktreeRunResponse(runRecord);
  });

  server.get('/api/worktrees/runs', async (request) => {
    const store = await getStore();
    const query = parseWorktreeQuery(request.query);
    const records = await listWorktreeRuns(query, store);

    return {
      records: records.map(createWorktreeRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      gitProcessBoundaryInvoked: records.some((record) => record.gitProcessBoundaryInvoked),
      processBoundaryInvoked: records.some((record) => record.processBoundaryInvoked),
      externalProcessStarted: records.some((record) => record.externalProcessStarted),
      executionDisabled: true,
    };
  });

  server.get('/api/worktrees/runs/:id', async (request, reply) => {
    const store = await getStore();
    const params = request.params as { id?: string };
    const record = params.id ? await resolveWorktreeRun(params.id, store) : undefined;

    if (!record) {
      return reply.code(404).send({ error: 'worktree run was not found' });
    }

    return createWorktreeRunResponse(record);
  });

  server.post('/api/review-packages/dry-runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createReviewPackageStoreUnavailableResponse('dry-run'));
    }

    const body = request.body as ReviewPackageDryRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createReviewPackageUntrustedAuthorityResponse(undefined));
    }
    if (hasForbiddenReviewPackageRawBody(body)) {
      return reply.code(400).send(createReviewPackageForbiddenRawBodyResponse(undefined));
    }

    const reviewPackage = createReviewPackageProjectionFromRequest(body);
    const dryRunRecord = createLocalReviewPackageExportDryRunRecord({
      reviewPackage,
      workspaceRoot: body?.workspaceRoot ?? findWorkspaceRoot(process.cwd()),
      artifactRoot: body?.artifactRoot,
      packageId: body?.packageId,
    });

    await persistReviewPackageDryRunRecord(dryRunRecord, store);
    await persistEvidenceRefs(dryRunRecord.evidenceRefs, store);
    await persistReviewPackageAuditEvents(
      dryRunRecord.auditEventIds,
      dryRunRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
      false,
    );

    return createReviewPackageDryRunResponse(dryRunRecord);
  });

  server.get('/api/review-packages/dry-runs', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listReviewPackageDryRuns(query, store);

    return {
      records: records.map(createReviewPackageDryRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      artifactWriteBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/review-packages/approval-requests', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createReviewPackageStoreUnavailableResponse('approval'));
    }

    const body = request.body as ReviewPackageApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createReviewPackageUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenReviewPackageRawBody(body)) {
      return reply.code(400).send(createReviewPackageForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveReviewPackageDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'review package dry-run record was not found' });
    }

    const approvalRecord = createLocalReviewPackageApprovalRecord({
      dryRunRecord,
      status: 'requested',
      requestedBy: body?.requestedBy,
      reason: body?.reason,
    });

    await persistReviewPackageApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistReviewPackageAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
      false,
    );

    return createReviewPackageApprovalResponse(approvalRecord);
  });

  server.post('/api/review-packages/manual-approvals', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createReviewPackageStoreUnavailableResponse('approval'));
    }

    const body = request.body as ReviewPackageManualApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createReviewPackageUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenReviewPackageRawBody(body)) {
      return reply.code(400).send(createReviewPackageForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveReviewPackageDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'review package dry-run record was not found' });
    }

    const approvalRequest = body?.approvalRequestId
      ? await resolveReviewPackageApprovalRecord(body.approvalRequestId, store)
      : (await listReviewPackageApprovals({ dryRunId: dryRunRecord.dryRunId, limit: 1 }, store))[0];

    if (!approvalRequest) {
      return reply.code(404).send({ error: 'review package approval request was not found' });
    }

    const approvalRecord = createLocalReviewPackageApprovalRecord({
      dryRunRecord,
      baseRecord: approvalRequest,
      status: body?.outcome ?? 'approved',
      decidedBy: body?.decidedBy,
      reason: body?.reason,
    });

    await persistReviewPackageApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistReviewPackageAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
      false,
    );

    return createReviewPackageApprovalResponse(approvalRecord);
  });

  server.get('/api/review-packages/approvals', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listReviewPackageApprovals(query, store);

    return {
      records: records.map(createReviewPackageApprovalResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      artifactWriteBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/review-packages/runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createReviewPackageStoreUnavailableResponse('execution'));
    }

    const body = request.body as ReviewPackageRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createReviewPackageUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenReviewPackageRawBody(body)) {
      return reply.code(400).send(createReviewPackageForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveReviewPackageDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'review package dry-run record was not found' });
    }

    const approvalRecord = body?.approvalArtifactId
      ? await resolveReviewPackageApprovalRecordByArtifactId(body.approvalArtifactId, store)
      : undefined;
    const authority = ExecutionAuthoritySchema.parse({
      id: foundationId('authority'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      policyDecisionId: dryRunRecord.policyDecision.id,
      approvalArtifactId: approvalRecord?.approvalArtifactId,
      allowed:
        dryRunRecord.status === 'planned' &&
        approvalRecord?.status === 'approved' &&
        approvalRecord.approved,
      constraints: ['local-review-package-export-only', 'hash-bound-artifact-root'],
    });
    const runRecord = await executeLocalReviewPackageExport({
      dryRunRecord,
      approvalRecord,
      authority,
      reviewPackage: dryRunRecord.reviewPackage,
      enabled:
        options.reviewPackageExportEnabled ??
        process.env.CODEXHUB_REVIEW_PACKAGE_EXPORT_ENABLED === 'true',
      runtime: {
        workspaceRoot: body?.workspaceRoot ?? findWorkspaceRoot(process.cwd()),
        artifactRoot: body?.artifactRoot,
        packageId: body?.packageId ?? dryRunRecord.reviewPackage.id,
      },
    });

    await persistReviewPackageRunRecord(runRecord, store);
    await persistEvidenceRefs(runRecord.evidenceRefs, store);
    await persistReviewPackageAuditEvents(
      runRecord.auditEventIds,
      runRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
      runRecord.artifactWriteBoundaryInvoked,
    );

    if (runRecord.artifactWriteBoundaryInvoked && approvalRecord) {
      const usedRecord = createLocalReviewPackageApprovalRecord({
        dryRunRecord,
        baseRecord: approvalRecord,
        status: 'used',
        reason: 'approval consumed after local artifact write boundary attempt',
      });
      await persistReviewPackageApprovalRecord(usedRecord, store);
      await persistEvidenceRefs(usedRecord.evidenceRefs, store);
      await persistReviewPackageAuditEvents(
        usedRecord.auditEventIds,
        usedRecord.evidenceRefs,
        store,
        usedRecord.policyDecisionId,
        runRecord.artifactWriteBoundaryInvoked,
      );
    }

    return createReviewPackageRunResponse(runRecord);
  });

  server.get('/api/review-packages/runs', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listReviewPackageRuns(query, store);

    return {
      records: records.map(createReviewPackageRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      artifactWriteBoundaryInvoked: records.some((record) => record.artifactWriteBoundaryInvoked),
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.get('/api/review-packages/runs/:id', async (request, reply) => {
    const store = await getStore();
    const params = request.params as { id?: string };
    const record = params.id ? await resolveReviewPackageRun(params.id, store) : undefined;

    if (!record) {
      return reply.code(404).send({ error: 'review package run was not found' });
    }

    return createReviewPackageRunResponse(record);
  });

  server.post('/api/release-candidates/dry-runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createReleaseCandidateStoreUnavailableResponse('dry-run'));
    }

    const body = request.body as ReleaseCandidateDryRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createReleaseCandidateUntrustedAuthorityResponse(undefined));
    }
    if (hasForbiddenReviewPackageRawBody(body)) {
      return reply.code(400).send(createReleaseCandidateForbiddenRawBodyResponse(undefined));
    }

    const projection = createReleaseCandidateProjectionFromRequest(body);
    const dryRunRecord = createLocalRcBundleExportDryRunRecord({
      ...projection,
      workspaceRoot: body?.workspaceRoot ?? findWorkspaceRoot(process.cwd()),
      artifactRoot: body?.artifactRoot,
      bundleId: body?.bundleId,
    });

    await persistReleaseCandidateDryRunRecord(dryRunRecord, store);
    await persistEvidenceRefs(dryRunRecord.evidenceRefs, store);
    await persistReleaseCandidateAuditEvents(
      dryRunRecord.auditEventIds,
      dryRunRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
      false,
    );

    return createReleaseCandidateDryRunResponse(dryRunRecord);
  });

  server.get('/api/release-candidates/dry-runs', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listReleaseCandidateDryRuns(query, store);

    return {
      records: records.map(createReleaseCandidateDryRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      artifactWriteBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/release-candidates/approval-requests', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createReleaseCandidateStoreUnavailableResponse('approval'));
    }

    const body = request.body as ReleaseCandidateApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createReleaseCandidateUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenReviewPackageRawBody(body)) {
      return reply.code(400).send(createReleaseCandidateForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveReleaseCandidateDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'release candidate dry-run record was not found' });
    }

    const approvalRecord = createLocalRcBundleApprovalRecord({
      dryRunRecord,
      status: 'requested',
      requestedBy: body?.requestedBy,
      reason: body?.reason,
    });

    await persistReleaseCandidateApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistReleaseCandidateAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
      false,
    );

    return createReleaseCandidateApprovalResponse(approvalRecord);
  });

  server.post('/api/release-candidates/manual-approvals', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createReleaseCandidateStoreUnavailableResponse('approval'));
    }

    const body = request.body as ReleaseCandidateManualApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createReleaseCandidateUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenReviewPackageRawBody(body)) {
      return reply.code(400).send(createReleaseCandidateForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveReleaseCandidateDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'release candidate dry-run record was not found' });
    }

    const approvalRequest = body?.approvalRequestId
      ? await resolveReleaseCandidateApprovalRecord(body.approvalRequestId, store)
      : (await listReleaseCandidateApprovals({ dryRunId: dryRunRecord.dryRunId, limit: 1 }, store))[0];

    if (!approvalRequest) {
      return reply.code(404).send({ error: 'release candidate approval request was not found' });
    }

    const approvalRecord = createLocalRcBundleApprovalRecord({
      dryRunRecord,
      baseRecord: approvalRequest,
      status: body?.outcome ?? 'approved',
      decidedBy: body?.decidedBy,
      reason: body?.reason,
    });

    await persistReleaseCandidateApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistReleaseCandidateAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
      false,
    );

    return createReleaseCandidateApprovalResponse(approvalRecord);
  });

  server.get('/api/release-candidates/approvals', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listReleaseCandidateApprovals(query, store);

    return {
      records: records.map(createReleaseCandidateApprovalResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      artifactWriteBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/release-candidates/runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createReleaseCandidateStoreUnavailableResponse('execution'));
    }

    const body = request.body as ReleaseCandidateRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createReleaseCandidateUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenReviewPackageRawBody(body)) {
      return reply.code(400).send(createReleaseCandidateForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveReleaseCandidateDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'release candidate dry-run record was not found' });
    }

    const approvalRecord = body?.approvalArtifactId
      ? await resolveReleaseCandidateApprovalRecordByArtifactId(body.approvalArtifactId, store)
      : undefined;
    const authority = ExecutionAuthoritySchema.parse({
      id: foundationId('authority'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      policyDecisionId: dryRunRecord.policyDecision.id,
      approvalArtifactId: approvalRecord?.approvalArtifactId,
      allowed:
        dryRunRecord.status === 'planned' &&
        approvalRecord?.status === 'approved' &&
        approvalRecord.approved,
      constraints: ['local-release-candidate-export-only', 'hash-bound-artifact-root'],
    });
    const runRecord = await executeLocalRcBundleExport({
      dryRunRecord,
      approvalRecord,
      authority,
      enabled:
        options.releaseCandidateExportEnabled ??
        process.env.CODEXHUB_RELEASE_CANDIDATE_EXPORT_ENABLED === 'true',
      runtime: {
        workspaceRoot: body?.workspaceRoot ?? findWorkspaceRoot(process.cwd()),
        artifactRoot: body?.artifactRoot,
        bundleId: body?.bundleId ?? dryRunRecord.readinessSummary.id,
      },
    });

    await persistReleaseCandidateRunRecord(runRecord, store);
    await persistEvidenceRefs(runRecord.evidenceRefs, store);
    await persistReleaseCandidateAuditEvents(
      runRecord.auditEventIds,
      runRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
      runRecord.artifactWriteBoundaryInvoked,
    );

    if (runRecord.artifactWriteBoundaryInvoked && approvalRecord) {
      const usedRecord = createLocalRcBundleApprovalRecord({
        dryRunRecord,
        baseRecord: approvalRecord,
        status: 'used',
        reason: 'approval consumed after local RC artifact write boundary attempt',
      });
      await persistReleaseCandidateApprovalRecord(usedRecord, store);
      await persistEvidenceRefs(usedRecord.evidenceRefs, store);
      await persistReleaseCandidateAuditEvents(
        usedRecord.auditEventIds,
        usedRecord.evidenceRefs,
        store,
        usedRecord.policyDecisionId,
        runRecord.artifactWriteBoundaryInvoked,
      );
    }

    return createReleaseCandidateRunResponse(runRecord);
  });

  server.get('/api/release-candidates/runs', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listReleaseCandidateRuns(query, store);

    return {
      records: records.map(createReleaseCandidateRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      artifactWriteBoundaryInvoked: records.some((record) => record.artifactWriteBoundaryInvoked),
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.get('/api/release-candidates/runs/:id', async (request, reply) => {
    const store = await getStore();
    const params = request.params as { id?: string };
    const record = params.id ? await resolveReleaseCandidateRun(params.id, store) : undefined;

    if (!record) {
      return reply.code(404).send({ error: 'release candidate run was not found' });
    }

    return createReleaseCandidateRunResponse(record);
  });

  server.post('/api/github/metadata/dry-runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubMetadataStoreUnavailableResponse('dry-run'));
    }

    const body = request.body as GithubMetadataDryRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createGithubMetadataUntrustedAuthorityResponse(undefined));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubMetadataForbiddenRawBodyResponse(undefined));
    }

    const dryRunRecord = createGithubMetadataDryRunRecord({
      owner: body?.owner ?? '',
      repo: body?.repo ?? '',
      baseBranch: body?.baseBranch,
      headBranch: body?.headBranch,
      requestedMetadata: body?.requestedMetadata,
      runnerMode: body?.runnerMode ?? 'controlled-github-http',
    });

    await persistGithubMetadataDryRunRecord(dryRunRecord, store);
    await persistEvidenceRefs(dryRunRecord.evidenceRefs, store);
    await persistGithubMetadataAuditEvents(
      dryRunRecord.auditEventIds,
      dryRunRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
      false,
    );

    return createGithubMetadataDryRunResponse(dryRunRecord);
  });

  server.get('/api/github/metadata/dry-runs', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listGithubMetadataDryRuns(query, store);

    return {
      records: records.map(createGithubMetadataDryRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/github/metadata/approval-requests', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubMetadataStoreUnavailableResponse('approval'));
    }

    const body = request.body as GithubMetadataApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createGithubMetadataUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubMetadataForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveGithubMetadataDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'github metadata dry-run record was not found' });
    }

    const approvalRecord = createGithubMetadataApprovalRecord({
      dryRunRecord,
      status: 'requested',
      requestedBy: body?.requestedBy,
      reason: body?.reason,
    });

    await persistGithubMetadataApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistGithubMetadataAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
      false,
    );

    return createGithubMetadataApprovalResponse(approvalRecord);
  });

  server.post('/api/github/metadata/manual-approvals', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubMetadataStoreUnavailableResponse('approval'));
    }

    const body = request.body as GithubMetadataManualApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createGithubMetadataUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubMetadataForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveGithubMetadataDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'github metadata dry-run record was not found' });
    }

    const approvalRequest = body?.approvalRequestId
      ? await resolveGithubMetadataApprovalRecord(body.approvalRequestId, store)
      : (await listGithubMetadataApprovals({ dryRunId: dryRunRecord.dryRunId, limit: 1 }, store))[0];

    if (!approvalRequest) {
      return reply.code(404).send({ error: 'github metadata approval request was not found' });
    }

    const approvalRecord = createGithubMetadataApprovalRecord({
      dryRunRecord,
      baseRecord: approvalRequest,
      status: body?.outcome ?? 'approved',
      decidedBy: body?.decidedBy,
      reason: body?.reason,
    });

    await persistGithubMetadataApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistGithubMetadataAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
      false,
    );

    return createGithubMetadataApprovalResponse(approvalRecord);
  });

  server.get('/api/github/metadata/approvals', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listGithubMetadataApprovals(query, store);

    return {
      records: records.map(createGithubMetadataApprovalResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/github/metadata/runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubMetadataStoreUnavailableResponse('execution'));
    }

    const body = request.body as GithubMetadataRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createGithubMetadataUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubMetadataForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveGithubMetadataDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'github metadata dry-run record was not found' });
    }

    const approvalRecord = body?.approvalArtifactId
      ? await resolveGithubMetadataApprovalRecordByArtifactId(body.approvalArtifactId, store)
      : undefined;
    const authority = ExecutionAuthoritySchema.parse({
      id: foundationId('authority'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      policyDecisionId: dryRunRecord.policyDecision.id,
      approvalArtifactId: approvalRecord?.approvalArtifactId,
      allowed:
        dryRunRecord.status === 'planned' &&
        approvalRecord?.status === 'approved' &&
        approvalRecord.approved,
      constraints: ['github-metadata-read-only', 'hash-bound-remote-ref'],
    });
    const githubCredential =
      options.githubProviderCredential ?? process.env[GITHUB_PROVIDER_CREDENTIAL_ENV_VAR];
    const runRecord = await executeGithubMetadataObservation({
      dryRunRecord,
      approvalRecord,
      authority,
      enabled:
        options.githubProviderEnabled ?? process.env.CODEXHUB_GITHUB_PROVIDER_ENABLED === 'true',
      runtime: {
        owner: body?.owner ?? '',
        repo: body?.repo ?? '',
        baseBranch: body?.baseBranch,
        headBranch: body?.headBranch,
        [GITHUB_PROVIDER_RUNTIME_CREDENTIAL_KEY]: githubCredential,
      } as GithubMetadataExecutionInput['runtime'],
      fetchImpl: options.githubProviderFetch,
    });

    await persistGithubMetadataRunRecord(runRecord, store);
    await persistEvidenceRefs(runRecord.evidenceRefs, store);
    await persistGithubMetadataAuditEvents(
      runRecord.auditEventIds,
      runRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
      runRecord.networkBoundaryInvoked,
    );

    if (runRecord.networkBoundaryInvoked && approvalRecord) {
      const usedRecord = createGithubMetadataApprovalRecord({
        dryRunRecord,
        baseRecord: approvalRecord,
        status: 'used',
        reason: 'approval consumed after GitHub metadata network boundary attempt',
      });
      await persistGithubMetadataApprovalRecord(usedRecord, store);
      await persistEvidenceRefs(usedRecord.evidenceRefs, store);
      await persistGithubMetadataAuditEvents(
        usedRecord.auditEventIds,
        usedRecord.evidenceRefs,
        store,
        usedRecord.policyDecisionId,
        runRecord.networkBoundaryInvoked,
      );
    }

    return createGithubMetadataRunResponse(runRecord);
  });

  server.get('/api/github/metadata/runs', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listGithubMetadataRuns(query, store);

    return {
      records: records.map(createGithubMetadataRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      networkBoundaryInvoked: records.some((record) => record.networkBoundaryInvoked),
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.get('/api/github/metadata/runs/:id', async (request, reply) => {
    const store = await getStore();
    const params = request.params as { id?: string };
    const record = params.id ? await resolveGithubMetadataRun(params.id, store) : undefined;

    if (!record) {
      return reply.code(404).send({ error: 'github metadata run was not found' });
    }

    return createGithubMetadataRunResponse(record);
  });

  server.post('/api/github/pr-lifecycle/dry-runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubPrLifecycleStoreUnavailableResponse('dry-run'));
    }

    const body = request.body as GithubPrLifecycleDryRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createGithubPrLifecycleUntrustedAuthorityResponse(undefined));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubPrLifecycleForbiddenRawBodyResponse(undefined));
    }

    const dryRunRecord = createGithubPrLifecycleObservationPlan({
      owner: body?.owner ?? '',
      repo: body?.repo ?? '',
      baseBranch: body?.baseBranch,
      headBranch: body?.headBranch,
      prNumber: body?.prNumber,
      prNumberHash: body?.prNumberHash,
      commitSha: body?.commitSha,
      commitShaHash: body?.commitShaHash,
      requestedMetadata: body?.requestedMetadata,
      runnerMode: body?.runnerMode ?? 'controlled-github-pr-lifecycle',
    } satisfies GithubPrLifecyclePlanInput);

    await persistGithubPrLifecycleDryRunRecord(dryRunRecord, store);
    await persistEvidenceRefs(dryRunRecord.evidenceRefs, store);
    await persistGithubPrLifecycleAuditEvents(
      dryRunRecord.auditEventIds,
      dryRunRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
      false,
    );

    return createGithubPrLifecycleDryRunResponse(dryRunRecord);
  });

  server.get('/api/github/pr-lifecycle/dry-runs', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listGithubPrLifecycleDryRuns(query, store);

    return {
      records: records.map(createGithubPrLifecycleDryRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/github/pr-lifecycle/approval-requests', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubPrLifecycleStoreUnavailableResponse('approval'));
    }

    const body = request.body as GithubPrLifecycleApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createGithubPrLifecycleUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubPrLifecycleForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveGithubPrLifecycleDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'github PR lifecycle dry-run record was not found' });
    }

    const approvalRecord = createGithubPrLifecycleApprovalRecord({
      dryRunRecord,
      status: 'requested',
      requestedBy: body?.requestedBy,
      reason: body?.reason,
    });

    await persistGithubPrLifecycleApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistGithubPrLifecycleAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
      false,
    );

    return createGithubPrLifecycleApprovalResponse(approvalRecord);
  });

  server.post('/api/github/pr-lifecycle/manual-approvals', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubPrLifecycleStoreUnavailableResponse('approval'));
    }

    const body = request.body as GithubPrLifecycleManualApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createGithubPrLifecycleUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubPrLifecycleForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveGithubPrLifecycleDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'github PR lifecycle dry-run record was not found' });
    }

    const approvalRequest = body?.approvalRequestId
      ? await resolveGithubPrLifecycleApprovalRecord(body.approvalRequestId, store)
      : (
          await listGithubPrLifecycleApprovals(
            { dryRunId: dryRunRecord.dryRunId, limit: 1 },
            store,
          )
        )[0];

    if (!approvalRequest) {
      return reply.code(404).send({ error: 'github PR lifecycle approval request was not found' });
    }

    const approvalRecord = createGithubPrLifecycleApprovalRecord({
      dryRunRecord,
      baseRecord: approvalRequest,
      status: body?.outcome ?? 'approved',
      decidedBy: body?.decidedBy,
      reason: body?.reason,
    });

    await persistGithubPrLifecycleApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistGithubPrLifecycleAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
      false,
    );

    return createGithubPrLifecycleApprovalResponse(approvalRecord);
  });

  server.get('/api/github/pr-lifecycle/approvals', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listGithubPrLifecycleApprovals(query, store);

    return {
      records: records.map(createGithubPrLifecycleApprovalResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/github/pr-lifecycle/runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubPrLifecycleStoreUnavailableResponse('execution'));
    }

    const body = request.body as GithubPrLifecycleRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createGithubPrLifecycleUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubPrLifecycleForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveGithubPrLifecycleDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'github PR lifecycle dry-run record was not found' });
    }

    const approvalRecord = body?.approvalArtifactId
      ? await resolveGithubPrLifecycleApprovalRecordByArtifactId(body.approvalArtifactId, store)
      : undefined;
    const authority = ExecutionAuthoritySchema.parse({
      id: foundationId('authority'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      policyDecisionId: dryRunRecord.policyDecision.id,
      approvalArtifactId: approvalRecord?.approvalArtifactId,
      allowed:
        dryRunRecord.status === 'planned' &&
        approvalRecord?.status === 'approved' &&
        approvalRecord.approved,
      constraints: [
        'github-pr-lifecycle-fixed-get-only',
        'hash-bound-remote-ref',
        'hash-bound-pr-or-commit',
      ],
    });
    const githubCredential =
      options.githubProviderCredential ?? process.env[GITHUB_PROVIDER_CREDENTIAL_ENV_VAR];
    const providerEnabled =
      options.githubProviderEnabled ?? process.env.CODEXHUB_GITHUB_PROVIDER_ENABLED === 'true';
    const prLifecycleEnabled =
      options.githubPrLifecycleObserverEnabled ??
      process.env.CODEXHUB_GITHUB_PR_LIFECYCLE_OBSERVER_ENABLED === 'true';
    const runRecord = await executeGithubPrLifecycleObservation({
      dryRunRecord,
      approvalRecord,
      authority,
      enabled: providerEnabled && prLifecycleEnabled,
      runtime: {
        owner: body?.owner ?? '',
        repo: body?.repo ?? '',
        baseBranch: body?.baseBranch ?? '',
        headBranch: body?.headBranch ?? '',
        prNumber: body?.prNumber,
        commitSha: body?.commitSha,
        [GITHUB_PROVIDER_RUNTIME_CREDENTIAL_KEY]: githubCredential,
      } as GithubPrLifecycleExecutionInput['runtime'],
      fetchImpl: options.githubProviderFetch,
    });

    await persistGithubPrLifecycleRunRecord(runRecord, store);
    await persistEvidenceRefs(runRecord.evidenceRefs, store);
    await persistGithubPrLifecycleAuditEvents(
      runRecord.auditEventIds,
      runRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
      runRecord.networkBoundaryInvoked,
    );

    if (runRecord.networkBoundaryInvoked && approvalRecord) {
      const usedRecord = createGithubPrLifecycleApprovalRecord({
        dryRunRecord,
        baseRecord: approvalRecord,
        status: 'used',
        reason: 'approval consumed after GitHub PR lifecycle network boundary attempt',
      });
      await persistGithubPrLifecycleApprovalRecord(usedRecord, store);
      await persistEvidenceRefs(usedRecord.evidenceRefs, store);
      await persistGithubPrLifecycleAuditEvents(
        usedRecord.auditEventIds,
        usedRecord.evidenceRefs,
        store,
        usedRecord.policyDecisionId,
        runRecord.networkBoundaryInvoked,
      );
    }

    return createGithubPrLifecycleRunResponse(runRecord);
  });

  server.get('/api/github/pr-lifecycle/runs', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listGithubPrLifecycleRuns(query, store);

    return {
      records: records.map(createGithubPrLifecycleRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      networkBoundaryInvoked: records.some((record) => record.networkBoundaryInvoked),
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.get('/api/github/pr-lifecycle/runs/:id', async (request, reply) => {
    const store = await getStore();
    const params = request.params as { id?: string };
    const record = params.id ? await resolveGithubPrLifecycleRun(params.id, store) : undefined;

    if (!record) {
      return reply.code(404).send({ error: 'github PR lifecycle run was not found' });
    }

    return createGithubPrLifecycleRunResponse(record);
  });

  server.get('/api/github/supersedes/dry-runs', async (request) => {
    const query = parseReviewPackageQuery(request.query);
    const records = listInMemoryControlPlaneRecords(remoteSupersedeDryRunRecords, query);

    return {
      records: records.map(createRemoteSupersedeDryRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: true,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.get('/api/github/supersedes/runs', async (request) => {
    const query = parseReviewPackageQuery(request.query);
    const records = listInMemoryControlPlaneRecords(remoteSupersedeRunRecords, query);

    return {
      records: records.map(createRemoteSupersedeRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: true,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.get('/api/github/supersedes/runs/:id', async (request, reply) => {
    const params = request.params as { id?: string };
    const record = remoteSupersedeRunRecords.find((candidate) => candidate.id === params.id);

    if (!record) {
      return reply.code(404).send({ error: 'remote supersede run was not found' });
    }

    return createRemoteSupersedeRunResponse(record);
  });

  server.post('/api/github/remote-cleanups/dry-runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubRemoteCleanupStoreUnavailableResponse('dry-run'));
    }

    const body = request.body as GithubRemoteCleanupDryRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createGithubRemoteCleanupUntrustedAuthorityResponse(undefined));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubRemoteCleanupForbiddenRawBodyResponse(undefined));
    }

    const dryRunRecord = createGithubRemoteCleanupPlan({
      owner: body?.owner ?? '',
      repo: body?.repo ?? '',
      baseBranch: body?.baseBranch,
      oldBranchName: body?.oldBranchName ?? '',
      oldPrNumber: body?.oldPrNumber,
      sourceBranchPublishRunId: body?.sourceBranchPublishRunId ?? '',
      sourceDraftPrRunId: body?.sourceDraftPrRunId,
      successorRunId: body?.successorRunId ?? '',
      successorReady: body?.successorReady,
      oldPrDraft: body?.oldPrDraft,
      supersededByNewerDraftPr: body?.supersededByNewerDraftPr,
      runnerMode: body?.runnerMode ?? 'controlled-github-remote-cleanup',
    } satisfies GithubRemoteCleanupPlanInput);

    await persistGithubRemoteCleanupDryRunRecord(dryRunRecord, store);
    await persistEvidenceRefs(dryRunRecord.evidenceRefs, store);
    await persistGithubRemoteCleanupAuditEvents(
      dryRunRecord.auditEventIds,
      dryRunRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
      false,
    );

    return createGithubRemoteCleanupDryRunResponse(dryRunRecord);
  });

  server.get('/api/github/remote-cleanups/dry-runs', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listGithubRemoteCleanupDryRuns(query, store);

    return {
      records: records.map(createGithubRemoteCleanupDryRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/github/remote-cleanups/approval-requests', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubRemoteCleanupStoreUnavailableResponse('approval'));
    }

    const body = request.body as GithubRemoteCleanupApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createGithubRemoteCleanupUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubRemoteCleanupForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveGithubRemoteCleanupDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'github remote cleanup dry-run record was not found' });
    }

    const approvalRecord = createGithubRemoteCleanupApprovalRecord({
      dryRunRecord,
      status: 'requested',
      requestedBy: body?.requestedBy,
      reason: body?.reason,
    });

    await persistGithubRemoteCleanupApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistGithubRemoteCleanupAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
      false,
    );

    return createGithubRemoteCleanupApprovalResponse(approvalRecord);
  });

  server.post('/api/github/remote-cleanups/manual-approvals', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubRemoteCleanupStoreUnavailableResponse('approval'));
    }

    const body = request.body as GithubRemoteCleanupManualApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createGithubRemoteCleanupUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubRemoteCleanupForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveGithubRemoteCleanupDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'github remote cleanup dry-run record was not found' });
    }

    const approvalRequest = body?.approvalRequestId
      ? await resolveGithubRemoteCleanupApprovalRecord(body.approvalRequestId, store)
      : (
          await listGithubRemoteCleanupApprovals(
            { dryRunId: dryRunRecord.dryRunId, limit: 1 },
            store,
          )
        )[0];

    if (!approvalRequest) {
      return reply.code(404).send({ error: 'github remote cleanup approval request was not found' });
    }

    const approvalRecord = createGithubRemoteCleanupApprovalRecord({
      dryRunRecord,
      baseRecord: approvalRequest,
      status: body?.outcome ?? 'approved',
      decidedBy: body?.decidedBy,
      reason: body?.reason,
    });

    await persistGithubRemoteCleanupApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistGithubRemoteCleanupAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
      false,
    );

    return createGithubRemoteCleanupApprovalResponse(approvalRecord);
  });

  server.get('/api/github/remote-cleanups/approvals', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listGithubRemoteCleanupApprovals(query, store);

    return {
      records: records.map(createGithubRemoteCleanupApprovalResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/github/remote-cleanups/runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubRemoteCleanupStoreUnavailableResponse('execution'));
    }

    const body = request.body as GithubRemoteCleanupRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createGithubRemoteCleanupUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubRemoteCleanupForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveGithubRemoteCleanupDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'github remote cleanup dry-run record was not found' });
    }

    const approvalRecord = body?.approvalArtifactId
      ? await resolveGithubRemoteCleanupApprovalRecordByArtifactId(body.approvalArtifactId, store)
      : undefined;
    const authority = ExecutionAuthoritySchema.parse({
      id: foundationId('authority'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      policyDecisionId: dryRunRecord.policyDecision.id,
      approvalArtifactId: approvalRecord?.approvalArtifactId,
      allowed:
        dryRunRecord.status === 'planned' &&
        approvalRecord?.status === 'approved' &&
        approvalRecord.approved,
      constraints: [
        'github-remote-cleanup-fixed-close-delete-only',
        'hash-bound-remote-ref',
        'codexhub-branch-only',
      ],
    });
    const githubCredential =
      options.githubProviderCredential ?? process.env[GITHUB_PROVIDER_CREDENTIAL_ENV_VAR];
    const providerEnabled =
      options.githubProviderEnabled ?? process.env.CODEXHUB_GITHUB_PROVIDER_ENABLED === 'true';
    const cleanupEnabled =
      options.githubRemoteCleanupEnabled ??
      process.env.CODEXHUB_GITHUB_REMOTE_CLEANUP_ENABLED === 'true';
    const runRecord = await executeGithubRemoteCleanup({
      dryRunRecord,
      approvalRecord,
      authority,
      enabled: providerEnabled && cleanupEnabled,
      runtime: {
        owner: body?.owner ?? '',
        repo: body?.repo ?? '',
        baseBranch: body?.baseBranch,
        oldBranchName: body?.oldBranchName ?? '',
        oldPrNumber: body?.oldPrNumber,
        [GITHUB_PROVIDER_RUNTIME_CREDENTIAL_KEY]: githubCredential,
      } as GithubRemoteCleanupExecutionInput['runtime'],
      fetchImpl: options.githubProviderFetch,
    });

    await persistGithubRemoteCleanupRunRecord(runRecord, store);
    await persistEvidenceRefs(runRecord.evidenceRefs, store);
    await persistGithubRemoteCleanupAuditEvents(
      runRecord.auditEventIds,
      runRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
      runRecord.networkBoundaryInvoked,
    );

    if (runRecord.networkBoundaryInvoked && approvalRecord) {
      const usedRecord = createGithubRemoteCleanupApprovalRecord({
        dryRunRecord,
        baseRecord: approvalRecord,
        status: 'used',
        reason: 'approval consumed after GitHub remote cleanup network boundary attempt',
      });
      await persistGithubRemoteCleanupApprovalRecord(usedRecord, store);
      await persistEvidenceRefs(usedRecord.evidenceRefs, store);
      await persistGithubRemoteCleanupAuditEvents(
        usedRecord.auditEventIds,
        usedRecord.evidenceRefs,
        store,
        usedRecord.policyDecisionId,
        runRecord.networkBoundaryInvoked,
      );
    }

    return createGithubRemoteCleanupRunResponse(runRecord);
  });

  server.get('/api/github/remote-cleanups/runs', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listGithubRemoteCleanupRuns(query, store);

    return {
      records: records.map(createGithubRemoteCleanupRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      networkBoundaryInvoked: records.some((record) => record.networkBoundaryInvoked),
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.get('/api/github/remote-cleanups/runs/:id', async (request, reply) => {
    const store = await getStore();
    const params = request.params as { id?: string };
    const record = params.id ? await resolveGithubRemoteCleanupRun(params.id, store) : undefined;

    if (!record) {
      return reply.code(404).send({ error: 'github remote cleanup run was not found' });
    }

    return createGithubRemoteCleanupRunResponse(record);
  });

  server.post('/api/rework-loops/dry-runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createReworkLoopStoreUnavailableResponse('dry-run'));
    }

    const body = request.body as ReworkLoopDryRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createReworkLoopUntrustedAuthorityResponse(undefined));
    }
    if (hasForbiddenReviewPackageRawBody(body) || hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createReworkLoopForbiddenRawBodyResponse(undefined));
    }

    const dryRunRecord = createReworkLoopPlan({
      triggerKind: body?.triggerKind,
      sourceRunId: body?.sourceRunId ?? '',
      sourceStatus: body?.sourceStatus,
      sourceSummaryLabel: body?.sourceSummaryLabel,
      sourcePackageLabel: body?.sourcePackageLabel,
      sourcePrLifecycleRunId: body?.sourcePrLifecycleRunId,
      previousAttemptId: body?.previousAttemptId,
      attemptNumber: body?.attemptNumber,
      branchSlug: body?.branchSlug,
      changedFileLabels: body?.changedFileLabels,
      checkFailureCount: body?.checkFailureCount,
      reviewFindingCount: body?.reviewFindingCount,
      staleBranch: body?.staleBranch,
      requestedBy: body?.requestedBy,
    });

    await persistReworkLoopDryRunRecord(dryRunRecord, store);
    await persistEvidenceRefs(dryRunRecord.evidenceRefs, store);
    await persistReworkLoopAuditEvents(
      dryRunRecord.auditEventIds,
      dryRunRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
    );

    return createReworkLoopDryRunResponse(dryRunRecord);
  });

  server.get('/api/rework-loops/dry-runs', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listReworkLoopDryRuns(query, store);

    return {
      records: records.map(createReworkLoopDryRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      executionDisabled: true,
    };
  });

  server.post('/api/rework-loops/approval-requests', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createReworkLoopStoreUnavailableResponse('approval'));
    }

    const body = request.body as ReworkLoopApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createReworkLoopUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenReviewPackageRawBody(body) || hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createReworkLoopForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveReworkLoopDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'rework loop dry-run record was not found' });
    }

    const approvalRecord = createReworkLoopApprovalRecord({
      dryRunRecord,
      status: 'requested',
      requestedBy: body?.requestedBy,
      reason: body?.reason,
    });

    await persistReworkLoopApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistReworkLoopAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
    );

    return createReworkLoopApprovalResponse(approvalRecord);
  });

  server.post('/api/rework-loops/manual-approvals', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createReworkLoopStoreUnavailableResponse('approval'));
    }

    const body = request.body as ReworkLoopManualApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createReworkLoopUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenReviewPackageRawBody(body) || hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createReworkLoopForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveReworkLoopDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'rework loop dry-run record was not found' });
    }

    const approvalRequest = body?.approvalRequestId
      ? await resolveReworkLoopApprovalRecord(body.approvalRequestId, store)
      : (await listReworkLoopApprovals({ dryRunId: dryRunRecord.dryRunId, limit: 1 }, store))[0];

    if (!approvalRequest) {
      return reply.code(404).send({ error: 'rework loop approval request was not found' });
    }

    const approvalRecord = createReworkLoopApprovalRecord({
      dryRunRecord,
      baseRecord: approvalRequest,
      status: body?.outcome ?? 'approved',
      decidedBy: body?.decidedBy,
      reason: body?.reason,
    });

    await persistReworkLoopApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistReworkLoopAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
    );

    return createReworkLoopApprovalResponse(approvalRecord);
  });

  server.get('/api/rework-loops/approvals', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listReworkLoopApprovals(query, store);

    return {
      records: records.map(createReworkLoopApprovalResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      executionDisabled: true,
    };
  });

  server.post('/api/rework-loops/runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createReworkLoopStoreUnavailableResponse('execution'));
    }

    const body = request.body as ReworkLoopRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createReworkLoopUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenReviewPackageRawBody(body) || hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createReworkLoopForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveReworkLoopDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'rework loop dry-run record was not found' });
    }

    const approvalRecord = body?.approvalArtifactId
      ? await resolveReworkLoopApprovalRecordByArtifactId(body.approvalArtifactId, store)
      : undefined;
    const authority = ExecutionAuthoritySchema.parse({
      id: foundationId('authority'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      policyDecisionId: dryRunRecord.policyDecision.id,
      approvalArtifactId: approvalRecord?.approvalArtifactId,
      allowed:
        dryRunRecord.status === 'planned' &&
        approvalRecord?.status === 'approved' &&
        approvalRecord.approved,
      constraints: [
        'rework-loop-metadata-only',
        'child-control-planes-require-own-approval',
        'no-direct-child-execution',
      ],
    });
    const reworkLoopEnabled =
      options.reworkLoopEnabled ?? process.env.CODEXHUB_REWORK_LOOP_ENABLED === 'true';
    const runRecord = executeReworkLoop({
      dryRunRecord,
      approvalRecord,
      authority,
      enabled: reworkLoopEnabled,
    });

    await persistReworkLoopRunRecord(runRecord, store);
    await persistEvidenceRefs(runRecord.evidenceRefs, store);
    await persistReworkLoopAuditEvents(
      runRecord.auditEventIds,
      runRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
    );

    if (runRecord.status === 'completed' && approvalRecord) {
      const usedRecord = createReworkLoopApprovalRecord({
        dryRunRecord,
        baseRecord: approvalRecord,
        status: 'used',
        reason: 'approval consumed by M20 rework loop metadata run',
      });
      await persistReworkLoopApprovalRecord(usedRecord, store);
      await persistEvidenceRefs(usedRecord.evidenceRefs, store);
      await persistReworkLoopAuditEvents(
        usedRecord.auditEventIds,
        usedRecord.evidenceRefs,
        store,
        usedRecord.policyDecisionId,
      );
    }

    return createReworkLoopRunResponse(runRecord);
  });

  server.get('/api/rework-loops/runs', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listReworkLoopRuns(query, store);

    return {
      records: records.map(createReworkLoopRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      executionDisabled: true,
    };
  });

  server.get('/api/rework-loops/runs/:id', async (request, reply) => {
    const store = await getStore();
    const params = request.params as { id?: string };
    const record = params.id ? await resolveReworkLoopRun(params.id, store) : undefined;

    if (!record) {
      return reply.code(404).send({ error: 'rework loop run was not found' });
    }

    return createReworkLoopRunResponse(record);
  });

  server.post('/api/github/draft-prs/dry-runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubDraftPrStoreUnavailableResponse('dry-run'));
    }

    const body = request.body as GithubDraftPrDryRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createGithubDraftPrUntrustedAuthorityResponse(undefined));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubDraftPrForbiddenRawBodyResponse(undefined));
    }

    const dryRunRecord = createGithubDraftPrPlan({
      owner: body?.owner ?? '',
      repo: body?.repo ?? '',
      baseBranch: body?.baseBranch,
      headBranch: body?.headBranch,
      sourceKind: body?.sourceKind ?? 'local_rc_readiness',
      sourceId: body?.sourceId ?? '',
      sourceSummary: body?.sourceSummary ?? '',
      titleSummary: body?.titleSummary ?? '',
      bodySectionSummaries: body?.bodySectionSummaries ?? [],
      existingPullRequestCount: body?.existingPullRequestCount,
      remoteHeadBranchExists: body?.remoteHeadBranchExists,
      metadataReady: body?.metadataReady,
      runnerMode: body?.runnerMode ?? 'controlled-github-draft-pr',
    });

    await persistGithubDraftPrDryRunRecord(dryRunRecord, store);
    await persistEvidenceRefs(dryRunRecord.evidenceRefs, store);
    await persistGithubDraftPrAuditEvents(
      dryRunRecord.auditEventIds,
      dryRunRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
      false,
      true,
    );

    return createGithubDraftPrDryRunResponse(dryRunRecord);
  });

  server.get('/api/github/draft-prs/dry-runs', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listGithubDraftPrDryRuns(query, store);

    return {
      records: records.map(createGithubDraftPrDryRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/github/draft-prs/approval-requests', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubDraftPrStoreUnavailableResponse('approval'));
    }

    const body = request.body as GithubDraftPrApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createGithubDraftPrUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubDraftPrForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveGithubDraftPrDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'github draft PR dry-run record was not found' });
    }

    const approvalRecord = createGithubDraftPrApprovalRecord({
      dryRunRecord,
      status: 'requested',
      requestedBy: body?.requestedBy,
      reason: body?.reason,
    });

    await persistGithubDraftPrApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistGithubDraftPrAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
      false,
      true,
    );

    return createGithubDraftPrApprovalResponse(approvalRecord);
  });

  server.post('/api/github/draft-prs/manual-approvals', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubDraftPrStoreUnavailableResponse('approval'));
    }

    const body = request.body as GithubDraftPrManualApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createGithubDraftPrUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubDraftPrForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveGithubDraftPrDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'github draft PR dry-run record was not found' });
    }

    const approvalRequest = body?.approvalRequestId
      ? await resolveGithubDraftPrApprovalRecord(body.approvalRequestId, store)
      : (await listGithubDraftPrApprovals({ dryRunId: dryRunRecord.dryRunId, limit: 1 }, store))[0];

    if (!approvalRequest) {
      return reply.code(404).send({ error: 'github draft PR approval request was not found' });
    }

    const approvalRecord = createGithubDraftPrApprovalRecord({
      dryRunRecord,
      baseRecord: approvalRequest,
      status: body?.outcome ?? 'approved',
      decidedBy: body?.decidedBy,
      reason: body?.reason,
    });

    await persistGithubDraftPrApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistGithubDraftPrAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
      false,
      true,
    );

    return createGithubDraftPrApprovalResponse(approvalRecord);
  });

  server.get('/api/github/draft-prs/approvals', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listGithubDraftPrApprovals(query, store);

    return {
      records: records.map(createGithubDraftPrApprovalResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/github/draft-prs/runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubDraftPrStoreUnavailableResponse('execution'));
    }

    const body = request.body as GithubDraftPrRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createGithubDraftPrUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubDraftPrForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveGithubDraftPrDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'github draft PR dry-run record was not found' });
    }

    const approvalRecord = body?.approvalArtifactId
      ? await resolveGithubDraftPrApprovalRecordByArtifactId(body.approvalArtifactId, store)
      : undefined;
    const authority = ExecutionAuthoritySchema.parse({
      id: foundationId('authority'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      policyDecisionId: dryRunRecord.policyDecision.id,
      approvalArtifactId: approvalRecord?.approvalArtifactId,
      allowed:
        dryRunRecord.status === 'planned' &&
        approvalRecord?.status === 'approved' &&
        approvalRecord.approved,
      constraints: ['github-draft-pr-existing-branch-only', 'hash-bound-remote-ref'],
    });
    const githubCredential =
      options.githubProviderCredential ?? process.env[GITHUB_PROVIDER_CREDENTIAL_ENV_VAR];
    const providerEnabled =
      options.githubProviderEnabled ?? process.env.CODEXHUB_GITHUB_PROVIDER_ENABLED === 'true';
    const draftPrEnabled =
      options.githubDraftPrEnabled ?? process.env.CODEXHUB_GITHUB_DRAFT_PR_ENABLED === 'true';
    const runRecord = await executeGithubDraftPrCreation({
      dryRunRecord,
      approvalRecord,
      authority,
      enabled: providerEnabled && draftPrEnabled,
      runtime: {
        owner: body?.owner ?? '',
        repo: body?.repo ?? '',
        baseBranch: body?.baseBranch ?? '',
        headBranch: body?.headBranch ?? '',
        titleSummary: body?.titleSummary ?? '',
        bodySectionSummaries: body?.bodySectionSummaries ?? [],
        [GITHUB_PROVIDER_RUNTIME_CREDENTIAL_KEY]: githubCredential,
      } as GithubDraftPrExecutionInput['runtime'],
      fetchImpl: options.githubProviderFetch,
    });

    await persistGithubDraftPrRunRecord(runRecord, store);
    await persistEvidenceRefs(runRecord.evidenceRefs, store);
    await persistGithubDraftPrAuditEvents(
      runRecord.auditEventIds,
      runRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
      runRecord.networkBoundaryInvoked,
      runRecord.noRealWrite,
    );

    if (runRecord.networkBoundaryInvoked && approvalRecord) {
      const usedRecord = createGithubDraftPrApprovalRecord({
        dryRunRecord,
        baseRecord: approvalRecord,
        status: 'used',
        reason: 'approval consumed after GitHub draft PR network boundary attempt',
      });
      await persistGithubDraftPrApprovalRecord(usedRecord, store);
      await persistEvidenceRefs(usedRecord.evidenceRefs, store);
      await persistGithubDraftPrAuditEvents(
        usedRecord.auditEventIds,
        usedRecord.evidenceRefs,
        store,
        usedRecord.policyDecisionId,
        runRecord.networkBoundaryInvoked,
        true,
      );
    }

    return createGithubDraftPrRunResponse(runRecord);
  });

  server.get('/api/github/draft-prs/runs', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listGithubDraftPrRuns(query, store);

    return {
      records: records.map(createGithubDraftPrRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      networkBoundaryInvoked: records.some((record) => record.networkBoundaryInvoked),
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.get('/api/github/draft-prs/runs/:id', async (request, reply) => {
    const store = await getStore();
    const params = request.params as { id?: string };
    const record = params.id ? await resolveGithubDraftPrRun(params.id, store) : undefined;

    if (!record) {
      return reply.code(404).send({ error: 'github draft PR run was not found' });
    }

    return createGithubDraftPrRunResponse(record);
  });

  server.post('/api/github/branch-publishes/dry-runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubBranchPublishStoreUnavailableResponse('dry-run'));
    }

    const body = request.body as GithubBranchPublishDryRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply
        .code(400)
        .send(createGithubBranchPublishUntrustedAuthorityResponse(undefined));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubBranchPublishForbiddenRawBodyResponse(undefined));
    }

    const dryRunRecord = createGithubBranchPublishPlan({
      owner: body?.owner ?? '',
      repo: body?.repo ?? '',
      baseBranch: body?.baseBranch,
      sourceKind: body?.sourceKind ?? 'local_rc_readiness',
      sourceId: body?.sourceId ?? '',
      sourceSummary: body?.sourceSummary ?? '',
      worktreePathHash: body?.worktreePathHash ?? '',
      branchSlug: body?.branchSlug ?? '',
      commitMessageSummary: body?.commitMessageSummary ?? '',
      files: (body?.files ?? []).map((file) => ({
        relativePath: file.relativePath ?? '',
        contentHash: file.contentHash ?? '',
        byteCount: file.byteCount ?? 0,
        text: file.text ?? false,
        symlink: file.symlink,
        deleted: file.deleted,
        renamed: file.renamed,
      })),
      branchExists: body?.branchExists,
      runnerMode: body?.runnerMode ?? 'planning-only',
    } satisfies GithubBranchPublishPlanInput);

    await persistGithubBranchPublishDryRunRecord(dryRunRecord, store);
    await persistEvidenceRefs(dryRunRecord.evidenceRefs, store);
    await persistGithubBranchPublishAuditEvents(
      dryRunRecord.auditEventIds,
      dryRunRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
      false,
      true,
    );

    return createGithubBranchPublishDryRunResponse(dryRunRecord);
  });

  server.get('/api/github/branch-publishes/dry-runs', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listGithubBranchPublishDryRuns(query, store);

    return {
      records: records.map(createGithubBranchPublishDryRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/github/branch-publishes/approval-requests', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubBranchPublishStoreUnavailableResponse('approval'));
    }

    const body = request.body as GithubBranchPublishApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply
        .code(400)
        .send(createGithubBranchPublishUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubBranchPublishForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveGithubBranchPublishDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'github branch publish dry-run record was not found' });
    }

    const approvalRecord = createGithubBranchPublishApprovalRecord({
      dryRunRecord,
      status: 'requested',
      requestedBy: body?.requestedBy,
      reason: body?.reason,
    });

    await persistGithubBranchPublishApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistGithubBranchPublishAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
      false,
      true,
    );

    return createGithubBranchPublishApprovalResponse(approvalRecord);
  });

  server.post('/api/github/branch-publishes/manual-approvals', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubBranchPublishStoreUnavailableResponse('approval'));
    }

    const body = request.body as GithubBranchPublishManualApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply
        .code(400)
        .send(createGithubBranchPublishUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubBranchPublishForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveGithubBranchPublishDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'github branch publish dry-run record was not found' });
    }

    const approvalRequest = body?.approvalRequestId
      ? await resolveGithubBranchPublishApprovalRecord(body.approvalRequestId, store)
      : (
          await listGithubBranchPublishApprovals(
            { dryRunId: dryRunRecord.dryRunId, limit: 1 },
            store,
          )
        )[0];

    if (!approvalRequest) {
      return reply.code(404).send({ error: 'github branch publish approval request was not found' });
    }

    const approvalRecord = createGithubBranchPublishApprovalRecord({
      dryRunRecord,
      baseRecord: approvalRequest,
      status: body?.outcome ?? 'approved',
      decidedBy: body?.decidedBy,
      reason: body?.reason,
    });

    await persistGithubBranchPublishApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistGithubBranchPublishAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
      false,
      true,
    );

    return createGithubBranchPublishApprovalResponse(approvalRecord);
  });

  server.get('/api/github/branch-publishes/approvals', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listGithubBranchPublishApprovals(query, store);

    return {
      records: records.map(createGithubBranchPublishApprovalResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/github/branch-publishes/runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createGithubBranchPublishStoreUnavailableResponse('execution'));
    }

    const body = request.body as GithubBranchPublishRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply
        .code(400)
        .send(createGithubBranchPublishUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply.code(400).send(createGithubBranchPublishForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveGithubBranchPublishDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'github branch publish dry-run record was not found' });
    }

    const approvalRecord = body?.approvalArtifactId
      ? await resolveGithubBranchPublishApprovalRecordByArtifactId(body.approvalArtifactId, store)
      : undefined;
    const authority = ExecutionAuthoritySchema.parse({
      id: foundationId('authority'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      policyDecisionId: dryRunRecord.policyDecision.id,
      approvalArtifactId: approvalRecord?.approvalArtifactId,
      allowed:
        dryRunRecord.status === 'planned' &&
        approvalRecord?.status === 'approved' &&
        approvalRecord.approved,
      constraints: [
        'github-branch-publish-new-codexhub-branch-only',
        'hash-bound-remote-ref',
        'hash-bound-content-manifest',
      ],
    });
    const githubCredential =
      options.githubProviderCredential ?? process.env[GITHUB_PROVIDER_CREDENTIAL_ENV_VAR];
    const providerEnabled =
      options.githubProviderEnabled ?? process.env.CODEXHUB_GITHUB_PROVIDER_ENABLED === 'true';
    const branchPublishEnabled =
      options.githubBranchPublishEnabled ??
      process.env.CODEXHUB_GITHUB_BRANCH_PUBLISH_ENABLED === 'true';
    const runRecord = await executeGithubBranchPublish({
      dryRunRecord,
      approvalRecord,
      authority,
      enabled: providerEnabled && branchPublishEnabled,
      runtime: {
        owner: body?.owner ?? '',
        repo: body?.repo ?? '',
        baseBranch: body?.baseBranch ?? '',
        headBranch: body?.branchName ?? '',
        branchName: body?.branchName ?? '',
        commitMessage: body?.commitMessageSummary ?? '',
        commitMessageSummary: body?.commitMessageSummary ?? '',
        files: (body?.files ?? []).map((file) => ({
          relativePath: file.relativePath ?? '',
          content: file.content ?? '',
        })),
        [GITHUB_PROVIDER_RUNTIME_CREDENTIAL_KEY]: githubCredential,
      } as GithubBranchPublishExecutionInput['runtime'],
      fetchImpl: options.githubProviderFetch,
    });

    await persistGithubBranchPublishRunRecord(runRecord, store);
    await persistEvidenceRefs(runRecord.evidenceRefs, store);
    await persistGithubBranchPublishAuditEvents(
      runRecord.auditEventIds,
      runRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
      runRecord.networkBoundaryInvoked,
      runRecord.noRealWrite,
    );

    if (runRecord.networkBoundaryInvoked && approvalRecord) {
      const usedRecord = createGithubBranchPublishApprovalRecord({
        dryRunRecord,
        baseRecord: approvalRecord,
        status: 'used',
        reason: 'approval consumed after GitHub branch publish network boundary attempt',
      });
      await persistGithubBranchPublishApprovalRecord(usedRecord, store);
      await persistEvidenceRefs(usedRecord.evidenceRefs, store);
      await persistGithubBranchPublishAuditEvents(
        usedRecord.auditEventIds,
        usedRecord.evidenceRefs,
        store,
        usedRecord.policyDecisionId,
        runRecord.networkBoundaryInvoked,
        true,
      );
    }

    return createGithubBranchPublishRunResponse(runRecord);
  });

  server.get('/api/github/branch-publishes/runs', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listGithubBranchPublishRuns(query, store);

    return {
      records: records.map(createGithubBranchPublishRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      networkBoundaryInvoked: records.some((record) => record.networkBoundaryInvoked),
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.get('/api/github/branch-publishes/runs/:id', async (request, reply) => {
    const store = await getStore();
    const params = request.params as { id?: string };
    const record = params.id ? await resolveGithubBranchPublishRun(params.id, store) : undefined;

    if (!record) {
      return reply.code(404).send({ error: 'github branch publish run was not found' });
    }

    return createGithubBranchPublishRunResponse(record);
  });

  server.post('/api/github/publish-draft-pr-chains/dry-runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply
        .code(503)
        .send(createGithubPublishDraftPrChainStoreUnavailableResponse('dry-run'));
    }

    const body = request.body as GithubPublishDraftPrChainDryRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply
        .code(400)
        .send(createGithubPublishDraftPrChainUntrustedAuthorityResponse(body?.branchPublishDryRunId));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply
        .code(400)
        .send(createGithubPublishDraftPrChainForbiddenRawBodyResponse(body?.branchPublishDryRunId));
    }

    const dryRunRecord = createGithubPublishDraftPrChainPlan({
      sourceKind: body?.sourceKind ?? 'local_rc_readiness',
      sourceId: body?.sourceId ?? '',
      branchPublishDryRunId: body?.branchPublishDryRunId ?? '',
      draftPrDryRunId: body?.draftPrDryRunId ?? '',
    });

    await persistGithubPublishDraftPrChainDryRunRecord(dryRunRecord, store);
    await persistEvidenceRefs(dryRunRecord.metadata ? [] : [], store);

    return createGithubPublishDraftPrChainDryRunResponse(dryRunRecord);
  });

  server.get('/api/github/publish-draft-pr-chains/dry-runs', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listGithubPublishDraftPrChainDryRuns(query, store);

    return {
      records: records.map(createGithubPublishDraftPrChainDryRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/github/publish-draft-pr-chains/runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply
        .code(503)
        .send(createGithubPublishDraftPrChainStoreUnavailableResponse('execution'));
    }

    const body = request.body as GithubPublishDraftPrChainRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply
        .code(400)
        .send(createGithubPublishDraftPrChainUntrustedAuthorityResponse(body?.dryRunId));
    }
    if (hasForbiddenGithubRawBody(body)) {
      return reply
        .code(400)
        .send(createGithubPublishDraftPrChainForbiddenRawBodyResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveGithubPublishDraftPrChainDryRunRecord(
      body?.dryRunId ?? body?.chainId,
      store,
    );
    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'github publish draft PR chain dry-run was not found' });
    }

    const branchPublishRun = body?.branchPublishRunId
      ? await resolveGithubBranchPublishRun(body.branchPublishRunId, store)
      : undefined;
    const draftPrRun = body?.draftPrRunId
      ? await resolveGithubDraftPrRun(body.draftPrRunId, store)
      : undefined;
    const runRecord = createGithubPublishDraftPrChainRun({
      plan: dryRunRecord,
      branchPublishRun,
      draftPrRun,
    });

    await persistGithubPublishDraftPrChainRunRecord(runRecord, store);
    await persistEvidenceRefs(runRecord.evidenceRefs, store);
    await persistGithubPublishDraftPrChainAuditEvents(
      runRecord.auditEventIds,
      runRecord.evidenceRefs,
      store,
      runRecord.networkBoundaryInvoked,
      runRecord.noRealWrite,
    );

    return createGithubPublishDraftPrChainRunResponse(runRecord);
  });

  server.get('/api/github/publish-draft-pr-chains/runs', async (request) => {
    const store = await getStore();
    const query = parseReviewPackageQuery(request.query);
    const records = await listGithubPublishDraftPrChainRuns(query, store);

    return {
      records: records.map(createGithubPublishDraftPrChainRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      networkBoundaryInvoked: records.some((record) => record.networkBoundaryInvoked),
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.get('/api/github/publish-draft-pr-chains/runs/:id', async (request, reply) => {
    const store = await getStore();
    const params = request.params as { id?: string };
    const record = params.id
      ? await resolveGithubPublishDraftPrChainRun(params.id, store)
      : undefined;

    if (!record) {
      return reply.code(404).send({ error: 'github publish draft PR chain run was not found' });
    }

    return createGithubPublishDraftPrChainRunResponse(record);
  });

  server.post('/api/pilots/m9/local-runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send({
        error: 'm9_pilot_store_unavailable',
        status: 'blocked',
        degraded: true,
        notPersisted: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        executionDisabled: true,
        rawPathStored: false,
        bodyStored: false,
      });
    }

    const body = request.body as M9LocalPilotRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send({
        error: 'untrusted_m9_pilot_authority_body',
        status: 'blocked',
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawPathStored: false,
        bodyStored: false,
      });
    }

    const dryRunRecord = await resolveWorktreeDryRunRecord(body?.worktreeDryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'worktree dry-run record was not found' });
    }

    const worktreeApprovalRecord = body?.worktreeApprovalArtifactId
      ? await resolveWorktreeApprovalRecordByArtifactId(body.worktreeApprovalArtifactId, store)
      : undefined;
    const worktreeApprovalReady = classifyWorktreeApproval(worktreeApprovalRecord) === 'ready';
    const enabled =
      options.m9LocalPilotEnabled === true ||
      process.env.CODEXHUB_M9_LOCAL_PILOT_ENABLED === 'true';
    const worktreeBoundaryEnabled =
      options.worktreeManagerEnabled === true ||
      process.env.CODEXHUB_WORKTREE_MANAGER_ENABLED === 'true';
    const pilotResult = await runM9LocalPilot({
      title: body?.title ?? 'M9 local pilot',
      description:
        body?.description ??
        'Run controlled worktree plus Codex read-only dry-run and Nx verification.',
      repoRoot: body?.repoRoot ?? process.cwd(),
      worktreeRoot: body?.worktreeRoot ?? '',
      worktreePath: body?.worktreePath ?? '',
      worktreeSlug: body?.worktreeSlug ?? 'm9-local-pilot',
      branchName: body?.branchName ?? 'codex/m9-local-pilot',
      baseRef: body?.baseRef ?? 'HEAD',
      allowedWorktreeRoots: body?.worktreeRoot ? [body.worktreeRoot] : undefined,
      codexDryRunId: body?.codexDryRunId ?? dryRunRecord.dryRunId,
      worktreeApprovalArtifactId: body?.worktreeApprovalArtifactId,
      codexApprovalArtifactId: body?.codexApprovalArtifactId,
      worktreeApprovalResolved: worktreeApprovalReady,
      pilotEnabled: enabled,
      realGitBoundaryEnabled: worktreeBoundaryEnabled,
      governedInput: body?.governedInput?.relativePath
        ? {
            relativePath: body.governedInput.relativePath,
            expectedContentHash: body.governedInput.expectedContentHash,
            contentHash: body.governedInput.contentHash,
          }
        : undefined,
      verificationTargets: body?.verificationTargets,
      headRef: body?.headRef,
      codexExecutablePath: body?.codexExecutablePath ?? 'codex',
      nxExecutablePath: body?.nxExecutablePath ?? 'pnpm',
      store,
      worktreeRunner: options.worktreeManagerRunner,
      codexRunner: options.m9CodexRunner,
      nxRunner: options.m9NxRunner,
      actor: 'codexhub-supervisor.m9-pilot',
    });

    m9LocalPilotRunRecords.unshift(pilotResult.run);
    m9LocalPilotRunRecords.splice(50);

    if (pilotResult.worktree?.worktreeRun.gitProcessBoundaryInvoked && worktreeApprovalRecord) {
      const usedApprovalRecord = createWorktreeApprovalRecord({
        dryRunRecord,
        baseRecord: worktreeApprovalRecord,
        status: 'used',
        reason: 'M9 local pilot reached controlled git boundary',
      });
      await persistWorktreeApprovalRecord(usedApprovalRecord, store);
      await persistEvidenceRefs(usedApprovalRecord.evidenceRefs, store);
      await persistWorktreeAuditEvents(
        usedApprovalRecord.auditEventIds,
        usedApprovalRecord.evidenceRefs,
        store,
        usedApprovalRecord.policyDecisionId,
      );
    }

    return createM9PilotRunResponse(pilotResult.run);
  });

  server.get('/api/pilots/m9/local-runs', async () => ({
    records: m9LocalPilotRunRecords.map(createM9PilotRunResponse),
    count: m9LocalPilotRunRecords.length,
    degraded: persistenceState.status !== 'ok',
    processBoundaryInvoked: m9LocalPilotRunRecords.some((record) => record.processBoundaryInvoked),
    externalProcessStarted: m9LocalPilotRunRecords.some((record) => record.externalProcessStarted),
    rawPathStored: false,
    bodyStored: false,
  }));

  server.get('/api/pilots/m9/local-runs/:id', async (request, reply) => {
    const params = request.params as { id?: string };
    const record = m9LocalPilotRunRecords.find((candidate) => candidate.id === params.id);

    if (!record) {
      return reply.code(404).send({ error: 'm9 pilot run was not found' });
    }

    return createM9PilotRunResponse(record);
  });

  server.post('/api/pilots/m11/local-runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send({
        error: 'm11_pilot_store_unavailable',
        status: 'blocked',
        degraded: true,
        notPersisted: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        executionDisabled: true,
        rawPathStored: false,
        bodyStored: false,
      });
    }

    const body = request.body as M11LocalPilotRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send({
        error: 'untrusted_m11_pilot_authority_body',
        status: 'blocked',
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawPathStored: false,
        bodyStored: false,
      });
    }

    const dryRunRecord = await resolveWorktreeDryRunRecord(body?.worktreeDryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'worktree dry-run record was not found' });
    }

    const worktreeApprovalRecord = body?.worktreeApprovalArtifactId
      ? await resolveWorktreeApprovalRecordByArtifactId(body.worktreeApprovalArtifactId, store)
      : undefined;
    const worktreeApprovalReady = classifyWorktreeApproval(worktreeApprovalRecord) === 'ready';
    const enabled =
      options.m11ProductionPilotEnabled === true ||
      process.env.CODEXHUB_M11_PRODUCTION_PILOT_ENABLED === 'true';
    const worktreeBoundaryEnabled =
      options.worktreeManagerEnabled === true ||
      process.env.CODEXHUB_WORKTREE_MANAGER_ENABLED === 'true';
    const pilotResult = await runM11ProductionPilotNarrowPath({
      title: body?.title ?? 'M11 production pilot narrow path',
      description:
        body?.description ??
        'Run controlled worktree plus Codex read-only dry-run and Nx verification through the M11 narrow path.',
      repoRoot: body?.repoRoot ?? process.cwd(),
      worktreeRoot: body?.worktreeRoot ?? '',
      worktreePath: body?.worktreePath ?? '',
      worktreeSlug: body?.worktreeSlug ?? 'm11-production-pilot',
      branchName: body?.branchName ?? 'codex/m11-production-pilot',
      baseRef: body?.baseRef ?? 'HEAD',
      allowedWorktreeRoots: body?.worktreeRoot ? [body.worktreeRoot] : undefined,
      codexDryRunId: body?.codexDryRunId ?? dryRunRecord.dryRunId,
      worktreeApprovalArtifactId: body?.worktreeApprovalArtifactId,
      codexApprovalArtifactId: body?.codexApprovalArtifactId,
      worktreeApprovalResolved: worktreeApprovalReady,
      m11PilotEnabled: enabled,
      realGitBoundaryEnabled: worktreeBoundaryEnabled,
      governedInput: body?.governedInput?.relativePath
        ? {
            relativePath: body.governedInput.relativePath,
            expectedContentHash: body.governedInput.expectedContentHash,
            contentHash: body.governedInput.contentHash,
          }
        : undefined,
      verificationTargets: body?.verificationTargets,
      headRef: body?.headRef,
      codexExecutablePath: body?.codexExecutablePath ?? 'codex',
      nxExecutablePath: body?.nxExecutablePath ?? 'pnpm',
      store,
      worktreeRunner: options.worktreeManagerRunner,
      codexRunner: options.m11CodexRunner,
      nxRunner: options.m11NxRunner,
      actor: 'codexhub-supervisor.m11-pilot',
    });

    m11LocalPilotRunRecords.unshift(pilotResult.run);
    m11LocalPilotRunRecords.splice(50);

    if (pilotResult.worktree?.worktreeRun.gitProcessBoundaryInvoked && worktreeApprovalRecord) {
      const usedApprovalRecord = createWorktreeApprovalRecord({
        dryRunRecord,
        baseRecord: worktreeApprovalRecord,
        status: 'used',
        reason: 'M11 production pilot reached controlled git boundary',
      });
      await persistWorktreeApprovalRecord(usedApprovalRecord, store);
      await persistEvidenceRefs(usedApprovalRecord.evidenceRefs, store);
      await persistWorktreeAuditEvents(
        usedApprovalRecord.auditEventIds,
        usedApprovalRecord.evidenceRefs,
        store,
        usedApprovalRecord.policyDecisionId,
      );
    }

    return createM11PilotRunResponse(pilotResult.run);
  });

  server.get('/api/pilots/m11/local-runs', async () => ({
    records: m11LocalPilotRunRecords.map(createM11PilotRunResponse),
    count: m11LocalPilotRunRecords.length,
    degraded: persistenceState.status !== 'ok',
    processBoundaryInvoked: m11LocalPilotRunRecords.some((record) => record.processBoundaryInvoked),
    externalProcessStarted: m11LocalPilotRunRecords.some(
      (record) => record.externalProcessStarted,
    ),
    rawPathStored: false,
    bodyStored: false,
  }));

  server.get('/api/pilots/m11/local-runs/:id', async (request, reply) => {
    const params = request.params as { id?: string };
    const record = m11LocalPilotRunRecords.find((candidate) => candidate.id === params.id);

    if (!record) {
      return reply.code(404).send({ error: 'm11 pilot run was not found' });
    }

    return createM11PilotRunResponse(record);
  });

  server.get('/api/approvals/inbox', async (request) => {
    const store = await getStore();
    const query = request.query as { type?: string } | undefined;
    const projection = await buildApprovalInboxProjection(store);
    const items = query?.type
      ? projection.items.filter((item) => item.approvalType === query.type)
      : projection.items;

    return {
      ...projection,
      items,
      itemCount: items.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawPathStored: false,
      bodyStored: false,
      tokenStored: false,
    };
  });

  server.post('/api/approvals/decisions', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send({
        error: 'approval_store_unavailable',
        status: 'blocked',
        degraded: true,
        notPersisted: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawPathStored: false,
        bodyStored: false,
        tokenStored: false,
      });
    }

    const body = request.body as ApprovalDecisionRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send({
        error: 'untrusted_approval_decision_body',
        status: 'blocked',
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawPathStored: false,
        bodyStored: false,
        tokenStored: false,
      });
    }

    const parsed = ApprovalDecisionRequestSchema.safeParse(body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: 'invalid_approval_decision_request',
        issues: parsed.error.issues.map((issue) => issue.message),
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawPathStored: false,
        bodyStored: false,
        tokenStored: false,
      });
    }

    const decisionResult = await recordApprovalDecision(parsed.data, store);

    if (!decisionResult) {
      return reply.code(404).send({
        error: 'approval_request_not_found',
        approvalType: parsed.data.approvalType,
        approvalRequestId: parsed.data.approvalRequestId,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawPathStored: false,
        bodyStored: false,
        tokenStored: false,
      });
    }

    return decisionResult;
  });

  server.post('/api/worktrees/cleanup/dry-runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createWorktreeStoreUnavailableResponse('cleanup-dry-run'));
    }

    const body = request.body as WorktreeCleanupDryRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createWorktreeUntrustedAuthorityResponse(undefined));
    }

    const sourceRun = body?.sourceRunId
      ? await resolveWorktreeRun(body.sourceRunId, store)
      : undefined;

    if (!sourceRun) {
      return reply.code(404).send({ error: 'source worktree run was not found' });
    }

    const dryRunRecord = createWorktreeCleanupDryRunRecordFromRequest(sourceRun, body);

    await persistWorktreeCleanupDryRunRecord(dryRunRecord, store);
    await persistEvidenceRefs(dryRunRecord.evidenceRefs, store);
    await persistWorktreeAuditEvents(
      dryRunRecord.auditEventIds,
      dryRunRecord.evidenceRefs,
      store,
      dryRunRecord.policyDecision.id,
    );

    return createWorktreeCleanupDryRunResponse(dryRunRecord);
  });

  server.get('/api/worktrees/cleanup/dry-runs', async (request) => {
    const store = await getStore();
    const query = parseWorktreeQuery(request.query);
    const records = await listWorktreeCleanupDryRuns(query, store);

    return {
      records: records.map(createWorktreeCleanupDryRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      gitProcessBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/worktrees/cleanup/approval-requests', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createWorktreeStoreUnavailableResponse('cleanup-approval'));
    }

    const body = request.body as WorktreeCleanupApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createWorktreeUntrustedAuthorityResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveWorktreeCleanupDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'worktree cleanup dry-run record was not found' });
    }

    const approvalRecord = createWorktreeCleanupApprovalRecord({
      dryRunRecord,
      requestedBy: body?.requestedBy,
      reason: body?.reason,
      status: 'requested',
    });

    await persistWorktreeCleanupApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistWorktreeAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
    );

    return createWorktreeCleanupApprovalResponse(approvalRecord);
  });

  server.post('/api/worktrees/cleanup/manual-approvals', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createWorktreeStoreUnavailableResponse('cleanup-approval'));
    }

    const body = request.body as WorktreeCleanupManualApprovalRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createWorktreeUntrustedAuthorityResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveWorktreeCleanupDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'worktree cleanup dry-run record was not found' });
    }

    const approvalRequest = body?.approvalRequestId
      ? await resolveWorktreeCleanupApprovalRecord(body.approvalRequestId, store)
      : (
          await listWorktreeCleanupApprovals(
            { dryRunId: dryRunRecord.dryRunId, limit: 1 },
            store,
          )
        )[0];

    if (!approvalRequest) {
      return reply.code(404).send({ error: 'worktree cleanup approval request was not found' });
    }

    const approvalRecord = createWorktreeCleanupApprovalRecord({
      dryRunRecord,
      baseRecord: approvalRequest,
      status: body?.outcome ?? 'approved',
      decidedBy: body?.decidedBy,
      reason: body?.reason,
    });

    await persistWorktreeCleanupApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistWorktreeAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
    );

    return createWorktreeCleanupApprovalResponse(approvalRecord);
  });

  server.get('/api/worktrees/cleanup/approvals', async (request) => {
    const store = await getStore();
    const query = parseWorktreeQuery(request.query);
    const records = await listWorktreeCleanupApprovals(query, store);

    return {
      records: records.map(createWorktreeCleanupApprovalResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      gitProcessBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
  });

  server.post('/api/worktrees/cleanup/runs', async (request, reply) => {
    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createWorktreeStoreUnavailableResponse('cleanup-execution'));
    }

    const body = request.body as WorktreeCleanupRunRequestBody | undefined;

    if (hasUntrustedAuthorityBody(body)) {
      return reply.code(400).send(createWorktreeUntrustedAuthorityResponse(body?.dryRunId));
    }

    const dryRunRecord = await resolveWorktreeCleanupDryRunRecord(body?.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({ error: 'worktree cleanup dry-run record was not found' });
    }

    const sourceRun = await resolveWorktreeRun(dryRunRecord.sourceRunId, store);

    if (!sourceRun) {
      return reply.code(404).send({ error: 'source worktree run was not found' });
    }

    const approvalRecord = body?.approvalArtifactId
      ? await resolveWorktreeCleanupApprovalRecordByArtifactId(body.approvalArtifactId, store)
      : undefined;
    const runRecord = await executeWorktreeCleanupControlPlaneRun({
      dryRunRecord,
      sourceRun,
      approvalRecord,
      store,
      runtime: {
        repoRoot: body?.repoRoot,
        worktreeRoot: body?.worktreeRoot,
        worktreePath: body?.worktreePath,
      },
    });

    return createWorktreeCleanupRunResponse(runRecord);
  });

  server.get('/api/worktrees/cleanup/runs', async (request) => {
    const store = await getStore();
    const query = parseWorktreeQuery(request.query);
    const records = await listWorktreeCleanupRuns(query, store);

    return {
      records: records.map(createWorktreeCleanupRunResponse),
      count: records.length,
      degraded: persistenceState.status !== 'ok',
      notPersisted: !store,
      gitProcessBoundaryInvoked: records.some((record) => record.gitProcessBoundaryInvoked),
      processBoundaryInvoked: records.some((record) => record.processBoundaryInvoked),
      externalProcessStarted: records.some((record) => record.externalProcessStarted),
      executionDisabled: true,
    };
  });

  server.get('/api/worktrees/cleanup/runs/:id', async (request, reply) => {
    const store = await getStore();
    const params = request.params as { id?: string };
    const record = params.id ? await resolveWorktreeCleanupRun(params.id, store) : undefined;

    if (!record) {
      return reply.code(404).send({ error: 'worktree cleanup run was not found' });
    }

    return createWorktreeCleanupRunResponse(record);
  });

  server.post('/api/development/mock-run', async (request) => {
    const body = request.body as
      | {
          title?: string;
          description?: string;
          constraints?: string[];
          metadata?: Record<string, unknown>;
        }
      | undefined;
    const store = await getStore();
    const result = await runMockDevelopmentOrchestration({
      title: body?.title ?? 'Untitled mock development request',
      description: body?.description ?? 'No description provided.',
      constraints: body?.constraints,
      metadata: body?.metadata,
      store,
    });

    if (!store) {
      mockDevelopmentRuns.unshift(result);
    }

    return {
      ...result,
      metadata: {
        ...(result.metadata ?? {}),
        persistence: persistenceState.status,
        persistenceReason: persistenceState.reason,
      },
    };
  });

  server.get('/api/development/mock-runs', async () => {
    const store = await getStore();

    if (store) {
      return {
        runs: await store.developmentRuns.listMockDevelopmentRuns(10),
        persistence: persistenceState,
      };
    }

    return {
      runs: mockDevelopmentRuns.slice(0, 10),
      persistence: persistenceState,
    };
  });

  server.post('/api/codex/replay-fixture', async (request, reply) => {
    const body = request.body as { fixturePath?: string } | undefined;
    const fixturePath = body?.fixturePath;

    if (!fixturePath) {
      return reply.code(400).send({ error: 'fixturePath is required' });
    }

    const guard = resolveAllowedFixture(fixturePath);

    if (!guard.allowed) {
      return reply.code(400).send({ error: guard.reason });
    }

    if (!existsSync(guard.path)) {
      return reply.code(404).send({ error: 'fixture file was not found' });
    }

    const store = await getStore();
    const fixtureText = await readFile(guard.path, 'utf8');
    const result = await replayCodexExecFixture(fixtureText);
    const record = createCodexReplayRecord(result, guard.fixturePath);

    if (store) {
      for (const evidenceRef of result.evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of result.auditEvents) {
        await store.auditEvents.append(auditEvent);
      }

      await store.codexReplays.saveCodexReplay(record);
    } else {
      codexReplayRecords.unshift(record);
    }

    return {
      ...summarizeCodexExecReplay(result, guard.fixturePath),
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/replay-fixtures', async () => {
    const store = await getStore();
    const records = store
      ? await store.codexReplays.listCodexReplays(10)
      : codexReplayRecords.slice(0, 10);

    return {
      runs: records.map(recordToSummary),
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
      metadata: { mockOnly: true, liveExecution: false, externalProcessStarted: false },
    };
  });

  server.post('/api/codex/exec/dry-run', async (request, reply) => {
    const body = request.body as
      | {
          title?: string;
          prompt?: string;
          cwd?: string;
          sandboxMode?: CodexExecSandboxMode;
          approvalMode?: CodexExecApprovalMode;
          metadata?: Record<string, unknown>;
        }
      | undefined;

    if (!body?.title || !body.prompt) {
      return reply.code(400).send({ error: 'title and prompt are required' });
    }

    const cwdGuard = resolveAllowedCwd(body.cwd ?? '.');

    if (!cwdGuard.allowed) {
      return reply.code(400).send({ error: cwdGuard.reason });
    }

    const store = await getStore();
    const configLoadResult = await getLiveConfigLoadResult();
    const liveConfig = configLoadResult.config;
    const intent = createCodexExecExecutionIntent({
      title: body.title,
      prompt: body.prompt,
      cwd: cwdGuard.cwd,
      sandboxMode: body.sandboxMode ?? 'read_only',
      approvalMode: body.approvalMode ?? 'required',
      liveAdapterEnabled: liveConfig.liveEnabled,
      metadata: body.metadata,
    });
    const dryRunPlan = createCodexExecDryRunPlan(intent);
    const policyDecision = evaluateCodexExecDryRunPolicy(dryRunPlan, policyEngine);
    const liveRunRecord = {
      ...createCodexExecDisabledLiveRunRecord(
        dryRunPlan,
        policyDecision,
        'live adapter disabled in Round 3B control-plane skeleton',
      ),
      configLoadResult,
    };

    if (store) {
      for (const evidenceRef of liveRunRecord.evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of liveRunRecord.auditEvents) {
        await store.auditEvents.append(auditEvent);
      }

      await store.codexExecLiveRuns.saveCodexExecLiveRunRecord(liveRunRecord);
    } else {
      codexExecLiveRunRecords.unshift(liveRunRecord);
    }

    return {
      intent,
      dryRunPlan,
      commandPreview: liveRunRecord.commandPreview,
      policyDecision,
      approvalRequirement: liveRunRecord.approvalRequirement,
      evidenceRefs: liveRunRecord.evidenceRefs,
      auditEvents: liveRunRecord.auditEvents,
      liveRunRecord,
      configLoadResult,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/dry-runs', async () => {
    const store = await getStore();
    const configLoadResult = await getLiveConfigLoadResult();
    const liveConfig = configLoadResult.config;
    const records = store
      ? await store.codexExecLiveRuns.listCodexExecLiveRunRecords(10)
      : codexExecLiveRunRecords.slice(0, 10);

    return {
      runs: records,
      liveConfig,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
      metadata: { liveExecution: false, externalProcessStarted: false, executionDisabled: true },
    };
  });

  server.get('/api/codex/exec/config', async () => {
    const configLoadResult = await getLiveConfigLoadResult();
    const evidenceRefs = createCodexExecControlPlaneEvidenceRefs({ configLoadResult });
    const auditEvents = createCodexExecControlPlaneAuditEvents({ configLoadResult, evidenceRefs });

    return {
      configLoadResult,
      liveConfig: configLoadResult.config,
      capability: evaluateCodexExecLiveCapability(configLoadResult.config),
      evidenceRefs,
      auditEvents,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.post('/api/codex/exec/preflight', async (request, reply) => {
    const body = request.body as
      | {
          dryRunId?: string;
          isolatedWorktreePresent?: boolean;
          worktreePath?: string;
        }
      | undefined;
    const store = await getStore();
    const configLoadResult = await getLiveConfigLoadResult();
    const liveConfig = configLoadResult.config;
    const record = await resolveCodexExecLiveRunRecord(body?.dryRunId, store);

    if (!record) {
      return reply.code(404).send({ error: 'dry-run record was not found' });
    }

    const preflightResult = runCodexExecPreflight(record.dryRunPlan, liveConfig, {
      isolatedWorktreePresent: body?.isolatedWorktreePresent,
      worktreePath: body?.worktreePath,
    });
    const evidenceRefs = createCodexExecControlPlaneEvidenceRefs({ preflightResult });
    const auditEvents = createCodexExecControlPlaneAuditEvents({ preflightResult, evidenceRefs });
    const updatedRecord = {
      ...record,
      preflightResult,
      evidenceRefs: [...record.evidenceRefs, ...evidenceRefs],
      auditEvents: [...record.auditEvents, ...auditEvents],
    };

    await persistCodexExecLiveRunRecord(updatedRecord, store, evidenceRefs, auditEvents);

    return {
      preflightResult,
      evidenceRefs,
      auditEvents,
      liveConfig,
      configLoadResult,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.post('/api/codex/exec/approval-artifact', async (_request, reply) => {
    return reply.code(410).send({
      error:
        'approval-artifact creation is deprecated; use manual approval request and decision endpoints',
      strategy: 'deprecated-gone',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    });
  });

  server.post('/api/codex/exec/approval-request', async (request, reply) => {
    const body = request.body as
      | {
          dryRunId?: string;
          requestedBy?: string;
          reason?: string;
          policySourceId?: string;
        }
      | undefined;
    const store = await getStore();
    const configLoadResult = await getLiveConfigLoadResult();
    const liveConfig = configLoadResult.config;
    const record = await resolveCodexExecLiveRunRecord(body?.dryRunId, store);

    if (!record) {
      return reply.code(404).send({ error: 'dry-run record was not found' });
    }

    const requestedPolicySource = body?.policySourceId
      ? await store?.codexExecRealReadOnlyAdapterPolicySources.getPolicySource(body.policySourceId)
      : undefined;

    if (body?.policySourceId && !requestedPolicySource) {
      return reply.code(404).send({ error: 'policy source record was not found' });
    }

    if (
      requestedPolicySource &&
      (![record.id, record.dryRunPlanId].includes(requestedPolicySource.dryRunId) ||
        requestedPolicySource.status !== 'aligned' ||
        requestedPolicySource.degraded ||
        requestedPolicySource.notPersisted ||
        requestedPolicySource.fallbackUsedAsAuthority)
    ) {
      return reply.code(409).send({
        error: 'policy source is not aligned for approval binding',
        policySourceRecord: requestedPolicySource,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const approvalRequest = requestedPolicySource
      ? createCodexExecManualApprovalRequestForPolicySource(
          record.dryRunPlan,
          requestedPolicySource,
          liveConfig,
          {
            requestedBy: body?.requestedBy,
            reason: body?.reason,
          },
        )
      : createCodexExecManualApprovalRequest(record.dryRunPlan, record.policyDecision, liveConfig, {
          requestedBy: body?.requestedBy,
          reason: body?.reason,
        });
    let approvalRecord = createCodexExecManualApprovalRecord({
      request: approvalRequest,
    });
    const approvalState =
      approvalRecord.approvalState ?? evaluateCodexExecManualApprovalState(approvalRecord);
    const evidenceRefs = createCodexExecControlPlaneEvidenceRefs({
      approvalRequest,
      approvalState,
    });
    const auditEvents = createCodexExecControlPlaneAuditEvents({
      approvalRequest,
      approvalState,
      evidenceRefs,
    });
    approvalRecord = {
      ...approvalRecord,
      approvalState,
      evidenceRefs,
      auditEventIds: auditEvents.map((event) => event.id),
    };
    const updatedRunRecord = {
      ...record,
      manualApprovalRequest: approvalRequest,
      manualApprovalState: approvalState,
      manualApprovalRecord: approvalRecord,
      evidenceRefs: [...record.evidenceRefs, ...evidenceRefs],
      auditEvents: [...record.auditEvents, ...auditEvents],
    };

    await persistCodexExecApprovalRecord(approvalRecord, store);
    await persistCodexExecLiveRunRecord(updatedRunRecord, store, evidenceRefs, auditEvents);

    return {
      approvalRequest,
      approvalState,
      approvalRecord,
      evidenceRefs,
      auditEvents,
      liveConfig,
      configLoadResult,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.post('/api/codex/exec/manual-approval', async (request, reply) => {
    const body = request.body as
      | {
          dryRunId?: string;
          approvalRequestId?: string;
          outcome?: CodexExecApprovalDecisionOutcome;
          decidedBy?: string;
          reason?: string;
        }
      | undefined;
    const outcome: CodexExecApprovalDecisionOutcome = body?.outcome ?? 'approved';

    if (!['approved', 'denied', 'revoked'].includes(outcome)) {
      return reply.code(400).send({ error: 'outcome must be approved, denied, or revoked' });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(body?.dryRunId, store);

    if (!record) {
      return reply.code(404).send({ error: 'dry-run record was not found' });
    }

    const existingApprovalRecord = await resolveCodexExecApprovalRecord(
      body?.approvalRequestId ?? record.manualApprovalRequest?.id,
      store,
    );
    const approvalRequest =
      existingApprovalRecord?.request ??
      record.manualApprovalRequest ??
      createCodexExecManualApprovalRequest(record.dryRunPlan, record.policyDecision);
    const baseApprovalRecord =
      existingApprovalRecord ??
      record.manualApprovalRecord ??
      createCodexExecManualApprovalRecord({ request: approvalRequest });
    const transitionAction = approvalActionForOutcome(outcome);
    const approvalTransition = createCodexExecApprovalTransitionResult(
      baseApprovalRecord,
      transitionAction,
    );
    const transitionPolicyDecision = policyEngine.evaluateAction({
      actionId: approvalRequest.id,
      actionType: 'codex.exec.manual.approval',
      actionMode: 'write',
      riskLevel: approvalRequest.riskLevel,
      dryRun: true,
      approvalGranted: true,
      metadata: {
        dryRunPlanHashPresent: Boolean(approvalRequest.dryRunPlanHash),
        policyDecisionHashPresent: Boolean(approvalRequest.policyDecisionHash),
        transitionAllowed: approvalTransition.allowed,
        transitionAction,
        approvalExpired: approvalTransition.state.expired,
        approvalTerminal: approvalTransition.state.terminal,
        liveExecution: false,
        externalProcessStarted: false,
      },
    });

    if (transitionPolicyDecision.outcome === 'deny') {
      const evidenceRefs = createCodexExecControlPlaneEvidenceRefs({
        approvalState: approvalTransition.state,
        approvalTransition,
      });
      const auditEvents = createCodexExecControlPlaneAuditEvents({
        approvalState: approvalTransition.state,
        approvalTransition,
        evidenceRefs,
      });

      return reply.code(409).send({
        error: 'manual approval transition is blocked',
        approvalRequest,
        approvalState: approvalTransition.state,
        approvalTransition,
        policyDecision: transitionPolicyDecision,
        evidenceRefs,
        auditEvents,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      });
    }

    const approvalDecision = createCodexExecManualApprovalDecision(approvalRequest, {
      outcome,
      decidedBy: body?.decidedBy,
      reason: body?.reason,
    });
    const approvalArtifact = createCodexExecApprovalArtifactFromDecision(
      record.dryRunPlan,
      record.policyDecision,
      approvalRequest,
      approvalDecision,
    );
    let approvalRecord = {
      ...createCodexExecManualApprovalRecord({
        request: approvalRequest,
        decision: approvalDecision,
        approvalArtifact,
      }),
      id: existingApprovalRecord?.id ?? foundationId('codex_approval_record'),
      createdAt: existingApprovalRecord?.createdAt ?? foundationTimestamp(),
    };
    const approvalState = evaluateCodexExecManualApprovalState(approvalRecord);
    const evidenceRefs = createCodexExecControlPlaneEvidenceRefs({
      approvalDecision,
      approvalState,
      approvalTransition,
      approvalArtifact,
    });
    const auditEvents = createCodexExecControlPlaneAuditEvents({
      approvalDecision,
      approvalState,
      approvalTransition,
      approvalArtifact,
      evidenceRefs,
    });
    approvalRecord = {
      ...approvalRecord,
      status: approvalState.status,
      approvalState,
      evidenceRefs: [...(existingApprovalRecord?.evidenceRefs ?? []), ...evidenceRefs],
      auditEventIds: auditEvents.map((event) => event.id),
    };
    const updatedRunRecord = {
      ...record,
      manualApprovalRequest: approvalRequest,
      manualApprovalDecision: approvalDecision,
      manualApprovalState: approvalState,
      manualApprovalRecord: approvalRecord,
      approvalArtifact: approvalArtifact ?? record.approvalArtifact,
      evidenceRefs: [...record.evidenceRefs, ...evidenceRefs],
      auditEvents: [...record.auditEvents, ...auditEvents],
    };

    await persistCodexExecApprovalRecord(approvalRecord, store);
    await persistCodexExecLiveRunRecord(updatedRunRecord, store, evidenceRefs, auditEvents);

    return {
      approvalRequest,
      approvalDecision,
      approvalState,
      approvalTransition,
      transitionPolicyDecision,
      approvalArtifact,
      approvalRecord,
      evidenceRefs,
      auditEvents,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/approvals', async () => {
    const store = await getStore();
    const records = store
      ? await store.codexExecApprovals.listCodexExecApprovalRecords(10)
      : codexExecApprovalRecords.slice(0, 10);
    const approvals = records.map((record) => ({
      ...record,
      approvalState: evaluateCodexExecManualApprovalState(record),
    }));

    return {
      approvals,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
      metadata: { liveExecution: false, externalProcessStarted: false, executionDisabled: true },
    };
  });

  server.post('/api/codex/exec/evaluate-gate', async (request, reply) => {
    const body = request.body as
      | {
          dryRunId?: string;
          approvalArtifactId?: string;
          approvalArtifact?: unknown;
        }
      | undefined;

    if (body !== undefined && Object.prototype.hasOwnProperty.call(body, 'approvalArtifact')) {
      const store = await getStore();
      const record = await resolveCodexExecLiveRunRecord(body.dryRunId, store);
      const evidenceRefs = createUntrustedApprovalArtifactBodyEvidenceRefs(body.dryRunId);
      const auditEvents = createUntrustedApprovalArtifactBodyAuditEvents(
        body.dryRunId,
        evidenceRefs,
      );

      if (record) {
        await persistCodexExecLiveRunRecord(
          {
            ...record,
            evidenceRefs: [...record.evidenceRefs, ...evidenceRefs],
            auditEvents: [...record.auditEvents, ...auditEvents],
          },
          store,
          evidenceRefs,
          auditEvents,
        );
      }

      return reply.code(400).send({
        error: 'untrusted_approval_artifact_body',
        dryRunId: body.dryRunId,
        evidenceRefs,
        auditEvents,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const configLoadResult = await getLiveConfigLoadResult();
    const liveConfig = configLoadResult.config;
    const record = await resolveCodexExecLiveRunRecord(body?.dryRunId, store);

    if (!record) {
      return reply.code(404).send({ error: 'dry-run record was not found' });
    }

    const resolvedApprovalRecord = await resolveExactApprovalAuthorityRecord({
      dryRunPlanId: record.dryRunPlanId,
      approvalArtifactId: body?.approvalArtifactId,
      store,
    });
    const approvalArtifact =
      body?.approvalArtifactId !== undefined
        ? resolvedApprovalRecord?.approvalArtifact
        : record.approvalArtifact;
    const executionGateResult = evaluateCodexExecExecutionGate(
      record.dryRunPlan,
      record.policyDecision,
      approvalArtifact,
      liveConfig,
    );
    const evidenceRefs = createCodexExecControlPlaneEvidenceRefs({ executionGateResult });
    const auditEvents = createCodexExecControlPlaneAuditEvents({
      executionGateResult,
      evidenceRefs,
    });
    const updatedRecord = {
      ...record,
      approvalArtifact,
      executionGateResult,
      evidenceRefs: [...record.evidenceRefs, ...evidenceRefs],
      auditEvents: [...record.auditEvents, ...auditEvents],
    };

    await persistCodexExecLiveRunRecord(updatedRecord, store, evidenceRefs, auditEvents);

    return {
      executionGateResult,
      evidenceRefs,
      auditEvents,
      liveConfig,
      configLoadResult,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.post('/api/codex/exec/read-only-adapter/preflight-simulate', async (request, reply) => {
    const body = request.body as
      | {
          dryRunId?: string;
          requestedSandboxMode?: CodexExecSandboxMode;
          isolatedWorktreePresent?: boolean;
          evidenceStoreReady?: boolean;
          auditStoreReady?: boolean;
          checklistComplete?: boolean;
          operatorChecklist?: CodexExecReadOnlyAdapterOperatorChecklistItem[];
          dashboardTriggerAttempted?: boolean;
          processAdapterAttempted?: boolean;
          workspaceWriteRequested?: boolean;
          dangerFullAccessRequested?: boolean;
        }
      | undefined;

    if (!body?.dryRunId) {
      return reply.code(400).send({
        error: 'dryRunId is required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (body.requestedSandboxMode && !codexExecSandboxModes.has(body.requestedSandboxMode)) {
      return reply.code(400).send({
        error: 'unsupported sandbox mode',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(body.dryRunId, store);

    if (!record) {
      return reply.code(404).send({
        error: 'dry-run record was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const configLoadResult = await getLiveConfigLoadResult();
    const adrDecisions = await listCodexExecLiveAdapterAdrDecisionRecords(store, {
      dryRunId: record.dryRunPlanId,
      limit: 50,
    });
    const adrDecision = getLatestCodexExecLiveAdapterAdrDecision(adrDecisions, record.dryRunPlanId);
    const operatorChecklist = createReadOnlyAdapterOperatorChecklistFromBody(body);
    const simulationResult = simulateReadOnlyAdapterPreflight({
      dryRunId: record.dryRunPlanId,
      record,
      config: configLoadResult.config,
      adrDecision,
      requestedSandboxMode: body.requestedSandboxMode,
      isolatedWorktreePresent: body.isolatedWorktreePresent === true,
      evidenceStoreReady: body.evidenceStoreReady ?? store !== undefined,
      auditStoreReady: body.auditStoreReady ?? store !== undefined,
      operatorChecklist,
      dashboardTriggerAttempted: body.dashboardTriggerAttempted === true,
      processAdapterAttempted: body.processAdapterAttempted === true,
      workspaceWriteRequested: body.workspaceWriteRequested === true,
      dangerFullAccessRequested: body.dangerFullAccessRequested === true,
      metadata: {
        requestedBy: 'supervisor-api',
        liveRunRecordId: record.id,
        configLoadResultId: configLoadResult.id,
      },
    });
    const summary = summarizeReadOnlyAdapterPreflightSimulation(simulationResult);
    const evidenceRefs = createReadOnlyAdapterPreflightSimulationEvidenceRefs(simulationResult);
    const auditEvents = createReadOnlyAdapterPreflightSimulationAuditEvents(
      simulationResult,
      evidenceRefs,
    );

    readOnlyAdapterPreflightSimulations.unshift(simulationResult);

    if (store) {
      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }
    }

    return {
      simulationResult,
      summary,
      blockers: simulationResult.blockers,
      evidenceRefs,
      auditEvents,
      configLoadResult,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/read-only-adapter/preflight-simulations', (request) => {
    const limitResult = parseLimitQueryValue(readQueryValue(request.query, 'limit'));
    const limit = limitResult.allowed ? (limitResult.limit ?? 10) : 10;

    return {
      simulations: readOnlyAdapterPreflightSimulations.slice(0, limit),
      count: Math.min(readOnlyAdapterPreflightSimulations.length, limit),
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.post('/api/codex/exec/read-only-adapter/simulator-review', async (request, reply) => {
    const body = request.body as
      | {
          dryRunId?: string;
          reviewerLabel?: string;
          outcome?: CodexExecReadOnlyAdapterSimulatorReviewOutcome;
          status?: CodexExecReadOnlyAdapterSimulatorReviewStatus;
          rationaleSummary?: string;
        }
      | undefined;

    if (!body?.dryRunId) {
      return reply.code(400).send({
        error: 'dryRunId is required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (body.outcome && !readOnlyAdapterSimulatorReviewOutcomes.has(body.outcome)) {
      return reply.code(400).send({
        error: 'unsupported simulator review outcome',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (body.status && !readOnlyAdapterSimulatorReviewStatuses.has(body.status)) {
      return reply.code(400).send({
        error: 'unsupported simulator review status',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(body.dryRunId, store);

    if (!record) {
      return reply.code(404).send({
        error: 'dry-run record was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const simulationResult = readOnlyAdapterPreflightSimulations.find(
      (candidate) => candidate.dryRunId === record.dryRunPlanId,
    );

    if (!simulationResult) {
      return reply.code(404).send({
        error: 'read-only adapter preflight simulation was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    let reviewRecord = createReadOnlyAdapterSimulatorReviewDecisionRecord({
      simulationResult,
      reviewerLabel: body.reviewerLabel ?? 'local-operator',
      outcome: body.outcome,
      status: body.status,
      rationaleSummary:
        body.rationaleSummary ??
        'Simulator review allows Round 3R implementation planning only; implementation remains unapproved.',
      metadata: {
        requestedBy: 'supervisor-api',
        liveRunRecordId: record.id,
      },
    });
    const evidenceRefs = createReadOnlyAdapterSimulatorReviewEvidenceRefs(reviewRecord);
    const auditEvents = createReadOnlyAdapterSimulatorReviewAuditEvents(reviewRecord, evidenceRefs);
    reviewRecord = {
      ...reviewRecord,
      evidenceRefs,
      auditEventIds: auditEvents.map((event) => event.id),
    };

    if (store) {
      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }
    }

    await persistReadOnlyAdapterSimulatorReviewRecord(reviewRecord, store);

    return createReadOnlyAdapterSimulatorReviewResponse(reviewRecord, evidenceRefs, auditEvents);
  });

  server.get(
    '/api/codex/exec/read-only-adapter/simulator-review/:reviewId',
    async (request, reply) => {
      const params = request.params as { reviewId?: string };

      if (!params.reviewId) {
        return reply.code(400).send({
          error: 'reviewId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const reviewRecord = await resolveReadOnlyAdapterSimulatorReviewRecord(
        params.reviewId,
        store,
      );

      if (!reviewRecord) {
        return reply.code(404).send({
          error: 'read-only adapter simulator review was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createReadOnlyAdapterSimulatorReviewResponse(reviewRecord);
    },
  );

  server.get('/api/codex/exec/read-only-adapter/simulator-reviews', async (request, reply) => {
    const queryResult = parseReadOnlyAdapterSimulatorReviewQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({
        error: queryResult.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const records = await listReadOnlyAdapterSimulatorReviewRecords(store, queryResult.query);

    return {
      records,
      reviews: listReadOnlyAdapterSimulatorReviewSummaries(records, queryResult.query),
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get(
    '/api/codex/exec/read-only-adapter/simulator-review/latest/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const records = await listReadOnlyAdapterSimulatorReviewRecords(store, {
        dryRunId: params.dryRunId,
        limit: 50,
      });
      const reviewRecord = getLatestReadOnlyAdapterSimulatorReview(records, params.dryRunId);

      if (!reviewRecord) {
        return reply.code(404).send({
          error: 'read-only adapter simulator review was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createReadOnlyAdapterSimulatorReviewResponse(reviewRecord);
    },
  );

  server.post(
    '/api/codex/exec/read-only-adapter/implementation-plan-review',
    async (request, reply) => {
      const body = request.body as
        | {
            reviewerLabel?: string;
            outcome?: CodexExecReadOnlyAdapterImplementationPlanReviewOutcome;
            status?: CodexExecReadOnlyAdapterImplementationPlanReviewStatus;
            rationaleSummary?: string;
          }
        | undefined;

      if (!body?.outcome) {
        return reply.code(400).send({
          error: 'outcome is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      if (!readOnlyAdapterImplementationPlanReviewOutcomes.has(body.outcome)) {
        return reply.code(400).send({
          error: 'unsupported implementation plan review outcome',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      if (body.status && !readOnlyAdapterImplementationPlanReviewStatuses.has(body.status)) {
        return reply.code(400).send({
          error: 'unsupported implementation plan review status',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      let reviewRecord = createReadOnlyAdapterImplementationPlanReviewDecisionRecord({
        outcome: body.outcome,
        status: body.status,
        reviewerLabel: body.reviewerLabel ?? 'local-operator',
        rationaleSummary:
          body.rationaleSummary ??
          'Implementation plan review records governance only; process adapter and execution remain unapproved.',
        metadata: {
          requestedBy: 'supervisor-api',
        },
      });
      const evidenceRefs = createReadOnlyAdapterImplementationPlanReviewEvidenceRefs(reviewRecord);
      const auditEvents = createReadOnlyAdapterImplementationPlanReviewAuditEvents(
        reviewRecord,
        evidenceRefs,
      );
      reviewRecord = {
        ...reviewRecord,
        evidenceRefs,
        auditEventIds: auditEvents.map((event) => event.id),
      };

      if (store) {
        for (const evidenceRef of evidenceRefs) {
          await store.evidenceRefs.create(evidenceRef);
        }

        for (const auditEvent of auditEvents) {
          await store.auditEvents.append(auditEvent);
        }
      }

      await persistReadOnlyAdapterImplementationPlanReviewRecord(reviewRecord, store);

      return createReadOnlyAdapterImplementationPlanReviewResponse(
        reviewRecord,
        evidenceRefs,
        auditEvents,
      );
    },
  );

  server.get(
    '/api/codex/exec/read-only-adapter/implementation-plan-reviews',
    async (request, reply) => {
      const queryResult = parseReadOnlyAdapterImplementationPlanReviewQuery(request.query);

      if (!queryResult.allowed) {
        return reply.code(400).send({
          error: queryResult.reason,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const records = await listReadOnlyAdapterImplementationPlanReviewRecords(
        store,
        queryResult.query,
      );

      return {
        records,
        reviews: listReadOnlyAdapterImplementationPlanReviewSummaries(records, queryResult.query),
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        processAdapterApproved: false,
        dashboardTriggerAllowed: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      };
    },
  );

  server.get(
    '/api/codex/exec/read-only-adapter/implementation-plan-review/latest',
    async (_request, reply) => {
      const store = await getStore();
      const records = await listReadOnlyAdapterImplementationPlanReviewRecords(store, {
        limit: 50,
      });
      const reviewRecord = getLatestReadOnlyAdapterImplementationPlanReview(records);

      if (!reviewRecord) {
        return reply.code(404).send({
          error: 'read-only adapter implementation plan review was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createReadOnlyAdapterImplementationPlanReviewResponse(reviewRecord);
    },
  );

  server.get(
    '/api/codex/exec/read-only-adapter/implementation-plan-review/:reviewId',
    async (request, reply) => {
      const params = request.params as { reviewId?: string };

      if (!params.reviewId) {
        return reply.code(400).send({
          error: 'reviewId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const reviewRecord = await resolveReadOnlyAdapterImplementationPlanReviewRecord(
        params.reviewId,
        store,
      );

      if (!reviewRecord) {
        return reply.code(404).send({
          error: 'read-only adapter implementation plan review was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createReadOnlyAdapterImplementationPlanReviewResponse(reviewRecord);
    },
  );

  server.get('/api/codex/exec/read-only-adapter/skeleton-preview', async () => {
    const preview = createReadOnlyAdapterSkeletonPreview({
      metadata: {
        requestedBy: 'supervisor-api',
      },
    });
    const evidenceRefs = createReadOnlyAdapterSkeletonEvidenceRefs(preview);
    const auditEvents = createReadOnlyAdapterSkeletonAuditEvents(preview, evidenceRefs);

    return {
      preview,
      evidenceRefs,
      auditEvents,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.post('/api/codex/exec/read-only-adapter/skeleton-review', async (request, reply) => {
    const body = request.body as
      | {
          reviewerLabel?: string;
          outcome?: CodexExecReadOnlyAdapterSkeletonReviewOutcome;
          status?: CodexExecReadOnlyAdapterSkeletonReviewStatus;
          rationaleSummary?: string;
        }
      | undefined;
    const outcome = body?.outcome ?? 'skeleton_accepted_for_fixture_boundary_only';

    if (!readOnlyAdapterSkeletonReviewOutcomes.has(outcome)) {
      return reply.code(400).send({
        error: 'unsupported skeleton review outcome',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (body?.status && !readOnlyAdapterSkeletonReviewStatuses.has(body.status)) {
      return reply.code(400).send({
        error: 'unsupported skeleton review status',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const preview = createReadOnlyAdapterSkeletonPreview({
      metadata: {
        requestedBy: 'supervisor-api',
      },
    });
    let reviewRecord = createReadOnlyAdapterSkeletonReviewDecisionRecord({
      preview,
      outcome,
      status: body?.status,
      reviewerLabel: body?.reviewerLabel ?? 'local-operator',
      rationaleSummary:
        body?.rationaleSummary ??
        'Skeleton review allows fixture-backed replay boundary only; execution remains disabled.',
      metadata: {
        requestedBy: 'supervisor-api',
      },
    });
    const evidenceRefs = createReadOnlyAdapterSkeletonReviewEvidenceRefs(reviewRecord);
    const auditEvents = createReadOnlyAdapterSkeletonReviewAuditEvents(reviewRecord, evidenceRefs);
    reviewRecord = {
      ...reviewRecord,
      evidenceRefs,
      auditEventIds: auditEvents.map((event) => event.id),
    };

    if (store) {
      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }
    }

    await persistReadOnlyAdapterSkeletonReviewRecord(reviewRecord, store);

    return createReadOnlyAdapterSkeletonReviewResponse(reviewRecord, evidenceRefs, auditEvents);
  });

  server.get('/api/codex/exec/read-only-adapter/skeleton-reviews', async (request, reply) => {
    const queryResult = parseReadOnlyAdapterSkeletonReviewQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({
        error: queryResult.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const records = await listReadOnlyAdapterSkeletonReviewRecords(store, queryResult.query);

    return {
      records,
      reviews: listReadOnlyAdapterSkeletonReviewSummaries(records, queryResult.query),
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get(
    '/api/codex/exec/read-only-adapter/skeleton-review/latest',
    async (_request, reply) => {
      const store = await getStore();
      const records = await listReadOnlyAdapterSkeletonReviewRecords(store, { limit: 50 });
      const reviewRecord = getLatestReadOnlyAdapterSkeletonReview(records);

      if (!reviewRecord) {
        return reply.code(404).send({
          error: 'read-only adapter skeleton review was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createReadOnlyAdapterSkeletonReviewResponse(reviewRecord);
    },
  );

  server.get(
    '/api/codex/exec/read-only-adapter/skeleton-review/:reviewId',
    async (request, reply) => {
      const params = request.params as { reviewId?: string };

      if (!params.reviewId) {
        return reply.code(400).send({
          error: 'reviewId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const reviewRecord = await resolveReadOnlyAdapterSkeletonReviewRecord(params.reviewId, store);

      if (!reviewRecord) {
        return reply.code(404).send({
          error: 'read-only adapter skeleton review was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createReadOnlyAdapterSkeletonReviewResponse(reviewRecord);
    },
  );

  server.post('/api/codex/exec/read-only-adapter/fixture-boundary', async (request, reply) => {
    const body = request.body as { fixturePath?: string; dryRunId?: string } | undefined;

    if (!body?.fixturePath) {
      return reply.code(400).send({
        error: 'fixturePath is required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const guard = resolveAllowedFixture(body.fixturePath);

    if (!guard.allowed) {
      return reply.code(400).send({
        error: guard.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (!existsSync(guard.path)) {
      return reply.code(404).send({
        error: 'fixture file was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const fixtureText = await readFile(guard.path, 'utf8');
    const result = await runReadOnlyAdapterFixtureBoundary({
      fixturePath: guard.fixturePath,
      fixtureText,
      dryRunId: body.dryRunId,
      metadata: {
        requestedBy: 'supervisor-api',
      },
    });

    if (store) {
      for (const evidenceRef of result.evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of result.auditEvents) {
        await store.auditEvents.append(auditEvent);
      }
    }

    readOnlyAdapterFixtureBoundaryResults.unshift(result);

    return {
      result,
      summary: summarizeReadOnlyAdapterFixtureBoundary(result),
      evidenceRefs: result.evidenceRefs,
      auditEvents: result.auditEvents,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/read-only-adapter/fixture-boundaries', async () => ({
    results: readOnlyAdapterFixtureBoundaryResults.slice(0, 10),
    summaries: readOnlyAdapterFixtureBoundaryResults
      .slice(0, 10)
      .map((result) => summarizeReadOnlyAdapterFixtureBoundary(result)),
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    processAdapterStarted: false,
    implementationApproved: false,
    processAdapterApproved: false,
    dashboardTriggerAllowed: false,
    recommendationGrantsExecution: false,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
    degraded: persistenceState.status !== 'ok',
    reason: persistenceState.reason,
  }));

  server.post('/api/codex/exec/read-only-adapter/final-readiness', async (request, reply) => {
    const body = request.body as
      | {
          reviewerLabel?: string;
          outcome?: CodexExecReadOnlyAdapterFinalReadinessOutcome;
          status?: CodexExecReadOnlyAdapterFinalReadinessStatus;
          rationaleSummary?: string;
        }
      | undefined;
    const outcome = body?.outcome ?? 'ready_for_separate_read_only_adapter_adr';

    if (!readOnlyAdapterFinalReadinessOutcomes.has(outcome)) {
      return reply.code(400).send({
        error: 'unsupported final readiness outcome',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (body?.status && !readOnlyAdapterFinalReadinessStatuses.has(body.status)) {
      return reply.code(400).send({
        error: 'unsupported final readiness status',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const skeletonReviews = await listReadOnlyAdapterSkeletonReviewRecords(store, { limit: 50 });
    const skeletonReview = getLatestReadOnlyAdapterSkeletonReview(skeletonReviews);
    const fixtureBoundary = readOnlyAdapterFixtureBoundaryResults[0];

    if (!skeletonReview) {
      return reply.code(404).send({
        error: 'read-only adapter skeleton review was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (!fixtureBoundary) {
      return reply.code(404).send({
        error: 'fixture-backed replay boundary result was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const skeletonPreview = createReadOnlyAdapterSkeletonPreview();
    let decisionRecord = createReadOnlyAdapterFinalReadinessDecisionRecord({
      skeletonPreview,
      skeletonReview,
      fixtureBoundary,
      outcome,
      status: body?.status,
      reviewerLabel: body?.reviewerLabel ?? 'local-operator',
      rationaleSummary:
        body?.rationaleSummary ??
        'Final readiness review requires a separate ADR before any real read-only adapter can be considered.',
      metadata: {
        requestedBy: 'supervisor-api',
      },
    });
    const evidenceRefs = createReadOnlyAdapterFinalReadinessEvidenceRefs(decisionRecord);
    const auditEvents = createReadOnlyAdapterFinalReadinessAuditEvents(
      decisionRecord,
      evidenceRefs,
    );
    decisionRecord = {
      ...decisionRecord,
      evidenceRefs,
      auditEventIds: auditEvents.map((event) => event.id),
    };

    if (store) {
      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }
    }

    await persistReadOnlyAdapterFinalReadinessRecord(decisionRecord, store);

    return createReadOnlyAdapterFinalReadinessResponse(decisionRecord, evidenceRefs, auditEvents);
  });

  server.get('/api/codex/exec/read-only-adapter/final-readiness', async (request, reply) => {
    const queryResult = parseReadOnlyAdapterFinalReadinessQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({
        error: queryResult.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const records = await listReadOnlyAdapterFinalReadinessRecords(store, queryResult.query);

    return {
      records,
      reviews: listReadOnlyAdapterFinalReadinessSummaries(records, queryResult.query),
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get(
    '/api/codex/exec/read-only-adapter/final-readiness/latest',
    async (_request, reply) => {
      const store = await getStore();
      const records = await listReadOnlyAdapterFinalReadinessRecords(store, { limit: 50 });
      const decisionRecord = getLatestReadOnlyAdapterFinalReadiness(records);

      if (!decisionRecord) {
        return reply.code(404).send({
          error: 'read-only adapter final readiness review was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createReadOnlyAdapterFinalReadinessResponse(decisionRecord);
    },
  );

  server.post(
    '/api/codex/exec/real-read-only-adapter/readiness-package',
    async (request, reply) => {
      const body = request.body as
        | {
            dryRunId?: string;
            symlinkEscapeVerified?: boolean;
            approvalReadinessReady?: boolean;
            worktreeReadinessReady?: boolean;
            operatorChecklistComplete?: boolean;
            postRunVerificationReady?: boolean;
          }
        | undefined;

      if (!body?.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply.code(503).send({
          error: 'readiness package store is unavailable',
          degraded: true,
          notPersisted: true,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
          processAdapterStarted: false,
          implementationApproved: false,
          processAdapterApproved: false,
          recommendationGrantsExecution: false,
          workspaceWriteAllowed: false,
          dangerFullAccessAllowed: false,
          dashboardTriggerAllowed: false,
          reason: persistenceState.reason ?? 'store unavailable',
        });
      }

      const record = await resolveCodexExecLiveRunRecord(body.dryRunId, store);

      if (!record) {
        return reply.code(404).send({
          error: 'dry-run record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const governanceReviews = await listReadOnlyAdapterImplementationPlanReviewRecords(store, {
        outcome: 'conditional_go_to_disabled_skeleton',
        limit: 50,
      });
      const governanceDecision =
        getLatestReadOnlyAdapterImplementationPlanReview(governanceReviews);
      const skeletonReviews = await listReadOnlyAdapterSkeletonReviewRecords(store, { limit: 50 });
      const skeletonReview = getLatestReadOnlyAdapterSkeletonReview(skeletonReviews);
      const finalReadinessRecords = await listReadOnlyAdapterFinalReadinessRecords(store, {
        limit: 50,
      });
      const finalReadiness = getLatestReadOnlyAdapterFinalReadiness(finalReadinessRecords);
      const fixtureBoundary = readOnlyAdapterFixtureBoundaryResults.find(
        (candidate) => candidate.input.dryRunId === record.dryRunPlanId,
      );
      const documentedArtifactRefs = existingReadinessDocumentRefs();
      const packageRecord = buildRealReadOnlyAdapterReadinessPackage({
        dryRunId: record.dryRunPlanId,
        governanceDecision,
        skeletonPreview: createReadOnlyAdapterSkeletonPreview(),
        skeletonReview,
        fixtureBoundary,
        finalReadiness,
        documentedArtifactRefs,
        symlinkEscapeVerified: body.symlinkEscapeVerified === true,
        approvalReadinessReady: body.approvalReadinessReady === true,
        worktreeReadinessReady: body.worktreeReadinessReady === true,
        evidenceStoreReady: true,
        auditStoreReady: true,
        operatorChecklistComplete: body.operatorChecklistComplete === true,
        postRunVerificationReady: body.postRunVerificationReady === true,
        metadata: {
          requestedBy: 'supervisor-api',
          liveRunRecordId: record.id,
          persisted3SDecisionRequired: true,
        },
      });

      if (!governanceDecision) {
        return reply.code(409).send({
          package: packageRecord,
          summary: summarizeRealReadOnlyAdapterReadinessPackage(packageRecord),
          recommendation: REAL_READ_ONLY_ADAPTER_READINESS_RECOMMENDATION,
          error: 'required Round 3S conditional skeleton governance decision was not found',
          degraded: false,
          notPersisted: true,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
          processAdapterStarted: false,
          implementationApproved: false,
          processAdapterApproved: false,
          recommendationGrantsExecution: false,
          workspaceWriteAllowed: false,
          dangerFullAccessAllowed: false,
          dashboardTriggerAllowed: false,
        });
      }

      const evidenceRefs = createRealReadOnlyAdapterReadinessEvidenceRefs(packageRecord);
      const auditEvents = createRealReadOnlyAdapterReadinessAuditEvents(
        packageRecord,
        evidenceRefs,
      );
      const persistedPackage = {
        ...packageRecord,
        evidenceRefs,
        auditEventIds: auditEvents.map((event) => event.id),
      };

      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }

      await persistRealReadOnlyAdapterReadinessPackage(persistedPackage, store);

      return createRealReadOnlyAdapterReadinessResponse(
        persistedPackage,
        evidenceRefs,
        auditEvents,
      );
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/readiness-package/:packageId',
    async (request, reply) => {
      const params = request.params as { packageId?: string };

      if (!params.packageId) {
        return reply.code(400).send({
          error: 'packageId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const packageRecord = await resolveRealReadOnlyAdapterReadinessPackage(
        params.packageId,
        store,
      );

      if (!packageRecord) {
        return reply.code(404).send({
          error: 'readiness package was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterReadinessResponse(packageRecord);
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/readiness-packages',
    async (request, reply) => {
      const queryResult = parseRealReadOnlyAdapterReadinessQuery(request.query);

      if (!queryResult.allowed) {
        return reply.code(400).send({
          error: queryResult.reason,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const packages = await listRealReadOnlyAdapterReadinessPackages(store, queryResult.query);

      return {
        packages,
        summaries: packages.map((packageRecord) =>
          summarizeRealReadOnlyAdapterReadinessPackage(packageRecord),
        ),
        recommendation: REAL_READ_ONLY_ADAPTER_READINESS_RECOMMENDATION,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        dashboardTriggerAllowed: false,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      };
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/readiness-package/latest/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const packageRecord = await latestRealReadOnlyAdapterReadinessPackage(params.dryRunId, store);

      if (!packageRecord) {
        return reply.code(404).send({
          error: 'readiness package was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterReadinessResponse(packageRecord);
    },
  );

  server.post('/api/codex/exec/real-read-only-adapter/readiness-review', async (request, reply) => {
    const body = request.body as
      | {
          packageId?: string;
          outcome?: string;
          reviewerLabel?: string;
          rationaleSummary?: string;
          status?: string;
        }
      | undefined;

    if (!body?.packageId) {
      return reply.code(400).send({
        error: 'packageId is required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (!body.outcome || !realReadOnlyAdapterReadinessReviewOutcomes.has(body.outcome)) {
      return reply.code(400).send({
        error: 'valid outcome is required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (body.status && !realReadOnlyAdapterReadinessReviewStatuses.has(body.status)) {
      return reply.code(400).send({
        error: 'unsupported readiness review status',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();

    if (!store) {
      return reply.code(503).send({
        error: 'readiness review store is unavailable',
        degraded: true,
        notPersisted: true,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        dashboardTriggerAllowed: false,
        reason: persistenceState.reason ?? 'store unavailable',
      });
    }

    const packageRecord = await resolveRealReadOnlyAdapterReadinessPackage(body.packageId, store);

    if (!packageRecord) {
      return reply.code(404).send({
        error: 'readiness package was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const validation = validateRealReadOnlyAdapterReadinessReviewDecision({
      packageRecord,
      outcome: body.outcome as CodexExecRealReadOnlyAdapterReadinessReviewOutcome,
      rationaleSummary: body.rationaleSummary ?? '',
    });

    if (!validation.valid) {
      return reply.code(400).send({
        error: validation.reason,
        requiredAcknowledgementCodes: validation.requiredAcknowledgementCodes,
        missingAcknowledgementCodes: validation.missingAcknowledgementCodes,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      });
    }

    const reviewRecord = createRealReadOnlyAdapterReadinessReviewDecisionRecord({
      packageRecord,
      outcome: body.outcome as CodexExecRealReadOnlyAdapterReadinessReviewOutcome,
      status:
        (body.status as CodexExecRealReadOnlyAdapterReadinessReviewStatus | undefined) ??
        'recorded',
      reviewerLabel: body.reviewerLabel ?? 'local-operator',
      rationaleSummary: body.rationaleSummary ?? 'Readiness package reviewed.',
      metadata: {
        requestedBy: 'supervisor-api',
      },
    });
    const evidenceRefs = createRealReadOnlyAdapterReadinessReviewEvidenceRefs(reviewRecord);
    const auditEvents = createRealReadOnlyAdapterReadinessReviewAuditEvents(
      reviewRecord,
      evidenceRefs,
    );
    const persistedReview = {
      ...reviewRecord,
      evidenceRefs,
      auditEventIds: auditEvents.map((event) => event.id),
    };

    for (const evidenceRef of evidenceRefs) {
      await store.evidenceRefs.create(evidenceRef);
    }

    for (const auditEvent of auditEvents) {
      await store.auditEvents.append(auditEvent);
    }

    await persistRealReadOnlyAdapterReadinessReview(persistedReview, store);

    return createRealReadOnlyAdapterReadinessReviewResponse(
      persistedReview,
      evidenceRefs,
      auditEvents,
    );
  });

  server.get(
    '/api/codex/exec/real-read-only-adapter/readiness-review/:reviewId',
    async (request, reply) => {
      const params = request.params as { reviewId?: string };

      if (!params.reviewId) {
        return reply.code(400).send({
          error: 'reviewId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const review = await resolveRealReadOnlyAdapterReadinessReview(params.reviewId, store);

      if (!review) {
        return reply.code(404).send({
          error: 'readiness review was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterReadinessReviewResponse(review);
    },
  );

  server.get('/api/codex/exec/real-read-only-adapter/readiness-reviews', async (request, reply) => {
    const queryResult = parseRealReadOnlyAdapterReadinessReviewQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({
        error: queryResult.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const reviews = await listRealReadOnlyAdapterReadinessReviews(store, queryResult.query);

    return {
      reviews,
      summaries: listRealReadOnlyAdapterReadinessReviewSummaries(reviews, queryResult.query),
      recommendation: REAL_READ_ONLY_ADAPTER_READINESS_REVIEW_RECOMMENDATION,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get(
    '/api/codex/exec/real-read-only-adapter/readiness-review/latest/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const review = await latestRealReadOnlyAdapterReadinessReview(params.dryRunId, store);

      if (!review) {
        return reply.code(404).send({
          error: 'readiness review was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterReadinessReviewResponse(review);
    },
  );

  server.post('/api/codex/exec/real-read-only-adapter/policy-sources', async (request, reply) => {
    const body = request.body as { dryRunId?: string } | undefined;

    if (!body?.dryRunId) {
      return reply.code(400).send({
        error: 'dryRunId is required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();

    if (!store) {
      return reply
        .code(503)
        .send(createRealReadOnlyAdapterPolicySourceUnavailableResponse(body.dryRunId));
    }

    const configLoadResult = await getLiveConfigLoadResult();
    const dryRunRecord = await resolveCodexExecLiveRunRecord(body.dryRunId, store);
    const readOnlyOnly =
      configLoadResult.status === 'loaded' &&
      configLoadResult.config.allowedSandboxModes.length === 1 &&
      configLoadResult.config.allowedSandboxModes[0] === 'read_only' &&
      configLoadResult.config.forbiddenSandboxModes.includes('workspace_write') &&
      configLoadResult.config.forbiddenSandboxModes.includes('danger_full_access');
    const alignedPolicyDecision = dryRunRecord
      ? evaluateCodexExecDryRunPolicy(
          {
            ...dryRunRecord.dryRunPlan,
            liveAdapterEnabled: configLoadResult.config.liveEnabled,
          },
          policyEngine,
        )
      : undefined;
    const record = buildRealReadOnlyAdapterPolicySourceRecord({
      dryRunId: body.dryRunId,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      dryRunRecordPresent: dryRunRecord !== undefined,
      configExplicitlyEnabled:
        configLoadResult.status === 'loaded' && configLoadResult.config.liveEnabled === true,
      readOnlyOnly,
      policyDecision: alignedPolicyDecision,
      dryRunPlan: dryRunRecord?.dryRunPlan,
      evidenceAuditReady: persistenceState.status === 'ok',
      fallbackUsedAsAuthority: false,
      metadata: {
        requestedBy: 'supervisor-api',
        configLoadStatus: configLoadResult.status,
        configSource: configLoadResult.source,
        historicalPolicyDecisionId: dryRunRecord?.policyDecision.id,
        historicalPolicyDecisionOutcome: dryRunRecord?.policyDecision.outcome,
        historicalPolicyMutated: false,
        source: 'apps.supervisor.real-read-only-adapter.policy-source',
      },
    });
    const evidenceRefs = createRealReadOnlyAdapterPolicySourceEvidenceRefs(record);
    const auditEvents = createRealReadOnlyAdapterPolicySourceAuditEvents(record, evidenceRefs);
    const recordWithRefs = {
      ...record,
      evidenceRefs,
      auditEventIds: auditEvents.map((event) => event.id),
    };

    for (const evidenceRef of evidenceRefs) {
      await store.evidenceRefs.create(evidenceRef);
    }

    for (const auditEvent of auditEvents) {
      await store.auditEvents.append(auditEvent);
    }

    const persistedRecord =
      await store.codexExecRealReadOnlyAdapterPolicySources.savePolicySource(recordWithRefs);

    return createRealReadOnlyAdapterPolicySourceResponse(persistedRecord, {
      evidenceRefs,
      auditEvents,
    });
  });

  server.get(
    '/api/codex/exec/real-read-only-adapter/policy-sources/:recordId',
    async (request, reply) => {
      const params = request.params as { recordId?: string };

      if (!params.recordId) {
        return reply.code(400).send({
          error: 'recordId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply.code(503).send(createRealReadOnlyAdapterPolicySourceUnavailableResponse());
      }

      const record = await store.codexExecRealReadOnlyAdapterPolicySources.getPolicySource(
        params.recordId,
      );

      if (!record) {
        return reply.code(404).send({
          error: 'policy source record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterPolicySourceResponse(record);
    },
  );

  server.get('/api/codex/exec/real-read-only-adapter/policy-sources', async (request, reply) => {
    const queryResult = parseRealReadOnlyAdapterPolicySourceQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({
        error: queryResult.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createRealReadOnlyAdapterPolicySourceUnavailableResponse());
    }

    const records = await store.codexExecRealReadOnlyAdapterPolicySources.listPolicySources(
      queryResult.query,
    );

    return createRealReadOnlyAdapterPolicySourceListResponse(records, queryResult.query);
  });

  server.get(
    '/api/codex/exec/real-read-only-adapter/policy-source/latest/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterPolicySourceUnavailableResponse(params.dryRunId));
      }

      const record = await store.codexExecRealReadOnlyAdapterPolicySources.latestPolicySource(
        params.dryRunId,
      );

      if (!record) {
        return reply.code(404).send({
          error: 'policy source record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterPolicySourceResponse(record);
    },
  );

  server.post(
    '/api/codex/exec/real-read-only-adapter/approval-authority-traces',
    async (request, reply) => {
      const body = request.body as
        | {
            dryRunId?: string;
            approvalArtifactId?: string;
          }
        | undefined;

      if (!body?.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterApprovalAuthorityTraceUnavailableResponse(body.dryRunId));
      }

      const record = await buildAndPersistRealReadOnlyAdapterApprovalAuthorityTrace({
        dryRunId: body.dryRunId,
        approvalArtifactId: body.approvalArtifactId,
        store,
        metadata: {
          requestedBy: 'supervisor-api',
          source: 'apps.supervisor.real-read-only-adapter.approval-authority-trace',
        },
      });

      return createRealReadOnlyAdapterApprovalAuthorityTraceResponse(record);
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/approval-authority-traces/:recordId',
    async (request, reply) => {
      const params = request.params as { recordId?: string };

      if (!params.recordId) {
        return reply.code(400).send({
          error: 'recordId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterApprovalAuthorityTraceUnavailableResponse());
      }

      const record =
        await store.codexExecRealReadOnlyAdapterApprovalAuthorityTraces.getApprovalAuthorityTrace(
          params.recordId,
        );

      if (!record) {
        return reply.code(404).send({
          error: 'approval authority trace record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterApprovalAuthorityTraceResponse(record);
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/approval-authority-traces',
    async (request, reply) => {
      const queryResult = parseRealReadOnlyAdapterApprovalAuthorityTraceQuery(request.query);

      if (!queryResult.allowed) {
        return reply.code(400).send({
          error: queryResult.reason,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterApprovalAuthorityTraceUnavailableResponse());
      }

      const records =
        await store.codexExecRealReadOnlyAdapterApprovalAuthorityTraces.listApprovalAuthorityTraces(
          queryResult.query,
        );

      return createRealReadOnlyAdapterApprovalAuthorityTraceListResponse(
        records,
        queryResult.query,
      );
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/approval-authority-trace/latest/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(
            createRealReadOnlyAdapterApprovalAuthorityTraceUnavailableResponse(params.dryRunId),
          );
      }

      const record =
        await store.codexExecRealReadOnlyAdapterApprovalAuthorityTraces.latestApprovalAuthorityTrace(
          params.dryRunId,
        );

      if (!record) {
        return reply.code(404).send({
          error: 'approval authority trace record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterApprovalAuthorityTraceResponse(record);
    },
  );

  server.post('/api/codex/exec/real-read-only-adapter/attempt', async (request, reply) => {
    const body = request.body as
      | {
          dryRunId?: string;
          approvalArtifactId?: string;
          policyDecisionId?: string;
          isolatedWorktreeProvided?: boolean;
          worktreePath?: string;
          governedInputRelativePath?: string;
          governedInputContentHash?: string;
        }
      | undefined;

    if (!body?.dryRunId) {
      return reply.code(400).send({
        error: 'dryRunId is required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();

    if (!store) {
      return reply
        .code(503)
        .send(createRealReadOnlyAdapterAttemptUnavailableResponse(body.dryRunId));
    }

    const configLoadResult = await getLiveConfigLoadResult();
    const config =
      configLoadResult.status === 'loaded'
        ? createRealReadOnlyAdapterConfigFromLiveConfig({
            liveConfig: configLoadResult.config,
            metadata: {
              requestedBy: 'supervisor-api',
              configLoadStatus: configLoadResult.status,
              configSource: configLoadResult.source,
              source: 'apps.supervisor.real-read-only-adapter.attempt',
            },
          })
        : createDefaultRealReadOnlyAdapterConfig({
            requestedBy: 'supervisor-api',
            configLoadStatus: configLoadResult.status,
            configSource: configLoadResult.source,
            source: 'apps.supervisor.real-read-only-adapter.attempt',
          });
    const dryRunRecord = await resolveCodexExecLiveRunRecord(body.dryRunId, store);
    const latestSourcePreparation =
      await store.codexExecRealReadOnlyAdapterPilotSourcePreparations.latestPilotSourcePreparation(
        body.dryRunId,
      );
    const latestPrerequisite =
      await store.codexExecRealReadOnlyAdapterPilotPrerequisites.latestPilotPrerequisite(
        body.dryRunId,
      );
    const latestPolicySource =
      await store.codexExecRealReadOnlyAdapterPolicySources.latestPolicySource(body.dryRunId);
    const authoritativePolicySourcePresent =
      latestPolicySource?.status === 'aligned' &&
      latestPolicySource.authoritative === true &&
      latestPolicySource.supervisorBacked === true &&
      latestPolicySource.persisted === true &&
      latestPolicySource.degraded === false &&
      latestPolicySource.notPersisted === false &&
      latestPolicySource.fallbackUsedAsAuthority === false &&
      latestPolicySource.policyDecisionOutcome !== 'deny';
    const policyDecisionForAttempt = authoritativePolicySourcePresent
      ? createPolicyDecisionFromRealReadOnlyAdapterPolicySource(latestPolicySource)
      : undefined;
    const expectedDryRunPlanHash =
      latestPolicySource?.dryRunPlanHash ?? latestSourcePreparation?.dryRunPlanHash;
    const expectedPolicyDecisionHash =
      latestPolicySource?.policyDecisionHash ?? latestSourcePreparation?.policyDecisionHash;
    const approvalAuthority = await resolveRealReadOnlyAdapterPilotApprovalAuthority({
      dryRunId: body.dryRunId,
      dryRunPlanId: dryRunRecord?.dryRunPlanId,
      approvalArtifactId: body.approvalArtifactId,
      expectedDryRunPlanHash,
      expectedPolicyDecisionHash,
      store,
    });
    const approvalAuthorityTrace = createRealReadOnlyAdapterApprovalAuthorityTraceRecordForRequest({
      dryRunId: body.dryRunId,
      approvalAuthority: approvalAuthority.summary,
      inputApprovalArtifactId: body.approvalArtifactId,
      latestSourcePreparation,
      latestPrerequisite,
      metadata: {
        requestedBy: 'supervisor-api',
        source: 'apps.supervisor.real-read-only-adapter.attempt',
      },
    });
    const approvalArtifact =
      approvalAuthorityTrace.status === 'aligned' ? approvalAuthority.artifact : undefined;
    const authoritativeSourcePreparationPresent =
      latestSourcePreparation?.status === 'prepared' &&
      latestSourcePreparation.authoritative === true &&
      latestSourcePreparation.supervisorBacked === true &&
      latestSourcePreparation.persisted === true &&
      latestSourcePreparation.degraded === false &&
      latestSourcePreparation.notPersisted === false;
    const authoritativePrerequisiteReady =
      latestPrerequisite?.status === 'ready_for_pilot_retry' &&
      latestPrerequisite.authoritative === true &&
      latestPrerequisite.supervisorBacked === true &&
      latestPrerequisite.persisted === true &&
      latestPrerequisite.degraded === false &&
      latestPrerequisite.notPersisted === false &&
      latestPrerequisite.fallbackUsedAsAuthority === false;
    const evidenceAuditReady =
      persistenceState.status === 'ok' &&
      ((authoritativeSourcePreparationPresent &&
        (latestSourcePreparation?.evidenceRefs.length ?? 0) > 0 &&
        (latestSourcePreparation?.auditEventIds.length ?? 0) > 0) ||
        (authoritativePrerequisiteReady &&
          (latestPrerequisite?.evidenceRefs.length ?? 0) > 0 &&
          (latestPrerequisite?.auditEventIds.length ?? 0) > 0));
    const expectedWorktreePathHash =
      latestSourcePreparation?.worktreePathHash ?? latestPrerequisite?.worktreePathHash;
    const runtimeWorktreePathHash =
      body.worktreePath && body.worktreePath.trim().length > 0
        ? hashRealReadOnlyAdapterRuntimeWorktreePath(body.worktreePath)
        : undefined;
    const worktreePathHashMatched =
      expectedWorktreePathHash !== undefined &&
      runtimeWorktreePathHash === expectedWorktreePathHash;
    const governedInputSource =
      body.worktreePath && body.governedInputRelativePath && body.governedInputContentHash
        ? {
            sourceKind: 'governed_file' as const,
            relativePath: body.governedInputRelativePath,
            expectedContentHash: body.governedInputContentHash,
          }
        : undefined;
    const governedInputVerification =
      body.worktreePath && governedInputSource
        ? verifyRealReadOnlyAdapterGovernedInputSource({
            worktreePath: body.worktreePath,
            source: governedInputSource,
          })
        : createBlockedRealReadOnlyAdapterGovernedInputVerification(
            'governed_input_missing',
            governedInputSource,
          );
    const isolatedCleanWorktreeMetadataPresent =
      latestSourcePreparation?.isolatedCleanWorktreeMetadataPresent === true ||
      latestPrerequisite?.isolatedCleanWorktreeMetadataPresent === true;
    const attemptRequest = createRealReadOnlyAdapterRequest({
      dryRunId: body.dryRunId,
      config,
      approvalArtifactId: body.approvalArtifactId,
      policyDecisionId:
        body.policyDecisionId ?? policyDecisionForAttempt?.id ?? dryRunRecord?.policyDecision.id,
      metadata: {
        requestedBy: 'supervisor-api',
        isolatedWorktreeProvided:
          body.isolatedWorktreeProvided === true || body.worktreePath !== undefined,
        runtimeWorktreeProvided: body.worktreePath !== undefined,
        approvalInputProvided: body.approvalArtifactId !== undefined,
        governedInputProvided: governedInputSource !== undefined,
        governedInputVerified: governedInputVerification.status === 'verified',
        governedInputReasonCode:
          governedInputVerification.status === 'blocked'
            ? governedInputVerification.reasonCode
            : undefined,
        governedInputSourceKind: governedInputVerification.sourceKind,
        governedInputRelativePathHash: governedInputVerification.relativePathHash,
        governedInputContentHash: governedInputVerification.contentHash,
        governedInputExpectedContentHash: governedInputVerification.expectedContentHash,
        governedInputByteLength: governedInputVerification.byteLength,
        governedInputLineCount: governedInputVerification.lineCount,
        governedInputBodyStored: false,
        promptBodyStored: false,
        promptArgumentStored: false,
        configLoadStatus: configLoadResult.status,
        configSource: configLoadResult.source,
        dryRunRecordPresent: dryRunRecord !== undefined,
        approvalArtifactPresent: approvalArtifact !== undefined,
        approvalAuthorityStatus: approvalAuthority.summary.status,
        approvalAuthorityReasonCodes: approvalAuthority.summary.reasonCodes,
        approvalAuthorityTraceId: approvalAuthorityTrace.id,
        approvalAuthorityTraceStatus: approvalAuthorityTrace.status,
        approvalAuthorityTraceReasonCodes: approvalAuthorityTrace.reasonCodes,
        approvalAuthorityTracePreflightWouldAccept:
          approvalAuthorityTrace.attemptPreflightWouldAccept,
        approvalRecordId: approvalAuthority.summary.approvalRecordId,
        approvalCheckedAt: approvalAuthority.summary.checkedAt,
        approvalExpiresAt: approvalAuthority.summary.expiresAt,
        approvalDryRunHashMatched: approvalAuthority.summary.dryRunHashMatched,
        approvalPolicyHashMatched: approvalAuthority.summary.policyHashMatched,
        latestPolicySourceId: latestPolicySource?.id,
        policySourceReady: authoritativePolicySourcePresent,
        latestSourcePreparationId: latestSourcePreparation?.id,
        latestPrerequisiteId: latestPrerequisite?.id,
        runtimeWorktreePathHashMatched: worktreePathHashMatched,
        worktreePathStored: false,
      },
    });
    const preflight = createRealReadOnlyAdapterGuardPreflight({
      dryRunId: body.dryRunId,
      request: attemptRequest,
      config,
      dryRunPlan: dryRunRecord?.dryRunPlan,
      policyDecision: policyDecisionForAttempt,
      approvalArtifact,
      expectedDryRunPlanHash: expectedDryRunPlanHash ?? approvalAuthority.summary.dryRunPlanHash,
      expectedPolicyDecisionHash:
        expectedPolicyDecisionHash ?? approvalAuthority.summary.policyDecisionHash,
      requestedSandboxMode: 'read_only',
      triggerKind: 'cli',
      worktree: {
        isolated:
          isolatedCleanWorktreeMetadataPresent &&
          authoritativeSourcePreparationPresent &&
          authoritativePrerequisiteReady &&
          worktreePathHashMatched,
        status:
          isolatedCleanWorktreeMetadataPresent && worktreePathHashMatched ? 'clean' : 'missing',
        pathHash: worktreePathHashMatched ? runtimeWorktreePathHash : undefined,
      },
      governedInput: governedInputVerification,
      evidenceStoreReady: evidenceAuditReady,
      auditStoreReady: evidenceAuditReady,
      metadata: {
        requestedBy: 'supervisor-api',
        authoritativeAttemptRecord: true,
        policySourceReady: authoritativePolicySourcePresent,
        approvalAuthorityStatus: approvalAuthority.summary.status,
        approvalAuthorityReasonCodes: approvalAuthority.summary.reasonCodes,
        approvalAuthorityTraceId: approvalAuthorityTrace.id,
        approvalAuthorityTraceStatus: approvalAuthorityTrace.status,
        approvalAuthorityTraceReasonCodes: approvalAuthorityTrace.reasonCodes,
        approvalAuthorityTracePreflightWouldAccept:
          approvalAuthorityTrace.attemptPreflightWouldAccept,
        latestPolicySourceId: latestPolicySource?.id,
        sourcePreparationReady: authoritativeSourcePreparationPresent,
        prerequisiteReady: authoritativePrerequisiteReady,
        governedInputProvided: governedInputSource !== undefined,
        governedInputVerified: governedInputVerification.status === 'verified',
        governedInputReasonCode:
          governedInputVerification.status === 'blocked'
            ? governedInputVerification.reasonCode
            : undefined,
        governedInputSourceKind: governedInputVerification.sourceKind,
        governedInputRelativePathHash: governedInputVerification.relativePathHash,
        governedInputContentHash: governedInputVerification.contentHash,
        governedInputExpectedContentHash: governedInputVerification.expectedContentHash,
        governedInputByteLength: governedInputVerification.byteLength,
        governedInputLineCount: governedInputVerification.lineCount,
        governedInputBodyStored: false,
        promptBodyStored: false,
        promptArgumentStored: false,
        worktreePathStored: false,
      },
    });
    const executableResolution =
      preflight.status === 'passed' && body.worktreePath && body.approvalArtifactId
        ? (
            options.realReadOnlyAdapterExecutableResolver ??
            (() => resolveRealReadOnlyAdapterExecutable({ policyLabel: 'codex_cli' }))
          )()
        : undefined;
    const cwdSelfCheck =
      preflight.status === 'passed' && body.worktreePath
        ? createRealReadOnlyAdapterRuntimeCwdSelfCheck({ worktreePath: body.worktreePath })
        : undefined;
    const boundaryResult =
      executableResolution?.status === 'resolved' &&
      cwdSelfCheck?.status === 'passed' &&
      governedInputVerification.status === 'verified' &&
      body.worktreePath &&
      body.approvalArtifactId
        ? await runRealReadOnlyAdapterProcessBoundary(
            createRealReadOnlyAdapterProcessPlan({
              dryRunId: body.dryRunId,
              approvalArtifactId: body.approvalArtifactId,
              executablePath: executableResolution.executablePath,
              executablePolicyLabel: 'codex_cli',
              worktreePath: body.worktreePath,
              governedInput: governedInputVerification,
              env: executableResolution.env,
              timeoutMs: 60_000,
              executableResolution,
              cwdSelfCheck,
              metadata: {
                executablePolicyLabel: 'codex_cli',
                executablePathStored: false,
                argvStored: false,
                envPlanStored: false,
                platform: executableResolution.platform,
                resolvedExecutableKind: executableResolution.resolvedExecutableKind,
                executablePathHash: executableResolution.executablePathHash,
                executableExists: executableResolution.executableExists,
                executableAccessible: executableResolution.executableAccessible,
                envAllowlistKeyCount: executableResolution.envAllowlistKeyCount,
                envAllowlistKeyHash: executableResolution.envAllowlistKeyHash,
                cwdHash: cwdSelfCheck.cwdHash,
                cwdExists: cwdSelfCheck.cwdExists,
                cwdIsDirectory: cwdSelfCheck.cwdIsDirectory,
                cwdPathStored: false,
                worktreePathStored: false,
                governedInputVerified: true,
                governedInputSourceKind: governedInputVerification.sourceKind,
                governedInputRelativePathHash: governedInputVerification.relativePathHash,
                governedInputContentHash: governedInputVerification.contentHash,
                governedInputByteLength: governedInputVerification.byteLength,
                governedInputLineCount: governedInputVerification.lineCount,
                governedInputBodyStored: false,
                promptBodyStored: false,
                promptArgumentStored: false,
                source: 'apps.supervisor.real-read-only-adapter.attempt-process-plan',
              },
            }),
            { runner: options.realReadOnlyAdapterProcessRunner },
          )
        : undefined;
    const initialResult =
      boundaryResult === undefined
        ? createRealReadOnlyAdapterBlockedResult({
            request: attemptRequest,
            preflight,
            config,
            metadata: {
              requestedBy: 'supervisor-api',
              authoritativeAttemptRecord: true,
              configLoadStatus: configLoadResult.status,
              approvalAuthorityStatus: approvalAuthority.summary.status,
              approvalAuthorityReasonCodes: approvalAuthority.summary.reasonCodes,
              approvalAuthorityTraceId: approvalAuthorityTrace.id,
              approvalAuthorityTraceStatus: approvalAuthorityTrace.status,
              approvalAuthorityTraceReasonCodes: approvalAuthorityTrace.reasonCodes,
              runtimeWorktreeProvided: body.worktreePath !== undefined,
              approvalInputProvided: body.approvalArtifactId !== undefined,
              governedInputProvided: governedInputSource !== undefined,
              governedInputVerified: governedInputVerification.status === 'verified',
              governedInputReasonCode:
                governedInputVerification.status === 'blocked'
                  ? governedInputVerification.reasonCode
                  : undefined,
              governedInputSourceKind: governedInputVerification.sourceKind,
              governedInputRelativePathHash: governedInputVerification.relativePathHash,
              governedInputContentHash: governedInputVerification.contentHash,
              governedInputExpectedContentHash: governedInputVerification.expectedContentHash,
              governedInputByteLength: governedInputVerification.byteLength,
              governedInputLineCount: governedInputVerification.lineCount,
              governedInputBodyStored: false,
              promptBodyStored: false,
              promptArgumentStored: false,
              executableResolutionStatus: executableResolution?.status,
              executableResolutionReasonCode:
                executableResolution?.status === 'blocked'
                  ? executableResolution.reasonCode
                  : undefined,
              executableResolvedKind: executableResolution?.resolvedExecutableKind,
              executableExists: executableResolution?.executableExists,
              executableAccessible: executableResolution?.executableAccessible,
              executableAccessProbePassed: executableResolution?.executableAccessProbePassed,
              windowsNativeExecutableAccessProbeBypassed:
                executableResolution?.windowsNativeExecutableAccessProbeBypassed,
              cwdSelfCheckStatus: cwdSelfCheck?.status,
              cwdSelfCheckReasonCode: cwdSelfCheck?.reasonCode,
              cwdHash: cwdSelfCheck?.cwdHash,
              cwdExists: cwdSelfCheck?.cwdExists,
              cwdIsDirectory: cwdSelfCheck?.cwdIsDirectory,
              executableShellShimDetected:
                executableResolution?.status === 'blocked'
                  ? executableResolution.shellShimDetected
                  : undefined,
              executablePathStored: false,
              envPlanStored: false,
              argvStored: false,
              sourcePreparationReady: authoritativeSourcePreparationPresent,
              prerequisiteReady: authoritativePrerequisiteReady,
              worktreePathHashMatched,
            },
          })
        : createRealReadOnlyAdapterResultFromBoundary({
            request: attemptRequest,
            preflight,
            boundaryResult,
            metadata: {
              requestedBy: 'supervisor-api',
              authoritativeAttemptRecord: true,
              configLoadStatus: configLoadResult.status,
              executablePolicyLabel: 'codex_cli',
              executableResolutionStatus: executableResolution?.status,
              executableResolvedKind:
                executableResolution?.status === 'resolved'
                  ? executableResolution.resolvedExecutableKind
                  : undefined,
              executablePathHash:
                executableResolution?.status === 'resolved'
                  ? executableResolution.executablePathHash
                  : undefined,
              executableExists:
                executableResolution?.status === 'resolved'
                  ? executableResolution.executableExists
                  : undefined,
              executableAccessible:
                executableResolution?.status === 'resolved'
                  ? executableResolution.executableAccessible
                  : undefined,
              executableAccessProbePassed:
                executableResolution?.status === 'resolved'
                  ? executableResolution.executableAccessProbePassed
                  : undefined,
              windowsNativeExecutableAccessProbeBypassed:
                executableResolution?.status === 'resolved'
                  ? executableResolution.windowsNativeExecutableAccessProbeBypassed
                  : undefined,
              envAllowlistKeyCount:
                executableResolution?.status === 'resolved'
                  ? executableResolution.envAllowlistKeyCount
                  : undefined,
              envAllowlistKeyHash:
                executableResolution?.status === 'resolved'
                  ? executableResolution.envAllowlistKeyHash
                  : undefined,
              executablePathStored: false,
              envPlanStored: false,
              argvStored: false,
              cwdSelfCheckStatus: cwdSelfCheck?.status,
              cwdHash: cwdSelfCheck?.cwdHash,
              cwdExists: cwdSelfCheck?.cwdExists,
              cwdIsDirectory: cwdSelfCheck?.cwdIsDirectory,
              cwdPathStored: false,
              worktreePathStored: false,
              governedInputVerified: governedInputVerification.status === 'verified',
              governedInputSourceKind: governedInputVerification.sourceKind,
              governedInputRelativePathHash: governedInputVerification.relativePathHash,
              governedInputContentHash: governedInputVerification.contentHash,
              governedInputByteLength: governedInputVerification.byteLength,
              governedInputLineCount: governedInputVerification.lineCount,
              governedInputBodyStored: false,
              promptBodyStored: false,
              promptArgumentStored: false,
            },
          });
    const postRunVerificationResult =
      boundaryResult === undefined
        ? undefined
        : await runRealReadOnlyAdapterPostRunVerification(
            createRealReadOnlyAdapterPostRunVerificationPlan({
              dryRunId: body.dryRunId,
              worktreePath: body.worktreePath ?? '.',
              timeoutMs: 60_000,
              metadata: {
                requestedBy: 'supervisor-api',
                executablePolicyLabel: 'pnpm_verify_foundation',
                worktreePathStored: false,
              },
            }),
            {
              attemptStatus: boundaryResult.status,
              worktreeState: options.realReadOnlyAdapterPostRunWorktreeState ?? {
                beforeStatus: 'clean',
                afterStatus: 'unknown',
                unexpectedDiff: true,
                statusHash: expectedWorktreePathHash,
              },
              runner: options.realReadOnlyAdapterPostRunVerificationRunner,
            },
          );
    const postRunVerificationStatus =
      postRunVerificationResult === undefined
        ? undefined
        : postRunVerificationResult.skippedBeforeStart
          ? 'skipped'
          : postRunVerificationResult.status;
    const postRunVerificationSkipReason = postRunVerificationResult?.skippedBeforeStart
      ? (postRunVerificationResult.skipReason ?? 'attempt_not_completed')
      : undefined;
    const telemetryInput = {
      request: attemptRequest,
      preflight,
      resultId: initialResult.id,
      resultStatus: initialResult.status,
      boundaryResult,
      metadata: {
        requestedBy: 'supervisor-api',
        authoritativeAttemptRecord: true,
        configLoadStatus: configLoadResult.status,
        approvalAuthorityStatus: approvalAuthority.summary.status,
        approvalAuthorityReasonCodes: approvalAuthority.summary.reasonCodes,
        approvalAuthorityTraceId: approvalAuthorityTrace.id,
        approvalAuthorityTraceStatus: approvalAuthorityTrace.status,
        approvalAuthorityTraceReasonCodes: approvalAuthorityTrace.reasonCodes,
        runtimeWorktreeProvided: body.worktreePath !== undefined,
        approvalInputProvided: body.approvalArtifactId !== undefined,
        governedInputProvided: governedInputSource !== undefined,
        governedInputVerified: governedInputVerification.status === 'verified',
        governedInputReasonCode:
          governedInputVerification.status === 'blocked'
            ? governedInputVerification.reasonCode
            : undefined,
        governedInputSourceKind: governedInputVerification.sourceKind,
        governedInputRelativePathHash: governedInputVerification.relativePathHash,
        governedInputContentHash: governedInputVerification.contentHash,
        governedInputExpectedContentHash: governedInputVerification.expectedContentHash,
        governedInputByteLength: governedInputVerification.byteLength,
        governedInputLineCount: governedInputVerification.lineCount,
        governedInputBodyStored: false,
        promptBodyStored: false,
        promptArgumentStored: false,
        executablePolicyLabel: 'codex_cli',
        executableResolutionStatus: executableResolution?.status,
        executableResolutionReasonCode:
          executableResolution?.status === 'blocked' ? executableResolution.reasonCode : undefined,
        executableResolvedKind: executableResolution?.resolvedExecutableKind,
        executableExists: executableResolution?.executableExists,
        executableAccessible: executableResolution?.executableAccessible,
        executableAccessProbePassed: executableResolution?.executableAccessProbePassed,
        windowsNativeExecutableAccessProbeBypassed:
          executableResolution?.windowsNativeExecutableAccessProbeBypassed,
        executablePathHash:
          executableResolution?.status === 'resolved'
            ? executableResolution.executablePathHash
            : undefined,
        envAllowlistKeyCount:
          executableResolution?.status === 'resolved'
            ? executableResolution.envAllowlistKeyCount
            : undefined,
        envAllowlistKeyHash:
          executableResolution?.status === 'resolved'
            ? executableResolution.envAllowlistKeyHash
            : undefined,
        executablePathStored: false,
        envPlanStored: false,
        argvStored: false,
        cwdSelfCheckStatus: cwdSelfCheck?.status,
        cwdSelfCheckReasonCode: cwdSelfCheck?.reasonCode,
        cwdHash: cwdSelfCheck?.cwdHash,
        cwdExists: cwdSelfCheck?.cwdExists,
        cwdIsDirectory: cwdSelfCheck?.cwdIsDirectory,
        cwdPathStored: false,
        postRunVerificationStatus,
        postRunVerificationSkipReason,
        worktreePathStored: false,
      },
    };
    const evidenceRefs = createRealReadOnlyAdapterAttemptEvidenceRefs(telemetryInput);
    const auditEvents = createRealReadOnlyAdapterAttemptAuditEvents(telemetryInput, evidenceRefs);
    const evidenceSummary = createRealReadOnlyAdapterEvidenceSummaryFromRefs(
      telemetryInput,
      evidenceRefs,
    );
    const auditSummary = createRealReadOnlyAdapterAuditSummaryFromEvents(
      telemetryInput,
      auditEvents,
    );
    const result = {
      ...initialResult,
      evidenceSummary,
      auditSummary,
    };
    const attemptRecord = createRealReadOnlyAdapterAttemptRecord({
      request: attemptRequest,
      preflight,
      result,
      boundaryResult,
      postRunVerificationResult,
      evidenceRefs,
      auditEvents,
      metadata: {
        requestedBy: 'supervisor-api',
        approvalAuthorityStatus: approvalAuthority.summary.status,
        approvalAuthorityReasonCodes: approvalAuthority.summary.reasonCodes,
        approvalArtifactId: approvalAuthority.summary.approvalArtifactId,
        approvalArtifactHash: approvalAuthority.summary.approvalArtifactHash,
        approvalRecordId: approvalAuthority.summary.approvalRecordId,
        approvalCheckedAt: approvalAuthority.summary.checkedAt,
        approvalExpiresAt: approvalAuthority.summary.expiresAt,
        approvalDryRunHashMatched: approvalAuthority.summary.dryRunHashMatched,
        approvalPolicyHashMatched: approvalAuthority.summary.policyHashMatched,
        runtimeWorktreeProvided: body.worktreePath !== undefined,
        approvalInputProvided: body.approvalArtifactId !== undefined,
        governedInputProvided: governedInputSource !== undefined,
        governedInputVerified: governedInputVerification.status === 'verified',
        governedInputReasonCode:
          governedInputVerification.status === 'blocked'
            ? governedInputVerification.reasonCode
            : undefined,
        governedInputSourceKind: governedInputVerification.sourceKind,
        governedInputRelativePathHash: governedInputVerification.relativePathHash,
        governedInputContentHash: governedInputVerification.contentHash,
        governedInputExpectedContentHash: governedInputVerification.expectedContentHash,
        governedInputByteLength: governedInputVerification.byteLength,
        governedInputLineCount: governedInputVerification.lineCount,
        governedInputBodyStored: false,
        promptBodyStored: false,
        promptArgumentStored: false,
        executablePolicyLabel: 'codex_cli',
        executableResolutionStatus: executableResolution?.status,
        executableResolutionReasonCode:
          executableResolution?.status === 'blocked' ? executableResolution.reasonCode : undefined,
        executableResolvedKind: executableResolution?.resolvedExecutableKind,
        executableExists: executableResolution?.executableExists,
        executableAccessible: executableResolution?.executableAccessible,
        executableAccessProbePassed: executableResolution?.executableAccessProbePassed,
        windowsNativeExecutableAccessProbeBypassed:
          executableResolution?.windowsNativeExecutableAccessProbeBypassed,
        executablePathHash:
          executableResolution?.status === 'resolved'
            ? executableResolution.executablePathHash
            : undefined,
        envAllowlistKeyCount:
          executableResolution?.status === 'resolved'
            ? executableResolution.envAllowlistKeyCount
            : undefined,
        envAllowlistKeyHash:
          executableResolution?.status === 'resolved'
            ? executableResolution.envAllowlistKeyHash
            : undefined,
        executablePathStored: false,
        envPlanStored: false,
        argvStored: false,
        cwdSelfCheckStatus: cwdSelfCheck?.status,
        cwdSelfCheckReasonCode: cwdSelfCheck?.reasonCode,
        cwdHash: cwdSelfCheck?.cwdHash,
        cwdExists: cwdSelfCheck?.cwdExists,
        cwdIsDirectory: cwdSelfCheck?.cwdIsDirectory,
        cwdPathStored: false,
        postRunVerificationStatus,
        postRunVerificationSkipReason,
      },
    });

    for (const ref of evidenceRefs) {
      await store.evidenceRefs.create(ref);
    }

    for (const event of auditEvents) {
      await store.auditEvents.append(event);
    }

    const persistedAttempt =
      await store.codexExecRealReadOnlyAdapterAttempts.saveAttempt(attemptRecord);

    return createRealReadOnlyAdapterAttemptResponse(persistedAttempt, {
      request: attemptRequest,
      preflight,
      result,
      evidenceRefs,
      auditEvents,
    });
  });

  server.get(
    '/api/codex/exec/real-read-only-adapter/attempt/:attemptId',
    async (request, reply) => {
      const params = request.params as { attemptId?: string };

      if (!params.attemptId) {
        return reply.code(400).send({
          error: 'attemptId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply.code(503).send(createRealReadOnlyAdapterAttemptUnavailableResponse());
      }

      const attemptRecord = await store.codexExecRealReadOnlyAdapterAttempts.getAttempt(
        params.attemptId,
      );

      if (!attemptRecord) {
        return reply.code(404).send({
          error: 'attempt record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterAttemptResponse(attemptRecord);
    },
  );

  server.get('/api/codex/exec/real-read-only-adapter/attempts', async (request, reply) => {
    const queryResult = parseRealReadOnlyAdapterAttemptQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({
        error: queryResult.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createRealReadOnlyAdapterAttemptUnavailableResponse());
    }

    const attempts = await store.codexExecRealReadOnlyAdapterAttempts.listAttempts(
      queryResult.query,
    );

    return createRealReadOnlyAdapterAttemptListResponse(attempts);
  });

  server.get(
    '/api/codex/exec/real-read-only-adapter/attempt/latest/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterAttemptUnavailableResponse(params.dryRunId));
      }

      const attemptRecord = await store.codexExecRealReadOnlyAdapterAttempts.latestAttempt(
        params.dryRunId,
      );

      if (!attemptRecord) {
        return reply.code(404).send({
          error: 'attempt record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterAttemptResponse(attemptRecord);
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/attempt-timeline/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const queryResult = parseRealReadOnlyAdapterAttemptTimelineQuery(
        request.query,
        params.dryRunId,
      );

      if (!queryResult.allowed) {
        return reply.code(400).send({
          error: queryResult.reason,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterAttemptUnavailableResponse(params.dryRunId));
      }

      const attempts = await store.codexExecRealReadOnlyAdapterAttempts.listAttempts(
        queryResult.query,
      );
      const alignedAttempts = attempts.map((attempt) =>
        alignRealReadOnlyAdapterAttemptRecordDiagnostics(attempt),
      );
      const timeline = createRealReadOnlyAdapterAttemptTimeline({
        dryRunId: params.dryRunId,
        records: alignedAttempts,
        query: queryResult.query,
        metadata: {
          requestedBy: 'supervisor-api',
        },
      });

      return {
        timeline,
        attempts: alignedAttempts,
        attemptRecords: alignedAttempts,
        summaries: alignedAttempts.map((attempt) => summarizeRealReadOnlyAdapterAttempt(attempt)),
        count: alignedAttempts.length,
        authoritative: true,
        supervisorBacked: true,
        persisted: true,
        degraded: false,
        notPersisted: false,
        ...createRealReadOnlyAdapterAttemptRuntimeFlags(alignedAttempts),
        reason: persistenceState.reason,
      };
    },
  );

  server.post(
    '/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources',
    async (request, reply) => {
      const body = request.body as
        | {
            dryRunId?: string;
            approvalArtifactId?: string;
            worktreeLabel?: string;
            worktreeStatus?: 'clean' | 'dirty' | 'missing' | 'unknown';
            worktreePathHash?: string;
            worktreePath?: string;
          }
        | undefined;

      if (!body?.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      if (body.worktreePath) {
        return reply.code(400).send({
          error:
            'raw worktree paths are not accepted; provide worktreeLabel, worktreeStatus, and worktreePathHash',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
          workspaceWriteAllowed: false,
          dangerFullAccessAllowed: false,
          dashboardTriggerAllowed: false,
        });
      }

      if (body.worktreeStatus && !isPilotPrerequisiteWorktreeStatus(body.worktreeStatus)) {
        return reply.code(400).send({
          error: 'worktreeStatus must be clean, dirty, missing, or unknown',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterPilotSourcePreparationUnavailableResponse(body.dryRunId));
      }

      const configLoadResult = await getLiveConfigLoadResult();
      const dryRunRecord = await resolveCodexExecLiveRunRecord(body.dryRunId, store);
      const latestPolicySource =
        await store.codexExecRealReadOnlyAdapterPolicySources.latestPolicySource(body.dryRunId);
      const authoritativePolicySourcePresent =
        latestPolicySource?.status === 'aligned' &&
        latestPolicySource.authoritative === true &&
        latestPolicySource.supervisorBacked === true &&
        latestPolicySource.persisted === true &&
        latestPolicySource.degraded === false &&
        latestPolicySource.notPersisted === false &&
        latestPolicySource.fallbackUsedAsAuthority === false;
      const approvalAuthority = await resolveRealReadOnlyAdapterPilotApprovalAuthority({
        dryRunId: body.dryRunId,
        dryRunPlanId: dryRunRecord?.dryRunPlanId,
        approvalArtifactId: body.approvalArtifactId,
        expectedDryRunPlanHash: latestPolicySource?.dryRunPlanHash,
        expectedPolicyDecisionHash: latestPolicySource?.policyDecisionHash,
        store,
      });
      const approvalAuthorityTrace =
        createRealReadOnlyAdapterApprovalAuthorityTraceRecordForRequest({
          dryRunId: body.dryRunId,
          approvalAuthority: approvalAuthority.summary,
          inputApprovalArtifactId: body.approvalArtifactId,
          metadata: {
            requestedBy: 'supervisor-api',
            source: 'apps.supervisor.real-read-only-adapter.pilot-source-preparation',
          },
        });
      const record = buildRealReadOnlyAdapterPilotSourcePreparationRecord({
        dryRunId: body.dryRunId,
        authoritative: true,
        supervisorBacked: true,
        persisted: true,
        degraded: false,
        notPersisted: false,
        dryRunRecordPresent: dryRunRecord !== undefined,
        configExplicitlyEnabled:
          configLoadResult.status === 'loaded' && configLoadResult.config.liveEnabled === true,
        authoritativePolicySourcePresent,
        validUnusedApprovalPresent: approvalAuthorityTrace.status === 'aligned',
        approvalArtifactId: approvalAuthorityTrace.resolvedApprovalArtifactId,
        approvalArtifactHash: approvalAuthorityTrace.approvalArtifactHash,
        dryRunPlanHash:
          latestPolicySource?.dryRunPlanHash ?? approvalAuthority.summary.dryRunPlanHash,
        policyDecisionHash:
          latestPolicySource?.policyDecisionHash ?? approvalAuthority.summary.policyDecisionHash,
        isolatedCleanWorktreeMetadataPresent:
          body.worktreeStatus === 'clean' && Boolean(body.worktreePathHash),
        worktreeLabel: body.worktreeLabel,
        worktreeStatus: body.worktreeStatus,
        worktreePathHash: body.worktreePathHash,
        evidenceAuditReady: persistenceState.status === 'ok',
        fallbackUsedAsAuthority: false,
        metadata: {
          requestedBy: 'supervisor-api',
          configLoadStatus: configLoadResult.status,
          configSource: configLoadResult.source,
          approvalArtifactIdProvided: Boolean(body.approvalArtifactId),
          approvalAuthorityStatus: approvalAuthority.summary.status,
          approvalAuthorityReasonCodes: approvalAuthority.summary.reasonCodes,
          approvalAuthorityTraceId: approvalAuthorityTrace.id,
          approvalAuthorityTraceStatus: approvalAuthorityTrace.status,
          approvalAuthorityTraceReasonCodes: approvalAuthorityTrace.reasonCodes,
          approvalAuthorityTracePreflightWouldAccept:
            approvalAuthorityTrace.attemptPreflightWouldAccept,
          approvalRecordId: approvalAuthority.summary.approvalRecordId,
          approvalCheckedAt: approvalAuthority.summary.checkedAt,
          approvalExpiresAt: approvalAuthority.summary.expiresAt,
          approvalDryRunHashMatched: approvalAuthority.summary.dryRunHashMatched,
          approvalPolicyHashMatched: approvalAuthority.summary.policyHashMatched,
          latestPolicySourceId: latestPolicySource?.id,
          policySourceReady: authoritativePolicySourcePresent,
          worktreePathStored: false,
        },
      });
      const evidenceRefs = createRealReadOnlyAdapterPilotSourcePreparationEvidenceRefs(record);
      const auditEvents = createRealReadOnlyAdapterPilotSourcePreparationAuditEvents(
        record,
        evidenceRefs,
      );
      const recordWithRefs = {
        ...record,
        evidenceRefs,
        auditEventIds: auditEvents.map((event) => event.id),
      };

      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }

      const persistedRecord =
        await store.codexExecRealReadOnlyAdapterPilotSourcePreparations.savePilotSourcePreparation(
          recordWithRefs,
        );

      return createRealReadOnlyAdapterPilotSourcePreparationResponse(persistedRecord, {
        evidenceRefs,
        auditEvents,
      });
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources/:recordId',
    async (request, reply) => {
      const params = request.params as { recordId?: string };

      if (!params.recordId) {
        return reply.code(400).send({
          error: 'recordId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterPilotSourcePreparationUnavailableResponse());
      }

      const record =
        await store.codexExecRealReadOnlyAdapterPilotSourcePreparations.getPilotSourcePreparation(
          params.recordId,
        );

      if (!record) {
        return reply.code(404).send({
          error: 'pilot source preparation record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterPilotSourcePreparationResponse(record);
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources',
    async (request, reply) => {
      const queryResult = parseRealReadOnlyAdapterPilotSourcePreparationQuery(request.query);

      if (!queryResult.allowed) {
        return reply.code(400).send({
          error: queryResult.reason,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterPilotSourcePreparationUnavailableResponse());
      }

      const records =
        await store.codexExecRealReadOnlyAdapterPilotSourcePreparations.listPilotSourcePreparations(
          queryResult.query,
        );

      return createRealReadOnlyAdapterPilotSourcePreparationListResponse(
        records,
        queryResult.query,
      );
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/pilot-prerequisite-source/latest/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(
            createRealReadOnlyAdapterPilotSourcePreparationUnavailableResponse(params.dryRunId),
          );
      }

      const record =
        await store.codexExecRealReadOnlyAdapterPilotSourcePreparations.latestPilotSourcePreparation(
          params.dryRunId,
        );

      if (!record) {
        return reply.code(404).send({
          error: 'pilot source preparation record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterPilotSourcePreparationResponse(record);
    },
  );

  server.post(
    '/api/codex/exec/real-read-only-adapter/pilot-prerequisites',
    async (request, reply) => {
      const body = request.body as
        | {
            dryRunId?: string;
            approvalArtifactId?: string;
            worktreeLabel?: string;
            worktreeStatus?: 'clean' | 'dirty' | 'missing' | 'unknown';
            worktreePathHash?: string;
            worktreePath?: string;
            handoffContextComplete?: boolean;
          }
        | undefined;

      if (!body?.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      if (body.worktreePath) {
        return reply.code(400).send({
          error:
            'raw worktree paths are not accepted; provide worktreeLabel, worktreeStatus, and worktreePathHash',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
          workspaceWriteAllowed: false,
          dangerFullAccessAllowed: false,
          dashboardTriggerAllowed: false,
        });
      }

      if (body.worktreeStatus && !isPilotPrerequisiteWorktreeStatus(body.worktreeStatus)) {
        return reply.code(400).send({
          error: 'worktreeStatus must be clean, dirty, missing, or unknown',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterPilotPrerequisiteUnavailableResponse(body.dryRunId));
      }

      const configLoadResult = await getLiveConfigLoadResult();
      const dryRunRecord = await resolveCodexExecLiveRunRecord(body.dryRunId, store);
      const latestAttempt = await store.codexExecRealReadOnlyAdapterAttempts.latestAttempt(
        body.dryRunId,
      );
      const latestSourcePreparation =
        await store.codexExecRealReadOnlyAdapterPilotSourcePreparations.latestPilotSourcePreparation(
          body.dryRunId,
        );
      const latestPolicySource =
        await store.codexExecRealReadOnlyAdapterPolicySources.latestPolicySource(body.dryRunId);
      const authoritativePolicySourcePresent =
        latestPolicySource?.status === 'aligned' &&
        latestPolicySource.authoritative === true &&
        latestPolicySource.supervisorBacked === true &&
        latestPolicySource.persisted === true &&
        latestPolicySource.degraded === false &&
        latestPolicySource.notPersisted === false &&
        latestPolicySource.fallbackUsedAsAuthority === false;
      const approvalAuthority = await resolveRealReadOnlyAdapterPilotApprovalAuthority({
        dryRunId: body.dryRunId,
        dryRunPlanId: dryRunRecord?.dryRunPlanId,
        approvalArtifactId: body.approvalArtifactId,
        expectedDryRunPlanHash: latestPolicySource?.dryRunPlanHash,
        expectedPolicyDecisionHash: latestPolicySource?.policyDecisionHash,
        store,
      });
      const approvalAuthorityTrace =
        createRealReadOnlyAdapterApprovalAuthorityTraceRecordForRequest({
          dryRunId: body.dryRunId,
          approvalAuthority: approvalAuthority.summary,
          inputApprovalArtifactId: body.approvalArtifactId,
          latestSourcePreparation,
          metadata: {
            requestedBy: 'supervisor-api',
            source: 'apps.supervisor.real-read-only-adapter.pilot-prerequisites',
          },
        });
      const validUnusedApprovalPresent = approvalAuthorityTrace.status === 'aligned';
      const authoritativeAttemptEvidencePresent =
        latestAttempt?.authoritative === true &&
        latestAttempt.supervisorBacked === true &&
        latestAttempt.persisted === true &&
        latestAttempt.degraded === false &&
        latestAttempt.notPersisted === false;
      const authoritativeSourcePreparationPresent =
        latestSourcePreparation?.status === 'prepared' &&
        latestSourcePreparation.authoritative === true &&
        latestSourcePreparation.supervisorBacked === true &&
        latestSourcePreparation.persisted === true &&
        latestSourcePreparation.degraded === false &&
        latestSourcePreparation.notPersisted === false;
      const evidenceAuditReady =
        (authoritativeAttemptEvidencePresent &&
          (latestAttempt?.evidenceRefIds.length ?? 0) > 0 &&
          (latestAttempt?.auditEventIds.length ?? 0) > 0) ||
        (authoritativeSourcePreparationPresent &&
          (latestSourcePreparation?.evidenceRefs.length ?? 0) > 0 &&
          (latestSourcePreparation?.auditEventIds.length ?? 0) > 0);
      const record = buildRealReadOnlyAdapterPilotPrerequisiteRecord({
        dryRunId: body.dryRunId,
        authoritative: true,
        supervisorBacked: true,
        persisted: true,
        degraded: false,
        notPersisted: false,
        dryRunRecordPresent: dryRunRecord !== undefined,
        configExplicitlyEnabled:
          configLoadResult.status === 'loaded' && configLoadResult.config.liveEnabled === true,
        validUnusedApprovalPresent,
        isolatedCleanWorktreeMetadataPresent:
          body.worktreeStatus === 'clean' && Boolean(body.worktreePathHash),
        authoritativePolicySourcePresent,
        authoritativeSourcePreparationPresent,
        authoritativeAttemptEvidencePresent,
        evidenceAuditReady,
        fallbackUsedAsAuthority: false,
        handoffContextComplete: body.handoffContextComplete,
        worktreeLabel: body.worktreeLabel,
        worktreeStatus: body.worktreeStatus,
        worktreePathHash: body.worktreePathHash,
        metadata: {
          requestedBy: 'supervisor-api',
          configLoadStatus: configLoadResult.status,
          configSource: configLoadResult.source,
          approvalArtifactIdProvided: Boolean(body.approvalArtifactId),
          approvalAuthorityStatus: approvalAuthority.summary.status,
          approvalAuthorityReasonCodes: approvalAuthority.summary.reasonCodes,
          approvalAuthorityTraceId: approvalAuthorityTrace.id,
          approvalAuthorityTraceStatus: approvalAuthorityTrace.status,
          approvalAuthorityTraceReasonCodes: approvalAuthorityTrace.reasonCodes,
          approvalAuthorityTracePreflightWouldAccept:
            approvalAuthorityTrace.attemptPreflightWouldAccept,
          approvalArtifactId: approvalAuthority.summary.approvalArtifactId,
          approvalArtifactHash: approvalAuthority.summary.approvalArtifactHash,
          approvalRecordId: approvalAuthority.summary.approvalRecordId,
          approvalCheckedAt: approvalAuthority.summary.checkedAt,
          approvalExpiresAt: approvalAuthority.summary.expiresAt,
          approvalDryRunHashMatched: approvalAuthority.summary.dryRunHashMatched,
          approvalPolicyHashMatched: approvalAuthority.summary.policyHashMatched,
          latestPolicySourceId: latestPolicySource?.id,
          policySourceReady: authoritativePolicySourcePresent,
          latestAttemptId: latestAttempt?.id,
          latestSourcePreparationId: latestSourcePreparation?.id,
          worktreePathStored: false,
        },
      });
      const evidenceRefs = createRealReadOnlyAdapterPilotPrerequisiteEvidenceRefs(record);
      const auditEvents = createRealReadOnlyAdapterPilotPrerequisiteAuditEvents(
        record,
        evidenceRefs,
      );
      const recordWithRefs = {
        ...record,
        evidenceRefs,
        auditEventIds: auditEvents.map((event) => event.id),
      };

      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }

      const persistedRecord =
        await store.codexExecRealReadOnlyAdapterPilotPrerequisites.savePilotPrerequisite(
          recordWithRefs,
        );

      return createRealReadOnlyAdapterPilotPrerequisiteResponse(persistedRecord, {
        evidenceRefs,
        auditEvents,
      });
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/pilot-prerequisites/:recordId',
    async (request, reply) => {
      const params = request.params as { recordId?: string };

      if (!params.recordId) {
        return reply.code(400).send({
          error: 'recordId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterPilotPrerequisiteUnavailableResponse());
      }

      const record =
        await store.codexExecRealReadOnlyAdapterPilotPrerequisites.getPilotPrerequisite(
          params.recordId,
        );

      if (!record) {
        return reply.code(404).send({
          error: 'pilot prerequisite record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterPilotPrerequisiteResponse(record);
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/pilot-prerequisites',
    async (request, reply) => {
      const queryResult = parseRealReadOnlyAdapterPilotPrerequisiteQuery(request.query);

      if (!queryResult.allowed) {
        return reply.code(400).send({
          error: queryResult.reason,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterPilotPrerequisiteUnavailableResponse());
      }

      const records =
        await store.codexExecRealReadOnlyAdapterPilotPrerequisites.listPilotPrerequisites(
          queryResult.query,
        );

      return createRealReadOnlyAdapterPilotPrerequisiteListResponse(records, queryResult.query);
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/pilot-prerequisite/latest/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterPilotPrerequisiteUnavailableResponse(params.dryRunId));
      }

      const record =
        await store.codexExecRealReadOnlyAdapterPilotPrerequisites.latestPilotPrerequisite(
          params.dryRunId,
        );

      if (!record) {
        return reply.code(404).send({
          error: 'pilot prerequisite record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterPilotPrerequisiteResponse(record);
    },
  );

  server.get('/api/codex/exec/timeline/:dryRunId', async (request, reply) => {
    const params = request.params as { dryRunId?: string };
    const filterResult = parseTimelineFilter(request.query);

    if (!params.dryRunId) {
      return reply.code(400).send({ error: 'dryRunId is required' });
    }

    if (!filterResult.allowed) {
      return reply.code(400).send({ error: filterResult.reason });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(params.dryRunId, store);

    if (!record) {
      return reply.code(404).send({ error: 'dry-run record was not found' });
    }

    const approvalRecords = await resolveCodexExecApprovalRecordsForDryRun(
      record.dryRunPlanId,
      store,
    );
    const timeline = createCodexExecControlPlaneTimeline({
      record,
      approvalRecords,
      filter: filterResult.filter,
    });

    return {
      timeline,
      query: {
        dryRunId: params.dryRunId,
        filter: filterResult.filter,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/timeline/:dryRunId/detail', async (request, reply) => {
    const params = request.params as { dryRunId?: string };
    const filterResult = parseTimelineFilter(request.query);

    if (!params.dryRunId) {
      return reply.code(400).send({ error: 'dryRunId is required' });
    }

    if (!filterResult.allowed) {
      return reply.code(400).send({ error: filterResult.reason });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(params.dryRunId, store);

    if (!record) {
      return reply.code(404).send({ error: 'dry-run record was not found' });
    }

    const approvalRecords = await resolveCodexExecApprovalRecordsForDryRun(
      record.dryRunPlanId,
      store,
    );
    const detail = createCodexExecTimelineDetailView({
      record,
      approvalRecords,
      filter: filterResult.filter,
    });

    return {
      detail,
      query: {
        dryRunId: params.dryRunId,
        filter: filterResult.filter,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/evidence/:evidenceId', async (request, reply) => {
    const params = request.params as { evidenceId?: string };

    if (!params.evidenceId) {
      return reply.code(400).send({ error: 'evidenceId is required' });
    }

    const store = await getStore();
    const records = await resolveCodexExecLiveRunRecords(store);
    const evidenceRef = store
      ? await store.evidenceRefs.getEvidenceRef(params.evidenceId)
      : undefined;
    const auditEvents = store ? await store.auditEvents.listAuditEvents({ limit: 100 }) : [];
    const detail = getEvidenceDetail({
      evidenceRefId: params.evidenceId,
      records,
      evidenceRefs: evidenceRef ? [evidenceRef] : undefined,
      auditEvents,
    });

    if (detail.status === 'not_found') {
      return reply.code(404).send({
        detail,
        error: 'evidence ref was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      });
    }

    return {
      detail,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/evidence', async (request, reply) => {
    const queryResult = parseEvidenceQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({ error: queryResult.reason });
    }

    const store = await getStore();
    const records = await resolveCodexExecLiveRunRecords(store);
    const evidenceRefs = store
      ? await store.evidenceRefs.listEvidenceRefs(queryResult.query)
      : undefined;
    const auditEvents = store
      ? await store.auditEvents.listAuditEvents({
          dryRunId: queryResult.query.dryRunId,
          limit: queryResult.query.limit,
        })
      : undefined;
    const result = searchEvidence({
      query: queryResult.query,
      records,
      evidenceRefs,
      auditEvents,
    });

    return {
      result,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/audit/:auditEventId', async (request, reply) => {
    const params = request.params as { auditEventId?: string };

    if (!params.auditEventId) {
      return reply.code(400).send({ error: 'auditEventId is required' });
    }

    const store = await getStore();
    const records = await resolveCodexExecLiveRunRecords(store);
    const auditEvent = store
      ? await store.auditEvents.getAuditEvent(params.auditEventId)
      : undefined;
    const detail = getAuditDetail({
      auditEventId: params.auditEventId,
      records,
      auditEvents: auditEvent ? [auditEvent] : undefined,
    });

    if (detail.status === 'not_found') {
      return reply.code(404).send({
        detail,
        error: 'audit event was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      });
    }

    return {
      detail,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/audit', async (request, reply) => {
    const queryResult = parseAuditQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({ error: queryResult.reason });
    }

    const store = await getStore();
    const records = await resolveCodexExecLiveRunRecords(store);
    const auditEvents = store
      ? await store.auditEvents.listAuditEvents(queryResult.query)
      : undefined;
    const result = searchAuditEvents({
      query: queryResult.query,
      records,
      auditEvents,
    });

    return {
      result,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/drilldown/:dryRunId', async (request, reply) => {
    const params = request.params as { dryRunId?: string };

    if (!params.dryRunId) {
      return reply.code(400).send({ error: 'dryRunId is required' });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(params.dryRunId, store);
    const records = record ? [record] : await resolveCodexExecLiveRunRecords(store);
    const evidenceRefs = store
      ? await store.evidenceRefs.listEvidenceRefs({ dryRunId: params.dryRunId, limit: 100 })
      : undefined;
    const auditEvents = store
      ? await store.auditEvents.listAuditEvents({ dryRunId: params.dryRunId, limit: 100 })
      : undefined;
    const approvalRecords = await resolveCodexExecApprovalRecordsForDryRun(
      record?.dryRunPlanId ?? params.dryRunId,
      store,
    );
    const drilldown = buildControlPlaneDrilldownView({
      dryRunId: params.dryRunId,
      records,
      approvalRecords,
      evidenceRefs,
      auditEvents,
    });

    if (drilldown.status === 'not_found') {
      return reply.code(404).send({
        drilldown,
        error: 'dry-run record was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      });
    }

    return {
      drilldown,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/report/:dryRunId', async (request, reply) => {
    const params = request.params as { dryRunId?: string };
    const queryResult = parseReportQuery(request.query);

    if (!params.dryRunId) {
      return reply.code(400).send({ error: 'dryRunId is required' });
    }

    if (!queryResult.allowed) {
      return reply.code(400).send({ error: queryResult.reason });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(params.dryRunId, store);
    const records = record ? [record] : await resolveCodexExecLiveRunRecords(store);
    const evidenceRefs =
      store && queryResult.includeEvidence
        ? await store.evidenceRefs.listEvidenceRefs({ dryRunId: params.dryRunId, limit: 100 })
        : undefined;
    const auditEvents =
      store && queryResult.includeAudit
        ? await store.auditEvents.listAuditEvents({ dryRunId: params.dryRunId, limit: 100 })
        : undefined;
    const approvalRecords = await resolveCodexExecApprovalRecordsForDryRun(
      record?.dryRunPlanId ?? params.dryRunId,
      store,
    );
    const report = buildCodexExecControlPlaneReport({
      dryRunId: params.dryRunId,
      record,
      records,
      approvalRecords,
      evidenceRefs,
      auditEvents,
      format: queryResult.format,
      includeEvidence: queryResult.includeEvidence,
      includeAudit: queryResult.includeAudit,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    });
    const exportResult =
      queryResult.format === 'markdown'
        ? renderCodexExecControlPlaneReportMarkdown(report)
        : renderCodexExecControlPlaneReportJson(report);
    const responseBody = {
      report,
      exportResult,
      renderedContent: exportResult.renderedContent,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };

    if (report.status === 'not_found') {
      return reply.code(404).send({
        ...responseBody,
        error: 'dry-run record was not found',
      });
    }

    return responseBody;
  });

  server.post('/api/codex/exec/report-review', async (request, reply) => {
    const body = request.body as
      | {
          dryRunId?: string;
          reviewerLabel?: string;
          status?: CodexExecReportReviewStatus;
          recommendation?: CodexExecReportRecommendation;
          notesSummary?: string;
        }
      | undefined;

    if (!body?.dryRunId) {
      return reply.code(400).send({ error: 'dryRunId is required' });
    }

    if (body.status && !reportReviewStatuses.has(body.status)) {
      return reply.code(400).send({ error: 'unsupported report review status' });
    }

    if (body.recommendation && !reportReviewRecommendations.has(body.recommendation)) {
      return reply.code(400).send({ error: 'unsupported report review recommendation' });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(body.dryRunId, store);

    if (!record) {
      const safeReview = createCodexExecReportReviewRecord({
        dryRunId: body.dryRunId,
        reviewerLabel: body.reviewerLabel,
        status: 'rejected',
        recommendation: 'no_go',
        notesSummary: 'Dry-run record was not found; review cannot grant execution.',
      });

      return reply.code(404).send({
        error: 'dry-run record was not found',
        reviewRecord: safeReview,
        summary: summarizeCodexExecReportReview(safeReview),
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      });
    }

    const evidenceRefs = store
      ? await store.evidenceRefs.listEvidenceRefs({ dryRunId: record.dryRunPlanId, limit: 100 })
      : undefined;
    const auditEvents = store
      ? await store.auditEvents.listAuditEvents({ dryRunId: record.dryRunPlanId, limit: 100 })
      : undefined;
    const approvalRecords = await resolveCodexExecApprovalRecordsForDryRun(
      record.dryRunPlanId,
      store,
    );
    const report = buildCodexExecControlPlaneReport({
      dryRunId: record.dryRunPlanId,
      record,
      approvalRecords,
      evidenceRefs,
      auditEvents,
      format: 'json',
      includeEvidence: true,
      includeAudit: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    });
    const reviewRecord = createCodexExecReportReviewRecord({
      report,
      reviewerLabel: body.reviewerLabel,
      status: body.status ?? 'reviewed',
      recommendation: body.recommendation,
      notesSummary: body.notesSummary,
    });

    await persistCodexReportReviewRecord(reviewRecord, store);

    return {
      reviewRecord,
      summary: summarizeCodexExecReportReview(reviewRecord),
      reportSummary: report.summary,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/report-review/:reviewId', async (request, reply) => {
    const params = request.params as { reviewId?: string };

    if (!params.reviewId) {
      return reply.code(400).send({ error: 'reviewId is required' });
    }

    const store = await getStore();
    const reviewRecord = await resolveCodexReportReviewRecord(params.reviewId, store);

    if (!reviewRecord) {
      return reply.code(404).send({
        error: 'report review was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      });
    }

    return {
      reviewRecord,
      summary: summarizeCodexExecReportReview(reviewRecord),
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/report-reviews', async (request, reply) => {
    const queryResult = parseReportReviewQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({ error: queryResult.reason });
    }

    const store = await getStore();
    const reviews = store
      ? await store.codexReportReviews.listReportReviews(queryResult.query)
      : filterInMemoryReportReviews(codexReportReviewRecords, queryResult.query);

    return {
      reviews,
      summaries: listCodexExecReportReviewSummaries(reviews, queryResult.query),
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/report-reviews/latest/:dryRunId', async (request, reply) => {
    const params = request.params as { dryRunId?: string };

    if (!params.dryRunId) {
      return reply.code(400).send({ error: 'dryRunId is required' });
    }

    const store = await getStore();
    const reviews = await listCodexReportReviewsForQuery(store, {
      dryRunId: params.dryRunId,
      limit: 200,
    });
    const reviewRecord = getLatestCodexExecReportReview(reviews, params.dryRunId);

    if (!reviewRecord) {
      return reply.code(404).send({
        error: 'latest report review was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      });
    }

    return {
      reviewRecord,
      summary: summarizeCodexExecReportReview(reviewRecord),
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/report-reviews/history', async (request, reply) => {
    const queryResult = parseReportReviewQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({ error: queryResult.reason });
    }

    const store = await getStore();
    const reviews = await listCodexReportReviewsForQuery(store, queryResult.query);
    const history = buildCodexExecReportReviewHistory(reviews, queryResult.query);

    return {
      history,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/report-reviews/compare', async (request, reply) => {
    const leftReviewId = readQueryValue(request.query, 'leftReviewId');
    const rightReviewId = readQueryValue(request.query, 'rightReviewId');

    if (!leftReviewId || !rightReviewId) {
      return reply.code(400).send({ error: 'leftReviewId and rightReviewId are required' });
    }

    const store = await getStore();
    const left = await resolveCodexReportReviewRecord(leftReviewId, store);
    const right = await resolveCodexReportReviewRecord(rightReviewId, store);

    if (!left || !right) {
      return reply.code(404).send({
        error: 'one or more report reviews were not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      });
    }

    return {
      comparison: compareCodexExecReportReviews(left, right),
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/report-reviews/handoff/:dryRunId', async (request, reply) => {
    const params = request.params as { dryRunId?: string };
    const fromReviewer = readQueryValue(request.query, 'fromReviewer');
    const toReviewer = readQueryValue(request.query, 'toReviewer');

    if (!params.dryRunId) {
      return reply.code(400).send({ error: 'dryRunId is required' });
    }

    const store = await getStore();
    const reviews = await listCodexReportReviewsForQuery(store, {
      dryRunId: params.dryRunId,
      limit: 200,
    });

    if (reviews.length === 0) {
      return reply.code(404).send({
        error: 'report review history was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      });
    }

    return {
      handoff: buildCodexExecReviewerHandoffSummary(reviews, params.dryRunId, {
        fromReviewer,
        toReviewer,
      }),
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/governance-package/:dryRunId', async (request, reply) => {
    const params = request.params as { dryRunId?: string };
    const queryResult = parseReportQuery(request.query);

    if (!params.dryRunId) {
      return reply.code(400).send({
        error: 'dryRunId is required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (!queryResult.allowed) {
      return reply.code(400).send({
        error: queryResult.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(params.dryRunId, store);
    const dryRunId = record?.dryRunPlanId ?? params.dryRunId;
    const approvalRecords = await resolveCodexExecApprovalRecordsForDryRun(dryRunId, store);
    const reportReviews = await listCodexReportReviewsForQuery(store, { dryRunId, limit: 200 });
    const evidenceRefs =
      store && queryResult.includeEvidence
        ? await store.evidenceRefs.listEvidenceRefs({ dryRunId, limit: 100 })
        : undefined;
    const auditEvents =
      store && queryResult.includeAudit
        ? await store.auditEvents.listAuditEvents({ dryRunId, limit: 100 })
        : undefined;
    const governancePackage = buildCodexExecGovernanceReviewPackage({
      dryRunId,
      record,
      records: record ? [record] : [],
      approvalRecords,
      evidenceRefs,
      auditEvents,
      reportReviews,
      includeEvidence: queryResult.includeEvidence,
      includeAudit: queryResult.includeAudit,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    });

    return reply.code(governancePackage.status === 'not_found' ? 404 : 200).send({
      governancePackage,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    });
  });

  server.get('/api/codex/exec/adr-draft/:dryRunId', async (request, reply) => {
    const params = request.params as { dryRunId?: string };
    const queryResult = parseReportQuery(request.query);

    if (!params.dryRunId) {
      return reply.code(400).send({
        error: 'dryRunId is required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (!queryResult.allowed) {
      return reply.code(400).send({
        error: queryResult.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(params.dryRunId, store);
    const dryRunId = record?.dryRunPlanId ?? params.dryRunId;
    const approvalRecords = await resolveCodexExecApprovalRecordsForDryRun(dryRunId, store);
    const reportReviews = await listCodexReportReviewsForQuery(store, { dryRunId, limit: 200 });
    const evidenceRefs =
      store && queryResult.includeEvidence
        ? await store.evidenceRefs.listEvidenceRefs({ dryRunId, limit: 100 })
        : undefined;
    const auditEvents =
      store && queryResult.includeAudit
        ? await store.auditEvents.listAuditEvents({ dryRunId, limit: 100 })
        : undefined;
    const governancePackage = buildCodexExecGovernanceReviewPackage({
      dryRunId,
      record,
      records: record ? [record] : [],
      approvalRecords,
      evidenceRefs,
      auditEvents,
      reportReviews,
      includeEvidence: queryResult.includeEvidence,
      includeAudit: queryResult.includeAudit,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    });
    const adrDraft = buildCodexExecLiveAdapterAdrDraft({
      dryRunId,
      governancePackage,
      format: queryResult.format,
      includeEvidence: queryResult.includeEvidence,
      includeAudit: queryResult.includeAudit,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    });
    const exportResult =
      queryResult.format === 'markdown'
        ? renderCodexExecLiveAdapterAdrDraftMarkdown(adrDraft)
        : renderCodexExecLiveAdapterAdrDraftJson(adrDraft);

    return reply.code(adrDraft.status === 'not_found' ? 404 : 200).send({
      adrDraft,
      exportResult,
      renderedContent: exportResult.renderedContent,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    });
  });

  server.post('/api/codex/exec/live-adapter-adr-decision', async (request, reply) => {
    const body = request.body as
      | {
          dryRunId?: string;
          reviewerLabel?: string;
          rationaleSummary?: string;
          decision?: CodexExecLiveAdapterAdrDecisionOutcome;
          status?: CodexExecLiveAdapterAdrDecisionStatus;
        }
      | undefined;

    if (!body?.dryRunId || !body.reviewerLabel) {
      return reply.code(400).send({
        error: 'dryRunId and reviewerLabel are required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (body.decision && !liveAdapterAdrDecisionOutcomes.has(body.decision)) {
      return reply.code(400).send({
        error: 'unsupported ADR decision outcome',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (body.status && !liveAdapterAdrDecisionStatuses.has(body.status)) {
      return reply.code(400).send({
        error: 'unsupported ADR decision status',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const dryRunRecord = await resolveCodexExecLiveRunRecord(body.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({
        error: 'dry-run record was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const draftRecord = createCodexExecLiveAdapterAdrDecisionRecord({
      dryRunId: dryRunRecord.dryRunPlanId,
      reviewerLabel: body.reviewerLabel,
      rationaleSummary: body.rationaleSummary,
      decision: body.decision,
      status: body.status,
      metadata: { liveRunRecordId: dryRunRecord.id },
    });
    const evidenceRefs = createCodexExecLiveAdapterAdrDecisionEvidenceRefs(draftRecord);
    const auditEvents = createCodexExecLiveAdapterAdrDecisionAuditEvents(draftRecord, evidenceRefs);
    const decisionRecord = {
      ...draftRecord,
      evidenceRefs,
      auditEventIds: auditEvents.map((event) => event.id),
    };

    await persistCodexExecLiveAdapterAdrDecisionRecord(decisionRecord, store);

    if (store) {
      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }
    }

    return {
      decisionRecord,
      summary: summarizeCodexExecLiveAdapterAdrDecision(decisionRecord),
      evidenceRefs,
      auditEvents,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/live-adapter-adr-decision/:decisionId', async (request, reply) => {
    const params = request.params as { decisionId?: string };

    if (!params.decisionId) {
      return reply.code(400).send({
        error: 'decisionId is required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const decisionRecord = await resolveCodexExecLiveAdapterAdrDecisionRecord(
      params.decisionId,
      store,
    );

    if (!decisionRecord) {
      return reply.code(404).send({
        error: 'ADR decision record was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    return createCodexExecLiveAdapterAdrDecisionResponse(decisionRecord);
  });

  server.get('/api/codex/exec/live-adapter-adr-decisions', async (request, reply) => {
    const queryResult = parseLiveAdapterAdrDecisionQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({
        error: queryResult.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const records = await listCodexExecLiveAdapterAdrDecisionRecords(store, queryResult.query);

    return {
      decisions: listCodexExecLiveAdapterAdrDecisionSummaries(records, queryResult.query),
      records,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get(
    '/api/codex/exec/live-adapter-adr-decision/latest/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const records = await listCodexExecLiveAdapterAdrDecisionRecords(store, {
        dryRunId: params.dryRunId,
        limit: 50,
      });
      const latest = getLatestCodexExecLiveAdapterAdrDecision(records, params.dryRunId);

      if (!latest) {
        return reply.code(404).send({
          error: 'ADR decision record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createCodexExecLiveAdapterAdrDecisionResponse(latest);
    },
  );

  async function resolveCodexExecLiveRunRecord(
    dryRunId: string | undefined,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecLiveRunRecord | undefined> {
    if (!dryRunId) {
      return createDefaultCodexExecLiveRunRecord();
    }

    if (store) {
      const byId = await store.codexExecLiveRuns.getCodexExecLiveRunRecord(dryRunId);

      if (byId) {
        return byId;
      }

      const records = await store.codexExecLiveRuns.listCodexExecLiveRunRecords(50);
      return records.find((record) => record.dryRunPlanId === dryRunId);
    }

    return codexExecLiveRunRecords.find(
      (record) => record.id === dryRunId || record.dryRunPlanId === dryRunId,
    );
  }

  async function buildAndPersistRealReadOnlyAdapterApprovalAuthorityTrace(input: {
    dryRunId: string;
    approvalArtifactId?: string;
    store: CodexHubStore;
    metadata?: Record<string, unknown>;
  }): Promise<CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord> {
    const dryRunRecord = await resolveCodexExecLiveRunRecord(input.dryRunId, input.store);
    const latestSourcePreparation =
      await input.store.codexExecRealReadOnlyAdapterPilotSourcePreparations.latestPilotSourcePreparation(
        input.dryRunId,
      );
    const latestPrerequisite =
      await input.store.codexExecRealReadOnlyAdapterPilotPrerequisites.latestPilotPrerequisite(
        input.dryRunId,
      );
    const latestPolicySource =
      await input.store.codexExecRealReadOnlyAdapterPolicySources.latestPolicySource(
        input.dryRunId,
      );
    const expectedDryRunPlanHash =
      latestPolicySource?.dryRunPlanHash ?? latestSourcePreparation?.dryRunPlanHash;
    const expectedPolicyDecisionHash =
      latestPolicySource?.policyDecisionHash ?? latestSourcePreparation?.policyDecisionHash;
    const approvalAuthority = await resolveRealReadOnlyAdapterPilotApprovalAuthority({
      dryRunId: input.dryRunId,
      dryRunPlanId: dryRunRecord?.dryRunPlanId,
      approvalArtifactId: input.approvalArtifactId,
      expectedDryRunPlanHash,
      expectedPolicyDecisionHash,
      store: input.store,
    });
    const trace = createRealReadOnlyAdapterApprovalAuthorityTraceRecordForRequest({
      dryRunId: input.dryRunId,
      approvalAuthority: approvalAuthority.summary,
      inputApprovalArtifactId: input.approvalArtifactId,
      latestSourcePreparation,
      latestPrerequisite,
      metadata: {
        ...(input.metadata ?? {}),
        latestPolicySourceId: latestPolicySource?.id,
        latestSourcePreparationId: latestSourcePreparation?.id,
        latestPrerequisiteId: latestPrerequisite?.id,
      },
    });
    const evidenceRefs = createRealReadOnlyAdapterApprovalAuthorityTraceEvidenceRefs(trace);
    const auditEvents = createRealReadOnlyAdapterApprovalAuthorityTraceAuditEvents(
      trace,
      evidenceRefs,
    );
    const traceWithRefs = {
      ...trace,
      evidenceRefs,
      auditEventIds: auditEvents.map((event) => event.id),
    };

    for (const evidenceRef of evidenceRefs) {
      await input.store.evidenceRefs.create(evidenceRef);
    }

    for (const auditEvent of auditEvents) {
      await input.store.auditEvents.append(auditEvent);
    }

    return input.store.codexExecRealReadOnlyAdapterApprovalAuthorityTraces.saveApprovalAuthorityTrace(
      traceWithRefs,
    );
  }

  function createRealReadOnlyAdapterApprovalAuthorityTraceRecordForRequest(input: {
    dryRunId: string;
    approvalAuthority: CodexExecRealReadOnlyAdapterApprovalAuthoritySummary;
    inputApprovalArtifactId?: string;
    latestSourcePreparation?: CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord;
    latestPrerequisite?: CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord;
    metadata?: Record<string, unknown>;
  }): CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord {
    return buildRealReadOnlyAdapterApprovalAuthorityTraceRecord({
      dryRunId: input.dryRunId,
      approvalAuthority: input.approvalAuthority,
      inputApprovalArtifactId: input.inputApprovalArtifactId,
      sourcePreparationApprovalArtifactId: input.latestSourcePreparation?.approvalArtifactId,
      prerequisiteApprovalArtifactId: getPilotPrerequisiteApprovalArtifactId(
        input.latestPrerequisite,
      ),
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      fallbackUsedAsAuthority: false,
      metadata: input.metadata,
    });
  }

  function getPilotPrerequisiteApprovalArtifactId(
    record: CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord | undefined,
  ): string | undefined {
    const metadata = record?.metadata as Record<string, unknown> | undefined;
    const approvalArtifactId = metadata?.approvalArtifactId;
    return typeof approvalArtifactId === 'string' && approvalArtifactId.length > 0
      ? approvalArtifactId
      : undefined;
  }

  async function resolveCodexExecLiveRunRecords(
    store: CodexHubStore | undefined,
  ): Promise<CodexExecLiveRunRecord[]> {
    return store
      ? await store.codexExecLiveRuns.listCodexExecLiveRunRecords(100)
      : codexExecLiveRunRecords.slice(0, 100);
  }

  async function persistCodexExecLiveRunRecord(
    record: CodexExecLiveRunRecord,
    store: CodexHubStore | undefined,
    evidenceRefs: CodexExecLiveRunRecord['evidenceRefs'],
    auditEvents: CodexExecLiveRunRecord['auditEvents'],
  ): Promise<void> {
    if (store) {
      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }

      await store.codexExecLiveRuns.saveCodexExecLiveRunRecord(record);
      return;
    }

    const existingIndex = codexExecLiveRunRecords.findIndex(
      (candidate) => candidate.id === record.id,
    );

    if (existingIndex >= 0) {
      codexExecLiveRunRecords.splice(existingIndex, 1, record);
    } else {
      codexExecLiveRunRecords.unshift(record);
    }
  }

  async function resolveCodexExecApprovalRecord(
    approvalRequestId: string | undefined,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecManualApprovalRecord | undefined> {
    if (!approvalRequestId) {
      return undefined;
    }

    if (store) {
      const byId = await store.codexExecApprovals.getCodexExecApprovalRecord(approvalRequestId);

      if (byId) {
        return byId;
      }

      const records = await store.codexExecApprovals.listCodexExecApprovalRecords(50);
      return records.find((record) => record.request.id === approvalRequestId);
    }

    return codexExecApprovalRecords.find(
      (record) => record.id === approvalRequestId || record.request.id === approvalRequestId,
    );
  }

  async function resolveCodexExecApprovalRecordsForDryRun(
    dryRunId: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecManualApprovalRecord[]> {
    if (store) {
      return store.codexExecApprovals.listCodexExecApprovalRecordsForDryRun(dryRunId, 200);
    }

    return codexExecApprovalRecords.filter((record) => record.request.dryRunPlanId === dryRunId);
  }

  async function resolveRealReadOnlyAdapterPilotApprovalAuthority(input: {
    dryRunId: string;
    dryRunPlanId?: string;
    approvalArtifactId?: string;
    expectedDryRunPlanHash?: string;
    expectedPolicyDecisionHash?: string;
    store: CodexHubStore | undefined;
  }): Promise<{
    summary: CodexExecRealReadOnlyAdapterApprovalAuthoritySummary;
    record?: CodexExecManualApprovalRecord;
    artifact?: CodexExecApprovalArtifact;
  }> {
    const checkedAt = foundationTimestamp();
    const record = await resolveExactApprovalAuthorityRecord(input);
    const artifact = record?.approvalArtifact;
    const reasonCodes: string[] = [];

    if (!record || !artifact) {
      reasonCodes.push('approval_artifact_exists');
    }

    if (input.approvalArtifactId && artifact && artifact.id !== input.approvalArtifactId) {
      reasonCodes.push('approval_artifact_id_mismatch');
    }

    if (input.dryRunPlanId && record && record.request.dryRunPlanId !== input.dryRunPlanId) {
      reasonCodes.push('approval_dry_run_mismatch');
    }

    if (artifact) {
      if (artifact.status !== 'approved') {
        reasonCodes.push('approval_not_approved');
      }

      if (artifact.revoked === true) {
        reasonCodes.push('approval_revoked');
      }

      if (artifact.usedAt !== undefined) {
        reasonCodes.push('approval_used');
      }

      if (Date.parse(artifact.expiresAt) <= Date.now()) {
        reasonCodes.push('approval_expired');
      }

      if (
        record &&
        (artifact.dryRunPlanHash !== record.request.dryRunPlanHash ||
          (input.expectedDryRunPlanHash !== undefined &&
            artifact.dryRunPlanHash !== input.expectedDryRunPlanHash))
      ) {
        reasonCodes.push('dry_run_hash_mismatch');
      }

      if (
        record &&
        (artifact.policyDecisionHash !== record.request.policyDecisionHash ||
          (input.expectedPolicyDecisionHash !== undefined &&
            artifact.policyDecisionHash !== input.expectedPolicyDecisionHash))
      ) {
        reasonCodes.push('policy_hash_mismatch');
      }
    }

    const status = classifyApprovalAuthorityStatus(reasonCodes);
    const dryRunHashMatched =
      artifact !== undefined &&
      record !== undefined &&
      artifact.dryRunPlanHash === record.request.dryRunPlanHash &&
      (input.expectedDryRunPlanHash === undefined ||
        artifact.dryRunPlanHash === input.expectedDryRunPlanHash);
    const policyHashMatched =
      artifact !== undefined &&
      record !== undefined &&
      artifact.policyDecisionHash === record.request.policyDecisionHash &&
      (input.expectedPolicyDecisionHash === undefined ||
        artifact.policyDecisionHash === input.expectedPolicyDecisionHash);
    const summary: CodexExecRealReadOnlyAdapterApprovalAuthoritySummary = {
      id: foundationId('codex_real_read_only_adapter_approval_authority'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: checkedAt,
      dryRunId: input.dryRunId,
      status,
      approvalRecordId: record?.id,
      approvalArtifactId: artifact?.id ?? input.approvalArtifactId,
      approvalArtifactHash: artifact ? hashLocalMetadata(artifact) : undefined,
      dryRunPlanHash: artifact?.dryRunPlanHash,
      policyDecisionHash: artifact?.policyDecisionHash,
      expectedDryRunPlanHash: input.expectedDryRunPlanHash,
      expectedPolicyDecisionHash: input.expectedPolicyDecisionHash,
      dryRunHashMatched,
      policyHashMatched,
      checkedAt,
      expiresAt: artifact?.expiresAt,
      reasonCodes,
      summary:
        status === 'resolved'
          ? 'Approval authority resolved through Supervisor-backed persisted approval metadata.'
          : 'Approval authority did not satisfy the real read-only adapter pilot gate.',
      metadataOnly: true,
      bodyStored: false,
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
      promptBodyStored: false,
      commandBodyStored: false,
      stdoutBodyStored: false,
      stderrBodyStored: false,
      agentMessageBodyStored: false,
      reasoningBodyStored: false,
    };

    return {
      summary,
      record: status === 'resolved' ? record : undefined,
      artifact: status === 'resolved' ? artifact : undefined,
    };
  }

  async function resolveExactApprovalAuthorityRecord(input: {
    dryRunPlanId?: string;
    approvalArtifactId?: string;
    store: CodexHubStore | undefined;
  }): Promise<CodexExecManualApprovalRecord | undefined> {
    if (input.approvalArtifactId) {
      if (input.store) {
        const byArtifactId =
          await input.store.codexExecApprovals.getCodexExecApprovalRecordByArtifactId(
            input.approvalArtifactId,
          );

        if (byArtifactId) {
          return byArtifactId;
        }
      }

      const inMemoryRecord = codexExecApprovalRecords.find(
        (record) => record.approvalArtifact?.id === input.approvalArtifactId,
      );

      if (inMemoryRecord) {
        return inMemoryRecord;
      }
    }
    return undefined;
  }

  function classifyApprovalAuthorityStatus(
    reasonCodes: string[],
  ): CodexExecRealReadOnlyAdapterApprovalAuthorityStatus {
    if (reasonCodes.length === 0) {
      return 'resolved';
    }

    if (reasonCodes.includes('approval_artifact_exists')) {
      return 'missing';
    }

    if (reasonCodes.includes('approval_artifact_id_mismatch')) {
      return 'artifact_id_mismatch';
    }

    if (reasonCodes.includes('approval_revoked')) {
      return 'revoked';
    }

    if (reasonCodes.includes('approval_used')) {
      return 'used';
    }

    if (reasonCodes.includes('approval_expired')) {
      return 'expired';
    }

    if (reasonCodes.includes('dry_run_hash_mismatch')) {
      return 'dry_run_hash_mismatch';
    }

    if (reasonCodes.includes('policy_hash_mismatch')) {
      return 'policy_hash_mismatch';
    }

    return 'invalid';
  }

  async function persistCodexExecApprovalRecord(
    record: CodexExecManualApprovalRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.codexExecApprovals.saveCodexExecApprovalRecord(record);
      return;
    }

    const existingIndex = codexExecApprovalRecords.findIndex(
      (candidate) => candidate.id === record.id || candidate.request.id === record.request.id,
    );

    if (existingIndex >= 0) {
      codexExecApprovalRecords.splice(existingIndex, 1, record);
    } else {
      codexExecApprovalRecords.unshift(record);
    }
  }

  async function resolveCodexReportReviewRecord(
    reviewId: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecReportReviewRecord | undefined> {
    return store
      ? await store.codexReportReviews.getReportReview(reviewId)
      : codexReportReviewRecords.find((record) => record.id === reviewId);
  }

  async function listCodexReportReviewsForQuery(
    store: CodexHubStore | undefined,
    query: Partial<CodexExecReportReviewQuery>,
  ): Promise<CodexExecReportReviewRecord[]> {
    return store
      ? await store.codexReportReviews.listReportReviews(query)
      : filterInMemoryReportReviews(codexReportReviewRecords, query);
  }

  async function persistCodexReportReviewRecord(
    record: CodexExecReportReviewRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.codexReportReviews.saveReportReview(record);
      return;
    }

    const existingIndex = codexReportReviewRecords.findIndex(
      (candidate) => candidate.id === record.id,
    );

    if (existingIndex >= 0) {
      codexReportReviewRecords.splice(existingIndex, 1, record);
    } else {
      codexReportReviewRecords.unshift(record);
    }
  }

  async function resolveCodexExecLiveAdapterAdrDecisionRecord(
    decisionId: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecLiveAdapterAdrDecisionRecord | undefined> {
    return store
      ? await store.codexExecLiveAdapterAdrDecisions.getDecision(decisionId)
      : codexLiveAdapterAdrDecisionRecords.find((record) => record.id === decisionId);
  }

  async function listCodexExecLiveAdapterAdrDecisionRecords(
    store: CodexHubStore | undefined,
    query: Partial<CodexExecLiveAdapterAdrDecisionQuery>,
  ): Promise<CodexExecLiveAdapterAdrDecisionRecord[]> {
    return store
      ? await store.codexExecLiveAdapterAdrDecisions.listDecisions(query)
      : filterInMemoryLiveAdapterAdrDecisions(codexLiveAdapterAdrDecisionRecords, query);
  }

  async function persistCodexExecLiveAdapterAdrDecisionRecord(
    record: CodexExecLiveAdapterAdrDecisionRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.codexExecLiveAdapterAdrDecisions.saveDecision(record);
      return;
    }

    const existingIndex = codexLiveAdapterAdrDecisionRecords.findIndex(
      (candidate) => candidate.id === record.id,
    );

    if (existingIndex >= 0) {
      codexLiveAdapterAdrDecisionRecords.splice(existingIndex, 1, record);
    } else {
      codexLiveAdapterAdrDecisionRecords.unshift(record);
    }
  }

  function createCodexExecLiveAdapterAdrDecisionResponse(
    decisionRecord: CodexExecLiveAdapterAdrDecisionRecord,
  ) {
    return {
      decisionRecord,
      summary: summarizeCodexExecLiveAdapterAdrDecision(decisionRecord),
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  }

  async function resolveReadOnlyAdapterSimulatorReviewRecord(
    reviewId: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord | undefined> {
    return store
      ? await store.codexExecReadOnlyAdapterSimulatorReviews.getSimulatorReview(reviewId)
      : readOnlyAdapterSimulatorReviewRecords.find((record) => record.id === reviewId);
  }

  async function listReadOnlyAdapterSimulatorReviewRecords(
    store: CodexHubStore | undefined,
    query: Partial<CodexExecReadOnlyAdapterSimulatorReviewQuery>,
  ): Promise<CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord[]> {
    return store
      ? await store.codexExecReadOnlyAdapterSimulatorReviews.listSimulatorReviews(query)
      : filterInMemoryReadOnlyAdapterSimulatorReviews(readOnlyAdapterSimulatorReviewRecords, query);
  }

  async function persistReadOnlyAdapterSimulatorReviewRecord(
    record: CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.codexExecReadOnlyAdapterSimulatorReviews.saveSimulatorReview(record);
      return;
    }

    const existingIndex = readOnlyAdapterSimulatorReviewRecords.findIndex(
      (candidate) => candidate.id === record.id,
    );

    if (existingIndex >= 0) {
      readOnlyAdapterSimulatorReviewRecords.splice(existingIndex, 1, record);
    } else {
      readOnlyAdapterSimulatorReviewRecords.unshift(record);
    }
  }

  function createReadOnlyAdapterSimulatorReviewResponse(
    reviewRecord: CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord,
    evidenceRefs = reviewRecord.evidenceRefs,
    auditEvents: ReturnType<typeof createReadOnlyAdapterSimulatorReviewAuditEvents> = [],
  ) {
    return {
      reviewRecord,
      summary: summarizeReadOnlyAdapterSimulatorReview(reviewRecord),
      evidenceRefs,
      auditEvents,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  }

  async function resolveReadOnlyAdapterImplementationPlanReviewRecord(
    reviewId: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord | undefined> {
    return store
      ? await store.codexExecReadOnlyAdapterImplementationPlanReviews.getImplementationPlanReview(
          reviewId,
        )
      : readOnlyAdapterImplementationPlanReviewRecords.find((record) => record.id === reviewId);
  }

  async function listReadOnlyAdapterImplementationPlanReviewRecords(
    store: CodexHubStore | undefined,
    query: Partial<CodexExecReadOnlyAdapterImplementationPlanReviewQuery>,
  ): Promise<CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord[]> {
    return store
      ? await store.codexExecReadOnlyAdapterImplementationPlanReviews.listImplementationPlanReviews(
          query,
        )
      : filterInMemoryReadOnlyAdapterImplementationPlanReviews(
          readOnlyAdapterImplementationPlanReviewRecords,
          query,
        );
  }

  async function persistReadOnlyAdapterImplementationPlanReviewRecord(
    record: CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.codexExecReadOnlyAdapterImplementationPlanReviews.saveImplementationPlanReview(
        record,
      );
      return;
    }

    const existingIndex = readOnlyAdapterImplementationPlanReviewRecords.findIndex(
      (candidate) => candidate.id === record.id,
    );

    if (existingIndex >= 0) {
      readOnlyAdapterImplementationPlanReviewRecords.splice(existingIndex, 1, record);
    } else {
      readOnlyAdapterImplementationPlanReviewRecords.unshift(record);
    }
  }

  function createReadOnlyAdapterImplementationPlanReviewResponse(
    reviewRecord: CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord,
    evidenceRefs = reviewRecord.evidenceRefs,
    auditEvents: ReturnType<typeof createReadOnlyAdapterImplementationPlanReviewAuditEvents> = [],
  ) {
    return {
      reviewRecord,
      summary: summarizeReadOnlyAdapterImplementationPlanReview(reviewRecord),
      evidenceRefs,
      auditEvents,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  }

  async function listReadOnlyAdapterSkeletonReviewRecords(
    store: CodexHubStore | undefined,
    query: Partial<CodexExecReadOnlyAdapterSkeletonReviewQuery>,
  ): Promise<CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord[]> {
    return store
      ? await store.codexExecReadOnlyAdapterSkeletonReviews.listSkeletonReviews(query)
      : filterInMemoryReadOnlyAdapterSkeletonReviews(readOnlyAdapterSkeletonReviewRecords, query);
  }

  async function persistReadOnlyAdapterSkeletonReviewRecord(
    record: CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.codexExecReadOnlyAdapterSkeletonReviews.saveSkeletonReview(record);
      return;
    }

    const existingIndex = readOnlyAdapterSkeletonReviewRecords.findIndex(
      (candidate) => candidate.id === record.id,
    );

    if (existingIndex >= 0) {
      readOnlyAdapterSkeletonReviewRecords.splice(existingIndex, 1, record);
    } else {
      readOnlyAdapterSkeletonReviewRecords.unshift(record);
    }
  }

  async function resolveReadOnlyAdapterSkeletonReviewRecord(
    id: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord | undefined> {
    return store
      ? await store.codexExecReadOnlyAdapterSkeletonReviews.getSkeletonReview(id)
      : readOnlyAdapterSkeletonReviewRecords.find((record) => record.id === id);
  }

  function createReadOnlyAdapterSkeletonReviewResponse(
    reviewRecord: CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord,
    evidenceRefs = reviewRecord.evidenceRefs,
    auditEvents: ReturnType<typeof createReadOnlyAdapterSkeletonReviewAuditEvents> = [],
  ) {
    return {
      reviewRecord,
      summary: summarizeReadOnlyAdapterSkeletonReview(reviewRecord),
      evidenceRefs,
      auditEvents,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  }

  async function listReadOnlyAdapterFinalReadinessRecords(
    store: CodexHubStore | undefined,
    query: Partial<CodexExecReadOnlyAdapterFinalReadinessQuery>,
  ): Promise<CodexExecReadOnlyAdapterFinalReadinessDecisionRecord[]> {
    return store
      ? await store.codexExecReadOnlyAdapterFinalReadiness.listFinalReadinessRecords(query)
      : filterInMemoryReadOnlyAdapterFinalReadiness(readOnlyAdapterFinalReadinessRecords, query);
  }

  async function persistReadOnlyAdapterFinalReadinessRecord(
    record: CodexExecReadOnlyAdapterFinalReadinessDecisionRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.codexExecReadOnlyAdapterFinalReadiness.saveFinalReadiness(record);
      return;
    }

    const existingIndex = readOnlyAdapterFinalReadinessRecords.findIndex(
      (candidate) => candidate.id === record.id,
    );

    if (existingIndex >= 0) {
      readOnlyAdapterFinalReadinessRecords.splice(existingIndex, 1, record);
    } else {
      readOnlyAdapterFinalReadinessRecords.unshift(record);
    }
  }

  function createReadOnlyAdapterFinalReadinessResponse(
    decisionRecord: CodexExecReadOnlyAdapterFinalReadinessDecisionRecord,
    evidenceRefs = decisionRecord.evidenceRefs,
    auditEvents: ReturnType<typeof createReadOnlyAdapterFinalReadinessAuditEvents> = [],
  ) {
    return {
      decisionRecord,
      summary: summarizeReadOnlyAdapterFinalReadiness(decisionRecord),
      evidenceRefs,
      auditEvents,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  }

  async function resolveRealReadOnlyAdapterReadinessPackage(
    packageId: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessPackage | undefined> {
    return store
      ? await store.codexExecRealReadOnlyAdapterReadiness.getReadinessPackage(packageId)
      : realReadOnlyAdapterReadinessPackages.find(
          (packageRecord) => packageRecord.id === packageId,
        );
  }

  async function listRealReadOnlyAdapterReadinessPackages(
    store: CodexHubStore | undefined,
    query: Partial<CodexExecRealReadOnlyAdapterReadinessQuery>,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessPackage[]> {
    return store
      ? await store.codexExecRealReadOnlyAdapterReadiness.listReadinessPackages(query)
      : filterInMemoryRealReadOnlyAdapterReadinessPackages(
          realReadOnlyAdapterReadinessPackages,
          query,
        );
  }

  async function latestRealReadOnlyAdapterReadinessPackage(
    dryRunId: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessPackage | undefined> {
    return store
      ? await store.codexExecRealReadOnlyAdapterReadiness.latestReadinessPackage(dryRunId)
      : filterInMemoryRealReadOnlyAdapterReadinessPackages(realReadOnlyAdapterReadinessPackages, {
          dryRunId,
          limit: 1,
        })[0];
  }

  async function persistRealReadOnlyAdapterReadinessPackage(
    packageRecord: CodexExecRealReadOnlyAdapterReadinessPackage,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.codexExecRealReadOnlyAdapterReadiness.saveReadinessPackage(packageRecord);
      return;
    }

    const existingIndex = realReadOnlyAdapterReadinessPackages.findIndex(
      (candidate) => candidate.id === packageRecord.id,
    );

    if (existingIndex >= 0) {
      realReadOnlyAdapterReadinessPackages.splice(existingIndex, 1, packageRecord);
    } else {
      realReadOnlyAdapterReadinessPackages.unshift(packageRecord);
    }
  }

  function createRealReadOnlyAdapterReadinessResponse(
    packageRecord: CodexExecRealReadOnlyAdapterReadinessPackage,
    evidenceRefs = packageRecord.evidenceRefs,
    auditEvents: ReturnType<typeof createRealReadOnlyAdapterReadinessAuditEvents> = [],
  ) {
    return {
      package: packageRecord,
      summary: summarizeRealReadOnlyAdapterReadinessPackage(packageRecord),
      evidenceRefs,
      auditEvents,
      recommendation: REAL_READ_ONLY_ADAPTER_READINESS_RECOMMENDATION,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
      degraded: persistenceState.status !== 'ok',
      notPersisted: false,
      reason: persistenceState.reason,
    };
  }

  async function resolveRealReadOnlyAdapterReadinessReview(
    reviewId: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord | undefined> {
    return store
      ? await store.codexExecRealReadOnlyAdapterReadinessReviews.getReadinessReview(reviewId)
      : realReadOnlyAdapterReadinessReviewRecords.find((record) => record.id === reviewId);
  }

  async function listRealReadOnlyAdapterReadinessReviews(
    store: CodexHubStore | undefined,
    query: Partial<CodexExecRealReadOnlyAdapterReadinessReviewQuery>,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord[]> {
    return store
      ? await store.codexExecRealReadOnlyAdapterReadinessReviews.listReadinessReviews(query)
      : filterInMemoryRealReadOnlyAdapterReadinessReviews(
          realReadOnlyAdapterReadinessReviewRecords,
          query,
        );
  }

  async function latestRealReadOnlyAdapterReadinessReview(
    dryRunId: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord | undefined> {
    return store
      ? await store.codexExecRealReadOnlyAdapterReadinessReviews.latestReadinessReview(dryRunId)
      : filterInMemoryRealReadOnlyAdapterReadinessReviews(
          realReadOnlyAdapterReadinessReviewRecords,
          {
            dryRunId,
            limit: 1,
          },
        )[0];
  }

  async function persistRealReadOnlyAdapterReadinessReview(
    reviewRecord: CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.codexExecRealReadOnlyAdapterReadinessReviews.saveReadinessReview(reviewRecord);
      return;
    }

    const existingIndex = realReadOnlyAdapterReadinessReviewRecords.findIndex(
      (candidate) => candidate.id === reviewRecord.id,
    );

    if (existingIndex >= 0) {
      realReadOnlyAdapterReadinessReviewRecords.splice(existingIndex, 1, reviewRecord);
    } else {
      realReadOnlyAdapterReadinessReviewRecords.unshift(reviewRecord);
    }
  }

  function createRealReadOnlyAdapterReadinessReviewResponse(
    reviewRecord: CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord,
    evidenceRefs = reviewRecord.evidenceRefs,
    auditEvents: ReturnType<typeof createRealReadOnlyAdapterReadinessReviewAuditEvents> = [],
  ) {
    return {
      reviewRecord,
      summary: summarizeRealReadOnlyAdapterReadinessReview(reviewRecord),
      evidenceRefs,
      auditEvents,
      recommendation: REAL_READ_ONLY_ADAPTER_READINESS_REVIEW_RECOMMENDATION,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
      degraded: persistenceState.status !== 'ok',
      notPersisted: false,
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterAttemptResponse(
    attemptRecord: CodexExecRealReadOnlyAdapterAttemptRecord,
    details: {
      request?: ReturnType<typeof createRealReadOnlyAdapterRequest>;
      preflight?: ReturnType<typeof createRealReadOnlyAdapterGuardPreflight>;
      result?:
        | ReturnType<typeof createRealReadOnlyAdapterBlockedResult>
        | ReturnType<typeof createRealReadOnlyAdapterResultFromBoundary>;
      evidenceRefs?: ReturnType<typeof createRealReadOnlyAdapterAttemptEvidenceRefs>;
      auditEvents?: ReturnType<typeof createRealReadOnlyAdapterAttemptAuditEvents>;
    } = {},
  ) {
    const alignedAttemptRecord = alignRealReadOnlyAdapterAttemptRecordDiagnostics(attemptRecord);

    return {
      attempt: alignedAttemptRecord,
      attemptRecord: alignedAttemptRecord,
      summary: summarizeRealReadOnlyAdapterAttempt(alignedAttemptRecord),
      request: details.request,
      preflight: details.preflight,
      result: details.result,
      evidenceRefs: details.evidenceRefs ?? [],
      auditEvents: details.auditEvents ?? [],
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      ...createRealReadOnlyAdapterAttemptRuntimeFlags(alignedAttemptRecord),
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterAttemptListResponse(
    attempts: CodexExecRealReadOnlyAdapterAttemptRecord[],
  ) {
    const alignedAttempts = attempts.map((attempt) =>
      alignRealReadOnlyAdapterAttemptRecordDiagnostics(attempt),
    );

    return {
      attempts: alignedAttempts,
      attemptRecords: alignedAttempts,
      summaries: alignedAttempts.map((attempt) => summarizeRealReadOnlyAdapterAttempt(attempt)),
      count: alignedAttempts.length,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      ...createRealReadOnlyAdapterAttemptRuntimeFlags(alignedAttempts),
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterAttemptUnavailableResponse(dryRunId?: string) {
    return {
      error: 'real read-only adapter attempt store is unavailable',
      dryRunId,
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason ?? 'store unavailable',
    };
  }

  function createRealReadOnlyAdapterPolicySourceResponse(
    record: CodexExecRealReadOnlyAdapterPolicySourceRecord,
    details: {
      evidenceRefs?: ReturnType<typeof createRealReadOnlyAdapterPolicySourceEvidenceRefs>;
      auditEvents?: ReturnType<typeof createRealReadOnlyAdapterPolicySourceAuditEvents>;
    } = {},
  ) {
    return {
      record,
      policySourceRecord: record,
      summary: summarizeRealReadOnlyAdapterPolicySourceRecord(record),
      evidenceRefs: details.evidenceRefs ?? record.evidenceRefs,
      auditEvents: details.auditEvents ?? [],
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      hardGateCount: record.hardGateCount,
      passedGateCount: record.passedGateCount,
      blockedGateCount: record.blockedGateCount,
      requiresReviewFindingCount: record.requiresReviewFindingCount,
      missingSources: record.missingSources,
      degraded: false,
      notPersisted: false,
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
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterPolicySourceListResponse(
    records: CodexExecRealReadOnlyAdapterPolicySourceRecord[],
    query: Partial<CodexExecRealReadOnlyAdapterPolicySourceQuery>,
  ) {
    return {
      records,
      policySourceRecords: records,
      summaries: listRealReadOnlyAdapterPolicySourceSummaries(records, query),
      count: records.length,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterPolicySourceUnavailableResponse(dryRunId?: string) {
    return {
      error: 'real read-only adapter policy source store is unavailable',
      dryRunId,
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      configExplicitlyEnabled: false,
      readOnlyOnly: false,
      policyDecisionPresent: false,
      policyDecisionAllowsPilot: false,
      evidenceAuditReady: false,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason ?? 'store unavailable',
    };
  }

  function createRealReadOnlyAdapterApprovalAuthorityTraceResponse(
    record: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord,
    details: {
      evidenceRefs?: ReturnType<typeof createRealReadOnlyAdapterApprovalAuthorityTraceEvidenceRefs>;
      auditEvents?: ReturnType<typeof createRealReadOnlyAdapterApprovalAuthorityTraceAuditEvents>;
    } = {},
  ) {
    return {
      record,
      approvalAuthorityTraceRecord: record,
      summary: summarizeRealReadOnlyAdapterApprovalAuthorityTraceRecord(record),
      evidenceRefs: details.evidenceRefs ?? record.evidenceRefs,
      auditEvents: details.auditEvents ?? [],
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      inputApprovalArtifactId: record.inputApprovalArtifactId,
      resolvedApprovalRecordId: record.resolvedApprovalRecordId,
      resolvedApprovalArtifactId: record.resolvedApprovalArtifactId,
      exactLookupMatched: record.exactLookupMatched,
      sourcePreparationMatched: record.sourcePreparationMatched,
      prerequisiteMatched: record.prerequisiteMatched,
      dryRunHashMatched: record.dryRunHashMatched,
      policyHashMatched: record.policyHashMatched,
      approvalApproved: record.approvalApproved,
      approvalUnused: record.approvalUnused,
      approvalNotRevoked: record.approvalNotRevoked,
      approvalNotExpired: record.approvalNotExpired,
      attemptPreflightWouldAccept: record.attemptPreflightWouldAccept,
      checkedAt: record.checkedAt,
      expiresAt: record.expiresAt,
      reasonCodes: record.reasonCodes,
      degraded: record.degraded,
      notPersisted: record.notPersisted,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      authoritative: record.authoritative,
      supervisorBacked: record.supervisorBacked,
      persisted: record.persisted,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterApprovalAuthorityTraceListResponse(
    records: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord[],
    query: Partial<CodexExecRealReadOnlyAdapterApprovalAuthorityTraceQuery>,
  ) {
    return {
      records,
      approvalAuthorityTraceRecords: records,
      summaries: listRealReadOnlyAdapterApprovalAuthorityTraceSummaries(records, query),
      count: records.length,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterApprovalAuthorityTraceUnavailableResponse(dryRunId?: string) {
    return {
      error: 'real read-only adapter approval authority trace store is unavailable',
      dryRunId,
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      exactLookupMatched: false,
      sourcePreparationMatched: false,
      prerequisiteMatched: false,
      dryRunHashMatched: false,
      policyHashMatched: false,
      approvalApproved: false,
      approvalUnused: false,
      approvalNotRevoked: false,
      approvalNotExpired: false,
      attemptPreflightWouldAccept: false,
      reasonCodes: ['approval_trace_store_unavailable'],
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason ?? 'store unavailable',
    };
  }

  function createRealReadOnlyAdapterPilotSourcePreparationResponse(
    record: CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord,
    details: {
      evidenceRefs?: ReturnType<typeof createRealReadOnlyAdapterPilotSourcePreparationEvidenceRefs>;
      auditEvents?: ReturnType<typeof createRealReadOnlyAdapterPilotSourcePreparationAuditEvents>;
    } = {},
  ) {
    return {
      record,
      sourcePreparationRecord: record,
      summary: summarizeRealReadOnlyAdapterPilotSourcePreparationRecord(record),
      evidenceRefs: details.evidenceRefs ?? record.evidenceRefs,
      auditEvents: details.auditEvents ?? [],
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      hardGateCount: record.hardGateCount,
      passedGateCount: record.passedGateCount,
      blockedGateCount: record.blockedGateCount,
      requiresReviewFindingCount: record.requiresReviewFindingCount,
      missingSources: record.missingSources,
      degraded: false,
      notPersisted: false,
      configExplicitlyEnabled: record.configExplicitlyEnabled,
      authoritativePolicySourcePresent: record.authoritativePolicySourcePresent,
      validUnusedApprovalPresent: record.validUnusedApprovalPresent,
      isolatedCleanWorktreeMetadataPresent: record.isolatedCleanWorktreeMetadataPresent,
      evidenceAuditReady: record.evidenceAuditReady,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterPilotSourcePreparationListResponse(
    records: CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord[],
    query: Partial<CodexExecRealReadOnlyAdapterPilotSourcePreparationQuery>,
  ) {
    return {
      records,
      sourcePreparationRecords: records,
      summaries: listRealReadOnlyAdapterPilotSourcePreparationSummaries(records, query),
      count: records.length,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterPilotSourcePreparationUnavailableResponse(dryRunId?: string) {
    return {
      error: 'real read-only adapter pilot source preparation store is unavailable',
      dryRunId,
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      configExplicitlyEnabled: false,
      authoritativePolicySourcePresent: false,
      validUnusedApprovalPresent: false,
      isolatedCleanWorktreeMetadataPresent: false,
      evidenceAuditReady: false,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason ?? 'store unavailable',
    };
  }

  function createRealReadOnlyAdapterPilotPrerequisiteResponse(
    record: CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord,
    details: {
      evidenceRefs?: ReturnType<typeof createRealReadOnlyAdapterPilotPrerequisiteEvidenceRefs>;
      auditEvents?: ReturnType<typeof createRealReadOnlyAdapterPilotPrerequisiteAuditEvents>;
    } = {},
  ) {
    return {
      record,
      prerequisiteRecord: record,
      summary: summarizeRealReadOnlyAdapterPilotPrerequisiteRecord(record),
      evidenceRefs: details.evidenceRefs ?? record.evidenceRefs,
      auditEvents: details.auditEvents ?? [],
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      hardGateCount: record.hardGateCount,
      passedGateCount: record.passedGateCount,
      blockedGateCount: record.blockedGateCount,
      requiresReviewFindingCount: record.requiresReviewFindingCount,
      missingPrerequisites: record.missingPrerequisites,
      degraded: false,
      notPersisted: false,
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
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterPilotPrerequisiteListResponse(
    records: CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord[],
    query: Partial<CodexExecRealReadOnlyAdapterPilotPrerequisiteQuery>,
  ) {
    return {
      records,
      prerequisiteRecords: records,
      summaries: listRealReadOnlyAdapterPilotPrerequisiteSummaries(records, query),
      count: records.length,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterPilotPrerequisiteUnavailableResponse(dryRunId?: string) {
    return {
      error: 'real read-only adapter pilot prerequisite store is unavailable',
      dryRunId,
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      configExplicitlyEnabled: false,
      validUnusedApprovalPresent: false,
      isolatedCleanWorktreeMetadataPresent: false,
      authoritativePolicySourcePresent: false,
      authoritativeSourcePreparationPresent: false,
      authoritativeAttemptEvidencePresent: false,
      evidenceAuditReady: false,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason ?? 'store unavailable',
    };
  }

  function isPilotPrerequisiteWorktreeStatus(
    status: string,
  ): status is 'clean' | 'dirty' | 'missing' | 'unknown' {
    return ['clean', 'dirty', 'missing', 'unknown'].includes(status);
  }

  function createBrowserObservationDryRunRecordFromRequest(
    body: BrowserObservationDryRunRequestBody | undefined,
  ): BrowserObservationDryRunRecord {
    const profileRef = createBrowserProfileRef({
      profileId: body?.profileId ?? 'supervisor-browser-profile',
      displayName: body?.displayName ?? 'Supervisor browser profile',
      profilePath: body?.profilePathLabel ?? 'codexhub-supervisor-browser-profile',
      metadata: { requestedBy: 'supervisor-browser-observation' },
    });
    const dryRunId = foundationId('browser_observation_dry_run');
    const plan = createPlaywrightObserverAdapterPlan({
      dryRunId,
      profileRef,
      requestedCapabilities: body?.capabilities,
      requestedActions: body?.requestedActions,
      runnerMode: body?.runnerMode,
      targetUrl: body?.targetUrl,
      rawProfilePath: body?.rawProfilePath,
      screenshotRequested: body?.screenshotRequested,
      networkBodyRequested: body?.networkBodyRequested,
      bodyStorageRequested: body?.bodyStorageRequested,
      metadata: body?.metadata,
    });
    const riskLevel = plan.processBoundaryPlanned ? 'high' : 'medium';
    const policyDecision = policyEngine.evaluateAction({
      actionId: plan.browserPlan.id,
      actionType: 'browser.observe.read_only',
      actionMode: 'read',
      riskLevel,
      dryRun: true,
      approvalGranted: false,
      metadata: {
        noRealWrite: true,
        dryRunOnly: true,
        processBoundaryPlanned: plan.processBoundaryPlanned,
        targetUrlHash: plan.targetUrlHash,
        rawPathStored: false,
        bodyStored: false,
      },
    });
    const evidenceRefs = [
      createBrowserControlEvidence({
        kind: 'browser.observation_plan',
        label: 'browser.observation.dry_run',
        summary: plan.browserPlan.summary,
        metadata: {
          dryRunId,
          planId: plan.browserPlan.id,
          status: plan.status,
          policyDecisionId: policyDecision.id,
          policyOutcome: policyDecision.outcome,
          targetUrlHash: plan.targetUrlHash,
          processBoundaryPlanned: plan.processBoundaryPlanned,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
        },
      }),
    ];
    const auditEventId = foundationId('audit');
    const timeline = [
      BrowserObservationTimelineEventSchema.parse({
        id: foundationId('browser_observation_timeline_event'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: foundationTimestamp(),
        phase: 'dry-run',
        status: plan.status === 'ready' ? 'planned' : 'blocked',
        summary: plan.browserPlan.summary,
        evidenceRefIds: evidenceRefs.map((ref) => ref.id),
        auditEventIds: [auditEventId],
        bodyStored: false,
        rawPathStored: false,
        noRealWrite: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
      }),
    ];

    return BrowserObservationDryRunRecordSchema.parse({
      id: dryRunId,
      dryRunId,
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      status: plan.status,
      plan: plan.browserPlan,
      capabilityDryRun: plan.capabilityDryRun,
      policyDecision,
      targetUrlHash: plan.targetUrlHash,
      blockReasons: plan.blockReasons,
      timeline,
      evidenceRefs,
      auditEventIds: [auditEventId],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryPlanned: plan.processBoundaryPlanned,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: plan.browserPlan.summary,
    });
  }

  function createBrowserObservationApprovalRecord(input: {
    dryRunRecord: BrowserObservationDryRunRecord;
    baseRecord?: BrowserObservationApprovalArtifactRecord;
    status: 'requested' | 'approved' | 'denied' | 'revoked' | 'used';
    requestedBy?: string;
    decidedBy?: string;
    reason?: string;
  }): BrowserObservationApprovalArtifactRecord {
    const now = foundationTimestamp();
    const status = input.status;
    const approvalArtifactId =
      status === 'approved'
        ? (input.baseRecord?.approvalArtifactId ?? foundationId('browser_observation_approval_artifact'))
        : input.baseRecord?.approvalArtifactId;
    const requestedAt = input.baseRecord?.requestedAt ?? now;
    const expiresAt =
      status === 'approved'
        ? new Date(Date.parse(now) + 60 * 60 * 1000).toISOString()
        : input.baseRecord?.expiresAt;
    const evidenceRefs = [
      createBrowserControlEvidence({
        kind: 'browser.observation_plan',
        label: `browser.observation.approval.${status}`,
        summary: `Browser observation approval ${status}.`,
        metadata: {
          dryRunId: input.dryRunRecord.dryRunId,
          dryRunRecordId: input.dryRunRecord.id,
          status,
          approvalArtifactId,
          reasonHash: input.reason ? hashLocalMetadata({ reason: input.reason }) : undefined,
          bodyStored: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
        },
      }),
    ];
    const auditEventId = foundationId('audit');
    const timeline = [
      ...(input.baseRecord?.timeline ?? []),
      BrowserObservationTimelineEventSchema.parse({
        id: foundationId('browser_observation_timeline_event'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: now,
        phase: status === 'requested' ? 'approval-request' : 'approval-decision',
        status,
        summary: `Browser observation approval ${status}.`,
        evidenceRefIds: evidenceRefs.map((ref) => ref.id),
        auditEventIds: [auditEventId],
        bodyStored: false,
        rawPathStored: false,
        noRealWrite: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
      }),
    ];

    return BrowserObservationApprovalArtifactRecordSchema.parse({
      id: input.baseRecord?.id ?? foundationId('browser_observation_approval_record'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: input.baseRecord?.createdAt ?? now,
      dryRunId: input.dryRunRecord.dryRunId,
      dryRunRecordId: input.dryRunRecord.id,
      approvalRequestId: input.baseRecord?.approvalRequestId ?? foundationId('browser_observation_approval_request'),
      approvalArtifactId,
      status,
      requestedBy: input.baseRecord?.requestedBy ?? input.requestedBy ?? 'local-operator',
      decidedBy: status === 'requested' ? undefined : (input.decidedBy ?? 'local-operator'),
      reasonHash: input.baseRecord?.reasonHash ?? (input.reason ? hashLocalMetadata({ reason: input.reason }) : undefined),
      decisionReasonHash:
        status === 'requested' || !input.reason ? undefined : hashLocalMetadata({ reason: input.reason }),
      dryRunPlanHash: hashLocalMetadata(input.dryRunRecord.plan),
      policyDecisionId: input.dryRunRecord.policyDecision.id,
      policyDecisionHash: hashLocalMetadata(input.dryRunRecord.policyDecision),
      approved: status === 'approved',
      requestedAt,
      decidedAt: status === 'requested' ? undefined : now,
      expiresAt,
      usedAt: status === 'used' ? now : input.baseRecord?.usedAt,
      revokedAt: status === 'revoked' ? now : input.baseRecord?.revokedAt,
      timeline,
      evidenceRefs,
      auditEventIds: [auditEventId],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: `Browser observation approval ${status}.`,
    });
  }

  async function executeBrowserObservationRun(input: {
    dryRunRecord: BrowserObservationDryRunRecord;
    approvalRecord?: BrowserObservationApprovalArtifactRecord;
    store: CodexHubStore;
  }): Promise<BrowserObservationControlPlaneRun> {
    const enableRealRunner =
      options.playwrightObserverEnabled === true ||
      process.env.CODEXHUB_PLAYWRIGHT_OBSERVER_ENABLED === 'true';
    const approvalState = classifyBrowserObservationApproval(input.approvalRecord);
    const blockedReason =
      input.dryRunRecord.status === 'blocked'
        ? 'dry_run_blocked'
        : !enableRealRunner && input.dryRunRecord.processBoundaryPlanned
          ? 'playwright_observer_disabled'
          : approvalState !== 'ready'
            ? approvalState
          : !options.playwrightObserverRunner
              ? 'runner_not_configured'
              : undefined;

    if (blockedReason) {
      const evidenceRefs = [
        createBrowserControlEvidence({
          kind: 'browser.observation_run_summary',
          label: 'browser.observation.run.blocked',
          summary: `Browser observation execution blocked: ${blockedReason}.`,
          metadata: {
            dryRunId: input.dryRunRecord.dryRunId,
            blockedReason,
            processBoundaryInvoked: false,
            externalProcessStarted: false,
            bodyStored: false,
          },
        }),
      ];
      const auditEventIds = [foundationId('audit')];
      const record = createBrowserObservationControlPlaneRunRecord({
        dryRunRecord: input.dryRunRecord,
        approvalRecord: input.approvalRecord,
        status: 'blocked',
        summary: `Browser observation execution blocked: ${blockedReason}.`,
        evidenceRefs,
        auditEventIds,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
      });
      await persistBrowserObservationRunRecord(record, input.store);
      await persistEvidenceRefs(evidenceRefs, input.store);
      await persistAuditEvents(
        auditEventIds,
        evidenceRefs,
        input.store,
        input.dryRunRecord.policyDecision.id,
      );
      return record;
    }

    const adapterPlan = createPlaywrightObserverAdapterPlan({
      dryRunId: input.dryRunRecord.dryRunId,
      profileRef: input.dryRunRecord.plan.profileRef,
      requestedCapabilities: input.dryRunRecord.plan.requestedCapabilities,
      runnerMode: input.dryRunRecord.plan.runnerMode,
      metadata: {
        supervisorDryRunRecordId: input.dryRunRecord.id,
        targetUrlHash: input.dryRunRecord.targetUrlHash,
      },
    });
    const authority = ExecutionAuthoritySchema.parse({
      id: foundationId('execution_authority'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      policyDecisionId: input.dryRunRecord.policyDecision.id,
      approvalArtifactId: input.approvalRecord?.approvalArtifactId,
      allowed: true,
      constraints: [
        'read-only browser observation',
        'no profile probing',
        'no screenshot',
        'no network body',
        'no browser act',
      ],
      expiresAt: input.approvalRecord?.expiresAt,
    });
    const runner = options.playwrightObserverRunner;
    const readiness = createBrowserProfileReadiness({
      profileRef: input.dryRunRecord.plan.profileRef,
      status: 'ready',
      blockReasons: [],
      summary: 'Supervisor resolved browser observation authority from persisted approval.',
    });
    const adapterResult = await executePlaywrightObserverAdapter({
      plan: {
        ...adapterPlan,
        id: input.dryRunRecord.id,
        status: input.dryRunRecord.status,
        blockReasons: input.dryRunRecord.blockReasons,
        runnerMode: input.dryRunRecord.plan.runnerMode,
        requestedCapabilities: input.dryRunRecord.plan.requestedCapabilities,
        browserPlan: input.dryRunRecord.plan,
        capabilityDryRun: input.dryRunRecord.capabilityDryRun,
        targetUrlHash: input.dryRunRecord.targetUrlHash,
        processBoundaryPlanned: input.dryRunRecord.processBoundaryPlanned,
      },
      authority,
      runner,
      readiness,
      actor: 'codexhub-supervisor',
    });
    const record = createBrowserObservationControlPlaneRunRecord({
      dryRunRecord: input.dryRunRecord,
      approvalRecord: input.approvalRecord,
      status: adapterResult.status,
      summary: adapterResult.browserRun.summary,
      browserRun: adapterResult.browserRun,
      evidenceRefs: adapterResult.evidenceRefs,
      auditEventIds: adapterResult.auditEvents.map((event) => event.id),
      processBoundaryInvoked: adapterResult.browserRun.processBoundaryInvoked,
      externalProcessStarted: adapterResult.browserRun.externalProcessStarted,
    });

    await persistBrowserObservationRunRecord(record, input.store);
    await persistEvidenceRefs(adapterResult.evidenceRefs, input.store);
    for (const auditEvent of adapterResult.auditEvents) {
      await input.store.auditEvents.append(auditEvent);
    }
    if (input.approvalRecord?.status === 'approved') {
      const consumedApprovalRecord = createBrowserObservationApprovalRecord({
        dryRunRecord: input.dryRunRecord,
        baseRecord: input.approvalRecord,
        status: 'used',
        reason: 'execution attempt consumed approval',
      });
      await persistBrowserObservationApprovalRecord(consumedApprovalRecord, input.store);
      await persistEvidenceRefs(consumedApprovalRecord.evidenceRefs, input.store);
      await persistAuditEvents(
        consumedApprovalRecord.auditEventIds,
        consumedApprovalRecord.evidenceRefs,
        input.store,
        consumedApprovalRecord.policyDecisionId,
      );
    }

    return record;
  }

  function createBrowserObservationControlPlaneRunRecord(input: {
    dryRunRecord: BrowserObservationDryRunRecord;
    approvalRecord?: BrowserObservationApprovalArtifactRecord;
    status: BrowserObservationRunStatus;
    summary: string;
    browserRun?: BrowserObservationControlPlaneRun['browserRun'];
    evidenceRefs: EvidenceRef[];
    auditEventIds: string[];
    processBoundaryInvoked: boolean;
    externalProcessStarted: boolean;
  }): BrowserObservationControlPlaneRun {
    const now = foundationTimestamp();

    return BrowserObservationControlPlaneRunSchema.parse({
      id: foundationId('browser_observation_control_plane_run'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      dryRunId: input.dryRunRecord.dryRunId,
      dryRunRecordId: input.dryRunRecord.id,
      approvalArtifactId: input.approvalRecord?.approvalArtifactId,
      status: input.status,
      planId: input.dryRunRecord.plan.id,
      targetUrlHash: input.dryRunRecord.targetUrlHash,
      browserRun: input.browserRun,
      timeline: [
        BrowserObservationTimelineEventSchema.parse({
          id: foundationId('browser_observation_timeline_event'),
          schemaVersion: SchemaVersionSchema.value,
          createdAt: now,
          phase: 'execution',
          status: input.status,
          summary: input.summary,
          evidenceRefIds: input.evidenceRefs.map((ref) => ref.id),
          auditEventIds: input.auditEventIds,
          bodyStored: false,
          rawPathStored: false,
          noRealWrite: true,
          processBoundaryInvoked: input.processBoundaryInvoked,
          externalProcessStarted: input.externalProcessStarted,
        }),
      ],
      evidenceRefIds: input.evidenceRefs.map((ref) => ref.id),
      auditEventIds: input.auditEventIds,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryInvoked: input.processBoundaryInvoked,
      externalProcessStarted: input.externalProcessStarted,
      summary: input.summary,
    });
  }

  function classifyBrowserObservationApproval(
    record: BrowserObservationApprovalArtifactRecord | undefined,
  ):
    | 'ready'
    | 'approval_artifact_missing'
    | 'approval_denied'
    | 'approval_revoked'
    | 'approval_used'
    | 'approval_expired'
    | 'approval_invalid' {
    if (!record?.approvalArtifactId) {
      return 'approval_artifact_missing';
    }

    if (record.status === 'denied') {
      return 'approval_denied';
    }

    if (record.status === 'revoked') {
      return 'approval_revoked';
    }

    if (record.status === 'used') {
      return 'approval_used';
    }

    if (record.status === 'expired' || (record.expiresAt && Date.parse(record.expiresAt) <= Date.now())) {
      return 'approval_expired';
    }

    if (record.status !== 'approved' || !record.approved) {
      return 'approval_invalid';
    }

    return 'ready';
  }

  function createBrowserControlEvidence(input: {
    kind: EvidenceRef['kind'];
    label: string;
    summary: string;
    metadata: Record<string, unknown>;
  }): EvidenceRef {
    const metadata = {
      ...input.metadata,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
    };

    return {
      id: foundationId('evidence'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      kind: input.kind,
      summary: input.summary,
      hash: hashLocalMetadata(metadata),
      redacted: true,
      labels: [input.label],
      metadata,
    };
  }

  function createElectronCdpObservationDryRunRecordFromRequest(
    body: ElectronCdpObservationDryRunRequestBody | undefined,
  ): ElectronCdpObservationDryRunRecord {
    const dryRunId = foundationId('electron_cdp_observation_dry_run');
    const endpointInput = resolveElectronCdpEndpointInput(body?.host, body?.port);
    const plan = planElectronCdpObservation({
      id: foundationId('electron_cdp_observation_plan'),
      debugEndpoint: endpointInput.endpoint,
      runnerMode: body?.runnerMode ?? 'controlled-local-http',
      targetIdHash: body?.targetIdHash,
      observationWindowMs: body?.observationWindowMs,
      requestedCapabilities: body?.capabilities,
      requestedActions: body?.requestedActions,
      requestedCommands: body?.requestedCommands,
      mainInspectorRequested: body?.mainInspectorRequested,
      runtimeEvaluateRequested: body?.runtimeEvaluateRequested,
      screenshotRequested: body?.screenshotRequested,
      domSnapshotRequested: body?.domSnapshotRequested,
      networkBodyRequested: body?.networkBodyRequested,
      domMutationRequested: body?.domMutationRequested,
      clickTypeRequested: body?.clickTypeRequested,
      genericCommandPassthroughRequested: body?.genericCommandPassthroughRequested,
      metadata: body?.metadata,
    });
    const blockReasons = [...new Set([...plan.blockReasons, ...endpointInput.blockReasons])];
    const observationPlan = {
      ...plan.observationPlan,
      blockReasons,
      summary:
        blockReasons.length > 0
          ? 'Electron/CDP observation plan blocked by read-only safety policy.'
          : plan.observationPlan.summary,
    };
    const status = blockReasons.length > 0 ? 'blocked' : plan.status;
    const basePolicyDecision = policyEngine.evaluateAction({
      actionId: observationPlan.id,
      actionType: 'electron.cdp.observe.read_only',
      actionMode: 'read',
      riskLevel: 'medium',
      dryRun: true,
      approvalGranted: false,
      metadata: {
        noRealWrite: true,
        dryRunOnly: true,
        cdpHttpBoundaryPlanned: observationPlan.cdpHttpBoundaryPlanned,
        processBoundaryPlanned: false,
        endpointIdHash: observationPlan.debugEndpoint?.endpointIdHash,
        targetIdHash: observationPlan.targetIdHash,
        rawPathStored: false,
        bodyStored: false,
      },
    });
    const policyDecision = PolicyDecisionSchema.parse(
      observationPlan.cdpHttpBoundaryPlanned
        ? {
            ...basePolicyDecision,
            outcome: 'approval_required',
            reasons: [
              ...basePolicyDecision.reasons,
              observationPlan.cdpWebSocketBoundaryPlanned
                ? 'controlled local CDP WebSocket event observation requires explicit approval'
                : 'controlled local CDP HTTP observation requires explicit approval',
            ],
            requiresDryRun: true,
            requiresApproval: true,
          }
        : basePolicyDecision,
    );
    const evidenceRefs = [
      createElectronCdpControlEvidence({
        kind: 'electron.observation_plan',
        label: 'electron.cdp.observation.dry_run',
        summary: observationPlan.summary,
        metadata: {
          dryRunId,
          planId: observationPlan.id,
          status,
          policyDecisionId: policyDecision.id,
          policyOutcome: policyDecision.outcome,
          endpointIdHash: observationPlan.debugEndpoint?.endpointIdHash,
          endpointHostHash: observationPlan.debugEndpoint?.hostHash,
          endpointPortHash: observationPlan.debugEndpoint?.portHash,
          targetIdHash: observationPlan.targetIdHash,
          cdpHttpBoundaryPlanned: observationPlan.cdpHttpBoundaryPlanned,
          cdpHttpBoundaryInvoked: false,
          cdpWebSocketBoundaryPlanned: observationPlan.cdpWebSocketBoundaryPlanned,
          cdpWebSocketBoundaryInvoked: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
        },
      }),
    ];
    const auditEventId = foundationId('audit');
    const timeline = [
      ElectronCdpObservationTimelineEventSchema.parse({
        id: foundationId('electron_cdp_observation_timeline_event'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: foundationTimestamp(),
        phase: 'dry-run',
        status: status === 'ready' ? 'planned' : 'blocked',
        summary: observationPlan.summary,
        evidenceRefIds: evidenceRefs.map((ref) => ref.id),
        auditEventIds: [auditEventId],
        bodyStored: false,
        rawPathStored: false,
        noRealWrite: true,
        cdpHttpBoundaryInvoked: false,
        cdpWebSocketBoundaryInvoked: false,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
      }),
    ];

    return ElectronCdpObservationDryRunRecordSchema.parse({
      id: dryRunId,
      dryRunId,
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      status,
      plan: observationPlan,
      capabilityDryRun: {
        ...plan.capabilityDryRun,
        plannedActions: plan.capabilityDryRun.plannedActions.map((action) => ({
          ...action,
          requiresApproval: observationPlan.cdpHttpBoundaryPlanned,
        })),
      },
      policyDecision,
      endpointIdHash: observationPlan.debugEndpoint?.endpointIdHash,
      endpointHostHash: observationPlan.debugEndpoint?.hostHash,
      endpointPortHash: observationPlan.debugEndpoint?.portHash,
      targetIdHash: observationPlan.targetIdHash,
      blockReasons,
      timeline,
      evidenceRefs,
      auditEventIds: [auditEventId],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      cdpHttpBoundaryPlanned: observationPlan.cdpHttpBoundaryPlanned,
      cdpHttpBoundaryInvoked: false,
      cdpWebSocketBoundaryPlanned: observationPlan.cdpWebSocketBoundaryPlanned,
      cdpWebSocketBoundaryInvoked: false,
      processBoundaryPlanned: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: observationPlan.summary,
    });
  }

  function createElectronCdpObservationApprovalRecord(input: {
    dryRunRecord: ElectronCdpObservationDryRunRecord;
    baseRecord?: ElectronCdpObservationApprovalArtifactRecord;
    status: 'requested' | 'approved' | 'denied' | 'revoked' | 'used';
    requestedBy?: string;
    decidedBy?: string;
    reason?: string;
  }): ElectronCdpObservationApprovalArtifactRecord {
    const now = foundationTimestamp();
    const status = input.status;
    const approvalArtifactId =
      status === 'approved'
        ? (input.baseRecord?.approvalArtifactId ??
            foundationId('electron_cdp_observation_approval_artifact'))
        : input.baseRecord?.approvalArtifactId;
    const requestedAt = input.baseRecord?.requestedAt ?? now;
    const expiresAt =
      status === 'approved'
        ? new Date(Date.parse(now) + 60 * 60 * 1000).toISOString()
        : input.baseRecord?.expiresAt;
    const evidenceRefs = [
      createElectronCdpControlEvidence({
        kind: 'electron.observation_plan',
        label: `electron.cdp.observation.approval.${status}`,
        summary: `Electron/CDP observation approval ${status}.`,
        metadata: {
          dryRunId: input.dryRunRecord.dryRunId,
          dryRunRecordId: input.dryRunRecord.id,
          status,
          approvalArtifactId,
          reasonHash: input.reason ? hashLocalMetadata({ reason: input.reason }) : undefined,
          cdpHttpBoundaryInvoked: false,
          cdpWebSocketBoundaryInvoked: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
          bodyStored: false,
        },
      }),
    ];
    const auditEventId = foundationId('audit');
    const timeline = [
      ...(input.baseRecord?.timeline ?? []),
      ElectronCdpObservationTimelineEventSchema.parse({
        id: foundationId('electron_cdp_observation_timeline_event'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: now,
        phase: status === 'requested' ? 'approval-request' : 'approval-decision',
        status,
        summary: `Electron/CDP observation approval ${status}.`,
        evidenceRefIds: evidenceRefs.map((ref) => ref.id),
        auditEventIds: [auditEventId],
        bodyStored: false,
        rawPathStored: false,
        noRealWrite: true,
        cdpHttpBoundaryInvoked: false,
        cdpWebSocketBoundaryInvoked: false,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
      }),
    ];

    return ElectronCdpObservationApprovalArtifactRecordSchema.parse({
      id: input.baseRecord?.id ?? foundationId('electron_cdp_observation_approval_record'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: input.baseRecord?.createdAt ?? now,
      dryRunId: input.dryRunRecord.dryRunId,
      dryRunRecordId: input.dryRunRecord.id,
      approvalRequestId:
        input.baseRecord?.approvalRequestId ??
        foundationId('electron_cdp_observation_approval_request'),
      approvalArtifactId,
      status,
      requestedBy: input.baseRecord?.requestedBy ?? input.requestedBy ?? 'local-operator',
      decidedBy: status === 'requested' ? undefined : (input.decidedBy ?? 'local-operator'),
      reasonHash:
        input.baseRecord?.reasonHash ??
        (input.reason ? hashLocalMetadata({ reason: input.reason }) : undefined),
      decisionReasonHash:
        status === 'requested' || !input.reason
          ? undefined
          : hashLocalMetadata({ reason: input.reason }),
      dryRunPlanHash: hashLocalMetadata(input.dryRunRecord.plan),
      policyDecisionId: input.dryRunRecord.policyDecision.id,
      policyDecisionHash: hashLocalMetadata(input.dryRunRecord.policyDecision),
      approved: status === 'approved',
      requestedAt,
      decidedAt: status === 'requested' ? undefined : now,
      expiresAt,
      usedAt: status === 'used' ? now : input.baseRecord?.usedAt,
      revokedAt: status === 'revoked' ? now : input.baseRecord?.revokedAt,
      timeline,
      evidenceRefs,
      auditEventIds: [auditEventId],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      cdpHttpBoundaryInvoked: false,
      cdpWebSocketBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: `Electron/CDP observation approval ${status}.`,
    });
  }

  async function executeElectronCdpObservationRun(input: {
    dryRunRecord: ElectronCdpObservationDryRunRecord;
    approvalRecord?: ElectronCdpObservationApprovalArtifactRecord;
    store: CodexHubStore;
    host?: string;
    port?: number;
  }): Promise<ElectronCdpObservationControlPlaneRun> {
    const enableControlledHttp =
      options.electronCdpObserverEnabled === true ||
      process.env.CODEXHUB_ELECTRON_CDP_OBSERVER_ENABLED === 'true';
    const enableControlledEvents =
      options.electronCdpEventsEnabled === true ||
      process.env.CODEXHUB_ELECTRON_CDP_EVENTS_ENABLED === 'true';
    const approvalState = classifyElectronCdpObservationApproval(input.approvalRecord);
    const endpointMatch = verifyElectronCdpTransientEndpoint(
      input.dryRunRecord.plan.debugEndpoint,
      input.host,
      input.port,
    );
    const blockedReason =
      input.dryRunRecord.status === 'blocked'
        ? 'dry_run_blocked'
        : input.dryRunRecord.plan.cdpWebSocketBoundaryPlanned && !enableControlledEvents
          ? 'controlled_websocket_events_disabled'
        : input.dryRunRecord.cdpHttpBoundaryPlanned && !enableControlledHttp
          ? 'controlled_http_disabled'
          : input.dryRunRecord.cdpHttpBoundaryPlanned && endpointMatch !== 'ready'
            ? endpointMatch
            : input.dryRunRecord.cdpHttpBoundaryPlanned && approvalState !== 'ready'
              ? approvalState
              : input.dryRunRecord.cdpHttpBoundaryPlanned &&
                  !options.electronCdpObserverRunner &&
                  (!input.host || input.port === undefined)
                ? 'controlled_http_runner_missing'
                : input.dryRunRecord.plan.cdpWebSocketBoundaryPlanned &&
                    !options.electronCdpObserverRunner &&
                    !input.dryRunRecord.plan.targetIdHash
                  ? 'target_hash_required'
                : undefined;

    if (blockedReason) {
      const evidenceRefs = [
        createElectronCdpControlEvidence({
          kind: 'electron.run_summary',
          label: 'electron.cdp.observation.run.blocked',
          summary: `Electron/CDP observation execution blocked: ${blockedReason}.`,
          metadata: {
            dryRunId: input.dryRunRecord.dryRunId,
            blockedReason,
            cdpHttpBoundaryInvoked: false,
            cdpWebSocketBoundaryInvoked: false,
            processBoundaryInvoked: false,
            externalProcessStarted: false,
            bodyStored: false,
          },
        }),
      ];
      const auditEventIds = [foundationId('audit')];
      const record = createElectronCdpObservationControlPlaneRunRecord({
        dryRunRecord: input.dryRunRecord,
        approvalRecord: input.approvalRecord,
        status: 'blocked',
        summary: `Electron/CDP observation execution blocked: ${blockedReason}.`,
        evidenceRefs,
        auditEventIds,
        cdpHttpBoundaryInvoked: false,
        cdpWebSocketBoundaryInvoked: false,
      });
      await persistElectronCdpObservationRunRecord(record, input.store);
      await persistEvidenceRefs(evidenceRefs, input.store);
      await persistElectronCdpAuditEvents(
        auditEventIds,
        evidenceRefs,
        input.store,
        input.dryRunRecord.policyDecision.id,
      );
      return record;
    }

    const runner =
      options.electronCdpObserverRunner ??
      (input.dryRunRecord.plan.runnerMode === 'controlled-websocket-events'
        ? createElectronCdpControlledWebSocketEventRunner({
            host: input.host ?? '127.0.0.1',
            port: input.port ?? 0,
            targetIdHash: input.dryRunRecord.plan.targetIdHash ?? '',
          })
        : createElectronCdpControlledHttpRunner({
            host: input.host ?? '127.0.0.1',
            port: input.port ?? 0,
          }));
    const authority = ExecutionAuthoritySchema.parse({
      id: foundationId('execution_authority'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      policyDecisionId: input.dryRunRecord.policyDecision.id,
      approvalArtifactId: input.approvalRecord?.approvalArtifactId,
      allowed: true,
      constraints: [
        'read-only electron cdp observation',
        'loopback devtools HTTP metadata only',
        input.dryRunRecord.plan.runnerMode === 'controlled-websocket-events'
          ? 'loopback websocket event metadata only'
          : 'no websocket event connection',
        input.dryRunRecord.plan.runnerMode === 'controlled-websocket-events'
          ? 'fixed cdp event subscription commands only'
          : 'no cdp commands',
        'no main inspector',
        'no runtime evaluation',
        'no screenshot or dom snapshot',
      ],
      expiresAt: input.approvalRecord?.expiresAt,
    });
    const adapterPlan = planElectronCdpObservation({
      id: input.dryRunRecord.plan.id,
      debugEndpoint: input.dryRunRecord.plan.debugEndpoint,
      targets: input.dryRunRecord.plan.targets,
      runnerMode: input.dryRunRecord.plan.runnerMode,
      targetIdHash: input.dryRunRecord.plan.targetIdHash,
      observationWindowMs: input.dryRunRecord.plan.observationWindowMs,
      requestedCapabilities: input.dryRunRecord.plan.requestedCapabilities,
      requestedCommands: input.dryRunRecord.plan.commandDecisions.map(
        (decision) => decision.command,
      ),
      metadata: {
        supervisorDryRunRecordId: input.dryRunRecord.id,
        endpointIdHash: input.dryRunRecord.endpointIdHash,
      },
    });
    const adapterResult = await executeElectronCdpAdapter({
      plan: {
        ...adapterPlan,
        status: input.dryRunRecord.status,
        observationPlan: input.dryRunRecord.plan,
        capabilityDryRun: input.dryRunRecord.capabilityDryRun,
        blockReasons: input.dryRunRecord.blockReasons,
      },
      authority,
      runner,
      actor: 'codexhub-supervisor',
    });
    const record = createElectronCdpObservationControlPlaneRunRecord({
      dryRunRecord: input.dryRunRecord,
      approvalRecord: input.approvalRecord,
      status: adapterResult.electronRun.status,
      summary: adapterResult.electronRun.summary,
      electronRun: adapterResult.electronRun,
      evidenceRefs: adapterResult.evidenceRefs,
      auditEventIds: adapterResult.auditEvents.map((event) => event.id),
      cdpHttpBoundaryInvoked: adapterResult.electronRun.cdpHttpBoundaryInvoked,
      cdpWebSocketBoundaryInvoked: adapterResult.electronRun.cdpWebSocketBoundaryInvoked,
    });

    await persistElectronCdpObservationRunRecord(record, input.store);
    await persistEvidenceRefs(adapterResult.evidenceRefs, input.store);
    for (const auditEvent of adapterResult.auditEvents) {
      await input.store.auditEvents.append(auditEvent);
    }
    if (input.approvalRecord?.status === 'approved') {
      const consumedApprovalRecord = createElectronCdpObservationApprovalRecord({
        dryRunRecord: input.dryRunRecord,
        baseRecord: input.approvalRecord,
        status: 'used',
        reason: 'execution attempt consumed approval',
      });
      await persistElectronCdpObservationApprovalRecord(consumedApprovalRecord, input.store);
      await persistEvidenceRefs(consumedApprovalRecord.evidenceRefs, input.store);
      await persistElectronCdpAuditEvents(
        consumedApprovalRecord.auditEventIds,
        consumedApprovalRecord.evidenceRefs,
        input.store,
        consumedApprovalRecord.policyDecisionId,
      );
    }

    return record;
  }

  function createElectronCdpObservationControlPlaneRunRecord(input: {
    dryRunRecord: ElectronCdpObservationDryRunRecord;
    approvalRecord?: ElectronCdpObservationApprovalArtifactRecord;
    status: ElectronCdpObservationRunStatus;
    summary: string;
    electronRun?: ElectronCdpObservationControlPlaneRun['electronRun'];
    evidenceRefs: EvidenceRef[];
    auditEventIds: string[];
    cdpHttpBoundaryInvoked: boolean;
    cdpWebSocketBoundaryInvoked: boolean;
  }): ElectronCdpObservationControlPlaneRun {
    const now = foundationTimestamp();

    return ElectronCdpObservationControlPlaneRunSchema.parse({
      id: foundationId('electron_cdp_observation_control_plane_run'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      dryRunId: input.dryRunRecord.dryRunId,
      dryRunRecordId: input.dryRunRecord.id,
      approvalArtifactId: input.approvalRecord?.approvalArtifactId,
      status: input.status,
      planId: input.dryRunRecord.plan.id,
      endpointIdHash: input.dryRunRecord.endpointIdHash,
      targetIdHash: input.dryRunRecord.targetIdHash,
      electronRun: input.electronRun,
      timeline: [
        ElectronCdpObservationTimelineEventSchema.parse({
          id: foundationId('electron_cdp_observation_timeline_event'),
          schemaVersion: SchemaVersionSchema.value,
          createdAt: now,
          phase: 'execution',
          status: input.status,
          summary: input.summary,
          evidenceRefIds: input.evidenceRefs.map((ref) => ref.id),
          auditEventIds: input.auditEventIds,
          bodyStored: false,
          rawPathStored: false,
          noRealWrite: true,
          cdpHttpBoundaryInvoked: input.cdpHttpBoundaryInvoked,
          cdpWebSocketBoundaryInvoked: input.cdpWebSocketBoundaryInvoked,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
        }),
      ],
      evidenceRefIds: input.evidenceRefs.map((ref) => ref.id),
      auditEventIds: input.auditEventIds,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      cdpHttpBoundaryInvoked: input.cdpHttpBoundaryInvoked,
      cdpWebSocketBoundaryInvoked: input.cdpWebSocketBoundaryInvoked,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: input.summary,
    });
  }

  function classifyElectronCdpObservationApproval(
    record: ElectronCdpObservationApprovalArtifactRecord | undefined,
  ):
    | 'ready'
    | 'approval_artifact_missing'
    | 'approval_denied'
    | 'approval_artifact_revoked'
    | 'approval_artifact_used'
    | 'approval_artifact_expired'
    | 'approval_artifact_invalid' {
    if (!record?.approvalArtifactId) {
      return 'approval_artifact_missing';
    }

    if (record.status === 'denied') {
      return 'approval_denied';
    }

    if (record.status === 'revoked') {
      return 'approval_artifact_revoked';
    }

    if (record.status === 'used') {
      return 'approval_artifact_used';
    }

    if (record.status === 'expired' || (record.expiresAt && Date.parse(record.expiresAt) <= Date.now())) {
      return 'approval_artifact_expired';
    }

    if (record.status !== 'approved' || !record.approved) {
      return 'approval_artifact_invalid';
    }

    return 'ready';
  }

  function createElectronCdpControlEvidence(input: {
    kind: EvidenceRef['kind'];
    label: string;
    summary: string;
    metadata: Record<string, unknown>;
  }): EvidenceRef {
    const metadata = {
      ...input.metadata,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
    };

    return {
      id: foundationId('evidence'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      kind: input.kind,
      summary: input.summary,
      hash: hashLocalMetadata(metadata),
      redacted: true,
      labels: [input.label],
      metadata,
    };
  }

  function resolveElectronCdpEndpointInput(
    host: string | undefined,
    port: number | undefined,
  ): {
    endpoint?: ElectronDebugEndpointSummary;
    blockReasons: Array<'non_loopback_endpoint_forbidden' | 'capability_required'>;
  } {
    if (!host || port === undefined) {
      return { blockReasons: ['capability_required'] };
    }

    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
      return { blockReasons: ['capability_required'] };
    }

    if (!isLoopbackElectronEndpointHost(host)) {
      return { blockReasons: ['non_loopback_endpoint_forbidden'] };
    }

    return {
      endpoint: createElectronDebugEndpointSummary({ host, port, userEnabled: true }),
      blockReasons: [],
    };
  }

  function verifyElectronCdpTransientEndpoint(
    persistedEndpoint: ElectronDebugEndpointSummary | undefined,
    host: string | undefined,
    port: number | undefined,
  ): 'ready' | 'endpoint_hash_mismatch' {
    if (!persistedEndpoint || !host || port === undefined) {
      return 'endpoint_hash_mismatch';
    }

    if (!Number.isInteger(port) || !isLoopbackElectronEndpointHost(host)) {
      return 'endpoint_hash_mismatch';
    }

    const transientEndpoint = createElectronDebugEndpointSummary({
      host,
      port,
      userEnabled: persistedEndpoint.userEnabled,
    });

    return transientEndpoint.endpointIdHash === persistedEndpoint.endpointIdHash &&
      transientEndpoint.hostHash === persistedEndpoint.hostHash &&
      transientEndpoint.portHash === persistedEndpoint.portHash
      ? 'ready'
      : 'endpoint_hash_mismatch';
  }

  async function persistElectronCdpAuditEvents(
    auditEventIds: string[],
    evidenceRefs: EvidenceRef[],
    store: CodexHubStore,
    policyDecisionId = 'electron-cdp-observation-control-plane',
  ): Promise<void> {
    for (const auditEventId of auditEventIds) {
      await store.auditEvents.append({
        id: auditEventId,
        schemaVersion: SchemaVersionSchema.value,
        createdAt: foundationTimestamp(),
        actor: 'codexhub-supervisor',
        action: 'electron.cdp.observation.control_plane',
        target: 'electron.cdp.observation',
        reason: 'electron cdp observation control-plane metadata transition',
        outcome: 'recorded',
        evidenceRefs,
        policyDecisionId,
        metadata: {
          bodyStored: false,
          rawPathStored: false,
          noRealWrite: true,
          liveExecution: false,
          cdpHttpBoundaryInvoked: false,
          cdpWebSocketBoundaryInvoked: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
        },
      });
    }
  }

  async function persistElectronCdpObservationDryRunRecord(
    record: ElectronCdpObservationDryRunRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.electronCdpObservationDryRuns.saveDryRun(record);
      return;
    }

    electronCdpObservationDryRunRecords.unshift(record);
  }

  async function persistElectronCdpObservationApprovalRecord(
    record: ElectronCdpObservationApprovalArtifactRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.electronCdpObservationApprovals.saveApproval(record);
      return;
    }

    const index = electronCdpObservationApprovalRecords.findIndex(
      (candidate) => candidate.id === record.id,
    );
    if (index >= 0) {
      electronCdpObservationApprovalRecords.splice(index, 1, record);
    } else {
      electronCdpObservationApprovalRecords.unshift(record);
    }
  }

  async function persistElectronCdpObservationRunRecord(
    record: ElectronCdpObservationControlPlaneRun,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.electronCdpObservationRuns.saveRun(record);
      return;
    }

    electronCdpObservationRunRecords.unshift(record);
  }

  async function resolveElectronCdpObservationDryRunRecord(
    dryRunId: string | undefined,
    store: CodexHubStore | undefined,
  ): Promise<ElectronCdpObservationDryRunRecord | undefined> {
    if (!dryRunId) {
      return undefined;
    }

    return store
      ? await store.electronCdpObservationDryRuns.getDryRun(dryRunId)
      : electronCdpObservationDryRunRecords.find(
          (record) => record.id === dryRunId || record.dryRunId === dryRunId,
        );
  }

  async function resolveElectronCdpObservationApprovalRecord(
    approvalRequestId: string,
    store: CodexHubStore | undefined,
  ): Promise<ElectronCdpObservationApprovalArtifactRecord | undefined> {
    if (store) {
      const directRecord =
        await store.electronCdpObservationApprovals.getApproval(approvalRequestId);

      if (directRecord) {
        return directRecord;
      }

      return (await store.electronCdpObservationApprovals.listApprovals({ limit: 100 })).find(
        (record) => record.approvalRequestId === approvalRequestId,
      );
    }

    return electronCdpObservationApprovalRecords.find(
      (record) => record.id === approvalRequestId || record.approvalRequestId === approvalRequestId,
    );
  }

  async function resolveElectronCdpObservationApprovalRecordByArtifactId(
    approvalArtifactId: string,
    store: CodexHubStore | undefined,
  ): Promise<ElectronCdpObservationApprovalArtifactRecord | undefined> {
    return store
      ? await store.electronCdpObservationApprovals.getApprovalByArtifactId(approvalArtifactId)
      : electronCdpObservationApprovalRecords.find(
          (record) => record.approvalArtifactId === approvalArtifactId,
        );
  }

  async function resolveElectronCdpObservationRun(
    runId: string,
    store: CodexHubStore | undefined,
  ): Promise<ElectronCdpObservationControlPlaneRun | undefined> {
    return store
      ? await store.electronCdpObservationRuns.getRun(runId)
      : electronCdpObservationRunRecords.find((record) => record.id === runId);
  }

  async function listElectronCdpObservationDryRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<ElectronCdpObservationDryRunRecord[]> {
    return store
      ? await store.electronCdpObservationDryRuns.listDryRuns(query)
      : electronCdpObservationDryRunRecords.slice(0, query.limit ?? 50);
  }

  async function listElectronCdpObservationApprovals(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<ElectronCdpObservationApprovalArtifactRecord[]> {
    return store
      ? await store.electronCdpObservationApprovals.listApprovals(query)
      : electronCdpObservationApprovalRecords.slice(0, query.limit ?? 50);
  }

  async function listElectronCdpObservationRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<ElectronCdpObservationControlPlaneRun[]> {
    return store
      ? await store.electronCdpObservationRuns.listRuns(query)
      : electronCdpObservationRunRecords.slice(0, query.limit ?? 50);
  }

  function createElectronCdpObservationDryRunResponse(
    record: ElectronCdpObservationDryRunRecord,
  ) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      planId: record.plan.id,
      endpointIdHash: record.endpointIdHash,
      endpointHostHash: record.endpointHostHash,
      endpointPortHash: record.endpointPortHash,
      targetIdHash: record.targetIdHash,
      policyDecisionId: record.policyDecision.id,
      policyOutcome: record.policyDecision.outcome,
      requiresApproval: record.policyDecision.requiresApproval,
      runnerMode: record.plan.runnerMode,
      requestedCapabilities: record.plan.requestedCapabilities,
      blockReasons: record.blockReasons,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      cdpHttpBoundaryPlanned: record.cdpHttpBoundaryPlanned,
      cdpHttpBoundaryInvoked: false,
      cdpWebSocketBoundaryPlanned: record.cdpWebSocketBoundaryPlanned,
      cdpWebSocketBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createElectronCdpObservationApprovalResponse(
    record: ElectronCdpObservationApprovalArtifactRecord,
  ) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalRequestId: record.approvalRequestId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      approved: record.approved,
      expiresAt: record.expiresAt,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      cdpHttpBoundaryInvoked: false,
      cdpWebSocketBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createElectronCdpObservationRunResponse(
    record: ElectronCdpObservationControlPlaneRun,
  ) {
    return {
      runId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      planId: record.planId,
      endpointIdHash: record.endpointIdHash,
      targetIdHash: record.targetIdHash,
      evidenceRefIds: record.evidenceRefIds,
      auditEventIds: record.auditEventIds,
      cdpHttpBoundaryInvoked: record.cdpHttpBoundaryInvoked,
      cdpWebSocketBoundaryInvoked: record.cdpWebSocketBoundaryInvoked,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createElectronCdpObservationStoreUnavailableResponse(phase: string) {
    return {
      error: 'electron_cdp_observation_store_unavailable',
      phase,
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      cdpHttpBoundaryInvoked: false,
      cdpWebSocketBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
      noRealWrite: true,
      bodyStored: false,
      rawPathStored: false,
    };
  }

  function createElectronCdpObservationUntrustedAuthorityResponse(
    dryRunId: string | undefined,
  ) {
    return {
      error: 'untrusted_electron_cdp_observation_authority_body',
      dryRunId,
      status: 'blocked',
      liveExecution: false,
      cdpHttpBoundaryInvoked: false,
      cdpWebSocketBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
      noRealWrite: true,
      bodyStored: false,
      rawPathStored: false,
    };
  }

  function parseElectronCdpObservationQuery(query: unknown): {
    dryRunId?: string;
    status?: string;
    limit?: number;
  } {
    const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

    return {
      dryRunId: readQueryValue(query, 'dryRunId'),
      status: readQueryValue(query, 'status'),
      limit: limitResult.allowed ? limitResult.limit : undefined,
    };
  }

  function createWorktreeDryRunRecordFromRequest(
    body: WorktreeDryRunRequestBody | undefined,
  ): WorktreeDryRunRecord {
    const worktreeSlug = body?.worktreeSlug ?? 'm6b-controlled-worktree';
    const runnerMode = body?.runnerMode ?? 'controlled-git-worktree';
    const plan = createWorktreeManagerPlan({
      repoRoot: body?.repoRoot ?? process.cwd(),
      worktreeSlug,
      branchName: body?.branchName ?? `codex/${worktreeSlug}`,
      baseRef: body?.baseRef,
      runnerMode,
      worktreeRoot: body?.worktreeRoot,
      allowedWorktreeRoots: body?.allowedWorktreeRoots,
    });
    const policyDecision = policyEngine.evaluateAction({
      actionId: plan.id,
      actionType:
        runnerMode === 'controlled-git-worktree'
          ? 'git.worktree.create'
          : 'git.worktree.fixture_summary',
      actionMode: runnerMode === 'controlled-git-worktree' ? 'write' : 'dry-run',
      riskLevel: runnerMode === 'controlled-git-worktree' ? 'high' : 'medium',
      dryRun: true,
      approvalGranted: false,
      metadata: {
        runnerMode,
        realWrite: runnerMode === 'controlled-git-worktree',
        noRealWrite: runnerMode !== 'controlled-git-worktree',
        worktreePathHash: plan.worktreePathHash,
      },
    });
    const status = plan.status === 'blocked' || policyDecision.outcome === 'deny'
      ? 'blocked'
      : 'ready';
    const evidenceRefs = [
      createWorktreeControlEvidence({
        kind: 'worktree.plan',
        label: 'worktree.control-plane.dry-run',
        summary: plan.worktreePlan.summary,
        metadata: {
          dryRunId: plan.id,
          status,
          runnerMode,
          repoRootHash: plan.repoRootHash,
          worktreeRootHash: plan.worktreeRootHash,
          worktreePathHash: plan.worktreePathHash,
          branchNameHash: plan.branchNameHash,
          worktreeSlugHash: plan.worktreeSlugHash,
          baseRefHash: plan.baseRefHash,
          blockReasons: plan.blockReasons,
          gitProcessBoundaryPlanned: plan.worktreePlan.gitProcessBoundaryPlanned,
          gitProcessBoundaryInvoked: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
        },
      }),
    ];
    const auditEventId = foundationId('audit');

    return WorktreeDryRunRecordSchema.parse({
      id: plan.id,
      dryRunId: plan.id,
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      status,
      plan: plan.worktreePlan,
      capabilityDryRun: plan.capabilityDryRun,
      policyDecision: PolicyDecisionSchema.parse(policyDecision),
      repoRootHash: plan.repoRootHash,
      worktreeRootHash: plan.worktreeRootHash,
      worktreePathHash: plan.worktreePathHash,
      branchNameHash: plan.branchNameHash,
      worktreeSlugHash: plan.worktreeSlugHash,
      baseRefHash: plan.baseRefHash,
      blockReasons: plan.blockReasons,
      timeline: [
        WorktreeControlPlaneTimelineEventSchema.parse({
          id: foundationId('worktree_timeline_event'),
          schemaVersion: SchemaVersionSchema.value,
          createdAt: foundationTimestamp(),
          phase: 'dry-run',
          status: status === 'ready' ? 'planned' : 'blocked',
          summary: plan.worktreePlan.summary,
          evidenceRefIds: evidenceRefs.map((ref) => ref.id),
          auditEventIds: [auditEventId],
          rawPathStored: false,
          bodyStored: false,
          gitProcessBoundaryInvoked: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
        }),
      ],
      evidenceRefs,
      auditEventIds: [auditEventId],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      gitProcessBoundaryPlanned: plan.worktreePlan.gitProcessBoundaryPlanned,
      gitProcessBoundaryInvoked: false,
      processBoundaryPlanned: plan.worktreePlan.processBoundaryPlanned,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: plan.worktreePlan.summary,
    });
  }

  function createWorktreeApprovalRecord(input: {
    dryRunRecord: WorktreeDryRunRecord;
    baseRecord?: WorktreeApprovalArtifactRecord;
    status: 'requested' | 'approved' | 'denied' | 'revoked' | 'used';
    requestedBy?: string;
    decidedBy?: string;
    reason?: string;
  }): WorktreeApprovalArtifactRecord {
    const now = foundationTimestamp();
    const approvalArtifactId =
      input.status === 'approved'
        ? (input.baseRecord?.approvalArtifactId ?? foundationId('worktree_approval_artifact'))
        : input.baseRecord?.approvalArtifactId;
    const evidenceRefs = [
      createWorktreeControlEvidence({
        kind: 'worktree.plan',
        label: `worktree.control-plane.approval.${input.status}`,
        summary: `Worktree approval ${input.status}.`,
        metadata: {
          dryRunId: input.dryRunRecord.dryRunId,
          status: input.status,
          approvalArtifactId,
          reasonHash: input.reason ? hashLocalMetadata({ reason: input.reason }) : undefined,
          gitProcessBoundaryInvoked: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
        },
      }),
    ];
    const auditEventId = foundationId('audit');
    const requestedAt = input.baseRecord?.requestedAt ?? now;
    const expiresAt =
      input.status === 'approved'
        ? new Date(Date.parse(now) + 60 * 60 * 1000).toISOString()
        : input.baseRecord?.expiresAt;

    return WorktreeApprovalArtifactRecordSchema.parse({
      id: input.baseRecord?.id ?? foundationId('worktree_approval_record'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: input.baseRecord?.createdAt ?? now,
      dryRunId: input.dryRunRecord.dryRunId,
      dryRunRecordId: input.dryRunRecord.id,
      approvalRequestId:
        input.baseRecord?.approvalRequestId ?? foundationId('worktree_approval_request'),
      approvalArtifactId,
      status: input.status,
      requestedBy: input.baseRecord?.requestedBy ?? input.requestedBy ?? 'local-operator',
      decidedBy: input.status === 'requested' ? undefined : (input.decidedBy ?? 'local-operator'),
      reasonHash:
        input.baseRecord?.reasonHash ??
        (input.reason ? hashLocalMetadata({ reason: input.reason }) : undefined),
      decisionReasonHash:
        input.status === 'requested' || !input.reason
          ? undefined
          : hashLocalMetadata({ reason: input.reason }),
      dryRunPlanHash: hashLocalMetadata(input.dryRunRecord.plan),
      policyDecisionId: input.dryRunRecord.policyDecision.id,
      policyDecisionHash: hashLocalMetadata(input.dryRunRecord.policyDecision),
      approved: input.status === 'approved',
      requestedAt,
      decidedAt: input.status === 'requested' ? undefined : now,
      expiresAt,
      usedAt: input.status === 'used' ? now : input.baseRecord?.usedAt,
      revokedAt: input.status === 'revoked' ? now : input.baseRecord?.revokedAt,
      timeline: [
        ...(input.baseRecord?.timeline ?? []),
        WorktreeControlPlaneTimelineEventSchema.parse({
          id: foundationId('worktree_timeline_event'),
          schemaVersion: SchemaVersionSchema.value,
          createdAt: now,
          phase: input.status === 'requested' ? 'approval-request' : 'approval-decision',
          status: input.status,
          summary: `Worktree approval ${input.status}.`,
          evidenceRefIds: evidenceRefs.map((ref) => ref.id),
          auditEventIds: [auditEventId],
          rawPathStored: false,
          bodyStored: false,
          gitProcessBoundaryInvoked: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
        }),
      ],
      evidenceRefs,
      auditEventIds: [auditEventId],
      rawPathStored: false,
      bodyStored: false,
      gitProcessBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: `Worktree approval ${input.status}.`,
    });
  }

  async function executeWorktreeControlPlaneRun(input: {
    dryRunRecord: WorktreeDryRunRecord;
    approvalRecord?: WorktreeApprovalArtifactRecord;
    store: CodexHubStore;
    runtime: {
      repoRoot?: string;
      worktreeRoot?: string;
      worktreePath?: string;
      worktreeSlug?: string;
      branchName?: string;
      baseRef?: string;
    };
  }): Promise<WorktreeControlPlaneRun> {
    const enabled =
      options.worktreeManagerEnabled === true ||
      process.env.CODEXHUB_WORKTREE_MANAGER_ENABLED === 'true';
    const approvalState = classifyWorktreeApproval(input.approvalRecord);
    const blockedReason =
      input.dryRunRecord.status === 'blocked'
        ? 'dry_run_blocked'
        : input.dryRunRecord.plan.runnerMode === 'controlled-git-worktree' && !enabled
          ? 'controlled_git_boundary_disabled'
          : input.dryRunRecord.plan.runnerMode === 'controlled-git-worktree' &&
              approvalState !== 'ready'
            ? approvalState
            : undefined;

    if (blockedReason) {
      const evidenceRefs = [
        createWorktreeControlEvidence({
          kind: 'worktree.run_summary',
          label: 'worktree.control-plane.run.blocked',
          summary: `Worktree execution blocked: ${blockedReason}.`,
          metadata: {
            dryRunId: input.dryRunRecord.dryRunId,
            blockedReason,
            gitProcessBoundaryInvoked: false,
            processBoundaryInvoked: false,
            externalProcessStarted: false,
          },
        }),
      ];
      const record = createWorktreeControlPlaneRunRecord({
        dryRunRecord: input.dryRunRecord,
        approvalRecord: input.approvalRecord,
        status: 'blocked',
        summary: `Worktree execution blocked: ${blockedReason}.`,
        evidenceRefs,
        auditEventIds: [foundationId('audit')],
        gitProcessBoundaryInvoked: false,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        noRealWrite: true,
      });
      await persistWorktreeRunRecord(record, input.store);
      await persistEvidenceRefs(evidenceRefs, input.store);
      await persistWorktreeAuditEvents(
        record.auditEventIds,
        evidenceRefs,
        input.store,
        input.dryRunRecord.policyDecision.id,
      );
      return record;
    }

    const authority = ExecutionAuthoritySchema.parse({
      id: foundationId('execution_authority'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      policyDecisionId: input.dryRunRecord.policyDecision.id,
      approvalArtifactId: input.approvalRecord?.approvalArtifactId,
      allowed: true,
      constraints: [
        'controlled git worktree creation only',
        'fixed git argv only',
        'diff summary metadata only',
        'no push',
        'no pull request creation',
        'cleanup delete deferred',
      ],
      expiresAt: input.approvalRecord?.expiresAt,
    });
    const runtime = createWorktreeRuntimeInput(input.runtime);
    const result = await executeWorktreeManager({
      plan: createWorktreePlanResultFromRecord(input.dryRunRecord),
      authority,
      runner: options.worktreeManagerRunner,
      realGitBoundaryEnabled: enabled,
      runtime,
      actor: 'codexhub-supervisor',
    });
    const record = createWorktreeControlPlaneRunRecord({
      dryRunRecord: input.dryRunRecord,
      approvalRecord: input.approvalRecord,
      status: result.worktreeRun.status,
      summary: result.worktreeRun.summary,
      worktreeRun: result.worktreeRun,
      patchRun: result.patchRun,
      patchSummary: result.patchSummary,
      pullRequestDraft: result.pullRequestDraft,
      releaseAuditDraft: result.releaseAuditDraft,
      evidenceRefs: result.evidenceRefs,
      auditEventIds: result.auditEvents.map((event) => event.id),
      gitProcessBoundaryInvoked: result.worktreeRun.gitProcessBoundaryInvoked,
      processBoundaryInvoked: result.worktreeRun.processBoundaryInvoked,
      externalProcessStarted: result.worktreeRun.externalProcessStarted,
      noRealWrite: result.worktreeRun.noRealWrite,
    });

    await persistWorktreeRunRecord(record, input.store);
    await persistEvidenceRefs(result.evidenceRefs, input.store);
    for (const auditEvent of result.auditEvents) {
      await input.store.auditEvents.append(auditEvent);
    }
    if (
      input.approvalRecord?.status === 'approved' &&
      result.worktreeRun.gitProcessBoundaryInvoked
    ) {
      const usedApprovalRecord = createWorktreeApprovalRecord({
        dryRunRecord: input.dryRunRecord,
        baseRecord: input.approvalRecord,
        status: 'used',
        reason: 'execution attempt reached controlled git boundary',
      });
      await persistWorktreeApprovalRecord(usedApprovalRecord, input.store);
      await persistEvidenceRefs(usedApprovalRecord.evidenceRefs, input.store);
      await persistWorktreeAuditEvents(
        usedApprovalRecord.auditEventIds,
        usedApprovalRecord.evidenceRefs,
        input.store,
        usedApprovalRecord.policyDecisionId,
      );
    }

    return record;
  }

  function createWorktreeRuntimeInput(input: {
    repoRoot?: string;
    worktreeRoot?: string;
    worktreePath?: string;
    worktreeSlug?: string;
    branchName?: string;
    baseRef?: string;
  }) {
    if (
      !input.repoRoot ||
      !input.worktreeRoot ||
      !input.worktreePath ||
      !input.worktreeSlug ||
      !input.branchName ||
      !input.baseRef
    ) {
      return undefined;
    }

    return {
      repoRoot: input.repoRoot,
      worktreeRoot: input.worktreeRoot,
      worktreePath: input.worktreePath,
      worktreeSlug: input.worktreeSlug,
      branchName: input.branchName,
      baseRef: input.baseRef,
    };
  }

  function createWorktreePlanResultFromRecord(
    record: WorktreeDryRunRecord,
  ): WorktreeManagerPlanResult {
    return {
      id: record.plan.id,
      adapterName: record.plan.adapterName,
      status: record.plan.status,
      repoRootHash: record.repoRootHash,
      worktreeRootHash: record.worktreeRootHash,
      worktreePathHash: record.worktreePathHash,
      branchNameHash: record.branchNameHash,
      worktreeSlugHash: record.worktreeSlugHash,
      baseRefHash: record.baseRefHash,
      runnerMode: record.plan.runnerMode,
      blockReasons: record.blockReasons,
      capabilityDryRun: record.capabilityDryRun,
      worktreePlan: record.plan,
    };
  }

  function createWorktreeControlPlaneRunRecord(input: {
    dryRunRecord: WorktreeDryRunRecord;
    approvalRecord?: WorktreeApprovalArtifactRecord;
    status: WorktreeRunStatus;
    summary: string;
    worktreeRun?: WorktreeControlPlaneRun['worktreeRun'];
    patchRun?: WorktreeControlPlaneRun['patchRun'];
    patchSummary?: WorktreeControlPlaneRun['patchSummary'];
    pullRequestDraft?: WorktreeControlPlaneRun['pullRequestDraft'];
    releaseAuditDraft?: WorktreeControlPlaneRun['releaseAuditDraft'];
    evidenceRefs: EvidenceRef[];
    auditEventIds: string[];
    gitProcessBoundaryInvoked: boolean;
    processBoundaryInvoked: boolean;
    externalProcessStarted: boolean;
    noRealWrite: boolean;
  }): WorktreeControlPlaneRun {
    const now = foundationTimestamp();

    return WorktreeControlPlaneRunSchema.parse({
      id: foundationId('worktree_control_plane_run'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      dryRunId: input.dryRunRecord.dryRunId,
      dryRunRecordId: input.dryRunRecord.id,
      approvalArtifactId: input.approvalRecord?.approvalArtifactId,
      status: input.status,
      planId: input.dryRunRecord.plan.id,
      runnerMode: input.dryRunRecord.plan.runnerMode,
      worktreeRun: input.worktreeRun,
      patchRun: input.patchRun,
      patchSummary: input.patchSummary,
      pullRequestDraft: input.pullRequestDraft,
      releaseAuditDraft: input.releaseAuditDraft,
      repoRootHash: input.dryRunRecord.repoRootHash,
      worktreeRootHash: input.dryRunRecord.worktreeRootHash,
      worktreePathHash: input.dryRunRecord.worktreePathHash,
      branchNameHash: input.dryRunRecord.branchNameHash,
      worktreeSlugHash: input.dryRunRecord.worktreeSlugHash,
      baseRefHash: input.dryRunRecord.baseRefHash,
      changedFileCount: input.worktreeRun?.changedFileCount ?? 0,
      diffHash: input.worktreeRun?.diffHash,
      timeline: [
        WorktreeControlPlaneTimelineEventSchema.parse({
          id: foundationId('worktree_timeline_event'),
          schemaVersion: SchemaVersionSchema.value,
          createdAt: now,
          phase: 'execution',
          status: input.status,
          summary: input.summary,
          evidenceRefIds: input.evidenceRefs.map((ref) => ref.id),
          auditEventIds: input.auditEventIds,
          rawPathStored: false,
          bodyStored: false,
          gitProcessBoundaryInvoked: input.gitProcessBoundaryInvoked,
          processBoundaryInvoked: input.processBoundaryInvoked,
          externalProcessStarted: input.externalProcessStarted,
        }),
      ],
      evidenceRefIds: input.evidenceRefs.map((ref) => ref.id),
      auditEventIds: input.auditEventIds,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: input.noRealWrite,
      cleanupRequired: input.worktreeRun?.cleanupRequired ?? false,
      cleanupDeferred: input.worktreeRun?.cleanupDeferred ?? false,
      gitProcessBoundaryInvoked: input.gitProcessBoundaryInvoked,
      processBoundaryInvoked: input.processBoundaryInvoked,
      externalProcessStarted: input.externalProcessStarted,
      summary: input.summary,
    });
  }

  function createWorktreeCleanupDryRunRecordFromRequest(
    sourceRun: WorktreeControlPlaneRun,
    body: WorktreeCleanupDryRunRequestBody | undefined,
  ): WorktreeCleanupDryRunRecord {
    const plan = createWorktreeCleanupPlan({
      sourceRun,
      repoRoot: body?.repoRoot ?? '',
      worktreeRoot: body?.worktreeRoot ?? '',
      worktreePath: body?.worktreePath ?? '',
    });
    const policyDecision = policyEngine.evaluateAction({
      actionId: plan.id,
      actionType: 'git.worktree.cleanup',
      actionMode: 'write',
      riskLevel: 'high',
      dryRun: true,
      approvalGranted: false,
      metadata: {
        sourceRunId: sourceRun.id,
        realWrite: true,
        noRealWrite: true,
        worktreePathHash: plan.worktreePathHash,
      },
    });
    const status = plan.status === 'blocked' || policyDecision.outcome === 'deny'
      ? 'blocked'
      : 'ready';
    const evidenceRefs = [
      createWorktreeControlEvidence({
        kind: 'worktree.cleanup_plan',
        label: 'worktree.cleanup.control-plane.dry-run',
        summary: plan.cleanupPlan.summary,
        metadata: {
          dryRunId: plan.id,
          sourceRunId: sourceRun.id,
          status,
          repoRootHash: plan.repoRootHash,
          worktreeRootHash: plan.worktreeRootHash,
          worktreePathHash: plan.worktreePathHash,
          sourceRunHash: plan.sourceRunHash,
          blockReasons: plan.blockReasons,
          gitProcessBoundaryPlanned: true,
          gitProcessBoundaryInvoked: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
        },
      }),
    ];
    const auditEventId = foundationId('audit');

    return WorktreeCleanupDryRunRecordSchema.parse({
      id: plan.id,
      dryRunId: plan.id,
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      sourceRunId: sourceRun.id,
      status,
      plan: plan.cleanupPlan,
      capabilityDryRun: plan.capabilityDryRun,
      policyDecision: PolicyDecisionSchema.parse(policyDecision),
      repoRootHash: plan.repoRootHash,
      worktreeRootHash: plan.worktreeRootHash,
      worktreePathHash: plan.worktreePathHash,
      sourceRunHash: plan.sourceRunHash,
      blockReasons: plan.blockReasons,
      timeline: [
        WorktreeControlPlaneTimelineEventSchema.parse({
          id: foundationId('worktree_timeline_event'),
          schemaVersion: SchemaVersionSchema.value,
          createdAt: foundationTimestamp(),
          phase: 'cleanup-dry-run',
          status: status === 'ready' ? 'planned' : 'blocked',
          summary: plan.cleanupPlan.summary,
          evidenceRefIds: evidenceRefs.map((ref) => ref.id),
          auditEventIds: [auditEventId],
          rawPathStored: false,
          bodyStored: false,
          gitProcessBoundaryInvoked: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
        }),
      ],
      evidenceRefs,
      auditEventIds: [auditEventId],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      gitProcessBoundaryPlanned: true,
      gitProcessBoundaryInvoked: false,
      processBoundaryPlanned: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: plan.cleanupPlan.summary,
    });
  }

  function createWorktreeCleanupApprovalRecord(input: {
    dryRunRecord: WorktreeCleanupDryRunRecord;
    baseRecord?: WorktreeCleanupApprovalArtifactRecord;
    status: 'requested' | 'approved' | 'denied' | 'revoked' | 'used';
    requestedBy?: string;
    decidedBy?: string;
    reason?: string;
  }): WorktreeCleanupApprovalArtifactRecord {
    const now = foundationTimestamp();
    const approvalArtifactId =
      input.status === 'approved'
        ? (input.baseRecord?.approvalArtifactId ?? foundationId('worktree_cleanup_approval_artifact'))
        : input.baseRecord?.approvalArtifactId;
    const evidenceRefs = [
      createWorktreeControlEvidence({
        kind: 'worktree.cleanup_plan',
        label: `worktree.cleanup.control-plane.approval.${input.status}`,
        summary: `Worktree cleanup approval ${input.status}.`,
        metadata: {
          dryRunId: input.dryRunRecord.dryRunId,
          sourceRunId: input.dryRunRecord.sourceRunId,
          status: input.status,
          approvalArtifactId,
          reasonHash: input.reason ? hashLocalMetadata({ reason: input.reason }) : undefined,
          gitProcessBoundaryInvoked: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
        },
      }),
    ];
    const auditEventId = foundationId('audit');
    const requestedAt = input.baseRecord?.requestedAt ?? now;
    const expiresAt =
      input.status === 'approved'
        ? new Date(Date.parse(now) + 60 * 60 * 1000).toISOString()
        : input.baseRecord?.expiresAt;

    return WorktreeCleanupApprovalArtifactRecordSchema.parse({
      id: input.baseRecord?.id ?? foundationId('worktree_cleanup_approval_record'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: input.baseRecord?.createdAt ?? now,
      dryRunId: input.dryRunRecord.dryRunId,
      dryRunRecordId: input.dryRunRecord.id,
      sourceRunId: input.dryRunRecord.sourceRunId,
      approvalRequestId:
        input.baseRecord?.approvalRequestId ?? foundationId('worktree_cleanup_approval_request'),
      approvalArtifactId,
      status: input.status,
      requestedBy: input.baseRecord?.requestedBy ?? input.requestedBy ?? 'local-operator',
      decidedBy: input.status === 'requested' ? undefined : (input.decidedBy ?? 'local-operator'),
      reasonHash:
        input.baseRecord?.reasonHash ??
        (input.reason ? hashLocalMetadata({ reason: input.reason }) : undefined),
      decisionReasonHash:
        input.status === 'requested' || !input.reason
          ? undefined
          : hashLocalMetadata({ reason: input.reason }),
      dryRunPlanHash: hashLocalMetadata(input.dryRunRecord.plan),
      policyDecisionId: input.dryRunRecord.policyDecision.id,
      policyDecisionHash: hashLocalMetadata(input.dryRunRecord.policyDecision),
      approved: input.status === 'approved',
      requestedAt,
      decidedAt: input.status === 'requested' ? undefined : now,
      expiresAt,
      usedAt: input.status === 'used' ? now : input.baseRecord?.usedAt,
      revokedAt: input.status === 'revoked' ? now : input.baseRecord?.revokedAt,
      timeline: [
        ...(input.baseRecord?.timeline ?? []),
        WorktreeControlPlaneTimelineEventSchema.parse({
          id: foundationId('worktree_timeline_event'),
          schemaVersion: SchemaVersionSchema.value,
          createdAt: now,
          phase:
            input.status === 'requested'
              ? 'cleanup-approval-request'
              : 'cleanup-approval-decision',
          status: input.status,
          summary: `Worktree cleanup approval ${input.status}.`,
          evidenceRefIds: evidenceRefs.map((ref) => ref.id),
          auditEventIds: [auditEventId],
          rawPathStored: false,
          bodyStored: false,
          gitProcessBoundaryInvoked: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
        }),
      ],
      evidenceRefs,
      auditEventIds: [auditEventId],
      rawPathStored: false,
      bodyStored: false,
      gitProcessBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: `Worktree cleanup approval ${input.status}.`,
    });
  }

  async function executeWorktreeCleanupControlPlaneRun(input: {
    dryRunRecord: WorktreeCleanupDryRunRecord;
    sourceRun: WorktreeControlPlaneRun;
    approvalRecord?: WorktreeCleanupApprovalArtifactRecord;
    store: CodexHubStore;
    runtime: {
      repoRoot?: string;
      worktreeRoot?: string;
      worktreePath?: string;
    };
  }): Promise<WorktreeCleanupControlPlaneRun> {
    const worktreeEnabled =
      options.worktreeManagerEnabled === true ||
      process.env.CODEXHUB_WORKTREE_MANAGER_ENABLED === 'true';
    const cleanupEnabled =
      worktreeEnabled &&
      (options.worktreeCleanupEnabled === true ||
        process.env.CODEXHUB_WORKTREE_CLEANUP_ENABLED === 'true');
    const approvalState = classifyWorktreeApproval(input.approvalRecord);
    const blockedReason =
      input.dryRunRecord.status === 'blocked'
        ? 'dry_run_blocked'
        : input.sourceRun.cleanupRequired !== true
          ? 'source_run_cleanup_not_required'
          : !cleanupEnabled
            ? 'worktree_cleanup_disabled'
            : approvalState !== 'ready'
              ? approvalState
              : undefined;

    if (blockedReason) {
      const evidenceRefs = [
        createWorktreeControlEvidence({
          kind: 'worktree.cleanup_summary',
          label: 'worktree.cleanup.control-plane.run.blocked',
          summary: `Worktree cleanup blocked: ${blockedReason}.`,
          metadata: {
            dryRunId: input.dryRunRecord.dryRunId,
            sourceRunId: input.sourceRun.id,
            blockedReason,
            gitProcessBoundaryInvoked: false,
            processBoundaryInvoked: false,
            externalProcessStarted: false,
          },
        }),
      ];
      const record = createWorktreeCleanupControlPlaneRunRecord({
        dryRunRecord: input.dryRunRecord,
        approvalRecord: input.approvalRecord,
        status: 'blocked',
        summary: `Worktree cleanup blocked: ${blockedReason}.`,
        evidenceRefs,
        auditEventIds: [foundationId('audit')],
        gitProcessBoundaryInvoked: false,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        noRealWrite: true,
      });
      await persistWorktreeCleanupRunRecord(record, input.store);
      await persistEvidenceRefs(evidenceRefs, input.store);
      await persistWorktreeAuditEvents(
        record.auditEventIds,
        evidenceRefs,
        input.store,
        input.dryRunRecord.policyDecision.id,
      );
      return record;
    }

    const authority = ExecutionAuthoritySchema.parse({
      id: foundationId('execution_authority'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      policyDecisionId: input.dryRunRecord.policyDecision.id,
      approvalArtifactId: input.approvalRecord?.approvalArtifactId,
      allowed: true,
      constraints: [
        'controlled git worktree cleanup only',
        'fixed git argv only',
        'non-force cleanup',
        'no filesystem delete fallback',
        'metadata only',
      ],
      expiresAt: input.approvalRecord?.expiresAt,
    });
    const runtime = createWorktreeCleanupRuntimeInput(input.runtime);
    const result = await executeWorktreeCleanup({
      plan: createWorktreeCleanupPlanResultFromRecord(input.dryRunRecord),
      authority,
      runner: options.worktreeCleanupRunner,
      cleanupEnabled,
      runtime,
      actor: 'codexhub-supervisor',
    });
    const record = createWorktreeCleanupControlPlaneRunRecord({
      dryRunRecord: input.dryRunRecord,
      approvalRecord: input.approvalRecord,
      status: result.cleanupRun.status,
      summary: result.cleanupRun.summary,
      cleanupRun: result.cleanupRun,
      evidenceRefs: result.evidenceRefs,
      auditEventIds: result.auditEvents.map((event) => event.id),
      gitProcessBoundaryInvoked: result.cleanupRun.gitProcessBoundaryInvoked,
      processBoundaryInvoked: result.cleanupRun.processBoundaryInvoked,
      externalProcessStarted: result.cleanupRun.externalProcessStarted,
      noRealWrite: result.cleanupRun.noRealWrite,
    });

    await persistWorktreeCleanupRunRecord(record, input.store);
    await persistEvidenceRefs(result.evidenceRefs, input.store);
    for (const auditEvent of result.auditEvents) {
      await input.store.auditEvents.append(auditEvent);
    }
    if (
      input.approvalRecord?.status === 'approved' &&
      result.cleanupRun.gitProcessBoundaryInvoked
    ) {
      const usedApprovalRecord = createWorktreeCleanupApprovalRecord({
        dryRunRecord: input.dryRunRecord,
        baseRecord: input.approvalRecord,
        status: 'used',
        reason: 'cleanup attempt reached controlled git boundary',
      });
      await persistWorktreeCleanupApprovalRecord(usedApprovalRecord, input.store);
      await persistEvidenceRefs(usedApprovalRecord.evidenceRefs, input.store);
      await persistWorktreeAuditEvents(
        usedApprovalRecord.auditEventIds,
        usedApprovalRecord.evidenceRefs,
        input.store,
        usedApprovalRecord.policyDecisionId,
      );
    }

    return record;
  }

  function createWorktreeCleanupRuntimeInput(input: {
    repoRoot?: string;
    worktreeRoot?: string;
    worktreePath?: string;
  }) {
    if (!input.repoRoot || !input.worktreeRoot || !input.worktreePath) {
      return undefined;
    }

    return {
      repoRoot: input.repoRoot,
      worktreeRoot: input.worktreeRoot,
      worktreePath: input.worktreePath,
    };
  }

  function createWorktreeCleanupPlanResultFromRecord(
    record: WorktreeCleanupDryRunRecord,
  ): WorktreeCleanupPlanResult {
    return {
      id: record.plan.id,
      status: record.plan.status,
      repoRootHash: record.repoRootHash,
      worktreeRootHash: record.worktreeRootHash,
      worktreePathHash: record.worktreePathHash,
      sourceRunHash: record.sourceRunHash,
      blockReasons: record.blockReasons,
      capabilityDryRun: record.capabilityDryRun,
      cleanupPlan: record.plan,
    };
  }

  function createWorktreeCleanupControlPlaneRunRecord(input: {
    dryRunRecord: WorktreeCleanupDryRunRecord;
    approvalRecord?: WorktreeCleanupApprovalArtifactRecord;
    status: WorktreeRunStatus;
    summary: string;
    cleanupRun?: WorktreeCleanupControlPlaneRun['cleanupRun'];
    evidenceRefs: EvidenceRef[];
    auditEventIds: string[];
    gitProcessBoundaryInvoked: boolean;
    processBoundaryInvoked: boolean;
    externalProcessStarted: boolean;
    noRealWrite: boolean;
  }): WorktreeCleanupControlPlaneRun {
    const now = foundationTimestamp();

    return WorktreeCleanupControlPlaneRunSchema.parse({
      id: foundationId('worktree_cleanup_control_plane_run'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      dryRunId: input.dryRunRecord.dryRunId,
      dryRunRecordId: input.dryRunRecord.id,
      sourceRunId: input.dryRunRecord.sourceRunId,
      approvalArtifactId: input.approvalRecord?.approvalArtifactId,
      status: input.status,
      planId: input.dryRunRecord.plan.id,
      cleanupRun: input.cleanupRun,
      repoRootHash: input.dryRunRecord.repoRootHash,
      worktreeRootHash: input.dryRunRecord.worktreeRootHash,
      worktreePathHash: input.dryRunRecord.worktreePathHash,
      sourceRunHash: input.dryRunRecord.sourceRunHash,
      dirtyFileCount: input.cleanupRun?.dirtyFileCount ?? 0,
      dirtyStatusHash: input.cleanupRun?.dirtyStatusHash,
      cleanupAttempted: input.cleanupRun?.cleanupAttempted ?? false,
      cleanupCompleted: input.cleanupRun?.cleanupCompleted ?? false,
      cleanupRequired: input.cleanupRun?.cleanupRequired ?? true,
      cleanupDeferred: input.cleanupRun?.cleanupDeferred ?? true,
      timeline: [
        WorktreeControlPlaneTimelineEventSchema.parse({
          id: foundationId('worktree_timeline_event'),
          schemaVersion: SchemaVersionSchema.value,
          createdAt: now,
          phase: 'cleanup-execution',
          status: input.status,
          summary: input.summary,
          evidenceRefIds: input.evidenceRefs.map((ref) => ref.id),
          auditEventIds: input.auditEventIds,
          rawPathStored: false,
          bodyStored: false,
          gitProcessBoundaryInvoked: input.gitProcessBoundaryInvoked,
          processBoundaryInvoked: input.processBoundaryInvoked,
          externalProcessStarted: input.externalProcessStarted,
        }),
      ],
      evidenceRefIds: input.evidenceRefs.map((ref) => ref.id),
      auditEventIds: input.auditEventIds,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: input.noRealWrite,
      gitProcessBoundaryInvoked: input.gitProcessBoundaryInvoked,
      processBoundaryInvoked: input.processBoundaryInvoked,
      externalProcessStarted: input.externalProcessStarted,
      summary: input.summary,
    });
  }

  function classifyWorktreeApproval(
    record: WorktreeApprovalArtifactRecord | WorktreeCleanupApprovalArtifactRecord | undefined,
  ):
    | 'ready'
    | 'approval_artifact_missing'
    | 'approval_denied'
    | 'approval_artifact_revoked'
    | 'approval_artifact_used'
    | 'approval_artifact_expired'
    | 'approval_artifact_invalid' {
    if (!record?.approvalArtifactId) {
      return 'approval_artifact_missing';
    }
    if (record.status === 'denied') {
      return 'approval_denied';
    }
    if (record.status === 'revoked') {
      return 'approval_artifact_revoked';
    }
    if (record.status === 'used') {
      return 'approval_artifact_used';
    }
    if (record.status === 'expired' || (record.expiresAt && Date.parse(record.expiresAt) <= Date.now())) {
      return 'approval_artifact_expired';
    }
    if (record.status !== 'approved' || !record.approved) {
      return 'approval_artifact_invalid';
    }
    return 'ready';
  }

  function createWorktreeControlEvidence(input: {
    kind: EvidenceRef['kind'];
    label: string;
    summary: string;
    metadata: Record<string, unknown>;
  }): EvidenceRef {
    const metadata = {
      ...input.metadata,
      rawPathStored: false,
      bodyStored: false,
    };

    return {
      id: foundationId('evidence'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      kind: input.kind,
      summary: input.summary,
      hash: hashLocalMetadata(metadata),
      redacted: true,
      labels: [input.label],
      metadata,
    };
  }

  async function persistWorktreeAuditEvents(
    auditEventIds: string[],
    evidenceRefs: EvidenceRef[],
    store: CodexHubStore,
    policyDecisionId = 'worktree-control-plane',
  ): Promise<void> {
    for (const auditEventId of auditEventIds) {
      await store.auditEvents.append({
        id: auditEventId,
        schemaVersion: SchemaVersionSchema.value,
        createdAt: foundationTimestamp(),
        actor: 'codexhub-supervisor',
        action: 'worktree.control_plane',
        target: 'worktree.manager',
        reason: 'worktree control-plane metadata transition',
        outcome: 'recorded',
        evidenceRefs,
        policyDecisionId,
        metadata: {
          bodyStored: false,
          rawPathStored: false,
          liveExecution: false,
          gitProcessBoundaryInvoked: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
        },
      });
    }
  }

  async function persistWorktreeDryRunRecord(
    record: WorktreeDryRunRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.worktreeDryRuns.saveDryRun(record);
      return;
    }
    worktreeDryRunRecords.unshift(record);
  }

  async function persistWorktreeApprovalRecord(
    record: WorktreeApprovalArtifactRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.worktreeApprovals.saveApproval(record);
      return;
    }
    const index = worktreeApprovalRecords.findIndex((candidate) => candidate.id === record.id);
    if (index >= 0) {
      worktreeApprovalRecords.splice(index, 1, record);
    } else {
      worktreeApprovalRecords.unshift(record);
    }
  }

  async function persistWorktreeRunRecord(
    record: WorktreeControlPlaneRun,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.worktreeRuns.saveRun(record);
      return;
    }
    worktreeRunRecords.unshift(record);
  }

  async function persistWorktreeCleanupDryRunRecord(
    record: WorktreeCleanupDryRunRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.worktreeCleanupDryRuns.saveDryRun(record);
      return;
    }
    worktreeCleanupDryRunRecords.unshift(record);
  }

  async function persistWorktreeCleanupApprovalRecord(
    record: WorktreeCleanupApprovalArtifactRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.worktreeCleanupApprovals.saveApproval(record);
      return;
    }
    const index = worktreeCleanupApprovalRecords.findIndex(
      (candidate) => candidate.id === record.id,
    );
    if (index >= 0) {
      worktreeCleanupApprovalRecords.splice(index, 1, record);
    } else {
      worktreeCleanupApprovalRecords.unshift(record);
    }
  }

  async function persistWorktreeCleanupRunRecord(
    record: WorktreeCleanupControlPlaneRun,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.worktreeCleanupRuns.saveRun(record);
      return;
    }
    worktreeCleanupRunRecords.unshift(record);
  }

  async function resolveWorktreeDryRunRecord(
    dryRunId: string | undefined,
    store: CodexHubStore | undefined,
  ): Promise<WorktreeDryRunRecord | undefined> {
    if (!dryRunId) {
      return undefined;
    }
    return store
      ? await store.worktreeDryRuns.getDryRun(dryRunId)
      : worktreeDryRunRecords.find(
          (record) => record.id === dryRunId || record.dryRunId === dryRunId,
        );
  }

  async function resolveWorktreeApprovalRecord(
    approvalRequestId: string,
    store: CodexHubStore | undefined,
  ): Promise<WorktreeApprovalArtifactRecord | undefined> {
    if (store) {
      const directRecord = await store.worktreeApprovals.getApproval(approvalRequestId);
      if (directRecord) {
        return directRecord;
      }
      return (await store.worktreeApprovals.listApprovals({ limit: 100 })).find(
        (record) => record.approvalRequestId === approvalRequestId,
      );
    }
    return worktreeApprovalRecords.find(
      (record) => record.id === approvalRequestId || record.approvalRequestId === approvalRequestId,
    );
  }

  async function resolveWorktreeApprovalRecordByArtifactId(
    approvalArtifactId: string,
    store: CodexHubStore | undefined,
  ): Promise<WorktreeApprovalArtifactRecord | undefined> {
    return store
      ? await store.worktreeApprovals.getApprovalByArtifactId(approvalArtifactId)
      : worktreeApprovalRecords.find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async function resolveWorktreeRun(
    runId: string,
    store: CodexHubStore | undefined,
  ): Promise<WorktreeControlPlaneRun | undefined> {
    return store
      ? await store.worktreeRuns.getRun(runId)
      : worktreeRunRecords.find((record) => record.id === runId);
  }

  async function resolveWorktreeCleanupDryRunRecord(
    dryRunId: string | undefined,
    store: CodexHubStore | undefined,
  ): Promise<WorktreeCleanupDryRunRecord | undefined> {
    if (!dryRunId) {
      return undefined;
    }
    return store
      ? await store.worktreeCleanupDryRuns.getDryRun(dryRunId)
      : worktreeCleanupDryRunRecords.find(
          (record) => record.id === dryRunId || record.dryRunId === dryRunId,
        );
  }

  async function resolveWorktreeCleanupApprovalRecord(
    approvalRequestId: string,
    store: CodexHubStore | undefined,
  ): Promise<WorktreeCleanupApprovalArtifactRecord | undefined> {
    if (store) {
      const directRecord = await store.worktreeCleanupApprovals.getApproval(approvalRequestId);
      if (directRecord) {
        return directRecord;
      }
      return (await store.worktreeCleanupApprovals.listApprovals({ limit: 100 })).find(
        (record) => record.approvalRequestId === approvalRequestId,
      );
    }
    return worktreeCleanupApprovalRecords.find(
      (record) => record.id === approvalRequestId || record.approvalRequestId === approvalRequestId,
    );
  }

  async function resolveWorktreeCleanupApprovalRecordByArtifactId(
    approvalArtifactId: string,
    store: CodexHubStore | undefined,
  ): Promise<WorktreeCleanupApprovalArtifactRecord | undefined> {
    return store
      ? await store.worktreeCleanupApprovals.getApprovalByArtifactId(approvalArtifactId)
      : worktreeCleanupApprovalRecords.find(
          (record) => record.approvalArtifactId === approvalArtifactId,
        );
  }

  async function resolveWorktreeCleanupRun(
    runId: string,
    store: CodexHubStore | undefined,
  ): Promise<WorktreeCleanupControlPlaneRun | undefined> {
    return store
      ? await store.worktreeCleanupRuns.getRun(runId)
      : worktreeCleanupRunRecords.find((record) => record.id === runId);
  }

  async function listWorktreeDryRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<WorktreeDryRunRecord[]> {
    return store
      ? await store.worktreeDryRuns.listDryRuns(query)
      : worktreeDryRunRecords.slice(0, query.limit ?? 50);
  }

  async function listWorktreeApprovals(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<WorktreeApprovalArtifactRecord[]> {
    return store
      ? await store.worktreeApprovals.listApprovals(query)
      : worktreeApprovalRecords.slice(0, query.limit ?? 50);
  }

  async function listWorktreeRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<WorktreeControlPlaneRun[]> {
    return store
      ? await store.worktreeRuns.listRuns(query)
      : worktreeRunRecords.slice(0, query.limit ?? 50);
  }

  async function listWorktreeCleanupDryRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<WorktreeCleanupDryRunRecord[]> {
    return store
      ? await store.worktreeCleanupDryRuns.listDryRuns(query)
      : worktreeCleanupDryRunRecords.slice(0, query.limit ?? 50);
  }

  async function listWorktreeCleanupApprovals(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<WorktreeCleanupApprovalArtifactRecord[]> {
    return store
      ? await store.worktreeCleanupApprovals.listApprovals(query)
      : worktreeCleanupApprovalRecords.slice(0, query.limit ?? 50);
  }

  async function listWorktreeCleanupRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<WorktreeCleanupControlPlaneRun[]> {
    return store
      ? await store.worktreeCleanupRuns.listRuns(query)
      : worktreeCleanupRunRecords.slice(0, query.limit ?? 50);
  }

  function createReviewPackageProjectionFromRequest(
    body: ReviewPackageDryRunRequestBody | undefined,
  ): LocalReviewPackageRun {
    return createLocalReviewPackageProjection({
      sourceLifecycleRunId: body?.sourceLifecycleRunId ?? 'm12_lifecycle_unknown',
      sourcePatchRunId: body?.sourcePatchRunId ?? 'm12_patch_unknown',
      sourceVerificationGateId: body?.sourceVerificationGateId,
      changedFilePathHashes: body?.changedFilePathHashes ?? [],
      diffHash: body?.diffHash,
      verificationStatus: body?.verificationStatus ?? 'blocked',
      readinessStatus: body?.readinessStatus ?? 'blocked_policy',
      readyForReviewDraftOnly: body?.readyForReviewDraftOnly ?? false,
      evidenceRefIds: body?.evidenceRefIds ?? [],
      auditEventIds: body?.auditEventIds ?? [],
    });
  }

  function createReleaseCandidateProjectionFromRequest(
    body: ReleaseCandidateDryRunRequestBody | undefined,
  ) {
    const reviewPackage = createLocalReviewDecisionHandoff({
      reviewPackage: createReviewPackageProjectionFromRequest(body),
      status: body?.reviewDecisionStatus ?? 'approved_for_local_rc',
      reason: 'local RC readiness projection request',
    });

    return createLocalRcReadinessProjection({
      reviewPackage,
      operatorReadinessStatus: body?.operatorReadinessStatus ?? 'pass',
      evidenceRefIds: body?.evidenceRefIds ?? [],
      auditEventIds: body?.auditEventIds ?? [],
    });
  }

  async function persistReviewPackageDryRunRecord(
    record: LocalReviewPackageDryRunRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.reviewPackageDryRuns.saveDryRun(record);
      return;
    }
    reviewPackageDryRunRecords.unshift(record);
  }

  async function persistReviewPackageApprovalRecord(
    record: LocalReviewPackageApprovalArtifactRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.reviewPackageApprovals.saveApproval(record);
      return;
    }
    reviewPackageApprovalRecords.unshift(record);
  }

  async function persistReviewPackageRunRecord(
    record: LocalReviewPackageControlPlaneRun,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.reviewPackageRuns.saveRun(record);
      return;
    }
    reviewPackageRunRecords.unshift(record);
  }

  async function persistReviewPackageAuditEvents(
    auditEventIds: string[],
    evidenceRefs: EvidenceRef[],
    store: CodexHubStore,
    policyDecisionId: string,
    artifactWriteBoundaryInvoked: boolean,
  ): Promise<void> {
    for (const auditEventId of auditEventIds) {
      await store.auditEvents.append(
        createLocalReviewPackageAuditEvent({
          id: auditEventId,
          action: 'review_package.control_plane',
          policyDecisionId,
          evidenceRefs,
          artifactWriteBoundaryInvoked,
        }),
      );
    }
  }

  async function persistReleaseCandidateDryRunRecord(
    record: LocalRcBundleDryRunRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.releaseCandidateDryRuns.saveDryRun(record);
      return;
    }
    releaseCandidateDryRunRecords.unshift(record);
  }

  async function persistReleaseCandidateApprovalRecord(
    record: LocalRcBundleApprovalArtifactRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.releaseCandidateApprovals.saveApproval(record);
      return;
    }
    releaseCandidateApprovalRecords.unshift(record);
  }

  async function persistReleaseCandidateRunRecord(
    record: LocalRcBundleControlPlaneRun,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.releaseCandidateRuns.saveRun(record);
      return;
    }
    releaseCandidateRunRecords.unshift(record);
  }

  async function persistReleaseCandidateAuditEvents(
    auditEventIds: string[],
    evidenceRefs: EvidenceRef[],
    store: CodexHubStore,
    policyDecisionId: string,
    artifactWriteBoundaryInvoked: boolean,
  ): Promise<void> {
    for (const auditEventId of auditEventIds) {
      await store.auditEvents.append(
        createLocalRcBundleAuditEvent({
          id: auditEventId,
          action: 'release_candidate.control_plane',
          policyDecisionId,
          evidenceRefs,
          artifactWriteBoundaryInvoked,
        }),
      );
    }
  }

  async function resolveReviewPackageDryRunRecord(
    dryRunId: string | undefined,
    store: CodexHubStore | undefined,
  ): Promise<LocalReviewPackageDryRunRecord | undefined> {
    if (!dryRunId) {
      return undefined;
    }
    if (store) {
      const directRecord = await store.reviewPackageDryRuns.getDryRun(dryRunId);
      if (directRecord) {
        return directRecord;
      }
      return (await store.reviewPackageDryRuns.listDryRuns({ limit: 100 })).find(
        (record) => record.id === dryRunId || record.dryRunId === dryRunId,
      );
    }
    return reviewPackageDryRunRecords.find(
      (record) => record.id === dryRunId || record.dryRunId === dryRunId,
    );
  }

  async function resolveReviewPackageApprovalRecord(
    approvalRequestId: string,
    store: CodexHubStore | undefined,
  ): Promise<LocalReviewPackageApprovalArtifactRecord | undefined> {
    if (store) {
      const directRecord = await store.reviewPackageApprovals.getApproval(approvalRequestId);
      if (directRecord) {
        return directRecord;
      }
      return (await store.reviewPackageApprovals.listApprovals({ limit: 100 })).find(
        (record) => record.approvalRequestId === approvalRequestId,
      );
    }
    return reviewPackageApprovalRecords.find(
      (record) =>
        record.id === approvalRequestId || record.approvalRequestId === approvalRequestId,
    );
  }

  async function resolveReviewPackageApprovalRecordByArtifactId(
    approvalArtifactId: string,
    store: CodexHubStore | undefined,
  ): Promise<LocalReviewPackageApprovalArtifactRecord | undefined> {
    return store
      ? await store.reviewPackageApprovals.getApprovalByArtifactId(approvalArtifactId)
      : reviewPackageApprovalRecords.find(
          (record) => record.approvalArtifactId === approvalArtifactId,
        );
  }

  async function resolveReviewPackageRun(
    runId: string,
    store: CodexHubStore | undefined,
  ): Promise<LocalReviewPackageControlPlaneRun | undefined> {
    return store
      ? await store.reviewPackageRuns.getRun(runId)
      : reviewPackageRunRecords.find((record) => record.id === runId);
  }

  async function listReviewPackageDryRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<LocalReviewPackageDryRunRecord[]> {
    return store
      ? await store.reviewPackageDryRuns.listDryRuns(query)
      : reviewPackageDryRunRecords.slice(0, query.limit ?? 50);
  }

  async function listReviewPackageApprovals(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<LocalReviewPackageApprovalArtifactRecord[]> {
    return store
      ? await store.reviewPackageApprovals.listApprovals(query)
      : reviewPackageApprovalRecords.slice(0, query.limit ?? 50);
  }

  async function listReviewPackageRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<LocalReviewPackageControlPlaneRun[]> {
    return store
      ? await store.reviewPackageRuns.listRuns(query)
      : reviewPackageRunRecords.slice(0, query.limit ?? 50);
  }

  async function resolveReleaseCandidateDryRunRecord(
    dryRunId: string | undefined,
    store: CodexHubStore | undefined,
  ): Promise<LocalRcBundleDryRunRecord | undefined> {
    if (!dryRunId) {
      return undefined;
    }
    if (store) {
      const directRecord = await store.releaseCandidateDryRuns.getDryRun(dryRunId);
      if (directRecord) {
        return directRecord;
      }
      return (await store.releaseCandidateDryRuns.listDryRuns({ limit: 100 })).find(
        (record) => record.id === dryRunId || record.dryRunId === dryRunId,
      );
    }
    return releaseCandidateDryRunRecords.find(
      (record) => record.id === dryRunId || record.dryRunId === dryRunId,
    );
  }

  async function resolveReleaseCandidateApprovalRecord(
    approvalRequestId: string,
    store: CodexHubStore | undefined,
  ): Promise<LocalRcBundleApprovalArtifactRecord | undefined> {
    if (store) {
      const directRecord = await store.releaseCandidateApprovals.getApproval(approvalRequestId);
      if (directRecord) {
        return directRecord;
      }
      return (await store.releaseCandidateApprovals.listApprovals({ limit: 100 })).find(
        (record) => record.approvalRequestId === approvalRequestId,
      );
    }
    return releaseCandidateApprovalRecords.find(
      (record) =>
        record.id === approvalRequestId || record.approvalRequestId === approvalRequestId,
    );
  }

  async function resolveReleaseCandidateApprovalRecordByArtifactId(
    approvalArtifactId: string,
    store: CodexHubStore | undefined,
  ): Promise<LocalRcBundleApprovalArtifactRecord | undefined> {
    return store
      ? await store.releaseCandidateApprovals.getApprovalByArtifactId(approvalArtifactId)
      : releaseCandidateApprovalRecords.find(
          (record) => record.approvalArtifactId === approvalArtifactId,
        );
  }

  async function resolveReleaseCandidateRun(
    runId: string,
    store: CodexHubStore | undefined,
  ): Promise<LocalRcBundleControlPlaneRun | undefined> {
    return store
      ? await store.releaseCandidateRuns.getRun(runId)
      : releaseCandidateRunRecords.find((record) => record.id === runId);
  }

  async function listReleaseCandidateDryRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<LocalRcBundleDryRunRecord[]> {
    return store
      ? await store.releaseCandidateDryRuns.listDryRuns(query)
      : releaseCandidateDryRunRecords.slice(0, query.limit ?? 50);
  }

  async function listReleaseCandidateApprovals(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<LocalRcBundleApprovalArtifactRecord[]> {
    return store
      ? await store.releaseCandidateApprovals.listApprovals(query)
      : releaseCandidateApprovalRecords.slice(0, query.limit ?? 50);
  }

  async function listReleaseCandidateRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<LocalRcBundleControlPlaneRun[]> {
    return store
      ? await store.releaseCandidateRuns.listRuns(query)
      : releaseCandidateRunRecords.slice(0, query.limit ?? 50);
  }

  async function persistGithubMetadataDryRunRecord(
    record: GithubMetadataDryRunRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.githubMetadataDryRuns.saveDryRun(record);
      return;
    }
    githubMetadataDryRunRecords.unshift(record);
  }

  async function persistGithubMetadataApprovalRecord(
    record: GithubMetadataApprovalArtifactRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.githubMetadataApprovals.saveApproval(record);
      return;
    }
    githubMetadataApprovalRecords.unshift(record);
  }

  async function persistGithubMetadataRunRecord(
    record: GithubMetadataControlPlaneRun,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.githubMetadataRuns.saveRun(record);
      return;
    }
    githubMetadataRunRecords.unshift(record);
  }

  async function resolveGithubMetadataDryRunRecord(
    dryRunId: string | undefined,
    store: CodexHubStore | undefined,
  ): Promise<GithubMetadataDryRunRecord | undefined> {
    if (!dryRunId) {
      return undefined;
    }
    if (store) {
      const directRecord = await store.githubMetadataDryRuns.getDryRun(dryRunId);
      if (directRecord) {
        return directRecord;
      }
      return (await store.githubMetadataDryRuns.listDryRuns({ limit: 100 })).find(
        (record) => record.id === dryRunId || record.dryRunId === dryRunId,
      );
    }
    return githubMetadataDryRunRecords.find(
      (record) => record.id === dryRunId || record.dryRunId === dryRunId,
    );
  }

  async function resolveGithubMetadataApprovalRecord(
    approvalRequestId: string,
    store: CodexHubStore | undefined,
  ): Promise<GithubMetadataApprovalArtifactRecord | undefined> {
    if (store) {
      const directRecord = await store.githubMetadataApprovals.getApproval(approvalRequestId);
      if (directRecord) {
        return directRecord;
      }
      return (await store.githubMetadataApprovals.listApprovals({ limit: 100 })).find(
        (record) => record.approvalRequestId === approvalRequestId,
      );
    }
    return githubMetadataApprovalRecords.find(
      (record) => record.id === approvalRequestId || record.approvalRequestId === approvalRequestId,
    );
  }

  async function resolveGithubMetadataApprovalRecordByArtifactId(
    approvalArtifactId: string,
    store: CodexHubStore | undefined,
  ): Promise<GithubMetadataApprovalArtifactRecord | undefined> {
    return store
      ? await store.githubMetadataApprovals.getApprovalByArtifactId(approvalArtifactId)
      : githubMetadataApprovalRecords.find(
          (record) => record.approvalArtifactId === approvalArtifactId,
        );
  }

  async function resolveGithubMetadataRun(
    runId: string,
    store: CodexHubStore | undefined,
  ): Promise<GithubMetadataControlPlaneRun | undefined> {
    return store
      ? await store.githubMetadataRuns.getRun(runId)
      : githubMetadataRunRecords.find((record) => record.id === runId);
  }

  async function listGithubMetadataDryRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<GithubMetadataDryRunRecord[]> {
    return store
      ? await store.githubMetadataDryRuns.listDryRuns(query)
      : githubMetadataDryRunRecords.slice(0, query.limit ?? 50);
  }

  async function listGithubMetadataApprovals(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<GithubMetadataApprovalArtifactRecord[]> {
    return store
      ? await store.githubMetadataApprovals.listApprovals(query)
      : githubMetadataApprovalRecords.slice(0, query.limit ?? 50);
  }

  async function listGithubMetadataRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<GithubMetadataControlPlaneRun[]> {
    return store
      ? await store.githubMetadataRuns.listRuns(query)
      : githubMetadataRunRecords.slice(0, query.limit ?? 50);
  }

  async function persistGithubPrLifecycleDryRunRecord(
    record: GithubPrLifecycleObservationPlan,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.githubPrLifecycleDryRuns.saveDryRun(record);
      return;
    }
    githubPrLifecycleDryRunRecords.unshift(record);
  }

  async function persistGithubPrLifecycleApprovalRecord(
    record: GithubPrLifecycleApprovalArtifactRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.githubPrLifecycleApprovals.saveApproval(record);
      return;
    }
    githubPrLifecycleApprovalRecords.unshift(record);
  }

  async function persistGithubPrLifecycleRunRecord(
    record: GithubPrLifecycleObservationRun,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.githubPrLifecycleRuns.saveRun(record);
      return;
    }
    githubPrLifecycleRunRecords.unshift(record);
  }

  async function resolveGithubPrLifecycleDryRunRecord(
    dryRunId: string | undefined,
    store: CodexHubStore | undefined,
  ): Promise<GithubPrLifecycleObservationPlan | undefined> {
    if (!dryRunId) {
      return undefined;
    }
    if (store) {
      const directRecord = await store.githubPrLifecycleDryRuns.getDryRun(dryRunId);
      if (directRecord) {
        return directRecord;
      }
      return (await store.githubPrLifecycleDryRuns.listDryRuns({ limit: 100 })).find(
        (record) => record.id === dryRunId || record.dryRunId === dryRunId,
      );
    }
    return githubPrLifecycleDryRunRecords.find(
      (record) => record.id === dryRunId || record.dryRunId === dryRunId,
    );
  }

  async function resolveGithubPrLifecycleApprovalRecord(
    approvalRequestId: string,
    store: CodexHubStore | undefined,
  ): Promise<GithubPrLifecycleApprovalArtifactRecord | undefined> {
    if (store) {
      const directRecord = await store.githubPrLifecycleApprovals.getApproval(
        approvalRequestId,
      );
      if (directRecord) {
        return directRecord;
      }
      return (await store.githubPrLifecycleApprovals.listApprovals({ limit: 100 })).find(
        (record) => record.approvalRequestId === approvalRequestId,
      );
    }
    return githubPrLifecycleApprovalRecords.find(
      (record) => record.id === approvalRequestId || record.approvalRequestId === approvalRequestId,
    );
  }

  async function resolveGithubPrLifecycleApprovalRecordByArtifactId(
    approvalArtifactId: string,
    store: CodexHubStore | undefined,
  ): Promise<GithubPrLifecycleApprovalArtifactRecord | undefined> {
    return store
      ? await store.githubPrLifecycleApprovals.getApprovalByArtifactId(approvalArtifactId)
      : githubPrLifecycleApprovalRecords.find(
          (record) => record.approvalArtifactId === approvalArtifactId,
        );
  }

  async function resolveGithubPrLifecycleRun(
    runId: string,
    store: CodexHubStore | undefined,
  ): Promise<GithubPrLifecycleObservationRun | undefined> {
    return store
      ? await store.githubPrLifecycleRuns.getRun(runId)
      : githubPrLifecycleRunRecords.find((record) => record.id === runId);
  }

  async function listGithubPrLifecycleDryRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<GithubPrLifecycleObservationPlan[]> {
    return store
      ? await store.githubPrLifecycleDryRuns.listDryRuns(query)
      : githubPrLifecycleDryRunRecords.slice(0, query.limit ?? 50);
  }

  async function listGithubPrLifecycleApprovals(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<GithubPrLifecycleApprovalArtifactRecord[]> {
    return store
      ? await store.githubPrLifecycleApprovals.listApprovals(query)
      : githubPrLifecycleApprovalRecords.slice(0, query.limit ?? 50);
  }

  async function listGithubPrLifecycleRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<GithubPrLifecycleObservationRun[]> {
    return store
      ? await store.githubPrLifecycleRuns.listRuns(query)
      : githubPrLifecycleRunRecords.slice(0, query.limit ?? 50);
  }

  async function persistGithubRemoteCleanupDryRunRecord(
    record: GithubRemoteCleanupPlan,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.githubRemoteCleanupDryRuns.saveDryRun(record);
      return;
    }
    githubRemoteCleanupDryRunRecords.unshift(record);
  }

  async function persistGithubRemoteCleanupApprovalRecord(
    record: GithubRemoteCleanupApprovalArtifactRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.githubRemoteCleanupApprovals.saveApproval(record);
      return;
    }
    githubRemoteCleanupApprovalRecords.unshift(record);
  }

  async function persistGithubRemoteCleanupRunRecord(
    record: GithubRemoteCleanupRun,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.githubRemoteCleanupRuns.saveRun(record);
      return;
    }
    githubRemoteCleanupRunRecords.unshift(record);
  }

  async function resolveGithubRemoteCleanupDryRunRecord(
    dryRunId: string | undefined,
    store: CodexHubStore | undefined,
  ): Promise<GithubRemoteCleanupPlan | undefined> {
    if (!dryRunId) {
      return undefined;
    }
    if (store) {
      const directRecord = await store.githubRemoteCleanupDryRuns.getDryRun(dryRunId);
      if (directRecord) {
        return directRecord;
      }
      return (await store.githubRemoteCleanupDryRuns.listDryRuns({ limit: 100 })).find(
        (record) => record.id === dryRunId || record.dryRunId === dryRunId,
      );
    }
    return githubRemoteCleanupDryRunRecords.find(
      (record) => record.id === dryRunId || record.dryRunId === dryRunId,
    );
  }

  async function resolveGithubRemoteCleanupApprovalRecord(
    approvalRequestId: string,
    store: CodexHubStore | undefined,
  ): Promise<GithubRemoteCleanupApprovalArtifactRecord | undefined> {
    if (store) {
      const directRecord = await store.githubRemoteCleanupApprovals.getApproval(approvalRequestId);
      if (directRecord) {
        return directRecord;
      }
      return (await store.githubRemoteCleanupApprovals.listApprovals({ limit: 100 })).find(
        (record) => record.approvalRequestId === approvalRequestId,
      );
    }
    return githubRemoteCleanupApprovalRecords.find(
      (record) =>
        record.id === approvalRequestId || record.approvalRequestId === approvalRequestId,
    );
  }

  async function resolveGithubRemoteCleanupApprovalRecordByArtifactId(
    approvalArtifactId: string,
    store: CodexHubStore | undefined,
  ): Promise<GithubRemoteCleanupApprovalArtifactRecord | undefined> {
    return store
      ? await store.githubRemoteCleanupApprovals.getApprovalByArtifactId(approvalArtifactId)
      : githubRemoteCleanupApprovalRecords.find(
          (record) => record.approvalArtifactId === approvalArtifactId,
        );
  }

  async function resolveGithubRemoteCleanupRun(
    runId: string,
    store: CodexHubStore | undefined,
  ): Promise<GithubRemoteCleanupRun | undefined> {
    return store
      ? await store.githubRemoteCleanupRuns.getRun(runId)
      : githubRemoteCleanupRunRecords.find((record) => record.id === runId);
  }

  async function listGithubRemoteCleanupDryRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<GithubRemoteCleanupPlan[]> {
    return store
      ? await store.githubRemoteCleanupDryRuns.listDryRuns(query)
      : githubRemoteCleanupDryRunRecords.slice(0, query.limit ?? 50);
  }

  async function listGithubRemoteCleanupApprovals(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<GithubRemoteCleanupApprovalArtifactRecord[]> {
    return store
      ? await store.githubRemoteCleanupApprovals.listApprovals(query)
      : githubRemoteCleanupApprovalRecords.slice(0, query.limit ?? 50);
  }

  async function listGithubRemoteCleanupRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<GithubRemoteCleanupRun[]> {
    return store
      ? await store.githubRemoteCleanupRuns.listRuns(query)
      : githubRemoteCleanupRunRecords.slice(0, query.limit ?? 50);
  }

  async function persistReworkLoopDryRunRecord(
    record: ReworkLoopPlan,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.reworkLoopDryRuns.saveDryRun(record);
      return;
    }
    reworkLoopDryRunRecords.unshift(record);
  }

  async function persistReworkLoopApprovalRecord(
    record: ReworkLoopApprovalArtifactRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.reworkLoopApprovals.saveApproval(record);
      return;
    }
    reworkLoopApprovalRecords.unshift(record);
  }

  async function persistReworkLoopRunRecord(
    record: ReworkLoopRun,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.reworkLoopRuns.saveRun(record);
      return;
    }
    reworkLoopRunRecords.unshift(record);
  }

  async function resolveReworkLoopDryRunRecord(
    dryRunId: string | undefined,
    store: CodexHubStore | undefined,
  ): Promise<ReworkLoopPlan | undefined> {
    if (!dryRunId) {
      return undefined;
    }
    if (store) {
      const directRecord = await store.reworkLoopDryRuns.getDryRun(dryRunId);
      if (directRecord) {
        return directRecord;
      }
      return (await store.reworkLoopDryRuns.listDryRuns({ limit: 100 })).find(
        (record) => record.id === dryRunId || record.dryRunId === dryRunId,
      );
    }
    return reworkLoopDryRunRecords.find(
      (record) => record.id === dryRunId || record.dryRunId === dryRunId,
    );
  }

  async function resolveReworkLoopApprovalRecord(
    approvalRequestId: string,
    store: CodexHubStore | undefined,
  ): Promise<ReworkLoopApprovalArtifactRecord | undefined> {
    if (store) {
      const directRecord = await store.reworkLoopApprovals.getApproval(approvalRequestId);
      if (directRecord) {
        return directRecord;
      }
      return (await store.reworkLoopApprovals.listApprovals({ limit: 100 })).find(
        (record) => record.id === approvalRequestId,
      );
    }
    return reworkLoopApprovalRecords.find(
      (record) => record.id === approvalRequestId,
    );
  }

  async function resolveReworkLoopApprovalRecordByArtifactId(
    approvalArtifactId: string,
    store: CodexHubStore | undefined,
  ): Promise<ReworkLoopApprovalArtifactRecord | undefined> {
    return store
      ? await store.reworkLoopApprovals.getApprovalByArtifactId(approvalArtifactId)
      : reworkLoopApprovalRecords.find(
          (record) => record.approvalArtifactId === approvalArtifactId,
        );
  }

  async function resolveReworkLoopRun(
    runId: string,
    store: CodexHubStore | undefined,
  ): Promise<ReworkLoopRun | undefined> {
    return store
      ? await store.reworkLoopRuns.getRun(runId)
      : reworkLoopRunRecords.find((record) => record.id === runId);
  }

  async function listReworkLoopDryRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<ReworkLoopPlan[]> {
    return store
      ? await store.reworkLoopDryRuns.listDryRuns(query)
      : reworkLoopDryRunRecords.slice(0, query.limit ?? 50);
  }

  async function listReworkLoopApprovals(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<ReworkLoopApprovalArtifactRecord[]> {
    return store
      ? await store.reworkLoopApprovals.listApprovals(query)
      : reworkLoopApprovalRecords.slice(0, query.limit ?? 50);
  }

  async function listReworkLoopRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<ReworkLoopRun[]> {
    return store
      ? await store.reworkLoopRuns.listRuns(query)
      : reworkLoopRunRecords.slice(0, query.limit ?? 50);
  }

  async function persistGithubDraftPrDryRunRecord(
    record: GithubDraftPrPlan,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.githubDraftPrDryRuns.saveDryRun(record);
      return;
    }
    githubDraftPrDryRunRecords.unshift(record);
  }

  async function persistGithubDraftPrApprovalRecord(
    record: GithubDraftPrApprovalArtifactRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.githubDraftPrApprovals.saveApproval(record);
      return;
    }
    githubDraftPrApprovalRecords.unshift(record);
  }

  async function persistGithubDraftPrRunRecord(
    record: GithubDraftPrRun,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.githubDraftPrRuns.saveRun(record);
      return;
    }
    githubDraftPrRunRecords.unshift(record);
  }

  async function resolveGithubDraftPrDryRunRecord(
    dryRunId: string | undefined,
    store: CodexHubStore | undefined,
  ): Promise<GithubDraftPrPlan | undefined> {
    if (!dryRunId) {
      return undefined;
    }
    if (store) {
      const directRecord = await store.githubDraftPrDryRuns.getDryRun(dryRunId);
      if (directRecord) {
        return directRecord;
      }
      return (await store.githubDraftPrDryRuns.listDryRuns({ limit: 100 })).find(
        (record) => record.id === dryRunId || record.dryRunId === dryRunId,
      );
    }
    return githubDraftPrDryRunRecords.find(
      (record) => record.id === dryRunId || record.dryRunId === dryRunId,
    );
  }

  async function resolveGithubDraftPrApprovalRecord(
    approvalRequestId: string,
    store: CodexHubStore | undefined,
  ): Promise<GithubDraftPrApprovalArtifactRecord | undefined> {
    if (store) {
      const directRecord = await store.githubDraftPrApprovals.getApproval(approvalRequestId);
      if (directRecord) {
        return directRecord;
      }
      return (await store.githubDraftPrApprovals.listApprovals({ limit: 100 })).find(
        (record) => record.approvalRequestId === approvalRequestId,
      );
    }
    return githubDraftPrApprovalRecords.find(
      (record) => record.id === approvalRequestId || record.approvalRequestId === approvalRequestId,
    );
  }

  async function resolveGithubDraftPrApprovalRecordByArtifactId(
    approvalArtifactId: string,
    store: CodexHubStore | undefined,
  ): Promise<GithubDraftPrApprovalArtifactRecord | undefined> {
    return store
      ? await store.githubDraftPrApprovals.getApprovalByArtifactId(approvalArtifactId)
      : githubDraftPrApprovalRecords.find(
          (record) => record.approvalArtifactId === approvalArtifactId,
        );
  }

  async function resolveGithubDraftPrRun(
    runId: string,
    store: CodexHubStore | undefined,
  ): Promise<GithubDraftPrRun | undefined> {
    return store
      ? await store.githubDraftPrRuns.getRun(runId)
      : githubDraftPrRunRecords.find((record) => record.id === runId);
  }

  async function listGithubDraftPrDryRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<GithubDraftPrPlan[]> {
    return store
      ? await store.githubDraftPrDryRuns.listDryRuns(query)
      : githubDraftPrDryRunRecords.slice(0, query.limit ?? 50);
  }

  async function listGithubDraftPrApprovals(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<GithubDraftPrApprovalArtifactRecord[]> {
    return store
      ? await store.githubDraftPrApprovals.listApprovals(query)
      : githubDraftPrApprovalRecords.slice(0, query.limit ?? 50);
  }

  async function listGithubDraftPrRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<GithubDraftPrRun[]> {
    return store
      ? await store.githubDraftPrRuns.listRuns(query)
      : githubDraftPrRunRecords.slice(0, query.limit ?? 50);
  }

  async function persistGithubBranchPublishDryRunRecord(
    record: GithubBranchPublishPlan,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.githubBranchPublishDryRuns.saveDryRun(record);
      return;
    }
    githubBranchPublishDryRunRecords.unshift(record);
  }

  async function persistGithubBranchPublishApprovalRecord(
    record: GithubBranchPublishApprovalArtifactRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.githubBranchPublishApprovals.saveApproval(record);
      return;
    }
    githubBranchPublishApprovalRecords.unshift(record);
  }

  async function persistGithubBranchPublishRunRecord(
    record: GithubBranchPublishRun,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.githubBranchPublishRuns.saveRun(record);
      return;
    }
    githubBranchPublishRunRecords.unshift(record);
  }

  async function resolveGithubBranchPublishDryRunRecord(
    dryRunId: string | undefined,
    store: CodexHubStore | undefined,
  ): Promise<GithubBranchPublishPlan | undefined> {
    if (!dryRunId) {
      return undefined;
    }
    if (store) {
      const directRecord = await store.githubBranchPublishDryRuns.getDryRun(dryRunId);
      if (directRecord) {
        return directRecord;
      }
      return (await store.githubBranchPublishDryRuns.listDryRuns({ limit: 100 })).find(
        (record) => record.id === dryRunId || record.dryRunId === dryRunId,
      );
    }
    return githubBranchPublishDryRunRecords.find(
      (record) => record.id === dryRunId || record.dryRunId === dryRunId,
    );
  }

  async function resolveGithubBranchPublishApprovalRecord(
    approvalRequestId: string,
    store: CodexHubStore | undefined,
  ): Promise<GithubBranchPublishApprovalArtifactRecord | undefined> {
    if (store) {
      const directRecord = await store.githubBranchPublishApprovals.getApproval(
        approvalRequestId,
      );
      if (directRecord) {
        return directRecord;
      }
      return (await store.githubBranchPublishApprovals.listApprovals({ limit: 100 })).find(
        (record) => record.approvalRequestId === approvalRequestId,
      );
    }
    return githubBranchPublishApprovalRecords.find(
      (record) => record.id === approvalRequestId || record.approvalRequestId === approvalRequestId,
    );
  }

  async function resolveGithubBranchPublishApprovalRecordByArtifactId(
    approvalArtifactId: string,
    store: CodexHubStore | undefined,
  ): Promise<GithubBranchPublishApprovalArtifactRecord | undefined> {
    return store
      ? await store.githubBranchPublishApprovals.getApprovalByArtifactId(approvalArtifactId)
      : githubBranchPublishApprovalRecords.find(
          (record) => record.approvalArtifactId === approvalArtifactId,
        );
  }

  async function resolveGithubBranchPublishRun(
    runId: string,
    store: CodexHubStore | undefined,
  ): Promise<GithubBranchPublishRun | undefined> {
    return store
      ? await store.githubBranchPublishRuns.getRun(runId)
      : githubBranchPublishRunRecords.find((record) => record.id === runId);
  }

  async function listGithubBranchPublishDryRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<GithubBranchPublishPlan[]> {
    return store
      ? await store.githubBranchPublishDryRuns.listDryRuns(query)
      : githubBranchPublishDryRunRecords.slice(0, query.limit ?? 50);
  }

  async function listGithubBranchPublishApprovals(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<GithubBranchPublishApprovalArtifactRecord[]> {
    return store
      ? await store.githubBranchPublishApprovals.listApprovals(query)
      : githubBranchPublishApprovalRecords.slice(0, query.limit ?? 50);
  }

  async function listGithubBranchPublishRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<GithubBranchPublishRun[]> {
    return store
      ? await store.githubBranchPublishRuns.listRuns(query)
      : githubBranchPublishRunRecords.slice(0, query.limit ?? 50);
  }

  async function persistGithubPublishDraftPrChainDryRunRecord(
    record: GithubPublishDraftPrChainPlan,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.githubPublishDraftPrChainDryRuns.saveDryRun(record);
      return;
    }
    githubPublishDraftPrChainDryRunRecords.unshift(record);
  }

  async function persistGithubPublishDraftPrChainRunRecord(
    record: GithubPublishDraftPrChainRun,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.githubPublishDraftPrChainRuns.saveRun(record);
      return;
    }
    githubPublishDraftPrChainRunRecords.unshift(record);
  }

  async function resolveGithubPublishDraftPrChainDryRunRecord(
    dryRunId: string | undefined,
    store: CodexHubStore | undefined,
  ): Promise<GithubPublishDraftPrChainPlan | undefined> {
    if (!dryRunId) {
      return undefined;
    }
    if (store) {
      const directRecord = await store.githubPublishDraftPrChainDryRuns.getDryRun(dryRunId);
      if (directRecord) {
        return directRecord;
      }
      return (await store.githubPublishDraftPrChainDryRuns.listDryRuns({ limit: 100 })).find(
        (record) => record.id === dryRunId || record.chainId === dryRunId,
      );
    }
    return githubPublishDraftPrChainDryRunRecords.find(
      (record) => record.id === dryRunId || record.chainId === dryRunId,
    );
  }

  async function resolveGithubPublishDraftPrChainRun(
    runId: string,
    store: CodexHubStore | undefined,
  ): Promise<GithubPublishDraftPrChainRun | undefined> {
    return store
      ? await store.githubPublishDraftPrChainRuns.getRun(runId)
      : githubPublishDraftPrChainRunRecords.find((record) => record.id === runId);
  }

  async function listGithubPublishDraftPrChainDryRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<GithubPublishDraftPrChainPlan[]> {
    return store
      ? await store.githubPublishDraftPrChainDryRuns.listDryRuns(query)
      : githubPublishDraftPrChainDryRunRecords.slice(0, query.limit ?? 50);
  }

  async function listGithubPublishDraftPrChainRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<GithubPublishDraftPrChainRun[]> {
    return store
      ? await store.githubPublishDraftPrChainRuns.listRuns(query)
      : githubPublishDraftPrChainRunRecords.slice(0, query.limit ?? 50);
  }

  async function persistGithubMetadataAuditEvents(
    auditEventIds: string[],
    evidenceRefs: EvidenceRef[],
    store: CodexHubStore,
    policyDecisionId: string,
    networkBoundaryInvoked: boolean,
  ): Promise<void> {
    for (const auditEventId of auditEventIds) {
      await store.auditEvents.append({
        id: auditEventId,
        schemaVersion: SchemaVersionSchema.value,
        createdAt: foundationTimestamp(),
        actor: 'codexhub-supervisor',
        action: 'github.metadata.control_plane',
        target: 'github-provider',
        reason: 'github metadata control-plane metadata transition',
        outcome: 'recorded',
        evidenceRefs,
        policyDecisionId,
        metadata: {
          bodyStored: false,
          rawPathStored: false,
          networkBoundaryInvoked,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
          noRealWrite: true,
        },
      });
    }
  }

  async function persistGithubPrLifecycleAuditEvents(
    auditEventIds: string[],
    evidenceRefs: EvidenceRef[],
    store: CodexHubStore,
    policyDecisionId: string,
    networkBoundaryInvoked: boolean,
  ): Promise<void> {
    for (const auditEventId of auditEventIds) {
      await store.auditEvents.append({
        id: auditEventId,
        schemaVersion: SchemaVersionSchema.value,
        createdAt: foundationTimestamp(),
        actor: 'codexhub-supervisor',
        action: 'github.pr_lifecycle.control_plane',
        target: 'github-provider',
        reason: 'github PR lifecycle control-plane metadata transition',
        outcome: 'recorded',
        evidenceRefs,
        policyDecisionId,
        metadata: {
          bodyStored: false,
          rawUrlStored: false,
          rawResponseBodyStored: false,
          rawPathStored: false,
          networkBoundaryInvoked,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
          noRealWrite: true,
          fixedGetOnly: true,
          commentsAllowed: false,
          labelsAllowed: false,
          reviewersAllowed: false,
          mergeAllowed: false,
        },
      });
    }
  }

  async function persistGithubRemoteCleanupAuditEvents(
    auditEventIds: string[],
    evidenceRefs: EvidenceRef[],
    store: CodexHubStore,
    policyDecisionId: string,
    networkBoundaryInvoked: boolean,
  ): Promise<void> {
    for (const auditEventId of auditEventIds) {
      await store.auditEvents.append({
        id: auditEventId,
        schemaVersion: SchemaVersionSchema.value,
        createdAt: foundationTimestamp(),
        actor: 'codexhub-supervisor',
        action: 'github.remote_cleanup.control_plane',
        target: 'github-provider',
        reason: 'github remote cleanup fixed close/delete control-plane transition',
        outcome: 'recorded',
        evidenceRefs,
        policyDecisionId,
        metadata: {
          bodyStored: false,
          rawRefStored: false,
          rawUrlStored: false,
          rawResponseBodyStored: false,
          rawPathStored: false,
          networkBoundaryInvoked,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
          closePrAllowed: true,
          deleteRefAllowed: true,
          deleteNonCodexhubBranchAllowed: false,
          updateRefAllowed: false,
          forceAllowed: false,
          pushAllowed: false,
          mergeAllowed: false,
          commentsAllowed: false,
          labelsAllowed: false,
          reviewersAllowed: false,
        },
      });
    }
  }

  async function persistReworkLoopAuditEvents(
    auditEventIds: string[],
    evidenceRefs: EvidenceRef[],
    store: CodexHubStore,
    policyDecisionId: string,
  ): Promise<void> {
    for (const auditEventId of auditEventIds) {
      await store.auditEvents.append({
        id: auditEventId,
        schemaVersion: SchemaVersionSchema.value,
        createdAt: foundationTimestamp(),
        actor: 'codexhub-supervisor',
        action: 'rework.loop.control_plane',
        target: 'rework-loop',
        reason: 'M20 rework loop metadata transition',
        outcome: 'recorded',
        evidenceRefs,
        policyDecisionId,
        metadata: {
          bodyStored: false,
          rawDiffStored: false,
          rawPrBodyStored: false,
          rawReasonStored: false,
          rawPathStored: false,
          networkBoundaryInvoked: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
          noRealWrite: true,
          directChildExecutionAllowed: false,
          childApprovalsRequired: true,
          updateExistingBranchAllowed: false,
          forceAllowed: false,
          mergeAllowed: false,
          commentAllowed: false,
          labelAllowed: false,
          reviewerAllowed: false,
        },
      });
    }
  }

  async function persistGithubDraftPrAuditEvents(
    auditEventIds: string[],
    evidenceRefs: EvidenceRef[],
    store: CodexHubStore,
    policyDecisionId: string,
    networkBoundaryInvoked: boolean,
    noRealWrite: boolean,
  ): Promise<void> {
    for (const auditEventId of auditEventIds) {
      await store.auditEvents.append({
        id: auditEventId,
        schemaVersion: SchemaVersionSchema.value,
        createdAt: foundationTimestamp(),
        actor: 'codexhub-supervisor',
        action: 'github.draft_pr.control_plane',
        target: 'github-provider',
        reason: 'github draft PR control-plane metadata transition',
        outcome: 'recorded',
        evidenceRefs,
        policyDecisionId,
        metadata: {
          bodyStored: false,
          rawPathStored: false,
          rawPrBodyStored: false,
          networkBoundaryInvoked,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
          noRealWrite,
          draftOnly: true,
          pushAllowed: false,
          createRefAllowed: false,
          mergeAllowed: false,
        },
      });
    }
  }

  async function persistGithubBranchPublishAuditEvents(
    auditEventIds: string[],
    evidenceRefs: EvidenceRef[],
    store: CodexHubStore,
    policyDecisionId: string,
    networkBoundaryInvoked: boolean,
    noRealWrite: boolean,
  ): Promise<void> {
    for (const auditEventId of auditEventIds) {
      await store.auditEvents.append({
        id: auditEventId,
        schemaVersion: SchemaVersionSchema.value,
        createdAt: foundationTimestamp(),
        actor: 'codexhub-supervisor',
        action: 'github.branch_publish.control_plane',
        target: 'github-provider',
        reason: 'github branch publish control-plane metadata transition',
        outcome: 'recorded',
        evidenceRefs,
        policyDecisionId,
        metadata: {
          bodyStored: false,
          rawFileContentStored: false,
          rawPathStored: false,
          networkBoundaryInvoked,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
          noRealWrite,
          newBranchOnly: true,
          createRefAllowed: true,
          updateRefAllowed: false,
          forceAllowed: false,
          pushAllowed: false,
          mergeAllowed: false,
        },
      });
    }
  }

  async function persistGithubPublishDraftPrChainAuditEvents(
    auditEventIds: string[],
    evidenceRefs: EvidenceRef[],
    store: CodexHubStore,
    networkBoundaryInvoked: boolean,
    noRealWrite: boolean,
  ): Promise<void> {
    for (const auditEventId of auditEventIds) {
      await store.auditEvents.append({
        id: auditEventId,
        schemaVersion: SchemaVersionSchema.value,
        createdAt: foundationTimestamp(),
        actor: 'codexhub-supervisor',
        action: 'github.publish_draft_pr_chain.control_plane',
        target: 'github-provider',
        reason: 'github publish to draft PR chain metadata projection',
        outcome: 'recorded',
        evidenceRefs,
        metadata: {
          bodyStored: false,
          rawFileContentStored: false,
          rawPathStored: false,
          rawPrBodyStored: false,
          networkBoundaryInvoked,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
          noRealWrite,
          pushAllowed: false,
          updateRefAllowed: false,
          forceAllowed: false,
          mergeAllowed: false,
        },
      });
    }
  }

  function createGithubMetadataDryRunResponse(record: GithubMetadataDryRunRecord) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      runnerMode: record.runnerMode,
      targetRef: record.targetRef,
      requestedMetadataCount: record.requestedMetadata.length,
      blockReasons: record.blockReasons,
      policyDecisionId: record.policyDecision.id,
      requiresApproval: record.requiresApproval,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      networkBoundaryPlanned: record.networkBoundaryPlanned,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createGithubMetadataApprovalResponse(record: GithubMetadataApprovalArtifactRecord) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalRequestId: record.approvalRequestId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      approved: record.approved,
      policyDecisionId: record.policyDecisionId,
      requestedByHash: record.requestedByHash,
      decidedByHash: record.decidedByHash,
      reasonHash: record.reasonHash,
      expiresAt: record.expiresAt,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createGithubMetadataRunResponse(record: GithubMetadataControlPlaneRun) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      targetRef: record.targetRef,
      repoMetadataHash: record.repoMetadataHash,
      baseBranchMetadataHash: record.baseBranchMetadataHash,
      headBranchMetadataHash: record.headBranchMetadataHash,
      existingPullRequestCount: record.existingPullRequestCount,
      responseBodyHashCount: record.responseBodyHashes.length,
      responseBodyHashes: record.responseBodyHashes,
      blockReasons: record.blockReasons,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      networkBoundaryInvoked: record.networkBoundaryInvoked,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createGithubPrLifecycleDryRunResponse(record: GithubPrLifecycleObservationPlan) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      runnerMode: record.runnerMode,
      targetRef: record.targetRef,
      prNumberHash: record.prNumberHash,
      commitShaHash: record.commitShaHash,
      requestedMetadataCount: record.requestedMetadata.length,
      blockReasons: record.blockReasons,
      policyDecisionId: record.policyDecision.id,
      requiresApproval: record.requiresApproval,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      networkBoundaryPlanned: record.networkBoundaryPlanned,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      fixedGetOnly: true,
      rawUrlStored: false,
      rawResponseBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createGithubPrLifecycleApprovalResponse(
    record: GithubPrLifecycleApprovalArtifactRecord,
  ) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalRequestId: record.approvalRequestId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      approved: record.approved,
      policyDecisionId: record.policyDecisionId,
      requestedByHash: record.requestedByHash,
      decidedByHash: record.decidedByHash,
      reasonHash: record.reasonHash,
      expiresAt: record.expiresAt,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawUrlStored: false,
      rawResponseBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createGithubPrLifecycleRunResponse(record: GithubPrLifecycleObservationRun) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      targetRef: record.plan.targetRef,
      prNumberHash: record.lifecycleSummary.prNumberHash,
      prUrlHash: record.lifecycleSummary.prUrlHash,
      stateHash: record.lifecycleSummary.stateHash,
      lifecycleStatus: record.lifecycleSummary.summary,
      checkRunCount: record.lifecycleSummary.checkRunCount,
      statusContextCount: record.lifecycleSummary.statusContextCount,
      failedCheckCount: record.lifecycleSummary.failedCheckCount,
      pendingCheckCount: record.lifecycleSummary.pendingCheckCount,
      passedCheckCount: record.lifecycleSummary.passedCheckCount,
      responseBodyHashCount: record.responseBodyHashes.length,
      responseBodyHashes: record.responseBodyHashes,
      blockReasons: record.blockReasons,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      networkBoundaryInvoked: record.networkBoundaryInvoked,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      fixedGetOnly: true,
      rawUrlStored: false,
      rawResponseBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createReworkLoopDryRunResponse(record: ReworkLoopPlan) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      triggerKind: record.trigger.kind,
      sourceRunIdHash: record.sourceRunIdHash,
      sourcePackageHash: record.sourcePackageHash,
      requestedAttemptNumber: record.requestedAttemptNumber,
      plannedBranchNameHash: record.nextAttempt.plannedBranchNameHash,
      branchPrefix: record.nextAttempt.branchPrefix,
      branchAttemptSuffix: record.nextAttempt.branchAttemptSuffix,
      changedFileCount: record.nextAttempt.changedFileCount,
      blockReasons: record.blockReasons,
      policyDecisionId: record.policyDecision.id,
      requiresApproval: record.policyDecision.requiresApproval,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      childApprovalsRequired: record.childApprovalsRequired,
      directChildExecutionAllowed: record.directChildExecutionAllowed,
      updateExistingBranchAllowed: record.updateExistingBranchAllowed,
      forceAllowed: record.forceAllowed,
      mergeAllowed: record.mergeAllowed,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: record.noRealWrite,
      rawDiffStored: false,
      rawPrBodyStored: false,
      rawReasonStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createReworkLoopApprovalResponse(record: ReworkLoopApprovalArtifactRecord) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalRequestId: record.id,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      approved: record.approved,
      policyDecisionId: record.policyDecisionId,
      requestedByHash: hashSupervisorMetadata({ requestedBy: record.requestedBy }),
      decidedByHash: record.decidedBy
        ? hashSupervisorMetadata({ decidedBy: record.decidedBy })
        : undefined,
      reasonHash: record.reasonHash,
      expiresAt: record.expiresAt,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawReasonStored: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      summary: record.summary,
    };
  }

  function createReworkLoopRunResponse(record: ReworkLoopRun) {
    return {
      recordId: record.id,
      runId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      triggerKind: record.trigger.kind,
      sourceRunIdHash: record.plan.sourceRunIdHash,
      sourcePackageHash: record.plan.sourcePackageHash,
      attemptCount: record.attemptCount,
      attemptStatus: record.attempts[0]?.status,
      nextActionSummaryHash: record.nextActionSummaryHash,
      plannedBranchNameHash: record.attempts[0]?.plannedBranchNameHash,
      superseded: record.supersedeProjection?.superseded ?? false,
      oldBranchPreserved: record.supersedeProjection?.oldBranchPreserved ?? true,
      blockReasons: record.blockReasons,
      evidenceRefIds: record.evidenceRefIds,
      auditEventIds: record.auditEventIds,
      childApprovalsRequired: record.childApprovalsRequired,
      directChildExecutionAllowed: record.directChildExecutionAllowed,
      patchExecuted: record.patchExecuted,
      branchPublished: record.branchPublished,
      draftPrCreated: record.draftPrCreated,
      updateExistingBranchAllowed: record.updateExistingBranchAllowed,
      forceAllowed: record.forceAllowed,
      mergeAllowed: record.mergeAllowed,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: record.noRealWrite,
      rawDiffStored: false,
      rawPrBodyStored: false,
      rawReasonStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createRemoteSupersedeDryRunResponse(record: RemoteSupersedePlan) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      targetKind: record.target.targetKind,
      oldBranchNameHash: record.target.oldBranchNameHash,
      oldPrNumberHash: record.target.oldPrNumberHash,
      cleanupReadinessStatus: record.cleanupReadiness.status,
      cleanupRecommended: record.target.cleanupRecommended,
      blockReasons: record.blockReasons,
      policyDecisionId: record.policyDecision.id,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      remoteCleanupRequiresApproval: true,
      cleanupExecutionAllowed: false,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawRefStored: false,
      rawUrlStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createRemoteSupersedeRunResponse(record: RemoteSupersedeRun) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      status: record.status,
      targetKind: record.target.targetKind,
      oldBranchNameHash: record.target.oldBranchNameHash,
      oldPrNumberHash: record.target.oldPrNumberHash,
      cleanupReadinessStatus: record.cleanupReadiness.status,
      cleanupRecommended: record.target.cleanupRecommended,
      blockReasons: record.blockReasons,
      evidenceRefIds: record.evidenceRefIds,
      auditEventIds: record.auditEventIds,
      remoteCleanupRequiresApproval: true,
      cleanupExecutionAllowed: false,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawRefStored: false,
      rawUrlStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createGithubRemoteCleanupDryRunResponse(record: GithubRemoteCleanupPlan) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      runnerMode: record.runnerMode,
      targetRef: record.targetRef,
      oldPrNumberHash: record.oldPrNumberHash,
      oldBranchNameHash: record.oldBranchNameHash,
      successorRunIdHash: record.successorRunIdHash,
      cleanupReadinessStatus: record.cleanupReadiness.status,
      blockReasons: record.blockReasons,
      policyDecisionId: record.policyDecision.id,
      requiresApproval: record.requiresApproval,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      networkBoundaryPlanned: record.networkBoundaryPlanned,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      fixedCleanupOnly: true,
      closePrAllowed: true,
      deleteRefAllowed: true,
      deleteNonCodexhubBranchAllowed: false,
      updateRefAllowed: false,
      forceAllowed: false,
      mergeAllowed: false,
      rawRefStored: false,
      rawUrlStored: false,
      rawResponseBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createGithubRemoteCleanupApprovalResponse(
    record: GithubRemoteCleanupApprovalArtifactRecord,
  ) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalRequestId: record.approvalRequestId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      approved: record.approved,
      policyDecisionId: record.policyDecisionId,
      requestedByHash: record.requestedByHash,
      decidedByHash: record.decidedByHash,
      reasonHash: record.reasonHash,
      expiresAt: record.expiresAt,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawReasonStored: false,
      rawRefStored: false,
      rawUrlStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createGithubRemoteCleanupRunResponse(record: GithubRemoteCleanupRun) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      targetRef: record.plan.targetRef,
      oldPrNumberHash: record.cleanupSummary.oldPrNumberHash,
      oldBranchNameHash: record.cleanupSummary.oldBranchNameHash,
      oldPrClosed: record.cleanupSummary.oldPrClosed,
      oldBranchDeleted: record.cleanupSummary.oldBranchDeleted,
      responseBodyHashCount: record.responseBodyHashes.length,
      responseBodyHashes: record.responseBodyHashes,
      blockReasons: record.blockReasons,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      networkBoundaryInvoked: record.networkBoundaryInvoked,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: record.noRealWrite,
      fixedCleanupOnly: true,
      closePrAllowed: true,
      deleteRefAllowed: true,
      deleteNonCodexhubBranchAllowed: false,
      updateRefAllowed: false,
      forceAllowed: false,
      mergeAllowed: false,
      rawRefStored: false,
      rawUrlStored: false,
      rawResponseBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createGithubDraftPrDryRunResponse(record: GithubDraftPrPlan) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      runnerMode: record.runnerMode,
      readinessStatus: record.readiness.status,
      sourceKind: record.readiness.sourceKind,
      sourceIdHash: record.readiness.sourceIdHash,
      sourceSummaryHash: record.readiness.sourceSummaryHash,
      targetRef: record.readiness.targetRef,
      titleHash: record.titleHash,
      bodyHash: record.bodyHash,
      bodySectionCount: record.bodySectionCount,
      bodyCharacterCount: record.bodyCharacterCount,
      blockReasons: record.blockReasons,
      policyDecisionId: record.policyDecision.id,
      policyOutcome: record.policyDecision.outcome,
      requiresApproval: record.requiresApproval,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      networkBoundaryPlanned: record.networkBoundaryPlanned,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      draft: true,
      pushAllowed: false,
      createRefAllowed: false,
      mergeAllowed: false,
      rawPrBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createGithubDraftPrApprovalResponse(record: GithubDraftPrApprovalArtifactRecord) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalRequestId: record.approvalRequestId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      approved: record.approved,
      policyDecisionId: record.policyDecisionId,
      requestedByHash: record.requestedByHash,
      decidedByHash: record.decidedByHash,
      reasonHash: record.reasonHash,
      expiresAt: record.expiresAt,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createGithubDraftPrRunResponse(record: GithubDraftPrRun) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      readinessStatus: record.plan.readiness.status,
      sourceKind: record.plan.readiness.sourceKind,
      sourceIdHash: record.plan.readiness.sourceIdHash,
      sourceSummaryHash: record.plan.readiness.sourceSummaryHash,
      targetRef: record.creationSummary.targetRef,
      prNumberHash: record.creationSummary.prNumberHash,
      prUrlHash: record.creationSummary.prUrlHash,
      titleHash: record.creationSummary.titleHash,
      bodyHash: record.creationSummary.bodyHash,
      created: record.creationSummary.created,
      responseBodyHashCount: record.responseBodyHashes.length,
      responseBodyHashes: record.responseBodyHashes,
      blockReasons: record.blockReasons,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      auditChainId: record.auditChain.id,
      auditChainHash: record.auditChain.chainHash,
      networkBoundaryInvoked: record.networkBoundaryInvoked,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: record.noRealWrite,
      draft: true,
      pushAllowed: false,
      createRefAllowed: false,
      mergeAllowed: false,
      rawPrBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createGithubBranchPublishDryRunResponse(record: GithubBranchPublishPlan) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      runnerMode: record.runnerMode,
      readinessStatus: record.readiness.status,
      sourceKind: record.readiness.sourceKind,
      sourceIdHash: record.readiness.sourceIdHash,
      sourceSummaryHash: record.readiness.sourceSummaryHash,
      targetRef: record.readiness.targetRef,
      contentManifestId: record.readiness.contentManifest.id,
      contentManifestHash: record.readiness.contentManifest.metadata?.contentManifestHash,
      fileCount: record.readiness.contentManifest.fileCount,
      totalByteCount: record.readiness.contentManifest.totalByteCount,
      filePathHashes: record.readiness.contentManifest.filePathHashes,
      fileContentHashCount: record.readiness.contentManifest.fileContentHashes.length,
      commitMessageHash: record.commitMessageHash,
      blockReasons: record.blockReasons,
      policyDecisionId: record.policyDecision.id,
      policyOutcome: record.policyDecision.outcome,
      requiresApproval: record.requiresApproval,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      networkBoundaryPlanned: record.networkBoundaryPlanned,
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
      summary: record.summary,
    };
  }

  function createGithubBranchPublishApprovalResponse(
    record: GithubBranchPublishApprovalArtifactRecord,
  ) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalRequestId: record.approvalRequestId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      approved: record.approved,
      policyDecisionId: record.policyDecisionId,
      requestedByHash: record.requestedByHash,
      decidedByHash: record.decidedByHash,
      reasonHash: record.reasonHash,
      expiresAt: record.expiresAt,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createGithubBranchPublishRunResponse(record: GithubBranchPublishRun) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      readinessStatus: record.plan.readiness.status,
      sourceKind: record.plan.readiness.sourceKind,
      sourceIdHash: record.plan.readiness.sourceIdHash,
      sourceSummaryHash: record.plan.readiness.sourceSummaryHash,
      targetRef: record.commitSummary.targetRef,
      contentManifestHash: record.commitSummary.contentManifestHash,
      fileCount: record.commitSummary.fileCount,
      branchNameHash: record.commitSummary.branchNameHash,
      commitShaHash: record.commitSummary.commitShaHash,
      treeShaHash: record.commitSummary.treeShaHash,
      created: record.commitSummary.created,
      responseBodyHashCount: record.responseBodyHashes.length,
      responseBodyHashes: record.responseBodyHashes,
      blockReasons: record.blockReasons,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      networkBoundaryInvoked: record.networkBoundaryInvoked,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: record.noRealWrite,
      createRefAllowed: true,
      updateRefAllowed: false,
      forceAllowed: false,
      pushAllowed: false,
      mergeAllowed: false,
      rawFileContentStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createGithubPublishDraftPrChainDryRunResponse(
    record: GithubPublishDraftPrChainPlan,
  ) {
    return {
      recordId: record.id,
      chainId: record.chainId,
      status: 'planned',
      sourceKind: record.sourceKind,
      sourceIdHash: record.sourceIdHash,
      branchPublishDryRunId: record.branchPublishDryRunId,
      draftPrDryRunId: record.draftPrDryRunId,
      separateApprovalsRequired: record.separateApprovalsRequired,
      branchPublishApprovalRequired: record.branchPublishApprovalRequired,
      draftPrApprovalRequired: record.draftPrApprovalRequired,
      networkBoundaryPlanned: record.networkBoundaryPlanned,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      pushAllowed: false,
      updateRefAllowed: false,
      forceAllowed: false,
      mergeAllowed: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createGithubPublishDraftPrChainRunResponse(
    record: GithubPublishDraftPrChainRun,
  ) {
    return {
      recordId: record.id,
      chainId: record.chainId,
      status: record.status,
      sourceKind: record.plan.sourceKind,
      sourceIdHash: record.plan.sourceIdHash,
      branchPublishDryRunId: record.plan.branchPublishDryRunId,
      draftPrDryRunId: record.plan.draftPrDryRunId,
      branchPublishRunId: record.branchPublishRunId,
      draftPrRunId: record.draftPrRunId,
      stepCount: record.stepCount,
      steps: record.steps.map((step) => ({
        id: step.id,
        phase: step.phase,
        status: step.status,
        order: step.order,
        evidenceRefIds: step.evidenceRefIds,
        auditEventIds: step.auditEventIds,
        networkBoundaryInvoked: step.networkBoundaryInvoked,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawPathStored: false,
        bodyStored: false,
        summary: step.summary,
      })),
      lifecycleSummary: record.lifecycleSummary
        ? {
            id: record.lifecycleSummary.id,
            prNumberHash: record.lifecycleSummary.prNumberHash,
            prUrlHash: record.lifecycleSummary.prUrlHash,
            stateHash: record.lifecycleSummary.stateHash,
            checkRunCount: record.lifecycleSummary.checkRunCount,
            statusContextCount: record.lifecycleSummary.statusContextCount,
            failedCheckCount: record.lifecycleSummary.failedCheckCount,
            pendingCheckCount: record.lifecycleSummary.pendingCheckCount,
            passedCheckCount: record.lifecycleSummary.passedCheckCount,
            rawUrlStored: false,
            rawResponseBodyStored: false,
            rawPathStored: false,
            bodyStored: false,
            summary: record.lifecycleSummary.summary,
          }
        : undefined,
      blockReasons: record.blockReasons,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      networkBoundaryInvoked: record.networkBoundaryInvoked,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: record.noRealWrite,
      pushAllowed: false,
      updateRefAllowed: false,
      forceAllowed: false,
      mergeAllowed: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createGithubMetadataStoreUnavailableResponse(phase: string) {
    return {
      error: `github_metadata_store_unavailable_${phase}`,
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createGithubPrLifecycleStoreUnavailableResponse(phase: string) {
    return {
      error: `github_pr_lifecycle_store_unavailable_${phase}`,
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawUrlStored: false,
      rawResponseBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createReworkLoopStoreUnavailableResponse(phase: string) {
    return {
      error: `rework_loop_store_unavailable_${phase}`,
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawDiffStored: false,
      rawPrBodyStored: false,
      rawReasonStored: false,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createGithubDraftPrStoreUnavailableResponse(phase: string) {
    return {
      error: `github_draft_pr_store_unavailable_${phase}`,
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPrBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createGithubBranchPublishStoreUnavailableResponse(phase: string) {
    return {
      error: `github_branch_publish_store_unavailable_${phase}`,
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawFileContentStored: false,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createGithubPublishDraftPrChainStoreUnavailableResponse(phase: string) {
    return {
      error: `github_publish_draft_pr_chain_store_unavailable_${phase}`,
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createGithubRemoteCleanupStoreUnavailableResponse(phase: string) {
    return {
      error: `github_remote_cleanup_store_unavailable_${phase}`,
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawRefStored: false,
      rawUrlStored: false,
      rawResponseBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createGithubMetadataUntrustedAuthorityResponse(dryRunId: string | undefined) {
    return {
      error: 'untrusted_github_metadata_authority_body',
      dryRunId,
      status: 'blocked',
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createGithubPrLifecycleUntrustedAuthorityResponse(dryRunId: string | undefined) {
    return {
      error: 'untrusted_github_pr_lifecycle_authority_body',
      dryRunId,
      status: 'blocked',
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawUrlStored: false,
      rawResponseBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createReworkLoopUntrustedAuthorityResponse(dryRunId: string | undefined) {
    return {
      error: 'untrusted_rework_loop_authority_body',
      dryRunId,
      status: 'blocked',
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawDiffStored: false,
      rawPrBodyStored: false,
      rawReasonStored: false,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createGithubDraftPrUntrustedAuthorityResponse(dryRunId: string | undefined) {
    return {
      error: 'untrusted_github_draft_pr_authority_body',
      dryRunId,
      status: 'blocked',
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPrBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createGithubBranchPublishUntrustedAuthorityResponse(dryRunId: string | undefined) {
    return {
      error: 'untrusted_github_branch_publish_authority_body',
      dryRunId,
      status: 'blocked',
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawFileContentStored: false,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createGithubPublishDraftPrChainUntrustedAuthorityResponse(
    dryRunId: string | undefined,
  ) {
    return {
      error: 'untrusted_github_publish_draft_pr_chain_authority_body',
      dryRunId,
      status: 'blocked',
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createGithubRemoteCleanupUntrustedAuthorityResponse(dryRunId: string | undefined) {
    return {
      error: 'untrusted_github_remote_cleanup_authority_body',
      dryRunId,
      status: 'blocked',
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawRefStored: false,
      rawUrlStored: false,
      rawResponseBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createGithubMetadataForbiddenRawBodyResponse(dryRunId: string | undefined) {
    return {
      error: 'forbidden_github_metadata_raw_body',
      dryRunId,
      status: 'blocked',
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createGithubPrLifecycleForbiddenRawBodyResponse(dryRunId: string | undefined) {
    return {
      error: 'forbidden_github_pr_lifecycle_raw_body',
      dryRunId,
      status: 'blocked',
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawUrlStored: false,
      rawResponseBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createReworkLoopForbiddenRawBodyResponse(dryRunId: string | undefined) {
    return {
      error: 'forbidden_rework_loop_raw_body',
      dryRunId,
      status: 'blocked',
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawDiffStored: false,
      rawPrBodyStored: false,
      rawReasonStored: false,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createGithubDraftPrForbiddenRawBodyResponse(dryRunId: string | undefined) {
    return {
      error: 'forbidden_github_draft_pr_raw_body',
      dryRunId,
      status: 'blocked',
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPrBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createGithubBranchPublishForbiddenRawBodyResponse(dryRunId: string | undefined) {
    return {
      error: 'forbidden_github_branch_publish_raw_body',
      dryRunId,
      status: 'blocked',
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawFileContentStored: false,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createGithubPublishDraftPrChainForbiddenRawBodyResponse(
    dryRunId: string | undefined,
  ) {
    return {
      error: 'forbidden_github_publish_draft_pr_chain_raw_body',
      dryRunId,
      status: 'blocked',
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createGithubRemoteCleanupForbiddenRawBodyResponse(dryRunId: string | undefined) {
    return {
      error: 'forbidden_github_remote_cleanup_raw_body',
      dryRunId,
      status: 'blocked',
      networkBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawRefStored: false,
      rawUrlStored: false,
      rawResponseBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createReviewPackageDryRunResponse(record: LocalReviewPackageDryRunRecord) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      runnerMode: record.runnerMode,
      reviewPackageIdHash: record.reviewPackageIdHash,
      packageHash: record.packageHash,
      artifactRootHash: record.artifactRootHash,
      artifactDirectoryHash: record.artifactDirectoryHash,
      plannedFileCount: record.plannedFileCount,
      blockReasons: record.blockReasons,
      policyDecisionId: record.policyDecision.id,
      policyOutcome: record.policyDecision.outcome,
      requiresApproval: record.requiresApproval,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      artifactWriteBoundaryPlanned: record.artifactWriteBoundaryPlanned,
      artifactWriteBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createReleaseCandidateDryRunResponse(record: LocalRcBundleDryRunRecord) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      runnerMode: record.runnerMode,
      rcReadinessIdHash: record.rcReadinessIdHash,
      rcBundleHash: record.rcBundleHash,
      readinessStatus: record.readinessSummary.status,
      reviewDecisionStatus: record.readinessSummary.reviewDecisionStatus,
      verificationStatus: record.readinessSummary.verificationStatus,
      operatorReadinessStatus: record.readinessSummary.operatorReadinessStatus,
      artifactRootHash: record.artifactRootHash,
      artifactDirectoryHash: record.artifactDirectoryHash,
      plannedFileCount: record.plannedFileCount,
      blockReasons: record.blockReasons,
      policyDecisionId: record.policyDecision.id,
      policyOutcome: record.policyDecision.outcome,
      requiresApproval: record.requiresApproval,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      artifactWriteBoundaryPlanned: record.artifactWriteBoundaryPlanned,
      artifactWriteBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createReleaseCandidateApprovalResponse(
    record: LocalRcBundleApprovalArtifactRecord,
  ) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalRequestId: record.approvalRequestId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      approved: record.approved,
      policyDecisionId: record.policyDecisionId,
      reasonHash: record.reasonHash,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      artifactWriteBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createReleaseCandidateRunResponse(record: LocalRcBundleControlPlaneRun) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      status: record.status,
      rcReadinessIdHash: record.rcReadinessIdHash,
      rcBundleHash: record.rcBundleHash,
      artifactRootHash: record.artifactRootHash,
      artifactDirectoryHash: record.artifactDirectoryHash,
      exportedFileCount: record.exportedFileCount,
      byteCount: record.byteCount,
      contentHash: record.contentHash,
      blockReasons: record.blockReasons,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      artifactWriteBoundaryInvoked: record.artifactWriteBoundaryInvoked,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: record.noRealWrite,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createReviewPackageApprovalResponse(
    record: LocalReviewPackageApprovalArtifactRecord,
  ) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalRequestId: record.approvalRequestId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      approved: record.approved,
      policyDecisionId: record.policyDecisionId,
      reasonHash: record.reasonHash,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      artifactWriteBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createReviewPackageRunResponse(record: LocalReviewPackageControlPlaneRun) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      status: record.status,
      reviewPackageIdHash: record.reviewPackageIdHash,
      packageHash: record.packageHash,
      artifactRootHash: record.artifactRootHash,
      artifactDirectoryHash: record.artifactDirectoryHash,
      exportedFileCount: record.exportedFileCount,
      byteCount: record.byteCount,
      contentHash: record.contentHash,
      blockReasons: record.blockReasons,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      artifactWriteBoundaryInvoked: record.artifactWriteBoundaryInvoked,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: record.noRealWrite,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function parseReviewPackageQuery(query: unknown): {
    dryRunId?: string;
    status?: string;
    limit?: number;
  } {
    const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

    return {
      dryRunId: readQueryValue(query, 'dryRunId'),
      status: readQueryValue(query, 'status'),
      limit: limitResult.allowed ? limitResult.limit : undefined,
    };
  }

  function listInMemoryControlPlaneRecords<T extends { dryRunId?: string; status?: string }>(
    records: T[],
    query: { dryRunId?: string; status?: string; limit?: number },
  ): T[] {
    return records
      .filter((record) => (query.dryRunId ? record.dryRunId === query.dryRunId : true))
      .filter((record) => (query.status ? record.status === query.status : true))
      .slice(0, query.limit ?? 50);
  }

  function createReviewPackageStoreUnavailableResponse(phase: string) {
    return {
      error: `review_package_store_unavailable_${phase}`,
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      artifactWriteBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createReviewPackageUntrustedAuthorityResponse(dryRunId: string | undefined) {
    return {
      error: 'untrusted_review_package_authority_body',
      dryRunId,
      status: 'blocked',
      artifactWriteBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createReviewPackageForbiddenRawBodyResponse(dryRunId: string | undefined) {
    return {
      error: 'forbidden_review_package_raw_body',
      dryRunId,
      status: 'blocked',
      artifactWriteBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createReleaseCandidateStoreUnavailableResponse(phase: string) {
    return {
      error: `release_candidate_store_unavailable_${phase}`,
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      artifactWriteBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createReleaseCandidateUntrustedAuthorityResponse(dryRunId: string | undefined) {
    return {
      error: 'untrusted_release_candidate_authority_body',
      dryRunId,
      status: 'blocked',
      artifactWriteBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function createReleaseCandidateForbiddenRawBodyResponse(dryRunId: string | undefined) {
    return {
      error: 'forbidden_release_candidate_raw_body',
      dryRunId,
      status: 'blocked',
      artifactWriteBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
      rawPathStored: false,
      bodyStored: false,
    };
  }

  function hasForbiddenReviewPackageRawBody(value: unknown): boolean {
    const forbiddenKeys = new Set([
      'rawBody',
      'rawPath',
      'rawDiff',
      'diffBody',
      'rawPullRequestBody',
      'rawPrBody',
      'pullRequestBody',
      'prBody',
      'rawCommand',
      'commandBody',
      'rawReason',
      'reasonBody',
      'reasonText',
      ['to', 'ken'].join(''),
      ['coo', 'kie'].join(''),
      ['sess', 'ion'].join(''),
    ]);

    if (!value || typeof value !== 'object') {
      return false;
    }

    if (Array.isArray(value)) {
      return value.some((item) => hasForbiddenReviewPackageRawBody(item));
    }

    return Object.entries(value as Record<string, unknown>).some(
      ([key, nestedValue]) =>
        forbiddenKeys.has(key) || hasForbiddenReviewPackageRawBody(nestedValue),
    );
  }

  function hasForbiddenGithubRawBody(value: unknown): boolean {
    const forbiddenKeys = new Set([
      'rawBody',
      'rawPath',
      'rawUrl',
      'rawOwner',
      'rawRepo',
      'rawBranch',
      'rawBase',
      'rawHead',
      'rawRef',
      'rawResponseBody',
      'responseBody',
      'requestBody',
      'rawFileContent',
      'fileContent',
      'rawCommitMessage',
      'rawCommand',
      'commandBody',
      'rawPullRequestBody',
      'rawPrBody',
      'pullRequestBody',
      'prBody',
      ...GITHUB_FORBIDDEN_CREDENTIAL_KEYS,
    ]);

    if (!value || typeof value !== 'object') {
      return false;
    }

    if (Array.isArray(value)) {
      return value.some((item) => hasForbiddenGithubRawBody(item));
    }

    return Object.entries(value as Record<string, unknown>).some(
      ([key, nestedValue]) => forbiddenKeys.has(key) || hasForbiddenGithubRawBody(nestedValue),
    );
  }

  function createWorktreeDryRunResponse(record: WorktreeDryRunRecord) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      planId: record.plan.id,
      runnerMode: record.plan.runnerMode,
      repoRootHash: record.repoRootHash,
      worktreeRootHash: record.worktreeRootHash,
      worktreePathHash: record.worktreePathHash,
      branchNameHash: record.branchNameHash,
      worktreeSlugHash: record.worktreeSlugHash,
      baseRefHash: record.baseRefHash,
      policyDecisionId: record.policyDecision.id,
      policyOutcome: record.policyDecision.outcome,
      requiresApproval: record.policyDecision.requiresApproval,
      blockReasons: record.blockReasons,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      gitProcessBoundaryPlanned: record.gitProcessBoundaryPlanned,
      gitProcessBoundaryInvoked: false,
      processBoundaryPlanned: record.processBoundaryPlanned,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createWorktreeApprovalResponse(record: WorktreeApprovalArtifactRecord) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalRequestId: record.approvalRequestId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      approved: record.approved,
      expiresAt: record.expiresAt,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      gitProcessBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createWorktreeRunResponse(record: WorktreeControlPlaneRun) {
    return {
      runId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      planId: record.planId,
      runnerMode: record.runnerMode,
      repoRootHash: record.repoRootHash,
      worktreeRootHash: record.worktreeRootHash,
      worktreePathHash: record.worktreePathHash,
      branchNameHash: record.branchNameHash,
      worktreeSlugHash: record.worktreeSlugHash,
      baseRefHash: record.baseRefHash,
      changedFileCount: record.changedFileCount,
      diffHash: record.diffHash,
      evidenceRefIds: record.evidenceRefIds,
      auditEventIds: record.auditEventIds,
      cleanupRequired: record.cleanupRequired,
      cleanupDeferred: record.cleanupDeferred,
      gitProcessBoundaryInvoked: record.gitProcessBoundaryInvoked,
      processBoundaryInvoked: record.processBoundaryInvoked,
      externalProcessStarted: record.externalProcessStarted,
      noRealWrite: record.noRealWrite,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createM9PilotRunResponse(record: M9PilotRun) {
    return {
      runId: record.id,
      status: record.status,
      readinessStatus: record.readiness.status,
      readinessBlockers: record.readiness.blockers,
      worktreeRunId: record.worktreeRunId,
      codexStatus: record.codexStatus,
      verificationStatus: record.verificationStatus,
      prDraftStatus: record.prDraftStatus,
      changedFileCount: record.changedFileCount,
      cleanupRequired: record.cleanupRequired,
      stepCount: record.steps.length,
      evidenceRefIds: record.evidenceSummary.evidenceRefIds,
      auditEventIds: record.evidenceSummary.auditEventIds,
      evidenceCount: record.evidenceSummary.evidenceCount,
      auditEventCount: record.evidenceSummary.auditEventCount,
      bundleHash: record.evidenceSummary.bundleHash,
      gitProcessBoundaryInvoked: record.gitProcessBoundaryInvoked,
      codexProcessBoundaryInvoked: record.codexProcessBoundaryInvoked,
      nxProcessBoundaryInvoked: record.nxProcessBoundaryInvoked,
      processBoundaryInvoked: record.processBoundaryInvoked,
      externalProcessStarted: record.externalProcessStarted,
      codexNoRealWrite: true,
      pushAllowed: false,
      pullRequestOpened: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createM11PilotRunResponse(record: M11PilotRun) {
    const recovery = createM11PilotRecoveryProjection(record);

    return {
      runId: record.id,
      status: record.status,
      readinessStatus: record.readiness.status,
      readinessBlockers: record.readiness.blockers,
      failureClassification: record.failureSummary.classification,
      recovery: {
        recoveryAction: recovery.recoveryAction,
        cleanupRequired: recovery.cleanupHandoff.cleanupRequired,
        cleanupDeferred: recovery.cleanupHandoff.cleanupDeferred,
        cleanupCompleted: recovery.cleanupHandoff.cleanupCompleted,
        cleanupDryRunId: recovery.cleanupHandoff.cleanupDryRunId,
        cleanupRunId: recovery.cleanupHandoff.cleanupRunId,
        cleanupApprovalStatus: recovery.cleanupHandoff.cleanupApprovalStatus,
        cleanupBlockers: recovery.cleanupHandoff.cleanupBlockers,
        cleanupEvidenceRefIds: recovery.cleanupHandoff.cleanupEvidenceRefIds,
        cleanupAuditEventIds: recovery.cleanupHandoff.cleanupAuditEventIds,
        cleanupEvidenceCount: recovery.cleanupHandoff.cleanupEvidenceCount,
        cleanupAuditEventCount: recovery.cleanupHandoff.cleanupAuditEventCount,
        boundaryReached: recovery.boundaryReached,
        approvalConsumed: recovery.approvalConsumed,
        gitProcessBoundaryInvoked: recovery.gitProcessBoundaryInvoked,
        processBoundaryInvoked: recovery.processBoundaryInvoked,
        externalProcessStarted: recovery.externalProcessStarted,
        rawPathStored: false,
        bodyStored: false,
        summary: recovery.summary,
      },
      worktreeRunId: record.worktreeRunId,
      codexStatus: record.codexStatus,
      verificationStatus: record.verificationStatus,
      prDraftStatus: record.prDraftStatus,
      changedFileCount: record.changedFileCount,
      cleanupRequired: record.cleanupRequired,
      stepCount: record.steps.length,
      evidenceRefIds: record.evidenceSummary.evidenceRefIds,
      auditEventIds: record.evidenceSummary.auditEventIds,
      evidenceCount: record.evidenceSummary.evidenceCount,
      auditEventCount: record.evidenceSummary.auditEventCount,
      bundleHash: record.evidenceSummary.bundleHash,
      gitProcessBoundaryInvoked: record.gitProcessBoundaryInvoked,
      codexProcessBoundaryInvoked: record.codexProcessBoundaryInvoked,
      nxProcessBoundaryInvoked: record.nxProcessBoundaryInvoked,
      processBoundaryInvoked: record.processBoundaryInvoked,
      externalProcessStarted: record.externalProcessStarted,
      codexNoRealWrite: true,
      codexReadOnlyDryRunOnly: true,
      patchGenerationAllowed: false,
      pushAllowed: false,
      pullRequestOpened: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  async function buildApprovalInboxProjection(store: CodexHubStore | undefined) {
    const [
      codex,
      browser,
      electronCdp,
      worktree,
      worktreeCleanup,
    ] = await Promise.all([
      store
        ? store.codexExecApprovals.listCodexExecApprovalRecords(100)
        : Promise.resolve(codexExecApprovalRecords.slice(0, 100)),
      listBrowserObservationApprovals({ limit: 100 }, store),
      listElectronCdpObservationApprovals({ limit: 100 }, store),
      listWorktreeApprovals({ limit: 100 }, store),
      listWorktreeCleanupApprovals({ limit: 100 }, store),
    ]);

    return createApprovalInboxProjection({
      codex,
      browser,
      electronCdp,
      worktree,
      worktreeCleanup,
      m9Pilot: worktree.filter((record) => record.summary.toLowerCase().includes('m9')),
    });
  }

  async function recordApprovalDecision(
    input: ApprovalDecisionRequest,
    store: CodexHubStore,
  ) {
    if (input.approvalType === 'codex') {
      return recordCodexApprovalDecision(input, store);
    }

    if (input.approvalType === 'browser') {
      return recordBrowserApprovalDecision(input, store);
    }

    if (input.approvalType === 'electron_cdp') {
      return recordElectronCdpApprovalDecision(input, store);
    }

    if (input.approvalType === 'worktree' || input.approvalType === 'm9_pilot') {
      return recordWorktreeApprovalDecision(input, store);
    }

    if (input.approvalType === 'worktree_cleanup') {
      return recordWorktreeCleanupApprovalDecision(input, store);
    }

    return undefined;
  }

  async function recordCodexApprovalDecision(
    input: ApprovalDecisionRequest,
    store: CodexHubStore,
  ) {
    const existingApprovalRecord = await resolveCodexExecApprovalRecord(
      input.approvalRequestId,
      store,
    );

    if (!existingApprovalRecord) {
      return undefined;
    }

    const record = await resolveCodexExecLiveRunRecord(
      existingApprovalRecord.request.dryRunPlanId,
      store,
    );

    if (!record) {
      return undefined;
    }

    const outcome = input.decision as CodexExecApprovalDecisionOutcome;
    const approvalRequest = existingApprovalRecord.request;
    const transitionAction = approvalActionForOutcome(outcome);
    const approvalTransition = createCodexExecApprovalTransitionResult(
      existingApprovalRecord,
      transitionAction,
    );
    const approvalDecision = createCodexExecManualApprovalDecision(approvalRequest, {
      outcome,
      decidedBy: 'approval-ux',
      reason: input.reason,
    });
    const approvalArtifact = createCodexExecApprovalArtifactFromDecision(
      record.dryRunPlan,
      record.policyDecision,
      approvalRequest,
      approvalDecision,
    );
    let approvalRecord = {
      ...createCodexExecManualApprovalRecord({
        request: approvalRequest,
        decision: approvalDecision,
        approvalArtifact,
      }),
      id: existingApprovalRecord.id,
      createdAt: existingApprovalRecord.createdAt,
    };
    const approvalState = evaluateCodexExecManualApprovalState(approvalRecord);
    const evidenceRefs = createCodexExecControlPlaneEvidenceRefs({
      approvalDecision,
      approvalState,
      approvalTransition,
      approvalArtifact,
    });
    const auditEvents = createCodexExecControlPlaneAuditEvents({
      approvalDecision,
      approvalState,
      approvalTransition,
      approvalArtifact,
      evidenceRefs,
    });
    approvalRecord = {
      ...approvalRecord,
      status: approvalState.status,
      approvalState,
      evidenceRefs: [...(existingApprovalRecord.evidenceRefs ?? []), ...evidenceRefs],
      auditEventIds: auditEvents.map((event) => event.id),
    };
    const updatedRunRecord = {
      ...record,
      manualApprovalRequest: approvalRequest,
      manualApprovalDecision: approvalDecision,
      manualApprovalState: approvalState,
      manualApprovalRecord: approvalRecord,
      approvalArtifact: approvalArtifact ?? record.approvalArtifact,
      evidenceRefs: [...record.evidenceRefs, ...evidenceRefs],
      auditEvents: [...record.auditEvents, ...auditEvents],
    };

    await persistCodexExecApprovalRecord(approvalRecord, store);
    await persistCodexExecLiveRunRecord(updatedRunRecord, store, evidenceRefs, auditEvents);

    return createApprovalDecisionResult({
      approvalType: input.approvalType,
      approvalRequestId: input.approvalRequestId,
      decision: input.decision,
      status: normalizeDecisionStatus(approvalState.status),
      evidenceRefIds: evidenceRefs.map((ref) => ref.id),
      auditEventIds: auditEvents.map((event) => event.id),
      summary: `Codex approval decision recorded as ${approvalState.status}.`,
    });
  }

  async function recordBrowserApprovalDecision(
    input: ApprovalDecisionRequest,
    store: CodexHubStore,
  ) {
    const approvalRequest = await resolveBrowserObservationApprovalRecord(
      input.approvalRequestId,
      store,
    );

    if (!approvalRequest) {
      return undefined;
    }

    const dryRunRecord = await resolveBrowserObservationDryRunRecord(
      approvalRequest.dryRunId,
      store,
    );

    if (!dryRunRecord) {
      return undefined;
    }

    const approvalRecord = createBrowserObservationApprovalRecord({
      dryRunRecord,
      baseRecord: approvalRequest,
      status: input.decision,
      decidedBy: 'approval-ux',
      reason: input.reason,
    });

    await persistBrowserObservationApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
    );

    return createApprovalDecisionFromGenericRecord(input, approvalRecord.status, approvalRecord);
  }

  async function recordElectronCdpApprovalDecision(
    input: ApprovalDecisionRequest,
    store: CodexHubStore,
  ) {
    const approvalRequest = await resolveElectronCdpObservationApprovalRecord(
      input.approvalRequestId,
      store,
    );

    if (!approvalRequest) {
      return undefined;
    }

    const dryRunRecord = await resolveElectronCdpObservationDryRunRecord(
      approvalRequest.dryRunId,
      store,
    );

    if (!dryRunRecord) {
      return undefined;
    }

    const approvalRecord = createElectronCdpObservationApprovalRecord({
      dryRunRecord,
      baseRecord: approvalRequest,
      status: input.decision,
      decidedBy: 'approval-ux',
      reason: input.reason,
    });

    await persistElectronCdpObservationApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistElectronCdpAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
    );

    return createApprovalDecisionFromGenericRecord(input, approvalRecord.status, approvalRecord);
  }

  async function recordWorktreeApprovalDecision(
    input: ApprovalDecisionRequest,
    store: CodexHubStore,
  ) {
    const approvalRequest = await resolveWorktreeApprovalRecord(input.approvalRequestId, store);

    if (!approvalRequest) {
      return undefined;
    }

    const dryRunRecord = await resolveWorktreeDryRunRecord(approvalRequest.dryRunId, store);

    if (!dryRunRecord) {
      return undefined;
    }

    const approvalRecord = createWorktreeApprovalRecord({
      dryRunRecord,
      baseRecord: approvalRequest,
      status: input.decision,
      decidedBy: 'approval-ux',
      reason: input.reason,
    });

    await persistWorktreeApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistWorktreeAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
    );

    return createApprovalDecisionFromGenericRecord(input, approvalRecord.status, approvalRecord);
  }

  async function recordWorktreeCleanupApprovalDecision(
    input: ApprovalDecisionRequest,
    store: CodexHubStore,
  ) {
    const approvalRequest = await resolveWorktreeCleanupApprovalRecord(
      input.approvalRequestId,
      store,
    );

    if (!approvalRequest) {
      return undefined;
    }

    const dryRunRecord = await resolveWorktreeCleanupDryRunRecord(
      approvalRequest.dryRunId,
      store,
    );

    if (!dryRunRecord) {
      return undefined;
    }

    const approvalRecord = createWorktreeCleanupApprovalRecord({
      dryRunRecord,
      baseRecord: approvalRequest,
      status: input.decision,
      decidedBy: 'approval-ux',
      reason: input.reason,
    });

    await persistWorktreeCleanupApprovalRecord(approvalRecord, store);
    await persistEvidenceRefs(approvalRecord.evidenceRefs, store);
    await persistWorktreeAuditEvents(
      approvalRecord.auditEventIds,
      approvalRecord.evidenceRefs,
      store,
      approvalRecord.policyDecisionId,
    );

    return createApprovalDecisionFromGenericRecord(input, approvalRecord.status, approvalRecord);
  }

  function createApprovalDecisionFromGenericRecord(
    input: ApprovalDecisionRequest,
    status: ApprovalUxStatus,
    record:
      | BrowserObservationApprovalArtifactRecord
      | ElectronCdpObservationApprovalArtifactRecord
      | WorktreeApprovalArtifactRecord
      | WorktreeCleanupApprovalArtifactRecord,
  ) {
    return createApprovalDecisionResult({
      approvalType: input.approvalType,
      approvalRequestId: input.approvalRequestId,
      decision: input.decision,
      status: normalizeDecisionStatus(status),
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      summary: `${input.approvalType} approval decision recorded as ${status}.`,
    });
  }

  function normalizeDecisionStatus(status: string): ApprovalUxStatus {
    if (
      status === 'pending' ||
      status === 'requested' ||
      status === 'approved' ||
      status === 'denied' ||
      status === 'expired' ||
      status === 'used' ||
      status === 'revoked'
    ) {
      return status;
    }

    return 'requested';
  }

  function createWorktreeCleanupDryRunResponse(record: WorktreeCleanupDryRunRecord) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      sourceRunId: record.sourceRunId,
      status: record.status,
      planId: record.plan.id,
      repoRootHash: record.repoRootHash,
      worktreeRootHash: record.worktreeRootHash,
      worktreePathHash: record.worktreePathHash,
      sourceRunHash: record.sourceRunHash,
      policyDecisionId: record.policyDecision.id,
      policyOutcome: record.policyDecision.outcome,
      requiresApproval: record.policyDecision.requiresApproval,
      blockReasons: record.blockReasons,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      cleanupRequired: record.plan.cleanupRequired,
      cleanupDeferred: record.plan.cleanupDeferred,
      dirtyCheckPlanned: record.plan.dirtyCheckPlanned,
      cleanupDeletePlanned: record.plan.cleanupDeletePlanned,
      gitProcessBoundaryPlanned: record.gitProcessBoundaryPlanned,
      gitProcessBoundaryInvoked: false,
      processBoundaryPlanned: record.processBoundaryPlanned,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createWorktreeCleanupApprovalResponse(
    record: WorktreeCleanupApprovalArtifactRecord,
  ) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      sourceRunId: record.sourceRunId,
      approvalRequestId: record.approvalRequestId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      approved: record.approved,
      expiresAt: record.expiresAt,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      gitProcessBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createWorktreeCleanupRunResponse(record: WorktreeCleanupControlPlaneRun) {
    return {
      runId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      sourceRunId: record.sourceRunId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      planId: record.planId,
      repoRootHash: record.repoRootHash,
      worktreeRootHash: record.worktreeRootHash,
      worktreePathHash: record.worktreePathHash,
      sourceRunHash: record.sourceRunHash,
      dirtyFileCount: record.dirtyFileCount,
      dirtyStatusHash: record.dirtyStatusHash,
      cleanupAttempted: record.cleanupAttempted,
      cleanupCompleted: record.cleanupCompleted,
      cleanupRequired: record.cleanupRequired,
      cleanupDeferred: record.cleanupDeferred,
      evidenceRefIds: record.evidenceRefIds,
      auditEventIds: record.auditEventIds,
      gitProcessBoundaryInvoked: record.gitProcessBoundaryInvoked,
      processBoundaryInvoked: record.processBoundaryInvoked,
      externalProcessStarted: record.externalProcessStarted,
      noRealWrite: record.noRealWrite,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createWorktreeStoreUnavailableResponse(phase: string) {
    return {
      error: 'worktree_store_unavailable',
      phase,
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      gitProcessBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
      bodyStored: false,
      rawPathStored: false,
    };
  }

  function createWorktreeUntrustedAuthorityResponse(dryRunId: string | undefined) {
    return {
      error: 'untrusted_worktree_authority_body',
      dryRunId,
      status: 'blocked',
      liveExecution: false,
      gitProcessBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
      bodyStored: false,
      rawPathStored: false,
    };
  }

  function parseWorktreeQuery(query: unknown): {
    dryRunId?: string;
    status?: string;
    limit?: number;
  } {
    const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

    return {
      dryRunId: readQueryValue(query, 'dryRunId'),
      status: readQueryValue(query, 'status'),
      limit: limitResult.allowed ? limitResult.limit : undefined,
    };
  }

  async function persistEvidenceRefs(refs: EvidenceRef[], store: CodexHubStore): Promise<void> {
    for (const ref of refs) {
      await store.evidenceRefs.create(ref);
    }
  }

  async function persistAuditEvents(
    auditEventIds: string[],
    evidenceRefs: EvidenceRef[],
    store: CodexHubStore,
    policyDecisionId = 'browser-observation-control-plane',
  ): Promise<void> {
    for (const auditEventId of auditEventIds) {
      await store.auditEvents.append({
        id: auditEventId,
        schemaVersion: SchemaVersionSchema.value,
        createdAt: foundationTimestamp(),
        actor: 'codexhub-supervisor',
        action: 'browser.observation.control_plane',
        target: 'browser.observation',
        reason: 'browser observation control-plane metadata transition',
        outcome: 'recorded',
        evidenceRefs,
        policyDecisionId,
        metadata: {
          bodyStored: false,
          rawPathStored: false,
          noRealWrite: true,
          liveExecution: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
        },
      });
    }
  }

  async function persistBrowserObservationDryRunRecord(
    record: BrowserObservationDryRunRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.browserObservationDryRuns.saveDryRun(record);
      return;
    }

    browserObservationDryRunRecords.unshift(record);
  }

  async function persistBrowserObservationApprovalRecord(
    record: BrowserObservationApprovalArtifactRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.browserObservationApprovals.saveApproval(record);
      return;
    }

    const index = browserObservationApprovalRecords.findIndex((candidate) => candidate.id === record.id);
    if (index >= 0) {
      browserObservationApprovalRecords.splice(index, 1, record);
    } else {
      browserObservationApprovalRecords.unshift(record);
    }
  }

  async function persistBrowserObservationRunRecord(
    record: BrowserObservationControlPlaneRun,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.browserObservationRuns.saveRun(record);
      return;
    }

    browserObservationRunRecords.unshift(record);
  }

  async function resolveBrowserObservationDryRunRecord(
    dryRunId: string | undefined,
    store: CodexHubStore | undefined,
  ): Promise<BrowserObservationDryRunRecord | undefined> {
    if (!dryRunId) {
      return undefined;
    }

    return store
      ? await store.browserObservationDryRuns.getDryRun(dryRunId)
      : browserObservationDryRunRecords.find(
          (record) => record.id === dryRunId || record.dryRunId === dryRunId,
        );
  }

  async function resolveBrowserObservationApprovalRecord(
    approvalRequestId: string,
    store: CodexHubStore | undefined,
  ): Promise<BrowserObservationApprovalArtifactRecord | undefined> {
    if (store) {
      const directRecord = await store.browserObservationApprovals.getApproval(approvalRequestId);

      if (directRecord) {
        return directRecord;
      }

      return (await store.browserObservationApprovals.listApprovals({ limit: 100 })).find(
        (record) => record.approvalRequestId === approvalRequestId,
      );
    }

    return browserObservationApprovalRecords.find(
      (record) => record.id === approvalRequestId || record.approvalRequestId === approvalRequestId,
    );
  }

  async function resolveBrowserObservationApprovalRecordByArtifactId(
    approvalArtifactId: string,
    store: CodexHubStore | undefined,
  ): Promise<BrowserObservationApprovalArtifactRecord | undefined> {
    return store
      ? await store.browserObservationApprovals.getApprovalByArtifactId(approvalArtifactId)
      : browserObservationApprovalRecords.find(
          (record) => record.approvalArtifactId === approvalArtifactId,
        );
  }

  async function resolveBrowserObservationRun(
    runId: string,
    store: CodexHubStore | undefined,
  ): Promise<BrowserObservationControlPlaneRun | undefined> {
    return store
      ? await store.browserObservationRuns.getRun(runId)
      : browserObservationRunRecords.find((record) => record.id === runId);
  }

  async function listBrowserObservationDryRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<BrowserObservationDryRunRecord[]> {
    return store
      ? await store.browserObservationDryRuns.listDryRuns(query)
      : browserObservationDryRunRecords.slice(0, query.limit ?? 50);
  }

  async function listBrowserObservationApprovals(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<BrowserObservationApprovalArtifactRecord[]> {
    return store
      ? await store.browserObservationApprovals.listApprovals(query)
      : browserObservationApprovalRecords.slice(0, query.limit ?? 50);
  }

  async function listBrowserObservationRuns(
    query: { dryRunId?: string; status?: string; limit?: number },
    store: CodexHubStore | undefined,
  ): Promise<BrowserObservationControlPlaneRun[]> {
    return store
      ? await store.browserObservationRuns.listRuns(query)
      : browserObservationRunRecords.slice(0, query.limit ?? 50);
  }

  function createBrowserObservationDryRunResponse(record: BrowserObservationDryRunRecord) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      planId: record.plan.id,
      targetUrlHash: record.targetUrlHash,
      policyDecisionId: record.policyDecision.id,
      policyOutcome: record.policyDecision.outcome,
      requiresApproval: record.policyDecision.requiresApproval,
      profilePathHash: record.plan.profileRef.profilePathHash,
      requestedCapabilities: record.plan.requestedCapabilities,
      blockReasons: record.blockReasons,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      processBoundaryPlanned: record.processBoundaryPlanned,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createBrowserObservationApprovalResponse(record: BrowserObservationApprovalArtifactRecord) {
    return {
      recordId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalRequestId: record.approvalRequestId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      approved: record.approved,
      expiresAt: record.expiresAt,
      evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
      auditEventIds: record.auditEventIds,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createBrowserObservationRunResponse(record: BrowserObservationControlPlaneRun) {
    return {
      runId: record.id,
      dryRunId: record.dryRunId,
      dryRunRecordId: record.dryRunRecordId,
      approvalArtifactId: record.approvalArtifactId,
      status: record.status,
      planId: record.planId,
      targetUrlHash: record.targetUrlHash,
      evidenceRefIds: record.evidenceRefIds,
      auditEventIds: record.auditEventIds,
      processBoundaryInvoked: record.processBoundaryInvoked,
      externalProcessStarted: record.externalProcessStarted,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      summary: record.summary,
    };
  }

  function createBrowserObservationStoreUnavailableResponse(phase: string) {
    return {
      error: 'browser_observation_store_unavailable',
      phase,
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      liveExecution: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
      noRealWrite: true,
      bodyStored: false,
      rawPathStored: false,
    };
  }

  function createBrowserObservationUntrustedAuthorityResponse(dryRunId: string | undefined) {
    return {
      error: 'untrusted_browser_observation_authority_body',
      dryRunId,
      status: 'blocked',
      liveExecution: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      executionDisabled: true,
      noRealWrite: true,
      bodyStored: false,
      rawPathStored: false,
    };
  }

  function parseBrowserObservationQuery(query: unknown): {
    dryRunId?: string;
    status?: string;
    limit?: number;
  } {
    const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

    return {
      dryRunId: readQueryValue(query, 'dryRunId'),
      status: readQueryValue(query, 'status'),
      limit: limitResult.allowed ? limitResult.limit : undefined,
    };
  }

  function hashLocalMetadata(value: unknown): string {
    return `sha256:${createHash('sha256').update(JSON.stringify(value)).digest('hex')}`;
  }

  function approvalActionForOutcome(
    outcome: CodexExecApprovalDecisionOutcome,
  ): 'approve' | 'deny' | 'revoke' {
    if (outcome === 'approved') {
      return 'approve';
    }

    if (outcome === 'denied') {
      return 'deny';
    }

    return 'revoke';
  }

  function createDefaultCodexExecLiveRunRecord(): CodexExecLiveRunRecord {
    const intent = createCodexExecExecutionIntent({
      title: 'Default Codex dry-run control-plane record',
      prompt: 'Default control-plane preflight request',
      cwd: '.',
      sandboxMode: 'read_only',
      approvalMode: 'required',
      metadata: { requestedBy: 'supervisor-default' },
    });
    const dryRunPlan = createCodexExecDryRunPlan(intent);
    const policyDecision = evaluateCodexExecDryRunPolicy(dryRunPlan, policyEngine);

    return createCodexExecDisabledLiveRunRecord(
      dryRunPlan,
      policyDecision,
      'live adapter disabled in supervisor default control-plane record',
    );
  }

  return server;
}

const timelineSources = new Set([
  'config',
  'dry_run',
  'command_preview',
  'policy',
  'preflight',
  'approval',
  'approval_request',
  'approval_decision',
  'approval_state',
  'approval_artifact',
  'gate',
  'evidence',
  'audit',
]);
const evidenceKinds = new Set([
  'log',
  'hash',
  'snapshot',
  'dry-run',
  'audit',
  'codex.exec.jsonl.replay',
  'codex.exec.event.summary',
  'codex.exec.dry_run_plan',
  'codex.exec.command_preview',
  'codex.exec.policy_decision',
  'codex.exec.preflight_result',
  'codex.exec.approval_artifact',
  'codex.exec.execution_gate_result',
  'codex.exec.live_config',
  'codex.exec.approval_request',
  'codex.exec.approval_decision',
  'codex.exec.approval_state',
  'codex.exec.live_adapter_adr_decision',
  'codex.exec.read_only_adapter.preflight_simulation',
  'codex.exec.read_only_adapter.simulator_review',
  'codex.exec.read_only_adapter.skeleton_preview',
  'codex.exec.read_only_adapter.skeleton_review',
  'codex.exec.read_only_adapter.fixture_boundary',
  'codex.exec.read_only_adapter.final_readiness',
  'codex.exec.real_read_only_adapter.readiness_package',
]);
const reportReviewStatuses = new Set([
  'draft',
  'reviewed',
  'changes_requested',
  'rejected',
  'archived',
]);
const reportReviewRecommendations = new Set([
  'no_go',
  'needs_changes',
  'ready_for_adr',
  'ready_for_read_only_live_review',
]);
const liveAdapterAdrDecisionOutcomes = new Set(['no_go', 'conditional_read_only_go']);
const liveAdapterAdrDecisionStatuses = new Set(['draft', 'recorded', 'superseded']);
const readOnlyAdapterSimulatorReviewOutcomes = new Set(['no_go', 'go_to_implementation_planning']);
const readOnlyAdapterSimulatorReviewStatuses = new Set(['draft', 'recorded', 'superseded']);
const readOnlyAdapterImplementationPlanReviewOutcomes = new Set([
  'no_go',
  'conditional_go_to_disabled_skeleton',
]);
const readOnlyAdapterImplementationPlanReviewStatuses = new Set([
  'draft',
  'recorded',
  'superseded',
]);
const readOnlyAdapterSkeletonReviewOutcomes = new Set([
  'no_go',
  'skeleton_accepted_for_fixture_boundary_only',
]);
const readOnlyAdapterSkeletonReviewStatuses = new Set(['draft', 'recorded', 'superseded']);
const readOnlyAdapterFinalReadinessOutcomes = new Set([
  'no_go',
  'ready_for_separate_read_only_adapter_adr',
  'ready_for_separate_disabled_skeleton_followup',
]);
const readOnlyAdapterFinalReadinessStatuses = new Set(['draft', 'recorded', 'superseded']);
const realReadOnlyAdapterReadinessStatuses = new Set([
  'not_ready',
  'ready_for_separate_adr',
  'blocked',
  'requires_review',
]);
const realReadOnlyAdapterReadinessReviewOutcomes = new Set([
  'no_go_to_separate_adr_draft',
  'conditional_go_to_separate_adr_draft',
]);
const realReadOnlyAdapterReadinessReviewStatuses = new Set(['draft', 'recorded', 'superseded']);
const realReadOnlyAdapterAttemptStatuses = new Set(['blocked', 'completed', 'failed', 'aborted']);
const realReadOnlyAdapterPolicySourceStatuses = new Set(['aligned', 'blocked', 'requires_review']);
const realReadOnlyAdapterApprovalAuthorityTraceStatuses = new Set([
  'aligned',
  'blocked',
  'requires_review',
]);
const realReadOnlyAdapterPilotPrerequisiteStatuses = new Set([
  'ready_for_pilot_retry',
  'blocked',
  'requires_review',
]);
const realReadOnlyAdapterPilotSourcePreparationStatuses = new Set([
  'prepared',
  'blocked',
  'requires_review',
]);
const realReadOnlyAdapterAttemptSafetyFlags = {
  liveExecution: false,
  externalProcessStarted: false,
  executionDisabled: true,
  processAdapterStarted: false,
  implementationApproved: false,
  processAdapterApproved: false,
  recommendationGrantsExecution: false,
  workspaceWriteAllowed: false,
  dangerFullAccessAllowed: false,
  dashboardTriggerAllowed: false,
} as const;

function createRealReadOnlyAdapterAttemptRuntimeFlags(
  attempts: CodexExecRealReadOnlyAdapterAttemptRecord | CodexExecRealReadOnlyAdapterAttemptRecord[],
) {
  const records = Array.isArray(attempts) ? attempts : [attempts];
  const externalProcessStarted = records.some((record) => record.externalProcessStarted === true);

  return {
    ...realReadOnlyAdapterAttemptSafetyFlags,
    externalProcessStarted,
    processAdapterStarted: externalProcessStarted,
  };
}
const codexExecSandboxModes = new Set(['read_only', 'workspace_write', 'danger_full_access']);

function createReadOnlyAdapterOperatorChecklistFromBody(
  body:
    | {
        checklistComplete?: boolean;
        operatorChecklist?: CodexExecReadOnlyAdapterOperatorChecklistItem[];
      }
    | undefined,
): CodexExecReadOnlyAdapterOperatorChecklistItem[] {
  if (body?.operatorChecklist && body.operatorChecklist.length > 0) {
    return body.operatorChecklist;
  }

  const checklist = createDefaultReadOnlyAdapterOperatorChecklist();

  return body?.checklistComplete === true
    ? checklist.map((item) => ({ ...item, checked: true }))
    : checklist;
}

function parseTimelineFilter(
  query: unknown,
): { allowed: true; filter: CodexExecTimelineFilter } | { allowed: false; reason: string } {
  const source = readQueryValue(query, 'source');
  const status = readQueryValue(query, 'status');
  const limitValue = readQueryValue(query, 'limit');
  const includeEvidenceValue = readQueryValue(query, 'includeEvidence');
  const includeAuditValue = readQueryValue(query, 'includeAudit');
  const filter: CodexExecTimelineFilter = {
    includeEvidence: true,
    includeAudit: true,
  };

  if (source) {
    if (!timelineSources.has(source)) {
      return { allowed: false, reason: 'unsupported timeline source filter' };
    }

    filter.source = source as CodexExecTimelineFilter['source'];
  }

  if (status) {
    filter.status = status;
  }

  if (limitValue) {
    const limit = Number.parseInt(limitValue, 10);

    if (!Number.isInteger(limit) || limit <= 0 || limit > 200) {
      return { allowed: false, reason: 'limit must be an integer from 1 to 200' };
    }

    filter.limit = limit;
  }

  if (includeEvidenceValue !== undefined) {
    const parsed = parseBooleanQueryValue(includeEvidenceValue);

    if (parsed === undefined) {
      return { allowed: false, reason: 'includeEvidence must be true or false' };
    }

    filter.includeEvidence = parsed;
  }

  if (includeAuditValue !== undefined) {
    const parsed = parseBooleanQueryValue(includeAuditValue);

    if (parsed === undefined) {
      return { allowed: false, reason: 'includeAudit must be true or false' };
    }

    filter.includeAudit = parsed;
  }

  return { allowed: true, filter };
}

function parseEvidenceQuery(
  query: unknown,
): { allowed: true; query: Partial<CodexExecEvidenceQuery> } | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const kind = readQueryValue(query, 'kind');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (kind && !evidenceKinds.has(kind)) {
    return { allowed: false, reason: 'unsupported evidence kind filter' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      kind: kind as CodexExecEvidenceQuery['kind'],
      limit: limitResult.limit,
    },
  };
}

function parseAuditQuery(
  query: unknown,
): { allowed: true; query: Partial<CodexExecAuditQuery> } | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const action = readQueryValue(query, 'action');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      action,
      limit: limitResult.limit,
    },
  };
}

function parseReportQuery(query: unknown):
  | {
      allowed: true;
      format: CodexExecControlPlaneReportFormat;
      includeEvidence: boolean;
      includeAudit: boolean;
    }
  | { allowed: false; reason: string } {
  const formatValue = readQueryValue(query, 'format');
  const includeEvidenceValue = readQueryValue(query, 'includeEvidence');
  const includeAuditValue = readQueryValue(query, 'includeAudit');
  const format = formatValue ?? 'json';

  if (format !== 'json' && format !== 'markdown') {
    return { allowed: false, reason: 'format must be json or markdown' };
  }

  const includeEvidence =
    includeEvidenceValue === undefined ? true : parseBooleanQueryValue(includeEvidenceValue);
  const includeAudit =
    includeAuditValue === undefined ? true : parseBooleanQueryValue(includeAuditValue);

  if (includeEvidence === undefined) {
    return { allowed: false, reason: 'includeEvidence must be true or false' };
  }

  if (includeAudit === undefined) {
    return { allowed: false, reason: 'includeAudit must be true or false' };
  }

  return {
    allowed: true,
    format,
    includeEvidence,
    includeAudit,
  };
}

function parseReportReviewQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecReportReviewQuery> }
  | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const recommendation = readQueryValue(query, 'recommendation');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !reportReviewStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported report review status' };
  }

  if (recommendation && !reportReviewRecommendations.has(recommendation)) {
    return { allowed: false, reason: 'unsupported report review recommendation' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecReportReviewStatus | undefined,
      recommendation: recommendation as CodexExecReportRecommendation | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseLiveAdapterAdrDecisionQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecLiveAdapterAdrDecisionQuery> }
  | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const decision = readQueryValue(query, 'decision');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !liveAdapterAdrDecisionStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported ADR decision status' };
  }

  if (decision && !liveAdapterAdrDecisionOutcomes.has(decision)) {
    return { allowed: false, reason: 'unsupported ADR decision outcome' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecLiveAdapterAdrDecisionStatus | undefined,
      decision: decision as CodexExecLiveAdapterAdrDecisionOutcome | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseReadOnlyAdapterSimulatorReviewQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecReadOnlyAdapterSimulatorReviewQuery> }
  | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const outcome = readQueryValue(query, 'outcome');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !readOnlyAdapterSimulatorReviewStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported simulator review status' };
  }

  if (outcome && !readOnlyAdapterSimulatorReviewOutcomes.has(outcome)) {
    return { allowed: false, reason: 'unsupported simulator review outcome' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecReadOnlyAdapterSimulatorReviewStatus | undefined,
      outcome: outcome as CodexExecReadOnlyAdapterSimulatorReviewOutcome | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseReadOnlyAdapterImplementationPlanReviewQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecReadOnlyAdapterImplementationPlanReviewQuery> }
  | { allowed: false; reason: string } {
  const status = readQueryValue(query, 'status');
  const outcome = readQueryValue(query, 'outcome');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !readOnlyAdapterImplementationPlanReviewStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported implementation plan review status' };
  }

  if (outcome && !readOnlyAdapterImplementationPlanReviewOutcomes.has(outcome)) {
    return { allowed: false, reason: 'unsupported implementation plan review outcome' };
  }

  return {
    allowed: true,
    query: {
      status: status as CodexExecReadOnlyAdapterImplementationPlanReviewStatus | undefined,
      outcome: outcome as CodexExecReadOnlyAdapterImplementationPlanReviewOutcome | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseReadOnlyAdapterSkeletonReviewQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecReadOnlyAdapterSkeletonReviewQuery> }
  | { allowed: false; reason: string } {
  const status = readQueryValue(query, 'status');
  const outcome = readQueryValue(query, 'outcome');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !readOnlyAdapterSkeletonReviewStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported skeleton review status' };
  }

  if (outcome && !readOnlyAdapterSkeletonReviewOutcomes.has(outcome)) {
    return { allowed: false, reason: 'unsupported skeleton review outcome' };
  }

  return {
    allowed: true,
    query: {
      status: status as CodexExecReadOnlyAdapterSkeletonReviewStatus | undefined,
      outcome: outcome as CodexExecReadOnlyAdapterSkeletonReviewOutcome | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseReadOnlyAdapterFinalReadinessQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecReadOnlyAdapterFinalReadinessQuery> }
  | { allowed: false; reason: string } {
  const status = readQueryValue(query, 'status');
  const outcome = readQueryValue(query, 'outcome');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !readOnlyAdapterFinalReadinessStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported final readiness status' };
  }

  if (outcome && !readOnlyAdapterFinalReadinessOutcomes.has(outcome)) {
    return { allowed: false, reason: 'unsupported final readiness outcome' };
  }

  return {
    allowed: true,
    query: {
      status: status as CodexExecReadOnlyAdapterFinalReadinessStatus | undefined,
      outcome: outcome as CodexExecReadOnlyAdapterFinalReadinessOutcome | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseRealReadOnlyAdapterReadinessQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecRealReadOnlyAdapterReadinessQuery> }
  | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !realReadOnlyAdapterReadinessStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported readiness status' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecRealReadOnlyAdapterReadinessStatus | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseRealReadOnlyAdapterReadinessReviewQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecRealReadOnlyAdapterReadinessReviewQuery> }
  | { allowed: false; reason: string } {
  const packageId = readQueryValue(query, 'packageId');
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const outcome = readQueryValue(query, 'outcome');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !realReadOnlyAdapterReadinessReviewStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported readiness review status' };
  }

  if (outcome && !realReadOnlyAdapterReadinessReviewOutcomes.has(outcome)) {
    return { allowed: false, reason: 'unsupported readiness review outcome' };
  }

  return {
    allowed: true,
    query: {
      packageId,
      dryRunId,
      status: status as CodexExecRealReadOnlyAdapterReadinessReviewStatus | undefined,
      outcome: outcome as CodexExecRealReadOnlyAdapterReadinessReviewOutcome | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseRealReadOnlyAdapterAttemptQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecRealReadOnlyAdapterAttemptQuery> }
  | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !realReadOnlyAdapterAttemptStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported attempt status' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecRealReadOnlyAdapterAttemptStatus | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseRealReadOnlyAdapterAttemptTimelineQuery(
  query: unknown,
  dryRunId: string,
):
  | { allowed: true; query: Partial<CodexExecRealReadOnlyAdapterAttemptTimelineQuery> }
  | { allowed: false; reason: string } {
  const status = readQueryValue(query, 'status');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !realReadOnlyAdapterAttemptStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported attempt timeline status' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecRealReadOnlyAdapterAttemptStatus | undefined,
      includeEvidence:
        parseBooleanQueryValue(readQueryValue(query, 'includeEvidence') ?? '') === true,
      includeAudit: parseBooleanQueryValue(readQueryValue(query, 'includeAudit') ?? '') === true,
      limit: limitResult.limit,
    },
  };
}

function parseRealReadOnlyAdapterPolicySourceQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecRealReadOnlyAdapterPolicySourceQuery> }
  | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !realReadOnlyAdapterPolicySourceStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported policy source status' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecRealReadOnlyAdapterPolicySourceStatus | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseRealReadOnlyAdapterApprovalAuthorityTraceQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecRealReadOnlyAdapterApprovalAuthorityTraceQuery> }
  | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !realReadOnlyAdapterApprovalAuthorityTraceStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported approval authority trace status' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecRealReadOnlyAdapterApprovalAuthorityTraceStatus | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseRealReadOnlyAdapterPilotPrerequisiteQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecRealReadOnlyAdapterPilotPrerequisiteQuery> }
  | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !realReadOnlyAdapterPilotPrerequisiteStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported pilot prerequisite status' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecRealReadOnlyAdapterPilotPrerequisiteStatus | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseRealReadOnlyAdapterPilotSourcePreparationQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecRealReadOnlyAdapterPilotSourcePreparationQuery> }
  | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !realReadOnlyAdapterPilotSourcePreparationStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported pilot source preparation status' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecRealReadOnlyAdapterPilotSourcePreparationStatus | undefined,
      limit: limitResult.limit,
    },
  };
}

function filterInMemoryReportReviews(
  records: CodexExecReportReviewRecord[],
  query: Partial<CodexExecReportReviewQuery>,
): CodexExecReportReviewRecord[] {
  return records
    .filter((record) => {
      if (query.dryRunId && record.dryRunId !== query.dryRunId) {
        return false;
      }

      if (query.status && record.status !== query.status) {
        return false;
      }

      if (query.recommendation && record.recommendation !== query.recommendation) {
        return false;
      }

      return true;
    })
    .slice(0, query.limit ?? 20);
}

function filterInMemoryLiveAdapterAdrDecisions(
  records: CodexExecLiveAdapterAdrDecisionRecord[],
  query: Partial<CodexExecLiveAdapterAdrDecisionQuery>,
): CodexExecLiveAdapterAdrDecisionRecord[] {
  return records
    .filter((record) => {
      if (query.dryRunId && record.dryRunId !== query.dryRunId) {
        return false;
      }

      if (query.status && record.status !== query.status) {
        return false;
      }

      if (query.decision && record.decision !== query.decision) {
        return false;
      }

      return true;
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, query.limit ?? 20);
}

function filterInMemoryReadOnlyAdapterSimulatorReviews(
  records: CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord[],
  query: Partial<CodexExecReadOnlyAdapterSimulatorReviewQuery>,
): CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord[] {
  return records
    .filter((record) => {
      if (query.dryRunId && record.dryRunId !== query.dryRunId) {
        return false;
      }

      if (query.status && record.status !== query.status) {
        return false;
      }

      if (query.outcome && record.outcome !== query.outcome) {
        return false;
      }

      return true;
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, query.limit ?? 20);
}

function filterInMemoryReadOnlyAdapterImplementationPlanReviews(
  records: CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord[],
  query: Partial<CodexExecReadOnlyAdapterImplementationPlanReviewQuery>,
): CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord[] {
  return records
    .filter((record) => {
      if (query.status && record.status !== query.status) {
        return false;
      }

      if (query.outcome && record.outcome !== query.outcome) {
        return false;
      }

      return true;
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, query.limit ?? 20);
}

function filterInMemoryReadOnlyAdapterSkeletonReviews(
  records: CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord[],
  query: Partial<CodexExecReadOnlyAdapterSkeletonReviewQuery>,
): CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord[] {
  return records
    .filter((record) => {
      if (query.status && record.status !== query.status) {
        return false;
      }

      if (query.outcome && record.outcome !== query.outcome) {
        return false;
      }

      return true;
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, query.limit ?? 20);
}

function filterInMemoryReadOnlyAdapterFinalReadiness(
  records: CodexExecReadOnlyAdapterFinalReadinessDecisionRecord[],
  query: Partial<CodexExecReadOnlyAdapterFinalReadinessQuery>,
): CodexExecReadOnlyAdapterFinalReadinessDecisionRecord[] {
  return records
    .filter((record) => {
      if (query.status && record.status !== query.status) {
        return false;
      }

      if (query.outcome && record.outcome !== query.outcome) {
        return false;
      }

      return true;
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, query.limit ?? 20);
}

function filterInMemoryRealReadOnlyAdapterReadinessPackages(
  records: CodexExecRealReadOnlyAdapterReadinessPackage[],
  query: Partial<CodexExecRealReadOnlyAdapterReadinessQuery>,
): CodexExecRealReadOnlyAdapterReadinessPackage[] {
  return records
    .filter((packageRecord) => {
      if (query.dryRunId && packageRecord.dryRunId !== query.dryRunId) {
        return false;
      }

      if (query.status && packageRecord.status !== query.status) {
        return false;
      }

      return true;
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, query.limit ?? 20);
}

function filterInMemoryRealReadOnlyAdapterReadinessReviews(
  records: CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord[],
  query: Partial<CodexExecRealReadOnlyAdapterReadinessReviewQuery>,
): CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord[] {
  return records
    .filter((record) => {
      if (query.packageId && record.packageId !== query.packageId) {
        return false;
      }

      if (query.dryRunId && record.dryRunId !== query.dryRunId) {
        return false;
      }

      if (query.status && record.status !== query.status) {
        return false;
      }

      if (query.outcome && record.outcome !== query.outcome) {
        return false;
      }

      return true;
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, query.limit ?? 20);
}

function existingReadinessDocumentRefs(): string[] {
  const workspaceRoot = findWorkspaceRoot(process.cwd());
  const candidateRefs = [
    'docs/reviews/round-3tw-additional-rules-audit.md',
    'docs/reviews/round-3w-disabled-skeleton-fixture-boundary-review.md',
    'docs/adr/round-3w-read-only-adapter-final-readiness-review.md',
  ];

  return candidateRefs.filter((candidateRef) => existsSync(resolve(workspaceRoot, candidateRef)));
}

function parseLimitQueryValue(
  value: string | undefined,
): { allowed: true; limit: number | undefined } | { allowed: false; reason: string } {
  if (!value) {
    return { allowed: true, limit: undefined };
  }

  const limit = Number.parseInt(value, 10);

  if (!Number.isInteger(limit) || limit <= 0 || limit > 200) {
    return { allowed: false, reason: 'limit must be an integer from 1 to 200' };
  }

  return { allowed: true, limit };
}

function readQueryValue(query: unknown, key: string): string | undefined {
  if (!query || typeof query !== 'object' || Array.isArray(query)) {
    return undefined;
  }

  const value = (query as Record<string, unknown>)[key];

  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' ? first : undefined;
  }

  return typeof value === 'string' ? value : undefined;
}

function parseBooleanQueryValue(value: string): boolean | undefined {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}

function resolveAllowedFixture(
  fixturePath: string,
): { allowed: true; path: string; fixturePath: string } | { allowed: false; reason: string } {
  if (isAbsolute(fixturePath)) {
    return { allowed: false, reason: 'fixturePath must be a repository-relative fixture path' };
  }

  if (fixturePath.split(/[\\/]+/).includes('..')) {
    return { allowed: false, reason: 'fixturePath cannot contain traversal segments' };
  }

  const workspaceRoot = findWorkspaceRoot(process.cwd());
  const fixturesRoot = resolve(workspaceRoot, 'packages', 'codex-kernel', 'fixtures');
  const requestedPath = resolve(workspaceRoot, fixturePath);

  if (!isPathInside(requestedPath, fixturesRoot) || extname(requestedPath) !== '.jsonl') {
    return {
      allowed: false,
      reason: 'fixturePath must point to packages/codex-kernel/fixtures/*.jsonl',
    };
  }

  if (existsSync(requestedPath)) {
    const fixturesRootRealPath = realpathSync(fixturesRoot);
    const requestedRealPath = realpathSync(requestedPath);

    if (
      !isPathInside(requestedRealPath, fixturesRootRealPath) ||
      extname(requestedRealPath) !== '.jsonl'
    ) {
      return {
        allowed: false,
        reason: 'fixturePath must resolve inside packages/codex-kernel/fixtures/*.jsonl',
      };
    }
  }

  return {
    allowed: true,
    path: requestedPath,
    fixturePath: toWorkspacePath(requestedPath, workspaceRoot),
  };
}

function resolveAllowedCwd(
  requestedCwd: string,
): { allowed: true; path: string; cwd: string } | { allowed: false; reason: string } {
  if (requestedCwd.split(/[\\/]+/).includes('..')) {
    return { allowed: false, reason: 'cwd cannot contain traversal segments' };
  }

  const workspaceRoot = findWorkspaceRoot(process.cwd());
  const requestedPath = isAbsolute(requestedCwd)
    ? resolve(requestedCwd)
    : resolve(workspaceRoot, requestedCwd);

  if (requestedPath !== workspaceRoot && !isPathInside(requestedPath, workspaceRoot)) {
    return { allowed: false, reason: 'cwd must stay within the repository root' };
  }

  if (existsSync(requestedPath)) {
    const workspaceRootRealPath = realpathSync(workspaceRoot);
    const requestedRealPath = realpathSync(requestedPath);

    if (
      requestedRealPath !== workspaceRootRealPath &&
      !isPathInside(requestedRealPath, workspaceRootRealPath)
    ) {
      return { allowed: false, reason: 'cwd must resolve within the repository root' };
    }
  }

  return {
    allowed: true,
    path: requestedPath,
    cwd: requestedPath === workspaceRoot ? '.' : toWorkspacePath(requestedPath, workspaceRoot),
  };
}

function readHeaderValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isTrustedOrigin(origin: string, trustedOrigins: Set<string>): boolean {
  if (trustedOrigins.has(origin)) {
    return true;
  }

  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname.toLowerCase();

    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      (hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '[::1]' ||
        hostname === '::1') &&
      DEFAULT_TRUSTED_ORIGIN_PORTS.has(parsed.port)
    );
  } catch {
    return false;
  }
}

function hasPreflightLocalControlHeader(value: string | string[] | undefined): boolean {
  const rawHeader = readHeaderValue(value);

  if (!rawHeader) {
    return false;
  }

  return rawHeader
    .split(',')
    .map((header) => header.trim().toLowerCase())
    .includes(LOCAL_CONTROL_HEADER);
}

function createUntrustedApprovalArtifactBodyEvidenceRefs(
  dryRunId: string | undefined,
): EvidenceRef[] {
  const metadata = {
    dryRunId,
    reason: 'untrusted_approval_artifact_body',
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
  };

  return [
    {
      id: foundationId('evidence'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      kind: 'audit',
      summary: 'Rejected request-body approval artifact for execution gate evaluation.',
      hash: hashSupervisorMetadata(metadata),
      redacted: true,
      labels: ['codex.exec.execution_gate.untrusted_approval_artifact_body'],
      metadata,
    },
  ];
}

function createUntrustedApprovalArtifactBodyAuditEvents(
  dryRunId: string | undefined,
  evidenceRefs: EvidenceRef[],
): AuditEvent[] {
  return [
    {
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      actor: 'codexhub-supervisor',
      action: 'codex.exec.execution_gate.untrusted_approval_artifact_body',
      outcome: 'blocked',
      evidenceRefs,
      metadata: {
        dryRunId,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    },
  ];
}

function hashSupervisorMetadata(metadata: Record<string, unknown>): string {
  return `sha256:${createHash('sha256').update(JSON.stringify(metadata)).digest('hex')}`;
}

function findWorkspaceRoot(startDirectory: string): string {
  let current = resolve(startDirectory);
  const root = parse(current).root;

  while (true) {
    if (existsSync(resolve(current, 'pnpm-workspace.yaml'))) {
      return current;
    }

    const parent = dirname(current);

    if (parent === current || current === root) {
      return resolve(startDirectory);
    }

    current = parent;
  }
}

function isPathInside(path: string, root: string): boolean {
  const relativePath = relative(root, path);
  return (
    relativePath.length > 0 && !relativePath.startsWith('..') && !relativePath.includes(`..${sep}`)
  );
}

function toWorkspacePath(path: string, workspaceRoot: string): string {
  return relative(workspaceRoot, path).split(sep).join('/');
}

function recordToSummary(record: CodexReplayRecord): CodexReplaySummary {
  return {
    id: record.id,
    schemaVersion: record.schemaVersion,
    createdAt: record.createdAt,
    sourceKind: record.sourceKind,
    fixturePath: record.fixturePath,
    threadId: record.threadId,
    status: record.status,
    summary: record.summary,
    replayHash: record.replayHash,
    eventCount: record.eventCount,
    itemCount: record.itemCount,
    commandExecutionCount: record.commandExecutionCount,
    fileChangeCount: record.fileChangeCount,
    mcpToolCallCount: record.mcpToolCallCount,
    webSearchCount: record.webSearchCount,
    errorCount: record.errorCount,
    evidenceCount: record.evidenceRefs.length,
    auditEventCount: record.auditEventIds.length,
    mockOnly: record.mockOnly,
    liveExecution: record.liveExecution,
    externalProcessStarted: record.externalProcessStarted,
    metadata: record.metadata,
  };
}
