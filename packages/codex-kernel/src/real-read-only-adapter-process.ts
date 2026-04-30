import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { hashText } from '@codexhub/evidence-kernel';

type JsonMetadata = Record<string, unknown>;

export interface CodexExecRealReadOnlyAdapterProcessPlanInput {
  dryRunId: string;
  approvalArtifactId: string;
  executablePath: string;
  worktreePath: string;
  timeoutMs: number;
  metadata?: JsonMetadata;
}

export interface CodexExecRealReadOnlyAdapterProcessPlan {
  dryRunId: string;
  approvalArtifactId: string;
  executablePath: string;
  argv: readonly string[];
  cwd: string;
  env: Record<string, string>;
  shell: false;
  timeoutMs: number;
  readOnly: true;
  oneShot: true;
  metadataOnly: true;
  commandBodyStored: false;
  stdoutBodyStored: false;
  stderrBodyStored: false;
  agentMessageBodyStored: false;
  reasoningBodyStored: false;
  dashboardTriggerAllowed: false;
  workspaceWriteAllowed: false;
  dangerFullAccessAllowed: false;
  metadata?: JsonMetadata;
}

export interface CodexExecRealReadOnlyAdapterProcessOutputSummary {
  stream: 'stdout' | 'stderr';
  contentHash: string;
  byteLength: number;
  lineCount: number;
  truncated: boolean;
  bodyStored: false;
}

export interface CodexExecRealReadOnlyAdapterProcessRunnerResult {
  exitCode?: number;
  signal?: string;
  stdout?: string;
  stderr?: string;
  timedOut?: boolean;
  cancelled?: boolean;
}

export interface CodexExecRealReadOnlyAdapterProcessBoundaryResult {
  status: 'completed' | 'failed' | 'aborted';
  dryRunId: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  exitCode?: number;
  signal?: string;
  timedOut: boolean;
  cancelled: boolean;
  stdoutSummary: CodexExecRealReadOnlyAdapterProcessOutputSummary;
  stderrSummary: CodexExecRealReadOnlyAdapterProcessOutputSummary;
  shell: false;
  commandBodyStored: false;
  argvStored: false;
  executablePathStored: false;
  envPlanStored: false;
  stdoutBodyStored: false;
  stderrBodyStored: false;
  metadataOnly: true;
  externalProcessStarted: boolean;
  workspaceWriteAllowed: false;
  dangerFullAccessAllowed: false;
  dashboardTriggerAllowed: false;
  metadata?: JsonMetadata;
}

export interface CodexExecRealReadOnlyAdapterProcessRunner {
  start(
    plan: CodexExecRealReadOnlyAdapterProcessPlan,
    options: { signal?: AbortSignal },
  ): Promise<CodexExecRealReadOnlyAdapterProcessRunnerResult>;
}

const maxCapturedBytes = 64 * 1024;

export function createRealReadOnlyAdapterProcessPlan(
  input: CodexExecRealReadOnlyAdapterProcessPlanInput,
): CodexExecRealReadOnlyAdapterProcessPlan {
  if (input.dryRunId.trim().length === 0) {
    throw new Error('dryRunId is required before process boundary planning');
  }

  if (input.approvalArtifactId.trim().length === 0) {
    throw new Error('approvalArtifactId is required before process boundary planning');
  }

  if (input.executablePath.trim().length === 0) {
    throw new Error('executablePath is required before process boundary planning');
  }

  if (input.worktreePath.trim().length === 0) {
    throw new Error('worktreePath is required before process boundary planning');
  }

  if (!Number.isInteger(input.timeoutMs) || input.timeoutMs < 1 || input.timeoutMs > 600_000) {
    throw new Error('timeoutMs must be between 1 and 600000 milliseconds');
  }

  return {
    dryRunId: input.dryRunId,
    approvalArtifactId: input.approvalArtifactId,
    executablePath: input.executablePath,
    argv: [
      'exec',
      '--jsonl',
      '--sandbox',
      'read_only',
      '--dry-run-id',
      input.dryRunId,
      '--approval-artifact-id',
      input.approvalArtifactId,
    ],
    cwd: input.worktreePath,
    env: {},
    shell: false,
    timeoutMs: input.timeoutMs,
    readOnly: true,
    oneShot: true,
    metadataOnly: true,
    commandBodyStored: false,
    stdoutBodyStored: false,
    stderrBodyStored: false,
    agentMessageBodyStored: false,
    reasoningBodyStored: false,
    dashboardTriggerAllowed: false,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
    metadata: {
      ...(input.metadata ?? {}),
      source: 'codex-kernel.real-read-only-adapter.process-plan',
      shell: false,
      readOnly: true,
    },
  };
}

