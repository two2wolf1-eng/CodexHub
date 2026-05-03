import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import {
  accessSync,
  constants,
  existsSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from 'node:fs';
import { basename, delimiter, dirname, isAbsolute, join, resolve } from 'node:path';
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

export type CodexExecRealReadOnlyAdapterEnoentKind =
  | 'none'
  | 'cwd_enoent'
  | 'executable_enoent'
  | 'windows_app_alias_enoent'
  | 'dependency_or_spawn_target_enoent'
  | 'unknown';

export type CodexExecRealReadOnlyAdapterSpawnTargetKind =
  | 'native_exe'
  | 'bare_command'
  | 'trusted_shell_shim_target'
  | 'windows_app_alias'
  | 'unknown';

export type CodexExecRealReadOnlyAdapterExecutableResolutionSource =
  | 'none'
  | 'direct_path'
  | 'trusted_shell_shim_target'
  | 'blocked_shell_shim'
  | 'blocked_windows_app_alias'
  | 'not_found';

export type CodexExecRealReadOnlyAdapterDependencyResolutionStatus =
  | 'not_applicable'
  | 'not_checked'
  | 'dependency_missing_suspected'
  | 'spawn_target_mismatch_suspected'
  | 'unknown';

export type CodexExecRealReadOnlyAdapterNonzeroExitKind =
  | 'codex_cli_usage_error_suspected'
  | 'codex_cli_input_missing_suspected'
  | 'codex_cli_auth_or_config_error_suspected'
  | 'codex_cli_runtime_error_suspected'
  | 'unknown';

export const REAL_READ_ONLY_ADAPTER_CODEX_CLI_INVOCATION_CONTRACT_VERSION =
  'codex_cli_invocation_v3_json_read_only_ephemeral_governed_file_arg_no_stdin_body';

export const REAL_READ_ONLY_ADAPTER_CODEX_CLI_PROCESS_ARGV = Object.freeze([
  'exec',
  '--json',
  '--sandbox',
  'read-only',
  '--ephemeral',
] as const);

export const REAL_READ_ONLY_ADAPTER_CODEX_CLI_PROCESS_ARGV_HASH = `sha256:${hashText(
  JSON.stringify(REAL_READ_ONLY_ADAPTER_CODEX_CLI_PROCESS_ARGV),
)}`;

export type CodexExecRealReadOnlyAdapterGovernedInputSourceKind = 'governed_file';

export type CodexExecRealReadOnlyAdapterGovernedInputVerificationFailureCode =
  | 'governed_input_missing'
  | 'governed_input_relative_path_required'
  | 'governed_input_absolute_path_forbidden'
  | 'governed_input_parent_traversal_forbidden'
  | 'governed_input_symlink_escape_forbidden'
  | 'governed_input_file_missing'
  | 'governed_input_file_not_readable'
  | 'governed_input_hash_mismatch';

export interface CodexExecRealReadOnlyAdapterGovernedInputSource {
  sourceKind: CodexExecRealReadOnlyAdapterGovernedInputSourceKind;
  relativePath: string;
  expectedContentHash: string;
}

export interface CodexExecRealReadOnlyAdapterGovernedInputVerificationBase {
  sourceKind: CodexExecRealReadOnlyAdapterGovernedInputSourceKind;
  relativePath?: string;
  relativePathHash?: string;
  expectedContentHash?: string;
  contentHash?: string;
  byteLength?: number;
  lineCount?: number;
  bodyStored: false;
  promptBodyStored: false;
  stdinBodyStored: false;
  promptArgumentStored: false;
  metadataOnly: true;
}

export interface CodexExecRealReadOnlyAdapterGovernedInputVerificationVerified
  extends CodexExecRealReadOnlyAdapterGovernedInputVerificationBase {
  status: 'verified';
  sourceKind: 'governed_file';
  relativePath: string;
  relativePathHash: string;
  expectedContentHash: string;
  contentHash: string;
  byteLength: number;
  lineCount: number;
}

export interface CodexExecRealReadOnlyAdapterGovernedInputVerificationBlocked
  extends CodexExecRealReadOnlyAdapterGovernedInputVerificationBase {
  status: 'blocked';
  reasonCode: CodexExecRealReadOnlyAdapterGovernedInputVerificationFailureCode;
}

export type CodexExecRealReadOnlyAdapterGovernedInputVerification =
  | CodexExecRealReadOnlyAdapterGovernedInputVerificationVerified
  | CodexExecRealReadOnlyAdapterGovernedInputVerificationBlocked;

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
  readTextFile?: (path: string) => string | undefined;
  listDirectoryNames?: (path: string) => string[];
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
  spawnTargetKind: CodexExecRealReadOnlyAdapterSpawnTargetKind;
  executableResolutionSource: CodexExecRealReadOnlyAdapterExecutableResolutionSource;
  executableExists: boolean;
  executableAccessible: boolean;
  executableAccessProbePassed?: boolean;
  windowsNativeExecutableAccessProbeBypassed?: boolean;
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
  governedInput?: CodexExecRealReadOnlyAdapterGovernedInputVerification;
  env?: Record<string, string>;
  timeoutMs: number;
  executableResolution?: Pick<
    CodexExecRealReadOnlyAdapterExecutableResolved,
    | 'platform'
    | 'resolvedExecutableKind'
    | 'executablePathHash'
    | 'executableExists'
    | 'executableAccessible'
    | 'executableAccessProbePassed'
    | 'windowsNativeExecutableAccessProbeBypassed'
    | 'envAllowlistKeyCount'
    | 'envAllowlistKeyHash'
  > &
    Partial<
      Pick<
        CodexExecRealReadOnlyAdapterExecutableResolved,
        'spawnTargetKind' | 'executableResolutionSource'
      >
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
  stdinBodyStored: false;
  stdinClosedWithoutBody: true;
  governedInputRequired: true;
  governedInputProvided: boolean;
  governedInputVerified: boolean;
  governedInputSourceKind?: CodexExecRealReadOnlyAdapterGovernedInputSourceKind;
  governedInputRelativePathHash?: string;
  governedInputContentHash?: string;
  governedInputByteLength?: number;
  governedInputLineCount?: number;
  promptArgumentHash?: string;
  promptArgumentStored: false;
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
  nonzeroExitKind?: CodexExecRealReadOnlyAdapterNonzeroExitKind;
  signal?: string;
  timedOut: boolean;
  cancelled: boolean;
  startFailureKind: CodexExecRealReadOnlyAdapterBoundaryStartFailureKind;
  enoentKind?: CodexExecRealReadOnlyAdapterEnoentKind;
  platform: string;
  resolvedExecutableKind: CodexExecRealReadOnlyAdapterResolvedExecutableKind;
  spawnTargetKind?: CodexExecRealReadOnlyAdapterSpawnTargetKind;
  cwdHash?: string;
  cwdExists?: boolean;
  cwdIsDirectory?: boolean;
  executableHash?: string;
  executableExists?: boolean;
  executableAccessible?: boolean;
  executableResolutionSource?: CodexExecRealReadOnlyAdapterExecutableResolutionSource;
  dependencyResolutionStatus?: CodexExecRealReadOnlyAdapterDependencyResolutionStatus;
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
  governedInputRequired: true;
  governedInputProvided: boolean;
  governedInputVerified: boolean;
  governedInputSourceKind?: CodexExecRealReadOnlyAdapterGovernedInputSourceKind;
  governedInputRelativePathHash?: string;
  governedInputContentHash?: string;
  governedInputByteLength?: number;
  governedInputLineCount?: number;
  promptArgumentHash?: string;
  promptArgumentStored: false;
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
    spawnTargetKind: 'unknown' as const,
    executableResolutionSource: 'none' as const,
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
  const readTextFile = input.readTextFile ?? readTextFileFromDisk;
  const listDirectoryNames = input.listDirectoryNames ?? listDirectoryNamesFromDisk;
  const pathEntries = splitPathEntries(env.PATH, input.pathDelimiter ?? delimiter);
  const directExecutableNames = platform === 'win32' ? ['codex.exe', 'codex'] : ['codex'];
  const shellShimNames = platform === 'win32' ? ['codex.cmd', 'codex.bat'] : [];
  const directExecutables = findExecutablePaths(pathEntries, directExecutableNames, fileExists);
  const windowsAppAliasDetected = directExecutables.some((candidate) =>
    isWindowsPackagedAppResource(candidate.path, platform),
  );
  const directExecutableCandidates = directExecutables
    .filter((candidate) => !isWindowsPackagedAppResource(candidate.path, platform))
    .map((candidate) => {
      const resolvedExecutableKind = classifyExecutableKind(candidate.name, platform);
      const spawnTargetKind = classifySpawnTargetKind(resolvedExecutableKind);
      const executableAccessProbePassed = fileAccessible(candidate.path);
      const windowsNativeExecutableAccessProbeBypassed =
        shouldBypassWindowsNativeExecutableAccessProbe({
          executableName: candidate.name,
          platform,
          accessProbePassed: executableAccessProbePassed,
        });
      const executableAccessible =
        executableAccessProbePassed || windowsNativeExecutableAccessProbeBypassed;

      return {
        ...candidate,
        resolvedExecutableKind,
        spawnTargetKind,
        executableAccessProbePassed,
        windowsNativeExecutableAccessProbeBypassed,
        executableAccessible,
      };
    });
  const directExecutable =
    directExecutableCandidates.find(
      (candidate) =>
        candidate.executableAccessProbePassed && candidate.resolvedExecutableKind === 'native_exe',
    ) ??
    directExecutableCandidates.find(
      (candidate) =>
        candidate.executableAccessible && candidate.resolvedExecutableKind === 'native_exe',
    ) ??
    directExecutableCandidates.find((candidate) => candidate.executableAccessProbePassed) ??
    directExecutableCandidates.find((candidate) => candidate.executableAccessible);

  if (directExecutable !== undefined) {
    return {
      ...base,
      status: 'resolved',
      policyLabel: codexCliExecutablePolicyLabel,
      executablePath: directExecutable.path,
      executablePathHash: hashRuntimePath(directExecutable.path),
      env,
      resolvedExecutableKind: directExecutable.resolvedExecutableKind,
      spawnTargetKind: directExecutable.spawnTargetKind,
      executableResolutionSource: 'direct_path',
      executableExists: true,
      executableAccessible: true,
      executableAccessProbePassed: directExecutable.executableAccessProbePassed,
      windowsNativeExecutableAccessProbeBypassed:
        directExecutable.windowsNativeExecutableAccessProbeBypassed,
    };
  }

  const inaccessibleDirectExecutable = directExecutableCandidates[0];
  if (inaccessibleDirectExecutable !== undefined) {
    return {
      ...base,
      status: 'blocked',
      reasonCode: 'executable_inaccessible',
      directExecutableFound: false,
      shellShimDetected: false,
      resolvedExecutableKind: inaccessibleDirectExecutable.resolvedExecutableKind,
      spawnTargetKind: inaccessibleDirectExecutable.spawnTargetKind,
      executableResolutionSource: 'direct_path',
      executableExists: true,
      executableAccessible: false,
      executableAccessProbePassed: inaccessibleDirectExecutable.executableAccessProbePassed,
      windowsNativeExecutableAccessProbeBypassed:
        inaccessibleDirectExecutable.windowsNativeExecutableAccessProbeBypassed,
    };
  }

  const shellShim = findExecutablePath(pathEntries, shellShimNames, fileExists);
  const trustedShimTarget =
    shellShim === undefined
      ? undefined
      : resolveTrustedCodexShellShimTarget(shellShim.path, {
          platform,
          readTextFile,
        });

  const trustedResolvedTarget =
    trustedShimTarget === undefined
      ? undefined
      : fileExists(trustedShimTarget.path)
        ? trustedShimTarget
        : resolveLatestTrustedCodexExtensionTarget(trustedShimTarget.path, {
            platform,
            fileExists,
            listDirectoryNames,
          });

  if (
    trustedResolvedTarget !== undefined &&
    !isWindowsPackagedAppResource(trustedResolvedTarget.path, platform)
  ) {
    const resolvedExecutableKind = classifyExecutableKind(trustedResolvedTarget.name, platform);
    const spawnTargetKind = classifySpawnTargetKind(resolvedExecutableKind);
    const executableExists = fileExists(trustedResolvedTarget.path);
    const executableAccessProbePassed =
      executableExists && fileAccessible(trustedResolvedTarget.path);
    const windowsNativeExecutableAccessProbeBypassed =
      shouldBypassWindowsNativeExecutableAccessProbe({
        executableName: trustedResolvedTarget.name,
        platform,
        accessProbePassed: executableAccessProbePassed,
      });
    const executableAccessible =
      executableExists &&
      (executableAccessProbePassed || windowsNativeExecutableAccessProbeBypassed);

    if (!executableAccessible) {
      return {
        ...base,
        status: 'blocked',
        reasonCode: executableExists ? 'executable_inaccessible' : 'executable_resolution_failed',
        directExecutableFound: false,
        shellShimDetected: true,
        resolvedExecutableKind,
        spawnTargetKind,
        executableResolutionSource: 'trusted_shell_shim_target',
        executableExists,
        executableAccessible: false,
        executableAccessProbePassed,
        windowsNativeExecutableAccessProbeBypassed,
      };
    }

    return {
      ...base,
      status: 'resolved',
      policyLabel: codexCliExecutablePolicyLabel,
      executablePath: trustedResolvedTarget.path,
      executablePathHash: hashRuntimePath(trustedResolvedTarget.path),
      env,
      resolvedExecutableKind,
      spawnTargetKind,
      executableResolutionSource: 'trusted_shell_shim_target',
      executableExists: true,
      executableAccessible: true,
      executableAccessProbePassed,
      windowsNativeExecutableAccessProbeBypassed,
    };
  }

  if (trustedShimTarget !== undefined && trustedResolvedTarget === undefined) {
    return {
      ...base,
      status: 'blocked',
      reasonCode: 'executable_resolution_failed',
      directExecutableFound: false,
      shellShimDetected: true,
      resolvedExecutableKind: classifyExecutableKind(trustedShimTarget.name, platform),
      spawnTargetKind: 'trusted_shell_shim_target',
      executableResolutionSource: 'trusted_shell_shim_target',
      executableExists: false,
      executableAccessible: false,
      executableAccessProbePassed: false,
      windowsNativeExecutableAccessProbeBypassed: false,
    };
  }

  const shellShimDetected =
    shellShim !== undefined ||
    windowsAppAliasDetected;

  return {
    ...base,
    status: 'blocked',
    reasonCode: shellShimDetected ? 'executable_requires_shell' : 'executable_resolution_failed',
    directExecutableFound: false,
    shellShimDetected,
    resolvedExecutableKind: shellShimDetected ? 'shell_shim' : 'unknown',
    spawnTargetKind: windowsAppAliasDetected ? 'windows_app_alias' : 'unknown',
    executableResolutionSource: windowsAppAliasDetected
      ? 'blocked_windows_app_alias'
      : shellShimDetected
        ? 'blocked_shell_shim'
        : 'not_found',
    executableExists: shellShimDetected,
    executableAccessible: false,
  };
}

