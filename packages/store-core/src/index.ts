import type {
  AuditEvent,
  BrowserObservationApprovalArtifactRecord,
  BrowserObservationControlPlaneRun,
  BrowserObservationDryRunRecord,
  CodexExecLiveRunRecord,
  ElectronCdpObservationApprovalArtifactRecord,
  ElectronCdpObservationControlPlaneRun,
  ElectronCdpObservationDryRunRecord,
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
  ReworkLoopApprovalArtifactRecord,
  ReworkLoopPlan,
  ReworkLoopRun,
  LocalReviewPackageApprovalArtifactRecord,
  LocalReviewPackageControlPlaneRun,
  LocalReviewPackageDryRunRecord,
  LocalRcBundleApprovalArtifactRecord,
  LocalRcBundleControlPlaneRun,
  LocalRcBundleDryRunRecord,
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
  EvidenceRef,
  MockDevelopmentRun,
  Observation,
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
export type GithubRemoteCleanupControlPlaneQuery = WorktreeControlPlaneQuery;
export type ReworkLoopControlPlaneQuery = WorktreeControlPlaneQuery;

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
  githubRemoteCleanupDryRuns: GithubRemoteCleanupDryRunRepository;
  githubRemoteCleanupApprovals: GithubRemoteCleanupApprovalRepository;
  githubRemoteCleanupRuns: GithubRemoteCleanupRunRepository;
  reworkLoopDryRuns: ReworkLoopDryRunRepository;
  reworkLoopApprovals: ReworkLoopApprovalRepository;
  reworkLoopRuns: ReworkLoopRunRepository;
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
  close(): Promise<void>;
}

export interface StoreFactoryOptions {
  workspaceRoot?: string;
  dbPath?: string;
}
