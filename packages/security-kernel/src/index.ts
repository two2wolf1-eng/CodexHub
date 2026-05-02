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

  if (input.actionType === 'codex.exec.execution.gate') {
    return evaluateCodexExecutionGate(input);
  }

  if (input.actionType === 'codex.exec.manual.approval') {
    return evaluateCodexManualApproval(input);
  }

  const riskLevel = input.riskLevel ?? inferRiskLevel(input.actionType);
  const dryRunModeMisrepresentsRealWrite =
    input.actionMode === 'dry-run' && isDryRunModeRepresentingRealWrite(input);
  const requiresDryRun = input.actionMode === 'write';
  const requiresApproval =
    riskLevel === 'high' ||
    riskLevel === 'critical' ||
    input.actionMode === 'admin' ||
    (input.actionMode === 'write' && !isWriteApprovalExempt(input));
  const reasons: string[] = [];

  let outcome: PolicyDecision['outcome'] = 'allow';

  if (dryRunModeMisrepresentsRealWrite) {
    outcome = 'deny';
    reasons.push('dry-run action mode must not represent a real write');
  } else if (requiresDryRun && input.dryRun !== true) {
    outcome = 'deny';
    reasons.push('write action requires dry-run before execution');
  } else if (requiresApproval && input.approvalGranted !== true) {
    outcome = 'approval_required';
    reasons.push(
      input.actionMode === 'write'
        ? 'real write action requires explicit approval'
        : input.actionMode === 'admin'
          ? 'admin action requires explicit approval'
        : `${riskLevel} risk action requires explicit approval`,
    );
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

function isDryRunModeRepresentingRealWrite(input: PolicyActionInput): boolean {
  const metadata = input.metadata ?? {};

  return (
    metadata.realWrite === true ||
    metadata.noRealWrite === false ||
    metadata.writeAllowed === true ||
    metadata.externalMutation === true
  );
}

function isWriteApprovalExempt(input: PolicyActionInput): boolean {
  const metadata = input.metadata ?? {};
  const normalizedActionType = input.actionType.toLowerCase();

  return (
    metadata.mockOnly === true ||
    metadata.noRealWrite === true ||
    metadata.dryRunOnly === true ||
    normalizedActionType.includes('dry_run') ||
    normalizedActionType.includes('dry-run') ||
    normalizedActionType.includes('mock')
  );
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

function evaluateCodexExecutionGate(input: PolicyActionInput): PolicyDecision {
  const metadata = input.metadata ?? {};
  const sandboxMode = readString(metadata.sandboxMode) as CodexExecSandboxMode | undefined;
  const riskLevel = input.riskLevel ?? riskForCodexSandboxMode(sandboxMode);
  const requiresDryRun = true;
  const requiresApproval =
    riskLevel === 'high' || riskLevel === 'critical' || metadata.requiresApproval === true;
  const reasons: string[] = [];

  if (metadata.liveEnabled !== true) {
    reasons.push('live adapter disabled by configuration');
  }

  if (metadata.dryRunPlanHashMatches === false) {
    reasons.push('approval artifact dry-run hash mismatch');
  }

  if (metadata.policyDecisionHashMatches === false) {
    reasons.push('approval artifact policy hash mismatch');
  }

  if (metadata.approvalExpired === true) {
    reasons.push('approval artifact expired');
  }

  if (metadata.approvalRevoked === true) {
    reasons.push('approval artifact revoked');
  }

  if (metadata.approvalUsed === true) {
    reasons.push('approval artifact already used');
  }

  if (sandboxMode === 'workspace_write' && metadata.isolatedWorktreePresent !== true) {
    reasons.push('workspace_write requires an isolated worktree');
  }

  if (sandboxMode === 'danger_full_access') {
    reasons.push('danger_full_access is blocked by default');
  }

  return {
    id: foundationId('policy'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    actionId: input.actionId,
    actionType: input.actionType,
    actionMode: input.actionMode,
    riskLevel,
    outcome: reasons.length > 0 ? 'deny' : 'allow',
    reasons:
      reasons.length > 0 ? reasons : ['execution gate policy allows control-plane readiness'],
    requiresDryRun,
    requiresApproval,
    metadata: input.metadata,
  };
}

function evaluateCodexManualApproval(input: PolicyActionInput): PolicyDecision {
  const metadata = input.metadata ?? {};
  const riskLevel = input.riskLevel ?? 'medium';
  const reasons: string[] = [];

  if (input.dryRun !== true) {
    reasons.push('manual approval requires an existing dry-run record');
  }

  if (metadata.dryRunPlanHashPresent !== true) {
    reasons.push('manual approval requires a dry-run plan hash');
  }

  if (metadata.policyDecisionHashPresent !== true) {
    reasons.push('manual approval requires a policy decision hash');
  }

  if (metadata.liveExecution !== false || metadata.externalProcessStarted !== false) {
    reasons.push('manual approval must not start live execution');
  }

  if (metadata.transitionAllowed === false) {
    reasons.push('manual approval transition is blocked by the approval state machine');
  }

  if (metadata.approvalExpired === true) {
    reasons.push('manual approval request is expired');
  }

  if (metadata.approvalTerminal === true) {
    reasons.push('terminal manual approval records cannot be decided again');
  }

  return {
    id: foundationId('policy'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    actionId: input.actionId,
    actionType: input.actionType,
    actionMode: input.actionMode,
    riskLevel,
    outcome: reasons.length > 0 ? 'deny' : 'allow',
    reasons: reasons.length > 0 ? reasons : ['manual approval control-plane policy allows record'],
    requiresDryRun: true,
    requiresApproval: true,
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
