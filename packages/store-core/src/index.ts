import type {
  AuditEvent,
  AccountPool,
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
  CodexAccountBinding,
  CodexAppServerApprovalBridgeRecord,
  CodexAppServerEventSummary,
  CodexAppServerProtocolDriftReport,
  CodexAppServerSession,
  CodexAppServerThreadMirror,
  CodexAppServerTurnMirror,
  CodexAppServerWireMessageSummary,
  CodexClientInstance,
  CodexRecoveryRun,
  CodexPatchChildRecord,
  CodexTaskDiagnosis,
  CodexTaskIntent,
  CodexTaskRun,
  CodexExecLiveRunRecord,
  ElectronCdpObservationApprovalArtifactRecord,
  ElectronCdpObservationControlPlaneRun,
  ElectronCdpObservationDryRunRecord,
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
  CodexExecLiveAdapterAdrDecisionQuery,
  CodexExecLiveAdapterAdrDecisionRecord,
  CodexExecManualApprovalRecord,
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
  EvidenceBundle,
  EvidenceRef,
  HumanCheckpoint,
  Lease,
  MockDevelopmentRun,
  Observation,
  QuotaSnapshot,
  WorkflowRun,
} from '@codexhub/contracts';

export interface AuditEventQuery {
  dryRunId?: string;
  action?: string;
  limit?: number;
}

export interface EvidenceRefQuery {
  dryRunId?: string;
  kind?: EvidenceRef['kind'];
  limit?: number;
}

export interface BrowserObservationQuery {
  dryRunId?: string;
  status?: string;
  limit?: number;
}

export interface ElectronCdpObservationQuery {
  dryRunId?: string;
  status?: string;
  limit?: number;
}

export interface WorktreeControlPlaneQuery {
  dryRunId?: string;
  status?: string;
  limit?: number;
}

export type ReviewPackageControlPlaneQuery = WorktreeControlPlaneQuery;
export type ReleaseCandidateControlPlaneQuery = WorktreeControlPlaneQuery;
export type GithubMetadataControlPlaneQuery = WorktreeControlPlaneQuery;
export type GithubDraftPrControlPlaneQuery = WorktreeControlPlaneQuery;
export type GithubBranchPublishControlPlaneQuery = WorktreeControlPlaneQuery;
export type GithubPublishDraftPrChainControlPlaneQuery = WorktreeControlPlaneQuery;
export type GithubPrLifecycleControlPlaneQuery = WorktreeControlPlaneQuery;
export type GithubMergeControlPlaneQuery = WorktreeControlPlaneQuery;
export type GithubActionsObservationControlPlaneQuery = WorktreeControlPlaneQuery;
export type GithubActionsRunControlControlPlaneQuery = WorktreeControlPlaneQuery;
export type GithubActionsDispatchControlPlaneQuery = WorktreeControlPlaneQuery;
export type ReleaseVersionPlanControlPlaneQuery = WorktreeControlPlaneQuery;
export type GithubReleaseTagControlPlaneQuery = WorktreeControlPlaneQuery;
export type GithubReleaseDraftControlPlaneQuery = WorktreeControlPlaneQuery;
export type DeploymentObservationControlPlaneQuery = WorktreeControlPlaneQuery;
export type DeploymentOperationControlPlaneQuery = WorktreeControlPlaneQuery;
export type SecretReadinessControlPlaneQuery = WorktreeControlPlaneQuery;
export type RealPolicyBackendControlPlaneQuery = WorktreeControlPlaneQuery;
export type RealTelemetryExportControlPlaneQuery = WorktreeControlPlaneQuery;
export type BrowserActionControlPlaneQuery = WorktreeControlPlaneQuery;
export type ElectronMainInspectorControlPlaneQuery = WorktreeControlPlaneQuery;
export type McpWriteToolControlPlaneQuery = WorktreeControlPlaneQuery;
export type RuntimeOperationsControlPlaneQuery = WorktreeControlPlaneQuery;
export type ExternalAgentControlPlaneQuery = WorktreeControlPlaneQuery;
export type PlatformOperationsControlPlaneQuery = WorktreeControlPlaneQuery;
export type ProductionGaControlPlaneQuery = WorktreeControlPlaneQuery;
export type GithubRemoteCleanupControlPlaneQuery = WorktreeControlPlaneQuery;
export type ReworkLoopControlPlaneQuery = WorktreeControlPlaneQuery;
export type CustomWorkflowControlPlaneQuery = WorktreeControlPlaneQuery;
export type ProductionWorkflowRecoveryControlPlaneQuery = WorktreeControlPlaneQuery;
export type LocalProductionWorkflowChildRecordQuery = WorktreeControlPlaneQuery;
export type M51MetadataRecordQuery = WorktreeControlPlaneQuery;

export interface WorkflowRunRepository {
  create(run: WorkflowRun): Promise<WorkflowRun>;
  getById(id: string): Promise<WorkflowRun | undefined>;
  list(): Promise<WorkflowRun[]>;
  update(run: WorkflowRun): Promise<WorkflowRun>;
}

export interface AuditEventRepository {
  append(event: AuditEvent): Promise<AuditEvent>;
  getAuditEvent(id: string): Promise<AuditEvent | undefined>;
  listAuditEvents(query?: AuditEventQuery): Promise<AuditEvent[]>;
  list(): Promise<AuditEvent[]>;
}

export interface EvidenceRefRepository {
  create(ref: EvidenceRef): Promise<EvidenceRef>;
  getById(id: string): Promise<EvidenceRef | undefined>;
  getEvidenceRef(id: string): Promise<EvidenceRef | undefined>;
  listEvidenceRefs(query?: EvidenceRefQuery): Promise<EvidenceRef[]>;
  list(): Promise<EvidenceRef[]>;
}

export interface ObservationRepository {
  append(observation: Observation): Promise<Observation>;
  list(): Promise<Observation[]>;
}

export interface DevelopmentRunRepository {
  saveMockDevelopmentRun(result: MockDevelopmentRun): Promise<MockDevelopmentRun>;
  listMockDevelopmentRuns(limit?: number): Promise<MockDevelopmentRun[]>;
  getMockDevelopmentRun(id: string): Promise<MockDevelopmentRun | undefined>;
}

export interface CodexReplayRepository {
  saveCodexReplay(record: CodexReplayRecord): Promise<CodexReplayRecord>;
  listCodexReplays(limit?: number): Promise<CodexReplayRecord[]>;
  getCodexReplay(id: string): Promise<CodexReplayRecord | undefined>;
}

export interface MetadataEntityRepository<T> {
  saveRecord(record: T): Promise<T>;
  getRecord(id: string): Promise<T | undefined>;
  listRecords(query?: M51MetadataRecordQuery): Promise<T[]>;
}

export interface CodexExecLiveRunRepository {
  saveCodexExecLiveRunRecord(record: CodexExecLiveRunRecord): Promise<CodexExecLiveRunRecord>;
  listCodexExecLiveRunRecords(limit?: number): Promise<CodexExecLiveRunRecord[]>;
  getCodexExecLiveRunRecord(id: string): Promise<CodexExecLiveRunRecord | undefined>;
}

export interface CodexExecApprovalRepository {
  saveCodexExecApprovalRecord(
    record: CodexExecManualApprovalRecord,
  ): Promise<CodexExecManualApprovalRecord>;
  listCodexExecApprovalRecords(limit?: number): Promise<CodexExecManualApprovalRecord[]>;
  getCodexExecApprovalRecord(id: string): Promise<CodexExecManualApprovalRecord | undefined>;
  getCodexExecApprovalRecordByArtifactId(
    approvalArtifactId: string,
  ): Promise<CodexExecManualApprovalRecord | undefined>;
  listCodexExecApprovalRecordsForDryRun(
    dryRunPlanId: string,
    limit?: number,
  ): Promise<CodexExecManualApprovalRecord[]>;
}

export interface BrowserObservationDryRunRepository {
  saveDryRun(record: BrowserObservationDryRunRecord): Promise<BrowserObservationDryRunRecord>;
  getDryRun(id: string): Promise<BrowserObservationDryRunRecord | undefined>;
  listDryRuns(query?: BrowserObservationQuery): Promise<BrowserObservationDryRunRecord[]>;
}

export interface BrowserObservationApprovalRepository {
  saveApproval(
    record: BrowserObservationApprovalArtifactRecord,
  ): Promise<BrowserObservationApprovalArtifactRecord>;
  getApproval(id: string): Promise<BrowserObservationApprovalArtifactRecord | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<BrowserObservationApprovalArtifactRecord | undefined>;
  listApprovals(
    query?: BrowserObservationQuery,
  ): Promise<BrowserObservationApprovalArtifactRecord[]>;
}

export interface BrowserObservationRunRepository {
  saveRun(record: BrowserObservationControlPlaneRun): Promise<BrowserObservationControlPlaneRun>;
  getRun(id: string): Promise<BrowserObservationControlPlaneRun | undefined>;
  listRuns(query?: BrowserObservationQuery): Promise<BrowserObservationControlPlaneRun[]>;
}

export interface ElectronCdpObservationDryRunRepository {
  saveDryRun(
    record: ElectronCdpObservationDryRunRecord,
  ): Promise<ElectronCdpObservationDryRunRecord>;
  getDryRun(id: string): Promise<ElectronCdpObservationDryRunRecord | undefined>;
  listDryRuns(query?: ElectronCdpObservationQuery): Promise<ElectronCdpObservationDryRunRecord[]>;
}

export interface ElectronCdpObservationApprovalRepository {
  saveApproval(
    record: ElectronCdpObservationApprovalArtifactRecord,
  ): Promise<ElectronCdpObservationApprovalArtifactRecord>;
  getApproval(id: string): Promise<ElectronCdpObservationApprovalArtifactRecord | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<ElectronCdpObservationApprovalArtifactRecord | undefined>;
  listApprovals(
    query?: ElectronCdpObservationQuery,
  ): Promise<ElectronCdpObservationApprovalArtifactRecord[]>;
}

export interface ElectronCdpObservationRunRepository {
  saveRun(
    record: ElectronCdpObservationControlPlaneRun,
  ): Promise<ElectronCdpObservationControlPlaneRun>;
  getRun(id: string): Promise<ElectronCdpObservationControlPlaneRun | undefined>;
  listRuns(
    query?: ElectronCdpObservationQuery,
  ): Promise<ElectronCdpObservationControlPlaneRun[]>;
}

