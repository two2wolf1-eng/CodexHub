import type {
  AuditEvent,
  CodexExecLiveRunRecord,
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

export interface CodexHubStore {
  workflowRuns: WorkflowRunRepository;
  auditEvents: AuditEventRepository;
  evidenceRefs: EvidenceRefRepository;
  observations: ObservationRepository;
  developmentRuns: DevelopmentRunRepository;
  codexReplays: CodexReplayRepository;
  codexExecLiveRuns: CodexExecLiveRunRepository;
  codexExecApprovals: CodexExecApprovalRepository;
  codexReportReviews: CodexReportReviewRepository;
  codexExecLiveAdapterAdrDecisions: CodexExecLiveAdapterAdrDecisionRepository;
  codexExecReadOnlyAdapterSimulatorReviews: CodexExecReadOnlyAdapterSimulatorReviewRepository;
  codexExecReadOnlyAdapterImplementationPlanReviews: CodexExecReadOnlyAdapterImplementationPlanReviewRepository;
  codexExecReadOnlyAdapterSkeletonReviews: CodexExecReadOnlyAdapterSkeletonReviewRepository;
  codexExecReadOnlyAdapterFinalReadiness: CodexExecReadOnlyAdapterFinalReadinessRepository;
  codexExecRealReadOnlyAdapterReadiness: CodexExecRealReadOnlyAdapterReadinessRepository;
  codexExecRealReadOnlyAdapterReadinessReviews: CodexExecRealReadOnlyAdapterReadinessReviewRepository;
  codexExecRealReadOnlyAdapterAttempts: CodexExecRealReadOnlyAdapterAttemptRepository;
  close(): Promise<void>;
}

export interface StoreFactoryOptions {
  workspaceRoot?: string;
  dbPath?: string;
}
