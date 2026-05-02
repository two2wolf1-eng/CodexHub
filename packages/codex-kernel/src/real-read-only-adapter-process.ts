import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { existsSync } from 'node:fs';
import { delimiter, join } from 'node:path';
import { hashText } from '@codexhub/evidence-kernel';

type JsonMetadata = Record<string, unknown>;
type EnvironmentSource = Record<string, string | undefined>;

export type CodexExecRealReadOnlyAdapterExecutablePolicyLabel = 'codex_cli';

export type CodexExecRealReadOnlyAdapterExecutableResolutionFailureCode =
  | 'executable_policy_forbidden'
  | 'executable_requires_shell'
  | 'executable_resolution_failed';

export interface CodexExecRealReadOnlyAdapterExecutableResolutionInput {
  policyLabel: CodexExecRealReadOnlyAdapterExecutablePolicyLabel | string;
  env?: EnvironmentSource;
  platform?: NodeJS.Platform;
  pathDelimiter?: string;
  fileExists?: (path: string) => boolean;
}

export interface CodexExecRealReadOnlyAdapterExecutableResolutionBase {
  policyLabel: CodexExecRealReadOnlyAdapterExecutablePolicyLabel | string;
  shell: false;
  executablePathStored: false;
  envPlanStored: false;
  argvStored: false;
  metadataOnly: true;
  envAllowlistKeyCount: number;
  envAllowlistKeyHash: string;
}

export interface CodexExecRealReadOnlyAdapterExecutableResolved
  extends CodexExecRealReadOnlyAdapterExecutableResolutionBase {
  status: 'resolved';
  policyLabel: CodexExecRealReadOnlyAdapterExecutablePolicyLabel;
  executablePath: string;
  env: Record<string, string>;
}

export interface CodexExecRealReadOnlyAdapterExecutableResolutionBlocked
  extends CodexExecRealReadOnlyAdapterExecutableResolutionBase {
  status: 'blocked';
  reasonCode: CodexExecRealReadOnlyAdapterExecutableResolutionFailureCode;
  directExecutableFound: false;
  shellShimDetected: boolean;
}

export type CodexExecRealReadOnlyAdapterExecutableResolution =
  | CodexExecRealReadOnlyAdapterExecutableResolved
  | CodexExecRealReadOnlyAdapterExecutableResolutionBlocked;