export interface WorktreeDryRunRepository {
  saveDryRun(record: WorktreeDryRunRecord): Promise<WorktreeDryRunRecord>;
  getDryRun(id: string): Promise<WorktreeDryRunRecord | undefined>;
  listDryRuns(query?: WorktreeControlPlaneQuery): Promise<WorktreeDryRunRecord[]>;
}

export interface WorktreeApprovalRepository {
  saveApproval(
    record: WorktreeApprovalArtifactRecord,
  ): Promise<WorktreeApprovalArtifactRecord>;
  getApproval(id: string): Promise<WorktreeApprovalArtifactRecord | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<WorktreeApprovalArtifactRecord | undefined>;
  listApprovals(
    query?: WorktreeControlPlaneQuery,
  ): Promise<WorktreeApprovalArtifactRecord[]>;
}

export interface WorktreeRunRepository {
  saveRun(record: WorktreeControlPlaneRun): Promise<WorktreeControlPlaneRun>;
  getRun(id: string): Promise<WorktreeControlPlaneRun | undefined>;
  listRuns(query?: WorktreeControlPlaneQuery): Promise<WorktreeControlPlaneRun[]>;
}

export interface WorktreeCleanupDryRunRepository {
  saveDryRun(record: WorktreeCleanupDryRunRecord): Promise<WorktreeCleanupDryRunRecord>;
  getDryRun(id: string): Promise<WorktreeCleanupDryRunRecord | undefined>;
  listDryRuns(query?: WorktreeControlPlaneQuery): Promise<WorktreeCleanupDryRunRecord[]>;
}

export interface WorktreeCleanupApprovalRepository {
  saveApproval(
    record: WorktreeCleanupApprovalArtifactRecord,
  ): Promise<WorktreeCleanupApprovalArtifactRecord>;
  getApproval(id: string): Promise<WorktreeCleanupApprovalArtifactRecord | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<WorktreeCleanupApprovalArtifactRecord | undefined>;
  listApprovals(
    query?: WorktreeControlPlaneQuery,
  ): Promise<WorktreeCleanupApprovalArtifactRecord[]>;
}

export interface WorktreeCleanupRunRepository {
  saveRun(record: WorktreeCleanupControlPlaneRun): Promise<WorktreeCleanupControlPlaneRun>;
  getRun(id: string): Promise<WorktreeCleanupControlPlaneRun | undefined>;
  listRuns(query?: WorktreeControlPlaneQuery): Promise<WorktreeCleanupControlPlaneRun[]>;
}

export interface ReviewPackageDryRunRepository {
  saveDryRun(record: LocalReviewPackageDryRunRecord): Promise<LocalReviewPackageDryRunRecord>;
  getDryRun(id: string): Promise<LocalReviewPackageDryRunRecord | undefined>;
  listDryRuns(query?: ReviewPackageControlPlaneQuery): Promise<LocalReviewPackageDryRunRecord[]>;
}

export interface ReviewPackageApprovalRepository {
  saveApproval(
    record: LocalReviewPackageApprovalArtifactRecord,
  ): Promise<LocalReviewPackageApprovalArtifactRecord>;
  getApproval(id: string): Promise<LocalReviewPackageApprovalArtifactRecord | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<LocalReviewPackageApprovalArtifactRecord | undefined>;
  listApprovals(
    query?: ReviewPackageControlPlaneQuery,
  ): Promise<LocalReviewPackageApprovalArtifactRecord[]>;
}

export interface ReviewPackageRunRepository {
  saveRun(record: LocalReviewPackageControlPlaneRun): Promise<LocalReviewPackageControlPlaneRun>;
  getRun(id: string): Promise<LocalReviewPackageControlPlaneRun | undefined>;
  listRuns(query?: ReviewPackageControlPlaneQuery): Promise<LocalReviewPackageControlPlaneRun[]>;
}

export interface ReleaseCandidateDryRunRepository {
  saveDryRun(record: LocalRcBundleDryRunRecord): Promise<LocalRcBundleDryRunRecord>;
  getDryRun(id: string): Promise<LocalRcBundleDryRunRecord | undefined>;
  listDryRuns(query?: ReleaseCandidateControlPlaneQuery): Promise<LocalRcBundleDryRunRecord[]>;
}

export interface ReleaseCandidateApprovalRepository {
  saveApproval(
    record: LocalRcBundleApprovalArtifactRecord,
  ): Promise<LocalRcBundleApprovalArtifactRecord>;
  getApproval(id: string): Promise<LocalRcBundleApprovalArtifactRecord | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<LocalRcBundleApprovalArtifactRecord | undefined>;
  listApprovals(
    query?: ReleaseCandidateControlPlaneQuery,
  ): Promise<LocalRcBundleApprovalArtifactRecord[]>;
}

export interface ReleaseCandidateRunRepository {
  saveRun(record: LocalRcBundleControlPlaneRun): Promise<LocalRcBundleControlPlaneRun>;
  getRun(id: string): Promise<LocalRcBundleControlPlaneRun | undefined>;
  listRuns(query?: ReleaseCandidateControlPlaneQuery): Promise<LocalRcBundleControlPlaneRun[]>;
}

export interface GithubMetadataDryRunRepository {
  saveDryRun(record: GithubMetadataDryRunRecord): Promise<GithubMetadataDryRunRecord>;
  getDryRun(id: string): Promise<GithubMetadataDryRunRecord | undefined>;
  listDryRuns(query?: GithubMetadataControlPlaneQuery): Promise<GithubMetadataDryRunRecord[]>;
}

export interface GithubMetadataApprovalRepository {
  saveApproval(
    record: GithubMetadataApprovalArtifactRecord,
  ): Promise<GithubMetadataApprovalArtifactRecord>;
  getApproval(id: string): Promise<GithubMetadataApprovalArtifactRecord | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubMetadataApprovalArtifactRecord | undefined>;
  listApprovals(
    query?: GithubMetadataControlPlaneQuery,
  ): Promise<GithubMetadataApprovalArtifactRecord[]>;
}

export interface GithubMetadataRunRepository {
  saveRun(record: GithubMetadataControlPlaneRun): Promise<GithubMetadataControlPlaneRun>;
  getRun(id: string): Promise<GithubMetadataControlPlaneRun | undefined>;
  listRuns(query?: GithubMetadataControlPlaneQuery): Promise<GithubMetadataControlPlaneRun[]>;
}

export interface GithubDraftPrDryRunRepository {
  saveDryRun(record: GithubDraftPrPlan): Promise<GithubDraftPrPlan>;
  getDryRun(id: string): Promise<GithubDraftPrPlan | undefined>;
  listDryRuns(query?: GithubDraftPrControlPlaneQuery): Promise<GithubDraftPrPlan[]>;
}

export interface GithubDraftPrApprovalRepository {
  saveApproval(
    record: GithubDraftPrApprovalArtifactRecord,
  ): Promise<GithubDraftPrApprovalArtifactRecord>;
  getApproval(id: string): Promise<GithubDraftPrApprovalArtifactRecord | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubDraftPrApprovalArtifactRecord | undefined>;
  listApprovals(
    query?: GithubDraftPrControlPlaneQuery,
  ): Promise<GithubDraftPrApprovalArtifactRecord[]>;
}

export interface GithubDraftPrRunRepository {
  saveRun(record: GithubDraftPrRun): Promise<GithubDraftPrRun>;
  getRun(id: string): Promise<GithubDraftPrRun | undefined>;
  listRuns(query?: GithubDraftPrControlPlaneQuery): Promise<GithubDraftPrRun[]>;
}

export interface GithubBranchPublishDryRunRepository {
  saveDryRun(record: GithubBranchPublishPlan): Promise<GithubBranchPublishPlan>;
  getDryRun(id: string): Promise<GithubBranchPublishPlan | undefined>;
  listDryRuns(query?: GithubBranchPublishControlPlaneQuery): Promise<GithubBranchPublishPlan[]>;
}

export interface GithubBranchPublishApprovalRepository {
  saveApproval(
    record: GithubBranchPublishApprovalArtifactRecord,
  ): Promise<GithubBranchPublishApprovalArtifactRecord>;
  getApproval(id: string): Promise<GithubBranchPublishApprovalArtifactRecord | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubBranchPublishApprovalArtifactRecord | undefined>;
  listApprovals(
    query?: GithubBranchPublishControlPlaneQuery,
  ): Promise<GithubBranchPublishApprovalArtifactRecord[]>;
}

export interface GithubBranchPublishRunRepository {
  saveRun(record: GithubBranchPublishRun): Promise<GithubBranchPublishRun>;
  getRun(id: string): Promise<GithubBranchPublishRun | undefined>;
  listRuns(query?: GithubBranchPublishControlPlaneQuery): Promise<GithubBranchPublishRun[]>;
}

export interface GithubPublishDraftPrChainDryRunRepository {
  saveDryRun(record: GithubPublishDraftPrChainPlan): Promise<GithubPublishDraftPrChainPlan>;
  getDryRun(id: string): Promise<GithubPublishDraftPrChainPlan | undefined>;
  listDryRuns(
    query?: GithubPublishDraftPrChainControlPlaneQuery,
  ): Promise<GithubPublishDraftPrChainPlan[]>;
}

export interface GithubPublishDraftPrChainRunRepository {
  saveRun(record: GithubPublishDraftPrChainRun): Promise<GithubPublishDraftPrChainRun>;
  getRun(id: string): Promise<GithubPublishDraftPrChainRun | undefined>;
  listRuns(
    query?: GithubPublishDraftPrChainControlPlaneQuery,
  ): Promise<GithubPublishDraftPrChainRun[]>;
}

export interface GithubPrLifecycleDryRunRepository {
  saveDryRun(
    record: GithubPrLifecycleObservationPlan,
  ): Promise<GithubPrLifecycleObservationPlan>;
  getDryRun(id: string): Promise<GithubPrLifecycleObservationPlan | undefined>;
  listDryRuns(
    query?: GithubPrLifecycleControlPlaneQuery,
  ): Promise<GithubPrLifecycleObservationPlan[]>;
}

