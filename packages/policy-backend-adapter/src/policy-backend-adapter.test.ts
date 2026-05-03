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
import {
  createPolicyBackendAuditEvent,
  createPolicyBackendAdapterManifest,
  createPolicyBackendPlanEvidence,
  executePolicyBackendEvaluation,
  planPolicyBackendEvaluation,
} from './index';

const authority: ExecutionAuthority = {
  id: foundationId('execution_authority'),
  schemaVersion: SchemaVersionSchema.value,
  createdAt: foundationTimestamp(),
  policyDecisionId: 'policy_authority_1',
  allowed: true,
  constraints: ['fixture-only'],
};

describe('policy-backend-adapter', () => {
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
    expect(opaPlan.plan.blockReasons).toContain('opa backend is plan-only in M7a');
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
});
