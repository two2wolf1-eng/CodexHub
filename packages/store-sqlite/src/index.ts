import { existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, parse, resolve } from 'node:path';
import type { DatabaseSync as NodeSqliteDatabaseSync } from 'node:sqlite';
import type {
  AuditEvent,
  CodexExecLiveAdapterAdrDecisionQuery,
  CodexExecLiveAdapterAdrDecisionRecord,
  CodexExecLiveRunRecord,
  CodexExecManualApprovalRecord,
  CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord,
  CodexExecReadOnlyAdapterSimulatorReviewQuery,
  CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord,
  CodexExecReadOnlyAdapterImplementationPlanReviewQuery,
  CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord,
  CodexExecReadOnlyAdapterSkeletonReviewQuery,
  CodexExecReadOnlyAdapterFinalReadinessDecisionRecord,
  CodexExecReadOnlyAdapterFinalReadinessQuery,
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
  CodexExecLiveAdapterAdrDecisionRepository,
  CodexExecApprovalRepository,
  CodexExecLiveRunRepository,
  CodexExecReadOnlyAdapterSimulatorReviewRepository,
  CodexExecReadOnlyAdapterImplementationPlanReviewRepository,
  CodexExecReadOnlyAdapterSkeletonReviewRepository,
  CodexExecReadOnlyAdapterFinalReadinessRepository,
  CodexHubStore,
  CodexReplayRepository,
  CodexReportReviewRepository,
  DevelopmentRunRepository,
  EvidenceRefQuery,
  EvidenceRefRepository,
  ObservationRepository,
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
  readonly codexReportReviews: CodexReportReviewRepository;
  readonly codexExecLiveAdapterAdrDecisions: CodexExecLiveAdapterAdrDecisionRepository;
  readonly codexExecReadOnlyAdapterSimulatorReviews: CodexExecReadOnlyAdapterSimulatorReviewRepository;
  readonly codexExecReadOnlyAdapterImplementationPlanReviews: CodexExecReadOnlyAdapterImplementationPlanReviewRepository;
  readonly codexExecReadOnlyAdapterSkeletonReviews: CodexExecReadOnlyAdapterSkeletonReviewRepository;
  readonly codexExecReadOnlyAdapterFinalReadiness: CodexExecReadOnlyAdapterFinalReadinessRepository;

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
    this.codexReportReviews = new SqliteCodexReportReviewRepository(database);
    this.codexExecLiveAdapterAdrDecisions =
      new SqliteCodexExecLiveAdapterAdrDecisionRepository(database);
    this.codexExecReadOnlyAdapterSimulatorReviews =
      new SqliteCodexExecReadOnlyAdapterSimulatorReviewRepository(database);
    this.codexExecReadOnlyAdapterImplementationPlanReviews =
      new SqliteCodexExecReadOnlyAdapterImplementationPlanReviewRepository(database);
    this.codexExecReadOnlyAdapterSkeletonReviews =
      new SqliteCodexExecReadOnlyAdapterSkeletonReviewRepository(database);
    this.codexExecReadOnlyAdapterFinalReadiness =
      new SqliteCodexExecReadOnlyAdapterFinalReadinessRepository(database);
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

class SqliteCodexExecLiveAdapterAdrDecisionRepository
  implements CodexExecLiveAdapterAdrDecisionRepository
{
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

class SqliteCodexExecReadOnlyAdapterSimulatorReviewRepository
  implements CodexExecReadOnlyAdapterSimulatorReviewRepository
{
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

class SqliteCodexExecReadOnlyAdapterImplementationPlanReviewRepository
  implements CodexExecReadOnlyAdapterImplementationPlanReviewRepository
{
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

class SqliteCodexExecReadOnlyAdapterSkeletonReviewRepository
  implements CodexExecReadOnlyAdapterSkeletonReviewRepository
{
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

class SqliteCodexExecReadOnlyAdapterFinalReadinessRepository
  implements CodexExecReadOnlyAdapterFinalReadinessRepository
{
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