export interface GithubPrLifecycleApprovalRepository {
  saveApproval(
    record: GithubPrLifecycleApprovalArtifactRecord,
  ): Promise<GithubPrLifecycleApprovalArtifactRecord>;
  getApproval(id: string): Promise<GithubPrLifecycleApprovalArtifactRecord | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubPrLifecycleApprovalArtifactRecord | undefined>;
  listApprovals(
    query?: GithubPrLifecycleControlPlaneQuery,
  ): Promise<GithubPrLifecycleApprovalArtifactRecord[]>;
}

export interface GithubPrLifecycleRunRepository {
  saveRun(
    record: GithubPrLifecycleObservationRun,
  ): Promise<GithubPrLifecycleObservationRun>;
  getRun(id: string): Promise<GithubPrLifecycleObservationRun | undefined>;
  listRuns(
    query?: GithubPrLifecycleControlPlaneQuery,
  ): Promise<GithubPrLifecycleObservationRun[]>;
}

export interface GithubPrManagementControlPlaneQuery {
  dryRunId?: string;
  status?: string;
  limit?: number;
}

export interface GithubPrManagementDryRunRepository {
  saveDryRun(record: GithubPrManagementPlan): Promise<GithubPrManagementPlan>;
  getDryRun(id: string): Promise<GithubPrManagementPlan | undefined>;
  listDryRuns(query?: GithubPrManagementControlPlaneQuery): Promise<GithubPrManagementPlan[]>;
}

export interface GithubPrManagementApprovalRepository {
  saveApproval(
    record: GithubPrManagementApprovalArtifactRecord,
  ): Promise<GithubPrManagementApprovalArtifactRecord>;
  getApproval(id: string): Promise<GithubPrManagementApprovalArtifactRecord | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubPrManagementApprovalArtifactRecord | undefined>;
  listApprovals(
    query?: GithubPrManagementControlPlaneQuery,
  ): Promise<GithubPrManagementApprovalArtifactRecord[]>;
}

export interface GithubPrManagementRunRepository {
  saveRun(record: GithubPrManagementRun): Promise<GithubPrManagementRun>;
  getRun(id: string): Promise<GithubPrManagementRun | undefined>;
  listRuns(query?: GithubPrManagementControlPlaneQuery): Promise<GithubPrManagementRun[]>;
}

export interface GithubMergeDryRunRepository {
  saveDryRun(record: GithubMergeReadinessPlan): Promise<GithubMergeReadinessPlan>;
  getDryRun(id: string): Promise<GithubMergeReadinessPlan | undefined>;
  listDryRuns(query?: GithubMergeControlPlaneQuery): Promise<GithubMergeReadinessPlan[]>;
}

export interface GithubMergeApprovalRepository {
  saveApproval(record: GithubMergeApprovalArtifact): Promise<GithubMergeApprovalArtifact>;
  getApproval(id: string): Promise<GithubMergeApprovalArtifact | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubMergeApprovalArtifact | undefined>;
  listApprovals(query?: GithubMergeControlPlaneQuery): Promise<GithubMergeApprovalArtifact[]>;
}

export interface GithubMergeRunRepository {
  saveRun(record: GithubMergeRun): Promise<GithubMergeRun>;
  getRun(id: string): Promise<GithubMergeRun | undefined>;
  listRuns(query?: GithubMergeControlPlaneQuery): Promise<GithubMergeRun[]>;
}

export interface GithubActionsObservationDryRunRepository {
  saveDryRun(record: GithubActionsObservationPlan): Promise<GithubActionsObservationPlan>;
  getDryRun(id: string): Promise<GithubActionsObservationPlan | undefined>;
  listDryRuns(
    query?: GithubActionsObservationControlPlaneQuery,
  ): Promise<GithubActionsObservationPlan[]>;
}

export interface GithubActionsObservationApprovalRepository {
  saveApproval(
    record: GithubActionsObservationApprovalArtifactRecord,
  ): Promise<GithubActionsObservationApprovalArtifactRecord>;
  getApproval(id: string): Promise<GithubActionsObservationApprovalArtifactRecord | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubActionsObservationApprovalArtifactRecord | undefined>;
  listApprovals(
    query?: GithubActionsObservationControlPlaneQuery,
  ): Promise<GithubActionsObservationApprovalArtifactRecord[]>;
}

export interface GithubActionsObservationRunRepository {
  saveRun(record: GithubActionsObservationRun): Promise<GithubActionsObservationRun>;
  getRun(id: string): Promise<GithubActionsObservationRun | undefined>;
  listRuns(
    query?: GithubActionsObservationControlPlaneQuery,
  ): Promise<GithubActionsObservationRun[]>;
}

export interface GithubActionsRunControlDryRunRepository {
  saveDryRun(record: GithubActionsRunControlPlan): Promise<GithubActionsRunControlPlan>;
  getDryRun(id: string): Promise<GithubActionsRunControlPlan | undefined>;
  listDryRuns(
    query?: GithubActionsRunControlControlPlaneQuery,
  ): Promise<GithubActionsRunControlPlan[]>;
}

export interface GithubActionsRunControlApprovalRepository {
  saveApproval(
    record: GithubActionsRunControlApprovalArtifact,
  ): Promise<GithubActionsRunControlApprovalArtifact>;
  getApproval(id: string): Promise<GithubActionsRunControlApprovalArtifact | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubActionsRunControlApprovalArtifact | undefined>;
  listApprovals(
    query?: GithubActionsRunControlControlPlaneQuery,
  ): Promise<GithubActionsRunControlApprovalArtifact[]>;
}

export interface GithubActionsRunControlRunRepository {
  saveRun(record: GithubActionsRunControlRun): Promise<GithubActionsRunControlRun>;
  getRun(id: string): Promise<GithubActionsRunControlRun | undefined>;
  listRuns(
    query?: GithubActionsRunControlControlPlaneQuery,
  ): Promise<GithubActionsRunControlRun[]>;
}

export interface GithubActionsDispatchDryRunRepository {
  saveDryRun(record: GithubActionsDispatchPlan): Promise<GithubActionsDispatchPlan>;
  getDryRun(id: string): Promise<GithubActionsDispatchPlan | undefined>;
  listDryRuns(
    query?: GithubActionsDispatchControlPlaneQuery,
  ): Promise<GithubActionsDispatchPlan[]>;
}

export interface GithubActionsDispatchApprovalRepository {
  saveApproval(
    record: GithubActionsDispatchApprovalArtifact,
  ): Promise<GithubActionsDispatchApprovalArtifact>;
  getApproval(id: string): Promise<GithubActionsDispatchApprovalArtifact | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubActionsDispatchApprovalArtifact | undefined>;
  listApprovals(
    query?: GithubActionsDispatchControlPlaneQuery,
  ): Promise<GithubActionsDispatchApprovalArtifact[]>;
}

export interface GithubActionsDispatchRunRepository {
  saveRun(record: GithubActionsDispatchRun): Promise<GithubActionsDispatchRun>;
  getRun(id: string): Promise<GithubActionsDispatchRun | undefined>;
  listRuns(query?: GithubActionsDispatchControlPlaneQuery): Promise<GithubActionsDispatchRun[]>;
}

export interface ReleaseVersionPlanDryRunRepository {
  saveDryRun(record: ReleaseVersionPlan): Promise<ReleaseVersionPlan>;
  getDryRun(id: string): Promise<ReleaseVersionPlan | undefined>;
  listDryRuns(query?: ReleaseVersionPlanControlPlaneQuery): Promise<ReleaseVersionPlan[]>;
}

export interface GithubReleaseTagDryRunRepository {
  saveDryRun(record: GithubReleaseTagPlan): Promise<GithubReleaseTagPlan>;
  getDryRun(id: string): Promise<GithubReleaseTagPlan | undefined>;
  listDryRuns(query?: GithubReleaseTagControlPlaneQuery): Promise<GithubReleaseTagPlan[]>;
}

export interface GithubReleaseTagApprovalRepository {
  saveApproval(record: GithubReleaseTagApprovalArtifact): Promise<GithubReleaseTagApprovalArtifact>;
  getApproval(id: string): Promise<GithubReleaseTagApprovalArtifact | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubReleaseTagApprovalArtifact | undefined>;
  listApprovals(
    query?: GithubReleaseTagControlPlaneQuery,
  ): Promise<GithubReleaseTagApprovalArtifact[]>;
}

export interface GithubReleaseTagRunRepository {
  saveRun(record: GithubReleaseTagRun): Promise<GithubReleaseTagRun>;
  getRun(id: string): Promise<GithubReleaseTagRun | undefined>;
  listRuns(query?: GithubReleaseTagControlPlaneQuery): Promise<GithubReleaseTagRun[]>;
}

export interface GithubReleaseDraftDryRunRepository {
  saveDryRun(record: GithubReleaseDraftPlan): Promise<GithubReleaseDraftPlan>;
  getDryRun(id: string): Promise<GithubReleaseDraftPlan | undefined>;
  listDryRuns(query?: GithubReleaseDraftControlPlaneQuery): Promise<GithubReleaseDraftPlan[]>;
}

export interface GithubReleaseDraftApprovalRepository {
  saveApproval(
    record: GithubReleaseDraftApprovalArtifact,
  ): Promise<GithubReleaseDraftApprovalArtifact>;
  getApproval(id: string): Promise<GithubReleaseDraftApprovalArtifact | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubReleaseDraftApprovalArtifact | undefined>;
  listApprovals(
    query?: GithubReleaseDraftControlPlaneQuery,
  ): Promise<GithubReleaseDraftApprovalArtifact[]>;
}

export interface GithubReleaseDraftRunRepository {
  saveRun(record: GithubReleaseDraftRun): Promise<GithubReleaseDraftRun>;
  getRun(id: string): Promise<GithubReleaseDraftRun | undefined>;
  listRuns(query?: GithubReleaseDraftControlPlaneQuery): Promise<GithubReleaseDraftRun[]>;
}

export interface DeploymentObservationDryRunRepository {
  saveDryRun(record: DeploymentObservationPlan): Promise<DeploymentObservationPlan>;
  getDryRun(id: string): Promise<DeploymentObservationPlan | undefined>;
  listDryRuns(
    query?: DeploymentObservationControlPlaneQuery,
  ): Promise<DeploymentObservationPlan[]>;
}

