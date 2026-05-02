import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { accessSync, constants, existsSync, statSync } from 'node:fs';
import { delimiter, join, resolve } from 'node:path';
import { hashText } from '@codexhub/evidence-kernel';

type JsonMetadata = Record<string, unknown>;
type EnvironmentSource = Record<string, string | undefined>;

export type CodexExecRealReadOnlyAdapterExecutablePolicyLabel = 'codex_cli';

export type CodexExecRealReadOnlyAdapterExecutableResolutionFailureCode =
  | 'executable_policy_forbidden'
  | 'executable_requires_shell'
  | 'executable_inaccessible'
  | 'executable_resolution_failed';

export type CodexExecRealReadOnlyAdapterResolvedExecutableKind =
  | 'native_exe'
  | 'bare_command'
  | 'shell_shim'
  | 'unknown';

export type CodexExecRealReadOnlyAdapterBoundaryStartFailureKind =
  | 'none'
  | 'enoent'
  | 'eacces'
  | 'eperm'
  | 'spawn_unknown'
  | 'cwd_missing'
  | 'cwd_not_directory'
  | 'executable_missing'
  | 'executable_inaccessible'
  | 'unknown';

export interface CodexExecRealReadOnlyAdapterExecutableResolutionInput {
  policyLabel: CodexExecRealReadOnlyAdapterExecutablePolicyLabel | string;
  env?: EnvironmentSource;
  platform?: NodeJS.Platform;
  pathDelimiter?: string;
  fileExists?: (path: string) => boolean;
  fileAccessible?: (path: string) => boolean;
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
  platform: string;
  resolvedExecutableKind: CodexExecRealReadOnlyAdapterResolvedExecutableKind;
  executableExists: boolean;
  executableAccessible: boolean;
}

export interface CodexExecRealReadOnlyAdapterExecutableResolved
  extends CodexExecRealReadOnlyAdapterExecutableResolutionBase {
  status: 'resolved';
  policyLabel: CodexExecRealReadOnlyAdapterExecutablePolicyLabel;
  executablePath: string;
  executablePathHash: string;
  env: Record<string, string>;
}

export interface CodexExecRealReadOnlyAdapterExecutableResolutionBlocked
  extends CodexExecRealReadOnlyAdapterExecutableResolutionBase {
  status: 'blocked';
  reasonCode: CodexExecRealReadOnlyAdapterExecutableResolutionFailureCode;
  directExecutableFound: false;
  shellShimDetected: boolean;
}

export interface CodexExecRealReadOnlyAdapterRuntimeCwdSelfCheck {
  status: 'passed' | 'blocked';
  cwdHash: string;
  cwdExists: boolean;
  cwdIsDirectory: boolean;
  cwdPathStored: false;
  metadataOnly: true;
  reasonCode?: 'cwd_missing' | 'cwd_not_directory';
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
  executableResolution?: Pick<
    CodexExecRealReadOnlyAdapterExecutableResolved,
    | 'platform'
    | 'resolvedExecutableKind'
    | 'executablePathHash'
    | 'executableExists'
    | 'executableAccessible'
    | 'envAllowlistKeyCount'
    | 'envAllowlistKeyHash'
  >;
  cwdSelfCheck?: CodexExecRealReadOnlyAdapterRuntimeCwdSelfCheck;
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
  startFailureKind?: CodexExecRealReadOnlyAdapterBoundaryStartFailureKind;
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
  startFailureKind: CodexExecRealReadOnlyAdapterBoundaryStartFailureKind;
  platform: string;
  resolvedExecutableKind: CodexExecRealReadOnlyAdapterResolvedExecutableKind;
  cwdHash?: string;
  cwdExists?: boolean;
  cwdIsDirectory?: boolean;
  executableExists?: boolean;
  executableAccessible?: boolean;
  envAllowlistKeyCount?: number;
  envAllowlistKeyHash?: string;
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

    const entry = readEnvironmentEntry(source, key);

