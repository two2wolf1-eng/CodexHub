import { existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, parse, resolve } from 'node:path';
import type { DatabaseSync as NodeSqliteDatabaseSync } from 'node:sqlite';
import type {
  AuditEvent,
  AccountPool,
  AdminWriteAuthority,
  AdminWriteDryRunPlan,
  AdminWriteIntent,
  AdminWriteRun,
  AutomationCapabilityPolicy,
  BusinessCodexSeat,
  BusinessAdminMemberRosterSnapshot,
  BusinessBillingSummary,
  BusinessMemberReconciliationReport,
  BusinessProfileWorkspaceObservation,
  BusinessQuotaCrossCheckReport,
  BusinessWorkspaceSwitchDryRunPlan,
  BusinessWorkspaceSwitchRun,
  BusinessMembershipMirror,
  BusinessWorkspace,
  BrowserObservationApprovalArtifactRecord,
  BrowserObservationControlPlaneRun,
  BrowserObservationDryRunRecord,
  BrowserActionApprovalArtifact,
  BrowserActionPlan,
  BrowserActionRun,
  ChatGptSessionHealth,
  ChromeProfileBinding,
  ClientPool,
  CdpDomObservationSummary,
  CodexAccountBinding,
  CodexAppServerApprovalBridgeRecord,
  CodexAppServerEventSummary,
  CodexAppServerProtocolDriftReport,
  CodexAppServerSession,
  CodexAppServerThreadMirror,
  CodexAppServerTurnMirror,
  CodexAppServerWireMessageSummary,
  CodexClientInstance,
  CodexProductionAuditExportSummary,
  CodexProductionCanaryRun,
  CodexProductionCanaryTask,
  CodexProductionDriftGate,
  CodexProductionReadinessGate,
  CodexQuotaSourceHealth,
  CodexRecoveryRun,
  CodexSeatUsageLimit,
  CodexPatchChildRecord,
  CodexTaskClosureRun,
  CodexTaskDiagnosis,
  CodexTaskDiffSummaryProjection,
  CodexTaskGithubClosureProjection,
  CodexTaskIntent,
  CodexTaskReviewProjection,
  CodexTaskRun,
  CodexTaskVerificationProjection,
  CodexExecLiveAdapterAdrDecisionQuery,
  CodexExecLiveAdapterAdrDecisionRecord,
  CodexExecLiveRunRecord,
  CodexExecManualApprovalRecord,
  ElectronCdpObservationApprovalArtifactRecord,
  ElectronCdpObservationControlPlaneRun,
  ElectronCdpObservationDryRunRecord,
  ElectronRendererObservationSummary,
  ElectronMainInspectorApprovalArtifact,
  ElectronMainInspectorPlan,
  ElectronMainInspectorRun,
  ExternalAgentApprovalArtifact,
  ExternalAgentPatchPlan,
  ExternalAgentPatchSummary,
  ExternalAgentRun,
  AuditExportPlan,
  AuditExportRun,
  DisasterRecoveryRehearsalRun,
  GithubActionsDispatchApprovalArtifact,
  GithubActionsDispatchPlan,
  GithubActionsDispatchRun,
  GithubActionsObservationApprovalArtifactRecord,
  GithubActionsObservationPlan,
  GithubActionsObservationRun,
  GithubActionsRunControlApprovalArtifact,
  GithubActionsRunControlPlan,
  GithubActionsRunControlRun,
  DeploymentObservationApprovalArtifact,
  DeploymentObservationPlan,
  DeploymentObservationRun,
  DeploymentOperationApprovalArtifact,
  DeploymentOperationPlan,
  DeploymentOperationRun,
  DeploymentRollbackPlan,
  GithubBranchPublishApprovalArtifactRecord,
  GithubBranchPublishPlan,
  GithubBranchPublishRun,
  GithubDraftPrApprovalArtifactRecord,
  GithubDraftPrPlan,
  GithubDraftPrRun,
  GithubMetadataApprovalArtifactRecord,
  GithubMetadataControlPlaneRun,
  GithubMetadataDryRunRecord,
  GithubMergeApprovalArtifact,
  GithubMergeReadinessPlan,
  GithubMergeRun,
  GithubReleaseDraftApprovalArtifact,
  GithubReleaseDraftPlan,
  GithubReleaseDraftRun,
  GithubReleaseTagApprovalArtifact,
  GithubReleaseTagPlan,
  GithubReleaseTagRun,
  GithubPrLifecycleApprovalArtifactRecord,
  GithubPrLifecycleObservationPlan,
  GithubPrLifecycleObservationRun,
  GithubPrManagementApprovalArtifactRecord,
  GithubPrManagementPlan,
  GithubPrManagementRun,
  GithubPublishDraftPrChainPlan,
  GithubPublishDraftPrChainRun,
  GithubRemoteCleanupApprovalArtifactRecord,
  GithubRemoteCleanupPlan,
  GithubRemoteCleanupRun,
  CustomWorkflowApprovalArtifactRecord,
  CustomWorkflowPlan,
  CustomWorkflowRun,
  ProductionWorkflowChildActionStateRecord,
  ProductionWorkflowRecoveryApprovalArtifact,
  ProductionWorkflowRecoveryPlan,
  ProductionWorkflowRecoveryRun,
  NxVerificationChildRecord,
  OwnerAdminExtractionReport,
  OwnerAdminReadSurfaceSummary,
  RealPolicyBackendApprovalArtifact,
  RealPolicyBackendEvaluationPlan,
  RealPolicyBackendEvaluationRun,
  RealTelemetryExportApprovalArtifact,
  RealTelemetryExportPlan,
  RealTelemetryExportRun,
  ReworkLoopApprovalArtifactRecord,
  ReworkLoopPlan,
  ReworkLoopRun,
  LocalReviewPackageApprovalArtifactRecord,
  LocalReviewPackageControlPlaneRun,
  LocalReviewPackageDryRunRecord,
  LocalRcBundleApprovalArtifactRecord,
  LocalRcBundleControlPlaneRun,
  LocalRcBundleDryRunRecord,
  ReleaseVersionPlan,
  SecretLeakAuditSummary,
  SecretReadinessApprovalArtifact,
  SecretReadinessPlan,
  SecretReadinessRun,
  McpWriteToolApprovalArtifact,
  McpWriteToolPlan,
  McpWriteToolRun,
  MultiAgentCoordinationPlan,
  MultiAgentSlotSummary,
  OperatorRoleAssignmentPlan,
  OperatorRoleAssignmentRun,
  PlatformBackupPlan,
  PlatformBackupRun,
  PlatformOperationApprovalArtifact,
  PlatformRestorePlan,
  PlatformRestoreRun,
  ProductionGaApprovalArtifact,
  ProductionGaE2ERehearsalRun,
  ProductionGaOperatorTrainingCompletionSummary,
  ProductionGaReadinessPlan,
  ProductionGaReleaseCandidateSignoffPlan,
  ProductionGaResidualRiskRegister,
  ProductionGaSignoffRun,
  ProductionGaThreatModel,
  RetentionPolicyPlan,
  RetentionPolicyRun,
  RuntimeCheckpoint,
  RuntimeJobPlan,
  RuntimeJobRun,
  RuntimeLease,
  RuntimeLock,
  RuntimeQueueEntry,
  StoreMigrationPlan,
  StoreMigrationRun,
  WorktreeApprovalArtifactRecord,
  WorktreeCleanupApprovalArtifactRecord,
  WorktreeCleanupControlPlaneRun,
  WorktreeCleanupDryRunRecord,
  WorktreeControlPlaneRun,
  WorktreeDryRunRecord,
  CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord,
  CodexExecReadOnlyAdapterSimulatorReviewQuery,
  CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord,
  CodexExecReadOnlyAdapterImplementationPlanReviewQuery,
  CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord,
  CodexExecReadOnlyAdapterSkeletonReviewQuery,
  CodexExecReadOnlyAdapterFinalReadinessDecisionRecord,
  CodexExecReadOnlyAdapterFinalReadinessQuery,
  CodexExecRealReadOnlyAdapterReadinessPackage,
  CodexExecRealReadOnlyAdapterReadinessQuery,
  CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord,
  CodexExecRealReadOnlyAdapterReadinessReviewQuery,
  CodexExecRealReadOnlyAdapterAttemptQuery,
  CodexExecRealReadOnlyAdapterAttemptRecord,
  CodexExecRealReadOnlyAdapterApprovalAuthorityTraceQuery,
  CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord,
  CodexExecRealReadOnlyAdapterPolicySourceQuery,
  CodexExecRealReadOnlyAdapterPolicySourceRecord,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationQuery,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteQuery,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord,
  CodexExecReportReviewQuery,
  CodexExecReportReviewRecord,
  CodexReplayRecord,
  BusinessQuotaPermissionProbe,
  BusinessQuotaSourceProbe,
  EvidenceBundle,
  EvidenceRef,
  ForbiddenPathProbe,
  HumanCheckpoint,
  Lease,
  LocalCapabilityProbe,
  MockDevelopmentRun,
  Observation,
  QuotaEvidenceMatrix,
  QuotaAttribution,
  QuotaReadinessDebugReport,
  QuotaSnapshot,
  SensitiveRedactionReport,
  UiTargetFingerprint,
  UiAutomationAuthority,
  UiAutomationDryRunPlan,
  UiAutomationIntent,
  UiAutomationRun,
  UiObservationSource,
  WorkspaceCreditSnapshot,
  WorkflowRun,
} from '@codexhub/contracts';
import type {
  AuditEventQuery,
  AuditEventRepository,
  BrowserObservationApprovalRepository,
  BrowserObservationDryRunRepository,
  BrowserObservationQuery,
  BrowserObservationRunRepository,
  BrowserActionApprovalRepository,
  BrowserActionDryRunRepository,
  BrowserActionRunRepository,
  CodexPatchChildRecordRepository,
  CodexExecLiveAdapterAdrDecisionRepository,
  CodexExecApprovalRepository,
  CodexExecLiveRunRepository,
  CodexExecReadOnlyAdapterSimulatorReviewRepository,
  CodexExecReadOnlyAdapterImplementationPlanReviewRepository,
  CodexExecReadOnlyAdapterSkeletonReviewRepository,
  CodexExecReadOnlyAdapterFinalReadinessRepository,
  CodexExecRealReadOnlyAdapterReadinessRepository,
  CodexExecRealReadOnlyAdapterReadinessReviewRepository,
  CodexExecRealReadOnlyAdapterAttemptRepository,
  CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRepository,
  CodexExecRealReadOnlyAdapterPolicySourceRepository,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationRepository,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteRepository,
  CodexHubStore,
  CodexReplayRepository,
  CodexReportReviewRepository,
  DevelopmentRunRepository,
  ElectronCdpObservationApprovalRepository,
  ElectronCdpObservationDryRunRepository,
  ElectronCdpObservationQuery,
  ElectronCdpObservationRunRepository,
  ElectronMainInspectorApprovalRepository,
  ElectronMainInspectorDryRunRepository,
  ElectronMainInspectorRunRepository,
  ExternalAgentApprovalRepository,
  ExternalAgentControlPlaneQuery,
  ExternalAgentDryRunRepository,
  ExternalAgentPatchSummaryRepository,
  ExternalAgentRunRepository,
  AuditExportPlanRepository,
  AuditExportRunRepository,
  DisasterRecoveryRehearsalRunRepository,
  GithubBranchPublishApprovalRepository,
  GithubBranchPublishControlPlaneQuery,
  GithubBranchPublishDryRunRepository,
  GithubBranchPublishRunRepository,
  GithubDraftPrApprovalRepository,
  GithubDraftPrControlPlaneQuery,
  GithubDraftPrDryRunRepository,
  GithubDraftPrRunRepository,
  GithubMetadataApprovalRepository,
  GithubMetadataControlPlaneQuery,
  GithubMetadataDryRunRepository,
  GithubMetadataRunRepository,
  GithubMergeApprovalRepository,
  GithubMergeControlPlaneQuery,
  GithubMergeDryRunRepository,
  GithubMergeRunRepository,
  GithubActionsDispatchApprovalRepository,
  GithubActionsDispatchControlPlaneQuery,
  GithubActionsDispatchDryRunRepository,
  GithubActionsDispatchRunRepository,
  GithubActionsObservationApprovalRepository,
  GithubActionsObservationControlPlaneQuery,
  GithubActionsObservationDryRunRepository,
  GithubActionsObservationRunRepository,
  GithubActionsRunControlApprovalRepository,
  GithubActionsRunControlControlPlaneQuery,
  GithubActionsRunControlDryRunRepository,
  GithubActionsRunControlRunRepository,
  DeploymentObservationApprovalRepository,
  DeploymentObservationControlPlaneQuery,
  DeploymentObservationDryRunRepository,
  DeploymentObservationRunRepository,
  DeploymentOperationApprovalRepository,
  DeploymentOperationControlPlaneQuery,
  DeploymentOperationDryRunRepository,
  DeploymentOperationRunRepository,
  DeploymentRollbackPlanRepository,
  ReleaseVersionPlanControlPlaneQuery,
  ReleaseVersionPlanDryRunRepository,
  GithubReleaseDraftApprovalRepository,
  GithubReleaseDraftControlPlaneQuery,
  GithubReleaseDraftDryRunRepository,
  GithubReleaseDraftRunRepository,
  GithubReleaseTagApprovalRepository,
  GithubReleaseTagControlPlaneQuery,
  GithubReleaseTagDryRunRepository,
  GithubReleaseTagRunRepository,
  GithubPrLifecycleApprovalRepository,
  GithubPrLifecycleControlPlaneQuery,
  GithubPrLifecycleDryRunRepository,
  GithubPrLifecycleRunRepository,
  GithubPrManagementApprovalRepository,
  GithubPrManagementControlPlaneQuery,
  GithubPrManagementDryRunRepository,
  GithubPrManagementRunRepository,
  GithubPublishDraftPrChainControlPlaneQuery,
  GithubPublishDraftPrChainDryRunRepository,
  GithubPublishDraftPrChainRunRepository,
  GithubRemoteCleanupApprovalRepository,
  GithubRemoteCleanupControlPlaneQuery,
  GithubRemoteCleanupDryRunRepository,
  GithubRemoteCleanupRunRepository,
  CustomWorkflowApprovalRepository,
  CustomWorkflowControlPlaneQuery,
  CustomWorkflowDryRunRepository,
  CustomWorkflowRunRepository,
  ProductionWorkflowRecoveryApprovalRepository,
  ProductionWorkflowRecoveryChildActionStateRepository,
  ProductionWorkflowRecoveryControlPlaneQuery,
  ProductionWorkflowRecoveryDryRunRepository,
  ProductionWorkflowRecoveryRunRepository,
  LocalProductionWorkflowChildRecordQuery,
  M51MetadataRecordQuery,
  MetadataEntityRepository,
  NxVerificationChildRecordRepository,
  OperatorRoleAssignmentPlanRepository,
  OperatorRoleAssignmentRunRepository,
  PlatformBackupPlanRepository,
  PlatformBackupRunRepository,
  PlatformOperationApprovalRepository,
  PlatformOperationsControlPlaneQuery,
  PlatformRestorePlanRepository,
  PlatformRestoreRunRepository,
  ProductionGaApprovalRepository,
  ProductionGaControlPlaneQuery,
  ProductionGaDryRunRepository,
  ProductionGaE2ERehearsalRunRepository,
  ProductionGaResidualRiskRegisterRepository,
  ProductionGaSignoffPlanRepository,
  ProductionGaSignoffRunRepository,
  ProductionGaThreatModelRepository,
  ProductionGaTrainingCompletionRepository,
  RetentionPolicyPlanRepository,
  RetentionPolicyRunRepository,
  ReworkLoopApprovalRepository,
  ReworkLoopControlPlaneQuery,
  ReworkLoopDryRunRepository,
  ReworkLoopRunRepository,
  WorktreeApprovalRepository,
  WorktreeCleanupApprovalRepository,
  WorktreeCleanupDryRunRepository,
  WorktreeCleanupRunRepository,
  WorktreeControlPlaneQuery,
  WorktreeDryRunRepository,
  WorktreeRunRepository,
  EvidenceRefQuery,
  EvidenceRefRepository,
  ObservationRepository,
  ReviewPackageApprovalRepository,
  ReviewPackageControlPlaneQuery,
  ReviewPackageDryRunRepository,
  ReviewPackageRunRepository,
  ReleaseCandidateApprovalRepository,
  ReleaseCandidateControlPlaneQuery,
  ReleaseCandidateDryRunRepository,
  ReleaseCandidateRunRepository,
  StoreFactoryOptions,
  SecretLeakAuditSummaryRepository,
  SecretReadinessApprovalRepository,
  SecretReadinessControlPlaneQuery,
  SecretReadinessDryRunRepository,
  SecretReadinessRunRepository,
  McpWriteToolApprovalRepository,
  McpWriteToolDryRunRepository,
  McpWriteToolRunRepository,
  MultiAgentCoordinationPlanRepository,
  MultiAgentSlotSummaryRepository,
  RuntimeCheckpointRepository,
  RuntimeJobPlanRepository,
  RuntimeJobRunRepository,
  RuntimeLeaseRepository,
  RuntimeLockRepository,
  RuntimeOperationsControlPlaneQuery,
  RuntimeQueueEntryRepository,
  StoreMigrationPlanRepository,
  StoreMigrationRunRepository,
  RealPolicyBackendApprovalRepository,
  RealPolicyBackendDryRunRepository,
  RealPolicyBackendRunRepository,
  RealTelemetryExportApprovalRepository,
  RealTelemetryExportDryRunRepository,
  RealTelemetryExportRunRepository,
  WorkflowRunRepository,
} from '@codexhub/store-core';

interface PersistedEntity {
  id: string;
  createdAt?: string;
  observedAt?: string;
}

interface PayloadRow {
  payload: string;
}

type TimestampSelector<T extends PersistedEntity> = (entity: T) => string;
type SqliteDatabase = NodeSqliteDatabaseSync;
type SqliteDatabaseConstructor = new (path: string) => SqliteDatabase;
const requireNodeModule = createRequire(import.meta.url);

export async function createSqliteStore(options: StoreFactoryOptions = {}): Promise<CodexHubStore> {
  const dbPath = resolveCodexHubDbPath(options);
  mkdirSync(dirname(dbPath), { recursive: true });

  const DatabaseSync = loadDatabaseSync();
  const database = new DatabaseSync(dbPath);
  initializeDatabase(database);

  return new SqliteCodexHubStore(database);
}

export function resolveCodexHubDbPath(options: StoreFactoryOptions = {}): string {
  if (options.dbPath) {
    return resolve(options.dbPath);
  }

  if (process.env.CODEXHUB_DB_PATH) {
    return resolve(process.env.CODEXHUB_DB_PATH);
  }

  const workspaceRoot = options.workspaceRoot
    ? resolve(options.workspaceRoot)
    : findWorkspaceRoot(process.cwd());

  return join(workspaceRoot, '.codexhub', 'data', 'codexhub.sqlite');
}