export interface DeploymentObservationApprovalRepository {
  saveApproval(
    record: DeploymentObservationApprovalArtifact,
  ): Promise<DeploymentObservationApprovalArtifact>;
  getApproval(id: string): Promise<DeploymentObservationApprovalArtifact | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<DeploymentObservationApprovalArtifact | undefined>;
  listApprovals(
    query?: DeploymentObservationControlPlaneQuery,
  ): Promise<DeploymentObservationApprovalArtifact[]>;
}

export interface DeploymentObservationRunRepository {
  saveRun(record: DeploymentObservationRun): Promise<DeploymentObservationRun>;
  getRun(id: string): Promise<DeploymentObservationRun | undefined>;
  listRuns(query?: DeploymentObservationControlPlaneQuery): Promise<DeploymentObservationRun[]>;
}

export interface DeploymentOperationDryRunRepository {
  saveDryRun(record: DeploymentOperationPlan): Promise<DeploymentOperationPlan>;
  getDryRun(id: string): Promise<DeploymentOperationPlan | undefined>;
  listDryRuns(query?: DeploymentOperationControlPlaneQuery): Promise<DeploymentOperationPlan[]>;
}

export interface DeploymentOperationApprovalRepository {
  saveApproval(record: DeploymentOperationApprovalArtifact): Promise<DeploymentOperationApprovalArtifact>;
  getApproval(id: string): Promise<DeploymentOperationApprovalArtifact | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<DeploymentOperationApprovalArtifact | undefined>;
  listApprovals(
    query?: DeploymentOperationControlPlaneQuery,
  ): Promise<DeploymentOperationApprovalArtifact[]>;
}

export interface DeploymentRollbackPlanRepository {
  saveRollbackPlan(record: DeploymentRollbackPlan): Promise<DeploymentRollbackPlan>;
  getRollbackPlan(id: string): Promise<DeploymentRollbackPlan | undefined>;
  listRollbackPlans(
    query?: DeploymentOperationControlPlaneQuery,
  ): Promise<DeploymentRollbackPlan[]>;
}

export interface DeploymentOperationRunRepository {
  saveRun(record: DeploymentOperationRun): Promise<DeploymentOperationRun>;
  getRun(id: string): Promise<DeploymentOperationRun | undefined>;
  listRuns(query?: DeploymentOperationControlPlaneQuery): Promise<DeploymentOperationRun[]>;
}

export interface SecretReadinessDryRunRepository {
  saveDryRun(record: SecretReadinessPlan): Promise<SecretReadinessPlan>;
  getDryRun(id: string): Promise<SecretReadinessPlan | undefined>;
  listDryRuns(query?: SecretReadinessControlPlaneQuery): Promise<SecretReadinessPlan[]>;
}

export interface SecretReadinessApprovalRepository {
  saveApproval(record: SecretReadinessApprovalArtifact): Promise<SecretReadinessApprovalArtifact>;
  getApproval(id: string): Promise<SecretReadinessApprovalArtifact | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<SecretReadinessApprovalArtifact | undefined>;
  listApprovals(
    query?: SecretReadinessControlPlaneQuery,
  ): Promise<SecretReadinessApprovalArtifact[]>;
}

export interface SecretReadinessRunRepository {
  saveRun(record: SecretReadinessRun): Promise<SecretReadinessRun>;
  getRun(id: string): Promise<SecretReadinessRun | undefined>;
  listRuns(query?: SecretReadinessControlPlaneQuery): Promise<SecretReadinessRun[]>;
}

export interface SecretLeakAuditSummaryRepository {
  saveLeakAuditSummary(record: SecretLeakAuditSummary): Promise<SecretLeakAuditSummary>;
  getLeakAuditSummary(id: string): Promise<SecretLeakAuditSummary | undefined>;
  listLeakAuditSummaries(
    query?: SecretReadinessControlPlaneQuery,
  ): Promise<SecretLeakAuditSummary[]>;
}

export interface RealPolicyBackendDryRunRepository {
  saveDryRun(record: RealPolicyBackendEvaluationPlan): Promise<RealPolicyBackendEvaluationPlan>;
  getDryRun(id: string): Promise<RealPolicyBackendEvaluationPlan | undefined>;
  listDryRuns(
    query?: RealPolicyBackendControlPlaneQuery,
  ): Promise<RealPolicyBackendEvaluationPlan[]>;
}

export interface RealPolicyBackendApprovalRepository {
  saveApproval(
    record: RealPolicyBackendApprovalArtifact,
  ): Promise<RealPolicyBackendApprovalArtifact>;
  getApproval(id: string): Promise<RealPolicyBackendApprovalArtifact | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<RealPolicyBackendApprovalArtifact | undefined>;
  listApprovals(
    query?: RealPolicyBackendControlPlaneQuery,
  ): Promise<RealPolicyBackendApprovalArtifact[]>;
}

export interface RealPolicyBackendRunRepository {
  saveRun(record: RealPolicyBackendEvaluationRun): Promise<RealPolicyBackendEvaluationRun>;
  getRun(id: string): Promise<RealPolicyBackendEvaluationRun | undefined>;
  listRuns(query?: RealPolicyBackendControlPlaneQuery): Promise<RealPolicyBackendEvaluationRun[]>;
}

export interface RealTelemetryExportDryRunRepository {
  saveDryRun(record: RealTelemetryExportPlan): Promise<RealTelemetryExportPlan>;
  getDryRun(id: string): Promise<RealTelemetryExportPlan | undefined>;
  listDryRuns(query?: RealTelemetryExportControlPlaneQuery): Promise<RealTelemetryExportPlan[]>;
}

export interface RealTelemetryExportApprovalRepository {
  saveApproval(record: RealTelemetryExportApprovalArtifact): Promise<RealTelemetryExportApprovalArtifact>;
  getApproval(id: string): Promise<RealTelemetryExportApprovalArtifact | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<RealTelemetryExportApprovalArtifact | undefined>;
  listApprovals(
    query?: RealTelemetryExportControlPlaneQuery,
  ): Promise<RealTelemetryExportApprovalArtifact[]>;
}

export interface RealTelemetryExportRunRepository {
  saveRun(record: RealTelemetryExportRun): Promise<RealTelemetryExportRun>;
  getRun(id: string): Promise<RealTelemetryExportRun | undefined>;
  listRuns(query?: RealTelemetryExportControlPlaneQuery): Promise<RealTelemetryExportRun[]>;
}

export interface BrowserActionDryRunRepository {
  saveDryRun(record: BrowserActionPlan): Promise<BrowserActionPlan>;
  getDryRun(id: string): Promise<BrowserActionPlan | undefined>;
  listDryRuns(query?: BrowserActionControlPlaneQuery): Promise<BrowserActionPlan[]>;
}

export interface BrowserActionApprovalRepository {
  saveApproval(record: BrowserActionApprovalArtifact): Promise<BrowserActionApprovalArtifact>;
  getApproval(id: string): Promise<BrowserActionApprovalArtifact | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<BrowserActionApprovalArtifact | undefined>;
  listApprovals(query?: BrowserActionControlPlaneQuery): Promise<BrowserActionApprovalArtifact[]>;
}

export interface BrowserActionRunRepository {
  saveRun(record: BrowserActionRun): Promise<BrowserActionRun>;
  getRun(id: string): Promise<BrowserActionRun | undefined>;
  listRuns(query?: BrowserActionControlPlaneQuery): Promise<BrowserActionRun[]>;
}

export interface ElectronMainInspectorDryRunRepository {
  saveDryRun(record: ElectronMainInspectorPlan): Promise<ElectronMainInspectorPlan>;
  getDryRun(id: string): Promise<ElectronMainInspectorPlan | undefined>;
  listDryRuns(
    query?: ElectronMainInspectorControlPlaneQuery,
  ): Promise<ElectronMainInspectorPlan[]>;
}

export interface ElectronMainInspectorApprovalRepository {
  saveApproval(
    record: ElectronMainInspectorApprovalArtifact,
  ): Promise<ElectronMainInspectorApprovalArtifact>;
  getApproval(id: string): Promise<ElectronMainInspectorApprovalArtifact | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<ElectronMainInspectorApprovalArtifact | undefined>;
  listApprovals(
    query?: ElectronMainInspectorControlPlaneQuery,
  ): Promise<ElectronMainInspectorApprovalArtifact[]>;
}

export interface ElectronMainInspectorRunRepository {
  saveRun(record: ElectronMainInspectorRun): Promise<ElectronMainInspectorRun>;
  getRun(id: string): Promise<ElectronMainInspectorRun | undefined>;
  listRuns(query?: ElectronMainInspectorControlPlaneQuery): Promise<ElectronMainInspectorRun[]>;
}

export interface McpWriteToolDryRunRepository {
  saveDryRun(record: McpWriteToolPlan): Promise<McpWriteToolPlan>;
  getDryRun(id: string): Promise<McpWriteToolPlan | undefined>;
  listDryRuns(query?: McpWriteToolControlPlaneQuery): Promise<McpWriteToolPlan[]>;
}

export interface McpWriteToolApprovalRepository {
  saveApproval(record: McpWriteToolApprovalArtifact): Promise<McpWriteToolApprovalArtifact>;
  getApproval(id: string): Promise<McpWriteToolApprovalArtifact | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<McpWriteToolApprovalArtifact | undefined>;
  listApprovals(query?: McpWriteToolControlPlaneQuery): Promise<McpWriteToolApprovalArtifact[]>;
}

export interface McpWriteToolRunRepository {
  saveRun(record: McpWriteToolRun): Promise<McpWriteToolRun>;
  getRun(id: string): Promise<McpWriteToolRun | undefined>;
  listRuns(query?: McpWriteToolControlPlaneQuery): Promise<McpWriteToolRun[]>;
}

export interface RuntimeJobPlanRepository {
  saveJobPlan(record: RuntimeJobPlan): Promise<RuntimeJobPlan>;
  getJobPlan(id: string): Promise<RuntimeJobPlan | undefined>;
  listJobPlans(query?: RuntimeOperationsControlPlaneQuery): Promise<RuntimeJobPlan[]>;
}

