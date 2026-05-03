import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import {
  validateCapabilityExecutionEnvelope,
  validateCapabilityManifest,
  validateCapabilityPlanEnvelope,
} from '@codexhub/capability-adapter-kernel';
import {
  CapabilityAuditEventSchema,
  CapabilityExecutionResultSchema,
  CapabilityManifestSchema,
  ExecutionAuthoritySchema,
} from '@codexhub/contracts';
import { describe, expect, it } from 'vitest';
import { executeNxVerificationAdapter } from './execute';
import { createNxVerificationAdapterManifest } from './manifest';
import { parseAffectedProjects, parseVerificationOutput } from './output-parser';
import { createNxVerificationAdapterPlan } from './plan';
import { type NxVerificationProcessRunner } from './process-boundary';

describe('nx-verification-adapter manifest', () => {
  it('parses as a capability manifest', () => {
    const manifest = createNxVerificationAdapterManifest();

    expect(CapabilityManifestSchema.parse(manifest)).toMatchObject({
      name: 'nx-affected',
      kind: 'verification',
      provider: 'external-process',
      defaultRisk: 'low',
      defaultActionMode: 'read',
      requiresApprovalByDefault: false,
      evidencePolicy: {
        bodyStorage: 'hash-only',
      },
      processBoundary: {
        mayStartExternalProcess: true,
        requiresProcessAudit: true,
      },
    });
    expect(validateCapabilityManifest(manifest).ok).toBe(true);
  });
});

describe('nx-verification-adapter plan', () => {
  it('accepts allowlisted cwd, targets, and refs without starting a process', () => {
    const root = createWorkspaceRoot();
    const plan = createNxVerificationAdapterPlan({
      dryRunId: 'dry_run_1',
      cwd: root,
      allowedCwdRoots: [root],
      targets: ['lint', 'test', 'build'],
      baseRef: 'HEAD~1',
      headRef: 'HEAD',
    });

    expect(plan.status).toBe('ready');
    expect(validateCapabilityPlanEnvelope(plan).ok).toBe(true);
    expect(plan.targets).toEqual(['lint', 'test', 'build']);
    expect(plan.processBoundaryPlanned).toBe(true);
    expect(plan.externalProcessStarted).toBe(false);
    expect(plan.noRealWrite).toBe(true);
    expect(plan.capabilityDryRun.inputSummary).toMatchObject({
      bodyStored: false,
      targets: ['lint', 'test', 'build'],
    });
  });

  it('rejects forbidden targets, empty targets, outside cwd, arbitrary command data, and shell', () => {
    const root = createWorkspaceRoot();
    const otherRoot = createWorkspaceRoot();
    const emptyTargetPlan = createNxVerificationAdapterPlan({
      dryRunId: 'dry_run_empty',
      cwd: root,
      allowedCwdRoots: [root],
      targets: [],
    });
    const blockedPlan = createNxVerificationAdapterPlan({
      dryRunId: 'dry_run_blocked',
      cwd: root,
      allowedCwdRoots: [otherRoot],
      targets: ['lint', 'release'],
      requestedCommand: 'npm run anything',
      requestedArgs: ['nx', 'affected', '--all'],
      shell: true,
    });

    expect(emptyTargetPlan.status).toBe('blocked');
    expect(emptyTargetPlan.blockReasons).toContain('target_required');
    expect(blockedPlan.status).toBe('blocked');
    expect(blockedPlan.blockReasons).toEqual(
      expect.arrayContaining([
        'cwd_outside_allowlist',
        'target_forbidden',
        'arbitrary_command_forbidden',
        'arbitrary_args_forbidden',
        'shell_forbidden',
      ]),
    );
  });

  it('rejects symlink cwd escapes from the allowlisted root', () => {
    const root = createWorkspaceRoot();
    const outsideRoot = createWorkspaceRoot();
    const linkPath = resolve(root, 'linked-outside');

    try {
      symlinkSync(outsideRoot, linkPath, 'dir');

      const plan = createNxVerificationAdapterPlan({
        dryRunId: 'dry_run_symlink_escape',
        cwd: linkPath,
        allowedCwdRoots: [root],
        targets: ['test'],
      });

      expect(plan.status).toBe('blocked');
      expect(plan.blockReasons).toContain('cwd_outside_allowlist');
    } finally {
      rmSync(linkPath, { force: true, recursive: true });
      rmSync(outsideRoot, { force: true, recursive: true });
    }
  });

  it('rejects unsafe refs', () => {
    const root = createWorkspaceRoot();
    const plan = createNxVerificationAdapterPlan({
      dryRunId: 'dry_run_ref',
      cwd: root,
      allowedCwdRoots: [root],
      targets: ['test'],
      baseRef: 'HEAD;rm',
    });

    expect(plan.status).toBe('blocked');
    expect(plan.blockReasons).toContain('ref_forbidden');
  });

  it('summarizes caller metadata without preserving raw secrets or paths', () => {
    const root = createWorkspaceRoot();
    const plan = createNxVerificationAdapterPlan({
      dryRunId: 'dry_run_metadata',
      cwd: root,
      allowedCwdRoots: [root],
      targets: ['lint'],
      metadata: {
        token: 'private-token',
        path: 'C:\\private\\workspace',
        nested: {
          authorization: 'Bearer secret',
        },
      },
    });
    const serializedMetadata = JSON.stringify(plan.metadata);

    expect(plan.metadata?.adapterMetadataProvided).toBe(true);
    expect(plan.metadata?.adapterMetadataHash).toMatch(/^sha256:/);
    expect(plan.metadata?.bodyStored).toBe(false);
    expect(plan.metadata?.rawPathStored).toBe(false);
    expect(serializedMetadata).not.toContain('private-token');
    expect(serializedMetadata).not.toContain('C:\\private\\workspace');
    expect(serializedMetadata).not.toContain('Bearer secret');
  });
});

