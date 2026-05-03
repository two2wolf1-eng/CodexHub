import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { relative, resolve } from 'node:path';
import { RepoRelativePathSchema } from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import type { WorktreeManagerFixtureRunnerResult } from './execute';

export type ControlledGitCommandKind =
  | 'repo-root-preflight'
  | 'worktree-add-detach'
  | 'diff-name-only'
  | 'diff-numstat';

export interface ControlledGitRuntimeInput {
  repoRoot: string;
  worktreePath: string;
  baseRef: string;
}

export interface ControlledGitCommand {
  command: 'git';
  args: string[];
  shell: false;
}

export interface ControlledGitCommandResult {
  kind: ControlledGitCommandKind;
  exitCode: number | null;
  stdoutHash: string;
  stderrHash: string;
  stdoutLineCount: number;
  stderrLineCount: number;
  externalProcessStarted: boolean;
}

export interface ControlledGitCommandOutput extends ControlledGitCommandResult {
  stdout: string;
  stderr: string;
}

export type ControlledGitCommandRunner = (
  kind: ControlledGitCommandKind,
  input: ControlledGitRuntimeInput,
) => Promise<ControlledGitCommandOutput>;

export function buildControlledGitCommand(
  kind: ControlledGitCommandKind,
  input: ControlledGitRuntimeInput,
): ControlledGitCommand {
  const repoRoot = resolve(input.repoRoot);
  const worktreePath = resolve(input.worktreePath);

  if (kind === 'repo-root-preflight') {
    return {
      command: 'git',
      args: ['-C', repoRoot, 'rev-parse', '--show-toplevel'],
      shell: false,
    };
  }

  if (kind === 'worktree-add-detach') {
    return {
      command: 'git',
      args: ['-C', repoRoot, 'worktree', 'add', '--detach', worktreePath, input.baseRef],
      shell: false,
    };
  }

  if (kind === 'diff-name-only') {
    return {
      command: 'git',
      args: ['-C', worktreePath, 'diff', '--name-only', '--no-ext-diff'],
      shell: false,
    };
  }

  return {
    command: 'git',
    args: ['-C', worktreePath, 'diff', '--numstat', '--no-ext-diff'],
    shell: false,
  };
}

export function hashControlledGitCommand(
  kind: ControlledGitCommandKind,
  input: ControlledGitRuntimeInput,
): string {
  const command = buildControlledGitCommand(kind, input);
  const sanitizedShape = {
    kind,
    command: command.command,
    argCount: command.args.length,
    optionShape: command.args.map((arg) => (arg.startsWith('-') ? arg : '<value>')),
    shell: command.shell,
  };
  return `sha256:${hashText(JSON.stringify(sanitizedShape))}`;
}

export function createControlledGitWorktreeRunner(
  input: ControlledGitRuntimeInput,
  commandRunner: ControlledGitCommandRunner = runControlledGitCommand,
) {
  return {
    async run(): Promise<WorktreeManagerFixtureRunnerResult> {
      const commandKinds: ControlledGitCommandKind[] = [
        'repo-root-preflight',
        'worktree-add-detach',
        'diff-name-only',
        'diff-numstat',
      ];
      const results: ControlledGitCommandOutput[] = [];

      for (const kind of commandKinds) {
        const result = await commandRunner(kind, input);
        results.push(result);
        if (result.exitCode !== 0) {
          return createGitRunnerResult('failed', input, results, '');
        }
      }

      const nameOnlyOutput = results.find((result) => result.kind === 'diff-name-only');
      const numstatOutput = results.find((result) => result.kind === 'diff-numstat');
      if (!nameOnlyOutput || !numstatOutput) {
        return createGitRunnerResult('failed', input, results, '');
      }
      const changedFiles = parseChangedFiles(nameOnlyOutput.stdout);

      return {
        ...createGitRunnerResult('completed', input, results, numstatOutput.stdout),
        changedFiles,
        diffText: numstatOutput.stdout,
        diffLineCount: countLines(numstatOutput.stdout),
      };
    },
  };
}