export interface RuntimeQueueEntryRepository {
  saveQueueEntry(record: RuntimeQueueEntry): Promise<RuntimeQueueEntry>;
  getQueueEntry(id: string): Promise<RuntimeQueueEntry | undefined>;
  listQueueEntries(query?: RuntimeOperationsControlPlaneQuery): Promise<RuntimeQueueEntry[]>;
}

export interface RuntimeLeaseRepository {
  saveLease(record: RuntimeLease): Promise<RuntimeLease>;
  getLease(id: string): Promise<RuntimeLease | undefined>;
  listLeases(query?: RuntimeOperationsControlPlaneQuery): Promise<RuntimeLease[]>;
}

export interface RuntimeLockRepository {
  saveLock(record: RuntimeLock): Promise<RuntimeLock>;
  getLock(id: string): Promise<RuntimeLock | undefined>;
  listLocks(query?: RuntimeOperationsControlPlaneQuery): Promise<RuntimeLock[]>;
}

export interface RuntimeCheckpointRepository {
  saveCheckpoint(record: RuntimeCheckpoint): Promise<RuntimeCheckpoint>;
  getCheckpoint(id: string): Promise<RuntimeCheckpoint | undefined>;
  listCheckpoints(query?: RuntimeOperationsControlPlaneQuery): Promise<RuntimeCheckpoint[]>;
}

export interface RuntimeJobRunRepository {
  saveRun(record: RuntimeJobRun): Promise<RuntimeJobRun>;
  getRun(id: string): Promise<RuntimeJobRun | undefined>;
  listRuns(query?: RuntimeOperationsControlPlaneQuery): Promise<RuntimeJobRun[]>;
}

export interface MultiAgentCoordinationPlanRepository {
  saveCoordinationPlan(record: MultiAgentCoordinationPlan): Promise<MultiAgentCoordinationPlan>;
  getCoordinationPlan(id: string): Promise<MultiAgentCoordinationPlan | undefined>;
  listCoordinationPlans(
    query?: RuntimeOperationsControlPlaneQuery,
  ): Promise<MultiAgentCoordinationPlan[]>;
}

export interface MultiAgentSlotSummaryRepository {
  saveSlotSummary(record: MultiAgentSlotSummary): Promise<MultiAgentSlotSummary>;
  getSlotSummary(id: string): Promise<MultiAgentSlotSummary | undefined>;
  listSlotSummaries(query?: RuntimeOperationsControlPlaneQuery): Promise<MultiAgentSlotSummary[]>;
}

export interface ExternalAgentDryRunRepository {
  saveDryRun(record: ExternalAgentPatchPlan): Promise<ExternalAgentPatchPlan>;
  getDryRun(id: string): Promise<ExternalAgentPatchPlan | undefined>;
  listDryRuns(query?: ExternalAgentControlPlaneQuery): Promise<ExternalAgentPatchPlan[]>;
}

export interface ExternalAgentApprovalRepository {
  saveApproval(record: ExternalAgentApprovalArtifact): Promise<ExternalAgentApprovalArtifact>;
  getApproval(id: string): Promise<ExternalAgentApprovalArtifact | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<ExternalAgentApprovalArtifact | undefined>;
  listApprovals(query?: ExternalAgentControlPlaneQuery): Promise<ExternalAgentApprovalArtifact[]>;
}

export interface ExternalAgentRunRepository {
  saveRun(record: ExternalAgentRun): Promise<ExternalAgentRun>;
  getRun(id: string): Promise<ExternalAgentRun | undefined>;
  listRuns(query?: ExternalAgentControlPlaneQuery): Promise<ExternalAgentRun[]>;
}

export interface ExternalAgentPatchSummaryRepository {
  savePatchSummary(record: ExternalAgentPatchSummary): Promise<ExternalAgentPatchSummary>;
  getPatchSummary(id: string): Promise<ExternalAgentPatchSummary | undefined>;
  listPatchSummaries(
    query?: ExternalAgentControlPlaneQuery,
  ): Promise<ExternalAgentPatchSummary[]>;
}

export interface PlatformOperationApprovalRepository {
  saveApproval(
    record: PlatformOperationApprovalArtifact,
  ): Promise<PlatformOperationApprovalArtifact>;
  getApproval(id: string): Promise<PlatformOperationApprovalArtifact | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<PlatformOperationApprovalArtifact | undefined>;
  listApprovals(
    query?: PlatformOperationsControlPlaneQuery,
  ): Promise<PlatformOperationApprovalArtifact[]>;
}

export interface PlatformBackupPlanRepository {
  saveBackupPlan(record: PlatformBackupPlan): Promise<PlatformBackupPlan>;
  getBackupPlan(id: string): Promise<PlatformBackupPlan | undefined>;
  listBackupPlans(query?: PlatformOperationsControlPlaneQuery): Promise<PlatformBackupPlan[]>;
}

export interface PlatformBackupRunRepository {
  saveRun(record: PlatformBackupRun): Promise<PlatformBackupRun>;
  getRun(id: string): Promise<PlatformBackupRun | undefined>;
  listRuns(query?: PlatformOperationsControlPlaneQuery): Promise<PlatformBackupRun[]>;
}

export interface PlatformRestorePlanRepository {
  saveRestorePlan(record: PlatformRestorePlan): Promise<PlatformRestorePlan>;
  getRestorePlan(id: string): Promise<PlatformRestorePlan | undefined>;
  listRestorePlans(query?: PlatformOperationsControlPlaneQuery): Promise<PlatformRestorePlan[]>;
}

export interface PlatformRestoreRunRepository {
  saveRun(record: PlatformRestoreRun): Promise<PlatformRestoreRun>;
  getRun(id: string): Promise<PlatformRestoreRun | undefined>;
  listRuns(query?: PlatformOperationsControlPlaneQuery): Promise<PlatformRestoreRun[]>;
}

export interface StoreMigrationPlanRepository {
  saveMigrationPlan(record: StoreMigrationPlan): Promise<StoreMigrationPlan>;
  getMigrationPlan(id: string): Promise<StoreMigrationPlan | undefined>;
  listMigrationPlans(
    query?: PlatformOperationsControlPlaneQuery,
  ): Promise<StoreMigrationPlan[]>;
}

export interface StoreMigrationRunRepository {
  saveRun(record: StoreMigrationRun): Promise<StoreMigrationRun>;
  getRun(id: string): Promise<StoreMigrationRun | undefined>;
  listRuns(query?: PlatformOperationsControlPlaneQuery): Promise<StoreMigrationRun[]>;
}

export interface RetentionPolicyPlanRepository {
  saveRetentionPlan(record: RetentionPolicyPlan): Promise<RetentionPolicyPlan>;
  getRetentionPlan(id: string): Promise<RetentionPolicyPlan | undefined>;
  listRetentionPlans(
    query?: PlatformOperationsControlPlaneQuery,
  ): Promise<RetentionPolicyPlan[]>;
}

export interface RetentionPolicyRunRepository {
  saveRun(record: RetentionPolicyRun): Promise<RetentionPolicyRun>;
  getRun(id: string): Promise<RetentionPolicyRun | undefined>;
  listRuns(query?: PlatformOperationsControlPlaneQuery): Promise<RetentionPolicyRun[]>;
}

export interface AuditExportPlanRepository {
  saveAuditExportPlan(record: AuditExportPlan): Promise<AuditExportPlan>;
  getAuditExportPlan(id: string): Promise<AuditExportPlan | undefined>;
  listAuditExportPlans(query?: PlatformOperationsControlPlaneQuery): Promise<AuditExportPlan[]>;
}

export interface AuditExportRunRepository {
  saveRun(record: AuditExportRun): Promise<AuditExportRun>;
  getRun(id: string): Promise<AuditExportRun | undefined>;
  listRuns(query?: PlatformOperationsControlPlaneQuery): Promise<AuditExportRun[]>;
}

export interface OperatorRoleAssignmentPlanRepository {
  saveRoleAssignmentPlan(
    record: OperatorRoleAssignmentPlan,
  ): Promise<OperatorRoleAssignmentPlan>;
  getRoleAssignmentPlan(id: string): Promise<OperatorRoleAssignmentPlan | undefined>;
  listRoleAssignmentPlans(
    query?: PlatformOperationsControlPlaneQuery,
  ): Promise<OperatorRoleAssignmentPlan[]>;
}

export interface OperatorRoleAssignmentRunRepository {
  saveRun(record: OperatorRoleAssignmentRun): Promise<OperatorRoleAssignmentRun>;
  getRun(id: string): Promise<OperatorRoleAssignmentRun | undefined>;
  listRuns(query?: PlatformOperationsControlPlaneQuery): Promise<OperatorRoleAssignmentRun[]>;
}

export interface DisasterRecoveryRehearsalRunRepository {
  saveRehearsalRun(record: DisasterRecoveryRehearsalRun): Promise<DisasterRecoveryRehearsalRun>;
  getRehearsalRun(id: string): Promise<DisasterRecoveryRehearsalRun | undefined>;
  listRehearsalRuns(
    query?: PlatformOperationsControlPlaneQuery,
  ): Promise<DisasterRecoveryRehearsalRun[]>;
}

export interface ProductionGaDryRunRepository {
  saveDryRun(record: ProductionGaReadinessPlan): Promise<ProductionGaReadinessPlan>;
  getDryRun(id: string): Promise<ProductionGaReadinessPlan | undefined>;
  listDryRuns(query?: ProductionGaControlPlaneQuery): Promise<ProductionGaReadinessPlan[]>;
}

export interface ProductionGaApprovalRepository {
  saveApproval(record: ProductionGaApprovalArtifact): Promise<ProductionGaApprovalArtifact>;
  getApproval(id: string): Promise<ProductionGaApprovalArtifact | undefined>;
  getApprovalByArtifactId(id: string): Promise<ProductionGaApprovalArtifact | undefined>;
  listApprovals(query?: ProductionGaControlPlaneQuery): Promise<ProductionGaApprovalArtifact[]>;
}

