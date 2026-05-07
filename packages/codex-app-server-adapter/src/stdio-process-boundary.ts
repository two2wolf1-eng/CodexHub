import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import {
  CodexAppServerMethodSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
  type CodexAppServerMethod,
  type CodexAppServerProtocolDriftReport,
  type CodexTaskRun,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import type {
  CodexAppServerJsonlTransport,
  CodexAppServerTransportLineSummary,
} from './index';

export type CodexAppServerStdioBoundaryStatus = 'ready' | 'blocked' | 'failed';

export interface CodexAppServerProcessGrant {
  dryRunId: string;
  approvalArtifactId: string;
  dispatchAllowed: boolean;
  preflightStatus: CodexTaskRun['preflightStatus'];
  approvalStatus: CodexTaskRun['approvalStatus'];
  canaryGateStatus: CodexTaskRun['canaryGateStatus'];
  protocolDriftStatus?: CodexAppServerProtocolDriftReport['status'];
  liveDispatchBlocked?: boolean;
}

export interface CodexAppServerProcessHandle {
  readonly pid?: number;
  writeStdin(line: string): Promise<void>;
  readStdoutLine(): Promise<string | undefined>;
  close(): Promise<void>;
}

export interface CodexAppServerProcessSpawner {
  start(input: {
    command: string;
    args: readonly string[];
  }): CodexAppServerProcessHandle;
}

export interface GovernedCodexAppServerStdioTransportInput {
  command: string;
  args?: readonly string[];
  grant: CodexAppServerProcessGrant;
  spawner?: CodexAppServerProcessSpawner;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface GovernedCodexAppServerStdioTransportResult {
  id: string;
  schemaVersion: string;
  observedAt: string;
  status: CodexAppServerStdioBoundaryStatus;
  blockReasons: string[];
  commandHash?: string;
  argumentCount: number;
  dryRunId: string;
  approvalArtifactId?: string;
  transportKind: 'stdio-jsonl';
  fixtureOnly: false;
  processBoundaryPlanned: true;
  processBoundaryInvoked: boolean;
  externalProcessStarted: boolean;
  liveDispatchEnabled: boolean;
  noRealWrite: true;
  rawCommandStored: false;
  rawArgsStored: false;
  rawBodyStored: false;
  evidenceRefIds: string[];
  auditEventIds: string[];
  summary: string;
  readonly transport?: CodexAppServerJsonlTransport;
}

export function createGovernedCodexAppServerStdioTransport(
  input: GovernedCodexAppServerStdioTransportInput,
): GovernedCodexAppServerStdioTransportResult {
  const observedAt = input.observedAt ?? foundationTimestamp();
  const blockReasons = collectStdioBoundaryBlockReasons(input);
  const common = {
    id: foundationId('codex_app_server_stdio_boundary'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt,
    blockReasons,
    commandHash: isBlank(input.command) ? undefined : hashRef(input.command),
    argumentCount: input.args?.length ?? 0,
    dryRunId: input.grant.dryRunId,
    approvalArtifactId: input.grant.approvalArtifactId,
    transportKind: 'stdio-jsonl' as const,
    fixtureOnly: false as const,
    processBoundaryPlanned: true as const,
    noRealWrite: true as const,
    rawCommandStored: false as const,
    rawArgsStored: false as const,
    rawBodyStored: false as const,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
  };

  if (blockReasons.length > 0) {
    return {
      ...common,
      status: 'blocked',
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      liveDispatchEnabled: false,
      summary: 'Codex App Server stdio boundary is blocked before process start.',
    };
  }

  try {
    const handle = (input.spawner ?? nodeProcessSpawner).start({
      command: input.command,
      args: [...(input.args ?? [])],
    });
    const transport = new ProcessCodexAppServerJsonlTransport(handle);
    const result: GovernedCodexAppServerStdioTransportResult = {
      ...common,
      status: 'ready',
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      liveDispatchEnabled: true,
      summary: 'Codex App Server stdio boundary started after governed preflight.',
    };

    Object.defineProperty(result, 'transport', {
      value: transport,
      enumerable: false,
    });

    return result;
  } catch {
    return {
      ...common,
      status: 'failed',
      blockReasons: ['process_start_failed'],
      processBoundaryInvoked: true,
      externalProcessStarted: false,
      liveDispatchEnabled: false,
      summary: 'Codex App Server stdio boundary failed to start.',
    };
  }
}

export const nodeProcessSpawner: CodexAppServerProcessSpawner = {
  start(input) {
    return new NodeChildProcessLineHandle(
      spawn(input.command, [...input.args], {
        stdio: 'pipe',
        windowsHide: true,
      }),
    );
  },
};

class ProcessCodexAppServerJsonlTransport implements CodexAppServerJsonlTransport {
  readonly transportKind = 'stdio-jsonl' as const;
  private readonly lineSummaries: CodexAppServerTransportLineSummary[] = [];
  private closed = false;

  constructor(private readonly handle: CodexAppServerProcessHandle) {}

  async sendLine(line: string): Promise<void> {
    if (this.closed) {
      return;
    }

    const normalized = ensureJsonlLine(line);
    await this.handle.writeStdin(normalized);
    this.lineSummaries.push(createLineSummary(this.lineSummaries.length + 1, 'sent', normalized));
  }

  async receiveLine(): Promise<string | undefined> {
    if (this.closed) {
      return undefined;
    }

    const line = await this.handle.readStdoutLine();
    if (!line) {
      return undefined;
    }

    const normalized = ensureJsonlLine(line);
    this.lineSummaries.push(
      createLineSummary(this.lineSummaries.length + 1, 'received', normalized),
    );
    return normalized;
  }

  async close(): Promise<void> {
    this.closed = true;
    await this.handle.close();
  }

  enqueueIncoming(): void {
    throw new Error('live_stdio_transport_does_not_accept_fixture_input');
  }

  listLineSummaries(): CodexAppServerTransportLineSummary[] {
    return this.lineSummaries.map((summary) => ({ ...summary }));
  }
}

class NodeChildProcessLineHandle implements CodexAppServerProcessHandle {
  readonly pid?: number;
  private stdoutBuffer = '';
  private readonly stdoutLines: string[] = [];
  private readonly waiters: Array<(line: string | undefined) => void> = [];
  private closed = false;

  constructor(private readonly child: ChildProcessWithoutNullStreams) {
    this.pid = child.pid;
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => this.acceptStdoutChunk(chunk));
    child.on('close', () => this.closeWaiters());
    child.on('error', () => this.closeWaiters());
  }

  async writeStdin(line: string): Promise<void> {
    if (this.closed) {
      return;
    }

    this.child.stdin.write(line);
  }

  async readStdoutLine(): Promise<string | undefined> {
    const existing = this.stdoutLines.shift();
    if (existing) {
      return existing;
    }

    if (this.closed) {
      return undefined;
    }

    return new Promise((resolve) => this.waiters.push(resolve));
  }

  async close(): Promise<void> {
    this.closed = true;
    this.child.stdin.end();
    if (!this.child.killed) {
      this.child.kill();
    }
    this.closeWaiters();
  }

  private acceptStdoutChunk(chunk: string): void {
    this.stdoutBuffer += chunk;
    let newlineIndex = this.stdoutBuffer.indexOf('\n');

    while (newlineIndex >= 0) {
      const line = this.stdoutBuffer.slice(0, newlineIndex + 1);
      this.stdoutBuffer = this.stdoutBuffer.slice(newlineIndex + 1);
      this.pushLine(line);
      newlineIndex = this.stdoutBuffer.indexOf('\n');
    }
  }

  private pushLine(line: string): void {
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter(line);
      return;
    }

    this.stdoutLines.push(line);
  }

  private closeWaiters(): void {
    this.closed = true;
    while (this.waiters.length > 0) {
      this.waiters.shift()?.(undefined);
    }
  }
}

function collectStdioBoundaryBlockReasons(
  input: GovernedCodexAppServerStdioTransportInput,
): string[] {
  const blockReasons: string[] = [];

  if (isBlank(input.command)) {
    blockReasons.push('command_required');
  }

  if (isBlank(input.grant.dryRunId)) {
    blockReasons.push('dry_run_id_required');
  }

  if (isBlank(input.grant.approvalArtifactId)) {
    blockReasons.push('approval_artifact_id_required');
  }

  if (!input.grant.dispatchAllowed || input.grant.preflightStatus !== 'ready') {
    blockReasons.push('dispatch_preflight_not_ready');
  }

  if (input.grant.approvalStatus !== 'approved') {
    blockReasons.push('approval_not_approved');
  }

  if (input.grant.canaryGateStatus !== 'passed') {
    blockReasons.push('canary_gate_not_passed');
  }

  if (input.grant.protocolDriftStatus !== 'compatible' || input.grant.liveDispatchBlocked) {
    blockReasons.push('protocol_drift_blocks_live_dispatch');
  }

  return blockReasons;
}

function createLineSummary(
  sequenceNumber: number,
  direction: CodexAppServerTransportLineSummary['direction'],
  line: string,
): CodexAppServerTransportLineSummary {
  return {
    sequenceNumber,
    direction,
    method: methodFromLine(line),
    lineHash: hashRef(line.trim()),
    payloadByteCount: byteLength(line.trim()),
  };
}

function methodFromLine(line: string): CodexAppServerMethod {
  try {
    const parsed = JSON.parse(line.trim()) as Record<string, unknown>;
    const method = typeof parsed.method === 'string' ? parsed.method : 'unknown';
    const result = CodexAppServerMethodSchema.safeParse(method);
    return result.success ? result.data : 'unknown';
  } catch {
    return 'unknown';
  }
}

function ensureJsonlLine(value: string): string {
  return value.endsWith('\n') ? value : `${value}\n`;
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function hashRef(value: string): string {
  return `sha256:${hashText(value)}`;
}

function isBlank(value: string | undefined): boolean {
  return !value || value.trim().length === 0;
}