class SqliteCodexHubStore implements CodexHubStore {
  readonly workflowRuns: WorkflowRunRepository;
  readonly auditEvents: AuditEventRepository;
  readonly evidenceRefs: EvidenceRefRepository;
  readonly observations: ObservationRepository;
  readonly developmentRuns: DevelopmentRunRepository;
  readonly codexReplays: CodexReplayRepository;
  readonly codexExecLiveRuns: CodexExecLiveRunRepository;
  readonly codexExecApprovals: CodexExecApprovalRepository;
  readonly browserObservationDryRuns: BrowserObservationDryRunRepository;
  readonly browserObservationApprovals: BrowserObservationApprovalRepository;
  readonly browserObservationRuns: BrowserObservationRunRepository;
  readonly electronCdpObservationDryRuns: ElectronCdpObservationDryRunRepository;
  readonly electronCdpObservationApprovals: ElectronCdpObservationApprovalRepository;
  readonly electronCdpObservationRuns: ElectronCdpObservationRunRepository;
  readonly worktreeDryRuns: WorktreeDryRunRepository;
  readonly worktreeApprovals: WorktreeApprovalRepository;
  readonly worktreeRuns: WorktreeRunRepository;
  readonly worktreeCleanupDryRuns: WorktreeCleanupDryRunRepository;
  readonly worktreeCleanupApprovals: WorktreeCleanupApprovalRepository;
  readonly worktreeCleanupRuns: WorktreeCleanupRunRepository;
  readonly reviewPackageDryRuns: ReviewPackageDryRunRepository;
  readonly reviewPackageApprovals: ReviewPackageApprovalRepository;
  readonly reviewPackageRuns: ReviewPackageRunRepository;
  readonly releaseCandidateDryRuns: ReleaseCandidateDryRunRepository;
  readonly releaseCandidateApprovals: ReleaseCandidateApprovalRepository;
  readonly releaseCandidateRuns: ReleaseCandidateRunRepository;
  readonly githubMetadataDryRuns: GithubMetadataDryRunRepository;
  readonly githubMetadataApprovals: GithubMetadataApprovalRepository;
  readonly githubMetadataRuns: GithubMetadataRunRepository;
  readonly githubDraftPrDryRuns: GithubDraftPrDryRunRepository;
  readonly githubDraftPrApprovals: GithubDraftPrApprovalRepository;
  readonly githubDraftPrRuns: GithubDraftPrRunRepository;
  readonly githubBranchPublishDryRuns: GithubBranchPublishDryRunRepository;
  readonly githubBranchPublishApprovals: GithubBranchPublishApprovalRepository;
  readonly githubBranchPublishRuns: GithubBranchPublishRunRepository;
  readonly githubPublishDraftPrChainDryRuns: GithubPublishDraftPrChainDryRunRepository;
  readonly githubPublishDraftPrChainRuns: GithubPublishDraftPrChainRunRepository;
  readonly githubPrLifecycleDryRuns: GithubPrLifecycleDryRunRepository;
  readonly githubPrLifecycleApprovals: GithubPrLifecycleApprovalRepository;
  readonly githubPrLifecycleRuns: GithubPrLifecycleRunRepository;
  readonly githubPrLabelsDryRuns: GithubPrManagementDryRunRepository;
  readonly githubPrLabelsApprovals: GithubPrManagementApprovalRepository;
  readonly githubPrLabelsRuns: GithubPrManagementRunRepository;
  readonly githubPrAssigneesDryRuns: GithubPrManagementDryRunRepository;
  readonly githubPrAssigneesApprovals: GithubPrManagementApprovalRepository;
  readonly githubPrAssigneesRuns: GithubPrManagementRunRepository;
  readonly githubPrReviewersDryRuns: GithubPrManagementDryRunRepository;
  readonly githubPrReviewersApprovals: GithubPrManagementApprovalRepository;
  readonly githubPrReviewersRuns: GithubPrManagementRunRepository;
  readonly githubPrMilestonesDryRuns: GithubPrManagementDryRunRepository;
  readonly githubPrMilestonesApprovals: GithubPrManagementApprovalRepository;
  readonly githubPrMilestonesRuns: GithubPrManagementRunRepository;
  readonly githubPrCommentsDryRuns: GithubPrManagementDryRunRepository;
  readonly githubPrCommentsApprovals: GithubPrManagementApprovalRepository;
  readonly githubPrCommentsRuns: GithubPrManagementRunRepository;
  readonly githubMergeDryRuns: GithubMergeDryRunRepository;
  readonly githubMergeApprovals: GithubMergeApprovalRepository;
  readonly githubMergeRuns: GithubMergeRunRepository;
  readonly githubActionsObservationDryRuns: GithubActionsObservationDryRunRepository;
  readonly githubActionsObservationApprovals: GithubActionsObservationApprovalRepository;
  readonly githubActionsObservationRuns: GithubActionsObservationRunRepository;
  readonly githubActionsRerunDryRuns: GithubActionsRunControlDryRunRepository;
  readonly githubActionsRerunApprovals: GithubActionsRunControlApprovalRepository;
  readonly githubActionsRerunRuns: GithubActionsRunControlRunRepository;
  readonly githubActionsCancelDryRuns: GithubActionsRunControlDryRunRepository;
  readonly githubActionsCancelApprovals: GithubActionsRunControlApprovalRepository;
  readonly githubActionsCancelRuns: GithubActionsRunControlRunRepository;
  readonly githubActionsDispatchDryRuns: GithubActionsDispatchDryRunRepository;
  readonly githubActionsDispatchApprovals: GithubActionsDispatchApprovalRepository;
  readonly githubActionsDispatchRuns: GithubActionsDispatchRunRepository;
  readonly releaseVersionPlanDryRuns: ReleaseVersionPlanDryRunRepository;
  readonly githubReleaseTagDryRuns: GithubReleaseTagDryRunRepository;
  readonly githubReleaseTagApprovals: GithubReleaseTagApprovalRepository;
  readonly githubReleaseTagRuns: GithubReleaseTagRunRepository;
  readonly githubReleaseDraftDryRuns: GithubReleaseDraftDryRunRepository;
  readonly githubReleaseDraftApprovals: GithubReleaseDraftApprovalRepository;
  readonly githubReleaseDraftRuns: GithubReleaseDraftRunRepository;
  readonly deploymentObservationDryRuns: DeploymentObservationDryRunRepository;
  readonly deploymentObservationApprovals: DeploymentObservationApprovalRepository;
  readonly deploymentObservationRuns: DeploymentObservationRunRepository;
  readonly deploymentOperationDryRuns: DeploymentOperationDryRunRepository;
  readonly deploymentOperationApprovals: DeploymentOperationApprovalRepository;
  readonly deploymentRollbackPlans: DeploymentRollbackPlanRepository;
  readonly deploymentOperationRuns: DeploymentOperationRunRepository;
  readonly secretReadinessDryRuns: SecretReadinessDryRunRepository;
  readonly secretReadinessApprovals: SecretReadinessApprovalRepository;
  readonly secretReadinessRuns: SecretReadinessRunRepository;
  readonly secretLeakAuditSummaries: SecretLeakAuditSummaryRepository;
  readonly realPolicyBackendDryRuns: RealPolicyBackendDryRunRepository;
  readonly realPolicyBackendApprovals: RealPolicyBackendApprovalRepository;
  readonly realPolicyBackendRuns: RealPolicyBackendRunRepository;
  readonly realTelemetryExportDryRuns: RealTelemetryExportDryRunRepository;
  readonly realTelemetryExportApprovals: RealTelemetryExportApprovalRepository;
  readonly realTelemetryExportRuns: RealTelemetryExportRunRepository;
  readonly browserActionDryRuns: BrowserActionDryRunRepository;
  readonly browserActionApprovals: BrowserActionApprovalRepository;
  readonly browserActionRuns: BrowserActionRunRepository;
  readonly electronMainInspectorDryRuns: ElectronMainInspectorDryRunRepository;
  readonly electronMainInspectorApprovals: ElectronMainInspectorApprovalRepository;
  readonly electronMainInspectorRuns: ElectronMainInspectorRunRepository;
  readonly mcpWriteToolDryRuns: McpWriteToolDryRunRepository;
  readonly mcpWriteToolApprovals: McpWriteToolApprovalRepository;
  readonly mcpWriteToolRuns: McpWriteToolRunRepository;
  readonly runtimeJobPlans: RuntimeJobPlanRepository;
  readonly runtimeQueueEntries: RuntimeQueueEntryRepository;
  readonly runtimeLeases: RuntimeLeaseRepository;
  readonly runtimeLocks: RuntimeLockRepository;
  readonly runtimeCheckpoints: RuntimeCheckpointRepository;
  readonly runtimeJobRuns: RuntimeJobRunRepository;
  readonly multiAgentCoordinationPlans: MultiAgentCoordinationPlanRepository;
  readonly multiAgentSlotSummaries: MultiAgentSlotSummaryRepository;
  readonly externalAgentDryRuns: ExternalAgentDryRunRepository;
  readonly externalAgentApprovals: ExternalAgentApprovalRepository;
  readonly externalAgentRuns: ExternalAgentRunRepository;
  readonly externalAgentPatchSummaries: ExternalAgentPatchSummaryRepository;
  readonly platformOperationApprovals: PlatformOperationApprovalRepository;
  readonly platformBackupPlans: PlatformBackupPlanRepository;
  readonly platformBackupRuns: PlatformBackupRunRepository;
  readonly platformRestorePlans: PlatformRestorePlanRepository;
  readonly platformRestoreRuns: PlatformRestoreRunRepository;
  readonly storeMigrationPlans: StoreMigrationPlanRepository;
  readonly storeMigrationRuns: StoreMigrationRunRepository;
  readonly retentionPolicyPlans: RetentionPolicyPlanRepository;
  readonly retentionPolicyRuns: RetentionPolicyRunRepository;
  readonly auditExportPlans: AuditExportPlanRepository;
  readonly auditExportRuns: AuditExportRunRepository;
  readonly operatorRoleAssignmentPlans: OperatorRoleAssignmentPlanRepository;
  readonly operatorRoleAssignmentRuns: OperatorRoleAssignmentRunRepository;
  readonly disasterRecoveryRehearsalRuns: DisasterRecoveryRehearsalRunRepository;
  readonly productionGaDryRuns: ProductionGaDryRunRepository;
  readonly productionGaApprovals: ProductionGaApprovalRepository;
  readonly productionGaSignoffPlans: ProductionGaSignoffPlanRepository;
  readonly productionGaSignoffRuns: ProductionGaSignoffRunRepository;
  readonly productionGaE2ERehearsalRuns: ProductionGaE2ERehearsalRunRepository;
  readonly productionGaTrainingCompletions: ProductionGaTrainingCompletionRepository;
  readonly productionGaThreatModels: ProductionGaThreatModelRepository;
  readonly productionGaResidualRiskRegisters: ProductionGaResidualRiskRegisterRepository;
  readonly githubRemoteCleanupDryRuns: GithubRemoteCleanupDryRunRepository;
  readonly githubRemoteCleanupApprovals: GithubRemoteCleanupApprovalRepository;
  readonly githubRemoteCleanupRuns: GithubRemoteCleanupRunRepository;
  readonly reworkLoopDryRuns: ReworkLoopDryRunRepository;
  readonly reworkLoopApprovals: ReworkLoopApprovalRepository;
  readonly reworkLoopRuns: ReworkLoopRunRepository;
  readonly customWorkflowDryRuns: CustomWorkflowDryRunRepository;
  readonly customWorkflowApprovals: CustomWorkflowApprovalRepository;
  readonly customWorkflowRuns: CustomWorkflowRunRepository;
  readonly productionWorkflowRecoveryDryRuns: ProductionWorkflowRecoveryDryRunRepository;
  readonly productionWorkflowRecoveryApprovals: ProductionWorkflowRecoveryApprovalRepository;
  readonly productionWorkflowRecoveryRuns: ProductionWorkflowRecoveryRunRepository;
  readonly productionWorkflowRecoveryChildActionStates: ProductionWorkflowRecoveryChildActionStateRepository;
  readonly codexPatchChildRecords: CodexPatchChildRecordRepository;
  readonly nxVerificationChildRecords: NxVerificationChildRecordRepository;
  readonly codexReportReviews: CodexReportReviewRepository;
  readonly codexExecLiveAdapterAdrDecisions: CodexExecLiveAdapterAdrDecisionRepository;
  readonly codexExecReadOnlyAdapterSimulatorReviews: CodexExecReadOnlyAdapterSimulatorReviewRepository;
  readonly codexExecReadOnlyAdapterImplementationPlanReviews: CodexExecReadOnlyAdapterImplementationPlanReviewRepository;
  readonly codexExecReadOnlyAdapterSkeletonReviews: CodexExecReadOnlyAdapterSkeletonReviewRepository;
  readonly codexExecReadOnlyAdapterFinalReadiness: CodexExecReadOnlyAdapterFinalReadinessRepository;
  readonly codexExecRealReadOnlyAdapterReadiness: CodexExecRealReadOnlyAdapterReadinessRepository;
  readonly codexExecRealReadOnlyAdapterReadinessReviews: CodexExecRealReadOnlyAdapterReadinessReviewRepository;
  readonly codexExecRealReadOnlyAdapterAttempts: CodexExecRealReadOnlyAdapterAttemptRepository;
  readonly codexExecRealReadOnlyAdapterPolicySources: CodexExecRealReadOnlyAdapterPolicySourceRepository;
  readonly codexExecRealReadOnlyAdapterApprovalAuthorityTraces: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRepository;
  readonly codexExecRealReadOnlyAdapterPilotPrerequisites: CodexExecRealReadOnlyAdapterPilotPrerequisiteRepository;
  readonly codexExecRealReadOnlyAdapterPilotSourcePreparations: CodexExecRealReadOnlyAdapterPilotSourcePreparationRepository;
  readonly businessWorkspaces: MetadataEntityRepository<BusinessWorkspace>;
  readonly businessMembershipMirrors: MetadataEntityRepository<BusinessMembershipMirror>;
  readonly chromeProfileBindings: MetadataEntityRepository<ChromeProfileBinding>;
  readonly chatGptSessionHealth: MetadataEntityRepository<ChatGptSessionHealth>;
  readonly humanCheckpoints: MetadataEntityRepository<HumanCheckpoint>;
  readonly codexClientInstances: MetadataEntityRepository<CodexClientInstance>;
  readonly codexAppServerSessions: MetadataEntityRepository<CodexAppServerSession>;
  readonly codexAppServerWireMessageSummaries: MetadataEntityRepository<CodexAppServerWireMessageSummary>;
  readonly codexAppServerThreadMirrors: MetadataEntityRepository<CodexAppServerThreadMirror>;
  readonly codexAppServerTurnMirrors: MetadataEntityRepository<CodexAppServerTurnMirror>;
  readonly codexAppServerEventSummaries: MetadataEntityRepository<CodexAppServerEventSummary>;
  readonly codexAppServerApprovalBridgeRecords: MetadataEntityRepository<CodexAppServerApprovalBridgeRecord>;
  readonly codexAppServerProtocolDriftReports: MetadataEntityRepository<CodexAppServerProtocolDriftReport>;
  readonly codexAccountBindings: MetadataEntityRepository<CodexAccountBinding>;
  readonly codexTaskIntents: MetadataEntityRepository<CodexTaskIntent>;
  readonly codexTaskRuns: MetadataEntityRepository<CodexTaskRun>;
  readonly codexTaskDiagnoses: MetadataEntityRepository<CodexTaskDiagnosis>;
  readonly codexRecoveryRuns: MetadataEntityRepository<CodexRecoveryRun>;
  readonly codexTaskDiffSummaries: MetadataEntityRepository<CodexTaskDiffSummaryProjection>;
  readonly codexTaskVerificationProjections: MetadataEntityRepository<CodexTaskVerificationProjection>;
  readonly codexTaskReviewProjections: MetadataEntityRepository<CodexTaskReviewProjection>;
  readonly codexTaskGithubClosureProjections: MetadataEntityRepository<CodexTaskGithubClosureProjection>;
  readonly codexTaskClosureRuns: MetadataEntityRepository<CodexTaskClosureRun>;
  readonly codexProductionCanaryTasks: MetadataEntityRepository<CodexProductionCanaryTask>;
  readonly codexProductionCanaryRuns: MetadataEntityRepository<CodexProductionCanaryRun>;
  readonly codexProductionDriftGates: MetadataEntityRepository<CodexProductionDriftGate>;
  readonly codexProductionReadinessGates: MetadataEntityRepository<CodexProductionReadinessGate>;
  readonly codexProductionAuditExportSummaries: MetadataEntityRepository<CodexProductionAuditExportSummary>;
  readonly accountPools: MetadataEntityRepository<AccountPool>;
  readonly clientPools: MetadataEntityRepository<ClientPool>;
  readonly poolLeases: MetadataEntityRepository<Lease>;
  readonly quotaSnapshots: MetadataEntityRepository<QuotaSnapshot>;
  readonly evidenceBundles: MetadataEntityRepository<EvidenceBundle>;
  readonly businessCodexSeats: MetadataEntityRepository<BusinessCodexSeat>;
  readonly workspaceCreditSnapshots: MetadataEntityRepository<WorkspaceCreditSnapshot>;
  readonly codexSeatUsageLimits: MetadataEntityRepository<CodexSeatUsageLimit>;
  readonly codexQuotaSourceHealth: MetadataEntityRepository<CodexQuotaSourceHealth>;
  readonly quotaAttributions: MetadataEntityRepository<QuotaAttribution>;
  readonly businessQuotaCrossCheckReports: MetadataEntityRepository<BusinessQuotaCrossCheckReport>;
  readonly ownerAdminReadSurfaceSummaries: MetadataEntityRepository<OwnerAdminReadSurfaceSummary>;
  readonly businessAdminMemberRosterSnapshots: MetadataEntityRepository<BusinessAdminMemberRosterSnapshot>;
  readonly businessBillingSummaries: MetadataEntityRepository<BusinessBillingSummary>;
  readonly ownerAdminExtractionReports: MetadataEntityRepository<OwnerAdminExtractionReport>;
  readonly businessProfileWorkspaceObservations: MetadataEntityRepository<BusinessProfileWorkspaceObservation>;
  readonly businessWorkspaceSwitchDryRunPlans: MetadataEntityRepository<BusinessWorkspaceSwitchDryRunPlan>;
  readonly businessWorkspaceSwitchRuns: MetadataEntityRepository<BusinessWorkspaceSwitchRun>;
  readonly businessMemberReconciliationReports: MetadataEntityRepository<BusinessMemberReconciliationReport>;
  readonly automationCapabilityPolicies: MetadataEntityRepository<AutomationCapabilityPolicy>;
  readonly uiObservationSources: MetadataEntityRepository<UiObservationSource>;
  readonly cdpDomObservationSummaries: MetadataEntityRepository<CdpDomObservationSummary>;
  readonly electronRendererObservationSummaries: MetadataEntityRepository<ElectronRendererObservationSummary>;
  readonly uiTargetFingerprints: MetadataEntityRepository<UiTargetFingerprint>;
  readonly uiAutomationIntents: MetadataEntityRepository<UiAutomationIntent>;
  readonly uiAutomationDryRunPlans: MetadataEntityRepository<UiAutomationDryRunPlan>;
  readonly uiAutomationAuthorities: MetadataEntityRepository<UiAutomationAuthority>;
  readonly uiAutomationRuns: MetadataEntityRepository<UiAutomationRun>;
  readonly adminWriteIntents: MetadataEntityRepository<AdminWriteIntent>;
  readonly adminWriteDryRunPlans: MetadataEntityRepository<AdminWriteDryRunPlan>;
  readonly adminWriteAuthorities: MetadataEntityRepository<AdminWriteAuthority>;
  readonly adminWriteRuns: MetadataEntityRepository<AdminWriteRun>;
  readonly sensitiveRedactionReports: MetadataEntityRepository<SensitiveRedactionReport>;
  readonly businessQuotaSourceProbes: MetadataEntityRepository<BusinessQuotaSourceProbe>;
  readonly businessQuotaPermissionProbes: MetadataEntityRepository<BusinessQuotaPermissionProbe>;
  readonly localCapabilityProbes: MetadataEntityRepository<LocalCapabilityProbe>;
  readonly forbiddenPathProbes: MetadataEntityRepository<ForbiddenPathProbe>;
  readonly quotaEvidenceMatrices: MetadataEntityRepository<QuotaEvidenceMatrix>;
  readonly quotaReadinessDebugReports: MetadataEntityRepository<QuotaReadinessDebugReport>;

