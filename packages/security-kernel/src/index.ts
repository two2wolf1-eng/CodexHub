import {
  type ActionMode,
  type PolicyDecision,
  type RiskLevel,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';

export interface PolicyActionInput {
  actionId: string;
  actionType: string;
  actionMode: ActionMode;
  riskLevel?: RiskLevel;
  dryRun?: boolean;
  approvalGranted?: boolean;
  metadata?: Record<string, unknown>;
}

export interface PolicyEngine {
  evaluateAction(input: PolicyActionInput): PolicyDecision;
}

export class DefaultPolicyEngine implements PolicyEngine {
  evaluateAction(input: PolicyActionInput): PolicyDecision {
    return evaluateAction(input);
  }
}

export function evaluateAction(input: PolicyActionInput): PolicyDecision {
  const riskLevel = input.riskLevel ?? inferRiskLevel(input.actionType);
  const requiresDryRun = input.actionMode === 'write';
  const requiresApproval = riskLevel === 'high' || riskLevel === 'critical';
  const reasons: string[] = [];

  let outcome: PolicyDecision['outcome'] = 'allow';

  if (requiresDryRun && input.dryRun !== true) {
    outcome = 'deny';
    reasons.push('write action requires dry-run before execution');
  } else if (requiresApproval && input.approvalGranted !== true) {
    outcome = 'approval_required';
    reasons.push(`${riskLevel} risk action requires explicit approval`);
  } else {
    reasons.push('policy rules allow this foundation-only action');
  }

  return {
    id: foundationId('policy'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    actionId: input.actionId,
    actionType: input.actionType,
    actionMode: input.actionMode,
    riskLevel,
    outcome,
    reasons,
    requiresDryRun,
    requiresApproval,
    metadata: input.metadata,
  };
}

export function inferRiskLevel(actionType: string): RiskLevel {
  const normalized = actionType.toLowerCase();

  if (normalized.includes('workspace.invite') || normalized.includes('workspace.remove')) {
    return 'critical';
  }

  if (normalized.includes('electron.main.inspector')) {
    return 'critical';
  }

  if (normalized.includes('browser.click') || normalized.includes('browser.input')) {
    return 'high';
  }

  if (normalized.includes('write') || normalized.includes('patch') || normalized.includes('delete')) {
    return 'medium';
  }

  return 'low';
}