async function runControlledGitCommand(
  kind: ControlledGitCommandKind,
  input: ControlledGitRuntimeInput,
): Promise<ControlledGitCommandOutput> {
  const output = await runControlledGitCommandWithOutput(kind, input);
  return {
    kind,
    exitCode: output.exitCode,
    stdoutHash: `sha256:${hashText(output.stdout)}`,
    stderrHash: `sha256:${hashText(output.stderr)}`,
    stdoutLineCount: countLines(output.stdout),
    stderrLineCount: countLines(output.stderr),
    externalProcessStarted: output.externalProcessStarted,
    stdout: output.stdout,
    stderr: output.stderr,
  };
}

async function runControlledGitCommandWithOutput(
  kind: ControlledGitCommandKind,
  input: ControlledGitRuntimeInput,
): Promise<{
  exitCode: number | null;
  stdout: string;
  stderr: string;
  externalProcessStarted: boolean;
}> {
  const command = buildControlledGitCommand(kind, input);

  return await new Promise((resolvePromise) => {
    let externalProcessStarted = false;
    const child = spawn(command.command, command.args, {
      shell: command.shell,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];

    externalProcessStarted = true;
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
    child.on('error', (error) => {
      resolvePromise({
        exitCode: 1,
        stdout: '',
        stderr: error.message,
        externalProcessStarted,
      });
    });
    child.on('close', (exitCode) => {
      resolvePromise({
        exitCode,
        stdout: Buffer.concat(stdout).toString('utf8'),
        stderr: Buffer.concat(stderr).toString('utf8'),
        externalProcessStarted,
      });
    });
  });
}

function createGitRunnerResult(
  status: 'completed' | 'failed',
  input: ControlledGitRuntimeInput,
  results: readonly ControlledGitCommandResult[],
  diffText: string,
): WorktreeManagerFixtureRunnerResult {
  const cleanupRequired = results.some(
    (result) => result.kind === 'worktree-add-detach' && result.externalProcessStarted,
  );
  const commandSummaryHash = createHash('sha256')
    .update(
      JSON.stringify(
        results.map((result) => ({
          kind: result.kind,
          exitCode: result.exitCode,
          stdoutHash: result.stdoutHash,
          stderrHash: result.stderrHash,
          stdoutLineCount: result.stdoutLineCount,
          stderrLineCount: result.stderrLineCount,
        })),
      ),
    )
    .digest('hex');

  return {
    status,
    diffText,
    diffHash: `sha256:${hashText(diffText)}`,
    commandSummaryHash: `sha256:${commandSummaryHash}`,
    gitProcessBoundaryInvoked: results.some((result) => result.externalProcessStarted),
    processBoundaryInvoked: results.some((result) => result.externalProcessStarted),
    externalProcessStarted: results.some((result) => result.externalProcessStarted),
    noRealWrite: !cleanupRequired,
    cleanupRequired,
    cleanupDeferred: cleanupRequired,
    summary:
      status === 'completed'
        ? `Controlled git worktree boundary completed with ${results.length} fixed commands.`
        : 'Controlled git worktree boundary failed before producing patch metadata.',
  };
}

function parseChangedFiles(stdout: string): string[] {
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((file) => normalizeRepoRelativePath(file))
    .filter((file): file is string => Boolean(file))
    .filter((file) => RepoRelativePathSchema.safeParse(file).success);
}

function normalizeRepoRelativePath(file: string): string | undefined {
  if (file.includes('\\')) {
    return file.replace(/\\/g, '/');
  }
  if (file.startsWith('/') || /^[A-Za-z]:/.test(file)) {
    return undefined;
  }
  const normalized = relative('.', resolve('.', file)).replace(/\\/g, '/');
  return normalized.startsWith('..') ? undefined : file;
}

function countLines(text: string): number {
  return text.length === 0 ? 0 : text.split(/\r?\n/).filter((line) => line.length > 0).length;
}