export interface ProductionGaSignoffPlanRepository {
  saveSignoffPlan(
    record: ProductionGaReleaseCandidateSignoffPlan,
  ): Promise<ProductionGaReleaseCandidateSignoffPlan>;
  getSignoffPlan(id: string): Promise<ProductionGaReleaseCandidateSignoffPlan | undefined>;
  listSignoffPlans(
    query?: ProductionGaControlPlaneQuery,
  ): Promise<ProductionGaReleaseCandidateSignoffPlan[]>;
}

export interface ProductionGaSignoffRunRepository {
  saveRun(record: ProductionGaSignoffRun): Promise<ProductionGaSignoffRun>;
  getRun(id: string): Promise<ProductionGaSignoffRun | undefined>;
  listRuns(query?: ProductionGaControlPlaneQuery): Promise<ProductionGaSignoffRun[]>;
}

export interface ProductionGaE2ERehearsalRunRepository {
  saveRehearsalRun(record: ProductionGaE2ERehearsalRun): Promise<ProductionGaE2ERehearsalRun>;
  getRehearsalRun(id: string): Promise<ProductionGaE2ERehearsalRun | undefined>;
  listRehearsalRuns(
    query?: ProductionGaControlPlaneQuery,
  ): Promise<ProductionGaE2ERehearsalRun[]>;
}

export interface ProductionGaTrainingCompletionRepository {
  saveTrainingCompletion(
    record: ProductionGaOperatorTrainingCompletionSummary,
  ): Promise<ProductionGaOperatorTrainingCompletionSummary>;
  getTrainingCompletion(
    id: string,
  ): Promise<ProductionGaOperatorTrainingCompletionSummary | undefined>;
  listTrainingCompletions(
    query?: ProductionGaControlPlaneQuery,
  ): Promise<ProductionGaOperatorTrainingCompletionSummary[]>;
}

export interface ProductionGaThreatModelRepository {
  saveThreatModel(record: ProductionGaThreatModel): Promise<ProductionGaThreatModel>;
  getThreatModel(id: string): Promise<ProductionGaThreatModel | undefined>;
  listThreatModels(query?: ProductionGaControlPlaneQuery): Promise<ProductionGaThreatModel[]>;
}

export interface ProductionGaResidualRiskRegisterRepository {
  saveResidualRiskRegister(
    record: ProductionGaResidualRiskRegister,
  ): Promise<ProductionGaResidualRiskRegister>;
  getResidualRiskRegister(id: string): Promise<ProductionGaResidualRiskRegister | undefined>;
  listResidualRiskRegisters(
    query?: ProductionGaControlPlaneQuery,
  ): Promise<ProductionGaResidualRiskRegister[]>;
}

export interface GithubRemoteCleanupDryRunRepository {
  saveDryRun(record: GithubRemoteCleanupPlan): Promise<GithubRemoteCleanupPlan>;
  getDryRun(id: string): Promise<GithubRemoteCleanupPlan | undefined>;
  listDryRuns(
    query?: GithubRemoteCleanupControlPlaneQuery,
  ): Promise<GithubRemoteCleanupPlan[]>;
}

export interface GithubRemoteCleanupApprovalRepository {
  saveApproval(
    record: GithubRemoteCleanupApprovalArtifactRecord,
  ): Promise<GithubRemoteCleanupApprovalArtifactRecord>;
  getApproval(id: string): Promise<GithubRemoteCleanupApprovalArtifactRecord | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<GithubRemoteCleanupApprovalArtifactRecord | undefined>;
  listApprovals(
    query?: GithubRemoteCleanupControlPlaneQuery,
  ): Promise<GithubRemoteCleanupApprovalArtifactRecord[]>;
}

export interface GithubRemoteCleanupRunRepository {
  saveRun(record: GithubRemoteCleanupRun): Promise<GithubRemoteCleanupRun>;
  getRun(id: string): Promise<GithubRemoteCleanupRun | undefined>;
  listRuns(
    query?: GithubRemoteCleanupControlPlaneQuery,
  ): Promise<GithubRemoteCleanupRun[]>;
}

export interface ReworkLoopDryRunRepository {
  saveDryRun(record: ReworkLoopPlan): Promise<ReworkLoopPlan>;
  getDryRun(id: string): Promise<ReworkLoopPlan | undefined>;
  listDryRuns(query?: ReworkLoopControlPlaneQuery): Promise<ReworkLoopPlan[]>;
}

export interface ReworkLoopApprovalRepository {
  saveApproval(
    record: ReworkLoopApprovalArtifactRecord,
  ): Promise<ReworkLoopApprovalArtifactRecord>;
  getApproval(id: string): Promise<ReworkLoopApprovalArtifactRecord | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<ReworkLoopApprovalArtifactRecord | undefined>;
  listApprovals(
    query?: ReworkLoopControlPlaneQuery,
  ): Promise<ReworkLoopApprovalArtifactRecord[]>;
}

export interface ReworkLoopRunRepository {
  saveRun(record: ReworkLoopRun): Promise<ReworkLoopRun>;
  getRun(id: string): Promise<ReworkLoopRun | undefined>;
  listRuns(query?: ReworkLoopControlPlaneQuery): Promise<ReworkLoopRun[]>;
}

export interface CustomWorkflowDryRunRepository {
  saveDryRun(record: CustomWorkflowPlan): Promise<CustomWorkflowPlan>;
  getDryRun(id: string): Promise<CustomWorkflowPlan | undefined>;
  listDryRuns(query?: CustomWorkflowControlPlaneQuery): Promise<CustomWorkflowPlan[]>;
}

export interface CustomWorkflowApprovalRepository {
  saveApproval(
    record: CustomWorkflowApprovalArtifactRecord,
  ): Promise<CustomWorkflowApprovalArtifactRecord>;
  getApproval(id: string): Promise<CustomWorkflowApprovalArtifactRecord | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<CustomWorkflowApprovalArtifactRecord | undefined>;
  listApprovals(
    query?: CustomWorkflowControlPlaneQuery,
  ): Promise<CustomWorkflowApprovalArtifactRecord[]>;
}

export interface CustomWorkflowRunRepository {
  saveRun(record: CustomWorkflowRun): Promise<CustomWorkflowRun>;
  getRun(id: string): Promise<CustomWorkflowRun | undefined>;
  listRuns(query?: CustomWorkflowControlPlaneQuery): Promise<CustomWorkflowRun[]>;
}

export interface ProductionWorkflowRecoveryDryRunRepository {
  saveDryRun(record: ProductionWorkflowRecoveryPlan): Promise<ProductionWorkflowRecoveryPlan>;
  getDryRun(id: string): Promise<ProductionWorkflowRecoveryPlan | undefined>;
  listDryRuns(
    query?: ProductionWorkflowRecoveryControlPlaneQuery,
  ): Promise<ProductionWorkflowRecoveryPlan[]>;
}

export interface ProductionWorkflowRecoveryApprovalRepository {
  saveApproval(
    record: ProductionWorkflowRecoveryApprovalArtifact,
  ): Promise<ProductionWorkflowRecoveryApprovalArtifact>;
  getApproval(id: string): Promise<ProductionWorkflowRecoveryApprovalArtifact | undefined>;
  getApprovalByArtifactId(
    approvalArtifactId: string,
  ): Promise<ProductionWorkflowRecoveryApprovalArtifact | undefined>;
  listApprovals(
    query?: ProductionWorkflowRecoveryControlPlaneQuery,
  ): Promise<ProductionWorkflowRecoveryApprovalArtifact[]>;
}

export interface ProductionWorkflowRecoveryRunRepository {
  saveRun(record: ProductionWorkflowRecoveryRun): Promise<ProductionWorkflowRecoveryRun>;
  getRun(id: string): Promise<ProductionWorkflowRecoveryRun | undefined>;
  listRuns(
    query?: ProductionWorkflowRecoveryControlPlaneQuery,
  ): Promise<ProductionWorkflowRecoveryRun[]>;
}

export interface ProductionWorkflowRecoveryChildActionStateRepository {
  saveChildActionState(
    record: ProductionWorkflowChildActionStateRecord,
  ): Promise<ProductionWorkflowChildActionStateRecord>;
  getChildActionState(id: string): Promise<ProductionWorkflowChildActionStateRecord | undefined>;
  listChildActionStates(
    query?: ProductionWorkflowRecoveryControlPlaneQuery,
  ): Promise<ProductionWorkflowChildActionStateRecord[]>;
}

export interface CodexPatchChildRecordRepository {
  saveRecord(record: CodexPatchChildRecord): Promise<CodexPatchChildRecord>;
  getRecord(id: string): Promise<CodexPatchChildRecord | undefined>;
  listRecords(
    query?: LocalProductionWorkflowChildRecordQuery,
  ): Promise<CodexPatchChildRecord[]>;
}

export interface NxVerificationChildRecordRepository {
  saveRecord(record: NxVerificationChildRecord): Promise<NxVerificationChildRecord>;
  getRecord(id: string): Promise<NxVerificationChildRecord | undefined>;
  listRecords(
    query?: LocalProductionWorkflowChildRecordQuery,
  ): Promise<NxVerificationChildRecord[]>;
}

export interface CodexReportReviewRepository {
  saveReportReview(record: CodexExecReportReviewRecord): Promise<CodexExecReportReviewRecord>;
  getReportReview(id: string): Promise<CodexExecReportReviewRecord | undefined>;
  listReportReviews(
    query?: Partial<CodexExecReportReviewQuery>,
  ): Promise<CodexExecReportReviewRecord[]>;
}

export interface CodexExecLiveAdapterAdrDecisionRepository {
  saveDecision(
    record: CodexExecLiveAdapterAdrDecisionRecord,
  ): Promise<CodexExecLiveAdapterAdrDecisionRecord>;
  getDecision(id: string): Promise<CodexExecLiveAdapterAdrDecisionRecord | undefined>;
  listDecisions(
    query?: Partial<CodexExecLiveAdapterAdrDecisionQuery>,
  ): Promise<CodexExecLiveAdapterAdrDecisionRecord[]>;
}

export interface CodexExecReadOnlyAdapterSimulatorReviewRepository {
  saveSimulatorReview(
    record: CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord,
  ): Promise<CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord>;
  getSimulatorReview(
    id: string,
  ): Promise<CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord | undefined>;
  listSimulatorReviews(
    query?: Partial<CodexExecReadOnlyAdapterSimulatorReviewQuery>,
  ): Promise<CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord[]>;
}