  constructor(private readonly database: SqliteDatabase) {
    this.workflowRuns = new JsonEntityRepository<WorkflowRun>(
      database,
      'workflow_runs',
      (run) => run.createdAt,
    );
    this.auditEvents = new SqliteAuditEventRepository(database);
    this.evidenceRefs = new SqliteEvidenceRefRepository(database);
    this.observations = new AppendOnlyJsonEntityRepository<Observation>(
      database,
      'observations',
      (observation) => observation.observedAt,
    );
    this.developmentRuns = new SqliteDevelopmentRunRepository(database);
    this.codexReplays = new SqliteCodexReplayRepository(database);
    this.codexExecLiveRuns = new SqliteCodexExecLiveRunRepository(database);
    this.codexExecApprovals = new SqliteCodexExecApprovalRepository(database);
    this.browserObservationDryRuns = new SqliteBrowserObservationDryRunRepository(database);
    this.browserObservationApprovals = new SqliteBrowserObservationApprovalRepository(database);
    this.browserObservationRuns = new SqliteBrowserObservationRunRepository(database);
    this.electronCdpObservationDryRuns = new SqliteElectronCdpObservationDryRunRepository(database);
    this.electronCdpObservationApprovals = new SqliteElectronCdpObservationApprovalRepository(
      database,
    );
    this.electronCdpObservationRuns = new SqliteElectronCdpObservationRunRepository(database);
    this.worktreeDryRuns = new SqliteWorktreeDryRunRepository(database);
    this.worktreeApprovals = new SqliteWorktreeApprovalRepository(database);
    this.worktreeRuns = new SqliteWorktreeRunRepository(database);
    this.worktreeCleanupDryRuns = new SqliteWorktreeCleanupDryRunRepository(database);
    this.worktreeCleanupApprovals = new SqliteWorktreeCleanupApprovalRepository(database);
    this.worktreeCleanupRuns = new SqliteWorktreeCleanupRunRepository(database);
    this.reviewPackageDryRuns = new SqliteReviewPackageDryRunRepository(database);
    this.reviewPackageApprovals = new SqliteReviewPackageApprovalRepository(database);
    this.reviewPackageRuns = new SqliteReviewPackageRunRepository(database);
    this.releaseCandidateDryRuns = new SqliteReleaseCandidateDryRunRepository(database);
    this.releaseCandidateApprovals = new SqliteReleaseCandidateApprovalRepository(database);
    this.releaseCandidateRuns = new SqliteReleaseCandidateRunRepository(database);
    this.githubMetadataDryRuns = new SqliteGithubMetadataDryRunRepository(database);
    this.githubMetadataApprovals = new SqliteGithubMetadataApprovalRepository(database);
    this.githubMetadataRuns = new SqliteGithubMetadataRunRepository(database);
    this.githubDraftPrDryRuns = new SqliteGithubDraftPrDryRunRepository(database);
    this.githubDraftPrApprovals = new SqliteGithubDraftPrApprovalRepository(database);
    this.githubDraftPrRuns = new SqliteGithubDraftPrRunRepository(database);
    this.githubBranchPublishDryRuns = new SqliteGithubBranchPublishDryRunRepository(database);
    this.githubBranchPublishApprovals = new SqliteGithubBranchPublishApprovalRepository(database);
    this.githubBranchPublishRuns = new SqliteGithubBranchPublishRunRepository(database);
    this.githubPublishDraftPrChainDryRuns =
      new SqliteGithubPublishDraftPrChainDryRunRepository(database);
    this.githubPublishDraftPrChainRuns =
      new SqliteGithubPublishDraftPrChainRunRepository(database);
    this.githubPrLifecycleDryRuns = new SqliteGithubPrLifecycleDryRunRepository(database);
    this.githubPrLifecycleApprovals = new SqliteGithubPrLifecycleApprovalRepository(database);
    this.githubPrLifecycleRuns = new SqliteGithubPrLifecycleRunRepository(database);
    this.githubPrLabelsDryRuns = new SqliteGithubPrManagementDryRunRepository(
      database,
      'github_pr_labels_dry_runs',
    );
    this.githubPrLabelsApprovals = new SqliteGithubPrManagementApprovalRepository(
      database,
      'github_pr_labels_approvals',
    );
    this.githubPrLabelsRuns = new SqliteGithubPrManagementRunRepository(
      database,
      'github_pr_labels_runs',
    );
    this.githubPrAssigneesDryRuns = new SqliteGithubPrManagementDryRunRepository(
      database,
      'github_pr_assignees_dry_runs',
    );
    this.githubPrAssigneesApprovals = new SqliteGithubPrManagementApprovalRepository(
      database,
      'github_pr_assignees_approvals',
    );
    this.githubPrAssigneesRuns = new SqliteGithubPrManagementRunRepository(
      database,
      'github_pr_assignees_runs',
    );
    this.githubPrReviewersDryRuns = new SqliteGithubPrManagementDryRunRepository(
      database,
      'github_pr_reviewers_dry_runs',
    );
    this.githubPrReviewersApprovals = new SqliteGithubPrManagementApprovalRepository(
      database,
      'github_pr_reviewers_approvals',
    );
    this.githubPrReviewersRuns = new SqliteGithubPrManagementRunRepository(
      database,
      'github_pr_reviewers_runs',
    );
    this.githubPrMilestonesDryRuns = new SqliteGithubPrManagementDryRunRepository(
      database,
      'github_pr_milestones_dry_runs',
    );
    this.githubPrMilestonesApprovals = new SqliteGithubPrManagementApprovalRepository(
      database,
      'github_pr_milestones_approvals',
    );
    this.githubPrMilestonesRuns = new SqliteGithubPrManagementRunRepository(
      database,
      'github_pr_milestones_runs',
    );
    this.githubPrCommentsDryRuns = new SqliteGithubPrManagementDryRunRepository(
      database,
      'github_pr_comments_dry_runs',
    );
    this.githubPrCommentsApprovals = new SqliteGithubPrManagementApprovalRepository(
      database,
      'github_pr_comments_approvals',
    );
    this.githubPrCommentsRuns = new SqliteGithubPrManagementRunRepository(
      database,
      'github_pr_comments_runs',
    );
    this.githubMergeDryRuns = new SqliteGithubMergeDryRunRepository(database);
    this.githubMergeApprovals = new SqliteGithubMergeApprovalRepository(database);
    this.githubMergeRuns = new SqliteGithubMergeRunRepository(database);
    this.githubActionsObservationDryRuns =
      new SqliteGithubActionsObservationDryRunRepository(database);
    this.githubActionsObservationApprovals =
      new SqliteGithubActionsObservationApprovalRepository(database);
    this.githubActionsObservationRuns =
      new SqliteGithubActionsObservationRunRepository(database);
    this.githubActionsRerunDryRuns = new SqliteGithubActionsRunControlDryRunRepository(
      database,
      'github_actions_rerun_dry_runs',
    );
    this.githubActionsRerunApprovals = new SqliteGithubActionsRunControlApprovalRepository(
      database,
      'github_actions_rerun_approvals',
    );
    this.githubActionsRerunRuns = new SqliteGithubActionsRunControlRunRepository(
      database,
      'github_actions_rerun_runs',
    );
    this.githubActionsCancelDryRuns = new SqliteGithubActionsRunControlDryRunRepository(
      database,
      'github_actions_cancel_dry_runs',
    );
    this.githubActionsCancelApprovals = new SqliteGithubActionsRunControlApprovalRepository(
      database,
      'github_actions_cancel_approvals',
    );
    this.githubActionsCancelRuns = new SqliteGithubActionsRunControlRunRepository(
      database,
      'github_actions_cancel_runs',
    );
    this.githubActionsDispatchDryRuns =
      new SqliteGithubActionsDispatchDryRunRepository(database);
    this.githubActionsDispatchApprovals =
      new SqliteGithubActionsDispatchApprovalRepository(database);
    this.githubActionsDispatchRuns = new SqliteGithubActionsDispatchRunRepository(database);
    this.releaseVersionPlanDryRuns = new SqliteReleaseVersionPlanDryRunRepository(database);
    this.githubReleaseTagDryRuns = new SqliteGithubReleaseTagDryRunRepository(database);
    this.githubReleaseTagApprovals = new SqliteGithubReleaseTagApprovalRepository(database);
    this.githubReleaseTagRuns = new SqliteGithubReleaseTagRunRepository(database);
    this.githubReleaseDraftDryRuns = new SqliteGithubReleaseDraftDryRunRepository(database);
    this.githubReleaseDraftApprovals = new SqliteGithubReleaseDraftApprovalRepository(database);
    this.githubReleaseDraftRuns = new SqliteGithubReleaseDraftRunRepository(database);
    this.deploymentObservationDryRuns =
      new SqliteDeploymentObservationDryRunRepository(database);
    this.deploymentObservationApprovals =
      new SqliteDeploymentObservationApprovalRepository(database);
    this.deploymentObservationRuns = new SqliteDeploymentObservationRunRepository(database);
    this.deploymentOperationDryRuns = new SqliteDeploymentOperationDryRunRepository(database);
    this.deploymentOperationApprovals =
      new SqliteDeploymentOperationApprovalRepository(database);
    this.deploymentRollbackPlans = new SqliteDeploymentRollbackPlanRepository(database);
    this.deploymentOperationRuns = new SqliteDeploymentOperationRunRepository(database);
    this.secretReadinessDryRuns = new SqliteSecretReadinessDryRunRepository(database);
    this.secretReadinessApprovals = new SqliteSecretReadinessApprovalRepository(database);
    this.secretReadinessRuns = new SqliteSecretReadinessRunRepository(database);
    this.secretLeakAuditSummaries = new SqliteSecretLeakAuditSummaryRepository(database);
    this.realPolicyBackendDryRuns = new SqliteGenericDryRunRepository<RealPolicyBackendEvaluationPlan>(
      database,
      'real_policy_backend_dry_runs',
    );
    this.realPolicyBackendApprovals =
      new SqliteGenericApprovalRepository<RealPolicyBackendApprovalArtifact>(
      database,
      'real_policy_backend_approvals',
    );
    this.realPolicyBackendRuns = new SqliteGenericRunRepository<RealPolicyBackendEvaluationRun>(
      database,
      'real_policy_backend_runs',
    );
    this.realTelemetryExportDryRuns = new SqliteGenericDryRunRepository<RealTelemetryExportPlan>(
      database,
      'real_telemetry_export_dry_runs',
    );
    this.realTelemetryExportApprovals =
      new SqliteGenericApprovalRepository<RealTelemetryExportApprovalArtifact>(
      database,
      'real_telemetry_export_approvals',
    );
    this.realTelemetryExportRuns = new SqliteGenericRunRepository<RealTelemetryExportRun>(
      database,
      'real_telemetry_export_runs',
    );
    this.browserActionDryRuns = new SqliteGenericDryRunRepository<BrowserActionPlan>(
      database,
      'browser_action_dry_runs',
    );
    this.browserActionApprovals = new SqliteGenericApprovalRepository<BrowserActionApprovalArtifact>(
      database,
      'browser_action_approvals',
    );
    this.browserActionRuns = new SqliteGenericRunRepository<BrowserActionRun>(
      database,
      'browser_action_runs',
    );
    this.electronMainInspectorDryRuns = new SqliteGenericDryRunRepository<ElectronMainInspectorPlan>(
      database,
      'electron_main_inspector_dry_runs',
    );
    this.electronMainInspectorApprovals =
      new SqliteGenericApprovalRepository<ElectronMainInspectorApprovalArtifact>(
        database,
        'electron_main_inspector_approvals',
      );
    this.electronMainInspectorRuns = new SqliteGenericRunRepository<ElectronMainInspectorRun>(
      database,
      'electron_main_inspector_runs',
    );
    this.mcpWriteToolDryRuns = new SqliteGenericDryRunRepository<McpWriteToolPlan>(
      database,
      'mcp_write_tool_dry_runs',
    );
    this.mcpWriteToolApprovals = new SqliteGenericApprovalRepository<McpWriteToolApprovalArtifact>(
      database,
      'mcp_write_tool_approvals',
    );
    this.mcpWriteToolRuns = new SqliteGenericRunRepository<McpWriteToolRun>(
      database,
      'mcp_write_tool_runs',
    );
    this.runtimeJobPlans = new SqliteRuntimeJobPlanRepository(database);
    this.runtimeQueueEntries = new SqliteRuntimeQueueEntryRepository(database);
    this.runtimeLeases = new SqliteRuntimeLeaseRepository(database);
    this.runtimeLocks = new SqliteRuntimeLockRepository(database);
    this.runtimeCheckpoints = new SqliteRuntimeCheckpointRepository(database);
    this.runtimeJobRuns = new SqliteRuntimeJobRunRepository(database);
    this.multiAgentCoordinationPlans = new SqliteMultiAgentCoordinationPlanRepository(database);
    this.multiAgentSlotSummaries = new SqliteMultiAgentSlotSummaryRepository(database);
    this.externalAgentDryRuns = new SqliteGenericDryRunRepository<ExternalAgentPatchPlan>(
      database,
      'external_agent_dry_runs',
    );
    this.externalAgentApprovals =
      new SqliteGenericApprovalRepository<ExternalAgentApprovalArtifact>(
        database,
        'external_agent_approvals',
      );
    this.externalAgentRuns = new SqliteGenericRunRepository<ExternalAgentRun>(
      database,
      'external_agent_runs',
    );
    this.externalAgentPatchSummaries = new SqliteExternalAgentPatchSummaryRepository(database);
    this.platformOperationApprovals =
      new SqliteGenericApprovalRepository<PlatformOperationApprovalArtifact>(
        database,
        'platform_operation_approvals',
      );
    this.platformBackupPlans = new SqlitePlatformBackupPlanRepository(database);
    this.platformBackupRuns = new SqlitePlatformBackupRunRepository(database);
    this.platformRestorePlans = new SqlitePlatformRestorePlanRepository(database);
    this.platformRestoreRuns = new SqlitePlatformRestoreRunRepository(database);
    this.storeMigrationPlans = new SqliteStoreMigrationPlanRepository(database);
    this.storeMigrationRuns = new SqliteStoreMigrationRunRepository(database);
    this.retentionPolicyPlans = new SqliteRetentionPolicyPlanRepository(database);
    this.retentionPolicyRuns = new SqliteRetentionPolicyRunRepository(database);
    this.auditExportPlans = new SqliteAuditExportPlanRepository(database);
    this.auditExportRuns = new SqliteAuditExportRunRepository(database);
    this.operatorRoleAssignmentPlans = new SqliteOperatorRoleAssignmentPlanRepository(database);
    this.operatorRoleAssignmentRuns = new SqliteOperatorRoleAssignmentRunRepository(database);
    this.disasterRecoveryRehearsalRuns =
      new SqliteDisasterRecoveryRehearsalRunRepository(database);
    this.productionGaDryRuns = new SqliteProductionGaDryRunRepository(database);
    this.productionGaApprovals = new SqliteProductionGaApprovalRepository(database);
    this.productionGaSignoffPlans = new SqliteProductionGaSignoffPlanRepository(database);
    this.productionGaSignoffRuns = new SqliteGenericRunRepository<ProductionGaSignoffRun>(
      database,
      'production_ga_signoff_runs',
    );
    this.productionGaE2ERehearsalRuns =
      new SqliteProductionGaE2ERehearsalRunRepository(database);
    this.productionGaTrainingCompletions =
      new SqliteProductionGaTrainingCompletionRepository(database);
    this.productionGaThreatModels = new SqliteProductionGaThreatModelRepository(database);
    this.productionGaResidualRiskRegisters =
      new SqliteProductionGaResidualRiskRegisterRepository(database);
    this.githubRemoteCleanupDryRuns = new SqliteGithubRemoteCleanupDryRunRepository(database);
    this.githubRemoteCleanupApprovals = new SqliteGithubRemoteCleanupApprovalRepository(database);
    this.githubRemoteCleanupRuns = new SqliteGithubRemoteCleanupRunRepository(database);
    this.reworkLoopDryRuns = new SqliteReworkLoopDryRunRepository(database);
    this.reworkLoopApprovals = new SqliteReworkLoopApprovalRepository(database);
    this.reworkLoopRuns = new SqliteReworkLoopRunRepository(database);
    this.customWorkflowDryRuns = new SqliteCustomWorkflowDryRunRepository(database);
    this.customWorkflowApprovals = new SqliteCustomWorkflowApprovalRepository(database);
    this.customWorkflowRuns = new SqliteCustomWorkflowRunRepository(database);
    this.productionWorkflowRecoveryDryRuns =
      new SqliteProductionWorkflowRecoveryDryRunRepository(database);
    this.productionWorkflowRecoveryApprovals =
      new SqliteProductionWorkflowRecoveryApprovalRepository(database);
    this.productionWorkflowRecoveryRuns =
      new SqliteProductionWorkflowRecoveryRunRepository(database);
    this.productionWorkflowRecoveryChildActionStates =
      new SqliteProductionWorkflowRecoveryChildActionStateRepository(database);
    this.codexPatchChildRecords = new SqliteCodexPatchChildRecordRepository(database);
    this.nxVerificationChildRecords = new SqliteNxVerificationChildRecordRepository(database);
    this.codexReportReviews = new SqliteCodexReportReviewRepository(database);
    this.codexExecLiveAdapterAdrDecisions = new SqliteCodexExecLiveAdapterAdrDecisionRepository(
      database,
    );
    this.codexExecReadOnlyAdapterSimulatorReviews =
      new SqliteCodexExecReadOnlyAdapterSimulatorReviewRepository(database);
    this.codexExecReadOnlyAdapterImplementationPlanReviews =
      new SqliteCodexExecReadOnlyAdapterImplementationPlanReviewRepository(database);
    this.codexExecReadOnlyAdapterSkeletonReviews =
      new SqliteCodexExecReadOnlyAdapterSkeletonReviewRepository(database);
    this.codexExecReadOnlyAdapterFinalReadiness =
      new SqliteCodexExecReadOnlyAdapterFinalReadinessRepository(database);
    this.codexExecRealReadOnlyAdapterReadiness =
      new SqliteCodexExecRealReadOnlyAdapterReadinessRepository(database);
    this.codexExecRealReadOnlyAdapterReadinessReviews =
      new SqliteCodexExecRealReadOnlyAdapterReadinessReviewRepository(database);
    this.codexExecRealReadOnlyAdapterAttempts =
      new SqliteCodexExecRealReadOnlyAdapterAttemptRepository(database);
    this.codexExecRealReadOnlyAdapterPolicySources =
      new SqliteCodexExecRealReadOnlyAdapterPolicySourceRepository(database);
    this.codexExecRealReadOnlyAdapterApprovalAuthorityTraces =
      new SqliteCodexExecRealReadOnlyAdapterApprovalAuthorityTraceRepository(database);
    this.codexExecRealReadOnlyAdapterPilotPrerequisites =
      new SqliteCodexExecRealReadOnlyAdapterPilotPrerequisiteRepository(database);
    this.codexExecRealReadOnlyAdapterPilotSourcePreparations =
      new SqliteCodexExecRealReadOnlyAdapterPilotSourcePreparationRepository(database);
    this.businessWorkspaces = new SqliteMetadataEntityRepository<BusinessWorkspace>(
      database,
      'business_workspaces',
    );
    this.businessMembershipMirrors = new SqliteMetadataEntityRepository<BusinessMembershipMirror>(
      database,
      'business_membership_mirrors',
    );
    this.chromeProfileBindings = new SqliteMetadataEntityRepository<ChromeProfileBinding>(
      database,
      'chrome_profile_bindings',
    );
    this.chatGptSessionHealth = new SqliteMetadataEntityRepository<ChatGptSessionHealth>(
      database,
      'chatgpt_session_health',
    );
    this.humanCheckpoints = new SqliteMetadataEntityRepository<HumanCheckpoint>(
      database,
      'human_checkpoints',
    );
    this.codexClientInstances = new SqliteMetadataEntityRepository<CodexClientInstance>(
      database,
      'codex_client_instances',
    );
    this.codexAppServerSessions = new SqliteMetadataEntityRepository<CodexAppServerSession>(
      database,
      'codex_app_server_sessions',
    );
    this.codexAppServerWireMessageSummaries =
      new SqliteMetadataEntityRepository<CodexAppServerWireMessageSummary>(
        database,
        'codex_app_server_wire_message_summaries',
      );
    this.codexAppServerThreadMirrors =
      new SqliteMetadataEntityRepository<CodexAppServerThreadMirror>(
        database,
        'codex_app_server_thread_mirrors',
      );
    this.codexAppServerTurnMirrors =
      new SqliteMetadataEntityRepository<CodexAppServerTurnMirror>(
        database,
        'codex_app_server_turn_mirrors',
      );
    this.codexAppServerEventSummaries =
      new SqliteMetadataEntityRepository<CodexAppServerEventSummary>(
        database,
        'codex_app_server_event_summaries',
      );
    this.codexAppServerApprovalBridgeRecords =
      new SqliteMetadataEntityRepository<CodexAppServerApprovalBridgeRecord>(
        database,
        'codex_app_server_approval_bridge_records',
      );
    this.codexAppServerProtocolDriftReports =
      new SqliteMetadataEntityRepository<CodexAppServerProtocolDriftReport>(
        database,
        'codex_app_server_protocol_drift_reports',
      );
    this.codexAccountBindings = new SqliteMetadataEntityRepository<CodexAccountBinding>(
      database,
      'codex_account_bindings',
    );
    this.codexTaskIntents = new SqliteMetadataEntityRepository<CodexTaskIntent>(
      database,
      'codex_task_intents',
    );
    this.codexTaskRuns = new SqliteMetadataEntityRepository<CodexTaskRun>(
      database,
      'codex_task_runs',
    );
    this.codexTaskDiagnoses = new SqliteMetadataEntityRepository<CodexTaskDiagnosis>(
      database,
      'codex_task_diagnoses',
    );
    this.codexRecoveryRuns = new SqliteMetadataEntityRepository<CodexRecoveryRun>(
      database,
      'codex_recovery_runs',
    );
    this.codexTaskDiffSummaries =
      new SqliteMetadataEntityRepository<CodexTaskDiffSummaryProjection>(
        database,
        'codex_task_diff_summaries',
      );
    this.codexTaskVerificationProjections =
      new SqliteMetadataEntityRepository<CodexTaskVerificationProjection>(
        database,
        'codex_task_verification_projections',
      );
    this.codexTaskReviewProjections =
      new SqliteMetadataEntityRepository<CodexTaskReviewProjection>(
        database,
        'codex_task_review_projections',
      );
    this.codexTaskGithubClosureProjections =
      new SqliteMetadataEntityRepository<CodexTaskGithubClosureProjection>(
        database,
        'codex_task_github_closure_projections',
      );
    this.codexTaskClosureRuns = new SqliteMetadataEntityRepository<CodexTaskClosureRun>(
      database,
      'codex_task_closure_runs',
    );
    this.codexProductionCanaryTasks =
      new SqliteMetadataEntityRepository<CodexProductionCanaryTask>(
        database,
        'codex_production_canary_tasks',
      );
    this.codexProductionCanaryRuns =
      new SqliteMetadataEntityRepository<CodexProductionCanaryRun>(
        database,
        'codex_production_canary_runs',
      );
    this.codexProductionDriftGates =
      new SqliteMetadataEntityRepository<CodexProductionDriftGate>(
        database,
        'codex_production_drift_gates',
      );
    this.codexProductionReadinessGates =
      new SqliteMetadataEntityRepository<CodexProductionReadinessGate>(
        database,
        'codex_production_readiness_gates',
      );
    this.codexProductionAuditExportSummaries =
      new SqliteMetadataEntityRepository<CodexProductionAuditExportSummary>(
        database,
        'codex_production_audit_export_summaries',
      );
    this.accountPools = new SqliteMetadataEntityRepository<AccountPool>(
      database,
      'account_pools',
    );
    this.clientPools = new SqliteMetadataEntityRepository<ClientPool>(database, 'client_pools');
    this.poolLeases = new SqliteMetadataEntityRepository<Lease>(database, 'pool_leases');
    this.quotaSnapshots = new SqliteMetadataEntityRepository<QuotaSnapshot>(
      database,
      'quota_snapshots',
    );
    this.evidenceBundles = new SqliteMetadataEntityRepository<EvidenceBundle>(
      database,
      'evidence_bundles',
    );
    this.businessCodexSeats = new SqliteMetadataEntityRepository<BusinessCodexSeat>(
      database,
      'business_codex_seats',
    );
    this.workspaceCreditSnapshots =
      new SqliteMetadataEntityRepository<WorkspaceCreditSnapshot>(
        database,
        'workspace_credit_snapshots',
      );
    this.codexSeatUsageLimits = new SqliteMetadataEntityRepository<CodexSeatUsageLimit>(
      database,
      'codex_seat_usage_limits',
    );
    this.codexQuotaSourceHealth =
      new SqliteMetadataEntityRepository<CodexQuotaSourceHealth>(
        database,
        'codex_quota_source_health',
      );
    this.quotaAttributions = new SqliteMetadataEntityRepository<QuotaAttribution>(
      database,
      'quota_attributions',
    );
    this.businessQuotaCrossCheckReports =
      new SqliteMetadataEntityRepository<BusinessQuotaCrossCheckReport>(
        database,
        'business_quota_cross_check_reports',
      );
    this.ownerAdminReadSurfaceSummaries =
      new SqliteMetadataEntityRepository<OwnerAdminReadSurfaceSummary>(
        database,
        'owner_admin_read_surface_summaries',
      );
    this.businessAdminMemberRosterSnapshots =
      new SqliteMetadataEntityRepository<BusinessAdminMemberRosterSnapshot>(
        database,
        'business_admin_member_roster_snapshots',
      );
    this.businessBillingSummaries =
      new SqliteMetadataEntityRepository<BusinessBillingSummary>(
        database,
        'business_billing_summaries',
      );
    this.ownerAdminExtractionReports =
      new SqliteMetadataEntityRepository<OwnerAdminExtractionReport>(
        database,
        'owner_admin_extraction_reports',
      );
    this.businessProfileWorkspaceObservations =
      new SqliteMetadataEntityRepository<BusinessProfileWorkspaceObservation>(
        database,
        'business_profile_workspace_observations',
      );
    this.businessWorkspaceSwitchDryRunPlans =
      new SqliteMetadataEntityRepository<BusinessWorkspaceSwitchDryRunPlan>(
        database,
        'business_workspace_switch_dry_run_plans',
      );
    this.businessWorkspaceSwitchRuns =
      new SqliteMetadataEntityRepository<BusinessWorkspaceSwitchRun>(
        database,
        'business_workspace_switch_runs',
      );
    this.businessMemberReconciliationReports =
      new SqliteMetadataEntityRepository<BusinessMemberReconciliationReport>(
        database,
        'business_member_reconciliation_reports',
      );
    this.automationCapabilityPolicies =
      new SqliteMetadataEntityRepository<AutomationCapabilityPolicy>(
        database,
        'automation_capability_policies',
      );
    this.uiObservationSources = new SqliteMetadataEntityRepository<UiObservationSource>(
      database,
      'ui_observation_sources',
    );
    this.cdpDomObservationSummaries =
      new SqliteMetadataEntityRepository<CdpDomObservationSummary>(
        database,
        'cdp_dom_observation_summaries',
      );
    this.electronRendererObservationSummaries =
      new SqliteMetadataEntityRepository<ElectronRendererObservationSummary>(
        database,
        'electron_renderer_observation_summaries',
      );
    this.uiTargetFingerprints = new SqliteMetadataEntityRepository<UiTargetFingerprint>(
      database,
      'ui_target_fingerprints',
    );
    this.uiAutomationIntents = new SqliteMetadataEntityRepository<UiAutomationIntent>(
      database,
      'ui_automation_intents',
    );
    this.uiAutomationDryRunPlans =
      new SqliteMetadataEntityRepository<UiAutomationDryRunPlan>(
        database,
        'ui_automation_dry_run_plans',
      );
    this.uiAutomationAuthorities =
      new SqliteMetadataEntityRepository<UiAutomationAuthority>(
        database,
        'ui_automation_authorities',
      );
    this.uiAutomationRuns = new SqliteMetadataEntityRepository<UiAutomationRun>(
      database,
      'ui_automation_runs',
    );
    this.adminWriteIntents = new SqliteMetadataEntityRepository<AdminWriteIntent>(
      database,
      'admin_write_intents',
    );
    this.adminWriteDryRunPlans =
      new SqliteMetadataEntityRepository<AdminWriteDryRunPlan>(
        database,
        'admin_write_dry_run_plans',
      );
    this.adminWriteAuthorities =
      new SqliteMetadataEntityRepository<AdminWriteAuthority>(
        database,
        'admin_write_authorities',
      );
    this.adminWriteRuns = new SqliteMetadataEntityRepository<AdminWriteRun>(
      database,
      'admin_write_runs',
    );
    this.sensitiveRedactionReports =
      new SqliteMetadataEntityRepository<SensitiveRedactionReport>(
        database,
        'sensitive_redaction_reports',
      );
    this.businessQuotaSourceProbes =
      new SqliteMetadataEntityRepository<BusinessQuotaSourceProbe>(
        database,
        'business_quota_source_probes',
      );
    this.businessQuotaPermissionProbes =
      new SqliteMetadataEntityRepository<BusinessQuotaPermissionProbe>(
        database,
        'business_quota_permission_probes',
      );
    this.localCapabilityProbes = new SqliteMetadataEntityRepository<LocalCapabilityProbe>(
      database,
      'local_capability_probes',
    );
    this.forbiddenPathProbes = new SqliteMetadataEntityRepository<ForbiddenPathProbe>(
      database,
      'forbidden_path_probes',
    );
    this.quotaEvidenceMatrices = new SqliteMetadataEntityRepository<QuotaEvidenceMatrix>(
      database,
      'quota_evidence_matrices',
    );
    this.quotaReadinessDebugReports =
      new SqliteMetadataEntityRepository<QuotaReadinessDebugReport>(
        database,
        'quota_readiness_debug_reports',
      );
  }

  async close(): Promise<void> {
    this.database.close();
  }
}

class SqliteEvidenceRefRepository implements EvidenceRefRepository {
  private readonly repository: JsonEntityRepository<EvidenceRef>;

  constructor(database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<EvidenceRef>(
      database,
      'evidence_refs',
      (ref) => ref.createdAt,
    );
  }

  async create(ref: EvidenceRef): Promise<EvidenceRef> {
    return this.repository.create(ref);
  }

  async getById(id: string): Promise<EvidenceRef | undefined> {
    return this.repository.getById(id);
  }

  async getEvidenceRef(id: string): Promise<EvidenceRef | undefined> {
    return this.repository.getById(id);
  }

  async listEvidenceRefs(query: EvidenceRefQuery = {}): Promise<EvidenceRef[]> {
    const refs = await this.repository.list();
    const filteredRefs = refs.filter((ref) => {
      if (query.kind && ref.kind !== query.kind) {
        return false;
      }

      if (query.dryRunId && !metadataMatchesDryRun(ref.metadata, query.dryRunId)) {
        return false;
      }

      return true;
    });

    return filteredRefs.slice(0, normalizeLimit(query.limit));
  }

  async list(): Promise<EvidenceRef[]> {
    return this.repository.list();
  }
}

class SqliteAuditEventRepository implements AuditEventRepository {
  private readonly repository: AppendOnlyJsonEntityRepository<AuditEvent>;

  constructor(database: SqliteDatabase) {
    this.repository = new AppendOnlyJsonEntityRepository<AuditEvent>(
      database,
      'audit_events',
      (event) => event.createdAt,
    );
  }

  async append(event: AuditEvent): Promise<AuditEvent> {
    return this.repository.append(event);
  }

  async getAuditEvent(id: string): Promise<AuditEvent | undefined> {
    return this.repository.getById(id);
  }

  async listAuditEvents(query: AuditEventQuery = {}): Promise<AuditEvent[]> {
    const events = await this.repository.list();
    const filteredEvents = events.filter((event) => {
      if (query.action && event.action !== query.action) {
        return false;
      }

      if (query.dryRunId && !metadataMatchesDryRun(event.metadata, query.dryRunId)) {
        return false;
      }

      return true;
    });

    return filteredEvents.slice(0, normalizeLimit(query.limit));
  }

  async list(): Promise<AuditEvent[]> {
    return this.repository.list();
  }
}

class SqliteDevelopmentRunRepository implements DevelopmentRunRepository {
  private readonly repository: JsonEntityRepository<MockDevelopmentRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<MockDevelopmentRun>(
      database,
      'development_runs',
      (run) => run.createdAt,
    );
  }

  async saveMockDevelopmentRun(result: MockDevelopmentRun): Promise<MockDevelopmentRun> {
    return this.repository.create(result);
  }

  async listMockDevelopmentRuns(limit = 10): Promise<MockDevelopmentRun[]> {
    const safeLimit = Math.max(0, Math.trunc(limit));
    const rows = this.database
      .prepare('SELECT payload FROM development_runs ORDER BY recorded_at DESC, id DESC LIMIT ?')
      .all(safeLimit) as unknown as PayloadRow[];

    return rows.map((row) => JSON.parse(row.payload) as MockDevelopmentRun);
  }

  async getMockDevelopmentRun(id: string): Promise<MockDevelopmentRun | undefined> {
    return this.repository.getById(id);
  }
}

class SqliteCodexReplayRepository implements CodexReplayRepository {
  private readonly repository: JsonEntityRepository<CodexReplayRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<CodexReplayRecord>(
      database,
      'codex_replays',
      (record) => record.createdAt,
    );
  }

  async saveCodexReplay(record: CodexReplayRecord): Promise<CodexReplayRecord> {
    return this.repository.create(record);
  }

  async listCodexReplays(limit = 10): Promise<CodexReplayRecord[]> {
    const safeLimit = Math.max(0, Math.trunc(limit));
    const rows = this.database
      .prepare('SELECT payload FROM codex_replays ORDER BY recorded_at DESC, id DESC LIMIT ?')
      .all(safeLimit) as unknown as PayloadRow[];

    return rows.map((row) => JSON.parse(row.payload) as CodexReplayRecord);
  }

  async getCodexReplay(id: string): Promise<CodexReplayRecord | undefined> {
    return this.repository.getById(id);
  }
}

