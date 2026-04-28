import type {
  AuditEvent,
  CodexExecLiveRunRecord,
  CodexExecManualApprovalRecord,
  CodexReplayRecord,
  EvidenceRef,
  MockDevelopmentRun,
  Observation,
  WorkflowRun,
} from '@codexhub/contracts';

export interface WorkflowRunRepository {
  create(run: WorkflowRun): Promise<WorkflowRun>;
  getById(id: string): Promise<WorkflowRun | undefined>;
  list(): Promise<WorkflowRun[]>;
  update(run: WorkflowRun): Promise<WorkflowRun>;
}

export interface AuditEventRepository {
  append(event: AuditEvent): Promise<AuditEvent>;
  list(): Promise<AuditEvent[]>;
}

export interface EvidenceRefRepository {
  create(ref: EvidenceRef): Promise<EvidenceRef>;
  getById(id: string): Promise<EvidenceRef | undefined>;
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

export interface CodexHubStore {
  workflowRuns: WorkflowRunRepository;
  auditEvents: AuditEventRepository;
  evidenceRefs: EvidenceRefRepository;
  observations: ObservationRepository;
  developmentRuns: DevelopmentRunRepository;
  codexReplays: CodexReplayRepository;
  codexExecLiveRuns: CodexExecLiveRunRepository;
  codexExecApprovals: CodexExecApprovalRepository;
  close(): Promise<void>;
}

export interface StoreFactoryOptions {
  workspaceRoot?: string;
  dbPath?: string;
}
