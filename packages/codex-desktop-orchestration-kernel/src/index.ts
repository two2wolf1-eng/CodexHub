import {
  AccountSwitchEvidenceSchema,
  ClaudeCodeRepairRunSchema,
  CodexAccountCapacityStateSchema,
  type CodexAccountCapacityStatus,
  CodexAccountRecordSchema,
  type CodexAccountRecord,
  type CodexDesktopBlockedReason,
  CodexDesktopObservedStateSchema,
  type CodexDesktopTaskState,
  CodexTaskRoutingDecisionSchema,
  M75RehearsalRunSchema,
  SchemaVersionSchema,
  TaskDispatchEvidenceSchema,
  WorkspaceMemberActionEvidenceSchema,
  WorkspaceMemberStateSchema,
  type AccountSwitchEvidence,
  type ClaudeCodeRepairRun,
  type CodexAccountCapacityState,
  type CodexDesktopLoginState,
  type CodexDesktopObservedState,
  type CodexTaskRoutingDecision,
  type M75RehearsalRun,
  type TaskDispatchEvidence,
  type WorkspaceMemberActionEvidence,
  type WorkspaceMemberState,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

const forbiddenRequestKeys = new Set([
  'endpoint',
  'rawEndpoint',
  'selector',
  'rawSelector',
  'script',
  'rawScript',
  'javascript',
  'rawJavascript',
  'authority',
  'executionAuthority',
  'authorityRef',
  'approvalArtifact',
  'cookie',
  'cookies',
  'session',
  'sessionToken',
  'token',
  'password',
  'mfa',
  'MFA',
  'credential',
  'browserCredential',
  'storage',
  'localStorage',
  'sessionStorage',
  'profilePath',
  'rawProfile',
  'rawProfileMaterial',
  'rawDom',
  'dom',
  'prompt',
  'rawPrompt',
  'body',
  'rawBody',
  'requestBody',
  'responseBody',
]);

export interface CreateCodexAccountRecordInput {
  accountSeed: string;
  workspaceSeed: string;
  profileSeed?: string;
  displayNameSeed?: string;
  authorizedForCodexDesktop?: boolean;
  switchAllowed?: boolean;
  taskDispatchAllowed?: boolean;
  crossWorkspaceAllowed?: boolean;
  delegatedAdminAllowed?: boolean;
  capacityStateId?: string;
  lastObservedStateId?: string;
  loginState?: CodexDesktopLoginState;
  capacityStatus?: CodexAccountCapacityStatus;
  blockReasons?: readonly CodexDesktopBlockedReason[];
  summary?: string;
  now?: () => string;
}

export interface CreateCodexDesktopObservedStateInput {
  clientSeed: string;
  surfaceRegistrationId?: string;
  manifestId?: string;
  currentAccountSeed?: string;
  currentWorkspaceSeed?: string;
  loginState?: CodexDesktopLoginState;
  capacityStatus?: CodexAccountCapacityStatus;
  taskState?: CodexDesktopTaskState;
  canSwitchAccount?: boolean;
  canSubmitTask?: boolean;
  blockReasons?: readonly CodexDesktopBlockedReason[];
  cdpHttpBoundaryInvoked?: boolean;
  cdpWebSocketBoundaryInvoked?: boolean;
  summary?: string;
  now?: () => string;
}

export interface CreateCodexAccountCapacityStateInput {
  accountSeed: string;
  workspaceSeed: string;
  capacityStatus?: CodexAccountCapacityStatus;
  rateLimitStatusSeed?: string;
  remainingCapacitySeed?: string;
  resetAt?: string;
  sourceSnapshotIds?: readonly string[];
  canAcceptTask?: boolean;
  blockReasons?: readonly CodexDesktopBlockedReason[];
  summary?: string;
  now?: () => string;
}

export interface RouteCodexTaskByCapacityInput {
  inputRefSeed: string;
  inputSeed?: string;
  currentAccountHash?: string;
  targetWorkspaceSeed?: string;
  authorizedAccounts: readonly CodexAccountRecord[];
  policyAllowsSwitch?: boolean;
  requestedMemberMutationForCapacity?: boolean;
  requestedAccountCreationForCapacity?: boolean;
  requestedWorkspaceChurnForCapacity?: boolean;
  summary?: string;
  now?: () => string;
}

export interface CreateAccountSwitchEvidenceInput {
  dryRunId: string;
  targetAccount: CodexAccountRecord;
  targetWorkspaceSeed?: string;
  beforeAccountSeed?: string;
  beforeWorkspaceSeed?: string;
  afterAccountSeed?: string;
  afterWorkspaceSeed?: string;
  capacityStatus?: CodexAccountCapacityStatus;
  status?: AccountSwitchEvidence['status'];
  authorityRefId?: string;
  selectorFingerprintMatched?: boolean;
  identityVerified?: boolean;
  visibleUiExecution?: boolean;
  blockReasons?: readonly CodexDesktopBlockedReason[];
  summary?: string;
  now?: () => string;
}

export interface CreateTaskDispatchEvidenceInput {
  dryRunId: string;
  routingDecision: CodexTaskRoutingDecision;
  inputRefSeed: string;
  inputSeed: string;
  promptSummarySeed?: string;
  promptCharCount?: number;
  taskState?: CodexDesktopTaskState;
  status?: TaskDispatchEvidence['status'];
  accountSwitchEvidenceId?: string;
  canSubmitTaskVerified?: boolean;
  blockReasons?: readonly CodexDesktopBlockedReason[];
  summary?: string;
  now?: () => string;
}

export interface CreateWorkspaceMemberStateInput {
  workspaceSeed: string;
  memberSeed: string;
  roleSeed?: string;
  seatStateSeed?: string;
  lifecycleStatus?: WorkspaceMemberState['lifecycleStatus'];
  delegatedAdminAuthorityRequired?: boolean;
  summary?: string;
  now?: () => string;
}

export interface CreateWorkspaceMemberActionEvidenceInput {
  actionKind: WorkspaceMemberActionEvidence['actionKind'];
  workspaceSeed: string;
  memberSeed?: string;
  reasonSeed?: string;
  ticketSeed?: string;
  beforeStateId?: string;
  afterStateId?: string;
  delegatedAdminAuthorityVerified?: boolean;
  cooldownPassed?: boolean;
  antiEvasionPassed?: boolean;
  status?: WorkspaceMemberActionEvidence['status'];
  blockReasons?: readonly CodexDesktopBlockedReason[];
  summary?: string;
  now?: () => string;
}

export interface CreateClaudeCodeRepairRunInput {
  failureEvidenceSeed: string;
  controlledWorktreeSeed: string;
  proposalSeed: string;
  changedFileCount?: number;
  diffSeed?: string;
  testResultSeed?: string;
  status?: ClaudeCodeRepairRun['status'];
  blockReasons?: readonly CodexDesktopBlockedReason[];
  summary?: string;
  now?: () => string;
}

export interface CreateM75RehearsalRunInput {
  scenario: M75RehearsalRun['scenario'];
  status?: M75RehearsalRun['status'];
  stateReadStatus?: string;
  routingStatus?: string;
  switchStatus?: string;
  dispatchStatus?: string;
  memberStateStatus?: string;
  repairStatus?: string;
  blockerCount?: number;
  fixtureOnly?: boolean;
  conditionalLiveSmoke?: boolean;
  liveSmokeBlockedReasonCount?: number;
  summary?: string;
  now?: () => string;
}

export function createCodexAccountRecord(input: CreateCodexAccountRecordInput): CodexAccountRecord {
  return CodexAccountRecordSchema.parse({
    id: foundationId('codex_account_record'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    evidenceRefIds: [],
    auditEventIds: [],
    accountHash: hashSeed(input.accountSeed),
    workspaceHash: hashSeed(input.workspaceSeed),
    profileHash: hashOptional(input.profileSeed),
    displayNameHash: hashOptional(input.displayNameSeed),
    authorizedForCodexDesktop: input.authorizedForCodexDesktop ?? false,
    switchAllowed: input.switchAllowed ?? false,
    taskDispatchAllowed: input.taskDispatchAllowed ?? false,
    crossWorkspaceAllowed: input.crossWorkspaceAllowed ?? false,
    delegatedAdminAllowed: input.delegatedAdminAllowed ?? false,
    capacityStateId: input.capacityStateId,
    lastObservedStateId: input.lastObservedStateId,
    loginState: input.loginState ?? 'unknown',
    capacityStatus: input.capacityStatus ?? 'capacity_unknown',
    blockReasons: [...(input.blockReasons ?? [])],
    summary:
      input.summary ??
      'Authorized Codex Desktop account record stores policy, hashes, and capacity only.',
  });
}

export function createCodexDesktopObservedState(
  input: CreateCodexDesktopObservedStateInput,
): CodexDesktopObservedState {
  return CodexDesktopObservedStateSchema.parse({
    id: foundationId('codex_desktop_state'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: (input.now ?? foundationTimestamp)(),
    evidenceRefIds: [],
    auditEventIds: [],
    clientHash: hashSeed(input.clientSeed),
    surfaceRegistrationId: input.surfaceRegistrationId,
    manifestId: input.manifestId,
    currentAccountHash: hashOptional(input.currentAccountSeed),
    currentWorkspaceHash: hashOptional(input.currentWorkspaceSeed),
    loginState: input.loginState ?? 'unknown',
    capacityStatus: input.capacityStatus ?? 'capacity_unknown',
    taskState: input.taskState ?? 'unknown',
    canSwitchAccount: input.canSwitchAccount ?? false,
    canSubmitTask: input.canSubmitTask ?? false,
    blockReasons: [...(input.blockReasons ?? [])],
    cdpHttpBoundaryInvoked: input.cdpHttpBoundaryInvoked ?? false,
    cdpWebSocketBoundaryInvoked: input.cdpWebSocketBoundaryInvoked ?? false,
    summary:
      input.summary ??
      'Codex Desktop observed state is bounded visible client metadata only.',
  });
}

export function createCodexAccountCapacityState(
  input: CreateCodexAccountCapacityStateInput,
): CodexAccountCapacityState {
  return CodexAccountCapacityStateSchema.parse({
    id: foundationId('codex_account_capacity'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: (input.now ?? foundationTimestamp)(),
    evidenceRefIds: [],
    auditEventIds: [],
    accountHash: hashSeed(input.accountSeed),
    workspaceHash: hashSeed(input.workspaceSeed),
    capacityStatus: input.capacityStatus ?? 'capacity_unknown',
    rateLimitStatusHash: hashOptional(input.rateLimitStatusSeed),
    remainingCapacityHash: hashOptional(input.remainingCapacitySeed),
    resetAt: input.resetAt,
    sourceSnapshotIds: [...(input.sourceSnapshotIds ?? [])],
    canAcceptTask: input.canAcceptTask ?? false,
    blockReasons: [...(input.blockReasons ?? [])],
    summary:
      input.summary ??
      'Codex account capacity state summarizes legitimate available capacity only.',
  });
}

export function routeCodexTaskByCapacity(
  input: RouteCodexTaskByCapacityInput,
): CodexTaskRoutingDecision {
  const now = input.now ?? foundationTimestamp;
  const antiEvasionBlocked =
    input.requestedMemberMutationForCapacity === true ||
    input.requestedAccountCreationForCapacity === true ||
    input.requestedWorkspaceChurnForCapacity === true;
  const current = input.currentAccountHash
    ? input.authorizedAccounts.find((account) => account.accountHash === input.currentAccountHash)
    : undefined;
  const currentReady = isDispatchableAccount(current);
  const switchTarget = input.authorizedAccounts.find(
    (account) => account.accountHash !== input.currentAccountHash && isSwitchableAccount(account),
  );

  let routingStrategy: CodexTaskRoutingDecision['routingStrategy'] = 'blocked';
  let status: CodexTaskRoutingDecision['status'] = 'blocked';
  let selectedAccountHash: string | undefined;
  let accountSwitchRequired = false;
  let approvalRequired = false;
  let authorityRequired = false;
  const blockReasons: CodexDesktopBlockedReason[] = [];

  if (antiEvasionBlocked) {
    blockReasons.push('quota_evasion_blocked');
  } else if (currentReady) {
    routingStrategy = 'use_current_account';
    status = 'ready';
    selectedAccountHash = current.accountHash;
  } else if (switchTarget && input.policyAllowsSwitch === true) {
    routingStrategy = 'switch_authorized_account';
    status = 'ready';
    selectedAccountHash = switchTarget.accountHash;
    accountSwitchRequired = true;
    approvalRequired = true;
    authorityRequired = true;
  } else if (input.authorizedAccounts.length > 0) {
    routingStrategy = 'wait_for_capacity';
    status = 'waiting';
    blockReasons.push(resolveCapacityBlockReason(current ?? input.authorizedAccounts[0]));
  } else {
    blockReasons.push('unknown_account');
  }

  if (current?.loginState === 'login_required') blockReasons.push('login_required');
  if (current?.loginState === 'mfa_required') blockReasons.push('mfa_required');
  if (current?.loginState === 'permission_denied') blockReasons.push('permission_denied');

  return CodexTaskRoutingDecisionSchema.parse({
    id: foundationId('codex_task_routing_decision'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    evidenceRefIds: [],
    auditEventIds: [],
    inputRefHash: hashSeed(input.inputRefSeed),
    inputHash: hashOptional(input.inputSeed),
    currentAccountHash: input.currentAccountHash,
    selectedAccountHash,
    targetWorkspaceHash: hashOptional(input.targetWorkspaceSeed),
    routingStrategy,
    status,
    accountSwitchRequired,
    approvalRequired,
    authorityRequired,
    blockReasons,
    summary:
      input.summary ??
      'Quota-aware routing selects only authorized accounts with legitimate available capacity.',
  });
}

export function createAccountSwitchEvidence(
  input: CreateAccountSwitchEvidenceInput,
): AccountSwitchEvidence {
  const blockReasons = [...(input.blockReasons ?? [])];
  if (!input.targetAccount.authorizedForCodexDesktop) blockReasons.push('unauthorized_account');
  if (!input.targetAccount.switchAllowed) blockReasons.push('approval_required');
  if (input.targetAccount.loginState === 'login_required') blockReasons.push('login_required');
  if (input.targetAccount.loginState === 'mfa_required') blockReasons.push('mfa_required');
  if (input.targetAccount.capacityStatus === 'quota_exhausted') {
    blockReasons.push('capacity_exhausted');
  }
  const status = input.status ?? (blockReasons.length > 0 ? 'blocked' : 'planned');

  return AccountSwitchEvidenceSchema.parse({
    id: foundationId('account_switch_evidence'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    evidenceRefIds: [],
    auditEventIds: [],
    dryRunId: input.dryRunId,
    targetAccountHash: input.targetAccount.accountHash,
    targetWorkspaceHash: hashOptional(input.targetWorkspaceSeed) ?? input.targetAccount.workspaceHash,
    beforeAccountHash: hashOptional(input.beforeAccountSeed),
    beforeWorkspaceHash: hashOptional(input.beforeWorkspaceSeed),
    afterAccountHash: hashOptional(input.afterAccountSeed),
    afterWorkspaceHash: hashOptional(input.afterWorkspaceSeed),
    capacityStatus: input.capacityStatus ?? input.targetAccount.capacityStatus,
    status,
    authorityRefId: input.authorityRefId,
    selectorFingerprintMatched: input.selectorFingerprintMatched ?? false,
    identityVerified: input.identityVerified ?? false,
    visibleUiExecution: input.visibleUiExecution ?? false,
    blockReasons,
    summary:
      input.summary ??
      'Codex Desktop account switching evidence is hash-bound to registered targets.',
  });
}

export function createTaskDispatchEvidence(
  input: CreateTaskDispatchEvidenceInput,
): TaskDispatchEvidence {
  const blockReasons = [...(input.blockReasons ?? input.routingDecision.blockReasons)];
  const status =
    input.status ??
    (input.routingDecision.status === 'ready' && input.canSubmitTaskVerified ? 'planned' : 'blocked');

  return TaskDispatchEvidenceSchema.parse({
    id: foundationId('task_dispatch_evidence'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    evidenceRefIds: [],
    auditEventIds: [],
    dryRunId: input.dryRunId,
    routingDecisionId: input.routingDecision.id,
    inputRefHash: hashSeed(input.inputRefSeed),
    inputHash: hashSeed(input.inputSeed),
    promptSummaryHash: hashOptional(input.promptSummarySeed),
    promptCharCount: input.promptCharCount ?? 0,
    selectedAccountHash: input.routingDecision.selectedAccountHash,
    workspaceHash: input.routingDecision.targetWorkspaceHash,
    taskState: input.taskState ?? 'submitted',
    status,
    accountSwitchEvidenceId: input.accountSwitchEvidenceId,
    canSubmitTaskVerified: input.canSubmitTaskVerified ?? false,
    blockReasons,
    summary:
      input.summary ??
      'Codex Desktop task dispatch evidence stores input references and hashes only.',
  });
}

export function createWorkspaceMemberState(
  input: CreateWorkspaceMemberStateInput,
): WorkspaceMemberState {
  return WorkspaceMemberStateSchema.parse({
    id: foundationId('workspace_member_state'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: (input.now ?? foundationTimestamp)(),
    evidenceRefIds: [],
    auditEventIds: [],
    workspaceHash: hashSeed(input.workspaceSeed),
    memberHash: hashSeed(input.memberSeed),
    roleHash: hashOptional(input.roleSeed),
    seatStateHash: hashOptional(input.seatStateSeed),
    lifecycleStatus: input.lifecycleStatus ?? 'unknown',
    delegatedAdminAuthorityRequired: input.delegatedAdminAuthorityRequired ?? false,
    summary:
      input.summary ??
      'Workspace member state is bounded to authorized business metadata summaries.',
  });
}

export function createWorkspaceMemberActionEvidence(
  input: CreateWorkspaceMemberActionEvidenceInput,
): WorkspaceMemberActionEvidence {
  const isMutation = input.actionKind !== 'state_read';
  const delegatedAdminAuthorityRequired = isMutation;
  const approvalRequired = isMutation;
  const delegatedAdminAuthorityVerified = input.delegatedAdminAuthorityVerified ?? false;
  const antiEvasionPassed = input.antiEvasionPassed ?? true;
  const blockReasons = [...(input.blockReasons ?? [])];
  if (isMutation && !delegatedAdminAuthorityVerified) {
    blockReasons.push('delegated_admin_authority_required');
  }
  if (isMutation && !antiEvasionPassed) blockReasons.push('quota_evasion_blocked');
  const status = input.status ?? (blockReasons.length > 0 ? 'blocked' : 'planned');

  return WorkspaceMemberActionEvidenceSchema.parse({
    id: foundationId('workspace_member_action'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    evidenceRefIds: [],
    auditEventIds: [],
    actionKind: input.actionKind,
    workspaceHash: hashSeed(input.workspaceSeed),
    memberHash: hashOptional(input.memberSeed),
    reasonHash: hashOptional(input.reasonSeed),
    ticketHash: hashOptional(input.ticketSeed),
    beforeStateId: input.beforeStateId,
    afterStateId: input.afterStateId,
    status,
    delegatedAdminAuthorityRequired,
    delegatedAdminAuthorityVerified,
    approvalRequired,
    cooldownPassed: input.cooldownPassed ?? !isMutation,
    antiEvasionPassed,
    blockReasons,
    summary:
      input.summary ??
      'Workspace member actions require delegated admin authority and are never routing tools.',
  });
}

export function createClaudeCodeRepairRun(
  input: CreateClaudeCodeRepairRunInput,
): ClaudeCodeRepairRun {
  return ClaudeCodeRepairRunSchema.parse({
    id: foundationId('claude_code_repair'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    evidenceRefIds: [],
    auditEventIds: [],
    failureEvidenceHash: hashSeed(input.failureEvidenceSeed),
    controlledWorktreeHash: hashSeed(input.controlledWorktreeSeed),
    proposalHash: hashSeed(input.proposalSeed),
    changedFileCount: input.changedFileCount ?? 0,
    diffHash: hashOptional(input.diffSeed),
    testResultHash: hashOptional(input.testResultSeed),
    status: input.status ?? 'planned',
    blockReasons: [...(input.blockReasons ?? [])],
    summary:
      input.summary ??
      'Claude Code repair runs operate on controlled worktrees and never production clients.',
  });
}

export function createM75RehearsalRun(input: CreateM75RehearsalRunInput): M75RehearsalRun {
  return M75RehearsalRunSchema.parse({
    id: foundationId('m75_rehearsal'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    evidenceRefIds: [],
    auditEventIds: [],
    scenario: input.scenario,
    status: input.status ?? (input.blockerCount && input.blockerCount > 0 ? 'blocked' : 'passed'),
    stateReadStatus: input.stateReadStatus ?? 'observed',
    routingStatus: input.routingStatus ?? 'ready',
    switchStatus: input.switchStatus,
    dispatchStatus: input.dispatchStatus,
    memberStateStatus: input.memberStateStatus,
    repairStatus: input.repairStatus,
    blockerCount: input.blockerCount ?? 0,
    fixtureOnly: input.fixtureOnly ?? true,
    conditionalLiveSmoke: input.conditionalLiveSmoke ?? false,
    liveSmokeBlockedReasonCount: input.liveSmokeBlockedReasonCount ?? 0,
    summary:
      input.summary ??
      'M75 rehearsal validates Desktop state, routing, dispatch, member guardrails, and repair proposal flow.',
  });
}

export function containsForbiddenM75RequestBody(value: unknown): boolean {
  const queue: unknown[] = [value];
  const seen = new Set<unknown>();
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || seen.has(current)) continue;
    seen.add(current);
    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }
    for (const [key, nested] of Object.entries(current)) {
      if (forbiddenRequestKeys.has(key)) return true;
      queue.push(nested);
    }
  }
  return false;
}

function isDispatchableAccount(account: CodexAccountRecord | undefined): account is CodexAccountRecord {
  return (
    account !== undefined &&
    account.authorizedForCodexDesktop &&
    account.taskDispatchAllowed &&
    account.loginState === 'logged_in' &&
    account.capacityStatus === 'ready'
  );
}

function isSwitchableAccount(account: CodexAccountRecord): boolean {
  return (
    account.authorizedForCodexDesktop &&
    account.switchAllowed &&
    account.loginState === 'logged_in' &&
    account.capacityStatus === 'ready'
  );
}

function resolveCapacityBlockReason(account: CodexAccountRecord): CodexDesktopBlockedReason {
  if (!account.authorizedForCodexDesktop) return 'unauthorized_account';
  if (account.loginState === 'login_required') return 'login_required';
  if (account.loginState === 'mfa_required') return 'mfa_required';
  if (account.loginState === 'permission_denied') return 'permission_denied';
  if (account.capacityStatus === 'quota_exhausted') return 'capacity_exhausted';
  return 'unknown_state';
}

function hashOptional(value: string | undefined): string | undefined {
  return value === undefined ? undefined : hashSeed(value);
}

function hashSeed(value: string): string {
  return `sha256:${hashText(value)}`;
}
