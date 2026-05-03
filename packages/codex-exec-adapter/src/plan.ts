import { isAbsolute, relative, resolve } from 'node:path';
import {
  REAL_READ_ONLY_ADAPTER_CODEX_CLI_INVOCATION_CONTRACT_VERSION,
  REAL_READ_ONLY_ADAPTER_CODEX_CLI_PROCESS_ARGV,
  REAL_READ_ONLY_ADAPTER_CODEX_CLI_PROCESS_ARGV_HASH,
  type CodexExecRealReadOnlyAdapterGovernedInputSource,
  type CodexExecRealReadOnlyAdapterGovernedInputVerification,
  verifyRealReadOnlyAdapterGovernedInputSource,
} from '@codexhub/codex-kernel';
import {
  type CapabilityDryRun,
  type CapabilityManifest,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText, redactMetadata } from '@codexhub/evidence-kernel';
import { CODEX_EXEC_ADAPTER_NAME, createCodexExecAdapterManifest } from './manifest';

export type CodexExecAdapterPlanStatus = 'ready' | 'blocked';

export type CodexExecAdapterPlanBlockReason =
  | 'cwd_allowlist_required'
  | 'cwd_outside_allowlist'
  | 'governed_input_blocked'
  | 'raw_prompt_body_forbidden'
  | 'stdin_body_forbidden'
  | 'arbitrary_args_forbidden'
  | 'workspace_write_forbidden'
  | 'danger_full_access_forbidden'
  | 'sandbox_mode_forbidden'
  | 'approval_mode_forbidden';

export interface CodexExecAdapterPlanInput {
  dryRunId: string;
  cwd: string;
  allowedCwdRoots: readonly string[];
  governedInput?: CodexExecRealReadOnlyAdapterGovernedInputSource;
  sandboxMode?: string;
  approvalMode?: string;
  requestedArgs?: readonly string[];
  rawPromptBody?: string;
  stdinBody?: string;
  metadata?: Record<string, unknown>;
  manifest?: CapabilityManifest;
}

export interface CodexExecAdapterPlan {
  id: string;
  schemaVersion: string;
  createdAt: string;
  adapterName: string;
  status: CodexExecAdapterPlanStatus;
  dryRunId: string;
  cwd: string;
  cwdHash: string;
  fixedArgvHash: string;
  invocationContractVersion: string;
  sandboxMode: 'read-only';
  approvalMode: 'required';
  processBoundaryPlanned: boolean;
  externalProcessStarted: false;
  noRealWrite: true;
  bodyStored: false;
  governedInput: CodexExecRealReadOnlyAdapterGovernedInputVerification;
  blockReasons: CodexExecAdapterPlanBlockReason[];
  warnings: string[];
  manifest: CapabilityManifest;
  capabilityDryRun: CapabilityDryRun;
  metadata?: Record<string, unknown>;
}