describe('nx-verification-adapter output parser', () => {
  it('parses affected projects from nx show output', () => {
    const projects = parseAffectedProjects(
      [
        'contracts',
        'nx-verification-adapter',
        '',
        '> nx show projects --affected',
        'contracts',
      ].join('\n'),
    );

    expect(projects.map((project) => project.name)).toEqual([
      'contracts',
      'nx-verification-adapter',
    ]);
    expect(projects.every((project) => project.nameHash?.startsWith('sha256:'))).toBe(true);
  });

  it('summarizes passed, failed, and unknown verification output', () => {
    expect(parseVerificationOutput('NX Successfully ran target lint for 1 project').status).toBe(
      'passed',
    );
    expect(
      parseVerificationOutput('NX Running target test failed\nFailed tasks: app:test').status,
    ).toBe('failed');
    expect(parseVerificationOutput('some unrelated output').status).toBe('unknown');
  });
});

describe('nx-verification-adapter execute', () => {
  it('blocks missing authority before a process boundary', async () => {
    const root = createWorkspaceRoot();
    const plan = createNxVerificationAdapterPlan({
      dryRunId: 'dry_run_missing_authority',
      cwd: root,
      allowedCwdRoots: [root],
      targets: ['lint'],
    });
    const result = await executeNxVerificationAdapter({
      plan,
      executablePath: 'pnpm',
      timeoutMs: 1000,
    });

    expect(result.status).toBe('blocked');
    expect(
      validateCapabilityExecutionEnvelope({
        manifest: plan.manifest,
        capabilityResult: result.capabilityResult,
        evidenceRefs: result.evidenceRefs,
        auditEvents: result.auditEvents,
      }).ok,
    ).toBe(true);
    expect(result.capabilityResult.processBoundaryInvoked).toBe(false);
    expect(result.capabilityResult.externalProcessStarted).toBe(false);
    expect(result.boundaryResults).toHaveLength(0);
    expect(CapabilityExecutionResultSchema.parse(result.capabilityResult)).toBeTruthy();
    expect(CapabilityAuditEventSchema.parse(result.auditEvents[0])).toBeTruthy();
  });

  it('blocks denied authority before a process boundary', async () => {
    const root = createWorkspaceRoot();
    const plan = createNxVerificationAdapterPlan({
      dryRunId: 'dry_run_denied_authority',
      cwd: root,
      allowedCwdRoots: [root],
      targets: ['test'],
    });
    const result = await executeNxVerificationAdapter({
      plan,
      authority: createAuthority({ allowed: false }),
      executablePath: 'pnpm',
      timeoutMs: 1000,
    });

    expect(result.status).toBe('blocked');
    expect(result.capabilityResult.summary).toContain('execution_authority_not_allowed');
  });

  it('blocks expired execution authority before a process boundary', async () => {
    const root = createWorkspaceRoot();
    const plan = createNxVerificationAdapterPlan({
      dryRunId: 'dry_run_expired_authority',
      cwd: root,
      allowedCwdRoots: [root],
      targets: ['test'],
    });
    let starts = 0;
    const result = await executeNxVerificationAdapter({
      plan,
      authority: createAuthority({ expiresAt: '2026-04-28T00:00:00.000Z' }),
      executablePath: 'pnpm',
      timeoutMs: 1000,
      now: () => '2026-04-28T00:00:01.000Z',
      runner: {
        async start() {
          starts += 1;
          return { exitCode: 0, stdout: '', stderr: '' };
        },
      },
    });

    expect(result.status).toBe('blocked');
    expect(result.capabilityResult.processBoundaryInvoked).toBe(false);
    expect(result.capabilityResult.summary).toContain('execution_authority_expired');
    expect(starts).toBe(0);
  });

  it.each([
    [
      'passed',
      [
        { exitCode: 0, stdout: 'contracts\nnx-verification-adapter\n', stderr: '' },
        { exitCode: 0, stdout: 'NX Successfully ran target lint for 2 projects', stderr: '' },
      ],
    ],
    [
      'failed',
      [
        { exitCode: 0, stdout: 'contracts\n', stderr: '' },
        {
          exitCode: 1,
          stdout: 'NX Running target test failed\nFailed tasks: contracts:test',
          stderr: 'failed',
        },
      ],
    ],
    [
      'aborted',
      [
        { exitCode: 0, stdout: 'contracts\n', stderr: '' },
        { stdout: '', stderr: '', timedOut: true },
      ],
    ],
  ] as const)('records process truth for injected %s runs', async (expectedStatus, results) => {
    const root = createWorkspaceRoot();
    const plan = createNxVerificationAdapterPlan({
      dryRunId: `dry_run_${expectedStatus}`,
      cwd: root,
      allowedCwdRoots: [root],
      targets: ['lint', 'test'],
    });
    const runner = createSequenceRunner(results);
    const result = await executeNxVerificationAdapter({
      plan,
      authority: createAuthority(),
      executablePath: 'pnpm',
      timeoutMs: 1000,
      runner,
    });

    expect(result.status).toBe(expectedStatus);
    expect(
      validateCapabilityExecutionEnvelope({
        manifest: plan.manifest,
        authority: createAuthority(),
        capabilityResult: result.capabilityResult,
        evidenceRefs: result.evidenceRefs,
        auditEvents: result.auditEvents,
      }).ok,
    ).toBe(true);
    expect(result.capabilityResult.processBoundaryInvoked).toBe(true);
    expect(result.capabilityResult.externalProcessStarted).toBe(true);
    expect(result.capabilityResult.noRealWrite).toBe(true);
    expect(
      result.commandResults.every((commandResult) => commandResult.outputBodyStored === false),
    ).toBe(true);
    expect(result.evidenceRefs.some((ref) => ref.kind === 'verification.run_summary')).toBe(true);
    expect(result.auditEvents[0].policyDecisionId).toBe('policy_nx');
    expect(CapabilityExecutionResultSchema.parse(result.capabilityResult)).toBeTruthy();
    expect(CapabilityAuditEventSchema.parse(result.auditEvents[0])).toBeTruthy();
  });

  it('records start failure without claiming an external process started', async () => {
    const root = createWorkspaceRoot();
    const plan = createNxVerificationAdapterPlan({
      dryRunId: 'dry_run_start_failure',
      cwd: root,
      allowedCwdRoots: [root],
      targets: ['build'],
    });
    const result = await executeNxVerificationAdapter({
      plan,
      authority: createAuthority(),
      executablePath: 'pnpm',
      timeoutMs: 1000,
      runner: createSequenceRunner([{ startFailureKind: 'spawn_error', stdout: '', stderr: '' }]),
    });

    expect(result.status).toBe('failed');
    expect(result.capabilityResult.processBoundaryInvoked).toBe(true);
    expect(result.capabilityResult.externalProcessStarted).toBe(false);
    expect(result.commandResults[0]?.externalProcessStarted).toBe(false);
  });
});

function createWorkspaceRoot(): string {
  return mkdtempSync(resolve(tmpdir(), 'codexhub-nx-verification-adapter-'));
}

function createAuthority(input: { allowed?: boolean; expiresAt?: string } = {}) {
  return ExecutionAuthoritySchema.parse({
    id: 'authority_nx',
    schemaVersion: '2026-04-28.foundation',
    createdAt: new Date().toISOString(),
    policyDecisionId: 'policy_nx',
    allowed: input.allowed ?? true,
    constraints: ['read-only'],
    expiresAt: input.expiresAt,
  });
}

function createSequenceRunner(
  results: readonly Awaited<ReturnType<NxVerificationProcessRunner['start']>>[],
): NxVerificationProcessRunner {
  let index = 0;

  return {
    start: async () => results[Math.min(index++, results.length - 1)] ?? {},
  };
}
