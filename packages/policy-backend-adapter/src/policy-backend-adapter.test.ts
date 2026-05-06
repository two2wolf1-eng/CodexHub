import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  CapabilityAuditEventSchema,
  CapabilityManifestSchema,
  type ExecutionAuthority,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { validateCapabilityExecutionEnvelope } from '@codexhub/capability-adapter-kernel';
import { hashText } from '@codexhub/evidence-kernel';
import {
  createPolicyBackendAuditEvent,
  createPolicyBackendAdapterManifest,
  createPolicyBackendFixtureConfigEvaluator,
  createPolicyBackendPlanEvidence,
  executePolicyBackendEvaluation,
  parsePolicyBackendFixtureConfig,
  planPolicyBackendEvaluation,
  runRealPolicyBackendBoundary,
} from './index';

const authority: ExecutionAuthority = {
  id: foundationId('execution_authority'),
  schemaVersion: SchemaVersionSchema.value,
  createdAt: foundationTimestamp(),
  policyDecisionId: 'policy_authority_1',
  allowed: true,
  constraints: ['fixture-only'],
};
const sourceDir = new URL('.', import.meta.url);

describe('policy-backend-adapter', () => {
  it('keeps real policy process and HTTP boundaries isolated to the reviewed boundary file', () => {
    const productionSources = [
      'audit.ts',
      'evidence.ts',
      'execute.ts',
      'fixture-config.ts',
      'index.ts',
      'manifest.ts',
      'plan.ts',
    ].map((fileName) => readFileSync(new URL(`./${fileName}`, sourceDir), 'utf8'));
    const boundarySource = readFileSync(new URL('./real-policy-boundary.ts', sourceDir), 'utf8');
    const nonBoundaryForbiddenTerms = [
      'node:child_process',
      'child_process',
      'spawn(',
      'execFile(',
      'fetch(',
      'globalThis.fetch',
      'http://',
      'https://',
      'process.env',
    ];
    const boundaryForbiddenTerms = [
      'execFile(',
      'exec(',
      'shell: true',
      'curl',
      'wget',
      'rawPolicySourceStored: true',
      'rawInputStored: true',
      'rawOutputStored: true',
      'authorityProvider: rawEvaluation',
      'backendAdvisoryOnly: false',
    ];

    for (const source of productionSources) {
      expect(nonBoundaryForbiddenTerms.filter((term) => source.includes(term))).toEqual([]);
    }

    expect(boundaryForbiddenTerms.filter((term) => boundarySource.includes(term))).toEqual([]);
    expect(boundarySource).toContain("['eval', '--stdin-input', '--format', 'json'");
    expect(boundarySource).toContain("['authorize']");
    expect(boundarySource).toContain('isLoopbackHost(endpoint.hostname)');
    expect(boundarySource).toContain('isAllowedPolicyPath(input.backendKind, endpoint.pathname)');
  });

  it('declares a policy capability manifest without process or network boundary', () => {
    const manifest = CapabilityManifestSchema.parse(createPolicyBackendAdapterManifest());

    expect(manifest.kind).toBe('policy');
    expect(manifest.provider).toBe('builtin');
    expect(manifest.defaultActionMode).toBe('read');
    expect(manifest.processBoundary.mayStartExternalProcess).toBe(false);
    expect(manifest.metadata?.authorityProvider).toBe('codexhub');
  });

  it('plans metadata-only fixture policy evaluations and blocks real backends in M7a', () => {
    const plan = planPolicyBackendEvaluation({
      backendKind: 'fixture',
      actionId: 'action_1',
      actionType: 'workspace.read',
      actionMode: 'read',
      riskLevel: 'low',
      policySourceHash: 'sha256:policy-source',
    });
    const opaPlan = planPolicyBackendEvaluation({
      backendKind: 'opa',
      actionId: 'action_2',
      actionType: 'workspace.read',
      actionMode: 'read',
      riskLevel: 'low',
    });

    expect(plan.plan.processBoundaryPlanned).toBe(false);
    expect(plan.plan.networkBoundaryPlanned).toBe(false);
    expect(plan.plan.rawPolicySourceStored).toBe(false);
    expect(plan.capabilityDryRun.plannedActions[0]?.actionMode).toBe('read');
    expect(opaPlan.plan.blockReasons).toContain('opa backend is plan-only in M7b');
    expect(JSON.stringify(plan)).not.toContain('package codexhub.authz');
  });

  it('blocks execution without allowed authority before evidence or audit is created', async () => {
    const planResult = planPolicyBackendEvaluation({
      actionId: 'action_1',
      actionType: 'workspace.read',
      actionMode: 'read',
    });
    const result = await executePolicyBackendEvaluation({
      planResult,
      policyInput: {
        actionId: 'action_1',
        actionType: 'workspace.read',
        actionMode: 'read',
        dryRun: true,
      },
    });

    expect(result.run.status).toBe('blocked');
    expect(result.capabilityResult.processBoundaryInvoked).toBe(false);
    expect(result.capabilityResult.externalProcessStarted).toBe(false);
    expect(result.run.evidenceRefs).toEqual([]);
  });

  it('keeps backend evaluation advisory while CodexHub policy remains authoritative', async () => {
    const manifest = createPolicyBackendAdapterManifest();
    const planResult = planPolicyBackendEvaluation({
      actionId: 'action_write_1',
      actionType: 'git.worktree.create',
      actionMode: 'read',
      riskLevel: 'low',
      metadata: { noRealWrite: true },
    });
    const result = await executePolicyBackendEvaluation({
      planResult,
      authority,
      policyInput: {
        actionId: 'action_write_1',
        actionType: 'git.worktree.create',
        actionMode: 'read',
        riskLevel: 'low',
        dryRun: true,
        metadata: { noRealWrite: true },
      },
      evaluator: () => ({
        rawOutcome: 'deny',
        reasons: ['fixture backend denies but remains advisory'],
        matchedRuleCount: 1,
      }),
    });
    const validation = validateCapabilityExecutionEnvelope({
      manifest,
      authority,
      capabilityResult: result.capabilityResult,
      evidenceRefs: result.run.evidenceRefs,
      auditEvents: result.run.auditEventIds.map((id) => {
        const event = result.run.normalizedDecisionTrace?.auditEventIds.includes(id);
        expect(event).toBe(true);
        return {
          id,
          schemaVersion: SchemaVersionSchema.value,
          createdAt: foundationTimestamp(),
          actor: 'codexhub.local',
          action: 'policy_backend.evaluate.fixture',
          target: 'codexhub-policy-model',
          reason: 'synthetic validation event',
          outcome: 'completed',
          policyDecisionId: authority.policyDecisionId,
          evidenceRefs: result.run.evidenceRefs,
          metadata: {
            liveExecution: false,
            externalProcessStarted: false,
          },
        };
      }),
    });

    expect(result.run.status).toBe('completed');
    expect(result.run.rawEvaluationSummary?.rawOutcome).toBe('deny');
    expect(result.run.normalizedDecisionTrace?.authorityProvider).toBe('codexhub');
    expect(result.run.normalizedDecisionTrace?.backendAdvisoryOnly).toBe(true);
    expect(result.run.normalizedDecisionTrace?.normalizedOutcome).toBe('allow');
    expect(result.run.plan.rawPolicySourceStored).toBe(false);
    expect(JSON.stringify(result.run)).not.toContain('package codexhub.authz');
    expect(validation.ok).toBe(true);
  });

  it('keeps CodexHub approval requirements authoritative when backend allows a real write', async () => {
    const planResult = planPolicyBackendEvaluation({
      actionId: 'action_write_approval_1',
      actionType: 'git.worktree.create',
      actionMode: 'write',
      riskLevel: 'medium',
    });
    const result = await executePolicyBackendEvaluation({
      planResult,
      authority,
      policyInput: {
        actionId: 'action_write_approval_1',
        actionType: 'git.worktree.create',
        actionMode: 'write',
        riskLevel: 'medium',
        dryRun: true,
      },
      evaluator: () => ({
        rawOutcome: 'allow',
        reasons: ['fixture backend allows but must not grant authority'],
        matchedRuleCount: 1,
      }),
    });

    expect(result.run.rawEvaluationSummary?.rawOutcome).toBe('allow');
    expect(result.run.normalizedDecisionTrace?.normalizedOutcome).toBe('approval_required');
    expect(result.run.normalizedDecisionTrace?.authorityProvider).toBe('codexhub');
    expect(result.run.normalizedDecisionTrace?.backendAdvisoryOnly).toBe(true);
    expect(JSON.stringify(result.run)).not.toContain('approvalArtifactId');
    expect(JSON.stringify(result.run)).not.toContain('executionAuthority');
  });

  it('creates capability audit events with advisory-only metadata', () => {
    const planResult = planPolicyBackendEvaluation({
      actionId: 'action_audit_1',
      actionType: 'workspace.read',
      actionMode: 'read',
    });
    const planEvidence = createPolicyBackendPlanEvidence(planResult.plan);
    const auditEvent = CapabilityAuditEventSchema.parse(
      createPolicyBackendAuditEvent({
        action: 'policy_backend.evaluate.fixture',
        target: 'codexhub-policy-model',
        reason: 'Validate M7.5 policy backend audit envelope.',
        outcome: 'completed',
        policyDecisionId: authority.policyDecisionId,
        evidenceRefs: [planEvidence],
        metadata: {
          backendOutcome: 'deny',
          normalizedOutcome: 'allow',
        },
      }),
    );

    expect(auditEvent.actor).toBe('codexhub.local');
    expect(auditEvent.target).toBe('codexhub-policy-model');
    expect(auditEvent.reason).toBe('Validate M7.5 policy backend audit envelope.');
    expect(auditEvent.metadata?.liveExecution).toBe(false);
    expect(auditEvent.metadata?.externalProcessStarted).toBe(false);
    expect(auditEvent.metadata?.backendAdvisoryOnly).toBe(true);
    expect(auditEvent.metadata?.authorityProvider).toBe('codexhub');
  });

  it('uses config-backed fixture rules without storing raw config or path bodies', async () => {
    const configText = JSON.stringify({
      schemaVersion: SchemaVersionSchema.value,
      description: 'local fixture policy rules',
      rules: [
        {
          id: 'write-allow-advisory',
          match: {
            actionType: 'git.worktree.create',
            actionMode: 'write',
            riskLevel: 'medium',
          },
          rawOutcome: 'allow',
          reasons: ['config-backed fixture allows but remains advisory'],
          matchedRuleCount: 1,
          summary: 'Config fixture matched write action.',
        },
      ],
    });
    const configLoad = parsePolicyBackendFixtureConfig(configText);
    const policyInput = {
      actionId: 'action_config_write_1',
      actionType: 'git.worktree.create',
      actionMode: 'write' as const,
      riskLevel: 'medium' as const,
      dryRun: true,
    };
    const planResult = planPolicyBackendEvaluation({
      backendKind: 'fixture',
      evaluatorSource: 'fixture-config',
      actionId: policyInput.actionId,
      actionType: policyInput.actionType,
      actionMode: policyInput.actionMode,
      riskLevel: policyInput.riskLevel,
      fixtureConfigHash: configLoad.configHash,
      fixtureRuleCount: configLoad.ruleCount,
    });
    const result = await executePolicyBackendEvaluation({
      planResult,
      authority,
      policyInput,
      evaluator: createPolicyBackendFixtureConfigEvaluator({
        config: configLoad.config,
        policyInput,
      }),
    });
    const serialized = JSON.stringify(result);

    expect(configLoad.rawConfigStored).toBe(false);
    expect(configLoad.rawPathStored).toBe(false);
    expect(configLoad.bodyStored).toBe(false);
    expect(planResult.plan.evaluatorSource).toBe('fixture-config');
    expect(planResult.plan.fixtureConfigHash).toBe(configLoad.configHash);
    expect(planResult.plan.fixtureRuleCount).toBe(1);
    expect(result.run.rawEvaluationSummary?.rawOutcome).toBe('allow');
    expect(result.run.rawEvaluationSummary?.evaluatorSource).toBe('fixture-config');
    expect(result.run.rawEvaluationSummary?.fixtureConfigHash).toBe(configLoad.configHash);
    expect(result.run.normalizedDecisionTrace?.normalizedOutcome).toBe('approval_required');
    expect(result.run.normalizedDecisionTrace?.authorityProvider).toBe('codexhub');
    expect(result.run.normalizedDecisionTrace?.backendAdvisoryOnly).toBe(true);
    expect(serialized).not.toContain('local fixture policy rules');
    expect(serialized).not.toContain('.codexhub/policy-backend.fixture.json');
    expect(serialized).not.toContain('rawConfig');
  });

  it('runs real policy backend boundaries with fixed CLI shape and hash-only output', async () => {
    const transientInput = JSON.stringify({ action: 'workspace.read', secret: 'hidden' });
    const transientPolicySource = 'package codexhub.authz\nallow := true';
    const result = await runRealPolicyBackendBoundary({
      backendKind: 'opa',
      runtimeMode: 'local-cli',
      inputHash: `sha256:${hashText(transientInput)}`,
      policySourceHash: `sha256:${hashText(transientPolicySource)}`,
      transientInput,
      transientPolicySource,
      spawnProcess: async ({ command, args }) => ({
        status: command === 'opa' && args[0] === 'eval' ? 'completed' : 'failed',
        stdoutHash: 'sha256:stdout',
        stderrHash: 'sha256:stderr',
        stdoutByteCount: 2,
        stderrByteCount: 0,
        exitCode: 0,
        summary: 'Synthetic policy CLI completed.',
      }),
    });
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('completed');
    expect(result.processBoundaryInvoked).toBe(true);
    expect(result.externalProcessStarted).toBe(true);
    expect(result.networkBoundaryInvoked).toBe(false);
    expect(result.rawPolicySourceStored).toBe(false);
    expect(result.rawInputStored).toBe(false);
    expect(result.rawOutputStored).toBe(false);
    expect(serialized).not.toContain('package codexhub.authz');
    expect(serialized).not.toContain('hidden');
  });

  it('blocks policy HTTP backends outside loopback or fixed endpoint paths before fetch', async () => {
    const transientInput = JSON.stringify({ action: 'workspace.read', token: 'hidden' });
    const inputHash = `sha256:${hashText(transientInput)}`;
    const externalEndpoint = 'http://policy.example.test/v1/data/codexhub/allow';
    const wrongPathEndpoint = 'http://127.0.0.1:8181/v1/query';
    let fetchCallCount = 0;
    const external = await runRealPolicyBackendBoundary({
      backendKind: 'opa',
      runtimeMode: 'loopback-http',
      inputHash,
      policySourceHash: 'sha256:policy',
      endpointUrl: externalEndpoint,
      endpointHash: `sha256:${hashText(externalEndpoint)}`,
      transientInput,
      fetch: async () => {
        fetchCallCount += 1;
        throw new Error('fetch must not run for external endpoint');
      },
    });
    const wrongPath = await runRealPolicyBackendBoundary({
      backendKind: 'cedar',
      runtimeMode: 'loopback-http',
      inputHash,
      policySourceHash: 'sha256:policy',
      endpointUrl: wrongPathEndpoint,
      endpointHash: `sha256:${hashText(wrongPathEndpoint)}`,
      transientInput,
      fetch: async () => {
        fetchCallCount += 1;
        throw new Error('fetch must not run for wrong path');
      },
    });
    const serialized = JSON.stringify({ external, wrongPath });

    expect(external.status).toBe('blocked');
    expect(wrongPath.status).toBe('blocked');
    expect(fetchCallCount).toBe(0);
    expect(external.networkBoundaryInvoked).toBe(false);
    expect(wrongPath.networkBoundaryInvoked).toBe(false);
    expect(serialized).not.toContain('policy.example.test');
    expect(serialized).not.toContain('hidden');
  });

  it('runs policy HTTP backends only on loopback fixed paths with hash-only output', async () => {
    const transientInput = JSON.stringify({ action: 'workspace.read', secret: 'hidden' });
    const endpointUrl = 'http://127.0.0.1:8181/v1/data/codexhub/allow';
    const requestedUrls: string[] = [];
    const result = await runRealPolicyBackendBoundary({
      backendKind: 'opa',
      runtimeMode: 'loopback-http',
      inputHash: `sha256:${hashText(transientInput)}`,
      policySourceHash: 'sha256:policy',
      endpointUrl,
      endpointHash: `sha256:${hashText(endpointUrl)}`,
      transientInput,
      fetch: async (url, init) => {
        requestedUrls.push(url);
        expect(init.method).toBe('POST');
        expect(init.headers['content-type']).toBe('application/json');
        expect(init.body).toContain('inputHash');
        expect(init.body).toContain('policySourceHash');
        return {
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify({ result: true, secret: 'hidden' });
          },
        };
      },
    });
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('completed');
    expect(result.processBoundaryInvoked).toBe(false);
    expect(result.externalProcessStarted).toBe(false);
    expect(result.networkBoundaryInvoked).toBe(true);
    expect(result.rawInputStored).toBe(false);
    expect(result.rawOutputStored).toBe(false);
    expect(requestedUrls).toEqual([endpointUrl]);
    expect(serialized).not.toContain('hidden');
    expect(serialized).not.toContain(endpointUrl);
  });
});