export interface CodexExecReadOnlyAdapterImplementationPlanReviewRepository {
  saveImplementationPlanReview(
    record: CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord,
  ): Promise<CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord>;
  getImplementationPlanReview(
    id: string,
  ): Promise<CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord | undefined>;
  listImplementationPlanReviews(
    query?: Partial<CodexExecReadOnlyAdapterImplementationPlanReviewQuery>,
  ): Promise<CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord[]>;
}

export interface CodexExecReadOnlyAdapterSkeletonReviewRepository {
  saveSkeletonReview(
    record: CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord,
  ): Promise<CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord>;
  getSkeletonReview(
    id: string,
  ): Promise<CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord | undefined>;
  listSkeletonReviews(
    query?: Partial<CodexExecReadOnlyAdapterSkeletonReviewQuery>,
  ): Promise<CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord[]>;
}

export interface CodexExecReadOnlyAdapterFinalReadinessRepository {
  saveFinalReadiness(
    record: CodexExecReadOnlyAdapterFinalReadinessDecisionRecord,
  ): Promise<CodexExecReadOnlyAdapterFinalReadinessDecisionRecord>;
  getFinalReadiness(
    id: string,
  ): Promise<CodexExecReadOnlyAdapterFinalReadinessDecisionRecord | undefined>;
  listFinalReadinessRecords(
    query?: Partial<CodexExecReadOnlyAdapterFinalReadinessQuery>,
  ): Promise<CodexExecReadOnlyAdapterFinalReadinessDecisionRecord[]>;
}