export function createCodexExecAdapterPlan(
  input: CodexExecAdapterPlanInput,
): CodexExecAdapterPlan {
  const manifest = input.manifest ?? createCodexExecAdapterManifest();
  const blockReasons: CodexExecAdapterPlanBlockReason[] = [];
  const warnings: string[] = [];
  const cwd = resolve(input.cwd);
  const cwdHash = `sha256:${hashText(cwd)}`;

  if (input.allowedCwdRoots.length === 0) {
    blockReasons.push('cwd_allowlist_required');
  } else if (!isPathInsideAnyRoot(cwd, input.allowedCwdRoots)) {
    blockReasons.push('cwd_outside_allowlist');
  }

  if (typeof input.rawPromptBody === 'string' && input.rawPromptBody.length > 0) {
    blockReasons.push('raw_prompt_body_forbidden');
  }

  if (typeof input.stdinBody === 'string' && input.stdinBody.length > 0) {
    blockReasons.push('stdin_body_forbidden');
  }

  if (
    input.requestedArgs !== undefined &&
    JSON.stringify(input.requestedArgs) !==
      JSON.stringify(REAL_READ_ONLY_ADAPTER_CODEX_CLI_PROCESS_ARGV)
  ) {
    blockReasons.push('arbitrary_args_forbidden');
  }

  if (input.sandboxMode === 'workspace_write') {
    blockReasons.push('workspace_write_forbidden');
  } else if (input.sandboxMode === 'danger_full_access') {
    blockReasons.push('danger_full_access_forbidden');
  } else if (input.sandboxMode !== undefined && input.sandboxMode !== 'read-only') {
    blockReasons.push('sandbox_mode_forbidden');
  }

  if (input.approvalMode !== undefined && input.approvalMode !== 'required') {
    blockReasons.push('approval_mode_forbidden');
  }

  const governedInput = verifyRealReadOnlyAdapterGovernedInputSource({
    worktreePath: cwd,
    source: input.governedInput,
  });

  if (governedInput.status !== 'verified') {
    blockReasons.push('governed_input_blocked');
    warnings.push(`governed input blocked: ${governedInput.reasonCode}`);
  }

  const status: CodexExecAdapterPlanStatus =
    blockReasons.length === 0 ? 'ready' : 'blocked';

  const capabilityDryRun: CapabilityDryRun = {
    id: foundationId('capability_dry_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: CODEX_EXEC_ADAPTER_NAME,
    inputSummary: {
      cwdHash,
      governedInputStatus: governedInput.status,
      governedInputRelativePathHash: governedInput.relativePathHash,
      governedInputContentHash: governedInput.contentHash ?? governedInput.expectedContentHash,
      fixedArgvHash: REAL_READ_ONLY_ADAPTER_CODEX_CLI_PROCESS_ARGV_HASH,
      bodyStored: false,
    },
    plannedActions: [
      {
        action: 'codex-cli.read-only-run',
        actionMode: 'dry-run',
        risk: 'medium',
        target: 'governed-input-file',
        requiresApproval: true,
      },
    ],
    requiredEvidence: ['governed-input-hash', 'process-boundary-summary', 'jsonl-event-summary'],
    warnings,
    metadata: {
      status,
      blockReasons,
      promptBodyStored: false,
      stdinBodyStored: false,
      stdoutBodyStored: false,
      stderrBodyStored: false,
      rawJsonlBodyStored: false,
    },
  };

  return {
    id: foundationId('codex_exec_adapter_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: CODEX_EXEC_ADAPTER_NAME,
    status,
    dryRunId: input.dryRunId,
    cwd,
    cwdHash,
    fixedArgvHash: REAL_READ_ONLY_ADAPTER_CODEX_CLI_PROCESS_ARGV_HASH,
    invocationContractVersion: REAL_READ_ONLY_ADAPTER_CODEX_CLI_INVOCATION_CONTRACT_VERSION,
    sandboxMode: 'read-only',
    approvalMode: 'required',
    processBoundaryPlanned: status === 'ready',
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
    governedInput,
    blockReasons,
    warnings,
    manifest,
    capabilityDryRun,
    metadata: summarizePlanMetadata(input.metadata),
  };
}

function summarizePlanMetadata(
  metadata: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!metadata) {
    return undefined;
  }

  return {
    adapterMetadataProvided: true,
    adapterMetadataKeyCount: Object.keys(metadata).length,
    adapterMetadataHash: `sha256:${hashText(JSON.stringify(redactMetadata(metadata)))}`,
    bodyStored: false,
    rawPathStored: false,
  };
}

function isPathInsideAnyRoot(path: string, roots: readonly string[]): boolean {
  return roots.some((root) => {
    const resolvedRoot = resolve(root);
    const pathRelativeToRoot = relative(resolvedRoot, path);

    return (
      path === resolvedRoot ||
      (pathRelativeToRoot.length > 0 &&
        !pathRelativeToRoot.startsWith('..') &&
        !isAbsolute(pathRelativeToRoot))
    );
  });
}