class SqliteCodexExecLiveRunRepository implements CodexExecLiveRunRepository {
  private readonly repository: JsonEntityRepository<CodexExecLiveRunRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<CodexExecLiveRunRecord>(
      database,
      'codex_exec_live_runs',
      (record) => record.createdAt,
    );
  }

  async saveCodexExecLiveRunRecord(
    record: CodexExecLiveRunRecord,
  ): Promise<CodexExecLiveRunRecord> {
    return this.repository.create(record);
  }

  async listCodexExecLiveRunRecords(limit = 10): Promise<CodexExecLiveRunRecord[]> {
    const safeLimit = Math.max(0, Math.trunc(limit));
    const rows = this.database
      .prepare(
        'SELECT payload FROM codex_exec_live_runs ORDER BY recorded_at DESC, id DESC LIMIT ?',
      )
      .all(safeLimit) as unknown as PayloadRow[];

    return rows.map((row) => JSON.parse(row.payload) as CodexExecLiveRunRecord);
  }

  async getCodexExecLiveRunRecord(id: string): Promise<CodexExecLiveRunRecord | undefined> {
    return this.repository.getById(id);
  }
}

class SqliteCodexExecApprovalRepository implements CodexExecApprovalRepository {
  private readonly repository: JsonEntityRepository<CodexExecManualApprovalRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<CodexExecManualApprovalRecord>(
      database,
      'codex_exec_approvals',
      (record) => record.createdAt,
    );
  }

  async saveCodexExecApprovalRecord(
    record: CodexExecManualApprovalRecord,
  ): Promise<CodexExecManualApprovalRecord> {
    return this.repository.create(record);
  }

  async listCodexExecApprovalRecords(limit = 10): Promise<CodexExecManualApprovalRecord[]> {
    const safeLimit = Math.max(0, Math.trunc(limit));
    const rows = this.database
      .prepare(
        'SELECT payload FROM codex_exec_approvals ORDER BY recorded_at DESC, id DESC LIMIT ?',
      )
      .all(safeLimit) as unknown as PayloadRow[];

    return rows.map((row) => JSON.parse(row.payload) as CodexExecManualApprovalRecord);
  }

  async getCodexExecApprovalRecord(id: string): Promise<CodexExecManualApprovalRecord | undefined> {
    return this.repository.getById(id);
  }

  async getCodexExecApprovalRecordByArtifactId(
    approvalArtifactId: string,
  ): Promise<CodexExecManualApprovalRecord | undefined> {
    const rows = this.database
      .prepare('SELECT payload FROM codex_exec_approvals ORDER BY recorded_at DESC, id DESC')
      .all() as unknown as PayloadRow[];
    return rows
      .map((row) => JSON.parse(row.payload) as CodexExecManualApprovalRecord)
      .find((record) => record.approvalArtifact?.id === approvalArtifactId);
  }

  async listCodexExecApprovalRecordsForDryRun(
    dryRunPlanId: string,
    limit = 100,
  ): Promise<CodexExecManualApprovalRecord[]> {
    const safeLimit = Math.max(0, Math.trunc(limit));
    const rows = this.database
      .prepare('SELECT payload FROM codex_exec_approvals ORDER BY recorded_at DESC, id DESC')
      .all() as unknown as PayloadRow[];
    return rows
      .map((row) => JSON.parse(row.payload) as CodexExecManualApprovalRecord)
      .filter((record) => record.request.dryRunPlanId === dryRunPlanId)
      .slice(0, safeLimit);
  }
}

class SqliteBrowserObservationDryRunRepository implements BrowserObservationDryRunRepository {
  private readonly repository: JsonEntityRepository<BrowserObservationDryRunRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<BrowserObservationDryRunRecord>(
      database,
      'browser_observation_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: BrowserObservationDryRunRecord): Promise<BrowserObservationDryRunRecord> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<BrowserObservationDryRunRecord | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: BrowserObservationQuery = {},
  ): Promise<BrowserObservationDryRunRecord[]> {
    return listBrowserObservationRecords<BrowserObservationDryRunRecord>(
      this.database,
      'browser_observation_dry_runs',
      query,
    );
  }
}

class SqliteBrowserObservationApprovalRepository implements BrowserObservationApprovalRepository {
  private readonly repository: JsonEntityRepository<BrowserObservationApprovalArtifactRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<BrowserObservationApprovalArtifactRecord>(
      database,
      'browser_observation_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: BrowserObservationApprovalArtifactRecord,
  ): Promise<BrowserObservationApprovalArtifactRecord> {
    return this.repository.create(record);
  }

  async getApproval(id: string): Promise<BrowserObservationApprovalArtifactRecord | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<BrowserObservationApprovalArtifactRecord | undefined> {
    const rows = this.database
      .prepare('SELECT payload FROM browser_observation_approvals ORDER BY recorded_at DESC, id DESC')
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as BrowserObservationApprovalArtifactRecord)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: BrowserObservationQuery = {},
  ): Promise<BrowserObservationApprovalArtifactRecord[]> {
    return listBrowserObservationRecords<BrowserObservationApprovalArtifactRecord>(
      this.database,
      'browser_observation_approvals',
      query,
    );
  }
}

class SqliteBrowserObservationRunRepository implements BrowserObservationRunRepository {
  private readonly repository: JsonEntityRepository<BrowserObservationControlPlaneRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<BrowserObservationControlPlaneRun>(
      database,
      'browser_observation_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(
    record: BrowserObservationControlPlaneRun,
  ): Promise<BrowserObservationControlPlaneRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<BrowserObservationControlPlaneRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: BrowserObservationQuery = {},
  ): Promise<BrowserObservationControlPlaneRun[]> {
    return listBrowserObservationRecords<BrowserObservationControlPlaneRun>(
      this.database,
      'browser_observation_runs',
      query,
    );
  }
}

class SqliteElectronCdpObservationDryRunRepository
  implements ElectronCdpObservationDryRunRepository
{
  private readonly repository: JsonEntityRepository<ElectronCdpObservationDryRunRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ElectronCdpObservationDryRunRecord>(
      database,
      'electron_cdp_observation_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(
    record: ElectronCdpObservationDryRunRecord,
  ): Promise<ElectronCdpObservationDryRunRecord> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<ElectronCdpObservationDryRunRecord | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: ElectronCdpObservationQuery = {},
  ): Promise<ElectronCdpObservationDryRunRecord[]> {
    return listObservationControlPlaneRecords<ElectronCdpObservationDryRunRecord>(
      this.database,
      'electron_cdp_observation_dry_runs',
      query,
    );
  }
}

class SqliteElectronCdpObservationApprovalRepository
  implements ElectronCdpObservationApprovalRepository
{
  private readonly repository: JsonEntityRepository<ElectronCdpObservationApprovalArtifactRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ElectronCdpObservationApprovalArtifactRecord>(
      database,
      'electron_cdp_observation_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: ElectronCdpObservationApprovalArtifactRecord,
  ): Promise<ElectronCdpObservationApprovalArtifactRecord> {
    return this.repository.create(record);
  }

  async getApproval(
    id: string,
  ): Promise<ElectronCdpObservationApprovalArtifactRecord | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<ElectronCdpObservationApprovalArtifactRecord | undefined> {
    const rows = this.database
      .prepare(
        'SELECT payload FROM electron_cdp_observation_approvals ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as ElectronCdpObservationApprovalArtifactRecord)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: ElectronCdpObservationQuery = {},
  ): Promise<ElectronCdpObservationApprovalArtifactRecord[]> {
    return listObservationControlPlaneRecords<ElectronCdpObservationApprovalArtifactRecord>(
      this.database,
      'electron_cdp_observation_approvals',
      query,
    );
  }
}

class SqliteElectronCdpObservationRunRepository implements ElectronCdpObservationRunRepository {
  private readonly repository: JsonEntityRepository<ElectronCdpObservationControlPlaneRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ElectronCdpObservationControlPlaneRun>(
      database,
      'electron_cdp_observation_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(
    record: ElectronCdpObservationControlPlaneRun,
  ): Promise<ElectronCdpObservationControlPlaneRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<ElectronCdpObservationControlPlaneRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: ElectronCdpObservationQuery = {},
  ): Promise<ElectronCdpObservationControlPlaneRun[]> {
    return listObservationControlPlaneRecords<ElectronCdpObservationControlPlaneRun>(
      this.database,
      'electron_cdp_observation_runs',
      query,
    );
  }
}

class SqliteWorktreeDryRunRepository implements WorktreeDryRunRepository {
  private readonly repository: JsonEntityRepository<WorktreeDryRunRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<WorktreeDryRunRecord>(
      database,
      'worktree_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: WorktreeDryRunRecord): Promise<WorktreeDryRunRecord> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<WorktreeDryRunRecord | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: WorktreeControlPlaneQuery = {},
  ): Promise<WorktreeDryRunRecord[]> {
    return listObservationControlPlaneRecords<WorktreeDryRunRecord>(
      this.database,
      'worktree_dry_runs',
      query,
    );
  }
}

class SqliteWorktreeApprovalRepository implements WorktreeApprovalRepository {
  private readonly repository: JsonEntityRepository<WorktreeApprovalArtifactRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<WorktreeApprovalArtifactRecord>(
      database,
      'worktree_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: WorktreeApprovalArtifactRecord,
  ): Promise<WorktreeApprovalArtifactRecord> {
    return this.repository.create(record);
  }

  async getApproval(id: string): Promise<WorktreeApprovalArtifactRecord | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<WorktreeApprovalArtifactRecord | undefined> {
    const rows = this.database
      .prepare('SELECT payload FROM worktree_approvals ORDER BY recorded_at DESC, id DESC')
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as WorktreeApprovalArtifactRecord)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: WorktreeControlPlaneQuery = {},
  ): Promise<WorktreeApprovalArtifactRecord[]> {
    return listObservationControlPlaneRecords<WorktreeApprovalArtifactRecord>(
      this.database,
      'worktree_approvals',
      query,
    );
  }
}

class SqliteWorktreeRunRepository implements WorktreeRunRepository {
  private readonly repository: JsonEntityRepository<WorktreeControlPlaneRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<WorktreeControlPlaneRun>(
      database,
      'worktree_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: WorktreeControlPlaneRun): Promise<WorktreeControlPlaneRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<WorktreeControlPlaneRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: WorktreeControlPlaneQuery = {},
  ): Promise<WorktreeControlPlaneRun[]> {
    return listObservationControlPlaneRecords<WorktreeControlPlaneRun>(
      this.database,
      'worktree_runs',
      query,
    );
  }
}

class SqliteWorktreeCleanupDryRunRepository implements WorktreeCleanupDryRunRepository {
  private readonly repository: JsonEntityRepository<WorktreeCleanupDryRunRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<WorktreeCleanupDryRunRecord>(
      database,
      'worktree_cleanup_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: WorktreeCleanupDryRunRecord): Promise<WorktreeCleanupDryRunRecord> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<WorktreeCleanupDryRunRecord | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: WorktreeControlPlaneQuery = {},
  ): Promise<WorktreeCleanupDryRunRecord[]> {
    return listObservationControlPlaneRecords<WorktreeCleanupDryRunRecord>(
      this.database,
      'worktree_cleanup_dry_runs',
      query,
    );
  }
}

class SqliteWorktreeCleanupApprovalRepository implements WorktreeCleanupApprovalRepository {
  private readonly repository: JsonEntityRepository<WorktreeCleanupApprovalArtifactRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<WorktreeCleanupApprovalArtifactRecord>(
      database,
      'worktree_cleanup_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: WorktreeCleanupApprovalArtifactRecord,
  ): Promise<WorktreeCleanupApprovalArtifactRecord> {
    return this.repository.create(record);
  }

  async getApproval(id: string): Promise<WorktreeCleanupApprovalArtifactRecord | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<WorktreeCleanupApprovalArtifactRecord | undefined> {
    const rows = this.database
      .prepare('SELECT payload FROM worktree_cleanup_approvals ORDER BY recorded_at DESC, id DESC')
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as WorktreeCleanupApprovalArtifactRecord)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: WorktreeControlPlaneQuery = {},
  ): Promise<WorktreeCleanupApprovalArtifactRecord[]> {
    return listObservationControlPlaneRecords<WorktreeCleanupApprovalArtifactRecord>(
      this.database,
      'worktree_cleanup_approvals',
      query,
    );
  }
}

class SqliteWorktreeCleanupRunRepository implements WorktreeCleanupRunRepository {
  private readonly repository: JsonEntityRepository<WorktreeCleanupControlPlaneRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<WorktreeCleanupControlPlaneRun>(
      database,
      'worktree_cleanup_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(
    record: WorktreeCleanupControlPlaneRun,
  ): Promise<WorktreeCleanupControlPlaneRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<WorktreeCleanupControlPlaneRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: WorktreeControlPlaneQuery = {},
  ): Promise<WorktreeCleanupControlPlaneRun[]> {
    return listObservationControlPlaneRecords<WorktreeCleanupControlPlaneRun>(
      this.database,
      'worktree_cleanup_runs',
      query,
    );
  }
}

class SqliteReviewPackageDryRunRepository implements ReviewPackageDryRunRepository {
  private readonly repository: JsonEntityRepository<LocalReviewPackageDryRunRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<LocalReviewPackageDryRunRecord>(
      database,
      'review_package_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(
    record: LocalReviewPackageDryRunRecord,
  ): Promise<LocalReviewPackageDryRunRecord> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<LocalReviewPackageDryRunRecord | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: ReviewPackageControlPlaneQuery = {},
  ): Promise<LocalReviewPackageDryRunRecord[]> {
    return listObservationControlPlaneRecords<LocalReviewPackageDryRunRecord>(
      this.database,
      'review_package_dry_runs',
      query,
    );
  }
}

class SqliteReviewPackageApprovalRepository implements ReviewPackageApprovalRepository {
  private readonly repository: JsonEntityRepository<LocalReviewPackageApprovalArtifactRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<LocalReviewPackageApprovalArtifactRecord>(
      database,
      'review_package_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: LocalReviewPackageApprovalArtifactRecord,
  ): Promise<LocalReviewPackageApprovalArtifactRecord> {
    return this.repository.create(record);
  }

  async getApproval(id: string): Promise<LocalReviewPackageApprovalArtifactRecord | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<LocalReviewPackageApprovalArtifactRecord | undefined> {
    const rows = this.database
      .prepare('SELECT payload FROM review_package_approvals ORDER BY recorded_at DESC, id DESC')
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as LocalReviewPackageApprovalArtifactRecord)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: ReviewPackageControlPlaneQuery = {},
  ): Promise<LocalReviewPackageApprovalArtifactRecord[]> {
    return listObservationControlPlaneRecords<LocalReviewPackageApprovalArtifactRecord>(
      this.database,
      'review_package_approvals',
      query,
    );
  }
}

class SqliteReviewPackageRunRepository implements ReviewPackageRunRepository {
  private readonly repository: JsonEntityRepository<LocalReviewPackageControlPlaneRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<LocalReviewPackageControlPlaneRun>(
      database,
      'review_package_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(
    record: LocalReviewPackageControlPlaneRun,
  ): Promise<LocalReviewPackageControlPlaneRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<LocalReviewPackageControlPlaneRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: ReviewPackageControlPlaneQuery = {},
  ): Promise<LocalReviewPackageControlPlaneRun[]> {
    return listObservationControlPlaneRecords<LocalReviewPackageControlPlaneRun>(
      this.database,
      'review_package_runs',
      query,
    );
  }
}

class SqliteReleaseCandidateDryRunRepository implements ReleaseCandidateDryRunRepository {
  private readonly repository: JsonEntityRepository<LocalRcBundleDryRunRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<LocalRcBundleDryRunRecord>(
      database,
      'release_candidate_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: LocalRcBundleDryRunRecord): Promise<LocalRcBundleDryRunRecord> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<LocalRcBundleDryRunRecord | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: ReleaseCandidateControlPlaneQuery = {},
  ): Promise<LocalRcBundleDryRunRecord[]> {
    return listObservationControlPlaneRecords<LocalRcBundleDryRunRecord>(
      this.database,
      'release_candidate_dry_runs',
      query,
    );
  }
}

class SqliteReleaseCandidateApprovalRepository implements ReleaseCandidateApprovalRepository {
  private readonly repository: JsonEntityRepository<LocalRcBundleApprovalArtifactRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<LocalRcBundleApprovalArtifactRecord>(
      database,
      'release_candidate_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: LocalRcBundleApprovalArtifactRecord,
  ): Promise<LocalRcBundleApprovalArtifactRecord> {
    return this.repository.create(record);
  }

  async getApproval(id: string): Promise<LocalRcBundleApprovalArtifactRecord | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<LocalRcBundleApprovalArtifactRecord | undefined> {
    const rows = this.database
      .prepare('SELECT payload FROM release_candidate_approvals ORDER BY recorded_at DESC, id DESC')
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as LocalRcBundleApprovalArtifactRecord)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: ReleaseCandidateControlPlaneQuery = {},
  ): Promise<LocalRcBundleApprovalArtifactRecord[]> {
    return listObservationControlPlaneRecords<LocalRcBundleApprovalArtifactRecord>(
      this.database,
      'release_candidate_approvals',
      query,
    );
  }
}

class SqliteReleaseCandidateRunRepository implements ReleaseCandidateRunRepository {
  private readonly repository: JsonEntityRepository<LocalRcBundleControlPlaneRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<LocalRcBundleControlPlaneRun>(
      database,
      'release_candidate_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(
    record: LocalRcBundleControlPlaneRun,
  ): Promise<LocalRcBundleControlPlaneRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<LocalRcBundleControlPlaneRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: ReleaseCandidateControlPlaneQuery = {},
  ): Promise<LocalRcBundleControlPlaneRun[]> {
    return listObservationControlPlaneRecords<LocalRcBundleControlPlaneRun>(
      this.database,
      'release_candidate_runs',
      query,
    );
  }
}

class SqliteGithubMetadataDryRunRepository implements GithubMetadataDryRunRepository {
  private readonly repository: JsonEntityRepository<GithubMetadataDryRunRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubMetadataDryRunRecord>(
      database,
      'github_metadata_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: GithubMetadataDryRunRecord): Promise<GithubMetadataDryRunRecord> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<GithubMetadataDryRunRecord | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: GithubMetadataControlPlaneQuery = {},
  ): Promise<GithubMetadataDryRunRecord[]> {
    return listObservationControlPlaneRecords<GithubMetadataDryRunRecord>(
      this.database,
      'github_metadata_dry_runs',
      query,
    );
  }
}

class SqliteGithubMetadataApprovalRepository implements GithubMetadataApprovalRepository {
  private readonly repository: JsonEntityRepository<GithubMetadataApprovalArtifactRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubMetadataApprovalArtifactRecord>(
      database,
      'github_metadata_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: GithubMetadataApprovalArtifactRecord,
  ): Promise<GithubMetadataApprovalArtifactRecord> {
    return this.repository.create(record);
  }

  async getApproval(id: string): Promise<GithubMetadataApprovalArtifactRecord | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubMetadataApprovalArtifactRecord | undefined> {
    const rows = this.database
      .prepare('SELECT payload FROM github_metadata_approvals ORDER BY recorded_at DESC, id DESC')
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as GithubMetadataApprovalArtifactRecord)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: GithubMetadataControlPlaneQuery = {},
  ): Promise<GithubMetadataApprovalArtifactRecord[]> {
    return listObservationControlPlaneRecords<GithubMetadataApprovalArtifactRecord>(
      this.database,
      'github_metadata_approvals',
      query,
    );
  }
}

class SqliteGithubMetadataRunRepository implements GithubMetadataRunRepository {
  private readonly repository: JsonEntityRepository<GithubMetadataControlPlaneRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubMetadataControlPlaneRun>(
      database,
      'github_metadata_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: GithubMetadataControlPlaneRun): Promise<GithubMetadataControlPlaneRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<GithubMetadataControlPlaneRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: GithubMetadataControlPlaneQuery = {},
  ): Promise<GithubMetadataControlPlaneRun[]> {
    return listObservationControlPlaneRecords<GithubMetadataControlPlaneRun>(
      this.database,
      'github_metadata_runs',
      query,
    );
  }
}

class SqliteGithubDraftPrDryRunRepository implements GithubDraftPrDryRunRepository {
  private readonly repository: JsonEntityRepository<GithubDraftPrPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubDraftPrPlan>(
      database,
      'github_draft_pr_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: GithubDraftPrPlan): Promise<GithubDraftPrPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<GithubDraftPrPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: GithubDraftPrControlPlaneQuery = {},
  ): Promise<GithubDraftPrPlan[]> {
    return listObservationControlPlaneRecords<GithubDraftPrPlan>(
      this.database,
      'github_draft_pr_dry_runs',
      query,
    );
  }
}

class SqliteGithubDraftPrApprovalRepository implements GithubDraftPrApprovalRepository {
  private readonly repository: JsonEntityRepository<GithubDraftPrApprovalArtifactRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubDraftPrApprovalArtifactRecord>(
      database,
      'github_draft_pr_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: GithubDraftPrApprovalArtifactRecord,
  ): Promise<GithubDraftPrApprovalArtifactRecord> {
    return this.repository.create(record);
  }

  async getApproval(id: string): Promise<GithubDraftPrApprovalArtifactRecord | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubDraftPrApprovalArtifactRecord | undefined> {
    const rows = this.database
      .prepare('SELECT payload FROM github_draft_pr_approvals ORDER BY recorded_at DESC, id DESC')
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as GithubDraftPrApprovalArtifactRecord)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: GithubDraftPrControlPlaneQuery = {},
  ): Promise<GithubDraftPrApprovalArtifactRecord[]> {
    return listObservationControlPlaneRecords<GithubDraftPrApprovalArtifactRecord>(
      this.database,
      'github_draft_pr_approvals',
      query,
    );
  }
}

class SqliteGithubDraftPrRunRepository implements GithubDraftPrRunRepository {
  private readonly repository: JsonEntityRepository<GithubDraftPrRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubDraftPrRun>(
      database,
      'github_draft_pr_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: GithubDraftPrRun): Promise<GithubDraftPrRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<GithubDraftPrRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(query: GithubDraftPrControlPlaneQuery = {}): Promise<GithubDraftPrRun[]> {
    return listObservationControlPlaneRecords<GithubDraftPrRun>(
      this.database,
      'github_draft_pr_runs',
      query,
    );
  }
}

class SqliteGithubBranchPublishDryRunRepository implements GithubBranchPublishDryRunRepository {
  private readonly repository: JsonEntityRepository<GithubBranchPublishPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubBranchPublishPlan>(
      database,
      'github_branch_publish_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: GithubBranchPublishPlan): Promise<GithubBranchPublishPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<GithubBranchPublishPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: GithubBranchPublishControlPlaneQuery = {},
  ): Promise<GithubBranchPublishPlan[]> {
    return listObservationControlPlaneRecords<GithubBranchPublishPlan>(
      this.database,
      'github_branch_publish_dry_runs',
      query,
    );
  }
}

class SqliteGithubBranchPublishApprovalRepository
  implements GithubBranchPublishApprovalRepository
{
  private readonly repository: JsonEntityRepository<GithubBranchPublishApprovalArtifactRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubBranchPublishApprovalArtifactRecord>(
      database,
      'github_branch_publish_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: GithubBranchPublishApprovalArtifactRecord,
  ): Promise<GithubBranchPublishApprovalArtifactRecord> {
    return this.repository.create(record);
  }

  async getApproval(
    id: string,
  ): Promise<GithubBranchPublishApprovalArtifactRecord | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubBranchPublishApprovalArtifactRecord | undefined> {
    const rows = this.database
      .prepare(
        'SELECT payload FROM github_branch_publish_approvals ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as GithubBranchPublishApprovalArtifactRecord)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: GithubBranchPublishControlPlaneQuery = {},
  ): Promise<GithubBranchPublishApprovalArtifactRecord[]> {
    return listObservationControlPlaneRecords<GithubBranchPublishApprovalArtifactRecord>(
      this.database,
      'github_branch_publish_approvals',
      query,
    );
  }
}

class SqliteGithubBranchPublishRunRepository implements GithubBranchPublishRunRepository {
  private readonly repository: JsonEntityRepository<GithubBranchPublishRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubBranchPublishRun>(
      database,
      'github_branch_publish_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: GithubBranchPublishRun): Promise<GithubBranchPublishRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<GithubBranchPublishRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: GithubBranchPublishControlPlaneQuery = {},
  ): Promise<GithubBranchPublishRun[]> {
    return listObservationControlPlaneRecords<GithubBranchPublishRun>(
      this.database,
      'github_branch_publish_runs',
      query,
    );
  }
}

class SqliteGithubPublishDraftPrChainDryRunRepository
  implements GithubPublishDraftPrChainDryRunRepository
{
  private readonly repository: JsonEntityRepository<GithubPublishDraftPrChainPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubPublishDraftPrChainPlan>(
      database,
      'github_publish_draft_pr_chain_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(
    record: GithubPublishDraftPrChainPlan,
  ): Promise<GithubPublishDraftPrChainPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<GithubPublishDraftPrChainPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: GithubPublishDraftPrChainControlPlaneQuery = {},
  ): Promise<GithubPublishDraftPrChainPlan[]> {
    const records = await this.repository.list();
    return records.slice(0, normalizeLimit(query.limit));
  }
}

