import { spawn } from 'node:child_process';
import type {
  RealPolicyBackendKind,
  RealPolicyBackendRuntimeMode,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

type RealPolicyStatus = 'completed' | 'failed' | 'blocked';

interface ProcessResult {
  status: RealPolicyStatus;
  stdoutHash?: string;
  stderrHash?: string;
  stdoutByteCount: number;
  stderrByteCount: number;
  exitCode?: number;
  summary: string;
}

interface SpawnProcessInput {
  command: string;
  args: readonly string[];
  stdin: string;
  timeoutMs: number;
}

type SpawnProcess = (input: SpawnProcessInput) => Promise<ProcessResult>;

interface FetchResponseLike {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

type FetchLike = (
  url: string,
  init: { method: 'POST'; headers: Record<string, string>; body: string },
) => Promise<FetchResponseLike>;

export interface RealPolicyBoundaryInput {
  backendKind: RealPolicyBackendKind;
  runtimeMode: RealPolicyBackendRuntimeMode;
  inputHash: string;
  policySourceHash: string;
  queryHash?: string;
  endpointHash?: string;
  endpointUrl?: string;
  decisionPath?: string;
  transientPolicySource?: string;
  transientInput?: string;
  timeoutMs?: number;
  spawnProcess?: SpawnProcess;
  fetch?: FetchLike;
}

export interface RealPolicyBoundaryResult {
  status: RealPolicyStatus;
  backendKind: RealPolicyBackendKind;
  runtimeMode: RealPolicyBackendRuntimeMode;
  backendOutcome: 'allow' | 'deny' | 'unknown' | 'error';
  rawDecisionHash: string;
  reasonCount: number;
  matchedRuleCount: number;
  processBoundaryInvoked: boolean;
  externalProcessStarted: boolean;
  networkBoundaryInvoked: boolean;
  rawPolicySourceStored: false;
  rawInputStored: false;
  rawOutputStored: false;
  rawPathStored: false;
  bodyStored: false;
  summary: string;
}

export async function runRealPolicyBackendBoundary(
  input: RealPolicyBoundaryInput,
): Promise<RealPolicyBoundaryResult> {
  if (!isHash(input.inputHash) || !isHash(input.policySourceHash)) {
    return createBlockedResult(input, 'Policy backend evaluation requires hash-bound input.');
  }

  if (input.runtimeMode === 'local-cli') {
    return runLocalCliBoundary(input);
  }

  return runLoopbackHttpBoundary(input);
}

async function runLocalCliBoundary(
  input: RealPolicyBoundaryInput,
): Promise<RealPolicyBoundaryResult> {
  if (!input.transientInput || !input.transientPolicySource) {
    return createBlockedResult(input, 'Policy backend CLI evaluation requires transient input.');
  }

  if (
    `sha256:${hashText(input.transientInput)}` !== input.inputHash ||
    `sha256:${hashText(input.transientPolicySource)}` !== input.policySourceHash
  ) {
    return createBlockedResult(input, 'Policy backend CLI transient input hash mismatch.');
  }

  const command = input.backendKind === 'opa' ? 'opa' : 'cedar';
  const args =
    input.backendKind === 'opa'
      ? ['eval', '--stdin-input', '--format', 'json', sanitizeDecisionPath(input.decisionPath)]
      : ['authorize'];
  const stdin = JSON.stringify({
    policySourceHash: input.policySourceHash,
    inputHash: input.inputHash,
    policy: input.transientPolicySource,
    input: input.transientInput,
  });

  const result = await (input.spawnProcess ?? spawnFixedProcess)({
    command,
    args,
    stdin,
    timeoutMs: input.timeoutMs ?? 5000,
  });

  const rawDecisionHash = `sha256:${hashText(
    JSON.stringify({
      status: result.status,
      stdoutHash: result.stdoutHash,
      stderrHash: result.stderrHash,
      exitCode: result.exitCode,
    }),
  )}`;

  return {
    status: result.status,
    backendKind: input.backendKind,
    runtimeMode: input.runtimeMode,
    backendOutcome: result.status === 'completed' ? 'unknown' : 'error',
    rawDecisionHash,
    reasonCount: result.stderrByteCount > 0 ? 1 : 0,
    matchedRuleCount: result.status === 'completed' ? 1 : 0,
    processBoundaryInvoked: true,
    externalProcessStarted: true,
    networkBoundaryInvoked: false,
    rawPolicySourceStored: false,
    rawInputStored: false,
    rawOutputStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary:
      result.status === 'completed'
        ? 'Real policy backend CLI evaluation completed as advisory metadata.'
        : 'Real policy backend CLI evaluation failed as advisory metadata.',
  };
}

async function runLoopbackHttpBoundary(
  input: RealPolicyBoundaryInput,
): Promise<RealPolicyBoundaryResult> {
  if (!input.endpointUrl || !input.endpointHash) {
    return createBlockedResult(input, 'Policy backend HTTP evaluation requires hash-bound endpoint.');
  }

  if (`sha256:${hashText(input.endpointUrl)}` !== input.endpointHash) {
    return createBlockedResult(input, 'Policy backend HTTP endpoint hash mismatch.');
  }

  const endpoint = new URL(input.endpointUrl);
  if (!isLoopbackHost(endpoint.hostname) || !isAllowedPolicyPath(input.backendKind, endpoint.pathname)) {
    return createBlockedResult(input, 'Policy backend HTTP endpoint is outside the fixed loopback allowlist.');
  }

  if (!input.transientInput) {
    return createBlockedResult(input, 'Policy backend HTTP evaluation requires transient input.');
  }

  if (`sha256:${hashText(input.transientInput)}` !== input.inputHash) {
    return createBlockedResult(input, 'Policy backend HTTP transient input hash mismatch.');
  }

  const fetchImpl = input.fetch ?? globalThis.fetch;
  if (!fetchImpl) {
    return createBlockedResult(input, 'Policy backend HTTP runner is unavailable.');
  }

  const body = JSON.stringify({
    inputHash: input.inputHash,
    policySourceHash: input.policySourceHash,
    input: input.transientInput,
  });

  try {
    const response = await fetchImpl(endpoint.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
    const text = await response.text();
    const responseHash = `sha256:${hashText(text)}`;

    return {
      status: response.ok ? 'completed' : 'failed',
      backendKind: input.backendKind,
      runtimeMode: input.runtimeMode,
      backendOutcome: response.ok ? 'unknown' : 'error',
      rawDecisionHash: `sha256:${hashText(
        JSON.stringify({ responseHash, statusCode: response.status }),
      )}`,
      reasonCount: response.ok ? 0 : 1,
      matchedRuleCount: response.ok ? 1 : 0,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: true,
      rawPolicySourceStored: false,
      rawInputStored: false,
      rawOutputStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: response.ok
        ? 'Real policy backend loopback evaluation completed as advisory metadata.'
        : 'Real policy backend loopback evaluation failed as advisory metadata.',
    };
  } catch {
    return {
      ...createBlockedResult(input, 'Policy backend loopback evaluation failed.'),
      status: 'failed',
      networkBoundaryInvoked: true,
      backendOutcome: 'error',
    };
  }
}

function spawnFixedProcess(input: SpawnProcessInput): Promise<ProcessResult> {
  return new Promise((resolve) => {
    const child = spawn(input.command, input.args, { shell: false, stdio: ['pipe', 'pipe', 'pipe'] });
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    const timeout = setTimeout(() => {
      child.kill();
    }, input.timeoutMs);

    child.stdout.on('data', (chunk: Buffer) => stdoutChunks.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk));
    child.on('error', () => {
      clearTimeout(timeout);
      resolve({
        status: 'failed',
        stdoutByteCount: 0,
        stderrByteCount: 0,
        summary: 'Real policy backend CLI evaluation failed to start.',
      });
    });
    child.on('close', (code) => {
      clearTimeout(timeout);
      const stdout = Buffer.concat(stdoutChunks).toString('utf8');
      const stderr = Buffer.concat(stderrChunks).toString('utf8');
      resolve({
        status: code === 0 ? 'completed' : 'failed',
        stdoutHash: `sha256:${hashText(stdout)}`,
        stderrHash: `sha256:${hashText(stderr)}`,
        stdoutByteCount: Buffer.byteLength(stdout),
        stderrByteCount: Buffer.byteLength(stderr),
        exitCode: code ?? undefined,
        summary:
          code === 0
            ? 'Real policy backend CLI evaluation completed as advisory metadata.'
            : 'Real policy backend CLI evaluation failed as advisory metadata.',
      });
    });
    child.stdin.end(input.stdin);
  });
}

function createBlockedResult(
  input: RealPolicyBoundaryInput,
  summary: string,
): RealPolicyBoundaryResult {
  return {
    status: 'blocked',
    backendKind: input.backendKind,
    runtimeMode: input.runtimeMode,
    backendOutcome: 'error',
    rawDecisionHash: `sha256:${hashText(summary)}`,
    reasonCount: 1,
    matchedRuleCount: 0,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    rawPolicySourceStored: false,
    rawInputStored: false,
    rawOutputStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary,
  };
}

function sanitizeDecisionPath(decisionPath: string | undefined): string {
  if (!decisionPath || !/^[A-Za-z0-9_.]+$/.test(decisionPath)) {
    return 'data.codexhub.allow';
  }

  return decisionPath;
}

function isAllowedPolicyPath(kind: RealPolicyBackendKind, path: string): boolean {
  if (kind === 'opa') {
    return /^\/v1\/data\/[A-Za-z0-9_./-]+$/.test(path);
  }

  return path === '/authorize';
}

function isLoopbackHost(host: string): boolean {
  return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(host);
}

function isHash(value: string): boolean {
  return /^sha256:[a-f0-9]+$/i.test(value) || value.startsWith('sha256:');
}
