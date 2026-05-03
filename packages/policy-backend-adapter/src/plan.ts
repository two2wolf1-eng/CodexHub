import {
  type ActionMode,
  CapabilityDryRunSchema,
  PolicyBackendEvaluationPlanSchema,
  type PolicyBackendEvaluationPlan,
  type PolicyBackendKind,
  type RiskLevel,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import { POLICY_BACKEND_ADAPTER_NAME } from './manifest';

export interface PolicyBackendPlanInput {
  backendKind?: PolicyBackendKind;
  actionId: string;
  actionType: string;
  actionMode: ActionMode;
  riskLevel?: RiskLevel;
  metadata?: Record<string, unknown>;
  policySourceHash?: string;
}

export interface PolicyBackendPlanResult {
  plan: PolicyBackendEvaluationPlan;
  capabilityDryRun: ReturnType<typeof CapabilityDryRunSchema.parse>;
}

export function planPolicyBackendEvaluation(
  input: PolicyBackendPlanInput,
): PolicyBackendPlanResult {
  const backendKind = input.backendKind ?? 'fixture';
  const blockReasons: string[] = [];
  const inputHash = `sha256:${hashText(
    JSON.stringify({
      backendKind,
      actionId: input.actionId,
      actionType: input.actionType,
      actionMode: input.actionMode,
      riskLevel: input.riskLevel,
      metadata: input.metadata ?? {},
      policySourceHash: input.policySourceHash,
    }),
  )}`;

  if (backendKind !== 'fixture') {
    blockReasons.push(`${backendKind} runtime is plan-only in M7a`);
  }

  const plan = PolicyBackendEvaluationPlanSchema.parse({
    id: foundationId('policy_backend_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: POLICY_BACKEND_ADAPTER_NAME,
    backendKind,
    actionIdHash: `sha256:${hashText(input.actionId)}`,
    actionType: input.actionType,
    actionMode: input.actionMode,
    riskLevel: input.riskLevel,
    inputHash,
    policySourceHash: input.policySourceHash,
    blockReasons,
    processBoundaryPlanned: false,
    networkBoundaryPlanned: false,
    rawPolicySourceStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    summary:
      blockReasons.length > 0
        ? `Policy backend ${backendKind} plan is blocked in M7a.`
        : 'Fixture policy backend evaluation plan is metadata-only.',
  });
  const capabilityDryRun = CapabilityDryRunSchema.parse({
    id: foundationId('capability_dry_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: POLICY_BACKEND_ADAPTER_NAME,
    inputSummary: {
      backendKind,
      actionIdHash: plan.actionIdHash,
      actionType: input.actionType,
      inputHash,
      rawPolicySourceStored: false,
      bodyStored: false,
    },
    plannedActions: [
      {
        action: 'policy_backend.evaluate.fixture',
        actionMode: 'read',
        risk: input.riskLevel ?? 'low',
        target: 'codexhub-policy-model',
        requiresApproval: false,
      },
    ],
    requiredEvidence: ['policy_backend.evaluation_plan'],
    warnings: blockReasons,
  });

  return { plan, capabilityDryRun };
}