class SqliteGithubPublishDraftPrChainRunRepository
  implements GithubPublishDraftPrChainRunRepository
{
  private readonly repository: JsonEntityRepository<GithubPublishDraftPrChainRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubPublishDraftPrChainRun>(
      database,
      'github_publish_draft_pr_chain_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(
    record: GithubPublishDraftPrChainRun,
  ): Promise<GithubPublishDraftPrChainRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<GithubPublishDraftPrChainRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: GithubPublishDraftPrChainControlPlaneQuery = {},
  ): Promise<GithubPublishDraftPrChainRun[]> {
    return listObservationControlPlaneRecords<GithubPublishDraftPrChainRun>(
      this.database,
      'github_publish_draft_pr_chain_runs',
      query,
    );
  }
}

class SqliteGithubPrLifecycleDryRunRepository implements GithubPrLifecycleDryRunRepository {
  private readonly repository: JsonEntityRepository<GithubPrLifecycleObservationPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubPrLifecycleObservationPlan>(
      database,
      'github_pr_lifecycle_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(
    record: GithubPrLifecycleObservationPlan,
  ): Promise<GithubPrLifecycleObservationPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<GithubPrLifecycleObservationPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: GithubPrLifecycleControlPlaneQuery = {},
  ): Promise<GithubPrLifecycleObservationPlan[]> {
    return listObservationControlPlaneRecords<GithubPrLifecycleObservationPlan>(
      this.database,
      'github_pr_lifecycle_dry_runs',
      query,
    );
  }
}

class SqliteGithubPrLifecycleApprovalRepository
  implements GithubPrLifecycleApprovalRepository
{
  private readonly repository: JsonEntityRepository<GithubPrLifecycleApprovalArtifactRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubPrLifecycleApprovalArtifactRecord>(
      database,
      'github_pr_lifecycle_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: GithubPrLifecycleApprovalArtifactRecord,
  ): Promise<GithubPrLifecycleApprovalArtifactRecord> {
    return this.repository.create(record);
  }

  async getApproval(
    id: string,
  ): Promise<GithubPrLifecycleApprovalArtifactRecord | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubPrLifecycleApprovalArtifactRecord | undefined> {
    const rows = this.database
      .prepare(
        'SELECT payload FROM github_pr_lifecycle_approvals ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as GithubPrLifecycleApprovalArtifactRecord)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: GithubPrLifecycleControlPlaneQuery = {},
  ): Promise<GithubPrLifecycleApprovalArtifactRecord[]> {
    return listObservationControlPlaneRecords<GithubPrLifecycleApprovalArtifactRecord>(
      this.database,
      'github_pr_lifecycle_approvals',
      query,
    );
  }
}

class SqliteGithubPrLifecycleRunRepository implements GithubPrLifecycleRunRepository {
  private readonly repository: JsonEntityRepository<GithubPrLifecycleObservationRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubPrLifecycleObservationRun>(
      database,
      'github_pr_lifecycle_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(
    record: GithubPrLifecycleObservationRun,
  ): Promise<GithubPrLifecycleObservationRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<GithubPrLifecycleObservationRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: GithubPrLifecycleControlPlaneQuery = {},
  ): Promise<GithubPrLifecycleObservationRun[]> {
    return listObservationControlPlaneRecords<GithubPrLifecycleObservationRun>(
      this.database,
      'github_pr_lifecycle_runs',
      query,
    );
  }
}

class SqliteGithubPrManagementDryRunRepository implements GithubPrManagementDryRunRepository {
  private readonly repository: JsonEntityRepository<GithubPrManagementPlan>;

  constructor(
    private readonly database: SqliteDatabase,
    private readonly tableName: string,
  ) {
    this.repository = new JsonEntityRepository<GithubPrManagementPlan>(
      database,
      tableName,
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: GithubPrManagementPlan): Promise<GithubPrManagementPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<GithubPrManagementPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: GithubPrManagementControlPlaneQuery = {},
  ): Promise<GithubPrManagementPlan[]> {
    return listObservationControlPlaneRecords<GithubPrManagementPlan>(
      this.database,
      this.tableName,
      query,
    );
  }
}

class SqliteGithubPrManagementApprovalRepository
  implements GithubPrManagementApprovalRepository
{
  private readonly repository: JsonEntityRepository<GithubPrManagementApprovalArtifactRecord>;

  constructor(
    private readonly database: SqliteDatabase,
    private readonly tableName: string,
  ) {
    this.repository = new JsonEntityRepository<GithubPrManagementApprovalArtifactRecord>(
      database,
      tableName,
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: GithubPrManagementApprovalArtifactRecord,
  ): Promise<GithubPrManagementApprovalArtifactRecord> {
    return this.repository.create(record);
  }

  async getApproval(
    id: string,
  ): Promise<GithubPrManagementApprovalArtifactRecord | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubPrManagementApprovalArtifactRecord | undefined> {
    const rows = this.database
      .prepare(`SELECT payload FROM ${this.tableName} ORDER BY recorded_at DESC, id DESC`)
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as GithubPrManagementApprovalArtifactRecord)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: GithubPrManagementControlPlaneQuery = {},
  ): Promise<GithubPrManagementApprovalArtifactRecord[]> {
    return listObservationControlPlaneRecords<GithubPrManagementApprovalArtifactRecord>(
      this.database,
      this.tableName,
      query,
    );
  }
}

class SqliteGithubPrManagementRunRepository implements GithubPrManagementRunRepository {
  private readonly repository: JsonEntityRepository<GithubPrManagementRun>;

  constructor(
    private readonly database: SqliteDatabase,
    private readonly tableName: string,
  ) {
    this.repository = new JsonEntityRepository<GithubPrManagementRun>(
      database,
      tableName,
      (record) => record.createdAt,
    );
  }

  async saveRun(record: GithubPrManagementRun): Promise<GithubPrManagementRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<GithubPrManagementRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: GithubPrManagementControlPlaneQuery = {},
  ): Promise<GithubPrManagementRun[]> {
    return listObservationControlPlaneRecords<GithubPrManagementRun>(
      this.database,
      this.tableName,
      query,
    );
  }
}

class SqliteGithubMergeDryRunRepository implements GithubMergeDryRunRepository {
  private readonly repository: JsonEntityRepository<GithubMergeReadinessPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubMergeReadinessPlan>(
      database,
      'github_merge_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: GithubMergeReadinessPlan): Promise<GithubMergeReadinessPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<GithubMergeReadinessPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: GithubMergeControlPlaneQuery = {},
  ): Promise<GithubMergeReadinessPlan[]> {
    return listObservationControlPlaneRecords<GithubMergeReadinessPlan>(
      this.database,
      'github_merge_dry_runs',
      query,
    );
  }
}

class SqliteGithubMergeApprovalRepository implements GithubMergeApprovalRepository {
  private readonly repository: JsonEntityRepository<GithubMergeApprovalArtifact>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubMergeApprovalArtifact>(
      database,
      'github_merge_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(record: GithubMergeApprovalArtifact): Promise<GithubMergeApprovalArtifact> {
    return this.repository.create(record);
  }

  async getApproval(id: string): Promise<GithubMergeApprovalArtifact | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubMergeApprovalArtifact | undefined> {
    const rows = this.database
      .prepare('SELECT payload FROM github_merge_approvals ORDER BY recorded_at DESC, id DESC')
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as GithubMergeApprovalArtifact)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: GithubMergeControlPlaneQuery = {},
  ): Promise<GithubMergeApprovalArtifact[]> {
    return listObservationControlPlaneRecords<GithubMergeApprovalArtifact>(
      this.database,
      'github_merge_approvals',
      query,
    );
  }
}

class SqliteGithubMergeRunRepository implements GithubMergeRunRepository {
  private readonly repository: JsonEntityRepository<GithubMergeRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubMergeRun>(
      database,
      'github_merge_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: GithubMergeRun): Promise<GithubMergeRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<GithubMergeRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(query: GithubMergeControlPlaneQuery = {}): Promise<GithubMergeRun[]> {
    return listObservationControlPlaneRecords<GithubMergeRun>(
      this.database,
      'github_merge_runs',
      query,
    );
  }
}

class SqliteGithubActionsObservationDryRunRepository
  implements GithubActionsObservationDryRunRepository
{
  private readonly repository: JsonEntityRepository<GithubActionsObservationPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubActionsObservationPlan>(
      database,
      'github_actions_observation_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: GithubActionsObservationPlan): Promise<GithubActionsObservationPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<GithubActionsObservationPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: GithubActionsObservationControlPlaneQuery = {},
  ): Promise<GithubActionsObservationPlan[]> {
    return listObservationControlPlaneRecords<GithubActionsObservationPlan>(
      this.database,
      'github_actions_observation_dry_runs',
      query,
    );
  }
}

class SqliteGithubActionsObservationApprovalRepository
  implements GithubActionsObservationApprovalRepository
{
  private readonly repository: JsonEntityRepository<GithubActionsObservationApprovalArtifactRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubActionsObservationApprovalArtifactRecord>(
      database,
      'github_actions_observation_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: GithubActionsObservationApprovalArtifactRecord,
  ): Promise<GithubActionsObservationApprovalArtifactRecord> {
    return this.repository.create(record);
  }

  async getApproval(
    id: string,
  ): Promise<GithubActionsObservationApprovalArtifactRecord | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubActionsObservationApprovalArtifactRecord | undefined> {
    const rows = this.database
      .prepare(
        'SELECT payload FROM github_actions_observation_approvals ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as GithubActionsObservationApprovalArtifactRecord)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: GithubActionsObservationControlPlaneQuery = {},
  ): Promise<GithubActionsObservationApprovalArtifactRecord[]> {
    return listObservationControlPlaneRecords<GithubActionsObservationApprovalArtifactRecord>(
      this.database,
      'github_actions_observation_approvals',
      query,
    );
  }
}

class SqliteGithubActionsObservationRunRepository implements GithubActionsObservationRunRepository {
  private readonly repository: JsonEntityRepository<GithubActionsObservationRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubActionsObservationRun>(
      database,
      'github_actions_observation_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: GithubActionsObservationRun): Promise<GithubActionsObservationRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<GithubActionsObservationRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: GithubActionsObservationControlPlaneQuery = {},
  ): Promise<GithubActionsObservationRun[]> {
    return listObservationControlPlaneRecords<GithubActionsObservationRun>(
      this.database,
      'github_actions_observation_runs',
      query,
    );
  }
}

class SqliteGithubActionsRunControlDryRunRepository
  implements GithubActionsRunControlDryRunRepository
{
  private readonly repository: JsonEntityRepository<GithubActionsRunControlPlan>;

  constructor(
    private readonly database: SqliteDatabase,
    private readonly tableName: string,
  ) {
    this.repository = new JsonEntityRepository<GithubActionsRunControlPlan>(
      database,
      tableName,
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: GithubActionsRunControlPlan): Promise<GithubActionsRunControlPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<GithubActionsRunControlPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: GithubActionsRunControlControlPlaneQuery = {},
  ): Promise<GithubActionsRunControlPlan[]> {
    return listObservationControlPlaneRecords<GithubActionsRunControlPlan>(
      this.database,
      this.tableName,
      query,
    );
  }
}

class SqliteGithubActionsRunControlApprovalRepository
  implements GithubActionsRunControlApprovalRepository
{
  private readonly repository: JsonEntityRepository<GithubActionsRunControlApprovalArtifact>;

  constructor(
    private readonly database: SqliteDatabase,
    private readonly tableName: string,
  ) {
    this.repository = new JsonEntityRepository<GithubActionsRunControlApprovalArtifact>(
      database,
      tableName,
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: GithubActionsRunControlApprovalArtifact,
  ): Promise<GithubActionsRunControlApprovalArtifact> {
    return this.repository.create(record);
  }

  async getApproval(id: string): Promise<GithubActionsRunControlApprovalArtifact | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubActionsRunControlApprovalArtifact | undefined> {
    const rows = this.database
      .prepare(`SELECT payload FROM ${this.tableName} ORDER BY recorded_at DESC, id DESC`)
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as GithubActionsRunControlApprovalArtifact)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: GithubActionsRunControlControlPlaneQuery = {},
  ): Promise<GithubActionsRunControlApprovalArtifact[]> {
    return listObservationControlPlaneRecords<GithubActionsRunControlApprovalArtifact>(
      this.database,
      this.tableName,
      query,
    );
  }
}

class SqliteGithubActionsRunControlRunRepository implements GithubActionsRunControlRunRepository {
  private readonly repository: JsonEntityRepository<GithubActionsRunControlRun>;

  constructor(
    private readonly database: SqliteDatabase,
    private readonly tableName: string,
  ) {
    this.repository = new JsonEntityRepository<GithubActionsRunControlRun>(
      database,
      tableName,
      (record) => record.createdAt,
    );
  }

  async saveRun(record: GithubActionsRunControlRun): Promise<GithubActionsRunControlRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<GithubActionsRunControlRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: GithubActionsRunControlControlPlaneQuery = {},
  ): Promise<GithubActionsRunControlRun[]> {
    return listObservationControlPlaneRecords<GithubActionsRunControlRun>(
      this.database,
      this.tableName,
      query,
    );
  }
}

class SqliteGithubActionsDispatchDryRunRepository
  implements GithubActionsDispatchDryRunRepository
{
  private readonly repository: JsonEntityRepository<GithubActionsDispatchPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubActionsDispatchPlan>(
      database,
      'github_actions_dispatch_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: GithubActionsDispatchPlan): Promise<GithubActionsDispatchPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<GithubActionsDispatchPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: GithubActionsDispatchControlPlaneQuery = {},
  ): Promise<GithubActionsDispatchPlan[]> {
    return listObservationControlPlaneRecords<GithubActionsDispatchPlan>(
      this.database,
      'github_actions_dispatch_dry_runs',
      query,
    );
  }
}

class SqliteGithubActionsDispatchApprovalRepository
  implements GithubActionsDispatchApprovalRepository
{
  private readonly repository: JsonEntityRepository<GithubActionsDispatchApprovalArtifact>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubActionsDispatchApprovalArtifact>(
      database,
      'github_actions_dispatch_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: GithubActionsDispatchApprovalArtifact,
  ): Promise<GithubActionsDispatchApprovalArtifact> {
    return this.repository.create(record);
  }

  async getApproval(id: string): Promise<GithubActionsDispatchApprovalArtifact | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubActionsDispatchApprovalArtifact | undefined> {
    const rows = this.database
      .prepare(
        'SELECT payload FROM github_actions_dispatch_approvals ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as GithubActionsDispatchApprovalArtifact)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: GithubActionsDispatchControlPlaneQuery = {},
  ): Promise<GithubActionsDispatchApprovalArtifact[]> {
    return listObservationControlPlaneRecords<GithubActionsDispatchApprovalArtifact>(
      this.database,
      'github_actions_dispatch_approvals',
      query,
    );
  }
}

class SqliteGithubActionsDispatchRunRepository implements GithubActionsDispatchRunRepository {
  private readonly repository: JsonEntityRepository<GithubActionsDispatchRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubActionsDispatchRun>(
      database,
      'github_actions_dispatch_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: GithubActionsDispatchRun): Promise<GithubActionsDispatchRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<GithubActionsDispatchRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: GithubActionsDispatchControlPlaneQuery = {},
  ): Promise<GithubActionsDispatchRun[]> {
    return listObservationControlPlaneRecords<GithubActionsDispatchRun>(
      this.database,
      'github_actions_dispatch_runs',
      query,
    );
  }
}

class SqliteReleaseVersionPlanDryRunRepository implements ReleaseVersionPlanDryRunRepository {
  private readonly repository: JsonEntityRepository<ReleaseVersionPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ReleaseVersionPlan>(
      database,
      'release_version_plan_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: ReleaseVersionPlan): Promise<ReleaseVersionPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<ReleaseVersionPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: ReleaseVersionPlanControlPlaneQuery = {},
  ): Promise<ReleaseVersionPlan[]> {
    return listObservationControlPlaneRecords<ReleaseVersionPlan>(
      this.database,
      'release_version_plan_dry_runs',
      query,
    );
  }
}

class SqliteGithubReleaseTagDryRunRepository implements GithubReleaseTagDryRunRepository {
  private readonly repository: JsonEntityRepository<GithubReleaseTagPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubReleaseTagPlan>(
      database,
      'github_release_tag_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: GithubReleaseTagPlan): Promise<GithubReleaseTagPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<GithubReleaseTagPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: GithubReleaseTagControlPlaneQuery = {},
  ): Promise<GithubReleaseTagPlan[]> {
    return listObservationControlPlaneRecords<GithubReleaseTagPlan>(
      this.database,
      'github_release_tag_dry_runs',
      query,
    );
  }
}

class SqliteGithubReleaseTagApprovalRepository implements GithubReleaseTagApprovalRepository {
  private readonly repository: JsonEntityRepository<GithubReleaseTagApprovalArtifact>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubReleaseTagApprovalArtifact>(
      database,
      'github_release_tag_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: GithubReleaseTagApprovalArtifact,
  ): Promise<GithubReleaseTagApprovalArtifact> {
    return this.repository.create(record);
  }

  async getApproval(id: string): Promise<GithubReleaseTagApprovalArtifact | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubReleaseTagApprovalArtifact | undefined> {
    return getApprovalRecordByArtifactId<GithubReleaseTagApprovalArtifact>(
      this.database,
      'github_release_tag_approvals',
      approvalArtifactId,
    );
  }

  async listApprovals(
    query: GithubReleaseTagControlPlaneQuery = {},
  ): Promise<GithubReleaseTagApprovalArtifact[]> {
    return listObservationControlPlaneRecords<GithubReleaseTagApprovalArtifact>(
      this.database,
      'github_release_tag_approvals',
      query,
    );
  }
}

class SqliteGithubReleaseTagRunRepository implements GithubReleaseTagRunRepository {
  private readonly repository: JsonEntityRepository<GithubReleaseTagRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubReleaseTagRun>(
      database,
      'github_release_tag_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: GithubReleaseTagRun): Promise<GithubReleaseTagRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<GithubReleaseTagRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(query: GithubReleaseTagControlPlaneQuery = {}): Promise<GithubReleaseTagRun[]> {
    return listObservationControlPlaneRecords<GithubReleaseTagRun>(
      this.database,
      'github_release_tag_runs',
      query,
    );
  }
}

class SqliteGithubReleaseDraftDryRunRepository implements GithubReleaseDraftDryRunRepository {
  private readonly repository: JsonEntityRepository<GithubReleaseDraftPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubReleaseDraftPlan>(
      database,
      'github_release_draft_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: GithubReleaseDraftPlan): Promise<GithubReleaseDraftPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<GithubReleaseDraftPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: GithubReleaseDraftControlPlaneQuery = {},
  ): Promise<GithubReleaseDraftPlan[]> {
    return listObservationControlPlaneRecords<GithubReleaseDraftPlan>(
      this.database,
      'github_release_draft_dry_runs',
      query,
    );
  }
}

class SqliteGithubReleaseDraftApprovalRepository
  implements GithubReleaseDraftApprovalRepository
{
  private readonly repository: JsonEntityRepository<GithubReleaseDraftApprovalArtifact>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubReleaseDraftApprovalArtifact>(
      database,
      'github_release_draft_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: GithubReleaseDraftApprovalArtifact,
  ): Promise<GithubReleaseDraftApprovalArtifact> {
    return this.repository.create(record);
  }

  async getApproval(id: string): Promise<GithubReleaseDraftApprovalArtifact | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubReleaseDraftApprovalArtifact | undefined> {
    return getApprovalRecordByArtifactId<GithubReleaseDraftApprovalArtifact>(
      this.database,
      'github_release_draft_approvals',
      approvalArtifactId,
    );
  }

  async listApprovals(
    query: GithubReleaseDraftControlPlaneQuery = {},
  ): Promise<GithubReleaseDraftApprovalArtifact[]> {
    return listObservationControlPlaneRecords<GithubReleaseDraftApprovalArtifact>(
      this.database,
      'github_release_draft_approvals',
      query,
    );
  }
}

class SqliteGithubReleaseDraftRunRepository implements GithubReleaseDraftRunRepository {
  private readonly repository: JsonEntityRepository<GithubReleaseDraftRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubReleaseDraftRun>(
      database,
      'github_release_draft_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: GithubReleaseDraftRun): Promise<GithubReleaseDraftRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<GithubReleaseDraftRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: GithubReleaseDraftControlPlaneQuery = {},
  ): Promise<GithubReleaseDraftRun[]> {
    return listObservationControlPlaneRecords<GithubReleaseDraftRun>(
      this.database,
      'github_release_draft_runs',
      query,
    );
  }
}

class SqliteDeploymentObservationDryRunRepository
  implements DeploymentObservationDryRunRepository
{
  private readonly repository: JsonEntityRepository<DeploymentObservationPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<DeploymentObservationPlan>(
      database,
      'deployment_observation_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: DeploymentObservationPlan): Promise<DeploymentObservationPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<DeploymentObservationPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: DeploymentObservationControlPlaneQuery = {},
  ): Promise<DeploymentObservationPlan[]> {
    return listObservationControlPlaneRecords<DeploymentObservationPlan>(
      this.database,
      'deployment_observation_dry_runs',
      query,
    );
  }
}

class SqliteDeploymentObservationApprovalRepository
  implements DeploymentObservationApprovalRepository
{
  private readonly repository: JsonEntityRepository<DeploymentObservationApprovalArtifact>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<DeploymentObservationApprovalArtifact>(
      database,
      'deployment_observation_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: DeploymentObservationApprovalArtifact,
  ): Promise<DeploymentObservationApprovalArtifact> {
    return this.repository.create(record);
  }

  async getApproval(id: string): Promise<DeploymentObservationApprovalArtifact | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<DeploymentObservationApprovalArtifact | undefined> {
    return getApprovalRecordByArtifactId<DeploymentObservationApprovalArtifact>(
      this.database,
      'deployment_observation_approvals',
      approvalArtifactId,
    );
  }

  async listApprovals(
    query: DeploymentObservationControlPlaneQuery = {},
  ): Promise<DeploymentObservationApprovalArtifact[]> {
    return listObservationControlPlaneRecords<DeploymentObservationApprovalArtifact>(
      this.database,
      'deployment_observation_approvals',
      query,
    );
  }
}

class SqliteDeploymentObservationRunRepository implements DeploymentObservationRunRepository {
  private readonly repository: JsonEntityRepository<DeploymentObservationRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<DeploymentObservationRun>(
      database,
      'deployment_observation_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: DeploymentObservationRun): Promise<DeploymentObservationRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<DeploymentObservationRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: DeploymentObservationControlPlaneQuery = {},
  ): Promise<DeploymentObservationRun[]> {
    return listObservationControlPlaneRecords<DeploymentObservationRun>(
      this.database,
      'deployment_observation_runs',
      query,
    );
  }
}

class SqliteDeploymentOperationDryRunRepository
  implements DeploymentOperationDryRunRepository
{
  private readonly repository: JsonEntityRepository<DeploymentOperationPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<DeploymentOperationPlan>(
      database,
      'deployment_operation_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: DeploymentOperationPlan): Promise<DeploymentOperationPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<DeploymentOperationPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: DeploymentOperationControlPlaneQuery = {},
  ): Promise<DeploymentOperationPlan[]> {
    return listObservationControlPlaneRecords<DeploymentOperationPlan>(
      this.database,
      'deployment_operation_dry_runs',
      query,
    );
  }
}

class SqliteDeploymentOperationApprovalRepository
  implements DeploymentOperationApprovalRepository
{
  private readonly repository: JsonEntityRepository<DeploymentOperationApprovalArtifact>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<DeploymentOperationApprovalArtifact>(
      database,
      'deployment_operation_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: DeploymentOperationApprovalArtifact,
  ): Promise<DeploymentOperationApprovalArtifact> {
    return this.repository.create(record);
  }

  async getApproval(id: string): Promise<DeploymentOperationApprovalArtifact | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<DeploymentOperationApprovalArtifact | undefined> {
    return getApprovalRecordByArtifactId<DeploymentOperationApprovalArtifact>(
      this.database,
      'deployment_operation_approvals',
      approvalArtifactId,
    );
  }

  async listApprovals(
    query: DeploymentOperationControlPlaneQuery = {},
  ): Promise<DeploymentOperationApprovalArtifact[]> {
    return listObservationControlPlaneRecords<DeploymentOperationApprovalArtifact>(
      this.database,
      'deployment_operation_approvals',
      query,
    );
  }
}

class SqliteDeploymentRollbackPlanRepository implements DeploymentRollbackPlanRepository {
  private readonly repository: JsonEntityRepository<DeploymentRollbackPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<DeploymentRollbackPlan>(
      database,
      'deployment_rollback_plans',
      (record) => record.createdAt,
    );
  }

  async saveRollbackPlan(record: DeploymentRollbackPlan): Promise<DeploymentRollbackPlan> {
    return this.repository.create(record);
  }

  async getRollbackPlan(id: string): Promise<DeploymentRollbackPlan | undefined> {
    return this.repository.getById(id);
  }

  async listRollbackPlans(
    query: DeploymentOperationControlPlaneQuery = {},
  ): Promise<DeploymentRollbackPlan[]> {
    return listObservationControlPlaneRecords<DeploymentRollbackPlan>(
      this.database,
      'deployment_rollback_plans',
      query,
    );
  }
}

