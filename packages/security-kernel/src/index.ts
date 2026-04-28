import {
  type ActionMode,
  type CodexExecApprovalMode,
  type CodexExecSandboxMode,
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
  if (input.actionType === 'codex.exec.live.intent') {
    return evaluateCodexLiveIntent(input);
  }

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

  if (normalized.includes('codex.exec') && normalized.includes('danger_full_access')) {
    return 'critical';
  }

  if (normalized.includes('codex.exec') && normalized.includes('workspace_write')) {
    return 'high';
  }

  if (normalized.includes('workspace.invite') || normalized.includes('workspace.remove')) {
    return 'critical';
  }

  if (normalized.includes('electron.main.inspector')) {
    return 'critical';
  }

  if (normalized.includes('browser.click') || normalized.includes('browser.input')) {
    return 'high';
  }

  if (
    normalized.includes('write') ||
    normalized.includes('patch') ||
    normalized.includes('delete')
  ) {
    return 'medium';
  }

  return 'low';
}

function evaluateCodexLiveIntent(input: PolicyActionInput): PolicyDecision {
  const metadata = input.metadata ?? {};
  const sandboxMode = readString(metadata.sandboxMode) as CodexExecSandboxMode | undefined;
  const approvalMode = readString(metadata.approvalMode) as CodexExecApprovalMode | undefined;
  const riskLevel = input.riskLevel ?? riskForCodexSandboxMode(sandboxMode);
  const requiresDryRun = true;
  const requiresApproval =
    approvalMode === 'required' || riskLevel === 'high' || riskLevel === 'critical';
  const reasons: string[] = [];
  let outcome: PolicyDecision['outcome'] = 'allow';

  if (metadata.dryRunPlanPresent !== true || input.dryRun !== true) {
    outcome = 'deny';
    reasons.push('codex live intent requires a dry-run plan');
  } else if (metadata.liveAdapterEnabled !== true) {
    outcome = 'deny';
    reasons.push('codex live adapter is disabled by default');
  } else if (metadata.guardedPromptMatch === true) {
    outcome = 'deny';
    reasons.push('prompt contains guarded content and is blocked');
  } else if (requiresApproval && input.approvalGranted !== true) {
    outcome = 'approval_required';
    reasons.push(`${riskLevel} risk codex live intent requires approval`);
  } else {
    reasons.push(
      'codex live intent policy is satisfied, but execution remains external to this kernel',
    );
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

function riskForCodexSandboxMode(sandboxMode: CodexExecSandboxMode | undefined): RiskLevel {
  if (sandboxMode === 'danger_full_access') {
    return 'critical';
  }

  if (sandboxMode === 'workspace_write') {
    return 'high';
  }

  return 'medium';
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
