import { existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, parse, resolve } from 'node:path';
import type { DatabaseSync as NodeSqliteDatabaseSync } from 'node:sqlite';
import type {
  AuditEvent,
  EvidenceRef,
  MockDevelopmentRun,
  Observation,
  WorkflowRun,
} from '@codexhub/contracts';
import type {
  AuditEventRepository,
  CodexHubStore,
  DevelopmentRunRepository,
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

  constructor(private readonly database: SqliteDatabase) {
    this.workflowRuns = new JsonEntityRepository<WorkflowRun>(
      database,
      'workflow_runs',
      (run) => run.createdAt,
    );
    this.auditEvents = new AppendOnlyJsonEntityRepository<AuditEvent>(
      database,
      'audit_events',
      (event) => event.createdAt,
    );
    this.evidenceRefs = new JsonEntityRepository<EvidenceRef>(
      database,
      'evidence_refs',
      (ref) => ref.createdAt,
    );
    this.observations = new AppendOnlyJsonEntityRepository<Observation>(
      database,
      'observations',
      (observation) => observation.observedAt,
    );
    this.developmentRuns = new SqliteDevelopmentRunRepository(database);
  }

  async close(): Promise<void> {
    this.database.close();
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
      .prepare(
        'SELECT payload FROM development_runs ORDER BY recorded_at DESC, id DESC LIMIT ?',
      )
      .all(safeLimit) as unknown as PayloadRow[];

    return rows.map((row) => JSON.parse(row.payload) as MockDevelopmentRun);
  }

  async getMockDevelopmentRun(id: string): Promise<MockDevelopmentRun | undefined> {
    return this.repository.getById(id);
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
      .prepare(`INSERT OR REPLACE INTO ${this.tableName} (id, recorded_at, payload) VALUES (?, ?, ?)`)
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
  `);
  database
    .prepare('INSERT OR IGNORE INTO schema_migrations (id, applied_at) VALUES (?, ?)')
    .run('foundation_0001', new Date().toISOString());
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