class SqliteDeploymentOperationRunRepository implements DeploymentOperationRunRepository {
  private readonly repository: JsonEntityRepository<DeploymentOperationRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<DeploymentOperationRun>(
      database,
      'deployment_operation_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: DeploymentOperationRun): Promise<DeploymentOperationRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<DeploymentOperationRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: DeploymentOperationControlPlaneQuery = {},
  ): Promise<DeploymentOperationRun[]> {
    return listObservationControlPlaneRecords<DeploymentOperationRun>(
      this.database,
      'deployment_operation_runs',
      query,
    );
  }
}

class SqliteSecretReadinessDryRunRepository implements SecretReadinessDryRunRepository {
  private readonly repository: JsonEntityRepository<SecretReadinessPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<SecretReadinessPlan>(
      database,
      'secret_readiness_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: SecretReadinessPlan): Promise<SecretReadinessPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<SecretReadinessPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: SecretReadinessControlPlaneQuery = {},
  ): Promise<SecretReadinessPlan[]> {
    return listObservationControlPlaneRecords<SecretReadinessPlan>(
      this.database,
      'secret_readiness_dry_runs',
      query,
    );
  }
}

class SqliteSecretReadinessApprovalRepository implements SecretReadinessApprovalRepository {
  private readonly repository: JsonEntityRepository<SecretReadinessApprovalArtifact>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<SecretReadinessApprovalArtifact>(
      database,
      'secret_readiness_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: SecretReadinessApprovalArtifact,
  ): Promise<SecretReadinessApprovalArtifact> {
    return this.repository.create(record);
  }

  async getApproval(id: string): Promise<SecretReadinessApprovalArtifact | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<SecretReadinessApprovalArtifact | undefined> {
    return getApprovalRecordByArtifactId<SecretReadinessApprovalArtifact>(
      this.database,
      'secret_readiness_approvals',
      approvalArtifactId,
    );
  }

  async listApprovals(
    query: SecretReadinessControlPlaneQuery = {},
  ): Promise<SecretReadinessApprovalArtifact[]> {
    return listObservationControlPlaneRecords<SecretReadinessApprovalArtifact>(
      this.database,
      'secret_readiness_approvals',
      query,
    );
  }
}

class SqliteSecretReadinessRunRepository implements SecretReadinessRunRepository {
  private readonly repository: JsonEntityRepository<SecretReadinessRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<SecretReadinessRun>(
      database,
      'secret_readiness_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: SecretReadinessRun): Promise<SecretReadinessRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<SecretReadinessRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(query: SecretReadinessControlPlaneQuery = {}): Promise<SecretReadinessRun[]> {
    return listObservationControlPlaneRecords<SecretReadinessRun>(
      this.database,
      'secret_readiness_runs',
      query,
    );
  }
}

class SqliteSecretLeakAuditSummaryRepository implements SecretLeakAuditSummaryRepository {
  private readonly repository: JsonEntityRepository<SecretLeakAuditSummary>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<SecretLeakAuditSummary>(
      database,
      'secret_leak_audit_summaries',
      (record) => record.createdAt,
    );
  }

  async saveLeakAuditSummary(record: SecretLeakAuditSummary): Promise<SecretLeakAuditSummary> {
    return this.repository.create(record);
  }

  async getLeakAuditSummary(id: string): Promise<SecretLeakAuditSummary | undefined> {
    return this.repository.getById(id);
  }

  async listLeakAuditSummaries(
    query: SecretReadinessControlPlaneQuery = {},
  ): Promise<SecretLeakAuditSummary[]> {
    return (await this.repository.list()).slice(0, normalizeLimit(query.limit));
  }
}

class SqliteGenericDryRunRepository<
  T extends PersistedEntity & { dryRunId?: string; status?: string },
> {
  private readonly repository: JsonEntityRepository<T>;

  constructor(
    private readonly database: SqliteDatabase,
    private readonly tableName: string,
  ) {
    this.repository = new JsonEntityRepository<T>(
      database,
      tableName,
      (record) => record.createdAt ?? record.observedAt ?? '',
    );
  }

  async saveDryRun(record: T): Promise<T> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<T | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(query: WorktreeControlPlaneQuery = {}): Promise<T[]> {
    return listObservationControlPlaneRecords<T>(this.database, this.tableName, query);
  }
}

class SqliteGenericApprovalRepository<
  T extends PersistedEntity & {
    approvalArtifactId?: string;
    dryRunId?: string;
    status?: string;
  },
> {
  private readonly repository: JsonEntityRepository<T>;

  constructor(
    private readonly database: SqliteDatabase,
    private readonly tableName: string,
  ) {
    this.repository = new JsonEntityRepository<T>(
      database,
      tableName,
      (record) => record.createdAt ?? record.observedAt ?? '',
    );
  }

  async saveApproval(record: T): Promise<T> {
    return this.repository.create(record);
  }

  async getApproval(id: string): Promise<T | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(approvalArtifactId: string): Promise<T | undefined> {
    return getApprovalRecordByArtifactId<T>(this.database, this.tableName, approvalArtifactId);
  }

  async listApprovals(query: WorktreeControlPlaneQuery = {}): Promise<T[]> {
    return listObservationControlPlaneRecords<T>(this.database, this.tableName, query);
  }
}

class SqliteGenericRunRepository<T extends PersistedEntity & { dryRunId?: string; status?: string }> {
  private readonly repository: JsonEntityRepository<T>;

  constructor(
    private readonly database: SqliteDatabase,
    private readonly tableName: string,
  ) {
    this.repository = new JsonEntityRepository<T>(
      database,
      tableName,
      (record) => record.createdAt ?? record.observedAt ?? '',
    );
  }

  async saveRun(record: T): Promise<T> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<T | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(query: WorktreeControlPlaneQuery = {}): Promise<T[]> {
    return listObservationControlPlaneRecords<T>(this.database, this.tableName, query);
  }
}

class SqliteRuntimeJobPlanRepository implements RuntimeJobPlanRepository {
  private readonly repository: JsonEntityRepository<RuntimeJobPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<RuntimeJobPlan>(
      database,
      'runtime_job_plans',
      (record) => record.createdAt,
    );
  }

  async saveJobPlan(record: RuntimeJobPlan): Promise<RuntimeJobPlan> {
    return this.repository.create(record);
  }

  async getJobPlan(id: string): Promise<RuntimeJobPlan | undefined> {
    return this.repository.getById(id);
  }

  async listJobPlans(query: RuntimeOperationsControlPlaneQuery = {}): Promise<RuntimeJobPlan[]> {
    return listObservationControlPlaneRecords<RuntimeJobPlan>(
      this.database,
      'runtime_job_plans',
      query,
    );
  }
}

class SqliteRuntimeQueueEntryRepository implements RuntimeQueueEntryRepository {
  private readonly repository: JsonEntityRepository<RuntimeQueueEntry>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<RuntimeQueueEntry>(
      database,
      'runtime_queue_entries',
      (record) => record.createdAt,
    );
  }

  async saveQueueEntry(record: RuntimeQueueEntry): Promise<RuntimeQueueEntry> {
    return this.repository.create(record);
  }

  async getQueueEntry(id: string): Promise<RuntimeQueueEntry | undefined> {
    return this.repository.getById(id);
  }

  async listQueueEntries(
    query: RuntimeOperationsControlPlaneQuery = {},
  ): Promise<RuntimeQueueEntry[]> {
    return listObservationControlPlaneRecords<RuntimeQueueEntry>(
      this.database,
      'runtime_queue_entries',
      query,
    );
  }
}

class SqliteRuntimeLeaseRepository implements RuntimeLeaseRepository {
  private readonly repository: JsonEntityRepository<RuntimeLease>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<RuntimeLease>(
      database,
      'runtime_leases',
      (record) => record.createdAt,
    );
  }

  async saveLease(record: RuntimeLease): Promise<RuntimeLease> {
    return this.repository.create(record);
  }

  async getLease(id: string): Promise<RuntimeLease | undefined> {
    return this.repository.getById(id);
  }

  async listLeases(query: RuntimeOperationsControlPlaneQuery = {}): Promise<RuntimeLease[]> {
    return listObservationControlPlaneRecords<RuntimeLease>(
      this.database,
      'runtime_leases',
      query,
    );
  }
}

class SqliteRuntimeLockRepository implements RuntimeLockRepository {
  private readonly repository: JsonEntityRepository<RuntimeLock>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<RuntimeLock>(
      database,
      'runtime_locks',
      (record) => record.createdAt,
    );
  }

  async saveLock(record: RuntimeLock): Promise<RuntimeLock> {
    return this.repository.create(record);
  }

  async getLock(id: string): Promise<RuntimeLock | undefined> {
    return this.repository.getById(id);
  }

  async listLocks(query: RuntimeOperationsControlPlaneQuery = {}): Promise<RuntimeLock[]> {
    return listObservationControlPlaneRecords<RuntimeLock>(this.database, 'runtime_locks', query);
  }
}

class SqliteRuntimeCheckpointRepository implements RuntimeCheckpointRepository {
  private readonly repository: JsonEntityRepository<RuntimeCheckpoint>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<RuntimeCheckpoint>(
      database,
      'runtime_checkpoints',
      (record) => record.createdAt,
    );
  }

  async saveCheckpoint(record: RuntimeCheckpoint): Promise<RuntimeCheckpoint> {
    return this.repository.create(record);
  }

  async getCheckpoint(id: string): Promise<RuntimeCheckpoint | undefined> {
    return this.repository.getById(id);
  }

  async listCheckpoints(
    query: RuntimeOperationsControlPlaneQuery = {},
  ): Promise<RuntimeCheckpoint[]> {
    const records = await this.repository.list();
    return records.slice(0, normalizeLimit(query.limit));
  }
}

class SqliteRuntimeJobRunRepository implements RuntimeJobRunRepository {
  private readonly repository: JsonEntityRepository<RuntimeJobRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<RuntimeJobRun>(
      database,
      'runtime_job_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: RuntimeJobRun): Promise<RuntimeJobRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<RuntimeJobRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(query: RuntimeOperationsControlPlaneQuery = {}): Promise<RuntimeJobRun[]> {
    return listObservationControlPlaneRecords<RuntimeJobRun>(
      this.database,
      'runtime_job_runs',
      query,
    );
  }
}

class SqliteMultiAgentCoordinationPlanRepository
  implements MultiAgentCoordinationPlanRepository
{
  private readonly repository: JsonEntityRepository<MultiAgentCoordinationPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<MultiAgentCoordinationPlan>(
      database,
      'multi_agent_coordination_plans',
      (record) => record.createdAt,
    );
  }

  async saveCoordinationPlan(
    record: MultiAgentCoordinationPlan,
  ): Promise<MultiAgentCoordinationPlan> {
    return this.repository.create(record);
  }

  async getCoordinationPlan(id: string): Promise<MultiAgentCoordinationPlan | undefined> {
    return this.repository.getById(id);
  }

  async listCoordinationPlans(
    query: RuntimeOperationsControlPlaneQuery = {},
  ): Promise<MultiAgentCoordinationPlan[]> {
    const records = await this.repository.list();
    return records.slice(0, normalizeLimit(query.limit));
  }
}

class SqliteMultiAgentSlotSummaryRepository implements MultiAgentSlotSummaryRepository {
  private readonly repository: JsonEntityRepository<MultiAgentSlotSummary>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<MultiAgentSlotSummary>(
      database,
      'multi_agent_slot_summaries',
      (record) => record.createdAt,
    );
  }

  async saveSlotSummary(record: MultiAgentSlotSummary): Promise<MultiAgentSlotSummary> {
    return this.repository.create(record);
  }

  async getSlotSummary(id: string): Promise<MultiAgentSlotSummary | undefined> {
    return this.repository.getById(id);
  }

  async listSlotSummaries(
    query: RuntimeOperationsControlPlaneQuery = {},
  ): Promise<MultiAgentSlotSummary[]> {
    return listObservationControlPlaneRecords<MultiAgentSlotSummary>(
      this.database,
      'multi_agent_slot_summaries',
      query,
    );
  }
}

class SqliteExternalAgentPatchSummaryRepository implements ExternalAgentPatchSummaryRepository {
  private readonly repository: JsonEntityRepository<ExternalAgentPatchSummary>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ExternalAgentPatchSummary>(
      database,
      'external_agent_patch_summaries',
      (record) => record.createdAt,
    );
  }

  async savePatchSummary(record: ExternalAgentPatchSummary): Promise<ExternalAgentPatchSummary> {
    return this.repository.create(record);
  }

  async getPatchSummary(id: string): Promise<ExternalAgentPatchSummary | undefined> {
    return this.repository.getById(id);
  }

  async listPatchSummaries(
    query: ExternalAgentControlPlaneQuery = {},
  ): Promise<ExternalAgentPatchSummary[]> {
    const records = await this.repository.list();
    return records.slice(0, normalizeLimit(query.limit));
  }
}

class SqlitePlatformBackupPlanRepository implements PlatformBackupPlanRepository {
  private readonly repository: JsonEntityRepository<PlatformBackupPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<PlatformBackupPlan>(
      database,
      'platform_backup_plans',
      (record) => record.createdAt,
    );
  }

  async saveBackupPlan(record: PlatformBackupPlan): Promise<PlatformBackupPlan> {
    return this.repository.create(record);
  }

  async getBackupPlan(id: string): Promise<PlatformBackupPlan | undefined> {
    return this.repository.getById(id);
  }

  async listBackupPlans(
    query: PlatformOperationsControlPlaneQuery = {},
  ): Promise<PlatformBackupPlan[]> {
    return listObservationControlPlaneRecords<PlatformBackupPlan>(
      this.database,
      'platform_backup_plans',
      query,
    );
  }
}

class SqlitePlatformBackupRunRepository implements PlatformBackupRunRepository {
  private readonly repository: JsonEntityRepository<PlatformBackupRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<PlatformBackupRun>(
      database,
      'platform_backup_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: PlatformBackupRun): Promise<PlatformBackupRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<PlatformBackupRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: PlatformOperationsControlPlaneQuery = {},
  ): Promise<PlatformBackupRun[]> {
    return listObservationControlPlaneRecords<PlatformBackupRun>(
      this.database,
      'platform_backup_runs',
      query,
    );
  }
}

class SqlitePlatformRestorePlanRepository implements PlatformRestorePlanRepository {
  private readonly repository: JsonEntityRepository<PlatformRestorePlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<PlatformRestorePlan>(
      database,
      'platform_restore_plans',
      (record) => record.createdAt,
    );
  }

  async saveRestorePlan(record: PlatformRestorePlan): Promise<PlatformRestorePlan> {
    return this.repository.create(record);
  }

  async getRestorePlan(id: string): Promise<PlatformRestorePlan | undefined> {
    return this.repository.getById(id);
  }

  async listRestorePlans(
    query: PlatformOperationsControlPlaneQuery = {},
  ): Promise<PlatformRestorePlan[]> {
    return listObservationControlPlaneRecords<PlatformRestorePlan>(
      this.database,
      'platform_restore_plans',
      query,
    );
  }
}

class SqlitePlatformRestoreRunRepository implements PlatformRestoreRunRepository {
  private readonly repository: JsonEntityRepository<PlatformRestoreRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<PlatformRestoreRun>(
      database,
      'platform_restore_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: PlatformRestoreRun): Promise<PlatformRestoreRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<PlatformRestoreRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: PlatformOperationsControlPlaneQuery = {},
  ): Promise<PlatformRestoreRun[]> {
    return listObservationControlPlaneRecords<PlatformRestoreRun>(
      this.database,
      'platform_restore_runs',
      query,
    );
  }
}

class SqliteStoreMigrationPlanRepository implements StoreMigrationPlanRepository {
  private readonly repository: JsonEntityRepository<StoreMigrationPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<StoreMigrationPlan>(
      database,
      'store_migration_plans',
      (record) => record.createdAt,
    );
  }

  async saveMigrationPlan(record: StoreMigrationPlan): Promise<StoreMigrationPlan> {
    return this.repository.create(record);
  }

  async getMigrationPlan(id: string): Promise<StoreMigrationPlan | undefined> {
    return this.repository.getById(id);
  }

  async listMigrationPlans(
    query: PlatformOperationsControlPlaneQuery = {},
  ): Promise<StoreMigrationPlan[]> {
    return listObservationControlPlaneRecords<StoreMigrationPlan>(
      this.database,
      'store_migration_plans',
      query,
    );
  }
}

class SqliteStoreMigrationRunRepository implements StoreMigrationRunRepository {
  private readonly repository: JsonEntityRepository<StoreMigrationRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<StoreMigrationRun>(
      database,
      'store_migration_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: StoreMigrationRun): Promise<StoreMigrationRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<StoreMigrationRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: PlatformOperationsControlPlaneQuery = {},
  ): Promise<StoreMigrationRun[]> {
    return listObservationControlPlaneRecords<StoreMigrationRun>(
      this.database,
      'store_migration_runs',
      query,
    );
  }
}

class SqliteRetentionPolicyPlanRepository implements RetentionPolicyPlanRepository {
  private readonly repository: JsonEntityRepository<RetentionPolicyPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<RetentionPolicyPlan>(
      database,
      'retention_policy_plans',
      (record) => record.createdAt,
    );
  }

  async saveRetentionPlan(record: RetentionPolicyPlan): Promise<RetentionPolicyPlan> {
    return this.repository.create(record);
  }

  async getRetentionPlan(id: string): Promise<RetentionPolicyPlan | undefined> {
    return this.repository.getById(id);
  }

  async listRetentionPlans(
    query: PlatformOperationsControlPlaneQuery = {},
  ): Promise<RetentionPolicyPlan[]> {
    return listObservationControlPlaneRecords<RetentionPolicyPlan>(
      this.database,
      'retention_policy_plans',
      query,
    );
  }
}

class SqliteRetentionPolicyRunRepository implements RetentionPolicyRunRepository {
  private readonly repository: JsonEntityRepository<RetentionPolicyRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<RetentionPolicyRun>(
      database,
      'retention_policy_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: RetentionPolicyRun): Promise<RetentionPolicyRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<RetentionPolicyRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: PlatformOperationsControlPlaneQuery = {},
  ): Promise<RetentionPolicyRun[]> {
    return listObservationControlPlaneRecords<RetentionPolicyRun>(
      this.database,
      'retention_policy_runs',
      query,
    );
  }
}

class SqliteAuditExportPlanRepository implements AuditExportPlanRepository {
  private readonly repository: JsonEntityRepository<AuditExportPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<AuditExportPlan>(
      database,
      'audit_export_plans',
      (record) => record.createdAt,
    );
  }

  async saveAuditExportPlan(record: AuditExportPlan): Promise<AuditExportPlan> {
    return this.repository.create(record);
  }

  async getAuditExportPlan(id: string): Promise<AuditExportPlan | undefined> {
    return this.repository.getById(id);
  }

  async listAuditExportPlans(
    query: PlatformOperationsControlPlaneQuery = {},
  ): Promise<AuditExportPlan[]> {
    return listObservationControlPlaneRecords<AuditExportPlan>(
      this.database,
      'audit_export_plans',
      query,
    );
  }
}

class SqliteAuditExportRunRepository implements AuditExportRunRepository {
  private readonly repository: JsonEntityRepository<AuditExportRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<AuditExportRun>(
      database,
      'audit_export_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: AuditExportRun): Promise<AuditExportRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<AuditExportRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(query: PlatformOperationsControlPlaneQuery = {}): Promise<AuditExportRun[]> {
    return listObservationControlPlaneRecords<AuditExportRun>(
      this.database,
      'audit_export_runs',
      query,
    );
  }
}

class SqliteOperatorRoleAssignmentPlanRepository
  implements OperatorRoleAssignmentPlanRepository
{
  private readonly repository: JsonEntityRepository<OperatorRoleAssignmentPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<OperatorRoleAssignmentPlan>(
      database,
      'operator_role_assignment_plans',
      (record) => record.createdAt,
    );
  }

  async saveRoleAssignmentPlan(
    record: OperatorRoleAssignmentPlan,
  ): Promise<OperatorRoleAssignmentPlan> {
    return this.repository.create(record);
  }

  async getRoleAssignmentPlan(
    id: string,
  ): Promise<OperatorRoleAssignmentPlan | undefined> {
    return this.repository.getById(id);
  }

  async listRoleAssignmentPlans(
    query: PlatformOperationsControlPlaneQuery = {},
  ): Promise<OperatorRoleAssignmentPlan[]> {
    return listObservationControlPlaneRecords<OperatorRoleAssignmentPlan>(
      this.database,
      'operator_role_assignment_plans',
      query,
    );
  }
}

class SqliteOperatorRoleAssignmentRunRepository
  implements OperatorRoleAssignmentRunRepository
{
  private readonly repository: JsonEntityRepository<OperatorRoleAssignmentRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<OperatorRoleAssignmentRun>(
      database,
      'operator_role_assignment_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: OperatorRoleAssignmentRun): Promise<OperatorRoleAssignmentRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<OperatorRoleAssignmentRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: PlatformOperationsControlPlaneQuery = {},
  ): Promise<OperatorRoleAssignmentRun[]> {
    return listObservationControlPlaneRecords<OperatorRoleAssignmentRun>(
      this.database,
      'operator_role_assignment_runs',
      query,
    );
  }
}

class SqliteDisasterRecoveryRehearsalRunRepository
  implements DisasterRecoveryRehearsalRunRepository
{
  private readonly repository: JsonEntityRepository<DisasterRecoveryRehearsalRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<DisasterRecoveryRehearsalRun>(
      database,
      'disaster_recovery_rehearsal_runs',
      (record) => record.createdAt,
    );
  }

  async saveRehearsalRun(
    record: DisasterRecoveryRehearsalRun,
  ): Promise<DisasterRecoveryRehearsalRun> {
    return this.repository.create(record);
  }

  async getRehearsalRun(id: string): Promise<DisasterRecoveryRehearsalRun | undefined> {
    return this.repository.getById(id);
  }

  async listRehearsalRuns(
    query: PlatformOperationsControlPlaneQuery = {},
  ): Promise<DisasterRecoveryRehearsalRun[]> {
    return listObservationControlPlaneRecords<DisasterRecoveryRehearsalRun>(
      this.database,
      'disaster_recovery_rehearsal_runs',
      query,
    );
  }
}

class SqliteProductionGaDryRunRepository implements ProductionGaDryRunRepository {
  private readonly repository: JsonEntityRepository<ProductionGaReadinessPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ProductionGaReadinessPlan>(
      database,
      'production_ga_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: ProductionGaReadinessPlan): Promise<ProductionGaReadinessPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<ProductionGaReadinessPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: ProductionGaControlPlaneQuery = {},
  ): Promise<ProductionGaReadinessPlan[]> {
    return listObservationControlPlaneRecords<ProductionGaReadinessPlan>(
      this.database,
      'production_ga_dry_runs',
      query,
    );
  }
}

class SqliteProductionGaApprovalRepository implements ProductionGaApprovalRepository {
  private readonly repository: JsonEntityRepository<ProductionGaApprovalArtifact>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ProductionGaApprovalArtifact>(
      database,
      'production_ga_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(record: ProductionGaApprovalArtifact): Promise<ProductionGaApprovalArtifact> {
    return this.repository.create(record);
  }

  async getApproval(id: string): Promise<ProductionGaApprovalArtifact | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(id: string): Promise<ProductionGaApprovalArtifact | undefined> {
    return this.repository.getById(id);
  }

  async listApprovals(
    query: ProductionGaControlPlaneQuery = {},
  ): Promise<ProductionGaApprovalArtifact[]> {
    return listObservationControlPlaneRecords<ProductionGaApprovalArtifact>(
      this.database,
      'production_ga_approvals',
      query,
    );
  }
}