export interface CodexExecRealReadOnlyAdapterReadinessRepository {
  saveReadinessPackage(
    record: CodexExecRealReadOnlyAdapterReadinessPackage,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessPackage>;
  getReadinessPackage(
    id: string,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessPackage | undefined>;
  listReadinessPackages(
    query?: Partial<CodexExecRealReadOnlyAdapterReadinessQuery>,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessPackage[]>;
  latestReadinessPackage(
    dryRunId: string,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessPackage | undefined>;
}

export interface CodexExecRealReadOnlyAdapterReadinessReviewRepository {
  saveReadinessReview(
    record: CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord>;
  getReadinessReview(
    id: string,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord | undefined>;
  listReadinessReviews(
    query?: Partial<CodexExecRealReadOnlyAdapterReadinessReviewQuery>,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord[]>;
  latestReadinessReview(
    dryRunId: string,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord | undefined>;
}

export interface CodexExecRealReadOnlyAdapterAttemptRepository {
  saveAttempt(
    record: CodexExecRealReadOnlyAdapterAttemptRecord,
  ): Promise<CodexExecRealReadOnlyAdapterAttemptRecord>;
  getAttempt(id: string): Promise<CodexExecRealReadOnlyAdapterAttemptRecord | undefined>;
  listAttempts(
    query?: Partial<CodexExecRealReadOnlyAdapterAttemptQuery>,
  ): Promise<CodexExecRealReadOnlyAdapterAttemptRecord[]>;
  latestAttempt(dryRunId: string): Promise<CodexExecRealReadOnlyAdapterAttemptRecord | undefined>;
}

export interface CodexExecRealReadOnlyAdapterPolicySourceRepository {
  savePolicySource(
    record: CodexExecRealReadOnlyAdapterPolicySourceRecord,
  ): Promise<CodexExecRealReadOnlyAdapterPolicySourceRecord>;
  getPolicySource(id: string): Promise<CodexExecRealReadOnlyAdapterPolicySourceRecord | undefined>;
  listPolicySources(
    query?: Partial<CodexExecRealReadOnlyAdapterPolicySourceQuery>,
  ): Promise<CodexExecRealReadOnlyAdapterPolicySourceRecord[]>;
  latestPolicySource(
    dryRunId: string,
  ): Promise<CodexExecRealReadOnlyAdapterPolicySourceRecord | undefined>;
}

export interface CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRepository {
  saveApprovalAuthorityTrace(
    record: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord,
  ): Promise<CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord>;
  getApprovalAuthorityTrace(
    id: string,
  ): Promise<CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord | undefined>;
  listApprovalAuthorityTraces(
    query?: Partial<CodexExecRealReadOnlyAdapterApprovalAuthorityTraceQuery>,
  ): Promise<CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord[]>;
  latestApprovalAuthorityTrace(
    dryRunId: string,
  ): Promise<CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord | undefined>;
}

export interface CodexExecRealReadOnlyAdapterPilotPrerequisiteRepository {
  savePilotPrerequisite(
    record: CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord,
  ): Promise<CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord>;
  getPilotPrerequisite(
    id: string,
  ): Promise<CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord | undefined>;
  listPilotPrerequisites(
    query?: Partial<CodexExecRealReadOnlyAdapterPilotPrerequisiteQuery>,
  ): Promise<CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord[]>;
  latestPilotPrerequisite(
    dryRunId: string,
  ): Promise<CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord | undefined>;
}

export interface CodexExecRealReadOnlyAdapterPilotSourcePreparationRepository {
  savePilotSourcePreparation(
    record: CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord,
  ): Promise<CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord>;
  getPilotSourcePreparation(
    id: string,
  ): Promise<CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord | undefined>;
  listPilotSourcePreparations(
    query?: Partial<CodexExecRealReadOnlyAdapterPilotSourcePreparationQuery>,
  ): Promise<CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord[]>;
  latestPilotSourcePreparation(
    dryRunId: string,
  ): Promise<CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord | undefined>;
}

export interface CodexHubStore {
  workflowRuns: WorkflowRunRepository;
  auditEvents: AuditEventRepository;
  evidenceRefs: EvidenceRefRepository;
  observations: ObservationRepository;
  developmentRuns: DevelopmentRunRepository;
  codexReplays: CodexReplayRepository;
  codexExecLiveRuns: CodexExecLiveRunRepository;
  codexExecApprovals: CodexExecApprovalRepository;
  browserObservationDryRuns: BrowserObservationDryRunRepository;
  browserObservationApprovals: BrowserObservationApprovalRepository;
  browserObservationRuns: BrowserObservationRunRepository;
  electronCdpObservationDryRuns: ElectronCdpObservationDryRunRepository;
  electronCdpObservationApprovals: ElectronCdpObservationApprovalRepository;
  electronCdpObservationRuns: ElectronCdpObservationRunRepository;
  worktreeDryRuns: WorktreeDryRunRepository;
  worktreeApprovals: WorktreeApprovalRepository;
  worktreeRuns: WorktreeRunRepository;
  worktreeCleanupDryRuns: WorktreeCleanupDryRunRepository;
  worktreeCleanupApprovals: WorktreeCleanupApprovalRepository;
  worktreeCleanupRuns: WorktreeCleanupRunRepository;
  reviewPackageDryRuns: ReviewPackageDryRunRepository;
  reviewPackageApprovals: ReviewPackageApprovalRepository;
  reviewPackageRuns: ReviewPackageRunRepository;
  releaseCandidateDryRuns: ReleaseCandidateDryRunRepository;
  releaseCandidateApprovals: ReleaseCandidateApprovalRepository;
  releaseCandidateRuns: ReleaseCandidateRunRepository;
  githubMetadataDryRuns: GithubMetadataDryRunRepository;
  githubMetadataApprovals: GithubMetadataApprovalRepository;
  githubMetadataRuns: GithubMetadataRunRepository;
  githubDraftPrDryRuns: GithubDraftPrDryRunRepository;
  githubDraftPrApprovals: GithubDraftPrApprovalRepository;
  githubDraftPrRuns: GithubDraftPrRunRepository;
  githubBranchPublishDryRuns: GithubBranchPublishDryRunRepository;
  githubBranchPublishApprovals: GithubBranchPublishApprovalRepository;
  githubBranchPublishRuns: GithubBranchPublishRunRepository;
  githubPublishDraftPrChainDryRuns: GithubPublishDraftPrChainDryRunRepository;
  githubPublishDraftPrChainRuns: GithubPublishDraftPrChainRunRepository;
  githubPrLifecycleDryRuns: GithubPrLifecycleDryRunRepository;
  githubPrLifecycleApprovals: GithubPrLifecycleApprovalRepository;
  githubPrLifecycleRuns: GithubPrLifecycleRunRepository;
  githubPrLabelsDryRuns: GithubPrManagementDryRunRepository;
  githubPrLabelsApprovals: GithubPrManagementApprovalRepository;
  githubPrLabelsRuns: GithubPrManagementRunRepository;
  githubPrAssigneesDryRuns: GithubPrManagementDryRunRepository;
  githubPrAssigneesApprovals: GithubPrManagementApprovalRepository;
  githubPrAssigneesRuns: GithubPrManagementRunRepository;
  githubPrReviewersDryRuns: GithubPrManagementDryRunRepository;
  githubPrReviewersApprovals: GithubPrManagementApprovalRepository;
  githubPrReviewersRuns: GithubPrManagementRunRepository;
  githubPrMilestonesDryRuns: GithubPrManagementDryRunRepository;
  githubPrMilestonesApprovals: GithubPrManagementApprovalRepository;
  githubPrMilestonesRuns: GithubPrManagementRunRepository;
  githubPrCommentsDryRuns: GithubPrManagementDryRunRepository;
  githubPrCommentsApprovals: GithubPrManagementApprovalRepository;
  githubPrCommentsRuns: GithubPrManagementRunRepository;
  githubMergeDryRuns: GithubMergeDryRunRepository;
  githubMergeApprovals: GithubMergeApprovalRepository;
  githubMergeRuns: GithubMergeRunRepository;
  githubActionsObservationDryRuns: GithubActionsObservationDryRunRepository;
  githubActionsObservationApprovals: GithubActionsObservationApprovalRepository;
  githubActionsObservationRuns: GithubActionsObservationRunRepository;
  githubActionsRerunDryRuns: GithubActionsRunControlDryRunRepository;
  githubActionsRerunApprovals: GithubActionsRunControlApprovalRepository;
  githubActionsRerunRuns: GithubActionsRunControlRunRepository;
  githubActionsCancelDryRuns: GithubActionsRunControlDryRunRepository;
  githubActionsCancelApprovals: GithubActionsRunControlApprovalRepository;
  githubActionsCancelRuns: GithubActionsRunControlRunRepository;
  githubActionsDispatchDryRuns: GithubActionsDispatchDryRunRepository;
  githubActionsDispatchApprovals: GithubActionsDispatchApprovalRepository;
  githubActionsDispatchRuns: GithubActionsDispatchRunRepository;
  releaseVersionPlanDryRuns: ReleaseVersionPlanDryRunRepository;
  githubReleaseTagDryRuns: GithubReleaseTagDryRunRepository;
  githubReleaseTagApprovals: GithubReleaseTagApprovalRepository;
  githubReleaseTagRuns: GithubReleaseTagRunRepository;
  githubReleaseDraftDryRuns: GithubReleaseDraftDryRunRepository;
  githubReleaseDraftApprovals: GithubReleaseDraftApprovalRepository;
  githubReleaseDraftRuns: GithubReleaseDraftRunRepository;
  deploymentObservationDryRuns: DeploymentObservationDryRunRepository;
  deploymentObservationApprovals: DeploymentObservationApprovalRepository;
  deploymentObservationRuns: DeploymentObservationRunRepository;
  deploymentOperationDryRuns: DeploymentOperationDryRunRepository;
  deploymentOperationApprovals: DeploymentOperationApprovalRepository;
  deploymentRollbackPlans: DeploymentRollbackPlanRepository;
  deploymentOperationRuns: DeploymentOperationRunRepository;
  secretReadinessDryRuns: SecretReadinessDryRunRepository;
  secretReadinessApprovals: SecretReadinessApprovalRepository;
  secretReadinessRuns: SecretReadinessRunRepository;
  secretLeakAuditSummaries: SecretLeakAuditSummaryRepository;
  realPolicyBackendDryRuns: RealPolicyBackendDryRunRepository;
  realPolicyBackendApprovals: RealPolicyBackendApprovalRepository;
  realPolicyBackendRuns: RealPolicyBackendRunRepository;
  realTelemetryExportDryRuns: RealTelemetryExportDryRunRepository;
  realTelemetryExportApprovals: RealTelemetryExportApprovalRepository;
  realTelemetryExportRuns: RealTelemetryExportRunRepository;
  browserActionDryRuns: BrowserActionDryRunRepository;
  browserActionApprovals: BrowserActionApprovalRepository;
  browserActionRuns: BrowserActionRunRepository;
  electronMainInspectorDryRuns: ElectronMainInspectorDryRunRepository;
  electronMainInspectorApprovals: ElectronMainInspectorApprovalRepository;
  electronMainInspectorRuns: ElectronMainInspectorRunRepository;
  mcpWriteToolDryRuns: McpWriteToolDryRunRepository;
  mcpWriteToolApprovals: McpWriteToolApprovalRepository;
  mcpWriteToolRuns: McpWriteToolRunRepository;
  runtimeJobPlans: RuntimeJobPlanRepository;
  runtimeQueueEntries: RuntimeQueueEntryRepository;
  runtimeLeases: RuntimeLeaseRepository;
  runtimeLocks: RuntimeLockRepository;
  runtimeCheckpoints: RuntimeCheckpointRepository;
  runtimeJobRuns: RuntimeJobRunRepository;
  multiAgentCoordinationPlans: MultiAgentCoordinationPlanRepository;
  multiAgentSlotSummaries: MultiAgentSlotSummaryRepository;
  externalAgentDryRuns: ExternalAgentDryRunRepository;
  externalAgentApprovals: ExternalAgentApprovalRepository;
  externalAgentRuns: ExternalAgentRunRepository;
  externalAgentPatchSummaries: ExternalAgentPatchSummaryRepository;
  platformOperationApprovals: PlatformOperationApprovalRepository;
  platformBackupPlans: PlatformBackupPlanRepository;
  platformBackupRuns: PlatformBackupRunRepository;
  platformRestorePlans: PlatformRestorePlanRepository;
  platformRestoreRuns: PlatformRestoreRunRepository;
  storeMigrationPlans: StoreMigrationPlanRepository;
  storeMigrationRuns: StoreMigrationRunRepository;
  retentionPolicyPlans: RetentionPolicyPlanRepository;
  retentionPolicyRuns: RetentionPolicyRunRepository;
  auditExportPlans: AuditExportPlanRepository;
  auditExportRuns: AuditExportRunRepository;
  operatorRoleAssignmentPlans: OperatorRoleAssignmentPlanRepository;
  operatorRoleAssignmentRuns: OperatorRoleAssignmentRunRepository;
  disasterRecoveryRehearsalRuns: DisasterRecoveryRehearsalRunRepository;
  productionGaDryRuns: ProductionGaDryRunRepository;
  productionGaApprovals: ProductionGaApprovalRepository;
  productionGaSignoffPlans: ProductionGaSignoffPlanRepository;
  productionGaSignoffRuns: ProductionGaSignoffRunRepository;
  productionGaE2ERehearsalRuns: ProductionGaE2ERehearsalRunRepository;
  productionGaTrainingCompletions: ProductionGaTrainingCompletionRepository;
  productionGaThreatModels: ProductionGaThreatModelRepository;
  productionGaResidualRiskRegisters: ProductionGaResidualRiskRegisterRepository;
  githubRemoteCleanupDryRuns: GithubRemoteCleanupDryRunRepository;
  githubRemoteCleanupApprovals: GithubRemoteCleanupApprovalRepository;
  githubRemoteCleanupRuns: GithubRemoteCleanupRunRepository;
  reworkLoopDryRuns: ReworkLoopDryRunRepository;
  reworkLoopApprovals: ReworkLoopApprovalRepository;
  reworkLoopRuns: ReworkLoopRunRepository;
  customWorkflowDryRuns: CustomWorkflowDryRunRepository;
  customWorkflowApprovals: CustomWorkflowApprovalRepository;
  customWorkflowRuns: CustomWorkflowRunRepository;
  productionWorkflowRecoveryDryRuns: ProductionWorkflowRecoveryDryRunRepository;
  productionWorkflowRecoveryApprovals: ProductionWorkflowRecoveryApprovalRepository;
  productionWorkflowRecoveryRuns: ProductionWorkflowRecoveryRunRepository;
  productionWorkflowRecoveryChildActionStates: ProductionWorkflowRecoveryChildActionStateRepository;
  codexPatchChildRecords: CodexPatchChildRecordRepository;
  nxVerificationChildRecords: NxVerificationChildRecordRepository;
  codexReportReviews: CodexReportReviewRepository;
  codexExecLiveAdapterAdrDecisions: CodexExecLiveAdapterAdrDecisionRepository;
  codexExecReadOnlyAdapterSimulatorReviews: CodexExecReadOnlyAdapterSimulatorReviewRepository;
  codexExecReadOnlyAdapterImplementationPlanReviews: CodexExecReadOnlyAdapterImplementationPlanReviewRepository;
  codexExecReadOnlyAdapterSkeletonReviews: CodexExecReadOnlyAdapterSkeletonReviewRepository;
  codexExecReadOnlyAdapterFinalReadiness: CodexExecReadOnlyAdapterFinalReadinessRepository;
  codexExecRealReadOnlyAdapterReadiness: CodexExecRealReadOnlyAdapterReadinessRepository;
  codexExecRealReadOnlyAdapterReadinessReviews: CodexExecRealReadOnlyAdapterReadinessReviewRepository;
  codexExecRealReadOnlyAdapterAttempts: CodexExecRealReadOnlyAdapterAttemptRepository;
  codexExecRealReadOnlyAdapterPolicySources: CodexExecRealReadOnlyAdapterPolicySourceRepository;
  codexExecRealReadOnlyAdapterApprovalAuthorityTraces: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRepository;
  codexExecRealReadOnlyAdapterPilotPrerequisites: CodexExecRealReadOnlyAdapterPilotPrerequisiteRepository;
  codexExecRealReadOnlyAdapterPilotSourcePreparations: CodexExecRealReadOnlyAdapterPilotSourcePreparationRepository;
  businessWorkspaces: MetadataEntityRepository<BusinessWorkspace>;
  businessMembershipMirrors: MetadataEntityRepository<BusinessMembershipMirror>;
  chromeProfileBindings: MetadataEntityRepository<ChromeProfileBinding>;
  chatGptSessionHealth: MetadataEntityRepository<ChatGptSessionHealth>;
  humanCheckpoints: MetadataEntityRepository<HumanCheckpoint>;
  codexClientInstances: MetadataEntityRepository<CodexClientInstance>;
  codexAppServerSessions: MetadataEntityRepository<CodexAppServerSession>;
  codexAppServerWireMessageSummaries: MetadataEntityRepository<CodexAppServerWireMessageSummary>;
  codexAppServerThreadMirrors: MetadataEntityRepository<CodexAppServerThreadMirror>;
  codexAppServerTurnMirrors: MetadataEntityRepository<CodexAppServerTurnMirror>;
  codexAppServerEventSummaries: MetadataEntityRepository<CodexAppServerEventSummary>;
  codexAppServerApprovalBridgeRecords: MetadataEntityRepository<CodexAppServerApprovalBridgeRecord>;
  codexAppServerProtocolDriftReports: MetadataEntityRepository<CodexAppServerProtocolDriftReport>;
  codexAccountBindings: MetadataEntityRepository<CodexAccountBinding>;
  codexTaskIntents: MetadataEntityRepository<CodexTaskIntent>;
  codexTaskRuns: MetadataEntityRepository<CodexTaskRun>;
  codexTaskDiagnoses: MetadataEntityRepository<CodexTaskDiagnosis>;
  codexRecoveryRuns: MetadataEntityRepository<CodexRecoveryRun>;
  accountPools: MetadataEntityRepository<AccountPool>;
  clientPools: MetadataEntityRepository<ClientPool>;
  poolLeases: MetadataEntityRepository<Lease>;
  quotaSnapshots: MetadataEntityRepository<QuotaSnapshot>;
  evidenceBundles: MetadataEntityRepository<EvidenceBundle>;
  close(): Promise<void>;
}

export interface StoreFactoryOptions {
  workspaceRoot?: string;
  dbPath?: string;
}
