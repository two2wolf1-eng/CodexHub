import {
  type CapabilityExecutionResult,
  CapabilityExecutionResultSchema,
  ExecutionAuthoritySchema,
  type ExecutionAuthority,
  type PolicyBackendEvaluationRun,
  PolicyBackendEvaluationRunSchema,
  PolicyBackendNormalizedDecisionTraceSchema,
  PolicyBackendRawEvaluationSummarySchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import { evaluateAction, type PolicyActionInput } from '@codexhub/security-kernel';
import { createPolicyBackendAuditEvent } from './audit';
import {
  createPolicyBackendNormalizedTraceEvidence,
  createPolicyBackendPlanEvidence,
  createPolicyBackendRawEvaluationEvidence,
} from './evidence';
import type { PolicyBackendPlanResult } from './plan';

export interface PolicyBackendFixtureEvaluation {
  rawOutcome: 'allow' | 'deny' | 'unknown' | 'error';
  reasons?: readonly string[];
  matchedRuleCount?: number;
  summary?: string;
}

export interface ExecutePolicyBackendEvaluationInput {
  planResult: PolicyBackendPlanResult;
  policyInput: PolicyActionInput;
  authority?: ExecutionAuthority;
  evaluator?: () => PolicyBackendFixtureEvaluation | Promise<PolicyBackendFixtureEvaluation>;
}

export interface ExecutePolicyBackendEvaluationResult {
  run: PolicyBackendEvaluationRun;
  capabilityResult: CapabilityExecutionResult;
}

export async function executePolicyBackendEvaluation(
  input: ExecutePolicyBackendEvaluationInput,
): Promise<ExecutePolicyBackendEvaluationResult> {
  const authority = ExecutionAuthoritySchema.safeParse(input.authority);

  if (!authority.success || !input.authority?.allowed) {
    return createBlockedRun(input.planResult, 'Policy backend execution requires allowed authority.');
  }

  if (input.planResult.plan.blockReasons.length > 0) {
    return createBlockedRun(input.planResult, input.planResult.plan.blockReasons.join('; '));
  }

  if (!input.evaluator) {
    return createBlockedRun(input.planResult, 'Policy backend fixture evaluator is required in M7a.');
  }

  const backendEvaluation = await input.evaluator();
  const status = backendEvaluation.rawOutcome === 'error' ? 'failed' : 'completed';
  const rawEvaluation = PolicyBackendRawEvaluationSummarySchema.parse({
    id: foundationId('policy_backend_raw_evaluation'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    planId: input.planResult.plan.id,
    backendKind: input.planResult.plan.backendKind,
    status,
    rawOutcome: backendEvaluation.rawOutcome,
    rawEvaluationHash: `sha256:${hashText(JSON.stringify(backendEvaluation))}`,
    reasonCount: backendEvaluation.reasons?.length ?? 0,
    matchedRuleCount: backendEvaluation.matchedRuleCount ?? 0,
    policySourceHash: input.planResult.plan.policySourceHash,
    rawPolicySourceStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    summary: backendEvaluation.summary ?? 'Fixture policy backend evaluation completed.',
  });
  const codexhubDecision = evaluateAction(input.policyInput);
  const normalizedTrace = PolicyBackendNormalizedDecisionTraceSchema.parse({
    id: foundationId('policy_backend_normalized_trace'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    planId: input.planResult.plan.id,
    rawEvaluationSummaryId: rawEvaluation.id,
    codexhubPolicyDecisionId: codexhubDecision.id,
    policyDecisionHash: `sha256:${hashText(JSON.stringify(codexhubDecision))}`,
    backendKind: input.planResult.plan.backendKind,
    backendOutcome: rawEvaluation.rawOutcome,
    normalizedOutcome: codexhubDecision.outcome,
    authorityProvider: 'codexhub',
    backendAdvisoryOnly: true,
    evidenceRefs: [],
    auditEventIds: [],
    rawPolicySourceStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    summary: 'CodexHub security-kernel normalized the advisory backend result.',
  });
  const evidenceRefs = [
    createPolicyBackendPlanEvidence(input.planResult.plan),
    createPolicyBackendRawEvaluationEvidence(rawEvaluation),
    createPolicyBackendNormalizedTraceEvidence(normalizedTrace),
  ];
  const auditEvent = createPolicyBackendAuditEvent({
    action: 'policy_backend.evaluate.fixture',
    target: 'codexhub-policy-model',
    reason: 'M7a fixture policy backend evaluation completed without authority transfer.',
    outcome: status,
    policyDecisionId: input.authority.policyDecisionId,
    evidenceRefs,
    metadata: {
      backendKind: input.planResult.plan.backendKind,
      backendOutcome: rawEvaluation.rawOutcome,
      normalizedOutcome: codexhubDecision.outcome,
    },
  });
  const run = PolicyBackendEvaluationRunSchema.parse({
    id: foundationId('policy_backend_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    status,
    plan: input.planResult.plan,
    rawEvaluationSummary: rawEvaluation,
    normalizedDecisionTrace: {
      ...normalizedTrace,
      evidenceRefs,
      auditEventIds: [auditEvent.id],
    },
    evidenceRefs,
    auditEventIds: [auditEvent.id],
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    summary:
      status === 'completed'
        ? 'Policy backend fixture evaluation completed as advisory metadata.'
        : 'Policy backend fixture evaluation failed as metadata-only result.',
  });
  const capabilityResult = CapabilityExecutionResultSchema.parse({
    id: foundationId('capability_result'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    status,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    evidenceRefs: evidenceRefs.map((ref) => ref.id),
    auditEventIds: [auditEvent.id],
    summary: run.summary,
  });

  return { run, capabilityResult };
}

function createBlockedRun(
  planResult: PolicyBackendPlanResult,
  summary: string,
): ExecutePolicyBackendEvaluationResult {
  const run = PolicyBackendEvaluationRunSchema.parse({
    id: foundationId('policy_backend_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    status: 'blocked',
    plan: planResult.plan,
    evidenceRefs: [],
    auditEventIds: [],
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    summary,
  });
  const capabilityResult = CapabilityExecutionResultSchema.parse({
    id: foundationId('capability_result'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    status: 'blocked',
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    evidenceRefs: [],
    auditEventIds: [],
    summary,
  });

  return { run, capabilityResult };
}