class SqliteProductionGaSignoffPlanRepository implements ProductionGaSignoffPlanRepository {
  private readonly repository: JsonEntityRepository<ProductionGaReleaseCandidateSignoffPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ProductionGaReleaseCandidateSignoffPlan>(
      database,
      'production_ga_signoff_plans',
      (record) => record.createdAt,
    );
  }

  async saveSignoffPlan(
    record: ProductionGaReleaseCandidateSignoffPlan,
  ): Promise<ProductionGaReleaseCandidateSignoffPlan> {
    return this.repository.create(record);
  }

  async getSignoffPlan(
    id: string,
  ): Promise<ProductionGaReleaseCandidateSignoffPlan | undefined> {
    return this.repository.getById(id);
  }

  async listSignoffPlans(
    query: ProductionGaControlPlaneQuery = {},
  ): Promise<ProductionGaReleaseCandidateSignoffPlan[]> {
    return listObservationControlPlaneRecords<ProductionGaReleaseCandidateSignoffPlan>(
      this.database,
      'production_ga_signoff_plans',
      query,
    );
  }
}

class SqliteProductionGaE2ERehearsalRunRepository
  implements ProductionGaE2ERehearsalRunRepository
{
  private readonly repository: JsonEntityRepository<ProductionGaE2ERehearsalRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ProductionGaE2ERehearsalRun>(
      database,
      'production_ga_e2e_rehearsals',
      (record) => record.createdAt,
    );
  }

  async saveRehearsalRun(
    record: ProductionGaE2ERehearsalRun,
  ): Promise<ProductionGaE2ERehearsalRun> {
    return this.repository.create(record);
  }

  async getRehearsalRun(id: string): Promise<ProductionGaE2ERehearsalRun | undefined> {
    return this.repository.getById(id);
  }

  async listRehearsalRuns(
    query: ProductionGaControlPlaneQuery = {},
  ): Promise<ProductionGaE2ERehearsalRun[]> {
    return listObservationControlPlaneRecords<ProductionGaE2ERehearsalRun>(
      this.database,
      'production_ga_e2e_rehearsals',
      query,
    );
  }
}

class SqliteProductionGaTrainingCompletionRepository
  implements ProductionGaTrainingCompletionRepository
{
  private readonly repository: JsonEntityRepository<ProductionGaOperatorTrainingCompletionSummary>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ProductionGaOperatorTrainingCompletionSummary>(
      database,
      'production_ga_training_completions',
      (record) => record.createdAt,
    );
  }

  async saveTrainingCompletion(
    record: ProductionGaOperatorTrainingCompletionSummary,
  ): Promise<ProductionGaOperatorTrainingCompletionSummary> {
    return this.repository.create(record);
  }

  async getTrainingCompletion(
    id: string,
  ): Promise<ProductionGaOperatorTrainingCompletionSummary | undefined> {
    return this.repository.getById(id);
  }

  async listTrainingCompletions(
    query: ProductionGaControlPlaneQuery = {},
  ): Promise<ProductionGaOperatorTrainingCompletionSummary[]> {
    return listObservationControlPlaneRecords<ProductionGaOperatorTrainingCompletionSummary>(
      this.database,
      'production_ga_training_completions',
      query,
    );
  }
}

class SqliteProductionGaThreatModelRepository implements ProductionGaThreatModelRepository {
  private readonly repository: JsonEntityRepository<ProductionGaThreatModel>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ProductionGaThreatModel>(
      database,
      'production_ga_threat_models',
      (record) => record.createdAt,
    );
  }

  async saveThreatModel(record: ProductionGaThreatModel): Promise<ProductionGaThreatModel> {
    return this.repository.create(record);
  }

  async getThreatModel(id: string): Promise<ProductionGaThreatModel | undefined> {
    return this.repository.getById(id);
  }

  async listThreatModels(
    query: ProductionGaControlPlaneQuery = {},
  ): Promise<ProductionGaThreatModel[]> {
    return (await this.repository.list()).slice(0, normalizeLimit(query.limit));
  }
}

class SqliteProductionGaResidualRiskRegisterRepository
  implements ProductionGaResidualRiskRegisterRepository
{
  private readonly repository: JsonEntityRepository<ProductionGaResidualRiskRegister>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ProductionGaResidualRiskRegister>(
      database,
      'production_ga_residual_risk_registers',
      (record) => record.createdAt,
    );
  }

  async saveResidualRiskRegister(
    record: ProductionGaResidualRiskRegister,
  ): Promise<ProductionGaResidualRiskRegister> {
    return this.repository.create(record);
  }

  async getResidualRiskRegister(
    id: string,
  ): Promise<ProductionGaResidualRiskRegister | undefined> {
    return this.repository.getById(id);
  }

  async listResidualRiskRegisters(
    query: ProductionGaControlPlaneQuery = {},
  ): Promise<ProductionGaResidualRiskRegister[]> {
    return (await this.repository.list()).slice(0, normalizeLimit(query.limit));
  }
}

class SqliteGithubRemoteCleanupDryRunRepository
  implements GithubRemoteCleanupDryRunRepository
{
  private readonly repository: JsonEntityRepository<GithubRemoteCleanupPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubRemoteCleanupPlan>(
      database,
      'github_remote_cleanup_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: GithubRemoteCleanupPlan): Promise<GithubRemoteCleanupPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<GithubRemoteCleanupPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: GithubRemoteCleanupControlPlaneQuery = {},
  ): Promise<GithubRemoteCleanupPlan[]> {
    return listObservationControlPlaneRecords<GithubRemoteCleanupPlan>(
      this.database,
      'github_remote_cleanup_dry_runs',
      query,
    );
  }
}

class SqliteGithubRemoteCleanupApprovalRepository
  implements GithubRemoteCleanupApprovalRepository
{
  private readonly repository: JsonEntityRepository<GithubRemoteCleanupApprovalArtifactRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubRemoteCleanupApprovalArtifactRecord>(
      database,
      'github_remote_cleanup_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: GithubRemoteCleanupApprovalArtifactRecord,
  ): Promise<GithubRemoteCleanupApprovalArtifactRecord> {
    return this.repository.create(record);
  }

  async getApproval(
    id: string,
  ): Promise<GithubRemoteCleanupApprovalArtifactRecord | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubRemoteCleanupApprovalArtifactRecord | undefined> {
    const rows = this.database
      .prepare(
        'SELECT payload FROM github_remote_cleanup_approvals ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as GithubRemoteCleanupApprovalArtifactRecord)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: GithubRemoteCleanupControlPlaneQuery = {},
  ): Promise<GithubRemoteCleanupApprovalArtifactRecord[]> {
    return listObservationControlPlaneRecords<GithubRemoteCleanupApprovalArtifactRecord>(
      this.database,
      'github_remote_cleanup_approvals',
      query,
    );
  }
}

class SqliteGithubRemoteCleanupRunRepository implements GithubRemoteCleanupRunRepository {
  private readonly repository: JsonEntityRepository<GithubRemoteCleanupRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<GithubRemoteCleanupRun>(
      database,
      'github_remote_cleanup_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: GithubRemoteCleanupRun): Promise<GithubRemoteCleanupRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<GithubRemoteCleanupRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: GithubRemoteCleanupControlPlaneQuery = {},
  ): Promise<GithubRemoteCleanupRun[]> {
    return listObservationControlPlaneRecords<GithubRemoteCleanupRun>(
      this.database,
      'github_remote_cleanup_runs',
      query,
    );
  }
}

class SqliteReworkLoopDryRunRepository implements ReworkLoopDryRunRepository {
  private readonly repository: JsonEntityRepository<ReworkLoopPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ReworkLoopPlan>(
      database,
      'rework_loop_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: ReworkLoopPlan): Promise<ReworkLoopPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<ReworkLoopPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(query: ReworkLoopControlPlaneQuery = {}): Promise<ReworkLoopPlan[]> {
    return listObservationControlPlaneRecords<ReworkLoopPlan>(
      this.database,
      'rework_loop_dry_runs',
      query,
    );
  }
}

class SqliteReworkLoopApprovalRepository implements ReworkLoopApprovalRepository {
  private readonly repository: JsonEntityRepository<ReworkLoopApprovalArtifactRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ReworkLoopApprovalArtifactRecord>(
      database,
      'rework_loop_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: ReworkLoopApprovalArtifactRecord,
  ): Promise<ReworkLoopApprovalArtifactRecord> {
    return this.repository.create(record);
  }

  async getApproval(id: string): Promise<ReworkLoopApprovalArtifactRecord | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<ReworkLoopApprovalArtifactRecord | undefined> {
    const rows = this.database
      .prepare('SELECT payload FROM rework_loop_approvals ORDER BY recorded_at DESC, id DESC')
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as ReworkLoopApprovalArtifactRecord)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: ReworkLoopControlPlaneQuery = {},
  ): Promise<ReworkLoopApprovalArtifactRecord[]> {
    return listObservationControlPlaneRecords<ReworkLoopApprovalArtifactRecord>(
      this.database,
      'rework_loop_approvals',
      query,
    );
  }
}

class SqliteReworkLoopRunRepository implements ReworkLoopRunRepository {
  private readonly repository: JsonEntityRepository<ReworkLoopRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ReworkLoopRun>(
      database,
      'rework_loop_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: ReworkLoopRun): Promise<ReworkLoopRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<ReworkLoopRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(query: ReworkLoopControlPlaneQuery = {}): Promise<ReworkLoopRun[]> {
    return listObservationControlPlaneRecords<ReworkLoopRun>(
      this.database,
      'rework_loop_runs',
      query,
    );
  }
}

class SqliteCustomWorkflowDryRunRepository implements CustomWorkflowDryRunRepository {
  private readonly repository: JsonEntityRepository<CustomWorkflowPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<CustomWorkflowPlan>(
      database,
      'custom_workflow_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(record: CustomWorkflowPlan): Promise<CustomWorkflowPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<CustomWorkflowPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: CustomWorkflowControlPlaneQuery = {},
  ): Promise<CustomWorkflowPlan[]> {
    return listObservationControlPlaneRecords<CustomWorkflowPlan>(
      this.database,
      'custom_workflow_dry_runs',
      query,
    );
  }
}

class SqliteCustomWorkflowApprovalRepository
  implements CustomWorkflowApprovalRepository
{
  private readonly repository: JsonEntityRepository<CustomWorkflowApprovalArtifactRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<CustomWorkflowApprovalArtifactRecord>(
      database,
      'custom_workflow_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: CustomWorkflowApprovalArtifactRecord,
  ): Promise<CustomWorkflowApprovalArtifactRecord> {
    return this.repository.create(record);
  }

  async getApproval(
    id: string,
  ): Promise<CustomWorkflowApprovalArtifactRecord | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<CustomWorkflowApprovalArtifactRecord | undefined> {
    const rows = this.database
      .prepare('SELECT payload FROM custom_workflow_approvals ORDER BY recorded_at DESC, id DESC')
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as CustomWorkflowApprovalArtifactRecord)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: CustomWorkflowControlPlaneQuery = {},
  ): Promise<CustomWorkflowApprovalArtifactRecord[]> {
    return listObservationControlPlaneRecords<CustomWorkflowApprovalArtifactRecord>(
      this.database,
      'custom_workflow_approvals',
      query,
    );
  }
}

class SqliteCustomWorkflowRunRepository implements CustomWorkflowRunRepository {
  private readonly repository: JsonEntityRepository<CustomWorkflowRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<CustomWorkflowRun>(
      database,
      'custom_workflow_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: CustomWorkflowRun): Promise<CustomWorkflowRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<CustomWorkflowRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: CustomWorkflowControlPlaneQuery = {},
  ): Promise<CustomWorkflowRun[]> {
    return listObservationControlPlaneRecords<CustomWorkflowRun>(
      this.database,
      'custom_workflow_runs',
      query,
    );
  }
}

class SqliteProductionWorkflowRecoveryDryRunRepository
  implements ProductionWorkflowRecoveryDryRunRepository
{
  private readonly repository: JsonEntityRepository<ProductionWorkflowRecoveryPlan>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ProductionWorkflowRecoveryPlan>(
      database,
      'production_workflow_recovery_dry_runs',
      (record) => record.createdAt,
    );
  }

  async saveDryRun(
    record: ProductionWorkflowRecoveryPlan,
  ): Promise<ProductionWorkflowRecoveryPlan> {
    return this.repository.create(record);
  }

  async getDryRun(id: string): Promise<ProductionWorkflowRecoveryPlan | undefined> {
    return this.repository.getById(id);
  }

  async listDryRuns(
    query: ProductionWorkflowRecoveryControlPlaneQuery = {},
  ): Promise<ProductionWorkflowRecoveryPlan[]> {
    return listObservationControlPlaneRecords<ProductionWorkflowRecoveryPlan>(
      this.database,
      'production_workflow_recovery_dry_runs',
      query,
    );
  }
}

class SqliteProductionWorkflowRecoveryApprovalRepository
  implements ProductionWorkflowRecoveryApprovalRepository
{
  private readonly repository: JsonEntityRepository<ProductionWorkflowRecoveryApprovalArtifact>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ProductionWorkflowRecoveryApprovalArtifact>(
      database,
      'production_workflow_recovery_approvals',
      (record) => record.createdAt,
    );
  }

  async saveApproval(
    record: ProductionWorkflowRecoveryApprovalArtifact,
  ): Promise<ProductionWorkflowRecoveryApprovalArtifact> {
    return this.repository.create(record);
  }

  async getApproval(
    id: string,
  ): Promise<ProductionWorkflowRecoveryApprovalArtifact | undefined> {
    return this.repository.getById(id);
  }

  async getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<ProductionWorkflowRecoveryApprovalArtifact | undefined> {
    const rows = this.database
      .prepare(
        'SELECT payload FROM production_workflow_recovery_approvals ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as ProductionWorkflowRecoveryApprovalArtifact)
      .find((record) => record.approvalArtifactId === approvalArtifactId);
  }

  async listApprovals(
    query: ProductionWorkflowRecoveryControlPlaneQuery = {},
  ): Promise<ProductionWorkflowRecoveryApprovalArtifact[]> {
    return listObservationControlPlaneRecords<ProductionWorkflowRecoveryApprovalArtifact>(
      this.database,
      'production_workflow_recovery_approvals',
      query,
    );
  }
}

class SqliteProductionWorkflowRecoveryRunRepository
  implements ProductionWorkflowRecoveryRunRepository
{
  private readonly repository: JsonEntityRepository<ProductionWorkflowRecoveryRun>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ProductionWorkflowRecoveryRun>(
      database,
      'production_workflow_recovery_runs',
      (record) => record.createdAt,
    );
  }

  async saveRun(record: ProductionWorkflowRecoveryRun): Promise<ProductionWorkflowRecoveryRun> {
    return this.repository.create(record);
  }

  async getRun(id: string): Promise<ProductionWorkflowRecoveryRun | undefined> {
    return this.repository.getById(id);
  }

  async listRuns(
    query: ProductionWorkflowRecoveryControlPlaneQuery = {},
  ): Promise<ProductionWorkflowRecoveryRun[]> {
    return listObservationControlPlaneRecords<ProductionWorkflowRecoveryRun>(
      this.database,
      'production_workflow_recovery_runs',
      query,
    );
  }
}

class SqliteProductionWorkflowRecoveryChildActionStateRepository
  implements ProductionWorkflowRecoveryChildActionStateRepository
{
  private readonly repository: JsonEntityRepository<ProductionWorkflowChildActionStateRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<ProductionWorkflowChildActionStateRecord>(
      database,
      'production_workflow_recovery_child_action_states',
      (record) => record.createdAt,
    );
  }

  async saveChildActionState(
    record: ProductionWorkflowChildActionStateRecord,
  ): Promise<ProductionWorkflowChildActionStateRecord> {
    return this.repository.create(record);
  }

  async getChildActionState(
    id: string,
  ): Promise<ProductionWorkflowChildActionStateRecord | undefined> {
    return this.repository.getById(id);
  }

  async listChildActionStates(
    query: ProductionWorkflowRecoveryControlPlaneQuery = {},
  ): Promise<ProductionWorkflowChildActionStateRecord[]> {
    return listObservationControlPlaneRecords<ProductionWorkflowChildActionStateRecord>(
      this.database,
      'production_workflow_recovery_child_action_states',
      query,
    );
  }
}

class SqliteCodexPatchChildRecordRepository implements CodexPatchChildRecordRepository {
  private readonly repository: JsonEntityRepository<CodexPatchChildRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<CodexPatchChildRecord>(
      database,
      'codex_patch_child_records',
      (record) => record.createdAt,
    );
  }

  async saveRecord(record: CodexPatchChildRecord): Promise<CodexPatchChildRecord> {
    return this.repository.create(record);
  }

  async getRecord(id: string): Promise<CodexPatchChildRecord | undefined> {
    const directRecord = await this.repository.getById(id);
    if (directRecord) {
      return directRecord;
    }
    return (await this.listRecords({ limit: 100 })).find(
      (record) => record.childRecordId === id || record.runId === id || record.dryRunId === id,
    );
  }

  async listRecords(
    query: LocalProductionWorkflowChildRecordQuery = {},
  ): Promise<CodexPatchChildRecord[]> {
    return listObservationControlPlaneRecords<CodexPatchChildRecord>(
      this.database,
      'codex_patch_child_records',
      query,
    );
  }
}

class SqliteNxVerificationChildRecordRepository
  implements NxVerificationChildRecordRepository
{
  private readonly repository: JsonEntityRepository<NxVerificationChildRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<NxVerificationChildRecord>(
      database,
      'nx_verification_child_records',
      (record) => record.createdAt,
    );
  }

  async saveRecord(
    record: NxVerificationChildRecord,
  ): Promise<NxVerificationChildRecord> {
    return this.repository.create(record);
  }

  async getRecord(id: string): Promise<NxVerificationChildRecord | undefined> {
    const directRecord = await this.repository.getById(id);
    if (directRecord) {
      return directRecord;
    }
    return (await this.listRecords({ limit: 100 })).find(
      (record) => record.childRecordId === id || record.runId === id || record.dryRunId === id,
    );
  }

  async listRecords(
    query: LocalProductionWorkflowChildRecordQuery = {},
  ): Promise<NxVerificationChildRecord[]> {
    return listObservationControlPlaneRecords<NxVerificationChildRecord>(
      this.database,
      'nx_verification_child_records',
      query,
    );
  }
}

class SqliteCodexReportReviewRepository implements CodexReportReviewRepository {
  private readonly repository: JsonEntityRepository<CodexExecReportReviewRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<CodexExecReportReviewRecord>(
      database,
      'codex_report_reviews',
      (record) => record.createdAt,
    );
  }

  async saveReportReview(
    record: CodexExecReportReviewRecord,
  ): Promise<CodexExecReportReviewRecord> {
    return this.repository.create(record);
  }

  async getReportReview(id: string): Promise<CodexExecReportReviewRecord | undefined> {
    return this.repository.getById(id);
  }

  async listReportReviews(
    query: Partial<CodexExecReportReviewQuery> = {},
  ): Promise<CodexExecReportReviewRecord[]> {
    const safeLimit = normalizeLimit(query.limit);
    const rows = this.database
      .prepare('SELECT payload FROM codex_report_reviews ORDER BY recorded_at DESC, id DESC')
      .all() as unknown as PayloadRow[];
    const records = rows.map((row) => JSON.parse(row.payload) as CodexExecReportReviewRecord);

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
      .slice(0, safeLimit);
  }
}

class SqliteCodexExecLiveAdapterAdrDecisionRepository implements CodexExecLiveAdapterAdrDecisionRepository {
  private readonly repository: JsonEntityRepository<CodexExecLiveAdapterAdrDecisionRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<CodexExecLiveAdapterAdrDecisionRecord>(
      database,
      'codex_live_adapter_adr_decisions',
      (record) => record.createdAt,
    );
  }

  async saveDecision(
    record: CodexExecLiveAdapterAdrDecisionRecord,
  ): Promise<CodexExecLiveAdapterAdrDecisionRecord> {
    return this.repository.create(record);
  }

  async getDecision(id: string): Promise<CodexExecLiveAdapterAdrDecisionRecord | undefined> {
    return this.repository.getById(id);
  }

  async listDecisions(
    query: Partial<CodexExecLiveAdapterAdrDecisionQuery> = {},
  ): Promise<CodexExecLiveAdapterAdrDecisionRecord[]> {
    const safeLimit = normalizeLimit(query.limit);
    const rows = this.database
      .prepare(
        'SELECT payload FROM codex_live_adapter_adr_decisions ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];
    const records = rows.map(
      (row) => JSON.parse(row.payload) as CodexExecLiveAdapterAdrDecisionRecord,
    );

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
      .slice(0, safeLimit);
  }
}

class SqliteCodexExecReadOnlyAdapterSimulatorReviewRepository implements CodexExecReadOnlyAdapterSimulatorReviewRepository {
  private readonly repository: JsonEntityRepository<CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository =
      new JsonEntityRepository<CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord>(
        database,
        'codex_read_only_adapter_simulator_reviews',
        (record) => record.createdAt,
      );
  }

  async saveSimulatorReview(
    record: CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord,
  ): Promise<CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord> {
    return this.repository.create(record);
  }

  async getSimulatorReview(
    id: string,
  ): Promise<CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord | undefined> {
    return this.repository.getById(id);
  }

  async listSimulatorReviews(
    query: Partial<CodexExecReadOnlyAdapterSimulatorReviewQuery> = {},
  ): Promise<CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord[]> {
    const safeLimit = normalizeLimit(query.limit);
    const rows = this.database
      .prepare(
        'SELECT payload FROM codex_read_only_adapter_simulator_reviews ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];
    const records = rows.map(
      (row) => JSON.parse(row.payload) as CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord,
    );

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
      .slice(0, safeLimit);
  }
}

class SqliteCodexExecReadOnlyAdapterImplementationPlanReviewRepository implements CodexExecReadOnlyAdapterImplementationPlanReviewRepository {
  private readonly repository: JsonEntityRepository<CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository =
      new JsonEntityRepository<CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord>(
        database,
        'codex_read_only_adapter_implementation_plan_reviews',
        (record) => record.createdAt,
      );
  }

  async saveImplementationPlanReview(
    record: CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord,
  ): Promise<CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord> {
    return this.repository.create(record);
  }

  async getImplementationPlanReview(
    id: string,
  ): Promise<CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord | undefined> {
    return this.repository.getById(id);
  }

  async listImplementationPlanReviews(
    query: Partial<CodexExecReadOnlyAdapterImplementationPlanReviewQuery> = {},
  ): Promise<CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord[]> {
    const safeLimit = normalizeLimit(query.limit);
    const rows = this.database
      .prepare(
        'SELECT payload FROM codex_read_only_adapter_implementation_plan_reviews ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];
    const records = rows.map(
      (row) =>
        JSON.parse(row.payload) as CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord,
    );

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
      .slice(0, safeLimit);
  }
}

class SqliteCodexExecReadOnlyAdapterSkeletonReviewRepository implements CodexExecReadOnlyAdapterSkeletonReviewRepository {
  private readonly repository: JsonEntityRepository<CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository =
      new JsonEntityRepository<CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord>(
        database,
        'codex_read_only_adapter_skeleton_reviews',
        (record) => record.createdAt,
      );
  }

  async saveSkeletonReview(
    record: CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord,
  ): Promise<CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord> {
    return this.repository.create(record);
  }

  async getSkeletonReview(
    id: string,
  ): Promise<CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord | undefined> {
    return this.repository.getById(id);
  }

  async listSkeletonReviews(
    query: Partial<CodexExecReadOnlyAdapterSkeletonReviewQuery> = {},
  ): Promise<CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord[]> {
    const safeLimit = normalizeLimit(query.limit);
    const rows = this.database
      .prepare(
        'SELECT payload FROM codex_read_only_adapter_skeleton_reviews ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];
    const records = rows.map(
      (row) => JSON.parse(row.payload) as CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord,
    );

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
      .slice(0, safeLimit);
  }
}

