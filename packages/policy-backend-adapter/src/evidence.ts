import {
  type EvidenceRef,
  type PolicyBackendEvaluationPlan,
  type PolicyBackendNormalizedDecisionTrace,
  type PolicyBackendRawEvaluationSummary,
} from '@codexhub/contracts';
import { createEvidenceRef } from '@codexhub/evidence-kernel';

export function createPolicyBackendPlanEvidence(
  plan: PolicyBackendEvaluationPlan,
): EvidenceRef {
  return createEvidenceRef({
    kind: 'policy_backend.evaluation_plan',
    label: 'policy-backend-plan',
    summary: plan.summary,
    metadata: {
      planId: plan.id,
      backendKind: plan.backendKind,
      actionType: plan.actionType,
      actionMode: plan.actionMode,
      blockReasons: plan.blockReasons,
      rawPolicySourceStored: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
    },
  });
}

export function createPolicyBackendRawEvaluationEvidence(
  summary: PolicyBackendRawEvaluationSummary,
): EvidenceRef {
  return createEvidenceRef({
    kind: 'policy_backend.raw_evaluation_summary',
    label: 'policy-backend-raw-evaluation',
    summary: summary.summary,
    metadata: {
      planId: summary.planId,
      backendKind: summary.backendKind,
      status: summary.status,
      rawOutcome: summary.rawOutcome,
      rawEvaluationHash: summary.rawEvaluationHash,
      reasonCount: summary.reasonCount,
      matchedRuleCount: summary.matchedRuleCount,
      rawPolicySourceStored: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
    },
  });
}

export function createPolicyBackendNormalizedTraceEvidence(
  trace: PolicyBackendNormalizedDecisionTrace,
): EvidenceRef {
  return createEvidenceRef({
    kind: 'policy_backend.normalized_decision_trace',
    label: 'policy-backend-normalized-decision-trace',
    summary: trace.summary,
    metadata: {
      planId: trace.planId,
      rawEvaluationSummaryId: trace.rawEvaluationSummaryId,
      codexhubPolicyDecisionId: trace.codexhubPolicyDecisionId,
      policyDecisionHash: trace.policyDecisionHash,
      backendKind: trace.backendKind,
      backendOutcome: trace.backendOutcome,
      normalizedOutcome: trace.normalizedOutcome,
      authorityProvider: trace.authorityProvider,
      backendAdvisoryOnly: true,
      rawPolicySourceStored: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
    },
  });
}
