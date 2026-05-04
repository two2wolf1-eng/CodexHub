import { existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, parse, resolve } from 'node:path';
import type { DatabaseSync as NodeSqliteDatabaseSync } from 'node:sqlite';
import type {
  AuditEvent,
  BrowserObservationApprovalArtifactRecord,
  BrowserObservationControlPlaneRun,
  BrowserObservationDryRunRecord,
  CodexExecLiveAdapterAdrDecisionQuery,
  CodexExecLiveAdapterAdrDecisionRecord,
  CodexExecLiveRunRecord,
  CodexExecManualApprovalRecord,
  ElectronCdpObservationApprovalArtifactRecord,
  ElectronCdpObservationControlPlaneRun,
  ElectronCdpObservationDryRunRecord,
  GithubMetadataApprovalArtifactRecord,
  GithubMetadataControlPlaneRun,
  GithubMetadataDryRunRecord,
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
import type {
  AuditEventQuery,
  AuditEventRepository,
  BrowserObservationApprovalRepository,
  BrowserObservationDryRunRepository,
  BrowserObservationQuery,
  BrowserObservationRunRepository,
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
  GithubMetadataApprovalRepository,
  GithubMetadataControlPlaneQuery,
  GithubMetadataDryRunRepository,
  GithubMetadataRunRepository,
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