    if (entry !== undefined && entry.value.length > 0) {
      allowed[entry.key] = entry.value;
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
  const keys = Object.keys(env)
    .map((key) => key.toLowerCase())
    .sort();

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
    platform,
    resolvedExecutableKind: 'unknown' as const,
    executableExists: false,
    executableAccessible: false,
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
  const fileAccessible = input.fileAccessible ?? isExecutablePathAccessible;
  const pathEntries = splitPathEntries(env.PATH, input.pathDelimiter ?? delimiter);
  const directExecutableNames = platform === 'win32' ? ['codex.exe', 'codex'] : ['codex'];
  const shellShimNames = platform === 'win32' ? ['codex.cmd', 'codex.bat'] : [];
  const directExecutable = findExecutablePath(
    pathEntries,
    directExecutableNames,
    fileExists,
  );

  if (directExecutable !== undefined) {
    const resolvedExecutableKind = classifyExecutableKind(directExecutable.name, platform);
    const executableAccessible = fileAccessible(directExecutable.path);

    if (!executableAccessible) {
      return {
        ...base,
        status: 'blocked',
        reasonCode: 'executable_inaccessible',
        directExecutableFound: false,
        shellShimDetected: false,
        resolvedExecutableKind,
        executableExists: true,
        executableAccessible: false,
      };
    }

    return {
      ...base,
      status: 'resolved',
      policyLabel: codexCliExecutablePolicyLabel,
      executablePath: directExecutable.path,
      executablePathHash: hashRuntimePath(directExecutable.path),
      env,
      resolvedExecutableKind,
      executableExists: true,
      executableAccessible: true,
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
    resolvedExecutableKind: shellShimDetected ? 'shell_shim' : 'unknown',
    executableExists: shellShimDetected,
    executableAccessible: false,
  };
}

export function createRealReadOnlyAdapterRuntimeCwdSelfCheck(input: {
  worktreePath: string;
  pathExists?: (path: string) => boolean;
  pathIsDirectory?: (path: string) => boolean;
}): CodexExecRealReadOnlyAdapterRuntimeCwdSelfCheck {
  const cwdHash = hashRuntimePath(input.worktreePath);
  const pathExists = input.pathExists ?? existsSync;
  const pathIsDirectory = input.pathIsDirectory ?? isDirectoryPath;
  const cwdExists = pathExists(input.worktreePath);
  const cwdIsDirectory = cwdExists && pathIsDirectory(input.worktreePath);

  return {
    status: cwdExists && cwdIsDirectory ? 'passed' : 'blocked',
    cwdHash,
    cwdExists,
    cwdIsDirectory,
    cwdPathStored: false,
    metadataOnly: true,
    reasonCode: !cwdExists ? 'cwd_missing' : cwdIsDirectory ? undefined : 'cwd_not_directory',
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

  const cwdSelfCheck =
    input.cwdSelfCheck ??
    createRealReadOnlyAdapterRuntimeCwdSelfCheck({
      worktreePath: input.worktreePath,
    });
  const executableResolution = input.executableResolution;

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
      platform: executableResolution?.platform ?? process.platform,
      resolvedExecutableKind: executableResolution?.resolvedExecutableKind ?? 'unknown',
      executablePathHash: executableResolution?.executablePathHash ?? hashRuntimePath(input.executablePath),
      executableExists: executableResolution?.executableExists ?? true,
      executableAccessible: executableResolution?.executableAccessible ?? true,
      envAllowlistKeyCount:
        executableResolution?.envAllowlistKeyCount ??
        summarizeRealReadOnlyAdapterAllowedProcessEnv(input.env ?? {}).envAllowlistKeyCount,
      envAllowlistKeyHash:
        executableResolution?.envAllowlistKeyHash ??
        summarizeRealReadOnlyAdapterAllowedProcessEnv(input.env ?? {}).envAllowlistKeyHash,
      cwdHash: cwdSelfCheck.cwdHash,
      cwdExists: cwdSelfCheck.cwdExists,
      cwdIsDirectory: cwdSelfCheck.cwdIsDirectory,
      cwdPathStored: false,
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
  const startFailureKind = runnerResult.startFailureKind ?? 'none';
  const platform = readStringMetadata(plan.metadata, 'platform') ?? process.platform;
  const resolvedExecutableKind = readExecutableKindMetadata(
    plan.metadata,
    'resolvedExecutableKind',
  );
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
    startFailureKind,
    platform,
    resolvedExecutableKind,
    cwdHash: readStringMetadata(plan.metadata, 'cwdHash'),
    cwdExists: readBooleanMetadata(plan.metadata, 'cwdExists'),
    cwdIsDirectory: readBooleanMetadata(plan.metadata, 'cwdIsDirectory'),
    executableExists: readBooleanMetadata(plan.metadata, 'executableExists'),
    executableAccessible: readBooleanMetadata(plan.metadata, 'executableAccessible'),
    envAllowlistKeyCount: readNumberMetadata(plan.metadata, 'envAllowlistKeyCount'),
    envAllowlistKeyHash: readStringMetadata(plan.metadata, 'envAllowlistKeyHash'),
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
      startFailureKind,
      platform,
      resolvedExecutableKind,
      cwdHash: readStringMetadata(plan.metadata, 'cwdHash'),
      cwdExists: readBooleanMetadata(plan.metadata, 'cwdExists'),
      cwdIsDirectory: readBooleanMetadata(plan.metadata, 'cwdIsDirectory'),
      executableExists: readBooleanMetadata(plan.metadata, 'executableExists'),
      executableAccessible: readBooleanMetadata(plan.metadata, 'executableAccessible'),
      envAllowlistKeyCount: readNumberMetadata(plan.metadata, 'envAllowlistKeyCount'),
      envAllowlistKeyHash: readStringMetadata(plan.metadata, 'envAllowlistKeyHash'),
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
        const startFailureKind = classifyProcessStartError(error);
        finish({
          exitCode: undefined,
          stderr: createProcessStartFailureSummary(startFailureKind),
          startFailureKind,
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
        const startFailureKind = classifyProcessStartError(error);
        finish({
          exitCode: undefined,
          stderr: createProcessStartFailureSummary(startFailureKind),
          timedOut,
          cancelled,
          startFailureKind,
        });
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

function readEnvironmentEntry(
  source: EnvironmentSource,
  key: string,
): { key: string; value: string } | undefined {
  const exactValue = source[key];
  if (exactValue !== undefined) {
    return { key, value: exactValue };
  }

  const matchingKey = Object.keys(source).find(
    (candidate) => candidate.toLowerCase() === key.toLowerCase(),
  );

  if (matchingKey === undefined) {
    return undefined;
  }

  const matchingValue = source[matchingKey];
  return matchingValue === undefined ? undefined : { key: matchingKey, value: matchingValue };
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
): { path: string; name: string } | undefined {
  for (const executableName of executableNames) {
    for (const pathEntry of pathEntries) {
      const candidate = join(pathEntry, executableName);

      if (fileExists(candidate)) {
        return { path: candidate, name: executableName };
      }
    }
  }

  return undefined;
}

function classifyExecutableKind(
  executableName: string,
  platform: NodeJS.Platform,
): CodexExecRealReadOnlyAdapterResolvedExecutableKind {
  const normalizedName = executableName.toLowerCase();

  if (platform === 'win32' && normalizedName.endsWith('.exe')) {
    return 'native_exe';
  }

  if (
    platform === 'win32' &&
    (normalizedName.endsWith('.cmd') || normalizedName.endsWith('.bat'))
  ) {
    return 'shell_shim';
  }

  return 'bare_command';
}

function isExecutablePathAccessible(path: string): boolean {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    try {
      accessSync(path, constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }
}

function isDirectoryPath(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function hashRuntimePath(path: string): string {
  return `sha256:${hashText(resolve(path).replace(/\\/g, '/'))}`;
}

function classifyProcessStartError(
  error: unknown,
): CodexExecRealReadOnlyAdapterBoundaryStartFailureKind {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code).toUpperCase()
      : '';

  if (code === 'ENOENT') {
    return 'enoent';
  }

  if (code === 'EACCES') {
    return 'eacces';
  }

  if (code === 'EPERM') {
    return 'eperm';
  }

  if (code === 'UNKNOWN') {
    return 'spawn_unknown';
  }

  return 'unknown';
}

function createProcessStartFailureSummary(
  kind: CodexExecRealReadOnlyAdapterBoundaryStartFailureKind,
): string {
  return `process boundary start failed: ${kind}`;
}

function readStringMetadata(metadata: JsonMetadata | undefined, key: string): string | undefined {
  const value = metadata?.[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readBooleanMetadata(metadata: JsonMetadata | undefined, key: string): boolean | undefined {
  const value = metadata?.[key];
  return typeof value === 'boolean' ? value : undefined;
}

function readNumberMetadata(metadata: JsonMetadata | undefined, key: string): number | undefined {
  const value = metadata?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function readExecutableKindMetadata(
  metadata: JsonMetadata | undefined,
  key: string,
): CodexExecRealReadOnlyAdapterResolvedExecutableKind {
  const value = metadata?.[key];
  return value === 'native_exe' ||
    value === 'bare_command' ||
    value === 'shell_shim' ||
    value === 'unknown'
    ? value
    : 'unknown';
}