export interface CodexExecRealReadOnlyAdapterProcessPlanInput {
  dryRunId: string;
  approvalArtifactId: string;
  executablePath: string;
  executablePolicyLabel?: CodexExecRealReadOnlyAdapterExecutablePolicyLabel;
  worktreePath: string;
  env?: Record<string, string>;
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

export interface CodexExecRealReadOnlyAdapterPostRunVerificationPlanInput {
  dryRunId: string;
  executablePath?: string;
  worktreePath: string;
  timeoutMs: number;
  metadata?: JsonMetadata;
}

export interface CodexExecRealReadOnlyAdapterPostRunVerificationPlan {
  dryRunId: string;
  executablePath: string;
  argv: readonly ['verify:foundation'];
  cwd: string;
  env: Record<string, string>;
  shell: false;
  timeoutMs: number;
  postRunVerification: true;
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

export interface CodexExecRealReadOnlyAdapterPostRunWorktreeState {
  beforeStatus: 'clean';
  afterStatus: 'clean' | 'dirty' | 'unknown';
  unexpectedDiff: boolean;
  statusHash?: string;
}

export interface CodexExecRealReadOnlyAdapterPostRunVerificationResult {
  status: 'passed' | 'failed' | 'aborted' | 'critical';
  dryRunId: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  exitCode?: number;
  signal?: string;
  timedOut: boolean;
  cancelled: boolean;
  skippedBeforeStart: boolean;
  skipReason?: 'attempt_not_completed';
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
  workspaceMutationDetected: boolean;
  unexpectedWorkspaceDiffCritical: true;
  autoRevertAttempted: false;
  operatorReviewRequired: true;
  workspaceWriteAllowed: false;
  dangerFullAccessAllowed: false;
  dashboardTriggerAllowed: false;
  metadata?: JsonMetadata;
}

export interface CodexExecRealReadOnlyAdapterProcessRunner {
  start(
    plan:
      | CodexExecRealReadOnlyAdapterProcessPlan
      | CodexExecRealReadOnlyAdapterPostRunVerificationPlan,
    options: { signal?: AbortSignal },
  ): Promise<CodexExecRealReadOnlyAdapterProcessRunnerResult>;
}

const maxCapturedBytes = 64 * 1024;
const codexCliExecutablePolicyLabel = 'codex_cli' as const;
const safeProcessEnvKeys = [
  'PATH',
  'PATHEXT',
  'SystemRoot',
  'SYSTEMROOT',
  'WINDIR',
  'TEMP',
  'TMP',
] as const;

export function createRealReadOnlyAdapterAllowedProcessEnv(
  source: EnvironmentSource = process.env,
): Record<string, string> {
  const allowed: Record<string, string> = {};
  const observedKeys = new Set<string>();

  for (const key of safeProcessEnvKeys) {
    const normalizedKey = key.toLowerCase();

    if (observedKeys.has(normalizedKey)) {
      continue;
    }

    const value = readEnvironmentValue(source, key);

    if (value !== undefined && value.length > 0) {
      allowed[key] = value;
      observedKeys.add(normalizedKey);
    }
  }

  return allowed;
}

export function summarizeRealReadOnlyAdapterAllowedProcessEnv(
  env: Record<string, string>,
): Pick<
  CodexExecRealReadOnlyAdapterExecutableResolutionBase,
  'envAllowlistKeyCount' | 'envAllowlistKeyHash'
> {
  const keys = Object.keys(env).sort();

  return {
    envAllowlistKeyCount: keys.length,
    envAllowlistKeyHash: `sha256:${hashText(keys.join('\n'))}`,
  };
}

export function resolveRealReadOnlyAdapterExecutable(
  input: CodexExecRealReadOnlyAdapterExecutableResolutionInput,
): CodexExecRealReadOnlyAdapterExecutableResolution {
  const platform = input.platform ?? process.platform;
  const env = createRealReadOnlyAdapterAllowedProcessEnv(input.env ?? process.env);
  const envSummary = summarizeRealReadOnlyAdapterAllowedProcessEnv(env);
  const base = {
    policyLabel: input.policyLabel,
    shell: false as const,
    executablePathStored: false as const,
    envPlanStored: false as const,
    argvStored: false as const,
    metadataOnly: true as const,
    ...envSummary,
  };

  if (input.policyLabel !== codexCliExecutablePolicyLabel) {
    return {
      ...base,
      status: 'blocked',
      reasonCode: 'executable_policy_forbidden',
      directExecutableFound: false,
      shellShimDetected: false,
    };
  }

  const fileExists = input.fileExists ?? existsSync;
  const pathEntries = splitPathEntries(env.PATH, input.pathDelimiter ?? delimiter);
  const directExecutableNames = platform === 'win32' ? ['codex.exe', 'codex'] : ['codex'];
  const shellShimNames = platform === 'win32' ? ['codex.cmd', 'codex.bat'] : [];
  const directExecutablePath = findExecutablePath(
    pathEntries,
    directExecutableNames,
    fileExists,
  );

  if (directExecutablePath !== undefined) {
    return {
      ...base,
      status: 'resolved',
      policyLabel: codexCliExecutablePolicyLabel,
      executablePath: directExecutablePath,
      env,
    };
  }

  const shellShimDetected =
    shellShimNames.length > 0 &&
    findExecutablePath(pathEntries, shellShimNames, fileExists) !== undefined;

  return {
    ...base,
    status: 'blocked',
    reasonCode: shellShimDetected ? 'executable_requires_shell' : 'executable_resolution_failed',
    directExecutableFound: false,
    shellShimDetected,
  };
}

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
    env: input.env ?? {},
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
      executablePolicyLabel: input.executablePolicyLabel ?? codexCliExecutablePolicyLabel,
      shell: false,
      readOnly: true,
      envPlanStored: false,
    },
  };
}

