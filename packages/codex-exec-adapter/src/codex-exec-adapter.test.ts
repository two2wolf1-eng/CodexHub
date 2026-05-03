import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type CodexExecRealReadOnlyAdapterProcessRunner } from '@codexhub/codex-kernel';
import {
  CapabilityAuditEventSchema,
  CapabilityExecutionResultSchema,
  CapabilityManifestSchema,
  ExecutionAuthoritySchema,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import { describe, expect, it } from 'vitest';
import { createCodexExecAdapterManifest } from './manifest';
import { createCodexExecAdapterPlan } from './plan';
import { executeCodexExecAdapter } from './execute';
import { parseCodexExecAdapterJsonl } from './jsonl-parser';
import { normalizeCodexExecAdapterEvents } from './event-normalizer';

describe('codex-exec-adapter manifest', () => {
  it('parses as a capability manifest', () => {
    const manifest = createCodexExecAdapterManifest();

    expect(CapabilityManifestSchema.parse(manifest)).toMatchObject({
      name: 'codex-cli',
      kind: 'codex',
      provider: 'external-process',
      defaultRisk: 'medium',
      defaultActionMode: 'dry-run',
      requiresApprovalByDefault: true,
      evidencePolicy: {
        bodyStorage: 'hash-only',
      },
      processBoundary: {
        mayStartExternalProcess: true,
        requiresProcessAudit: true,
      },
    });
  });
});

describe('codex-exec-adapter plan', () => {
  it('accepts allowlisted cwd and hash-bound governed input', () => {
    const fixture = createGovernedInputFixture();
    const plan = createCodexExecAdapterPlan({
      dryRunId: 'dry_run_1',
      cwd: fixture.root,
      allowedCwdRoots: [fixture.root],
      governedInput: fixture.governedInput,
      sandboxMode: 'read-only',
      approvalMode: 'required',
    });

    expect(plan.status).toBe('ready');
    expect(plan.processBoundaryPlanned).toBe(true);
    expect(plan.externalProcessStarted).toBe(false);
    expect(plan.noRealWrite).toBe(true);
    expect(plan.governedInput.status).toBe('verified');
    expect(plan.capabilityDryRun.inputSummary).toMatchObject({
      bodyStored: false,
      governedInputContentHash: fixture.expectedContentHash,
    });
  });

  it('rejects arbitrary flags and forbidden sandbox modes', () => {
    const fixture = createGovernedInputFixture();
    const plan = createCodexExecAdapterPlan({
      dryRunId: 'dry_run_2',
      cwd: fixture.root,
      allowedCwdRoots: [fixture.root],
      governedInput: fixture.governedInput,
      requestedArgs: ['exec', '--json', '--unexpected'],
      sandboxMode: 'workspace_write',
    });

    expect(plan.status).toBe('blocked');
    expect(plan.blockReasons).toContain('arbitrary_args_forbidden');
    expect(plan.blockReasons).toContain('workspace_write_forbidden');
  });

  it('rejects danger full access and raw input bodies', () => {
    const fixture = createGovernedInputFixture();
    const plan = createCodexExecAdapterPlan({
      dryRunId: 'dry_run_3',
      cwd: fixture.root,
      allowedCwdRoots: [fixture.root],
      governedInput: fixture.governedInput,
      rawPromptBody: 'do the task directly',
      stdinBody: 'stdin text',
      sandboxMode: 'danger_full_access',
    });

    expect(plan.status).toBe('blocked');
    expect(plan.blockReasons).toContain('raw_prompt_body_forbidden');
    expect(plan.blockReasons).toContain('stdin_body_forbidden');
    expect(plan.blockReasons).toContain('danger_full_access_forbidden');
  });

  it('rejects absolute and parent-traversal governed input paths', () => {
    const fixture = createGovernedInputFixture();
    const absolutePlan = createCodexExecAdapterPlan({
      dryRunId: 'dry_run_4',
      cwd: fixture.root,
      allowedCwdRoots: [fixture.root],
      governedInput: {
        sourceKind: 'governed_file',
        relativePath: resolve(fixture.root, fixture.relativePath),
        expectedContentHash: fixture.expectedContentHash,
      },
    });
    const traversalPlan = createCodexExecAdapterPlan({
      dryRunId: 'dry_run_5',
      cwd: fixture.root,
      allowedCwdRoots: [fixture.root],
      governedInput: {
        sourceKind: 'governed_file',
        relativePath: '../outside.md',
        expectedContentHash: fixture.expectedContentHash,
      },
    });

    expect(absolutePlan.status).toBe('blocked');
    expect(absolutePlan.blockReasons).toContain('governed_input_blocked');
    expect(traversalPlan.status).toBe('blocked');
    expect(traversalPlan.blockReasons).toContain('governed_input_blocked');
  });

  it('rejects hash mismatch and cwd outside allowlist', () => {
    const fixture = createGovernedInputFixture();
    const otherRoot = mkdtempSync(resolve(tmpdir(), 'codexhub-other-'));
    const plan = createCodexExecAdapterPlan({
      dryRunId: 'dry_run_6',
      cwd: fixture.root,
      allowedCwdRoots: [otherRoot],
      governedInput: {
        ...fixture.governedInput,
        expectedContentHash: `sha256:${hashText('not the same')}`,
      },
    });

    expect(plan.status).toBe('blocked');
    expect(plan.blockReasons).toContain('cwd_outside_allowlist');
    expect(plan.blockReasons).toContain('governed_input_blocked');
  });
});

describe('codex-exec-adapter JSONL normalization', () => {
  it('handles completed, failed, and unknown event fixtures', () => {
    const completed = normalizeCodexExecAdapterEvents(
      parseCodexExecAdapterJsonl(readFixture('codex-exec-basic.jsonl')).lines,
    );
    const failed = normalizeCodexExecAdapterEvents(
      parseCodexExecAdapterJsonl(readFixture('codex-exec-error.jsonl')).lines,
    );
    const unknown = normalizeCodexExecAdapterEvents(
      parseCodexExecAdapterJsonl(readFixture('codex-exec-unknown-event.jsonl')).lines,
    );

    expect(completed.finalStatus).toBe('completed');
    expect(completed.commandExecutionCount).toBeGreaterThan(0);
    expect(completed.fileChangeCount).toBeGreaterThan(0);
    expect(completed.rawPayloadStored).toBe(false);
    expect(failed.finalStatus).toBe('failed');
    expect(failed.errorCount).toBeGreaterThan(0);
    expect(unknown.unknownCount).toBeGreaterThan(0);
    expect(unknown.eventPayloadHashes.every((hash) => hash.startsWith('sha256:'))).toBe(true);
  });
});

describe('codex-exec-adapter execute', () => {
  it('blocks missing authority before a process boundary', async () => {
    const fixture = createGovernedInputFixture();
    const plan = createCodexExecAdapterPlan({
      dryRunId: 'dry_run_blocked',
      cwd: fixture.root,
      allowedCwdRoots: [fixture.root],
      governedInput: fixture.governedInput,
    });
    const result = await executeCodexExecAdapter({
      plan,
      executablePath: 'codex',
      timeoutMs: 1000,
    });

    expect(result.capabilityResult.status).toBe('blocked');
    expect(result.capabilityResult.processBoundaryInvoked).toBe(false);
    expect(result.capabilityResult.externalProcessStarted).toBe(false);
    expect(result.evidenceRefs).toHaveLength(2);
    expect(CapabilityExecutionResultSchema.parse(result.capabilityResult)).toBeTruthy();
    expect(CapabilityAuditEventSchema.parse(result.auditEvents[0])).toBeTruthy();
  });

  it('blocks allowed authority without a persisted approval artifact', async () => {
    const fixture = createGovernedInputFixture();
    const plan = createCodexExecAdapterPlan({
      dryRunId: 'dry_run_missing_approval',
      cwd: fixture.root,
      allowedCwdRoots: [fixture.root],
      governedInput: fixture.governedInput,
    });
    const authority = ExecutionAuthoritySchema.parse({
      id: 'authority_missing_approval',
      schemaVersion: '2026-04-28.foundation',
      createdAt: new Date().toISOString(),
      policyDecisionId: 'policy_missing_approval',
      allowed: true,
      constraints: ['read-only'],
    });
    const result = await executeCodexExecAdapter({
      plan,
      authority,
      executablePath: 'codex',
      timeoutMs: 1000,
    });

    expect(result.capabilityResult.status).toBe('blocked');
    expect(result.capabilityResult.processBoundaryInvoked).toBe(false);
    expect(result.capabilityResult.summary).toContain('persisted_approval_missing');
  });

  it.each([
    ['completed', { exitCode: 0, stdout: readFixture('codex-exec-basic.jsonl'), stderr: '' }],
    ['failed', { exitCode: 1, stdout: readFixture('codex-exec-error.jsonl'), stderr: 'failed' }],
    ['aborted', { stdout: '', stderr: '', timedOut: true }],
  ] as const)('records process truth for injected %s runs', async (_label, runnerResult) => {
    const fixture = createGovernedInputFixture();
    const plan = createCodexExecAdapterPlan({
      dryRunId: `dry_run_${_label}`,
      cwd: fixture.root,
      allowedCwdRoots: [fixture.root],
      governedInput: fixture.governedInput,
    });
    const authority = ExecutionAuthoritySchema.parse({
      id: `authority_${_label}`,
      schemaVersion: '2026-04-28.foundation',
      createdAt: new Date().toISOString(),
      policyDecisionId: `policy_${_label}`,
      approvalArtifactId: `approval_${_label}`,
      allowed: true,
      constraints: ['read-only'],
    });
    const runner: CodexExecRealReadOnlyAdapterProcessRunner = {
      start: async () => runnerResult,
    };
    const result = await executeCodexExecAdapter({
      plan,
      authority,
      executablePath: 'codex',
      timeoutMs: 1000,
      runner,
    });

    expect(result.capabilityResult.processBoundaryInvoked).toBe(true);
    expect(result.capabilityResult.externalProcessStarted).toBe(true);
    expect(result.capabilityResult.noRealWrite).toBe(true);
    if (_label === 'aborted') {
      expect(result.eventSummary?.eventCount).toBe(0);
    } else {
      expect(result.eventSummary?.eventCount).toBeGreaterThan(0);
    }
    expect(result.eventSummary?.rawPayloadStored).toBe(false);
    expect(result.eventSummary?.finalStatus).toBe(
      _label === 'completed' ? 'completed' : _label === 'failed' ? 'failed' : 'unknown',
    );
    expect(result.evidenceRefs.length).toBeGreaterThanOrEqual(3);
    expect(result.auditEvents[0].policyDecisionId).toBe(authority.policyDecisionId);
    expect(result.auditEvents[0].metadata?.liveExecution).toBe(true);
    expect(CapabilityExecutionResultSchema.parse(result.capabilityResult)).toBeTruthy();
    expect(CapabilityAuditEventSchema.parse(result.auditEvents[0])).toBeTruthy();
  });

  it('keeps externalProcessStarted false for process start failures', async () => {
    const fixture = createGovernedInputFixture();
    const plan = createCodexExecAdapterPlan({
      dryRunId: 'dry_run_start_failure',
      cwd: fixture.root,
      allowedCwdRoots: [fixture.root],
      governedInput: fixture.governedInput,
    });
    const authority = ExecutionAuthoritySchema.parse({
      id: 'authority_start_failure',
      schemaVersion: '2026-04-28.foundation',
      createdAt: new Date().toISOString(),
      policyDecisionId: 'policy_start_failure',
      approvalArtifactId: 'approval_start_failure',
      allowed: true,
      constraints: ['read-only'],
    });
    const runner: CodexExecRealReadOnlyAdapterProcessRunner = {
      start: async () => ({
        stderr: 'start failure detail must remain hash-only',
        startFailureKind: 'enoent',
      }),
    };
    const result = await executeCodexExecAdapter({
      plan,
      authority,
      executablePath: 'codex',
      timeoutMs: 1000,
      runner,
    });

    expect(result.capabilityResult.status).toBe('failed');
    expect(result.capabilityResult.processBoundaryInvoked).toBe(true);
    expect(result.capabilityResult.externalProcessStarted).toBe(false);
    expect(result.boundaryResult?.externalProcessStarted).toBe(false);
    expect(result.auditEvents[0].metadata?.liveExecution).toBe(true);
    expect(result.auditEvents[0].metadata?.externalProcessStarted).toBe(false);
    expect(JSON.stringify(result.capabilityResult)).not.toContain(
      'start failure detail must remain hash-only',
    );
  });
});

function createGovernedInputFixture(): {
  root: string;
  relativePath: string;
  expectedContentHash: string;
  governedInput: { sourceKind: 'governed_file'; relativePath: string; expectedContentHash: string };
} {
  const root = mkdtempSync(resolve(tmpdir(), 'codexhub-codex-exec-adapter-'));
  const relativePath = '.codexhub/requests/request.md';
  const content = 'Summarize repository metadata only.';
  mkdirSync(resolve(root, '.codexhub', 'requests'), { recursive: true });
  writeFileSync(resolve(root, relativePath), content);
  const expectedContentHash = `sha256:${hashText(content)}`;

  return {
    root,
    relativePath,
    expectedContentHash,
    governedInput: {
      sourceKind: 'governed_file',
      relativePath,
      expectedContentHash,
    },
  };
}

function readFixture(name: string): string {
  return readFileSync(
    resolve(
      dirname(fileURLToPath(import.meta.url)),
      '..',
      '..',
      'codex-kernel',
      'fixtures',
      name,
    ),
    'utf8',
  );
}