export async function runRealReadOnlyAdapterProcessBoundary(
  plan: CodexExecRealReadOnlyAdapterProcessPlan,
  options: {
    runner?: CodexExecRealReadOnlyAdapterProcessRunner;
    signal?: AbortSignal;
    now?: () => string;
  } = {},
): Promise<CodexExecRealReadOnlyAdapterProcessBoundaryResult> {
  const runner = options.runner ?? nodeRealReadOnlyAdapterProcessRunner;
  const now = options.now ?? (() => new Date().toISOString());
  const startedAt = now();
  const startedMs = Date.parse(startedAt);
  const runnerResult = await runner.start(plan, { signal: options.signal });
  const completedAt = now();
  const completedMs = Date.parse(completedAt);
  const timedOut = runnerResult.timedOut === true;
  const cancelled = runnerResult.cancelled === true || options.signal?.aborted === true;
  const status =
    timedOut || cancelled
      ? 'aborted'
      : runnerResult.exitCode === 0
        ? 'completed'
        : 'failed';

  return {
    status,
    dryRunId: plan.dryRunId,
    startedAt,
    completedAt,
    durationMs:
      Number.isFinite(startedMs) && Number.isFinite(completedMs)
        ? Math.max(0, completedMs - startedMs)
        : 0,
    exitCode: runnerResult.exitCode,
    signal: runnerResult.signal,
    timedOut,
    cancelled,
    stdoutSummary: summarizeProcessOutput('stdout', runnerResult.stdout ?? ''),
    stderrSummary: summarizeProcessOutput('stderr', runnerResult.stderr ?? ''),
    shell: false,
    commandBodyStored: false,
    argvStored: false,
    executablePathStored: false,
    envPlanStored: false,
    stdoutBodyStored: false,
    stderrBodyStored: false,
    metadataOnly: true,
    externalProcessStarted: true,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
    dashboardTriggerAllowed: false,
    metadata: {
      source: 'codex-kernel.real-read-only-adapter.process-boundary',
      readOnly: true,
      shell: false,
      outputBodyStored: false,
    },
  };
}

export const nodeRealReadOnlyAdapterProcessRunner: CodexExecRealReadOnlyAdapterProcessRunner = {
  start: (plan, options) =>
    new Promise<CodexExecRealReadOnlyAdapterProcessRunnerResult>((resolve) => {
      let settled = false;
      let timedOut = false;
      let cancelled = false;
      let stdout = '';
      let stderr = '';
      let child: ChildProcessWithoutNullStreams | undefined;

      const finish = (result: CodexExecRealReadOnlyAdapterProcessRunnerResult): void => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeout(timeout);
        options.signal?.removeEventListener('abort', abort);
        resolve(result);
      };

      const timeout = setTimeout(() => {
        timedOut = true;
        child?.kill('SIGTERM');
      }, plan.timeoutMs);

      const abort = (): void => {
        cancelled = true;
        child?.kill('SIGTERM');
      };

      options.signal?.addEventListener('abort', abort, { once: true });

      try {
        child = spawn(plan.executablePath, [...plan.argv], {
          cwd: plan.cwd,
          env: plan.env,
          shell: false,
          windowsHide: true,
        });
      } catch (error) {
        finish({
          exitCode: undefined,
          stderr: error instanceof Error ? error.message : 'process boundary start failed',
        });
        return;
      }

      child.stdout.on('data', (chunk: Buffer) => {
        stdout = appendBounded(stdout, chunk);
      });
      child.stderr.on('data', (chunk: Buffer) => {
        stderr = appendBounded(stderr, chunk);
      });
      child.on('error', (error) => {
        finish({ exitCode: undefined, stderr: error.message, timedOut, cancelled });
      });
      child.on('close', (exitCode, signal) => {
        finish({
          exitCode: exitCode ?? undefined,
          signal: signal ?? undefined,
          stdout,
          stderr,
          timedOut,
          cancelled,
        });
      });
    }),
};

function summarizeProcessOutput(
  stream: CodexExecRealReadOnlyAdapterProcessOutputSummary['stream'],
  text: string,
): CodexExecRealReadOnlyAdapterProcessOutputSummary {
  return {
    stream,
    contentHash: `sha256:${hashText(text)}`,
    byteLength: Buffer.byteLength(text, 'utf8'),
    lineCount: text.length === 0 ? 0 : text.split(/\r?\n/).length,
    truncated: Buffer.byteLength(text, 'utf8') >= maxCapturedBytes,
    bodyStored: false,
  };
}

function appendBounded(current: string, chunk: Buffer): string {
  if (Buffer.byteLength(current, 'utf8') >= maxCapturedBytes) {
    return current;
  }

  const next = current + chunk.toString('utf8');

  if (Buffer.byteLength(next, 'utf8') <= maxCapturedBytes) {
    return next;
  }

  return next.slice(0, maxCapturedBytes);
}