export function createRealReadOnlyAdapterPostRunVerificationPlan(
  input: CodexExecRealReadOnlyAdapterPostRunVerificationPlanInput,
): CodexExecRealReadOnlyAdapterPostRunVerificationPlan {
  if (input.dryRunId.trim().length === 0) {
    throw new Error('dryRunId is required before post-run verification planning');
  }

  if (input.worktreePath.trim().length === 0) {
    throw new Error('worktreePath is required before post-run verification planning');
  }

  if (!Number.isInteger(input.timeoutMs) || input.timeoutMs < 1 || input.timeoutMs > 600_000) {
    throw new Error('timeoutMs must be between 1 and 600000 milliseconds');
  }

  return {
    dryRunId: input.dryRunId,
    executablePath: input.executablePath ?? 'pnpm',
    argv: ['verify:foundation'],
    cwd: input.worktreePath,
    env: {},
    shell: false,
    timeoutMs: input.timeoutMs,
    postRunVerification: true,
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
      source: 'codex-kernel.real-read-only-adapter.post-run-verification-plan',
      shell: false,
      postRunVerification: true,
      operatorReviewRequired: true,
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

export async function runRealReadOnlyAdapterPostRunVerification(
  plan: CodexExecRealReadOnlyAdapterPostRunVerificationPlan,
  options: {
    attemptStatus: 'completed' | 'failed' | 'aborted' | 'blocked' | 'not_started';
    worktreeState: CodexExecRealReadOnlyAdapterPostRunWorktreeState;
    runner?: CodexExecRealReadOnlyAdapterProcessRunner;
    signal?: AbortSignal;
    now?: () => string;
  },
): Promise<CodexExecRealReadOnlyAdapterPostRunVerificationResult> {
  const now = options.now ?? (() => new Date().toISOString());
  const startedAt = now();
  const startedMs = Date.parse(startedAt);

  if (options.attemptStatus !== 'completed') {
    const completedAt = now();
    const completedMs = Date.parse(completedAt);

    return {
      status: 'aborted',
      dryRunId: plan.dryRunId,
      startedAt,
      completedAt,
      durationMs:
        Number.isFinite(startedMs) && Number.isFinite(completedMs)
          ? Math.max(0, completedMs - startedMs)
          : 0,
      timedOut: false,
      cancelled: false,
      skippedBeforeStart: true,
      skipReason: 'attempt_not_completed',
      stdoutSummary: summarizeProcessOutput('stdout', ''),
      stderrSummary: summarizeProcessOutput('stderr', ''),
      shell: false,
      commandBodyStored: false,
      argvStored: false,
      executablePathStored: false,
      envPlanStored: false,
      stdoutBodyStored: false,
      stderrBodyStored: false,
      metadataOnly: true,
      externalProcessStarted: false,
      workspaceMutationDetected: false,
      unexpectedWorkspaceDiffCritical: true,
      autoRevertAttempted: false,
      operatorReviewRequired: true,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
      metadata: {
        source: 'codex-kernel.real-read-only-adapter.post-run-verification',
        skippedBeforeStart: true,
        skipReason: 'attempt_not_completed',
        outputBodyStored: false,
      },
    };
  }

  const runner = options.runner ?? nodeRealReadOnlyAdapterProcessRunner;
  const runnerResult = await runner.start(plan, { signal: options.signal });
  const completedAt = now();
  const completedMs = Date.parse(completedAt);
  const timedOut = runnerResult.timedOut === true;
  const cancelled = runnerResult.cancelled === true || options.signal?.aborted === true;
  const workspaceMutationDetected =
    options.worktreeState.afterStatus !== 'clean' || options.worktreeState.unexpectedDiff;
  const status =
    workspaceMutationDetected
      ? 'critical'
      : timedOut || cancelled
        ? 'aborted'
        : runnerResult.exitCode === 0
          ? 'passed'
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
    skippedBeforeStart: false,
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
    workspaceMutationDetected,
    unexpectedWorkspaceDiffCritical: true,
    autoRevertAttempted: false,
    operatorReviewRequired: true,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
    dashboardTriggerAllowed: false,
    metadata: {
      source: 'codex-kernel.real-read-only-adapter.post-run-verification',
      outputBodyStored: false,
      workspaceBeforeStatus: options.worktreeState.beforeStatus,
      workspaceAfterStatus: options.worktreeState.afterStatus,
      unexpectedDiff: options.worktreeState.unexpectedDiff,
      statusHash: options.worktreeState.statusHash,
      operatorReviewRequired: true,
      autoRevertAttempted: false,
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

function readEnvironmentValue(source: EnvironmentSource, key: string): string | undefined {
  if (source[key] !== undefined) {
    return source[key];
  }

  const matchingKey = Object.keys(source).find(
    (candidate) => candidate.toLowerCase() === key.toLowerCase(),
  );

  return matchingKey === undefined ? undefined : source[matchingKey];
}

function splitPathEntries(pathValue: string | undefined, pathDelimiter: string): string[] {
  if (pathValue === undefined || pathValue.trim().length === 0) {
    return [];
  }

  return pathValue
    .split(pathDelimiter)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function findExecutablePath(
  pathEntries: string[],
  executableNames: string[],
  fileExists: (path: string) => boolean,
): string | undefined {
  for (const executableName of executableNames) {
    for (const pathEntry of pathEntries) {
      const candidate = join(pathEntry, executableName);

      if (fileExists(candidate)) {
        return candidate;
      }
    }
  }

  return undefined;
}
