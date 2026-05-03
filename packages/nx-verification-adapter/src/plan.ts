import { existsSync, realpathSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import {
  type CapabilityDryRun,
  type CapabilityManifest,
  type VerificationPlan,
  type VerificationTarget,
  SchemaVersionSchema,
  VerificationPlanSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText, redactMetadata } from '@codexhub/evidence-kernel';
import { NX_VERIFICATION_ADAPTER_NAME, createNxVerificationAdapterManifest } from './manifest';

export const NX_VERIFICATION_ALLOWED_TARGETS = ['lint', 'test', 'build'] as const;

export type NxVerificationAdapterPlanStatus = 'ready' | 'blocked';

export type NxVerificationAdapterPlanBlockReason =
  | 'cwd_allowlist_required'
  | 'cwd_outside_allowlist'
  | 'target_required'
  | 'target_forbidden'
  | 'ref_forbidden'
  | 'arbitrary_command_forbidden'
  | 'arbitrary_args_forbidden'
  | 'shell_forbidden';

export interface NxVerificationAdapterPlanInput {
  dryRunId: string;
  cwd: string;
  allowedCwdRoots: readonly string[];
  targets: readonly string[];
  baseRef?: string;
  headRef?: string;
  requestedCommand?: string;
  requestedArgs?: readonly string[];
  shell?: boolean;
  metadata?: Record<string, unknown>;
  manifest?: CapabilityManifest;
}

export interface NxVerificationAdapterPlan {
  id: string;
  schemaVersion: string;
  createdAt: string;
  adapterName: string;
  status: NxVerificationAdapterPlanStatus;
  dryRunId: string;
  cwd: string;
  cwdHash: string;
  targets: VerificationTarget[];
  baseRef?: string;
  headRef?: string;
  affectedProjectsCommandHash: string;
  verificationCommandHash: string;
  processBoundaryPlanned: boolean;
  externalProcessStarted: false;
  noRealWrite: true;
  bodyStored: false;
  blockReasons: NxVerificationAdapterPlanBlockReason[];
  warnings: string[];
  manifest: CapabilityManifest;
  verificationPlan: VerificationPlan;
  capabilityDryRun: CapabilityDryRun;
  metadata?: Record<string, unknown>;
}

export function createNxVerificationAdapterPlan(
  input: NxVerificationAdapterPlanInput,
): NxVerificationAdapterPlan {
  const manifest = input.manifest ?? createNxVerificationAdapterManifest();
  const cwd = resolve(input.cwd);
  const cwdHash = `sha256:${hashText(cwd)}`;
  const blockReasons: NxVerificationAdapterPlanBlockReason[] = [];
  const warnings: string[] = [];
  const targets = normalizeTargets(input.targets, blockReasons);
  const baseRef = normalizeRef(input.baseRef, blockReasons);
  const headRef = normalizeRef(input.headRef, blockReasons);

  if (input.allowedCwdRoots.length === 0) {
    blockReasons.push('cwd_allowlist_required');
  } else if (!isPathInsideAnyRoot(cwd, input.allowedCwdRoots)) {
    blockReasons.push('cwd_outside_allowlist');
  }

  if (input.requestedCommand !== undefined) {
    blockReasons.push('arbitrary_command_forbidden');
  }

  if (input.requestedArgs !== undefined) {
    blockReasons.push('arbitrary_args_forbidden');
  }

  if (input.shell === true) {
    blockReasons.push('shell_forbidden');
  }

  const affectedProjectsArgv = createAffectedProjectsArgv({ baseRef, headRef });
  const verificationArgv = createVerificationArgv({ targets, baseRef, headRef });
  const affectedProjectsCommandHash = `sha256:${hashText(affectedProjectsArgv.join('\u0000'))}`;
  const verificationCommandHash = `sha256:${hashText(verificationArgv.join('\u0000'))}`;
  const status: NxVerificationAdapterPlanStatus = blockReasons.length === 0 ? 'ready' : 'blocked';
  const verificationPlan = VerificationPlanSchema.parse({
    id: foundationId('verification_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: NX_VERIFICATION_ADAPTER_NAME,
    cwdHash,
    targets,
    baseRef,
    headRef,
    affectedProjects: [],
    commandHash: verificationCommandHash,
    processBoundaryPlanned: status === 'ready',
    noRealWrite: true,
    bodyStored: false,
    summary:
      status === 'ready'
        ? `Plan Nx affected verification for ${targets.join(', ')}.`
        : `Blocked Nx affected verification plan: ${blockReasons.join(', ')}.`,
    metadata: {
      dryRunId: input.dryRunId,
      affectedProjectsCommandHash,
      verificationCommandHash,
      blockReasons,
      stdoutBodyStored: false,
      stderrBodyStored: false,
    },
  });
  const capabilityDryRun: CapabilityDryRun = {
    id: foundationId('capability_dry_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: NX_VERIFICATION_ADAPTER_NAME,
    inputSummary: {
      cwdHash,
      targets,
      baseRef,
      headRef,
      affectedProjectsCommandHash,
      verificationCommandHash,
      bodyStored: false,
    },
    plannedActions: [
      {
        action: 'nx.affected.verify',
        actionMode: 'read',
        risk: 'low',
        target: 'affected-projects',
        requiresApproval: false,
      },
    ],
    requiredEvidence: ['affected-projects', 'verification-output-summary'],
    warnings,
    metadata: {
      status,
      blockReasons,
      dryRunDoesNotUseAffectedDryRunFlag: true,
      stdoutBodyStored: false,
      stderrBodyStored: false,
    },
  };

  return {
    id: foundationId('nx_verification_adapter_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: NX_VERIFICATION_ADAPTER_NAME,
    status,
    dryRunId: input.dryRunId,
    cwd,
    cwdHash,
    targets,
    baseRef,
    headRef,
    affectedProjectsCommandHash,
    verificationCommandHash,
    processBoundaryPlanned: status === 'ready',
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
    blockReasons,
    warnings,
    manifest,
    verificationPlan,
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

export function createAffectedProjectsArgv(input: {
  baseRef?: string;
  headRef?: string;
}): readonly string[] {
  return Object.freeze([
    'nx',
    'show',
    'projects',
    '--affected',
    ...createRefArgs(input.baseRef, input.headRef),
  ]);
}

export function createVerificationArgv(input: {
  targets: readonly VerificationTarget[];
  baseRef?: string;
  headRef?: string;
}): readonly string[] {
  return Object.freeze([
    'nx',
    'affected',
    '-t',
    input.targets.join(','),
    ...createRefArgs(input.baseRef, input.headRef),
  ]);
}

function normalizeTargets(
  targets: readonly string[],
  blockReasons: NxVerificationAdapterPlanBlockReason[],
): VerificationTarget[] {
  if (targets.length === 0) {
    blockReasons.push('target_required');
    return [];
  }

  const normalized: VerificationTarget[] = [];

  for (const target of targets) {
    if (isVerificationTarget(target)) {
      if (!normalized.includes(target)) {
        normalized.push(target);
      }
    } else {
      blockReasons.push('target_forbidden');
    }
  }

  return normalized;
}

function normalizeRef(
  ref: string | undefined,
  blockReasons: NxVerificationAdapterPlanBlockReason[],
): string | undefined {
  if (ref === undefined) {
    return undefined;
  }

  const trimmed = ref.trim();

  if (trimmed.length === 0 || !/^[A-Za-z0-9._/@~^:-]+$/.test(trimmed)) {
    blockReasons.push('ref_forbidden');
    return undefined;
  }

  return trimmed;
}

function isVerificationTarget(value: string): value is VerificationTarget {
  return NX_VERIFICATION_ALLOWED_TARGETS.some((target) => target === value);
}

function createRefArgs(baseRef: string | undefined, headRef: string | undefined): string[] {
  return [...(baseRef ? [`--base=${baseRef}`] : []), ...(headRef ? [`--head=${headRef}`] : [])];
}

function isPathInsideAnyRoot(path: string, roots: readonly string[]): boolean {
  return roots.some((root) => {
    const resolvedRoot = resolve(root);
    const pathRelativeToRoot = relative(resolvedRoot, path);
    const lexicallyInside =
      path === resolvedRoot ||
      (pathRelativeToRoot.length > 0 &&
        !pathRelativeToRoot.startsWith('..') &&
        !isAbsolute(pathRelativeToRoot));

    if (!lexicallyInside) {
      return false;
    }

    if (!existsSync(path)) {
      return true;
    }

    const realPath = realpathSync(path);
    const realRoot = existsSync(resolvedRoot) ? realpathSync(resolvedRoot) : resolvedRoot;
    const realPathRelativeToRoot = relative(realRoot, realPath);

    return (
      realPath === realRoot ||
      (realPathRelativeToRoot.length > 0 &&
        !realPathRelativeToRoot.startsWith('..') &&
        !isAbsolute(realPathRelativeToRoot))
    );
  });
}