class SqliteCodexExecReadOnlyAdapterFinalReadinessRepository implements CodexExecReadOnlyAdapterFinalReadinessRepository {
  private readonly repository: JsonEntityRepository<CodexExecReadOnlyAdapterFinalReadinessDecisionRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository =
      new JsonEntityRepository<CodexExecReadOnlyAdapterFinalReadinessDecisionRecord>(
        database,
        'codex_read_only_adapter_final_readiness',
        (record) => record.createdAt,
      );
  }

  async saveFinalReadiness(
    record: CodexExecReadOnlyAdapterFinalReadinessDecisionRecord,
  ): Promise<CodexExecReadOnlyAdapterFinalReadinessDecisionRecord> {
    return this.repository.create(record);
  }

  async getFinalReadiness(
    id: string,
  ): Promise<CodexExecReadOnlyAdapterFinalReadinessDecisionRecord | undefined> {
    return this.repository.getById(id);
  }

  async listFinalReadinessRecords(
    query: Partial<CodexExecReadOnlyAdapterFinalReadinessQuery> = {},
  ): Promise<CodexExecReadOnlyAdapterFinalReadinessDecisionRecord[]> {
    const safeLimit = normalizeLimit(query.limit);
    const rows = this.database
      .prepare(
        'SELECT payload FROM codex_read_only_adapter_final_readiness ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];
    const records = rows.map(
      (row) => JSON.parse(row.payload) as CodexExecReadOnlyAdapterFinalReadinessDecisionRecord,
    );

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
      .slice(0, safeLimit);
  }
}

class SqliteCodexExecRealReadOnlyAdapterReadinessRepository implements CodexExecRealReadOnlyAdapterReadinessRepository {
  private readonly repository: JsonEntityRepository<CodexExecRealReadOnlyAdapterReadinessPackage>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<CodexExecRealReadOnlyAdapterReadinessPackage>(
      database,
      'codex_real_read_only_adapter_readiness_packages',
      (record) => record.createdAt,
    );
  }

  async saveReadinessPackage(
    record: CodexExecRealReadOnlyAdapterReadinessPackage,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessPackage> {
    return this.repository.create(record);
  }

  async getReadinessPackage(
    id: string,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessPackage | undefined> {
    return this.repository.getById(id);
  }

  async listReadinessPackages(
    query: Partial<CodexExecRealReadOnlyAdapterReadinessQuery> = {},
  ): Promise<CodexExecRealReadOnlyAdapterReadinessPackage[]> {
    const safeLimit = normalizeLimit(query.limit);
    const rows = this.database
      .prepare(
        'SELECT payload FROM codex_real_read_only_adapter_readiness_packages ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];
    const records = rows.map(
      (row) => JSON.parse(row.payload) as CodexExecRealReadOnlyAdapterReadinessPackage,
    );

    return records
      .filter((record) => {
        if (query.dryRunId && record.dryRunId !== query.dryRunId) {
          return false;
        }

        if (query.status && record.status !== query.status) {
          return false;
        }

        return true;
      })
      .slice(0, safeLimit);
  }

  async latestReadinessPackage(
    dryRunId: string,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessPackage | undefined> {
    return (await this.listReadinessPackages({ dryRunId, limit: 1 }))[0];
  }
}

class SqliteCodexExecRealReadOnlyAdapterReadinessReviewRepository implements CodexExecRealReadOnlyAdapterReadinessReviewRepository {
  private readonly repository: JsonEntityRepository<CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository =
      new JsonEntityRepository<CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord>(
        database,
        'codex_real_read_only_adapter_readiness_reviews',
        (record) => record.createdAt,
      );
  }

  async saveReadinessReview(
    record: CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord> {
    return this.repository.create(record);
  }

  async getReadinessReview(
    id: string,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord | undefined> {
    return this.repository.getById(id);
  }

  async listReadinessReviews(
    query: Partial<CodexExecRealReadOnlyAdapterReadinessReviewQuery> = {},
  ): Promise<CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord[]> {
    const safeLimit = normalizeLimit(query.limit);
    const rows = this.database
      .prepare(
        'SELECT payload FROM codex_real_read_only_adapter_readiness_reviews ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];
    const records = rows.map(
      (row) => JSON.parse(row.payload) as CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord,
    );

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
      .slice(0, safeLimit);
  }

  async latestReadinessReview(
    dryRunId: string,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord | undefined> {
    return (await this.listReadinessReviews({ dryRunId, limit: 1 }))[0];
  }
}

class SqliteCodexExecRealReadOnlyAdapterAttemptRepository
  implements CodexExecRealReadOnlyAdapterAttemptRepository
{
  private readonly repository: JsonEntityRepository<CodexExecRealReadOnlyAdapterAttemptRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<CodexExecRealReadOnlyAdapterAttemptRecord>(
      database,
      'codex_real_read_only_adapter_attempts',
      (record) => record.createdAt,
    );
  }

  async saveAttempt(
    record: CodexExecRealReadOnlyAdapterAttemptRecord,
  ): Promise<CodexExecRealReadOnlyAdapterAttemptRecord> {
    return this.repository.create(record);
  }

  async getAttempt(id: string): Promise<CodexExecRealReadOnlyAdapterAttemptRecord | undefined> {
    return this.repository.getById(id);
  }

  async listAttempts(
    query: Partial<CodexExecRealReadOnlyAdapterAttemptQuery> = {},
  ): Promise<CodexExecRealReadOnlyAdapterAttemptRecord[]> {
    const safeLimit = normalizeLimit(query.limit);
    const rows = this.database
      .prepare(
        'SELECT payload FROM codex_real_read_only_adapter_attempts ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];
    const records = rows.map(
      (row) => JSON.parse(row.payload) as CodexExecRealReadOnlyAdapterAttemptRecord,
    );

    return records
      .filter((record) => {
        if (query.dryRunId && record.dryRunId !== query.dryRunId) {
          return false;
        }

        if (query.status && record.status !== query.status) {
          return false;
        }

        return true;
      })
      .slice(0, safeLimit);
  }

  async latestAttempt(
    dryRunId: string,
  ): Promise<CodexExecRealReadOnlyAdapterAttemptRecord | undefined> {
    return (await this.listAttempts({ dryRunId, limit: 1 }))[0];
  }
}

class SqliteCodexExecRealReadOnlyAdapterPolicySourceRepository
  implements CodexExecRealReadOnlyAdapterPolicySourceRepository
{
  private readonly repository: JsonEntityRepository<CodexExecRealReadOnlyAdapterPolicySourceRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<CodexExecRealReadOnlyAdapterPolicySourceRecord>(
      database,
      'codex_real_read_only_adapter_policy_sources',
      (record) => record.createdAt,
    );
  }

  async savePolicySource(
    record: CodexExecRealReadOnlyAdapterPolicySourceRecord,
  ): Promise<CodexExecRealReadOnlyAdapterPolicySourceRecord> {
    return this.repository.create(record);
  }

  async getPolicySource(
    id: string,
  ): Promise<CodexExecRealReadOnlyAdapterPolicySourceRecord | undefined> {
    return this.repository.getById(id);
  }

  async listPolicySources(
    query: Partial<CodexExecRealReadOnlyAdapterPolicySourceQuery> = {},
  ): Promise<CodexExecRealReadOnlyAdapterPolicySourceRecord[]> {
    const safeLimit = normalizeLimit(query.limit);
    const rows = this.database
      .prepare(
        'SELECT payload FROM codex_real_read_only_adapter_policy_sources ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];
    const records = rows.map(
      (row) => JSON.parse(row.payload) as CodexExecRealReadOnlyAdapterPolicySourceRecord,
    );

    return records
      .filter((record) => {
        if (query.dryRunId && record.dryRunId !== query.dryRunId) {
          return false;
        }

        if (query.status && record.status !== query.status) {
          return false;
        }

        return true;
      })
      .slice(0, safeLimit);
  }

  async latestPolicySource(
    dryRunId: string,
  ): Promise<CodexExecRealReadOnlyAdapterPolicySourceRecord | undefined> {
    return (await this.listPolicySources({ dryRunId, limit: 1 }))[0];
  }
}

class SqliteCodexExecRealReadOnlyAdapterApprovalAuthorityTraceRepository
  implements CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRepository
{
  private readonly repository: JsonEntityRepository<CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository =
      new JsonEntityRepository<CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord>(
        database,
        'codex_real_read_only_adapter_approval_authority_traces',
        (record) => record.createdAt,
      );
  }

  async saveApprovalAuthorityTrace(
    record: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord,
  ): Promise<CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord> {
    return this.repository.create(record);
  }

  async getApprovalAuthorityTrace(
    id: string,
  ): Promise<CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord | undefined> {
    return this.repository.getById(id);
  }

  async listApprovalAuthorityTraces(
    query: Partial<CodexExecRealReadOnlyAdapterApprovalAuthorityTraceQuery> = {},
  ): Promise<CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord[]> {
    const safeLimit = normalizeLimit(query.limit);
    const rows = this.database
      .prepare(
        'SELECT payload FROM codex_real_read_only_adapter_approval_authority_traces ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];
    const records = rows.map(
      (row) => JSON.parse(row.payload) as CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord,
    );

    return records
      .filter((record) => {
        if (query.dryRunId && record.dryRunId !== query.dryRunId) {
          return false;
        }

        if (query.status && record.status !== query.status) {
          return false;
        }

        return true;
      })
      .slice(0, safeLimit);
  }

  async latestApprovalAuthorityTrace(
    dryRunId: string,
  ): Promise<CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord | undefined> {
    return (await this.listApprovalAuthorityTraces({ dryRunId, limit: 1 }))[0];
  }
}

class SqliteCodexExecRealReadOnlyAdapterPilotPrerequisiteRepository
  implements CodexExecRealReadOnlyAdapterPilotPrerequisiteRepository
{
  private readonly repository: JsonEntityRepository<CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository = new JsonEntityRepository<CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord>(
      database,
      'codex_real_read_only_adapter_pilot_prerequisites',
      (record) => record.createdAt,
    );
  }

  async savePilotPrerequisite(
    record: CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord,
  ): Promise<CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord> {
    return this.repository.create(record);
  }

  async getPilotPrerequisite(
    id: string,
  ): Promise<CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord | undefined> {
    return this.repository.getById(id);
  }

  async listPilotPrerequisites(
    query: Partial<CodexExecRealReadOnlyAdapterPilotPrerequisiteQuery> = {},
  ): Promise<CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord[]> {
    const safeLimit = normalizeLimit(query.limit);
    const rows = this.database
      .prepare(
        'SELECT payload FROM codex_real_read_only_adapter_pilot_prerequisites ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];
    const records = rows.map(
      (row) => JSON.parse(row.payload) as CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord,
    );

    return records
      .filter((record) => {
        if (query.dryRunId && record.dryRunId !== query.dryRunId) {
          return false;
        }

        if (query.status && record.status !== query.status) {
          return false;
        }

        return true;
      })
      .slice(0, safeLimit);
  }

  async latestPilotPrerequisite(
    dryRunId: string,
  ): Promise<CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord | undefined> {
    return (await this.listPilotPrerequisites({ dryRunId, limit: 1 }))[0];
  }
}

class SqliteCodexExecRealReadOnlyAdapterPilotSourcePreparationRepository
  implements CodexExecRealReadOnlyAdapterPilotSourcePreparationRepository
{
  private readonly repository: JsonEntityRepository<CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord>;

  constructor(private readonly database: SqliteDatabase) {
    this.repository =
      new JsonEntityRepository<CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord>(
        database,
        'codex_real_read_only_adapter_pilot_source_preparations',
        (record) => record.createdAt,
      );
  }

  async savePilotSourcePreparation(
    record: CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord,
  ): Promise<CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord> {
    return this.repository.create(record);
  }

  async getPilotSourcePreparation(
    id: string,
  ): Promise<CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord | undefined> {
    return this.repository.getById(id);
  }

  async listPilotSourcePreparations(
    query: Partial<CodexExecRealReadOnlyAdapterPilotSourcePreparationQuery> = {},
  ): Promise<CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord[]> {
    const safeLimit = normalizeLimit(query.limit);
    const rows = this.database
      .prepare(
        'SELECT payload FROM codex_real_read_only_adapter_pilot_source_preparations ORDER BY recorded_at DESC, id DESC',
      )
      .all() as unknown as PayloadRow[];
    const records = rows.map(
      (row) =>
        JSON.parse(row.payload) as CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord,
    );

    return records
      .filter((record) => {
        if (query.dryRunId && record.dryRunId !== query.dryRunId) {
          return false;
        }

        if (query.status && record.status !== query.status) {
          return false;
        }

        return true;
      })
      .slice(0, safeLimit);
  }

  async latestPilotSourcePreparation(
    dryRunId: string,
  ): Promise<CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord | undefined> {
    return (await this.listPilotSourcePreparations({ dryRunId, limit: 1 }))[0];
  }
}

class SqliteMetadataEntityRepository<T extends PersistedEntity>
  implements MetadataEntityRepository<T>
{
  private readonly repository: JsonEntityRepository<T>;

  constructor(
    private readonly database: SqliteDatabase,
    private readonly tableName: string,
  ) {
    this.repository = new JsonEntityRepository<T>(
      database,
      tableName,
      metadataEntityTimestamp,
    );
  }

  async saveRecord(record: T): Promise<T> {
    return this.repository.create(record);
  }

  async getRecord(id: string): Promise<T | undefined> {
    return this.repository.getById(id);
  }

  async listRecords(query: M51MetadataRecordQuery = {}): Promise<T[]> {
    const rows = this.database
      .prepare(`SELECT payload FROM ${this.tableName} ORDER BY recorded_at DESC, id DESC`)
      .all() as unknown as PayloadRow[];

    return rows
      .map((row) => JSON.parse(row.payload) as T)
      .filter((record) => {
        const status = (record as { status?: string }).status;
        if (query.status && status !== query.status) {
          return false;
        }

        const metadata = (record as { metadata?: Record<string, unknown> }).metadata;
        if (query.dryRunId && !metadataMatchesDryRun(metadata, query.dryRunId)) {
          return false;
        }

        return true;
      })
      .slice(0, normalizeLimit(query.limit));
  }
}

class JsonEntityRepository<T extends PersistedEntity> {
  constructor(
    private readonly database: SqliteDatabase,
    private readonly tableName: string,
    private readonly timestampSelector: TimestampSelector<T>,
  ) {}

  async create(entity: T): Promise<T> {
    this.upsert(entity);
    return entity;
  }

  async getById(id: string): Promise<T | undefined> {
    const row = this.database
      .prepare(`SELECT payload FROM ${this.tableName} WHERE id = ?`)
      .get(id) as PayloadRow | undefined;

    return row ? (JSON.parse(row.payload) as T) : undefined;
  }

  async list(): Promise<T[]> {
    const rows = this.database
      .prepare(`SELECT payload FROM ${this.tableName} ORDER BY recorded_at ASC, id ASC`)
      .all() as unknown as PayloadRow[];

    return rows.map((row) => JSON.parse(row.payload) as T);
  }

  async update(entity: T): Promise<T> {
    this.upsert(entity);
    return entity;
  }

  private upsert(entity: T): void {
    this.database
      .prepare(
        `INSERT OR REPLACE INTO ${this.tableName} (id, recorded_at, payload) VALUES (?, ?, ?)`,
      )
      .run(entity.id, this.timestampSelector(entity), JSON.stringify(entity));
  }
}

class AppendOnlyJsonEntityRepository<T extends PersistedEntity> {
  constructor(
    private readonly database: SqliteDatabase,
    private readonly tableName: string,
    private readonly timestampSelector: TimestampSelector<T>,
  ) {}

  async append(entity: T): Promise<T> {
    this.database
      .prepare(
        `INSERT OR REPLACE INTO ${this.tableName} (id, recorded_at, payload) VALUES (?, ?, ?)`,
      )
      .run(entity.id, this.timestampSelector(entity), JSON.stringify(entity));

    return entity;
  }

  async create(entity: T): Promise<T> {
    return this.append(entity);
  }

  async getById(id: string): Promise<T | undefined> {
    const row = this.database
      .prepare(`SELECT payload FROM ${this.tableName} WHERE id = ?`)
      .get(id) as PayloadRow | undefined;

    return row ? (JSON.parse(row.payload) as T) : undefined;
  }

  async list(): Promise<T[]> {
    const rows = this.database
      .prepare(`SELECT payload FROM ${this.tableName} ORDER BY recorded_at ASC, id ASC`)
      .all() as unknown as PayloadRow[];

    return rows.map((row) => JSON.parse(row.payload) as T);
  }
}

function loadDatabaseSync(): SqliteDatabaseConstructor {
  const sqliteModule = requireNodeModule('node:sqlite') as {
    DatabaseSync: SqliteDatabaseConstructor;
  };

  return sqliteModule.DatabaseSync;
}

function initializeDatabase(database: SqliteDatabase): void {
  database.exec('PRAGMA journal_mode=WAL');
  database.exec('PRAGMA foreign_keys=ON');
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workflow_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS evidence_refs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS observations (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS development_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_replays (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_exec_live_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_exec_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS browser_observation_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS browser_observation_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS browser_observation_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS electron_cdp_observation_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS electron_cdp_observation_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS electron_cdp_observation_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS worktree_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS worktree_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS worktree_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS worktree_cleanup_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS worktree_cleanup_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS worktree_cleanup_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS review_package_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS review_package_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS review_package_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS release_candidate_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS release_candidate_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS release_candidate_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_metadata_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_metadata_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_metadata_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_draft_pr_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_draft_pr_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_draft_pr_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_branch_publish_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_branch_publish_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_branch_publish_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_publish_draft_pr_chain_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_publish_draft_pr_chain_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_pr_lifecycle_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_pr_lifecycle_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_pr_lifecycle_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_pr_labels_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_pr_labels_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_pr_labels_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_pr_assignees_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_pr_assignees_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_pr_assignees_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_pr_reviewers_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_pr_reviewers_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_pr_reviewers_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_pr_milestones_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_pr_milestones_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_pr_milestones_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_pr_comments_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_pr_comments_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_pr_comments_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_merge_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_merge_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_merge_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_actions_observation_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_actions_observation_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_actions_observation_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_actions_rerun_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_actions_rerun_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_actions_rerun_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_actions_cancel_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_actions_cancel_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_actions_cancel_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_actions_dispatch_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_actions_dispatch_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_actions_dispatch_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS release_version_plan_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_release_tag_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_release_tag_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_release_tag_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_release_draft_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_release_draft_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_release_draft_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deployment_observation_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deployment_observation_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deployment_observation_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deployment_operation_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deployment_operation_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deployment_rollback_plans (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deployment_operation_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS secret_readiness_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS secret_readiness_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS secret_readiness_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS secret_leak_audit_summaries (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS real_policy_backend_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS real_policy_backend_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS real_policy_backend_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS real_telemetry_export_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS real_telemetry_export_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS real_telemetry_export_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS browser_action_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS browser_action_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS browser_action_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS electron_main_inspector_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS electron_main_inspector_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS electron_main_inspector_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mcp_write_tool_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mcp_write_tool_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mcp_write_tool_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS runtime_job_plans (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS runtime_queue_entries (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS runtime_leases (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS runtime_locks (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS runtime_checkpoints (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS runtime_job_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS multi_agent_coordination_plans (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS multi_agent_slot_summaries (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS external_agent_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS external_agent_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS external_agent_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS external_agent_patch_summaries (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS platform_operation_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS platform_backup_plans (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS platform_backup_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS platform_restore_plans (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS platform_restore_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS store_migration_plans (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS store_migration_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS retention_policy_plans (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS retention_policy_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_export_plans (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_export_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS operator_role_assignment_plans (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS operator_role_assignment_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS disaster_recovery_rehearsal_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS production_ga_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS production_ga_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS production_ga_signoff_plans (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS production_ga_signoff_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS production_ga_e2e_rehearsals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS production_ga_training_completions (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS production_ga_threat_models (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS production_ga_residual_risk_registers (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_remote_cleanup_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_remote_cleanup_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS github_remote_cleanup_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rework_loop_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rework_loop_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rework_loop_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS custom_workflow_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS custom_workflow_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS custom_workflow_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS production_workflow_recovery_dry_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS production_workflow_recovery_approvals (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS production_workflow_recovery_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS production_workflow_recovery_child_action_states (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_patch_child_records (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS nx_verification_child_records (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_report_reviews (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_live_adapter_adr_decisions (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_read_only_adapter_simulator_reviews (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_read_only_adapter_implementation_plan_reviews (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_read_only_adapter_skeleton_reviews (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_read_only_adapter_final_readiness (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_real_read_only_adapter_readiness_packages (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_real_read_only_adapter_readiness_reviews (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_real_read_only_adapter_attempts (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_real_read_only_adapter_policy_sources (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_real_read_only_adapter_approval_authority_traces (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_real_read_only_adapter_pilot_prerequisites (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_real_read_only_adapter_pilot_source_preparations (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_workspaces (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_membership_mirrors (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chrome_profile_bindings (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chatgpt_session_health (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS human_checkpoints (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_client_instances (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_app_server_sessions (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_app_server_wire_message_summaries (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_app_server_thread_mirrors (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_app_server_turn_mirrors (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_app_server_event_summaries (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_app_server_approval_bridge_records (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_app_server_protocol_drift_reports (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_account_bindings (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_task_intents (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_task_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_task_diagnoses (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_recovery_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_task_diff_summaries (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_task_verification_projections (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_task_review_projections (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_task_github_closure_projections (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_task_closure_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_production_canary_tasks (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_production_canary_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_production_drift_gates (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_production_readiness_gates (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_production_audit_export_summaries (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS account_pools (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS client_pools (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pool_leases (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quota_snapshots (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS evidence_bundles (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_codex_seats (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workspace_credit_snapshots (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_seat_usage_limits (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS codex_quota_source_health (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quota_attributions (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_quota_cross_check_reports (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS owner_admin_read_surface_summaries (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_admin_member_roster_snapshots (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_billing_summaries (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS owner_admin_extraction_reports (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_profile_workspace_observations (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_workspace_switch_dry_run_plans (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_workspace_switch_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_member_reconciliation_reports (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS automation_capability_policies (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ui_observation_sources (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cdp_dom_observation_summaries (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS electron_renderer_observation_summaries (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ui_target_fingerprints (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ui_automation_intents (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ui_automation_dry_run_plans (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ui_automation_authorities (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ui_automation_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_write_intents (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_write_dry_run_plans (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_write_authorities (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_write_runs (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sensitive_redaction_reports (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_quota_source_probes (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_quota_permission_probes (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS local_capability_probes (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS forbidden_path_probes (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quota_evidence_matrices (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quota_readiness_debug_reports (
      id TEXT PRIMARY KEY,
      recorded_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );
  `);
  database
    .prepare('INSERT OR IGNORE INTO schema_migrations (id, applied_at) VALUES (?, ?)')
    .run('foundation_0001', new Date().toISOString());
}

function normalizeLimit(limit: number | undefined): number {
  if (!Number.isInteger(limit) || limit === undefined) {
    return 50;
  }

  return Math.min(200, Math.max(1, Math.trunc(limit)));
}

function metadataEntityTimestamp(entity: PersistedEntity): string {
  return entity.observedAt ?? entity.createdAt ?? '1970-01-01T00:00:00.000Z';
}

function listBrowserObservationRecords<T extends { dryRunId?: string; status?: string }>(
  database: SqliteDatabase,
  tableName: string,
  query: BrowserObservationQuery,
): T[] {
  return listObservationControlPlaneRecords(database, tableName, query);
}

function listObservationControlPlaneRecords<T extends { dryRunId?: string; status?: string }>(
  database: SqliteDatabase,
  tableName: string,
  query: BrowserObservationQuery | ElectronCdpObservationQuery,
): T[] {
  const safeLimit = normalizeLimit(query.limit);
  const rows = database
    .prepare(`SELECT payload FROM ${tableName} ORDER BY recorded_at DESC, id DESC`)
    .all() as unknown as PayloadRow[];

  return rows
    .map((row) => JSON.parse(row.payload) as T)
    .filter((record) => {
      if (query.dryRunId && record.dryRunId !== query.dryRunId) {
        return false;
      }

      if (query.status && record.status !== query.status) {
        return false;
      }

      return true;
    })
    .slice(0, safeLimit);
}

function getApprovalRecordByArtifactId<T extends { approvalArtifactId?: string }>(
  database: SqliteDatabase,
  tableName: string,
  approvalArtifactId: string,
): T | undefined {
  const rows = database
    .prepare(`SELECT payload FROM ${tableName} ORDER BY recorded_at DESC, id DESC`)
    .all() as unknown as PayloadRow[];

  return rows
    .map((row) => JSON.parse(row.payload) as T)
    .find((record) => record.approvalArtifactId === approvalArtifactId);
}

function metadataMatchesDryRun(metadata: Record<string, unknown> | undefined, dryRunId: string) {
  return (
    metadata?.dryRunPlanId === dryRunId ||
    metadata?.dryRunId === dryRunId ||
    metadata?.liveRunRecordId === dryRunId
  );
}

function findWorkspaceRoot(startDirectory: string): string {
  let current = resolve(startDirectory);
  const root = parse(current).root;

  while (true) {
    if (existsSync(join(current, 'pnpm-workspace.yaml'))) {
      return current;
    }

    if (current === root) {
      return resolve(startDirectory);
    }

    current = dirname(current);
  }
}
