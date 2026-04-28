import type { AuditEvent, EvidenceRef, Observation, WorkflowRun } from '@codexhub/contracts';

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

export interface CodexHubStore {
  workflowRuns: WorkflowRunRepository;
  auditEvents: AuditEventRepository;
  evidenceRefs: EvidenceRefRepository;
  observations: ObservationRepository;
  close(): Promise<void>;
}

export interface StoreFactoryOptions {
  workspaceRoot?: string;
  dbPath?: string;
}

