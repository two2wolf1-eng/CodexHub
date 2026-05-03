import { spawn } from 'node:child_process';
import {
  type AffectedProject,
  type VerificationCommandResult,
  type VerificationTarget,
  SchemaVersionSchema,
  VerificationCommandResultSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import { parseAffectedProjects, parseVerificationOutput } from './output-parser';
import { createAffectedProjectsArgv, createVerificationArgv } from './plan';

export type NxVerificationProcessStep = 'affected-projects' | 'verification';
export type NxVerificationProcessStartFailureKind = 'none' | 'spawn_error';

export interface NxVerificationProcessPlan {
  step: NxVerificationProcessStep;
  dryRunId: string;
  executablePath: string;
  argv: readonly string[];
  cwd: string;
  cwdHash: string;
  targets: VerificationTarget[];
  timeoutMs: number;
  shell: false;
  stdinBodyStored: false;
  argvStored: false;
  executablePathStored: false;
  outputBodyStored: false;
  metadataOnly: true;
}

export interface NxVerificationProcessRunnerResult {
  exitCode?: number;
  signal?: string;
  stdout?: string;
  stderr?: string;
  timedOut?: boolean;
  cancelled?: boolean;
  startFailureKind?: NxVerificationProcessStartFailureKind;
}

export interface NxVerificationProcessBoundaryResult {
  status: 'completed' | 'failed' | 'aborted';
  step: NxVerificationProcessStep;
  dryRunId: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  exitCode?: number;
  signal?: string;
  timedOut: boolean;
  cancelled: boolean;
  startFailureKind: NxVerificationProcessStartFailureKind;
  commandHash: string;
  cwdHash: string;
  targets: VerificationTarget[];
  stdoutHash: string;
  stderrHash: string;
  stdoutLineCount: number;
  stderrLineCount: number;
  shell: false;
  stdinBodyStored: false;
  argvStored: false;
  executablePathStored: false;
  outputBodyStored: false;
  metadataOnly: true;
  processBoundaryInvoked: true;
  externalProcessStarted: boolean;
  noRealWrite: true;
  affectedProjects: AffectedProject[];
  outputSummary: string;
  commandResult: VerificationCommandResult;
}

export interface NxVerificationProcessRunner {
  start(
    plan: NxVerificationProcessPlan,
    options?: { signal?: AbortSignal },
  ): Promise<NxVerificationProcessRunnerResult>;
}

export function createNxAffectedProjectsProcessPlan(input: {
  dryRunId: string;
  executablePath: string;
  cwd: string;
  cwdHash: string;
  baseRef?: string;
  headRef?: string;
  timeoutMs: number;
}): NxVerificationProcessPlan {
  return {
    step: 'affected-projects',
    dryRunId: input.dryRunId,
    executablePath: input.executablePath,
    argv: createAffectedProjectsArgv({ baseRef: input.baseRef, headRef: input.headRef }),
    cwd: input.cwd,
    cwdHash: input.cwdHash,
    targets: [],
    timeoutMs: input.timeoutMs,
    shell: false,
    stdinBodyStored: false,
    argvStored: false,
    executablePathStored: false,
    outputBodyStored: false,
    metadataOnly: true,
  };
}

export function createNxVerificationProcessPlan(input: {
  dryRunId: string;
  executablePath: string;
  cwd: string;
  cwdHash: string;
  targets: VerificationTarget[];
  baseRef?: string;
  headRef?: string;
  timeoutMs: number;
}): NxVerificationProcessPlan {
  return {
    step: 'verification',
    dryRunId: input.dryRunId,
    executablePath: input.executablePath,
    argv: createVerificationArgv({
      targets: input.targets,
      baseRef: input.baseRef,
      headRef: input.headRef,
    }),
    cwd: input.cwd,
    cwdHash: input.cwdHash,
    targets: input.targets,
    timeoutMs: input.timeoutMs,
    shell: false,
    stdinBodyStored: false,
    argvStored: false,
    executablePathStored: false,
    outputBodyStored: false,
    metadataOnly: true,
  };
}

export async function runNxVerificationProcessBoundary(
  plan: NxVerificationProcessPlan,
  options: {
    runner?: NxVerificationProcessRunner;
    signal?: AbortSignal;
    now?: () => string;
  } = {},
): Promise<NxVerificationProcessBoundaryResult> {
  const runner = options.runner ?? nodeNxVerificationProcessRunner;
  const now = options.now ?? (() => new Date().toISOString());
  const startedAt = now();
  const startedMs = Date.parse(startedAt);
  const runnerResult = await runner.start(plan, { signal: options.signal });
  const completedAt = now();
  const completedMs = Date.parse(completedAt);
  const timedOut = runnerResult.timedOut === true;
  const cancelled = runnerResult.cancelled === true || options.signal?.aborted === true;
  const startFailureKind = runnerResult.startFailureKind ?? 'none';
  const status =
    timedOut || cancelled
      ? 'aborted'
      : startFailureKind !== 'none' || runnerResult.exitCode !== 0
        ? 'failed'
        : 'completed';
  const stdout = runnerResult.stdout ?? '';
  const stderr = runnerResult.stderr ?? '';
  const stdoutHash = `sha256:${hashText(stdout)}`;
  const stderrHash = `sha256:${hashText(stderr)}`;
  const affectedProjects =
    plan.step === 'affected-projects' && status === 'completed'
      ? parseAffectedProjects(stdout)
      : [];
  const outputSummary =
    plan.step === 'verification'
      ? parseVerificationOutput([stdout, stderr].filter(Boolean).join('\n')).summary
      : `Affected project discovery returned ${affectedProjects.length} project(s).`;
  const commandHash = `sha256:${hashText(plan.argv.join('\u0000'))}`;
  const commandResult = VerificationCommandResultSchema.parse({
    id: foundationId('verification_command_result'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    commandKind: plan.step,
    targets: plan.targets,
    status,
    exitCode: runnerResult.exitCode,
    signal: runnerResult.signal,
    stdoutHash,
    stderrHash,
    stdoutLineCount: countTextLines(stdout),
    stderrLineCount: countTextLines(stderr),
    outputBodyStored: false,
    processBoundaryInvoked: true,
    externalProcessStarted: startFailureKind === 'none',
    summary: outputSummary,
    metadata: {
      dryRunId: plan.dryRunId,
      commandHash,
      startFailureKind,
      noRealWrite: true,
    },
  });

  return {
    status,
    step: plan.step,
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
    commandHash,
    cwdHash: plan.cwdHash,
    targets: plan.targets,
    stdoutHash,
    stderrHash,
    stdoutLineCount: countTextLines(stdout),
    stderrLineCount: countTextLines(stderr),
    shell: false,
    stdinBodyStored: false,
    argvStored: false,
    executablePathStored: false,
    outputBodyStored: false,
    metadataOnly: true,
    processBoundaryInvoked: true,
    externalProcessStarted: startFailureKind === 'none',
    noRealWrite: true,
    affectedProjects,
    outputSummary,
    commandResult,
  };
}

const nodeNxVerificationProcessRunner: NxVerificationProcessRunner = {
  start(plan, options = {}) {
    return new Promise<NxVerificationProcessRunnerResult>((resolveResult) => {
      const child = spawn(plan.executablePath, plan.argv, {
        cwd: plan.cwd,
        shell: false,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      let settled = false;
      let timedOut = false;
      let stdout = '';
      let stderr = '';
      const timer =
        plan.timeoutMs > 0
          ? setTimeout(() => {
              timedOut = true;
              child.kill();
            }, plan.timeoutMs)
          : undefined;

      child.stdin.end();
      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      child.stdout.on('data', (chunk: string) => {
        stdout += chunk;
      });
      child.stderr.on('data', (chunk: string) => {
        stderr += chunk;
      });
      child.on('error', () => {
        if (settled) {
          return;
        }

        settled = true;
        if (timer) {
          clearTimeout(timer);
        }
        resolveResult({
          stdout,
          stderr,
          startFailureKind: 'spawn_error',
        });
      });
      child.on('close', (exitCode, signal) => {
        if (settled) {
          return;
        }

        settled = true;
        if (timer) {
          clearTimeout(timer);
        }
        resolveResult({
          exitCode: exitCode ?? undefined,
          signal: signal ?? undefined,
          stdout,
          stderr,
          timedOut,
          cancelled: options.signal?.aborted === true,
          startFailureKind: 'none',
        });
      });
      options.signal?.addEventListener(
        'abort',
        () => {
          child.kill();
        },
        { once: true },
      );
    });
  },
};

function countTextLines(text: string): number {
  if (text.length === 0) {
    return 0;
  }

  return text.split(/\r?\n/).length;
}