function resolveLatestTrustedCodexExtensionTarget(
  missingShimTargetPath: string,
  options: {
    platform: NodeJS.Platform;
    fileExists: (path: string) => boolean;
    listDirectoryNames: (path: string) => string[];
  },
): { path: string; name: string } | undefined {
  if (options.platform !== 'win32') {
    return undefined;
  }

  const targetName = basename(missingShimTargetPath).toLowerCase();
  const architectureDir = dirname(missingShimTargetPath);
  const binDir = dirname(architectureDir);
  const extensionDir = dirname(binDir);
  const extensionsRoot = dirname(extensionDir);
  const extensionName = basename(extensionDir).toLowerCase();

  if (
    targetName !== 'codex.exe' ||
    basename(architectureDir).toLowerCase() !== 'windows-x86_64' ||
    basename(binDir).toLowerCase() !== 'bin' ||
    !extensionName.startsWith('openai.chatgpt-') ||
    !extensionName.endsWith('-win32-x64')
  ) {
    return undefined;
  }

  const latestCandidate = options
    .listDirectoryNames(extensionsRoot)
    .filter((name) => {
      const normalized = name.toLowerCase();
      return normalized.startsWith('openai.chatgpt-') && normalized.endsWith('-win32-x64');
    })
    .sort()
    .reverse()
    .map((name) => join(extensionsRoot, name, 'bin', 'windows-x86_64', 'codex.exe'))
    .find((candidate) => options.fileExists(candidate));

  return latestCandidate === undefined
    ? undefined
    : {
        path: latestCandidate,
        name: basename(latestCandidate),
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

export function createBlockedRealReadOnlyAdapterGovernedInputVerification(
  reasonCode: CodexExecRealReadOnlyAdapterGovernedInputVerificationFailureCode,
  input: Partial<CodexExecRealReadOnlyAdapterGovernedInputSource> = {},
): CodexExecRealReadOnlyAdapterGovernedInputVerificationBlocked {
  const relativePath =
    typeof input.relativePath === 'string' && input.relativePath.trim().length > 0
      ? normalizeGovernedInputRelativePath(input.relativePath)
      : undefined;

  return {
    status: 'blocked',
    reasonCode,
    sourceKind: input.sourceKind ?? 'governed_file',
    relativePath,
    relativePathHash: relativePath ? hashGovernedInputRelativePath(relativePath) : undefined,
    expectedContentHash: input.expectedContentHash,
    bodyStored: false,
    promptBodyStored: false,
    stdinBodyStored: false,
    promptArgumentStored: false,
    metadataOnly: true,
  };
}

export function verifyRealReadOnlyAdapterGovernedInputSource(input: {
  worktreePath: string;
  source?: CodexExecRealReadOnlyAdapterGovernedInputSource;
  readTextFile?: (path: string) => string;
  pathExists?: (path: string) => boolean;
  realPath?: (path: string) => string;
}): CodexExecRealReadOnlyAdapterGovernedInputVerification {
  if (!input.source) {
    return createBlockedRealReadOnlyAdapterGovernedInputVerification('governed_input_missing');
  }

  const relativePath = normalizeGovernedInputRelativePath(input.source.relativePath);

  if (relativePath.length === 0) {
    return createBlockedRealReadOnlyAdapterGovernedInputVerification(
      'governed_input_relative_path_required',
      input.source,
    );
  }

  if (isAbsolute(relativePath)) {
    return createBlockedRealReadOnlyAdapterGovernedInputVerification(
      'governed_input_absolute_path_forbidden',
      input.source,
    );
  }

  if (governedInputRelativePathEscapes(relativePath)) {
    return createBlockedRealReadOnlyAdapterGovernedInputVerification(
      'governed_input_parent_traversal_forbidden',
      input.source,
    );
  }

  const worktreeRoot = resolve(input.worktreePath);
  const absolutePath = resolve(worktreeRoot, relativePath);

  if (!isPathWithinRoot(absolutePath, worktreeRoot)) {
    return createBlockedRealReadOnlyAdapterGovernedInputVerification(
      'governed_input_parent_traversal_forbidden',
      input.source,
    );
  }

  const pathExists = input.pathExists ?? existsSync;

  if (!pathExists(absolutePath)) {
    return createBlockedRealReadOnlyAdapterGovernedInputVerification(
      'governed_input_file_missing',
      input.source,
    );
  }

  try {
    const realPath = input.realPath ?? realpathSync;
    const realWorktreeRoot = realPath(worktreeRoot);
    const realInputPath = realPath(absolutePath);

    if (!isPathWithinRoot(realInputPath, realWorktreeRoot)) {
      return createBlockedRealReadOnlyAdapterGovernedInputVerification(
        'governed_input_symlink_escape_forbidden',
        input.source,
      );
    }
  } catch {
    return createBlockedRealReadOnlyAdapterGovernedInputVerification(
      'governed_input_file_not_readable',
      input.source,
    );
  }

  let text: string;

  try {
    text = input.readTextFile ? input.readTextFile(absolutePath) : readFileSync(absolutePath, 'utf8');
  } catch {
    return createBlockedRealReadOnlyAdapterGovernedInputVerification(
      'governed_input_file_not_readable',
      input.source,
    );
  }

  const contentHash = `sha256:${hashText(text)}`;

  if (contentHash !== input.source.expectedContentHash) {
    return {
      ...createBlockedRealReadOnlyAdapterGovernedInputVerification(
        'governed_input_hash_mismatch',
        input.source,
      ),
      contentHash,
      byteLength: Buffer.byteLength(text, 'utf8'),
      lineCount: countTextLines(text),
    };
  }

  return {
    status: 'verified',
    sourceKind: 'governed_file',
    relativePath,
    relativePathHash: hashGovernedInputRelativePath(relativePath),
    expectedContentHash: input.source.expectedContentHash,
    contentHash,
    byteLength: Buffer.byteLength(text, 'utf8'),
    lineCount: countTextLines(text),
    bodyStored: false,
    promptBodyStored: false,
    stdinBodyStored: false,
    promptArgumentStored: false,
    metadataOnly: true,
  };
}

export function createRealReadOnlyAdapterGovernedInputPromptArgument(
  governedInput: CodexExecRealReadOnlyAdapterGovernedInputVerificationVerified,
): string {
  return [
    'Use only the governed input file inside the current worktree.',
    `Read ${governedInput.relativePath} and perform that request in read-only mode.`,
    'Do not use browser, desktop, account, credential, or workspace administration automation.',
    'Do not modify files; return metadata-only observations and stop if a write is needed.',
  ].join(' ');
}

export function createRealReadOnlyAdapterProcessArgv(
  governedInput: CodexExecRealReadOnlyAdapterGovernedInputVerificationVerified,
): readonly string[] {
  return Object.freeze([
    ...REAL_READ_ONLY_ADAPTER_CODEX_CLI_PROCESS_ARGV,
    createRealReadOnlyAdapterGovernedInputPromptArgument(governedInput),
  ]);
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

  if (input.governedInput?.status !== 'verified') {
    throw new Error('verified governed input is required before process boundary planning');
  }

  const cwdSelfCheck =
    input.cwdSelfCheck ??
    createRealReadOnlyAdapterRuntimeCwdSelfCheck({
      worktreePath: input.worktreePath,
    });
  const executableResolution = input.executableResolution;
  const resolvedExecutableKind = executableResolution?.resolvedExecutableKind ?? 'unknown';
  const spawnTargetKind =
    executableResolution?.spawnTargetKind ?? classifySpawnTargetKind(resolvedExecutableKind);
  const executableResolutionSource =
    executableResolution?.executableResolutionSource ??
    (executableResolution === undefined ? 'none' : 'direct_path');
  const executablePathHash =
    executableResolution?.executablePathHash ?? hashRuntimePath(input.executablePath);
  const argv = createRealReadOnlyAdapterProcessArgv(input.governedInput);
  const promptArgumentHash = `sha256:${hashText(argv[argv.length - 1] ?? '')}`;

  return {
    dryRunId: input.dryRunId,
    approvalArtifactId: input.approvalArtifactId,
    executablePath: input.executablePath,
    argv,
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
    stdinBodyStored: false,
    stdinClosedWithoutBody: true,
    governedInputRequired: true,
    governedInputProvided: true,
    governedInputVerified: true,
    governedInputSourceKind: input.governedInput.sourceKind,
    governedInputRelativePathHash: input.governedInput.relativePathHash,
    governedInputContentHash: input.governedInput.contentHash,
    governedInputByteLength: input.governedInput.byteLength,
    governedInputLineCount: input.governedInput.lineCount,
    promptArgumentHash,
    promptArgumentStored: false,
    dashboardTriggerAllowed: false,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
    metadata: {
      ...(input.metadata ?? {}),
      source: 'codex-kernel.real-read-only-adapter.process-plan',
      executablePolicyLabel: input.executablePolicyLabel ?? codexCliExecutablePolicyLabel,
      shell: false,
      readOnly: true,
      stdinBodyStored: false,
      stdinClosedWithoutBody: true,
      governedInputRequired: true,
      governedInputProvided: true,
      governedInputVerified: true,
      governedInputSourceKind: input.governedInput.sourceKind,
      governedInputRelativePathHash: input.governedInput.relativePathHash,
      governedInputContentHash: input.governedInput.contentHash,
      governedInputByteLength: input.governedInput.byteLength,
      governedInputLineCount: input.governedInput.lineCount,
      governedInputBodyStored: false,
      promptBodyStored: false,
      promptArgumentHash,
      promptArgumentStored: false,
      envPlanStored: false,
      platform: executableResolution?.platform ?? process.platform,
      resolvedExecutableKind,
      spawnTargetKind,
      executableResolutionSource,
      executablePathHash,
      executableHash: executablePathHash,
      executableExists: executableResolution?.executableExists ?? true,
      executableAccessible: executableResolution?.executableAccessible ?? true,
      executableAccessProbePassed: executableResolution?.executableAccessProbePassed,
      windowsNativeExecutableAccessProbeBypassed:
        executableResolution?.windowsNativeExecutableAccessProbeBypassed,
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
  const spawnTargetKind = readSpawnTargetKindMetadata(plan.metadata, 'spawnTargetKind');
  const cwdExists = readBooleanMetadata(plan.metadata, 'cwdExists');
  const cwdIsDirectory = readBooleanMetadata(plan.metadata, 'cwdIsDirectory');
  const executableExists = readBooleanMetadata(plan.metadata, 'executableExists');
  const executableAccessible = readBooleanMetadata(plan.metadata, 'executableAccessible');
  const executableHash =
    readStringMetadata(plan.metadata, 'executableHash') ??
    readStringMetadata(plan.metadata, 'executablePathHash');
  const executableResolutionSource = readExecutableResolutionSourceMetadata(
    plan.metadata,
    'executableResolutionSource',
  );
  const dependencyResolutionStatus = classifyDependencyResolutionStatus({
    startFailureKind,
    cwdExists,
    cwdIsDirectory,
    executableExists,
    spawnTargetKind,
  });
  const enoentKind = classifyEnoentKind({
    startFailureKind,
    cwdExists,
    cwdIsDirectory,
    executableExists,
    spawnTargetKind,
  });
  const status =
    timedOut || cancelled
      ? 'aborted'
      : runnerResult.exitCode === 0
        ? 'completed'
        : 'failed';
  const nonzeroExitKind =
    status === 'failed' && startFailureKind === 'none' && runnerResult.exitCode !== undefined
      ? classifyNonzeroExitKind(runnerResult)
      : undefined;

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
    nonzeroExitKind,
    signal: runnerResult.signal,
    timedOut,
    cancelled,
    startFailureKind,
    enoentKind,
    platform,
    resolvedExecutableKind,
    spawnTargetKind,
    cwdHash: readStringMetadata(plan.metadata, 'cwdHash'),
    cwdExists,
    cwdIsDirectory,
    executableHash,
    executableExists,
    executableAccessible,
    executableResolutionSource,
    dependencyResolutionStatus,
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
    externalProcessStarted: startFailureKind === 'none',
    governedInputRequired: true,
    governedInputProvided: plan.governedInputProvided,
    governedInputVerified: plan.governedInputVerified,
    governedInputSourceKind: plan.governedInputSourceKind,
    governedInputRelativePathHash: plan.governedInputRelativePathHash,
    governedInputContentHash: plan.governedInputContentHash,
    governedInputByteLength: plan.governedInputByteLength,
    governedInputLineCount: plan.governedInputLineCount,
    promptArgumentHash: plan.promptArgumentHash,
    promptArgumentStored: false,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
    dashboardTriggerAllowed: false,
    metadata: {
      source: 'codex-kernel.real-read-only-adapter.process-boundary',
      readOnly: true,
      shell: false,
      outputBodyStored: false,
      governedInputRequired: true,
      governedInputProvided: plan.governedInputProvided,
      governedInputVerified: plan.governedInputVerified,
      governedInputSourceKind: plan.governedInputSourceKind,
      governedInputRelativePathHash: plan.governedInputRelativePathHash,
      governedInputContentHash: plan.governedInputContentHash,
      governedInputByteLength: plan.governedInputByteLength,
      governedInputLineCount: plan.governedInputLineCount,
      governedInputBodyStored: false,
      promptBodyStored: false,
      promptArgumentHash: plan.promptArgumentHash,
      promptArgumentStored: false,
      startFailureKind,
      enoentKind,
      nonzeroExitKind,
      platform,
      resolvedExecutableKind,
      spawnTargetKind,
      cwdHash: readStringMetadata(plan.metadata, 'cwdHash'),
      cwdExists,
      cwdIsDirectory,
      executableHash,
      executableExists,
      executableAccessible,
      executableResolutionSource,
      dependencyResolutionStatus,
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
        child.stdin.on('error', () => undefined);
        child.stdin.end();
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

function classifyNonzeroExitKind(
  result: Pick<
    CodexExecRealReadOnlyAdapterProcessRunnerResult,
    'exitCode' | 'stdout' | 'stderr'
  >,
): CodexExecRealReadOnlyAdapterNonzeroExitKind {
  if (result.exitCode === undefined || result.exitCode === 0) {
    return 'unknown';
  }

  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`.toLowerCase();
  const codexExecUsageText = ['usage:', 'codex', 'exec'].join(' ');

  if (
    output.includes('unexpected argument') ||
    output.includes('unrecognized option') ||
    output.includes('unknown option') ||
    output.includes('invalid value') ||
    output.includes('found argument') ||
    output.includes(codexExecUsageText) ||
    output.includes('--dry-run-id') ||
    output.includes('--approval-artifact-id') ||
    output.includes('--jsonl') ||
    output.includes('read_only')
  ) {
    return 'codex_cli_usage_error_suspected';
  }

  if (
    output.includes('no prompt') ||
    output.includes('prompt is required') ||
    output.includes('missing prompt') ||
    output.includes('input required') ||
    output.includes('instructions are read from stdin')
  ) {
    return 'codex_cli_input_missing_suspected';
  }

  if (
    output.includes('auth') ||
    output.includes('login') ||
    output.includes('api key') ||
    output.includes('credential') ||
    output.includes('profile') ||
    output.includes('config')
  ) {
    return 'codex_cli_auth_or_config_error_suspected';
  }

  return result.exitCode === 2
    ? 'codex_cli_usage_error_suspected'
    : 'codex_cli_runtime_error_suspected';
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
  return findExecutablePaths(pathEntries, executableNames, fileExists)[0];
}

function findExecutablePaths(
  pathEntries: string[],
  executableNames: string[],
  fileExists: (path: string) => boolean,
): { path: string; name: string }[] {
  const matches: { path: string; name: string }[] = [];

  for (const executableName of executableNames) {
    for (const pathEntry of pathEntries) {
      const candidate = join(pathEntry, executableName);

      if (fileExists(candidate)) {
        matches.push({ path: candidate, name: executableName });
      }
    }
  }

  return matches;
}

function resolveTrustedCodexShellShimTarget(
  shimPath: string,
  options: {
    platform: NodeJS.Platform;
    readTextFile: (path: string) => string | undefined;
  },
): { path: string; name: string } | undefined {
  if (options.platform !== 'win32') {
    return undefined;
  }

  const shimName = basename(shimPath).toLowerCase();

  if (shimName !== 'codex.cmd' && shimName !== 'codex.bat') {
    return undefined;
  }

  const shimText = options.readTextFile(shimPath);

  if (shimText === undefined) {
    return undefined;
  }

  const quotedExeMatch = /"([^"]+\\codex\.exe)"\s+%?\*/i.exec(shimText);
  const targetPath = quotedExeMatch?.[1];

  if (targetPath === undefined) {
    return undefined;
  }

  const resolvedTargetPath = isAbsolute(targetPath)
    ? targetPath
    : resolve(dirname(shimPath), targetPath);

  return {
    path: resolvedTargetPath,
    name: basename(resolvedTargetPath),
  };
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

function shouldBypassWindowsNativeExecutableAccessProbe(input: {
  executableName: string;
  platform: NodeJS.Platform;
  accessProbePassed: boolean;
}): boolean {
  return (
    input.platform === 'win32' &&
    !input.accessProbePassed &&
    input.executableName.toLowerCase().endsWith('.exe')
  );
}

function readTextFileFromDisk(path: string): string | undefined {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return undefined;
  }
}

function listDirectoryNamesFromDisk(path: string): string[] {
  try {
    return readdirSync(path, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

function isWindowsPackagedAppResource(path: string, platform: NodeJS.Platform): boolean {
  if (platform !== 'win32') {
    return false;
  }

  const normalized = path.replace(/\\/g, '/').toLowerCase();

  return (
    normalized.includes('/windowsapps/openai.codex_') ||
    normalized.includes('/microsoft/windowsapps/')
  );
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

function normalizeGovernedInputRelativePath(path: string): string {
  return path.trim().replace(/\\/g, '/').replace(/^\.\/+/, '');
}

function hashGovernedInputRelativePath(path: string): string {
  return `sha256:${hashText(normalizeGovernedInputRelativePath(path))}`;
}

function governedInputRelativePathEscapes(path: string): boolean {
  return normalizeGovernedInputRelativePath(path)
    .split('/')
    .some((segment) => segment === '..');
}

function normalizeRootPath(path: string): string {
  return resolve(path).replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
}

function isPathWithinRoot(path: string, root: string): boolean {
  const normalizedRoot = normalizeRootPath(root);
  const normalizedPath = normalizeRootPath(path);

  return normalizedPath === normalizedRoot || normalizedPath.startsWith(`${normalizedRoot}/`);
}

function countTextLines(text: string): number {
  return text.length === 0 ? 0 : text.split(/\r?\n/).length;
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

function classifySpawnTargetKind(
  kind: CodexExecRealReadOnlyAdapterResolvedExecutableKind,
): CodexExecRealReadOnlyAdapterSpawnTargetKind {
  if (kind === 'native_exe') {
    return 'native_exe';
  }

  if (kind === 'bare_command') {
    return 'bare_command';
  }

  return 'unknown';
}

function readSpawnTargetKindMetadata(
  metadata: JsonMetadata | undefined,
  key: string,
): CodexExecRealReadOnlyAdapterSpawnTargetKind {
  const value = metadata?.[key];
  return value === 'native_exe' ||
    value === 'bare_command' ||
    value === 'trusted_shell_shim_target' ||
    value === 'windows_app_alias' ||
    value === 'unknown'
    ? value
    : 'unknown';
}

function readExecutableResolutionSourceMetadata(
  metadata: JsonMetadata | undefined,
  key: string,
): CodexExecRealReadOnlyAdapterExecutableResolutionSource {
  const value = metadata?.[key];
  return value === 'none' ||
    value === 'direct_path' ||
    value === 'trusted_shell_shim_target' ||
    value === 'blocked_shell_shim' ||
    value === 'blocked_windows_app_alias' ||
    value === 'not_found'
    ? value
    : 'none';
}

function classifyEnoentKind(input: {
  startFailureKind: CodexExecRealReadOnlyAdapterBoundaryStartFailureKind;
  cwdExists?: boolean;
  cwdIsDirectory?: boolean;
  executableExists?: boolean;
  spawnTargetKind?: CodexExecRealReadOnlyAdapterSpawnTargetKind;
}): CodexExecRealReadOnlyAdapterEnoentKind {
  if (input.startFailureKind !== 'enoent') {
    return 'none';
  }

  if (input.cwdExists === false || input.cwdIsDirectory === false) {
    return 'cwd_enoent';
  }

  if (input.executableExists === false) {
    return 'executable_enoent';
  }

  if (input.spawnTargetKind === 'windows_app_alias') {
    return 'windows_app_alias_enoent';
  }

  if (input.executableExists === true && input.cwdExists === true) {
    return 'dependency_or_spawn_target_enoent';
  }

  return 'unknown';
}

function classifyDependencyResolutionStatus(input: {
  startFailureKind: CodexExecRealReadOnlyAdapterBoundaryStartFailureKind;
  cwdExists?: boolean;
  cwdIsDirectory?: boolean;
  executableExists?: boolean;
  spawnTargetKind?: CodexExecRealReadOnlyAdapterSpawnTargetKind;
}): CodexExecRealReadOnlyAdapterDependencyResolutionStatus {
  if (input.startFailureKind !== 'enoent') {
    return 'not_applicable';
  }

  if (
    input.cwdExists === false ||
    input.cwdIsDirectory === false ||
    input.executableExists === false
  ) {
    return 'not_applicable';
  }

  if (input.spawnTargetKind === 'windows_app_alias') {
    return 'spawn_target_mismatch_suspected';
  }

  if (input.executableExists === true && input.cwdExists === true) {
    return 'dependency_missing_suspected';
  }

  return 'unknown';
}
